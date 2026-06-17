import { Context, Effect, Layer } from "effect";

import type { StudioInputs } from "../context.js";
import {
  isStudioRuntimeFailure,
  materializationFailed,
  type StudioBoundedDiagnostics,
  type StudioBoundedDiagnosticValue,
} from "../errors/index.js";
import type { RunInGameFailurePhase } from "../operationRuntime/registry.js";
import type {
  RunInGameDeployment,
  RunInGameMaterialized,
  RunInGamePreparedRequest,
  RunInGameRestartResult,
  StudioWorkflowPorts,
} from "../ports/index.js";
import { Civ7WorkflowControl, type Civ7WorkflowControlApi } from "../ports/index.js";
import type { RunInGameWorkflowTransitions } from "./workflowTransitions.js";

export type RunInGameWorkflowStart = Readonly<{
  requestId: string;
  input: StudioInputs["runInGame"]["start"];
  prepared: RunInGamePreparedRequest;
  transitions: RunInGameWorkflowTransitions;
}>;

export interface RunInGameWorkflowApi {
  readonly start: (args: RunInGameWorkflowStart) => Effect.Effect<void, never>;
}

export class RunInGameWorkflow extends Context.Tag("@civ7/studio-server/RunInGameWorkflow")<
  RunInGameWorkflow,
  RunInGameWorkflowApi
>() {}

export function makeRunInGameWorkflowLayer(
  args: Readonly<{
    ports: StudioWorkflowPorts;
  }>
): Layer.Layer<RunInGameWorkflow, never, Civ7WorkflowControl> {
  return Layer.effect(
    RunInGameWorkflow,
    Effect.map(Civ7WorkflowControl, (civ7) => makeRunInGameWorkflow({ ...args, civ7 }))
  );
}

