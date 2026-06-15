import { Context, Effect, Layer } from "effect";

import type { StudioInputs } from "../context.js";
import {
  deployFailed,
  isStudioRuntimeFailure,
  type StudioBoundedDiagnostics,
  type StudioBoundedDiagnosticValue,
} from "../errors/index.js";
import type {
  SaveDeployPreparedRequest,
  SaveDeployRollback,
  StudioWorkflowPorts,
} from "../ports/index.js";
import type { SaveDeployWorkflowTransitions } from "./workflowTransitions.js";

export type SaveDeployWorkflowStart = Readonly<{
  requestId: string;
  input: StudioInputs["mapConfigs"]["saveDeploy"];
  transitions: SaveDeployWorkflowTransitions;
}>;

export interface SaveDeployWorkflowApi {
  readonly start: (args: SaveDeployWorkflowStart) => Effect.Effect<void, never>;
}

export class SaveDeployWorkflow extends Context.Tag("@civ7/studio-server/SaveDeployWorkflow")<
  SaveDeployWorkflow,
  SaveDeployWorkflowApi
>() {}

export function makeSaveDeployWorkflowLayer(
  args: Readonly<{
    ports: StudioWorkflowPorts;
  }>
): Layer.Layer<SaveDeployWorkflow> {
  return Layer.succeed(SaveDeployWorkflow, makeSaveDeployWorkflow(args));
}

function makeSaveDeployWorkflow(
  args: Readonly<{
    ports: StudioWorkflowPorts;
  }>
): SaveDeployWorkflowApi {
  const tryPromise = <A>(try_: () => Promise<A>) =>
    Effect.tryPromise({
      try: try_,
      catch: (err) => err,
    });

  return {
    start: (workflow) =>
      Effect.gen(function* () {
        let phase: "saving" | "deploying" = "saving";
        let prepared: SaveDeployPreparedRequest = {};
        let saved: Awaited<ReturnType<StudioWorkflowPorts["saveMapConfig"]>> | undefined;
        let cleanupAttempted = false;
        const cleanupPrepared = (failure?: unknown) => {
          if (cleanupAttempted || prepared.cleanup === undefined) return Effect.void;
          return Effect.sync(() => {
            cleanupAttempted = true;
          }).pipe(
            Effect.flatMap(() => tryPromise(() => prepared.cleanup?.() ?? Promise.resolve())),
            Effect.mapError((err) =>
              saveDeployCleanupFailure({
                err,
                phase,
                original: failure,
                path: prepared.path,
                diagnostics: args.ports.failureDiagnostics?.(err),
              })
            )
          );
        };
        const rollback = (cause: unknown) => {
          if (prepared.path === undefined) return Effect.succeed<SaveDeployRollback>({});
          return tryPromise(() =>
            args.ports.rollbackSaveDeploy({
              requestId: workflow.requestId,
              input: workflow.input,
              prepared,
              saved,
              failedAtPhase: phase,
              cause,
            })
          );
        };
        const work = Effect.gen(function* () {
          prepared = sanitizeSaveDeployPrepared(
            yield* tryPromise(() =>
              args.ports.prepareSaveDeployStart({
                requestId: workflow.requestId,
                input: workflow.input,
              })
            )
          );
          yield* workflow.transitions.transition({
            phase,
            ...(prepared.path === undefined ? {} : { path: prepared.path }),
          });
          const savedResult = yield* tryPromise(() =>
            args.ports.saveMapConfig({
              requestId: workflow.requestId,
              input: workflow.input,
              prepared,
            })
          );
          saved = savedResult;
          phase = "deploying";
          yield* workflow.transitions.transition({
            phase,
            path: savedResult.path ?? prepared.path,
            saved: savedResult.saved ?? true,
          });
          const deployed = yield* tryPromise(() =>
            args.ports.deploySavedMapConfig({
              requestId: workflow.requestId,
              input: workflow.input,
              prepared,
              saved: savedResult,
            })
          );
          yield* cleanupPrepared();
          yield* workflow.transitions.transition({
            phase: "complete",
            path: deployed.path ?? savedResult.path ?? prepared.path,
            saved: deployed.saved ?? savedResult.saved ?? true,
            deployed: deployed.deployed ?? true,
            deploy: deployed.deploy,
          });
        });

        yield* work.pipe(
          Effect.catchAll((err) => finalizeFailure(err)),
          Effect.ensuring(cleanupPrepared().pipe(Effect.catchAll(() => Effect.void)))
        );

        function finalizeFailure(err: unknown) {
          return Effect.gen(function* () {
            let rollbackResult: SaveDeployRollback = {};
            let rollbackErr: unknown;
            if (!isSaveDeployCleanupFailure(err)) {
              const rollbackEither = yield* Effect.either(rollback(err));
              if (rollbackEither._tag === "Left") {
                rollbackErr = rollbackEither.left;
              } else {
                rollbackResult = rollbackEither.right;
              }
            }
            const cleanupEither = yield* Effect.either(cleanupPrepared(err));
            if (cleanupEither._tag === "Left") {
              yield* workflow.transitions.fail({ phase, err: cleanupEither.left });
              return;
            }
            if (rollbackErr !== undefined) {
              yield* workflow.transitions.fail({
                phase,
                err: saveDeployRollbackFailure({
                  err,
                  rollbackErr,
                  phase,
                  path: prepared.path,
                  diagnostics: args.ports.failureDiagnostics?.(err),
                }),
              });
              return;
            }
            yield* workflow.transitions.fail({
              phase,
              err: saveDeployWorkflowFailure({
                err,
                phase,
                path: prepared.path,
                rollback: rollbackResult,
                diagnostics: args.ports.failureDiagnostics?.(err),
              }),
            });
          });
        }
      }).pipe(Effect.catchAll(() => Effect.void)),
  };
}

