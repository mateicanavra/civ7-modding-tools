import { snapshotRunInGameExactAuthorshipEvidence } from "@civ7/studio-contract";
import { writeStudioRunGenerationManifest } from "@civ7/studio-run-workspace";
import { Context, Effect, Layer } from "effect";

import {
  materializationFailed,
  type StudioBoundedDiagnostics,
  type StudioBoundedDiagnosticValue,
  verificationFailed,
} from "../errors/index.js";
import type { RunInGameFailurePhase } from "../operationRuntime/registry.js";
import type {
  RunInGameDeployment,
  RunInGameGeneratedMod,
  RunInGamePreparedRequest,
  StudioWorkflowPorts,
} from "../ports/index.js";
import { Civ7WorkflowControl, type Civ7WorkflowControlApi } from "../ports/index.js";
import type { RunInGameWorkflowTransitions } from "./workflowTransitions.js";

export type RunInGameWorkflowStart = Readonly<{
  requestId: string;
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
  const tryPromise = <A>(try_: (signal: AbortSignal) => Promise<A>) =>
    Effect.tryPromise({
      try: (signal) => try_(signal),
      catch: (err) => err,
    });

  const deploymentEvidence = (deployment: RunInGameDeployment) => ({
    deploymentEvidence: {
      runDeployment: deployment.runDeployment,
      deployedSnapshot: deployment.deployedSnapshot,
    },
  });

  return {
    start: (workflow) =>
      Effect.gen(function* () {
        let phase: RunInGameFailurePhase = "materializing";
        let generatedMod: RunInGameGeneratedMod | undefined;
        let cleanup: (() => Promise<void>) | undefined;
        let cleanupPromise: Promise<void> | undefined;
        let generationPromise: Promise<RunInGameGeneratedMod> | undefined;
        let deploymentPromise: Promise<RunInGameDeployment> | undefined;
        let deploymentSettled = false;
        let generationRejected = false;
        const rememberGeneratedMod = (next: RunInGameGeneratedMod): RunInGameGeneratedMod => {
          generatedMod = next;
          if (next.cleanup !== undefined) cleanup = next.cleanup;
          return next;
        };
        const runCleanupOnce = (
          cleanupToRun: () => Promise<void>,
          failure?: unknown
        ): Effect.Effect<void, unknown> => {
          const run = () => (cleanupPromise ??= Promise.resolve().then(cleanupToRun));
          return tryPromise(run).pipe(
            Effect.mapError((err) =>
              runInGameCleanupFailure({
                err,
                phase,
                original: failure,
              })
            )
          );
        };
        const cleanupGeneratedMod = (failure?: unknown): Effect.Effect<void, unknown> => {
          const waitForDeployment = (() => {
            if (deploymentPromise === undefined || deploymentSettled) return Effect.void;
            const pendingDeployment = deploymentPromise;
            return tryPromise(async () => {
              try {
                await pendingDeployment;
              } catch {
                // Cancellation cleanup only needs the shared deploy copy/snapshot
                // section to settle before the runtime lease can be released.
              }
            });
          })();
          return waitForDeployment.pipe(
            Effect.flatMap(() => {
              if (cleanup !== undefined) return runCleanupOnce(cleanup, failure);
              if (generationPromise === undefined) return Effect.void;
              if (generationRejected) return Effect.void;
              const pendingGeneration = generationPromise;
              return tryPromise(async () => {
                try {
                  return await pendingGeneration;
                } catch {
                  generationRejected = true;
                  return undefined;
                }
              }).pipe(
                Effect.map((next) => (next === undefined ? undefined : rememberGeneratedMod(next))),
                Effect.flatMap((next) =>
                  next?.cleanup === undefined ? Effect.void : runCleanupOnce(next.cleanup, failure)
                )
              );
            })
          );
        };
        const work = Effect.gen(function* () {
          yield* workflow.transitions.registerCleanup(() => cleanupGeneratedMod());
          const generationManifest = yield* tryPromise((signal) =>
            writeStudioRunGenerationManifest({
              manifestInput: {
                requestId: workflow.requestId,
                launchEnvelope: workflow.prepared.launchEnvelope,
              },
              workspaceRoot: args.ports.runInGameWorkspaceRoot,
              signal,
            })
          );
          yield* workflow.transitions.transition({ phase: "materializing", generationManifest });
          const generated = yield* tryPromise((signal) => {
            generationPromise = Promise.resolve()
              .then(() =>
                args.ports.generateRunInGameMod({
                  generationManifest,
                  signal,
                })
              )
              .catch((err) => {
                generationRejected = true;
                throw err;
              });
            void generationPromise.catch(() => undefined);
            return generationPromise;
          }).pipe(
            Effect.tapError(() =>
              Effect.sync(() => {
                generationRejected = true;
              })
            ),
            Effect.map(rememberGeneratedMod)
          );
          if (generated.cleanup !== undefined) {
            cleanup = generated.cleanup;
          }
          yield* workflow.transitions.transition({
            phase: "materializing",
            materialization: generated.materialization,
          });

          phase = "deploying";
          yield* workflow.transitions.transition({
            phase,
            materialization: generated.materialization,
          });
          const deployment = yield* tryPromise((signal) => {
            deploymentPromise = Promise.resolve()
              .then(() =>
                args.ports.deployRunInGame({
                  requestId: workflow.requestId,
                  prepared: workflow.prepared,
                  generatedMod: generated,
                  signal,
                })
              )
              .finally(() => {
                deploymentSettled = true;
              });
            return deploymentPromise;
          });
          yield* workflow.transitions.transition({
            phase,
            materialization: deployment.materialization ?? generated.materialization,
            ...deploymentEvidence(deployment),
          });

          phase = "checking-civ7";
          yield* workflow.transitions.transition({
            phase,
            materialization: deployment.materialization ?? generated.materialization,
            ...deploymentEvidence(deployment),
          });
          yield* args.civ7.checkPlayable({
            requestId: workflow.requestId,
            prepared: workflow.prepared,
            deployment,
          });

          phase = "preparing-setup";
          yield* workflow.transitions.transition({ phase, ...deploymentEvidence(deployment) });
          const setup = yield* args.civ7.prepareSetup({
            requestId: workflow.requestId,
            prepared: workflow.prepared,
            deployment,
          });

          phase = "starting-game";
          yield* workflow.transitions.transition({ phase, ...deploymentEvidence(deployment) });
          const started = yield* args.civ7.startGame({
            requestId: workflow.requestId,
            prepared: workflow.prepared,
            deployment,
            setup,
          });

          phase = "collecting-evidence";
          yield* workflow.transitions.transition({ phase, ...deploymentEvidence(deployment) });
          const log = yield* tryPromise(() =>
            args.ports.waitForRunInGameLogEvidence({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              deployment,
              setup,
              started,
            })
          );
          const observation = yield* tryPromise((signal) =>
            args.ports.observeRunInGameRuntime({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              deployment,
              setup,
              started,
              log,
              signal,
            })
          );
          const evidence = yield* tryPromise(() =>
            args.ports.buildRunInGameEvidence({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              deployment,
              setup,
              started,
              log,
              observation,
            })
          );
          const exactAuthorshipEvidence =
            evidence.exactAuthorshipEvidence === undefined
              ? undefined
              : snapshotRunInGameExactAuthorshipEvidence(evidence.exactAuthorshipEvidence);
          if (
            evidence.exactAuthorshipEvidence !== undefined &&
            exactAuthorshipEvidence === undefined
          ) {
            yield* Effect.fail(
              verificationFailed({
                message: "Run in Game exact-authorship evidence is invalid",
                reason: "exact-authorship-mismatch",
                diagnostics: { code: "run-in-game-exact-authorship-invalid" },
              })
            );
          }
          yield* cleanupGeneratedMod();
          yield* workflow.transitions.transition({
            phase: "complete",
            result: evidence.result ?? { ok: true },
            materialization:
              evidence.materialization ?? deployment.materialization ?? generated.materialization,
            ...deploymentEvidence(deployment),
            runtimeObservation: observation,
            ...(exactAuthorshipEvidence === undefined ? {} : { exactAuthorshipEvidence }),
          });
        });

        yield* work.pipe(
          Effect.catchAll((err) =>
            cleanupGeneratedMod(err).pipe(
              Effect.flatMap(() => workflow.transitions.fail({ phase, err })),
              Effect.catchAll((cleanupErr) => workflow.transitions.fail({ phase, err: cleanupErr }))
            )
          ),
          Effect.ensuring(cleanupGeneratedMod().pipe(Effect.catchAll(() => Effect.void)))
        );
      }).pipe(Effect.catchAll(() => Effect.void)),
  };
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