function makeRunInGameWorkflow(
  args: Readonly<{
    ports: StudioWorkflowPorts;
    civ7: Civ7WorkflowControlApi;
  }>
): RunInGameWorkflowApi {
  const tryPromise = <A>(try_: () => Promise<A>) =>
    Effect.tryPromise({
      try: try_,
      catch: (err) => err,
    });

  const restartCiv = (
    workflow: RunInGameWorkflowStart,
    deployment: RunInGameDeployment
  ): Effect.Effect<RunInGameRestartResult, unknown> => {
    return Effect.gen(function* () {
      yield* workflow.transitions.transition({ phase: "restarting-civ" });
      return yield* tryPromise(
        () =>
          args.ports.restartCivForRunInGame?.({
            requestId: workflow.requestId,
            prepared: workflow.prepared,
            deployment,
          }) ?? Promise.resolve({})
      );
    });
  };
  const maybeRequestedRestart = (
    workflow: RunInGameWorkflowStart,
    deployment: RunInGameDeployment
  ): Effect.Effect<RunInGameRestartResult, unknown> => {
    if (!workflow.prepared.request.restartCivProcess || !args.ports.restartCivForRunInGame) {
      return Effect.succeed({});
    }
    return restartCiv(workflow, deployment);
  };

  return {
    start: (workflow) =>
      Effect.gen(function* () {
        let phase: RunInGameFailurePhase = "materializing";
        let materialized: RunInGameMaterialized = {};
        let cleanupAttempted = false;
        const cleanupMaterialized = (failure?: unknown) => {
          if (cleanupAttempted || materialized.cleanup === undefined) return Effect.void;
          return Effect.sync(() => {
            cleanupAttempted = true;
          }).pipe(
            Effect.flatMap(() => tryPromise(() => materialized.cleanup?.() ?? Promise.resolve())),
            Effect.mapError((err) =>
              runInGameCleanupFailure({
                err,
                phase,
                original: failure,
              })
            )
          );
        };
        const work = Effect.gen(function* () {
          yield* workflow.transitions.transition({ phase });
          materialized = yield* tryPromise(() =>
            args.ports.materializeRunInGame({
              requestId: workflow.requestId,
              input: workflow.input,
              prepared: workflow.prepared,
            })
          );
          if (materialized.materialization) {
            yield* workflow.transitions.transition({
              phase,
              materialization: materialized.materialization,
            });
          }

          phase = "deploying";
          yield* workflow.transitions.transition({
            phase,
            materialization: materialized.materialization,
          });
          const deployment = yield* tryPromise(() =>
            args.ports.deployRunInGame({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              materialized,
            })
          );
          yield* workflow.transitions.transition({
            phase,
            materialization: deployment.materialization ?? materialized.materialization,
          });

          if (workflow.prepared.request.restartCivProcess && args.ports.restartCivForRunInGame) {
            phase = "restarting-civ";
          }
          let restart = yield* maybeRequestedRestart(workflow, deployment);
          phase = "checking-civ7";
          yield* workflow.transitions.transition({
            phase,
            materialization: deployment.materialization ?? materialized.materialization,
            ...(restart.processRestart === undefined
              ? {}
              : { processRestart: restart.processRestart }),
          });
          yield* args.civ7.checkPlayable({
            requestId: workflow.requestId,
            prepared: workflow.prepared,
            deployment,
          });

          phase = "preparing-setup";
          yield* workflow.transitions.transition({ phase });
          const setup = yield* args.civ7
            .prepareSetup({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              deployment,
            })
            .pipe(
              Effect.catchAll((err) => {
                if (!shouldRestartAfterSetupRowMiss({ workflow, err, restart })) {
                  return Effect.fail(err);
                }
                return Effect.gen(function* () {
                  phase = "reload-needed";
                  yield* workflow.transitions.transition({ phase });
                  phase = "restarting-civ";
                  restart = yield* restartCiv(workflow, deployment);
                  phase = "checking-civ7";
                  yield* workflow.transitions.transition({
                    phase,
                    materialization: deployment.materialization ?? materialized.materialization,
                    ...(restart.processRestart === undefined
                      ? {}
                      : { processRestart: restart.processRestart }),
                  });
                  yield* args.civ7.checkPlayable({
                    requestId: workflow.requestId,
                    prepared: workflow.prepared,
                    deployment,
                  });
                  phase = "preparing-setup";
                  yield* workflow.transitions.transition({ phase });
                  return yield* args.civ7.prepareSetup({
                    requestId: workflow.requestId,
                    prepared: workflow.prepared,
                    deployment,
                  });
                });
              })
            );
          if (setup.reloadRequired) {
            phase = "reload-needed";
            yield* workflow.transitions.transition({ phase });
          }

          phase = "starting-game";
          yield* workflow.transitions.transition({ phase });
          const started = yield* args.civ7.startGame({
            requestId: workflow.requestId,
            prepared: workflow.prepared,
            deployment,
            setup,
          });

          phase = "waiting-for-proof";
          yield* workflow.transitions.transition({ phase });
          const log = yield* tryPromise(() =>
            args.ports.waitForRunInGameLogProof({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              deployment,
              setup,
              started,
            })
          );
          const proof = yield* tryPromise(() =>
            args.ports.buildRunInGameProof({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              deployment,
              setup,
              started,
              log,
            })
          );
          yield* cleanupMaterialized();
          yield* workflow.transitions.transition({
            phase: "complete",
            result: proof.result ?? { ok: true },
            materialization:
              proof.materialization ?? deployment.materialization ?? materialized.materialization,
            ...(proof.exactAuthorshipProof === undefined
              ? {}
              : { exactAuthorshipProof: proof.exactAuthorshipProof }),
          });
        });

        yield* work.pipe(
          Effect.catchAll((err) =>
            cleanupMaterialized(err).pipe(
              Effect.flatMap(() => workflow.transitions.fail({ phase, err })),
              Effect.catchAll((cleanupErr) => workflow.transitions.fail({ phase, err: cleanupErr }))
            )
          ),
          Effect.ensuring(cleanupMaterialized().pipe(Effect.catchAll(() => Effect.void)))
        );
      }).pipe(Effect.catchAll(() => Effect.void)),
  };
}

function shouldRestartAfterSetupRowMiss(
  args: Readonly<{
    workflow: RunInGameWorkflowStart;
    err: unknown;
    restart: RunInGameRestartResult;
  }>
): boolean {
  if (args.restart.processRestart !== undefined) return false;
  if (args.workflow.prepared.request.restartCivProcess) return false;
  if (args.workflow.prepared.request.materializationMode !== "disposable") return false;
  if (!isStudioRuntimeFailure(args.err)) return false;
  return (
    args.err.reason === "setup-row-unavailable" &&
    args.err.diagnostics?.reloadBoundary === "process-restart-required"
  );
}

function runInGameCleanupFailure(
  args: Readonly<{
    err: unknown;
    phase: RunInGameFailurePhase;
    original?: unknown;
  }>
) {
  return materializationFailed({
    message: "Run in Game materialization cleanup failed",
    diagnostics: boundedDiagnostics({
      code: "run-in-game-cleanup-failed",
      failedAtPhase: args.phase,
      cause: diagnosticString(args.err),
      originalFailure: args.original === undefined ? undefined : diagnosticString(args.original),
    }),
  });
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
