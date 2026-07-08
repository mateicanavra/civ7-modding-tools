import { writeStudioRunGenerationManifest } from "@civ7/studio-run-workspace";
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
  RunInGameGeneratedMod,
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
  const tryPromise = <A>(try_: (signal: AbortSignal) => Promise<A>) =>
    Effect.tryPromise({
      try: (signal) => try_(signal),
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
        let generatedMod: RunInGameGeneratedMod | undefined;
        let cleanup: (() => Promise<void>) | undefined;
        let cleanupPromise: Promise<void> | undefined;
        let generationPromise: Promise<RunInGameGeneratedMod> | undefined;
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
        };
        const work = Effect.gen(function* () {
          yield* workflow.transitions.registerCleanup(() => cleanupGeneratedMod());
          const generationManifest = yield* tryPromise((signal) =>
            writeStudioRunGenerationManifest({
              manifestInput: {
                requestId: workflow.requestId,
                request: {
                  recipeId: workflow.prepared.request.recipeId,
                  seed: workflow.prepared.request.seed,
                  mapSize: workflow.prepared.request.mapSize,
                  ...(workflow.prepared.request.playerCount === undefined
                    ? {}
                    : { playerCount: workflow.prepared.request.playerCount }),
                  ...(workflow.prepared.request.resources === undefined
                    ? {}
                    : { resources: workflow.prepared.request.resources }),
                  selectedConfigId: workflow.prepared.request.selectedConfigId,
                  setupConfig: workflow.prepared.request.setupConfig,
                  materializationMode: workflow.prepared.request.materializationMode,
                  ...(workflow.prepared.request.restartCivProcess === undefined
                    ? {}
                    : { restartCivProcess: workflow.prepared.request.restartCivProcess }),
                },
                resolvedLaunchSource: workflow.prepared.resolvedLaunchSource,
                launchEnvelope: workflow.prepared.launchEnvelope,
                launchSourceDigest: workflow.prepared.launchSourceDigest,
                launchEnvelopeDigest: workflow.prepared.launchEnvelopeDigest,
              },
              workspaceRoot: args.ports.runInGameWorkspaceRoot,
              signal,
            })
          );
          yield* workflow.transitions.transition({ phase, generationManifest });
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
            phase,
            materialization: generated.materialization,
          });

          phase = "deploying";
          yield* workflow.transitions.transition({
            phase,
            materialization: generated.materialization,
          });
          const deployment = yield* tryPromise(() =>
            args.ports.deployRunInGame({
              requestId: workflow.requestId,
              prepared: workflow.prepared,
              generatedMod: generated,
            })
          );
          yield* workflow.transitions.transition({
            phase,
            materialization: deployment.materialization ?? generated.materialization,
          });

          if (workflow.prepared.request.restartCivProcess && args.ports.restartCivForRunInGame) {
            phase = "restarting-civ";
          }
          let restart = yield* maybeRequestedRestart(workflow, deployment);
          phase = "checking-civ7";
          yield* workflow.transitions.transition({
            phase,
            materialization: deployment.materialization ?? generated.materialization,
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
                    materialization: deployment.materialization ?? generated.materialization,
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
          yield* cleanupGeneratedMod();
          yield* workflow.transitions.transition({
            phase: "complete",
            result: proof.result ?? { ok: true },
            materialization:
              proof.materialization ?? deployment.materialization ?? generated.materialization,
            ...(proof.exactAuthorshipProof === undefined
              ? {}
              : { exactAuthorshipProof: proof.exactAuthorshipProof }),
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