function sanitizeSaveDeployPrepared(
  prepared: SaveDeployPreparedRequest
): SaveDeployPreparedRequest {
  return {
    ...(prepared.path === undefined ? {} : { path: prepared.path }),
    ...(prepared.cleanup === undefined ? {} : { cleanup: prepared.cleanup }),
  };
}

function saveDeployWorkflowFailure(
  args: Readonly<{
    err: unknown;
    phase: "saving" | "deploying";
    path?: string;
    rollback: SaveDeployRollback;
    diagnostics?: StudioBoundedDiagnostics;
  }>
) {
  if (isStudioRuntimeFailure(args.err)) return args.err;
  const reason = args.phase === "saving" ? "save-failed" : "deploy-failed";
  return deployFailed({
    message:
      args.err instanceof Error && args.err.message ? args.err.message : "Save/Deploy failed",
    reason,
    diagnostics: boundedDiagnostics({
      ...args.diagnostics,
      code: `save-deploy-${reason}`,
      failedAtPhase: args.phase,
      path: args.path,
      cause: diagnosticString(args.err),
      rollbackPath: args.rollback.path,
      rollbackRestored: args.rollback.restored,
      rollbackDeleted: args.rollback.deleted,
    }),
    recoveryActions: [
      "copy-diagnostics",
      "retry-status",
      "retry-save-deploy",
      ...(args.phase === "deploying" ? ["inspect-deploy-output" as const] : []),
    ],
  });
}

function saveDeployRollbackFailure(
  args: Readonly<{
    err: unknown;
    rollbackErr: unknown;
    phase: "saving" | "deploying";
    path?: string;
    diagnostics?: StudioBoundedDiagnostics;
  }>
) {
  return deployFailed({
    message: "Save/Deploy rollback failed after workflow failure",
    reason: "rollback-failed",
    diagnostics: boundedDiagnostics({
      ...args.diagnostics,
      code: "save-deploy-rollback-failed",
      failedAtPhase: args.phase,
      path: args.path,
      cause: diagnosticString(args.err),
      rollbackFailure: diagnosticString(args.rollbackErr),
    }),
    recoveryActions: [
      "copy-diagnostics",
      "retry-status",
      "retry-save-deploy",
      "inspect-deploy-output",
    ],
  });
}

function saveDeployCleanupFailure(
  args: Readonly<{
    err: unknown;
    phase: "saving" | "deploying";
    original?: unknown;
    path?: string;
    diagnostics?: StudioBoundedDiagnostics;
  }>
) {
  return deployFailed({
    message: "Save/Deploy cleanup failed",
    reason: args.phase === "saving" ? "save-failed" : "deploy-failed",
    diagnostics: boundedDiagnostics({
      ...args.diagnostics,
      code: "save-deploy-cleanup-failed",
      failedAtPhase: args.phase,
      path: args.path,
      cause: diagnosticString(args.err),
      originalFailure: args.original === undefined ? undefined : diagnosticString(args.original),
    }),
    recoveryActions: ["copy-diagnostics", "retry-status", "retry-save-deploy"],
  });
}

function isSaveDeployCleanupFailure(value: unknown): boolean {
  return (
    isStudioRuntimeFailure(value) &&
    value.tag === "DeployFailed" &&
    value.diagnostics?.code === "save-deploy-cleanup-failed"
  );
}

function boundedDiagnostics(value: Record<string, unknown>): StudioBoundedDiagnostics {
  const out: Record<string, StudioBoundedDiagnosticValue> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) out[key] = boundedDiagnosticValue(entry);
  }
  return out;
}

function boundedDiagnosticValue(value: unknown): StudioBoundedDiagnosticValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => diagnosticString(entry) ?? "");
  }
  return diagnosticString(value) ?? "";
}

function diagnosticString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value instanceof Error && value.message) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
