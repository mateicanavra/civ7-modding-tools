import { mkdirSync, writeFileSync } from "node:fs";
import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  invalidRequest,
  operationBlocked,
  operationStatusTypeSchema,
  type RunInGameRequestStatus,
  type StudioEvent,
  studio,
  typeboxOutputSchemaFromContractProcedure,
  verificationFailed,
} from "@civ7/studio-contract";
import { canonicalValueDigest, readStudioRunGenerationManifest } from "@civ7/studio-run-workspace";
import { Effect, Fiber, Layer, ManagedRuntime } from "effect";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";
import { afterEach, describe, expect, test } from "vitest";
import type { StudioInputs } from "../src/context";
import {
  makeStudioOperationRuntimeLayer,
  StudioOperationRuntime,
  type StudioOperationRuntimeApi,
  type StudioOperationRuntimePorts,
} from "../src/operationRuntime";
import {
  lookupRunDiagnostics,
  runDiagnosticsIndexPath,
  writeRunDiagnostics,
} from "../src/operationRuntime/diagnostics";
import type { RegistryState, RunInGameInternalOperation } from "../src/operationRuntime/model";
import type { RunInGamePreparedRequest } from "../src/operationRuntime/ports";
import {
  projectCurrent,
  operationEvent as projectOperationEvent,
} from "../src/operationRuntime/projection";
import {
  admitRunInGame,
  cancelRunInGame,
  getRunInGame,
  makeRegistry,
  markRunInGameDiagnosticsAvailable,
  transitionRunInGame,
} from "../src/operationRuntime/registry";
import { Civ7WorkflowControl, type Civ7WorkflowControlApi } from "../src/ports";
import { StudioEventHub, type StudioEventHubApi } from "../src/services/StudioEventHub";

const { operationsCurrent, studioEventSchema } = studio;

const openRuntimes: ManagedRuntime.ManagedRuntime<unknown, never>[] = [];
const runtimeWorkspaceRoots: string[] = [];
let runtimeWorkspaceSequence = 0;

afterEach(async () => {
  await Promise.all(openRuntimes.splice(0).map((runtime) => runtime.dispose()));
  await Promise.all(
    runtimeWorkspaceRoots.splice(0).map((root) => rm(root, { recursive: true, force: true }))
  );
});

describe("StudioOperationRuntime", () => {
  test("owns daemon identity and current operation truth", async () => {
    const { runtime, eventHub } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    expect(service.identity).toMatchObject({
      serverInstanceId: expect.stringMatching(/^studio-server-/),
      serverStartedAt: "2026-06-10T00:00:00.000Z",
    });

    const current = await runtime.runPromise(service.operationsCurrent);
    expect(current).toMatchObject({
      ok: true,
      serverInstanceId: service.identity.serverInstanceId,
      serverStartedAt: "2026-06-10T00:00:00.000Z",
      observedAt: "2026-06-10T00:00:00.000Z",
      runInGame: { active: null, recent: [] },
      saveDeploy: { active: null, recent: [] },
    });
    await expect(Effect.runPromise(eventHub.activeSubscriberCount)).resolves.toBe(0);
  });

  test("uses collision-resistant daemon identities for same-tick runtimes", async () => {
    const first = makeRuntime();
    const second = makeRuntime();

    const firstService = await first.runtime.runPromise(StudioOperationRuntime);
    const secondService = await second.runtime.runPromise(StudioOperationRuntime);

    expect(firstService.identity.serverStartedAt).toBe(secondService.identity.serverStartedAt);
    expect(firstService.identity.serverInstanceId).not.toBe(
      secondService.identity.serverInstanceId
    );
  });

  test("projects diagnostics id only for the persisted operation snapshot", async () => {
    const sameTick = "2026-06-10T00:00:00.000Z";
    const registry = await Effect.runPromise(
      makeRegistry({
        serverInstanceId: "studio-server-test",
        serverStartedAt: sameTick,
      })
    );
    const prepared: RunInGamePreparedRequest = {
      request: runInGameInput(),
    };

    await Effect.runPromise(
      admitRunInGame({
        registry,
        nowMs: Date.parse(sameTick),
        nowIso: sameTick,
        requestId: "run-snapshot",
        leaseId: "runtime-lease-run-snapshot",
        prepared,
      })
    );

    const accepted = await Effect.runPromise(
      getRunInGame({
        registry,
        requestId: "run-snapshot",
        nowMs: Date.parse(sameTick),
        nowIso: sameTick,
      })
    );
    expect(accepted.diagnosticsId).toBeUndefined();

    await Effect.runPromise(markRunInGameDiagnosticsAvailable(registry, "run-snapshot", 1));
    const persistedAccepted = await Effect.runPromise(
      getRunInGame({
        registry,
        requestId: "run-snapshot",
        nowMs: Date.parse(sameTick),
        nowIso: sameTick,
      })
    );
    expect(persistedAccepted.diagnosticsId).toMatch(/^run-diagnostics-/);
    expect(persistedAccepted.diagnosticsId).not.toBe("run-diagnostics-run-snapshot");

    await Effect.runPromise(
      transitionRunInGame({
        registry,
        requestId: "run-snapshot",
        nowIso: sameTick,
        transition: { phase: "deploying" },
      })
    );
    const unpersistedTransition = await Effect.runPromise(
      getRunInGame({
        registry,
        requestId: "run-snapshot",
        nowMs: Date.parse(sameTick),
        nowIso: sameTick,
      })
    );
    expect(unpersistedTransition.diagnosticsId).toBeUndefined();

    await Effect.runPromise(markRunInGameDiagnosticsAvailable(registry, "run-snapshot", 2));
    const persistedTransition = await Effect.runPromise(
      getRunInGame({
        registry,
        requestId: "run-snapshot",
        nowMs: Date.parse(sameTick),
        nowIso: sameTick,
      })
    );
    expect(persistedTransition.diagnosticsId).toBe(persistedAccepted.diagnosticsId);
  });

  test("atomically assigns each diagnostics id to one jailed request path", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-diagnostics-index-race-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const diagnosticsId = "run-diagnostics-index-race";
    const operation = (requestId: string): RunInGameInternalOperation => ({
      kind: "run-in-game",
      requestId,
      leaseId: `lease-${requestId}`,
      request: {},
      phase: "complete",
      status: "complete",
      operationRevision: 1,
      startedAt: "2026-06-10T00:00:00.000Z",
      updatedAt: "2026-06-10T00:00:01.000Z",
      diagnosticsId,
      completedPhases: [],
    });

    const writes = await Promise.allSettled(
      ["studio-run-index-race-a", "studio-run-index-race-b"].map((requestId) =>
        Effect.runPromise(writeRunDiagnostics(operation(requestId), { workspaceRoot }))
      )
    );
    expect(writes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(writes.filter((result) => result.status === "rejected")).toHaveLength(1);

    const lookup = await Effect.runPromise(lookupRunDiagnostics(diagnosticsId, { workspaceRoot }));
    expect(lookup).toMatchObject({
      ok: true,
      diagnostics: {
        diagnosticsId,
        requestId: expect.stringMatching(/^studio-run-index-race-[ab]$/),
      },
    });
  });

  test("projects current and event Run in Game payloads without private operation detail", () => {
    const now = "2026-06-10T00:00:00.000Z";
    const privateOperation = {
      kind: "run-in-game",
      requestId: "run-private-projection",
      leaseId: "runtime-lease-private-projection",
      request: runInGameInput({
        config: {
          privateSourcePath: "/Users/matei/private/source.config.json",
        },
      }),
      phase: "failed",
      status: "failed",
      operationRevision: 3,
      startedAt: now,
      updatedAt: "2026-06-10T00:00:01.000Z",
      diagnosticsId: "run-diagnostics-private-projection",
      diagnosticsPersistedRevision: 3,
      completedPhases: ["admitting-config"],
      result: {
        rawOutput: "Traceback: setup cannot see /tmp/private-deploy/Swooper.lua",
      },
      failure: operationBlocked({
        message: "setup cannot see /Users/matei/private/Civ7/Mods/Swooper.lua",
        activeRequestId: "run-other-private",
      }),
    } satisfies RunInGameInternalOperation;
    const registryState = {
      identity: {
        serverInstanceId: "studio-server-private-projection",
        serverStartedAt: now,
      },
      disposed: false,
      active: null,
      runInGame: {
        [privateOperation.requestId]: privateOperation,
      },
      saveDeploy: {},
      tombstones: {},
    } satisfies RegistryState;

    const current = projectCurrent(registryState, "2026-06-10T00:00:02.000Z");
    const event = projectOperationEvent(privateOperation);
    const serializedPublicPayloads = JSON.stringify([current, event]);

    expect(serializedPublicPayloads).toContain("run-diagnostics-private-projection");
    expect(serializedPublicPayloads).toContain("ownership");
    expect(serializedPublicPayloads).not.toMatch(
      /privateSourcePath|leaseId|runtime-lease-private-projection|correlationDigest|private-correlation-digest|completedPhases|rawOutput|Traceback|setup cannot see|\/Users\/|\/tmp\/private-deploy|Swooper\.lua|run-other-private/
    );
    expectTypeboxValid(typeboxOutputSchemaFromContractProcedure(operationsCurrent), current);
    expectTypeboxValid(studioEventSchema, event);
  });

  test("projects cancellation through the explicit Run in Game cancellation owner", async () => {
    const now = "2026-06-10T00:00:00.000Z";
    const registry = await Effect.runPromise(
      makeRegistry({
        serverInstanceId: "studio-server-test",
        serverStartedAt: now,
      })
    );
    await Effect.runPromise(
      admitRunInGame({
        registry,
        nowMs: Date.parse(now),
        nowIso: now,
        requestId: "run-cancelled",
        leaseId: "runtime-lease-run-cancelled",
        prepared: {
          request: runInGameInput(),
        },
      })
    );

    await Effect.runPromise(
      cancelRunInGame({
        registry,
        requestId: "run-cancelled",
        nowMs: Date.parse("2026-06-10T00:00:01.000Z"),
        nowIso: "2026-06-10T00:00:01.000Z",
      })
    );

    const cancelled = await Effect.runPromise(
      getRunInGame({
        registry,
        requestId: "run-cancelled",
        nowMs: Date.parse("2026-06-10T00:00:01.000Z"),
        nowIso: "2026-06-10T00:00:01.000Z",
      })
    );
    expect(cancelled).toMatchObject({
      requestId: "run-cancelled",
      status: "cancelled",
      phase: "cancelled",
      safeFailureCategory: "operation-cancelled",
    });
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
  });

  test("cancels an active Run in Game worker after cleanup and emits one terminal event", async () => {
    const events: StudioEvent[] = [];
    const deployBlocker = deferred<void>();
    let cleanupCalls = 0;
    let lifecycleCalls = 0;
    const runInGameWorkspaceRoot = join(
      tmpdir(),
      `studio-operation-runtime-cancel-deploy-${process.pid}-${++runtimeWorkspaceSequence}`
    );
    runtimeWorkspaceRoots.push(runInGameWorkspaceRoot);
    const { runtime } = makeRuntime({
      eventSink: events,
      civ7: {
        startSinglePlayer: () => {
          lifecycleCalls += 1;
          return Effect.succeed(lifecycleStarted());
        },
      },
      ports: {
        runInGameWorkspaceRoot,
        generateRunInGameMod: async () => ({
          ...generatedRunInGameMod(),
          cleanup: async () => {
            cleanupCalls += 1;
          },
        }),
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await deployBlocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("deploying");

    let cancelResolved = false;
    const cancelPromise = runtime
      .runPromise(service.runInGameCancel({ requestId: accepted.requestId }))
      .then((cancelled) => {
        cancelResolved = true;
        return cancelled;
      });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(cancelResolved).toBe(false);
    const heldLease = JSON.parse(
      await readFile(
        join(runInGameWorkspaceRoot, "_runtime", "runtime-ownership-lease.json"),
        "utf8"
      )
    ) as Record<string, unknown>;
    expect(heldLease).toMatchObject({
      ownerKind: "run-in-game",
      requestId: accepted.requestId,
    });

    deployBlocker.resolve();
    const cancelled = await cancelPromise;

    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
      safeFailureCategory: "operation-cancelled",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(cleanupCalls).toBe(1);
    expect(lifecycleCalls).toBe(0);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    const current = await runtime.runPromise(service.operationsCurrent);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toContainEqual(cancelled);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await expect(
      runtime.runPromise(service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toEqual(cancelled);
    await expect(
      runtime.runPromise(
        service.saveDeployStart({
          requestId: "save-after-run-cancel",
          canonicalConfig: testSaveDeployCanonicalConfig(),
        })
      )
    ).resolves.toMatchObject({
      requestId: "save-after-run-cancel",
      status: "running",
    });
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
  });

  test("keeps one in-flight lifecycle call authoritative when cancellation arrives after its fence", async () => {
    const lifecycleBlocker = deferred<void>();
    let lifecycleCalls = 0;
    const { runtime } = makeRuntime({
      civ7: {
        startSinglePlayer: () =>
          Effect.promise(async () => {
            lifecycleCalls += 1;
            await lifecycleBlocker.promise;
            return lifecycleStarted();
          }),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("starting-game");
    await expect.poll(() => lifecycleCalls).toBe(1);

    const protectedRun = await runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );
    expect(protectedRun).toMatchObject({
      requestId: accepted.requestId,
      status: "running",
      phase: "starting-game",
    });
    expect(lifecycleCalls).toBe(1);

    lifecycleBlocker.resolve();
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("completed");
    expect(lifecycleCalls).toBe(1);
  });

  test("publishes observing-runtime as soon as Civ7 proves the game started", async () => {
    const finalLifecycleProof = deferred<void>();
    const gameStarted = deferred<void>();
    const awaitFinalLifecycleProof = Effect.promise(() => finalLifecycleProof.promise);
    const { runtime } = makeRuntime({
      civ7: {
        startSinglePlayer: ({ gameStarted: reportGameStarted }) =>
          (reportGameStarted ?? Effect.void).pipe(
            Effect.tap(() => Effect.sync(() => gameStarted.resolve())),
            Effect.zipRight(awaitFinalLifecycleProof),
            Effect.as(lifecycleStarted())
          ),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));

    await gameStarted.promise;
    await expect(
      runtime.runPromise(service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toMatchObject({ phase: "observing-runtime", status: "running" });

    finalLifecycleProof.resolve();
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("completed");
  });

  test("records Run in Game cancellation cleanup failures only in private diagnostics", async () => {
    const events: StudioEvent[] = [];
    const deployBlocker = deferred<void>();
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => ({
          ...generatedRunInGameMod(),
          cleanup: async () => {
            cleanupCalls += 1;
            throw new Error("cleanup exploded");
          },
        }),
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await deployBlocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("deploying");

    let cancelResolved = false;
    const cancelPromise = runtime
      .runPromise(service.runInGameCancel({ requestId: accepted.requestId }))
      .then((cancelled) => {
        cancelResolved = true;
        return cancelled;
      });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(cancelResolved).toBe(false);

    deployBlocker.resolve();
    const cancelled = await cancelPromise;

    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
      safeFailureCategory: "operation-cancelled",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(cleanupCalls).toBe(1);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    const privateOperation = await readPrivateRunOperation(
      runtime,
      service,
      cancelled.diagnosticsId
    );
    expect(privateOperation.cancellationCleanupFailure).toMatchObject({
      message: "Run in Game cancellation cleanup failed",
      diagnostics: {
        code: "run-in-game-cancel-cleanup-failed",
        cause: expect.stringContaining("cleanup exploded"),
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await expect(
      runtime.runPromise(service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toEqual(cancelled);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
  });

  test("cancellation after the lifecycle fence preserves the running operation", async () => {
    const events: StudioEvent[] = [];
    const cleanupStarted = deferred<void>();
    const cleanupBlocker = deferred<void>();
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => ({
          ...generatedRunInGameMod(),
          cleanup: async () => {
            cleanupCalls += 1;
            cleanupStarted.resolve();
            await cleanupBlocker.promise;
          },
        }),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await cleanupStarted.promise;

    const cancellation = runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(0);

    const protectedRun = await cancellation;

    expect(protectedRun).toMatchObject({
      requestId: accepted.requestId,
      status: "running",
      phase: "observing-runtime",
    });
    expect(cleanupCalls).toBe(1);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(0);
    cleanupBlocker.resolve();
    await expect
      .poll(
        async () =>
          (await runtime.runPromise(service.runInGameStatus({ requestId: accepted.requestId })))
            .status
      )
      .toBe("completed");
    expectTypeboxValid(operationStatusTypeSchema, protectedRun);
  });

  test("cancellation during in-flight generation waits for late cleanup before publishing", async () => {
    const events: StudioEvent[] = [];
    const generationBlocker = deferred<void>();
    const generationInterrupted = deferred<void>();
    const cleanupStarted = deferred<void>();
    const cleanupBlocker = deferred<void>();
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async ({ signal }) => {
          if (signal.aborted) generationInterrupted.resolve();
          else
            signal.addEventListener("abort", () => generationInterrupted.resolve(), { once: true });
          await generationBlocker.promise;
          return {
            ...generatedRunInGameMod({
              cleanup: async () => {
                cleanupCalls += 1;
                cleanupStarted.resolve();
                await cleanupBlocker.promise;
              },
            }),
          };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("generating-artifacts");

    const cancellation = runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );
    await generationInterrupted.promise;
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(0);

    generationBlocker.resolve();
    await cleanupStarted.promise;
    expect(cleanupCalls).toBe(1);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(0);

    cleanupBlocker.resolve();
    const cancelled = await cancellation;

    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
      safeFailureCategory: "operation-cancelled",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
  });

  test("synchronous cancellation cleanup throws are recorded in private diagnostics", async () => {
    const events: StudioEvent[] = [];
    const deployBlocker = deferred<void>();
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => ({
          ...generatedRunInGameMod(),
          cleanup: () => {
            throw new Error("sync cleanup exploded");
          },
        }),
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await deployBlocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("deploying");

    let cancelResolved = false;
    const cancelPromise = runtime
      .runPromise(service.runInGameCancel({ requestId: accepted.requestId }))
      .then((cancelled) => {
        cancelResolved = true;
        return cancelled;
      });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(cancelResolved).toBe(false);

    deployBlocker.resolve();
    const cancelled = await cancelPromise;

    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
      safeFailureCategory: "operation-cancelled",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    const privateOperation = await readPrivateRunOperation(
      runtime,
      service,
      cancelled.diagnosticsId
    );
    expect(privateOperation.cancellationCleanupFailure).toMatchObject({
      diagnostics: {
        code: "run-in-game-cancel-cleanup-failed",
        cause: expect.stringContaining("sync cleanup exploded"),
      },
    });
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
  });

  test("cancellation does not wait on a blocked worker transition publish", async () => {
    const events: StudioEvent[] = [];
    const deployPublishBlocker = deferred<void>();
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      eventPublishBlocker: (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.status === "running" &&
        event.status.phase === "deploying"
          ? deployPublishBlocker.promise
          : undefined,
      ports: {
        generateRunInGameMod: async () => ({
          ...generatedRunInGameMod(),
          cleanup: async () => {
            cleanupCalls += 1;
          },
        }),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect.poll(() => operationPhases(events, accepted.requestId)).toContain("deploying");

    const cancelled = await runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );

    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
      safeFailureCategory: "operation-cancelled",
    });
    expect(cleanupCalls).toBe(1);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    deployPublishBlocker.resolve();
  });

  test("keeps public diagnostics revision-consistent when an earlier write is delayed", async () => {
    const delayedWriteStarted = deferred<void>();
    const releaseDelayedWrite = deferred<void>();
    let currentRevisionWriteStarted = false;
    const { runtime } = makeRuntime({
      diagnosticsWriter: (operation, options) => {
        if (operation.operationRevision === 2) {
          return Effect.promise(async () => {
            delayedWriteStarted.resolve();
            await releaseDelayedWrite.promise;
          }).pipe(Effect.zipRight(writeRunDiagnostics(operation, options)));
        }
        if (operation.operationRevision === 3) {
          return Effect.sync(() => {
            writeTestRunDiagnostics(operation, options.workspaceRoot);
            currentRevisionWriteStarted = true;
          });
        }
        return writeRunDiagnostics(operation, options);
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await delayedWriteStarted.promise;

    const cancellation = runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("cancelled");
    await new Promise<void>((resolveNextTurn) => setImmediate(resolveNextTurn));

    const pending = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    expect(currentRevisionWriteStarted).toBe(false);
    expect(pending.diagnosticsId).toBeUndefined();

    releaseDelayedWrite.resolve();
    const cancelled = await cancellation;
    const diagnostics = await readPrivateRunDiagnostics(runtime, service, cancelled.diagnosticsId);

    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(diagnostics).toMatchObject({
      diagnosticsId: accepted.diagnosticsId,
      requestId: accepted.requestId,
      operationRevision: 3,
      sections: {
        operation: {
          operationRevision: 3,
          phase: "cancelled",
          status: "cancelled",
        },
      },
    });
    await expect(
      runtime.runPromise(service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toEqual(cancelled);
  });

  test("cancels Run in Game before deployment without stale worker mutation", async () => {
    const generationBlocker = deferred<void>();
    const { runtime } = makeRuntime({
      ports: {
        generateRunInGameMod: async () => {
          await generationBlocker.promise;
          return generatedRunInGameMod();
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("generating-artifacts");
    const cancellation = runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    generationBlocker.resolve();
    const cancelled = await cancellation;
    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await expect(
      runtime.runPromise(service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toEqual(cancelled);
  });

  test("does not report cancellation after lifecycle mutation during runtime observation", async () => {
    const evidenceBlocker = deferred<void>();
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        generateRunInGameMod: async () => ({
          ...generatedRunInGameMod(),
          cleanup: async () => {
            cleanupCalls += 1;
          },
        }),
        waitForRunInGameLogEvidence: async () => {
          await evidenceBlocker.promise;
          return { result: { ok: true } };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return (
          status.phase === "observing-runtime" && status.diagnosticsId === accepted.diagnosticsId
        );
      })
      .toBe(true);
    const protectedRun = await runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );

    expect(protectedRun).toMatchObject({
      requestId: accepted.requestId,
      status: "running",
      phase: "observing-runtime",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(cleanupCalls).toBe(0);
    evidenceBlocker.resolve();
    await expect
      .poll(
        async () =>
          (await runtime.runPromise(service.runInGameStatus({ requestId: accepted.requestId })))
            .status
      )
      .toBe("completed");
    expect(cleanupCalls).toBe(1);
  });

  test("repeated Run in Game cancellation returns the cancelled terminal without another event", async () => {
    const events: StudioEvent[] = [];
    const deployBlocker = deferred<void>();
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await deployBlocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("deploying");

    let cancelResolved = false;
    const cancelPromise = runtime
      .runPromise(service.runInGameCancel({ requestId: accepted.requestId }))
      .then((cancelled) => {
        cancelResolved = true;
        return cancelled;
      });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(cancelResolved).toBe(false);

    deployBlocker.resolve();
    const first = await cancelPromise;
    const terminalEventCount = terminalRunInGameEvents(events, accepted.requestId).length;
    const repeated = await runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );

    expect(first).toMatchObject({ status: "cancelled", phase: "cancelled" });
    expect(repeated).toEqual(first);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(terminalEventCount);
  });

  test("cancelling a terminal Run in Game operation returns the terminal without mutation", async () => {
    const events: StudioEvent[] = [];
    const { runtime } = makeRuntime({ eventSink: events });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("completed");
    const completed = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const terminalEventCount = terminalRunInGameEvents(events, accepted.requestId).length;

    await expect(
      runtime.runPromise(service.runInGameCancel({ requestId: accepted.requestId }))
    ).resolves.toEqual(completed);
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(terminalEventCount);
  });

  test("Run in Game cancellation misses use the same safe not-found surface as status", async () => {
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    const failure = await expectFailure(runtime, service.runInGameCancel({ requestId: "missing" }));
    expect(failure).toMatchObject({
      tag: "OperationNotFound",
      requestId: "missing",
    });
    expect(failure).not.toHaveProperty("serverInstanceId");
    expect(failure).not.toHaveProperty("serverStartedAt");
  });

  test("caller interruption after Run in Game admission does not cancel the operation", async () => {
    const events: StudioEvent[] = [];
    const publishBlocker = deferred<void>();
    const deployBlocker = deferred<void>();
    const { runtime } = makeRuntime({
      eventSink: events,
      eventPublishBlocker: publishBlocker.promise,
      ports: {
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await deployBlocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const fiber = await runtime.runPromise(
      Effect.forkDaemon(service.runInGameStart(runInGameInput()))
    );
    await expect
      .poll(() => {
        const event = events.find(
          (entry) => entry.type === "operation" && entry.kind === "run-in-game"
        );
        return event?.type === "operation" && event.kind === "run-in-game"
          ? event.status.requestId
          : undefined;
      })
      .toMatch(/^studio-run-in-game-/);
    const event = events.find(
      (entry) => entry.type === "operation" && entry.kind === "run-in-game"
    );
    if (event?.type !== "operation" || event.kind !== "run-in-game") {
      throw new Error("Expected accepted Run in Game event");
    }
    const requestId = event.status.requestId;

    const interrupt = runtime.runPromise(Fiber.interrupt(fiber));
    await expect(runtime.runPromise(service.runInGameStatus({ requestId }))).resolves.toMatchObject(
      {
        requestId,
        status: "running",
      }
    );
    publishBlocker.resolve();
    await interrupt;

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(service.runInGameStatus({ requestId }));
        return status.phase;
      })
      .toBe("deploying");
    await expect(runtime.runPromise(service.runInGameStatus({ requestId }))).resolves.toMatchObject(
      {
        requestId,
        status: "running",
      }
    );
    deployBlocker.resolve();
  });

  test("reports active operations only in active and excludes them from recent", async () => {
    const runBlocker = deferred<void>();
    const { runtime: runRuntime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await runBlocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const runService = await runRuntime.runPromise(StudioOperationRuntime);
    const run = await runRuntime.runPromise(runService.runInGameStart(runInGameInput()));

    await expect
      .poll(async () => {
        const current = await runRuntime.runPromise(runService.operationsCurrent);
        return current.runInGame.active?.requestId;
      })
      .toBe(run.requestId);
    const runCurrent = await runRuntime.runPromise(runService.operationsCurrent);
    expect(runCurrent.runInGame.active?.requestId).toBe(run.requestId);
    expect(runCurrent.runInGame.recent).toEqual([]);
    runBlocker.resolve();
    await expect
      .poll(async () => {
        const status = await runRuntime.runPromise(
          runService.runInGameStatus({ requestId: run.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    const saveBlocker = deferred<void>();
    const { runtime: saveRuntime } = makeRuntime({
      ports: {
        prepareSaveDeployStart: async () => {
          await saveBlocker.promise;
          return {};
        },
      },
    });
    const saveService = await saveRuntime.runPromise(StudioOperationRuntime);
    const save = await saveRuntime.runPromise(
      saveService.saveDeployStart(saveDeployInput("save-active"))
    );

    const saveCurrent = await saveRuntime.runPromise(saveService.operationsCurrent);
    expect(saveCurrent.saveDeploy.active?.requestId).toBe(save.requestId);
    expect(saveCurrent.saveDeploy.recent).toEqual([]);
    saveBlocker.resolve();
  });

  test("retains terminal operations in recent and direct status agrees with current", async () => {
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    const run = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: run.requestId })
        );
        return status.phase;
      })
      .toBe("completed");
    const save = await startSaveDeployWhenLeaseReleased(runtime, service, {
      requestId: "save-terminal",
      canonicalConfig: testSaveDeployCanonicalConfig(),
    });
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: save.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    const current = await runtime.runPromise(service.operationsCurrent);
    const runStatus = await runtime.runPromise(
      service.runInGameStatus({ requestId: run.requestId })
    );
    const saveStatus = await runtime.runPromise(
      service.saveDeployStatus({ requestId: save.requestId })
    );

    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toHaveLength(1);
    expect(current.runInGame.recent[0]).toEqual(runStatus);
    expect(current.saveDeploy.active).toBeNull();
    expect(current.saveDeploy.recent).toHaveLength(1);
    expect(current.saveDeploy.recent[0]).toEqual(saveStatus);
  });

  test("preserves config digest evidence in the runtime-owned request projection", async () => {
    let observedPrepared: RunInGamePreparedRequest | undefined;
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod, prepared }) => {
          observedPrepared = prepared;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(
        runInGameInput({
          seed: "123",
          mapSize: "MAPSIZE_TINY",
          config: { example: true },
          setupConfig: { players: [] },
          canonicalConfig: {
            name: "Current Editor Config",
            latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
          },
        })
      )
    );

    await expect.poll(() => observedPrepared).toBeDefined();
    expect(observedPrepared?.launchEnvelope.canonicalConfig).toEqual({
      id: "studio-current",
      name: "Current Editor Config",
      description: "Current Studio editor configuration.",
      recipe: "standard",
      sortIndex: 9999,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      config: { example: true },
    });
    expect(observedPrepared?.canonicalConfigDigest).toBe(
      canonicalValueDigest(observedPrepared?.launchEnvelope.canonicalConfig)
    );
    expect(observedPrepared?.launchEnvelopeDigest).toEqual(expect.any(String));
    expect(accepted.requestId).toMatch(/^studio-run-in-game-/);
  });

  test("wraps canonical-config admission failures at the Effect boundary", async () => {
    const admissionFailure = invalidRequest({
      message: "Standard envelope admission denied.",
      diagnostics: { code: "standard-admission-denied" },
    });
    const { runtime } = makeRuntime({
      ports: {
        runInGameCanonicalConfigAdmission: {
          admit: async () => {
            throw admissionFailure;
          },
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const failure = await expectFailure(runtime, service.runInGameStart(runInGameInput()));

    expect(failure).toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      message: "Run in Game config could not be admitted.",
      diagnostics: {
        code: "run-in-game-config-admission-failed",
        cause: expect.stringContaining("standard-admission-denied"),
      },
    });
  });

  test("rejects non-portable direct Run in Game input before Standard admission", async () => {
    let admissionCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        runInGameCanonicalConfigAdmission: {
          admit: async (canonicalConfig) => {
            admissionCalls += 1;
            return canonicalConfig;
          },
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    for (const [label, value] of nonPortableJsonValues()) {
      const input = runInGameInput();
      Object.defineProperty(input.canonicalConfig.config, "nested", {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
      const result = await runtime.runPromise(Effect.either(service.runInGameStart(input)));
      expect(result._tag, label).toBe("Left");
      expect(admissionCalls, label).toBe(0);
    }
  });

  test("keeps an admitted launch restart-free by default", async () => {
    let observedRequest: Record<string, unknown> | undefined;
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod, prepared }) => {
          observedRequest = prepared.request as Record<string, unknown>;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));

    await expect.poll(() => observedRequest).toBeDefined();
    expect(observedRequest?.restartCivProcess).toBeUndefined();
  });

  test("keeps one digest identity across runtime projections and final evidence", async () => {
    const events: StudioEvent[] = [];
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-source-evidence-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    let acceptedDigests:
      | Readonly<{
          canonicalConfigDigest: string;
          launchEnvelopeDigest: string;
        }>
      | undefined;
    let observedRuntimeObservation:
      | Awaited<ReturnType<StudioOperationRuntimePorts["observeRunInGameRuntime"]>>
      | undefined;
    const recordingEventHub = makeEventHub({ eventSink: events });
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts({
          runInGameWorkspaceRoot: workspaceRoot,
          buildRunInGameEvidence: async ({ requestId, prepared, deployment, observation }) => {
            acceptedDigests = {
              canonicalConfigDigest: prepared.canonicalConfigDigest,
              launchEnvelopeDigest: prepared.launchEnvelopeDigest,
            };
            observedRuntimeObservation = observation;
            return {
              result: { ok: true },
              exactAuthorshipEvidence: {
                status: "unresolved",
                requestId,
                createdAt: "2026-06-10T00:00:00.000Z",
                canonicalConfigDigest: prepared.canonicalConfigDigest,
                launchEnvelopeDigest: prepared.launchEnvelopeDigest,
                request: {
                  recipeId: prepared.request.recipeId,
                },
                materialization: deployment.materialization ?? {},
                civSetup: {},
                runtime: {},
                unresolvedLinks: ["fixture-incomplete"],
              },
            };
          },
        }),
        civ7WorkflowControl: makeCiv7WorkflowControlLayer(),
      }).pipe(Layer.provide(Layer.succeed(StudioEventHub, recordingEventHub)))
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(
        runInGameInput({
          config: {
            alpha: { z: 1, a: 2 },
            privateLaunchSentinel: "never-persist-outside-manifest",
          },
          canonicalConfig: { latitudeBounds: { topLatitude: 75, bottomLatitude: -55 } },
        })
      )
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");
    expect(acceptedDigests).toBeDefined();

    const status = await readPublicRunStatusWithDiagnostics(runtime, service, accepted);
    const operationEvents = events.filter(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId
    );
    const current = await runtime.runPromise(service.operationsCurrent);

    expect(status).toMatchObject({
      requestId: accepted.requestId,
      status: "completed",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(
      operationEvents.every((event) => event.status.diagnosticsId === accepted.diagnosticsId)
    ).toBe(true);
    for (const publicValue of [accepted, status, current, ...operationEvents]) {
      expect(JSON.stringify(publicValue)).not.toContain("exactAuthorshipEvidence");
    }
    const finalPrivateOperation = await readPrivateRunOperation(
      runtime,
      service,
      accepted.diagnosticsId
    );
    expect(finalPrivateOperation.request).toMatchObject(acceptedDigests!);
    expect(finalPrivateOperation.exactAuthorshipEvidence).toMatchObject(acceptedDigests!);
    expect(observedRuntimeObservation).toMatchObject({
      requestId: accepted.requestId,
      deploymentEvidence: {
        runDeployment: { deployedModId: "mod-swooper-studio-run" },
        deployedSnapshot: { digest: "test-generated-mod-digest" },
      },
      loadedGame: {
        marker: { requestId: accepted.requestId },
        deployedSnapshotDigest: "test-generated-mod-digest",
      },
    });

    const diagnosticsRecordPath = resolve(
      workspaceRoot,
      accepted.requestId,
      "diagnostics",
      "diagnostics.json"
    );
    const diagnosticsRecord = JSON.parse(await readFile(diagnosticsRecordPath, "utf8"));
    expect(diagnosticsRecord).toMatchObject({
      diagnosticsId: accepted.diagnosticsId,
      requestId: accepted.requestId,
    });
  });

  test("stores Run in Game diagnostics under the configured workspace root", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-diagnostics-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    const diagnosticsId = accepted.diagnosticsId;
    if (!diagnosticsId) throw new Error("Expected admitted Run in Game diagnostics id");
    const diagnosticsRecordPath = resolve(
      workspaceRoot,
      accepted.requestId,
      "diagnostics",
      "diagnostics.json"
    );
    const diagnosticsRecord = JSON.parse(await readFile(diagnosticsRecordPath, "utf8"));
    expect(diagnosticsRecord).toMatchObject({
      diagnosticsId,
      requestId: accepted.requestId,
    });

    const lookup = await runtime.runPromise(service.runInGameDiagnostics({ diagnosticsId }));
    expect(lookup).toMatchObject({
      ok: true,
      diagnostics: {
        diagnosticsId,
        requestId: accepted.requestId,
      },
    });
  });

  test("writes a complete private Run in Game attribution report behind diagnostics lookup", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-attribution-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const events: StudioEvent[] = [];
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    const status = await readPublicRunStatusWithDiagnostics(runtime, service, accepted);
    const current = await runtime.runPromise(service.operationsCurrent);
    const operationEvents = events.filter(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId
    );
    for (const publicValue of [accepted, status, current, ...operationEvents]) {
      expect(JSON.stringify(publicValue)).not.toContain("attribution");
    }
    expectTypeboxValid(operationStatusTypeSchema, status);
    expectTypeboxValid(typeboxOutputSchemaFromContractProcedure(operationsCurrent), current);
    for (const event of operationEvents) {
      expectTypeboxValid(studioEventSchema, event);
    }

    const diagnostics = await readPrivateRunDiagnostics(runtime, service, accepted.diagnosticsId);
    const attribution = diagnostics.sections.attribution;
    expect(attribution).toMatchObject({
      report: {
        requestId: accepted.requestId,
        runArtifactId: expect.stringMatching(/^run-[a-f0-9]{20}$/),
        status: "complete",
        missingSections: [],
        sections: {
          source: expect.any(Object),
          manifest: expect.any(Object),
          generation: expect.objectContaining({
            generatedModDigest: "test-generated-mod-digest",
          }),
          deployment: expect.objectContaining({
            runDeployment: expect.objectContaining({ deployedModId: "mod-swooper-studio-run" }),
          }),
          scriptingLogObservation: expect.objectContaining({ requestId: accepted.requestId }),
          setupRowReadback: expect.objectContaining({ requestId: accepted.requestId }),
          boundedLoadedGameReadback: expect.objectContaining({ requestId: accepted.requestId }),
          terminalResult: expect.objectContaining({
            status: "complete",
            phase: "complete",
          }),
        },
      },
    });
    const attributionRecord = attributionRecordValue(attribution);
    const reportOnDisk = JSON.parse(await readFile(String(attributionRecord.path), "utf8"));
    expect(reportOnDisk).toEqual(attributionRecord.report);
    expect(String(attributionRecord.path)).toBe(
      resolve(workspaceRoot, accepted.requestId, "attribution", "attribution.json")
    );
  });

  test("marks private Run in Game attribution incomplete for failed partial runs", async () => {
    const { runtime } = makeRuntime({
      ports: {
        generateRunInGameMod: async () => {
          throw new Error("generator exploded");
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("failed");

    const failed = await readPublicRunStatusWithDiagnostics(runtime, service, accepted);
    expect(failed).toMatchObject({
      requestId: accepted.requestId,
      status: "failed",
      safeFailureCategory: "artifact-generation",
      diagnosticsId: accepted.diagnosticsId,
    });

    const diagnostics = await readPrivateRunDiagnostics(runtime, service, failed.diagnosticsId);
    expect(diagnostics.sections.attribution).toMatchObject({
      report: {
        requestId: accepted.requestId,
        status: "incomplete",
        missingSections: expect.arrayContaining([
          "generation",
          "deployment",
          "scripting-log-observation",
          "setup-row-readback",
          "bounded-loaded-game-readback",
        ]),
        sections: {
          source: expect.any(Object),
          manifest: expect.any(Object),
          terminalResult: expect.objectContaining({
            status: "failed",
            phase: "failed",
          }),
        },
      },
    });
  });

  test("writes one private generation manifest before the generator port starts", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-generation-manifest-runtime-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const events: StudioEvent[] = [];
    let manifestPathDuringGeneration: string | undefined;
    let manifestDigestDuringGeneration: string | undefined;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        generateRunInGameMod: async ({ generationManifest }) => {
          const manifestPath = generationManifest.path;
          const manifest = await readStudioRunGenerationManifest(manifestPath);
          manifestPathDuringGeneration = manifestPath;
          manifestDigestDuringGeneration = manifest.generationManifestDigest;
          return {
            materialization: {
              generationManifestDigest: generationManifest.generationManifestDigest,
              runArtifactId: manifest.payload.runArtifactId,
              generatedModRoot: resolve(workspaceRoot, manifest.payload.requestId, "generated-mod"),
              generatedModFileCount: 7,
              generatedModDigest: "sha256-generated-mod",
              mapRowId: "MAP_STUDIO_RUN",
            },
          };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(
        runInGameInput({
          config: { alpha: { z: 1, a: 2 } },
        })
      )
    );

    await expect.poll(() => manifestPathDuringGeneration).toBeDefined();
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    const manifestPath = resolve(workspaceRoot, accepted.requestId, "generation-manifest.json");
    expect(manifestPathDuringGeneration).toBe(manifestPath);
    const manifest = await readStudioRunGenerationManifest(manifestPath);
    expect(manifest.generationManifestDigest).toBe(manifestDigestDuringGeneration);
    expect(manifest.payload).toMatchObject({
      requestId: accepted.requestId,
      workspace: {
        requestRoot: `.mapgen-studio/run-in-game/${accepted.requestId}`,
        generationManifestPath: "generation-manifest.json",
        generatedModRoot: "generated-mod",
      },
      launchEnvelope: {
        seed: 43,
        worldSettings: { mapSize: "MAPSIZE_STANDARD" },
        canonicalConfig: {
          id: "studio-current",
          name: "Studio Current",
          config: {
            alpha: { a: 2, z: 1 },
          },
        },
      },
    });

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const current = await runtime.runPromise(service.operationsCurrent);
    const publicEvents = events.filter(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId
    );
    for (const publicValue of [accepted, status, current, ...publicEvents]) {
      expect(JSON.stringify(publicValue)).not.toMatch(
        /generationManifest|runArtifactId|RunCorrelation|launchEnvelope|canonicalConfigDigest/
      );
    }

    const privateOperation = await readPrivateRunOperation(
      runtime,
      service,
      accepted.diagnosticsId
    );
    expect(privateOperation.generationManifest).toMatchObject({
      path: manifestPath,
      generationManifestDigest: manifest.generationManifestDigest,
      runArtifactId: manifest.payload.runArtifactId,
    });
    expect(
      (
        privateOperation.generationManifest as {
          correlation?: Record<string, unknown>;
        }
      ).correlation
    ).toMatchObject({
      requestId: accepted.requestId,
      runArtifactId: manifest.payload.runArtifactId,
      generationManifestDigest: manifest.generationManifestDigest,
    });
    expect(privateOperation.materialization).toMatchObject({
      generationManifestDigest: manifest.generationManifestDigest,
      runArtifactId: manifest.payload.runArtifactId,
      generatedModFileCount: 7,
      generatedModDigest: "sha256-generated-mod",
      mapRowId: "MAP_STUDIO_RUN",
    });
    const privateDiagnostics = await readPrivateRunDiagnostics(
      runtime,
      service,
      accepted.diagnosticsId
    );
    for (const privateValue of [privateOperation, privateDiagnostics]) {
      expect(hasRecursiveKey(privateValue, "launchEnvelope")).toBe(false);
      expect(hasRecursiveKey(privateValue, "canonicalConfig")).toBe(false);
      expect(hasRecursiveKey(privateValue, "rawRequest")).toBe(false);
      expect(JSON.stringify(privateValue)).not.toContain("never-persist-outside-manifest");
    }
  });

  test("records Run in Game deployment and deployed snapshot only in private diagnostics", async () => {
    const events: StudioEvent[] = [];
    const observedDeploymentDigests: string[] = [];
    const observeDeployment = (
      deployment: Awaited<ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>>
    ) => {
      observedDeploymentDigests.push(
        `${deployment.runDeployment.deployedModId}:${deployment.runDeployment.generatedModDigest}:${deployment.deployedSnapshot.digest}`
      );
    };
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        deployRunInGame: async ({ requestId, generatedMod }) => {
          const generatedModRoot = "/tmp/studio-generated-run";
          const generatedModDigest = "sha256-generated-tree";
          return {
            materialization: {
              ...generatedMod.materialization,
              generatedModRoot,
              generatedModDigest,
            },
            runDeployment: {
              requestId,
              deployedModId: "mod-swooper-studio-run",
              generatedModRoot,
              generatedModDigest,
              targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
              startedAt: "2026-06-10T00:00:00.000Z",
              completedAt: "2026-06-10T00:00:01.000Z",
              filesCopied: 3,
            },
            deployedSnapshot: {
              requestId,
              deployedModId: "mod-swooper-studio-run",
              targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
              observedAt: "2026-06-10T00:00:01.000Z",
              fileCount: 3,
              digest: generatedModDigest,
              files: [
                {
                  path: "maps/studio-run.js",
                  sha256: "sha256-map-script",
                  sizeBytes: 512,
                },
                {
                  path: "maps/run-test.config.json",
                  sha256: "sha256-map-config",
                  sizeBytes: 128,
                },
                {
                  path: "modinfo.json",
                  sha256: "sha256-modinfo",
                  sizeBytes: 96,
                },
              ],
            },
          };
        },
        waitForRunInGameLogEvidence: async ({ deployment }) => {
          observeDeployment(deployment);
          return { result: { ok: true } };
        },
        buildRunInGameEvidence: async ({ deployment }) => {
          observeDeployment(deployment);
          return { result: { ok: true } };
        },
      },
      civ7: {
        startSinglePlayer: ({ deployment }) =>
          Effect.sync(() => {
            observeDeployment(deployment);
            return lifecycleStarted();
          }),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const current = await runtime.runPromise(service.operationsCurrent);
    const publicEvents = events.filter(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId
    );
    for (const publicValue of [accepted, status, current, ...publicEvents]) {
      expect(JSON.stringify(publicValue)).not.toMatch(
        /runDeployment|deployedSnapshot|targetRoot|generatedModRoot|deployedModId|generatedModDigest|filesCopied/
      );
    }
    expect(observedDeploymentDigests).toEqual(
      Array(3).fill("mod-swooper-studio-run:sha256-generated-tree:sha256-generated-tree")
    );

    const privateOperation = await readPrivateRunOperation(
      runtime,
      service,
      accepted.diagnosticsId
    );
    expect(privateOperation.deploymentEvidence?.runDeployment).toMatchObject({
      requestId: accepted.requestId,
      deployedModId: "mod-swooper-studio-run",
      generatedModDigest: "sha256-generated-tree",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      filesCopied: 3,
    });
    expect(privateOperation.deploymentEvidence?.deployedSnapshot).toMatchObject({
      requestId: accepted.requestId,
      deployedModId: "mod-swooper-studio-run",
      fileCount: 3,
      digest: "sha256-generated-tree",
      files: [
        { path: "maps/studio-run.js", sha256: "sha256-map-script", sizeBytes: 512 },
        { path: "maps/run-test.config.json", sha256: "sha256-map-config", sizeBytes: 128 },
        { path: "modinfo.json", sha256: "sha256-modinfo", sizeBytes: 96 },
      ],
    });
  });

  test("rejects raw-control Run in Game payloads before admission", async () => {
    const events: StudioEvent[] = [];
    let generationCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(
        runtime,
        service.runInGameStart(
          runInGameInput({
            config: { nested: { rawJs: "UI.notifyUIReady()" } },
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      diagnostics: {
        code: "run-in-game-raw-control-rejected",
        field: "rawJs",
      },
    });

    const current = await runtime.runPromise(service.operationsCurrent);
    expect(events).toEqual([]);
    expect(generationCalls).toBe(0);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toEqual([]);
  });

  test("rejects missing Run in Game canonical config before admission", async () => {
    const events: StudioEvent[] = [];
    let generationCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(
        runtime,
        service.runInGameStart(
          runInGameInput({
            invalidCanonicalConfig: {},
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      diagnostics: { code: "run-in-game-canonical-config-invalid" },
    });

    const current = await runtime.runPromise(service.operationsCurrent);
    expect(events).toEqual([]);
    expect(generationCalls).toBe(0);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toEqual([]);
  });

  test("rejects a complete config envelope without admitted latitude bounds", async () => {
    const events: StudioEvent[] = [];
    let generationCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(
        runtime,
        service.runInGameStart(
          runInGameInput({
            invalidCanonicalConfig: {
              id: "studio-current",
              name: "Studio Current",
              description: "Incomplete config envelope.",
              recipe: "standard",
              sortIndex: 9999,
              config: {},
            },
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      diagnostics: { code: "run-in-game-canonical-config-invalid" },
    });
    expect(generationCalls).toBe(0);
    expect(events).toEqual([]);
  });

  test("rejects unknown keys in a complete config envelope", async () => {
    const events: StudioEvent[] = [];
    let generationCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(
        runtime,
        service.runInGameStart(
          runInGameInput({
            invalidCanonicalConfig: {
              ...testCanonicalConfig({
                id: "studio-current",
                name: "Studio Current",
              }).canonicalConfig,
              unexpected: "unknown-envelope-key",
            },
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      diagnostics: { code: "run-in-game-canonical-config-invalid" },
    });

    const current = await runtime.runPromise(service.operationsCurrent);
    expect(events).toEqual([]);
    expect(generationCalls).toBe(0);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toEqual([]);
  });

  test.each([
    "",
    "   ",
    "{swooper-maps}/maps/bad\nscript.js",
    "bad\rscript.js",
    "bad\0script.js",
  ])("rejects invalid Run in Game setup mapScript before admission: %j", async (mapScript) => {
    const events: StudioEvent[] = [];
    let generationCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(
        runtime,
        service.runInGameStart(
          runInGameInput({
            setupConfig: {
              mapScript,
              gameOptions: {},
              playerOptions: [{ playerId: 0, options: {} }],
            },
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      diagnostics: {
        code: "run-in-game-map-script-invalid",
        field: "setupConfig.mapScript",
      },
    });

    const current = await runtime.runPromise(service.operationsCurrent);
    expect(events).toEqual([]);
    expect(generationCalls).toBe(0);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toEqual([]);
  });

  test.each([
    {
      label: "an empty id",
      savedConfig: {
        id: "",
        displayName: "Test Config",
        fileName: "Test.Civ7Cfg",
        path: "/tmp/Test.Civ7Cfg",
      },
    },
    {
      label: "an empty display name",
      savedConfig: {
        id: "test-config",
        displayName: "   ",
        fileName: "Test.Civ7Cfg",
        path: "/tmp/Test.Civ7Cfg",
      },
    },
    {
      label: "a non-Civ7Cfg filename",
      savedConfig: {
        id: "test-config",
        displayName: "Test Config",
        fileName: "Test.json",
        path: "/tmp/Test.json",
      },
    },
    {
      label: "a multiline path",
      savedConfig: {
        id: "test-config",
        displayName: "Test Config",
        fileName: "Test.Civ7Cfg",
        path: "/tmp/Test.Civ7Cfg\nother",
      },
    },
  ])("rejects saved configuration with $label before lifecycle admission", async ({
    savedConfig,
  }) => {
    let generationCalls = 0;
    let lifecycleCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
      },
      civ7: {
        startSinglePlayer: () => {
          lifecycleCalls += 1;
          return Effect.succeed(lifecycleStarted());
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(
        runtime,
        service.runInGameStart(
          runInGameInput({
            setupConfig: {
              savedConfig,
              gameOptions: {},
              playerOptions: [{ playerId: 0, options: {} }],
            },
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      recoveryActions: ["edit-config", "copy-diagnostics"],
      diagnostics: {
        code: "run-in-game-saved-config-invalid",
        field: "setupConfig.savedConfig",
      },
    });
    expect(generationCalls).toBe(0);
    expect(lifecycleCalls).toBe(0);
  });

  test("preserves a valid setup mapScript in the canonical prepared request", async () => {
    const mapScript = "{swooper-maps}/maps/studio-current.js";
    let observedMapScript: string | undefined;
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod, prepared }) => {
          observedMapScript = prepared.request.setupConfig?.mapScript;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(
        runInGameInput({
          setupConfig: {
            mapScript,
            gameOptions: {},
            playerOptions: [{ playerId: 0, options: {} }],
          },
        })
      )
    );

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");
    expect(observedMapScript).toBe(mapScript);
  });

  test("keeps failed Run in Game projections schema-valid after live-shaped diagnostics", async () => {
    const events: StudioEvent[] = [];
    let observedSeed: number | undefined;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        deployRunInGame: async ({ prepared }) => {
          observedSeed = prepared.request.seed;
          throw invalidRequest({
            message: "Run in Game start is missing map script, map size, or seed",
            diagnostics: {
              code: "run-in-game-start-input-missing",
              requestId: "run-live-shaped",
              materialization: JSON.stringify({
                mode: "disposable",
                path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
                mapScript: "{swooper-maps}/maps/studio-current.js",
              }),
              mapSize: prepared.request.mapSize ?? "",
              seed: prepared.request.seed ?? "",
            },
          });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(runInGameInput({ seed: "43" }))
    );

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase === "failed" && status.diagnosticsId === accepted.diagnosticsId;
      })
      .toBe(true);

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const current = await runtime.runPromise(service.operationsCurrent);
    expect(observedSeed).toBe(43);
    expect(status.safeFailureCategory).toBe("request-validation");
    expect(status.diagnosticsId).toBe(accepted.diagnosticsId);
    const privateOperation = await readPrivateRunOperation(runtime, service, status.diagnosticsId);
    expect(privateOperation.failure?.diagnostics?.materialization).toContain("studio-current.js");
    expectTypeboxValid(operationStatusTypeSchema, status);
    expectTypeboxValid(typeboxOutputSchemaFromContractProcedure(operationsCurrent), current);
    await expect
      .poll(() =>
        events.some(
          (event) =>
            event.type === "operation" &&
            event.kind === "run-in-game" &&
            event.status.requestId === accepted.requestId &&
            event.status.phase === "failed"
        )
      )
      .toBe(true);
    const terminalEvent = events.find(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId &&
        event.status.phase === "failed"
    );
    expectTypeboxValid(studioEventSchema, terminalEvent);
  });

  test("blocks a second Run in Game while the runtime ownership lease is held", async () => {
    const events: StudioEvent[] = [];
    const blocker = deferred<void>();
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await blocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });

    const service = await runtime.runPromise(StudioOperationRuntime);
    const first = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect(
      expectFailure(runtime, service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      tag: "OperationBlocked",
      activeRequestId: first.requestId,
    });

    blocker.resolve();
    await expect
      .poll(async () => {
        return events.some(
          (event) =>
            event.type === "operation" &&
            event.kind === "run-in-game" &&
            event.status.requestId === first.requestId &&
            event.status.phase === "completed"
        );
      })
      .toBe(true);

    const repeatAfterComplete = await startRunInGameWhenLeaseReleased(runtime, service);
    expect(repeatAfterComplete.requestId).not.toBe(first.requestId);
    expect(repeatAfterComplete).toMatchObject({ status: "running" });
  });

  test("starts a fresh same-content request after a failed terminal record", async () => {
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async () => {
          throw new Error("deploy failed before launch");
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const first = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(
        async () => {
          const status = await runtime.runPromise(
            service.runInGameStatus({ requestId: first.requestId })
          );
          return status.status === "running" ? "running" : "terminal";
        },
        { timeout: 5_000 }
      )
      .toBe("terminal");

    const repeatAfterFailure = await startRunInGameWhenLeaseReleased(runtime, service);
    expect(repeatAfterFailure.requestId).not.toBe(first.requestId);
    expect(repeatAfterFailure).toMatchObject({ status: "running" });
  }, 10_000);

  test("rejects cross-operation mutation while a worker is active", async () => {
    const blocker = deferred<void>();
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await blocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });

    const service = await runtime.runPromise(StudioOperationRuntime);
    const run = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect(
      expectFailure(
        runtime,
        service.saveDeployStart({
          requestId: "save-1",
          canonicalConfig: testSaveDeployCanonicalConfig(),
        })
      )
    ).resolves.toMatchObject({
      tag: "OperationBlocked",
      activeRequestId: run.requestId,
    });
    blocker.resolve();
  });

  test("reports deployed Studio-run mod ownership while Run in Game holds the runtime lease", async () => {
    const blocker = deferred<void>();
    const runInGameWorkspaceRoot = join(
      tmpdir(),
      `studio-operation-runtime-lease-evidence-${process.pid}-${++runtimeWorkspaceSequence}`
    );
    runtimeWorkspaceRoots.push(runInGameWorkspaceRoot);
    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot,
        deployRunInGame: async ({ requestId, generatedMod }) =>
          runInGameDeployment({
            requestId,
            materialization: {
              ...generatedMod.materialization,
              generatedModRoot: "/tmp/studio-generated-run",
              generatedModDigest: "sha256-generated-tree",
            },
            filesCopied: 3,
            files: [
              { path: "maps/studio-run.js", sha256: "sha256-map-script", sizeBytes: 512 },
              { path: "maps/run-test.config.json", sha256: "sha256-map-config", sizeBytes: 128 },
              { path: "modinfo.json", sha256: "sha256-modinfo", sizeBytes: 96 },
            ],
          }),
        buildRunInGameEvidence: async () => {
          await blocker.promise;
          return { result: { ok: true } };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const run = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: run.requestId })
        );
        return status.phase;
      })
      .toBe("observing-runtime");

    const lease = JSON.parse(
      await readFile(
        join(runInGameWorkspaceRoot, "_runtime", "runtime-ownership-lease.json"),
        "utf8"
      )
    ) as Record<string, unknown>;
    expect(lease).toMatchObject({
      ownerKind: "run-in-game",
      requestId: run.requestId,
      deployedModId: "mod-swooper-studio-run",
    });

    await expect(
      expectFailure(
        runtime,
        service.saveDeployStart({
          requestId: "save-while-run-owns-studio-mod",
          canonicalConfig: testSaveDeployCanonicalConfig(),
        })
      )
    ).resolves.toMatchObject({
      tag: "OperationBlocked",
      activeRequestId: run.requestId,
      diagnostics: {
        code: "studio-operation-active",
      },
    });

    blocker.resolve();
  });

  test("fails before Civ7 control when deployed-mod lease evidence cannot attach", async () => {
    let evidenceCalls = 0;
    const runInGameWorkspaceRoot = join(
      tmpdir(),
      `studio-operation-runtime-lease-attach-failure-${process.pid}-${++runtimeWorkspaceSequence}`
    );
    runtimeWorkspaceRoots.push(runInGameWorkspaceRoot);
    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot,
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await rm(join(runInGameWorkspaceRoot, "_runtime", "runtime-ownership-lease.json"), {
            force: true,
          });
          return runInGameDeployment({
            requestId,
            materialization: generatedMod.materialization,
          });
        },
        buildRunInGameEvidence: async () => {
          evidenceCalls += 1;
          return { result: { ok: true } };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const run = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: run.requestId })
        );
        return status.status === "running" ? "running" : "terminal";
      })
      .toBe("terminal");

    const failed = await readPublicRunStatusWithDiagnostics(runtime, service, run);
    expect(failed).toMatchObject({
      requestId: run.requestId,
      status: "failed",
      phase: "failed",
      safeFailureCategory: "dependency-unavailable",
      diagnosticsId: run.diagnosticsId,
    });
    const privateOperation = await readPrivateRunOperation(runtime, service, failed.diagnosticsId);
    expect(privateOperation.failure).toMatchObject({
      diagnostics: {
        code: "runtime-lease-deployment-evidence-unavailable",
        requestId: run.requestId,
        deployedModId: "mod-swooper-studio-run",
        failedAtPhase: "deploying",
      },
    });
    expect(privateOperation.deploymentEvidence?.runDeployment.deployedModId).toBe(
      "mod-swooper-studio-run"
    );
    expect(evidenceCalls).toBe(0);
  });

  test("blocks Run in Game while Save/Deploy owns the runtime lease", async () => {
    const blocker = deferred<void>();
    let generationCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        prepareSaveDeployStart: async () => {
          await blocker.promise;
          return {};
        },
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const save = await runtime.runPromise(
      service.saveDeployStart(saveDeployInput("save-blocks-run"))
    );
    await expect(
      expectFailure(runtime, service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      tag: "OperationBlocked",
      activeRequestId: save.requestId,
    });
    expect(generationCalls).toBe(0);

    blocker.resolve();
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: save.requestId })
        );
        return status.phase;
      })
      .toBe("complete");
    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("blocked starts do not call mutation leaf ports", async () => {
    const blocker = deferred<void>();
    let savePrepareCalls = 0;
    let autoplayCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod }) => {
          await blocker.promise;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
        prepareSaveDeployStart: async () => {
          savePrepareCalls += 1;
          return {};
        },
      },
      civ7: {
        runAutoplay: (input) =>
          Effect.sync(() => {
            autoplayCalls += 1;
            return {
              ok: true,
              action: input.action,
              autoplay: {},
              game: {},
              gameContext: {},
              result: {},
            };
          }),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect(
      expectFailure(runtime, service.saveDeployStart(saveDeployInput("save-1")))
    ).resolves.toMatchObject({ tag: "OperationBlocked" });
    await expect(
      expectFailure(runtime, service.autoplay({ action: "start" }))
    ).resolves.toMatchObject({
      tag: "OperationBlocked",
    });

    expect(savePrepareCalls).toBe(0);
    expect(autoplayCalls).toBe(0);
    blocker.resolve();
  });

  test("Save/Deploy prepare leaf cannot regain request identity authority", async () => {
    const observed: {
      saveRequestId?: string;
      deployRequestId?: string;
      preparedRequestId?: unknown;
    } = {};
    const { runtime } = makeRuntime({
      ports: {
        prepareSaveDeployStart: async () =>
          ({ path: "configs/test.json", requestId: "leaf-owned-save-id" }) as {
            path: string;
            requestId: string;
          },
        saveMapConfig: async ({ requestId, prepared }) => {
          observed.saveRequestId = requestId;
          observed.preparedRequestId = (prepared as { requestId?: unknown }).requestId;
          return { path: prepared.path, saved: true };
        },
        deploySavedMapConfig: async ({ requestId }) => {
          observed.deployRequestId = requestId;
          return { deployed: true };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart(saveDeployInput("runtime-save-id"))
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    expect(observed.saveRequestId).toBe("runtime-save-id");
    expect(observed.deployRequestId).toBe("runtime-save-id");
    expect(observed.preparedRequestId).toBeUndefined();
  });

  test("snapshots Save/Deploy config input before asynchronous leaf work", async () => {
    const entered = deferred<void>();
    const release = deferred<void>();
    let observedInput: StudioInputs["mapConfigs"]["saveDeploy"] | undefined;
    const { runtime } = makeRuntime({
      ports: {
        prepareSaveDeployStart: async ({ input }) => {
          observedInput = input;
          entered.resolve();
          await release.promise;
          return {};
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    const mutableConfig: { nested?: { label: string } } = {};
    const mutableInput = {
      requestId: "save-snapshot",
      canonicalConfig: {
        ...testSaveDeployCanonicalConfig(),
        config: mutableConfig,
      },
    };

    await runtime.runPromise(service.saveDeployStart(mutableInput));
    await entered.promise;
    mutableConfig.nested = { label: "after" };

    expect(observedInput).toBeDefined();
    expect(observedInput).not.toBe(mutableInput);
    expect(observedInput?.canonicalConfig).not.toBe(mutableInput.canonicalConfig);
    expect(observedInput?.canonicalConfig.config).toEqual({});
    expect(Object.isFrozen(observedInput)).toBe(true);
    expect(Object.isFrozen(observedInput?.canonicalConfig)).toBe(true);
    release.resolve();
  });

  test("Save/Deploy leaf failure projects terminal state and releases the mutation gate", async () => {
    const events: StudioEvent[] = [];
    let rollbackCalls = 0;
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        prepareSaveDeployStart: async () => ({
          path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
          cleanup: async () => {
            cleanupCalls += 1;
          },
        }),
        deploySavedMapConfig: async () => {
          throw new Error("deploy failed");
        },
        rollbackSaveDeploy: async () => {
          rollbackCalls += 1;
          return {
            path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
            restored: true,
          };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart(saveDeployInput("save-fail"))
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("failed");

    const failed = await runtime.runPromise(
      service.saveDeployStatus({ requestId: accepted.requestId })
    );
    expect(failed).toMatchObject({
      ok: false,
      requestId: "save-fail",
      phase: "failed",
      status: "failed",
      saved: true,
      deployed: false,
      safeFailureCategory: "deployment",
    });
    expect(JSON.stringify(failed)).not.toMatch(
      /deploy failed|rollback|path|details|error|stdout|stderr/
    );
    expect(rollbackCalls).toBe(1);
    expect(cleanupCalls).toBe(1);
    await expect.poll(() => terminalSaveDeployEvents(events, accepted.requestId).length).toBe(1);

    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("Save/Deploy rollback failure projects one rollback terminal state", async () => {
    const events: StudioEvent[] = [];
    let rollbackCalls = 0;
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        prepareSaveDeployStart: async () => ({
          path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
          cleanup: async () => {
            cleanupCalls += 1;
          },
        }),
        deploySavedMapConfig: async () => {
          throw new Error("deploy failed");
        },
        rollbackSaveDeploy: async () => {
          rollbackCalls += 1;
          throw new Error("restore failed");
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart(saveDeployInput("save-rollback-fail"))
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("failed");

    const failed = await runtime.runPromise(
      service.saveDeployStatus({ requestId: accepted.requestId })
    );
    expect(failed).toMatchObject({
      ok: false,
      requestId: "save-rollback-fail",
      phase: "failed",
      status: "failed",
      saved: true,
      deployed: false,
      safeFailureCategory: "cleanup",
    });
    expect(JSON.stringify(failed)).not.toMatch(/restore failed|path|details|error/);
    expect(rollbackCalls).toBe(1);
    expect(cleanupCalls).toBe(1);
    await expect.poll(() => terminalSaveDeployEvents(events, accepted.requestId)).toHaveLength(1);

    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("Save/Deploy cleanup failure projects one cleanup terminal state without retry", async () => {
    const events: StudioEvent[] = [];
    let rollbackCalls = 0;
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        prepareSaveDeployStart: async () => ({
          path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
          cleanup: async () => {
            cleanupCalls += 1;
            throw new Error("cleanup failed");
          },
        }),
        deploySavedMapConfig: async () => {
          throw new Error("deploy failed");
        },
        rollbackSaveDeploy: async () => {
          rollbackCalls += 1;
          return {
            path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
            restored: true,
          };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart(saveDeployInput("save-cleanup-fail"))
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("failed");

    const failed = await runtime.runPromise(
      service.saveDeployStatus({ requestId: accepted.requestId })
    );
    expect(failed).toMatchObject({
      ok: false,
      requestId: "save-cleanup-fail",
      phase: "failed",
      status: "failed",
      saved: true,
      deployed: false,
      safeFailureCategory: "deployment",
    });
    expect(JSON.stringify(failed)).not.toMatch(
      /cleanup failed|deploy failed|path|cause|details|error/
    );
    expect(rollbackCalls).toBe(1);
    expect(cleanupCalls).toBe(1);
    expect(terminalSaveDeployEvents(events, accepted.requestId)).toHaveLength(1);

    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("Run in Game worker failures are classified by lifecycle phase", async () => {
    const cases: Array<{
      requestId: string;
      input?: Partial<StudioInputs["runInGame"]["start"]>;
      ports?: Partial<StudioOperationRuntimePorts>;
      civ7?: Partial<Civ7WorkflowControlApi>;
      expected: {
        status: "failed" | "uncertain";
        safeFailureCategory: string;
        code: string;
        reason: string;
        failedAtPhase: string;
        recoveryActions?: string[];
      };
    }> = [
      {
        requestId: "run-generation-fail",
        ports: {
          generateRunInGameMod: async () => {
            throw new Error("generation failed");
          },
        },
        expected: {
          status: "failed",
          safeFailureCategory: "artifact-generation",
          code: "run-in-game-materialization-failed",
          reason: "materialization-evidence-missing",
          failedAtPhase: "materializing",
        },
      },
      {
        requestId: "run-deploy-fail",
        ports: {
          deployRunInGame: async () => {
            throw new Error("deploy failed");
          },
        },
        expected: {
          status: "failed",
          safeFailureCategory: "deployment",
          code: "run-in-game-deploy-failed",
          reason: "deploy-failed",
          failedAtPhase: "deploying",
          recoveryActions: ["inspect-deploy-output"],
        },
      },
      {
        requestId: "run-setup-row-fail",
        civ7: {
          startSinglePlayer: () =>
            Effect.fail(new Error("Civ7 setup cannot see {swooper-maps}/maps/studio-current.js")),
        },
        expected: {
          status: "uncertain",
          safeFailureCategory: "runtime-control",
          code: "run-in-game-start-game-failed",
          reason: "start-game-failed",
          failedAtPhase: "starting-game",
          recoveryActions: ["retry-status"],
        },
      },
      {
        requestId: "run-start-game-fail",
        civ7: {
          startSinglePlayer: () => Effect.fail(new Error("start game failed")),
        },
        expected: {
          status: "uncertain",
          safeFailureCategory: "runtime-control",
          code: "run-in-game-start-game-failed",
          reason: "start-game-failed",
          failedAtPhase: "starting-game",
          recoveryActions: ["retry-status"],
        },
      },
      {
        requestId: "run-log-evidence-fail",
        ports: {
          waitForRunInGameLogEvidence: async () => {
            throw new Error("log evidence missing");
          },
        },
        expected: {
          status: "uncertain",
          safeFailureCategory: "runtime-observation",
          code: "run-in-game-log-evidence-missing",
          reason: "log-evidence-missing",
          failedAtPhase: "collecting-evidence",
        },
      },
      {
        requestId: "run-loaded-game-readback-fail",
        ports: {
          observeRunInGameRuntime: async () => {
            throw verificationFailed({
              message: "Loaded game readback did not match",
              reason: "exact-authorship-mismatch",
              diagnostics: {
                code: "run-in-game-loaded-readback-mismatch",
                failedAtPhase: "collecting-evidence",
              },
            });
          },
        },
        expected: {
          status: "uncertain",
          safeFailureCategory: "runtime-observation",
          code: "run-in-game-loaded-readback-mismatch",
          reason: "exact-authorship-mismatch",
          failedAtPhase: "collecting-evidence",
        },
      },
    ];

    for (const entry of cases) {
      const { runtime } = makeRuntime({
        ports: entry.ports,
        civ7: entry.civ7,
      });
      const service = await runtime.runPromise(StudioOperationRuntime);

      const accepted = await runtime.runPromise(
        service.runInGameStart(
          runInGameInput({
            requestId: entry.requestId,
            ...(entry.input ?? {}),
          })
        )
      );
      await expect
        .poll(async () => {
          const status = await runtime.runPromise(
            service.runInGameStatus({ requestId: accepted.requestId })
          );
          return status.status === "running" ? "running" : "terminal";
        })
        .toBe("terminal");
      await expect
        .poll(async () => {
          const status = await runtime.runPromise(
            service.runInGameStatus({ requestId: accepted.requestId })
          );
          return status.diagnosticsId;
        })
        .toBe(accepted.diagnosticsId);

      const failed = await runtime.runPromise(
        service.runInGameStatus({ requestId: accepted.requestId })
      );
      expect(failed).toMatchObject({
        requestId: accepted.requestId,
        phase: "failed",
        status: "failed",
        safeFailureCategory: entry.expected.safeFailureCategory,
        diagnosticsId: accepted.diagnosticsId,
      });
      for (const action of entry.expected.recoveryActions ?? []) {
        expect(failed.recoveryActions).toContain(action);
      }
      const privateOperation = await readPrivateRunOperation(
        runtime,
        service,
        failed.diagnosticsId
      );
      expect(privateOperation.status).toBe(entry.expected.status);
      expect(privateOperation.failedAtPhase).toBe(entry.expected.failedAtPhase);
      expect(privateOperation.failure).toMatchObject({
        reason: entry.expected.reason,
        diagnostics: {
          code: entry.expected.code,
          failedAtPhase: entry.expected.failedAtPhase,
        },
      });
      if (entry.expected.status === "uncertain") {
        expect(failed.recoveryActions).toContain("retry-status");
        expect(failed.recoveryActions).not.toContain("retry-run");
        expect(privateOperation.failure?.diagnostics).toMatchObject({ noRepeat: true });
      }
      expectTypeboxValid(operationStatusTypeSchema, failed);
    }
  });

  test("keeps setup-map-row-mismatched private while public Run in Game status is safe", async () => {
    const { runtime } = makeRuntime({
      civ7: {
        startSinglePlayer: () =>
          Effect.fail(
            verificationFailed({
              message: "Civ7 selected a different setup map row than the generated Studio Run map.",
              reason: "exact-authorship-mismatch",
              recoveryActions: ["retry-status", "copy-diagnostics"],
              diagnostics: {
                code: "setup-map-row-mismatched",
                setupFailureReason: "setup-map-row-mismatched",
                mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
                observedMapScripts: ["{base-standard}/maps/continents.js"],
                noRepeat: true,
              },
            })
          ),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(runInGameInput({ requestId: "run-setup-mismatch-private" }))
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("failed");

    const status = await readPublicRunStatusWithDiagnostics(runtime, service, accepted);
    const publicPayload = JSON.stringify(status);
    expect(status).toMatchObject({
      safeFailureCategory: "runtime-observation",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(status.recoveryActions).not.toContain("retry-run");
    expect(publicPayload).not.toMatch(
      /setup-map-row-mismatched|observedMapScripts|base-standard|mapScript|mod-swooper-studio-run/
    );

    const diagnostics = await readPrivateRunDiagnostics(runtime, service, status.diagnosticsId);
    expect(diagnostics.sections.setupFailure).toMatchObject({
      setupPhase: "starting-game",
      setupFailureReason: "setup-map-row-mismatched",
      observedMapScripts: ["{base-standard}/maps/continents.js"],
    });
    expect(diagnostics.sections.operation).toMatchObject({
      status: "uncertain",
      failure: { diagnostics: { noRepeat: true } },
    });
  });

  test("maps Run in Game status misses to request-owned safe not-found failures", async () => {
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    const failure = await expectFailure(runtime, service.runInGameStatus({ requestId: "missing" }));
    expect(failure).toMatchObject({
      tag: "OperationNotFound",
      requestId: "missing",
    });
    expect(failure).not.toHaveProperty("serverInstanceId");
    expect(failure).not.toHaveProperty("serverStartedAt");
  });

  test("scoped disposal drains lifecycle work before releasing mutation ownership", async () => {
    const lifecycleStarted = deferred<void>();
    const lifecycleInterrupted = deferred<void>();
    const lifecycleMutation = deferred<never>();
    const lifecycleDrain = deferred<void>();
    const events: StudioEvent[] = [];
    const runInGameWorkspaceRoot = join(
      tmpdir(),
      `studio-operation-runtime-disposal-drain-${process.pid}-${++runtimeWorkspaceSequence}`
    );
    runtimeWorkspaceRoots.push(runInGameWorkspaceRoot);
    const awaitLifecycleMutation = Effect.promise(() => lifecycleMutation.promise);
    const awaitLifecycleDrain = Effect.promise(() => lifecycleDrain.promise);
    const drainInterruptedLifecycle = Effect.sync(() => lifecycleInterrupted.resolve()).pipe(
      Effect.zipRight(awaitLifecycleDrain)
    );
    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot,
      },
      civ7: {
        startSinglePlayer: () =>
          Effect.sync(() => lifecycleStarted.resolve()).pipe(
            Effect.zipRight(awaitLifecycleMutation),
            Effect.onInterrupt(() => drainInterruptedLifecycle)
          ),
      },
      eventSink: events,
    });

    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("starting-game");
    await lifecycleStarted.promise;

    const leasePath = join(runInGameWorkspaceRoot, "_runtime", "runtime-ownership-lease.json");
    const disposal = runtime.dispose();
    let disposed = false;
    void disposal.then(() => {
      disposed = true;
    });
    await lifecycleInterrupted.promise;
    await Promise.resolve();

    expect(disposed).toBe(false);
    await expect(pathExists(leasePath)).resolves.toBe(true);
    expect(
      operationPhases(events, accepted.requestId).filter((phase) => phase === "failed")
    ).toEqual([]);
    await expect(
      Effect.runPromise(service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toMatchObject({ phase: "starting-game", status: "running" });

    lifecycleDrain.resolve();
    await disposal;

    await expect(pathExists(leasePath)).resolves.toBe(false);
    expect(
      operationPhases(events, accepted.requestId).filter((phase) => phase === "failed")
    ).toEqual(["failed"]);

    await expect(
      Effect.runPromise(Effect.either(service.runInGameStatus({ requestId: accepted.requestId })))
    ).resolves.toMatchObject({
      _tag: "Right",
      right: {
        requestId: accepted.requestId,
        phase: "failed",
        status: "failed",
        safeFailureCategory: "dependency-unavailable",
        diagnosticsId: accepted.diagnosticsId,
      },
    });
    await expect(
      expectEffectFailure(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      tag: "RuntimeDisposed",
      reason: "runtime-disposed",
    });
    await expect(
      Effect.runPromise(
        service.runInGameDiagnostics({ diagnosticsId: accepted.diagnosticsId ?? "missing" })
      )
    ).resolves.toMatchObject({
      ok: true,
      diagnostics: {
        sections: {
          operation: {
            status: "uncertain",
            failedAtPhase: "starting-game",
            failure: { diagnostics: { noRepeat: true } },
          },
        },
      },
    });
  });

  test("daemon startup terminalizes abandoned Run in Game records and releases stale lease", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-ownership-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const requestId = "studio-run-in-game-abandoned";
    const diagnosticsId = "run-diagnostics-abandoned";
    const leaseId = "runtime-lease-abandoned";
    await mkdir(join(workspaceRoot, requestId), { recursive: true });
    await mkdir(join(workspaceRoot, "_runtime"), { recursive: true });
    await writeFile(
      join(workspaceRoot, requestId, "operation-record.json"),
      `${JSON.stringify(
        {
          recordType: "RunOperationRecord",
          requestId,
          daemonId: "studio-server-previous",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          leaseId,
          phase: "collecting-evidence",
          status: "running",
          operationRevision: 3,
          diagnosticsId,
          createdAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      join(workspaceRoot, "_runtime", "runtime-ownership-lease.json"),
      `${JSON.stringify(
        {
          leaseId,
          ownerKind: "run-in-game",
          requestId,
          daemonId: "studio-server-previous",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          processId: 999_999_999,
          acquiredAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const second = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        clock: { now: () => new Date("2026-06-10T00:00:01.000Z") },
      },
    });
    const secondService = await second.runtime.runPromise(StudioOperationRuntime);

    const abandoned = await second.runtime.runPromise(secondService.runInGameStatus({ requestId }));
    expect(abandoned).toMatchObject({
      requestId,
      status: "failed",
      phase: "failed",
      safeFailureCategory: "ownership",
      diagnosticsId,
    });
    expect(abandoned.recoveryActions).not.toContain("retry-run");
    const privateOperation = await readPrivateRunOperation(
      second.runtime,
      secondService,
      abandoned.diagnosticsId
    );
    expect(privateOperation.failure).toMatchObject({
      tag: "OperationBlocked",
      diagnostics: {
        code: "run-in-game-ownership-lost-after-restart",
        noRepeat: true,
      },
    });
    expect(privateOperation.status).toBe("uncertain");
    expect(privateOperation.failedAtPhase).toBe("collecting-evidence");

    await expect(
      second.runtime.runPromise(secondService.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      requestId: expect.not.stringMatching(requestId),
      status: "running",
    });
  });

  test("daemon startup terminalizes corrupt Run in Game records instead of losing them", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-corrupt-record-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const requestId = "studio-run-in-game-corrupt-record";
    await mkdir(join(workspaceRoot, requestId), { recursive: true });
    await writeFile(join(workspaceRoot, requestId, "operation-record.json"), "{", "utf8");

    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        clock: { now: () => new Date("2026-06-10T00:00:01.000Z") },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const recovered = await runtime.runPromise(service.runInGameStatus({ requestId }));
    expect(recovered).toMatchObject({
      requestId,
      status: "failed",
      phase: "failed",
      safeFailureCategory: "ownership",
      diagnosticsId: `run-diagnostics-corrupt-${requestId}`,
    });
    expect(recovered.recoveryActions).not.toContain("retry-run");
    const privateOperation = await readPrivateRunOperation(
      runtime,
      service,
      recovered.diagnosticsId
    );
    expect(privateOperation).toMatchObject({
      status: "uncertain",
      failure: {
        tag: "OperationBlocked",
        diagnostics: {
          code: "run-in-game-record-untrusted-after-restart",
          noRepeat: true,
        },
      },
    });
    expect(privateOperation.failedAtPhase).toBeUndefined();
    const entries = await readdir(join(workspaceRoot, requestId));
    expect(entries.some((entry) => entry.startsWith("operation-record.json.corrupt-"))).toBe(true);
    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("daemon startup treats retired running phases as untrusted mutation evidence", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-legacy-record-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const requestId = "studio-run-in-game-legacy-record";
    await mkdir(join(workspaceRoot, requestId), { recursive: true });
    await writeFile(
      join(workspaceRoot, requestId, "operation-record.json"),
      `${JSON.stringify(
        {
          recordType: "RunOperationRecord",
          requestId,
          daemonId: "studio-server-previous",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          leaseId: "runtime-lease-legacy-record",
          phase: "preparing-setup",
          status: "running",
          operationRevision: 3,
          diagnosticsId: "run-diagnostics-legacy-record",
          createdAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        clock: { now: () => new Date("2026-06-10T00:00:01.000Z") },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const recovered = await runtime.runPromise(service.runInGameStatus({ requestId }));
    expect(recovered).toMatchObject({
      requestId,
      status: "failed",
      phase: "failed",
      safeFailureCategory: "ownership",
      diagnosticsId: `run-diagnostics-corrupt-${requestId}`,
    });
    expect(recovered.recoveryActions).not.toContain("retry-run");
    const privateOperation = await readPrivateRunOperation(
      runtime,
      service,
      recovered.diagnosticsId
    );
    expect(privateOperation).toMatchObject({
      status: "uncertain",
      failure: {
        tag: "OperationBlocked",
        diagnostics: {
          code: "run-in-game-record-untrusted-after-restart",
          noRepeat: true,
        },
      },
    });
    expect(privateOperation.failedAtPhase).toBeUndefined();
    const entries = await readdir(join(workspaceRoot, requestId));
    expect(entries.some((entry) => entry.startsWith("operation-record.json.corrupt-"))).toBe(true);
  });

  test("daemon startup binds Run in Game records to their storage request id", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-mismatched-record-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const requestId = "studio-run-in-game-storage-key";
    await mkdir(join(workspaceRoot, requestId), { recursive: true });
    await writeFile(
      join(workspaceRoot, requestId, "operation-record.json"),
      `${JSON.stringify(
        {
          recordType: "RunOperationRecord",
          requestId: "studio-run-in-game-wrong-key",
          daemonId: "studio-server-previous",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          leaseId: "runtime-lease-mismatched-record",
          phase: "collecting-evidence",
          status: "running",
          operationRevision: 3,
          diagnosticsId: "run-diagnostics-mismatched-record",
          createdAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        clock: { now: () => new Date("2026-06-10T00:00:01.000Z") },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const recovered = await runtime.runPromise(service.runInGameStatus({ requestId }));
    expect(recovered).toMatchObject({
      requestId,
      status: "failed",
      phase: "failed",
      safeFailureCategory: "ownership",
      diagnosticsId: `run-diagnostics-corrupt-${requestId}`,
    });
    expect(recovered.diagnosticsId).not.toBe("not-safe-for-public-diagnostics");
    const entries = await readdir(join(workspaceRoot, requestId));
    expect(entries.some((entry) => entry.startsWith("operation-record.json.corrupt-"))).toBe(true);
  });

  test("daemon startup rejects persisted records with invalid diagnostics ids", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-invalid-record-fields-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const requestId = "studio-run-in-game-invalid-record-fields";
    await mkdir(join(workspaceRoot, requestId), { recursive: true });
    await writeFile(
      join(workspaceRoot, requestId, "operation-record.json"),
      `${JSON.stringify(
        {
          recordType: "RunOperationRecord",
          requestId,
          daemonId: "studio-server-previous",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          leaseId: "runtime-lease-invalid-record-fields",
          phase: "collecting-evidence",
          status: "running",
          operationRevision: 3,
          diagnosticsId: "not-safe-for-public-diagnostics",
          createdAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        clock: { now: () => new Date("2026-06-10T00:00:01.000Z") },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const recovered = await runtime.runPromise(service.runInGameStatus({ requestId }));
    expect(recovered).toMatchObject({
      requestId,
      status: "failed",
      phase: "failed",
      safeFailureCategory: "ownership",
    });
    const entries = await readdir(join(workspaceRoot, requestId));
    expect(entries.some((entry) => entry.startsWith("operation-record.json.corrupt-"))).toBe(true);
  });

  test("daemon startup does not release a live foreign runtime lease", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-live-ownership-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const blocker = deferred<void>();
    try {
      const first = makeRuntime({
        ports: {
          runInGameWorkspaceRoot: workspaceRoot,
          buildRunInGameEvidence: async () => {
            await blocker.promise;
            return { result: { ok: true } };
          },
        },
      });
      const firstService = await first.runtime.runPromise(StudioOperationRuntime);
      const active = await first.runtime.runPromise(firstService.runInGameStart(runInGameInput()));
      await expect
        .poll(async () => {
          const content = await readFile(
            join(workspaceRoot, active.requestId, "operation-record.json"),
            "utf8"
          ).catch(() => "{}");
          return (JSON.parse(content) as { phase?: string }).phase;
        })
        .toBe("collecting-evidence");

      const second = makeRuntime({
        ports: {
          runInGameWorkspaceRoot: workspaceRoot,
        },
      });
      const secondService = await second.runtime.runPromise(StudioOperationRuntime);

      await expect(
        expectFailure(second.runtime, secondService.runInGameStart(runInGameInput()))
      ).resolves.toMatchObject({
        tag: "OperationBlocked",
        activeRequestId: active.requestId,
      });
    } finally {
      blocker.resolve();
    }
  });

  test("daemon startup releases live-pid leases without matching heartbeat evidence", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-ambiguous-ownership-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    await mkdir(join(workspaceRoot, "_runtime"), { recursive: true });
    await writeFile(
      join(workspaceRoot, "_runtime", "runtime-ownership-lease.json"),
      `${JSON.stringify(
        {
          leaseId: "runtime-lease-live-pid-no-heartbeat",
          ownerKind: "run-in-game",
          requestId: "foreign-live-without-heartbeat",
          daemonId: "studio-server-foreign",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          processId: process.pid,
          acquiredAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("daemon startup releases stale Save/Deploy runtime leases", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-save-ownership-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    await mkdir(join(workspaceRoot, "_runtime"), { recursive: true });
    await writeFile(
      join(workspaceRoot, "_runtime", "runtime-ownership-lease.json"),
      `${JSON.stringify(
        {
          leaseId: "runtime-lease-stale-save",
          ownerKind: "save-deploy",
          requestId: "save-stale",
          daemonId: "studio-server-previous",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          processId: 999_999_999,
          acquiredAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      runtime.runPromise(service.saveDeployStart(saveDeployInput("save-after-stale")))
    ).resolves.toMatchObject({
      requestId: "save-after-stale",
      status: "running",
    });
  });

  test("daemon startup retains latest terminal Run in Game diagnostics and removes only outside-policy workspaces", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-retention-startup-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const oldTerminalAt = "2026-06-06T00:00:00.000Z";
    for (let index = 0; index <= 100; index += 1) {
      await seedRunOperationWorkspace(workspaceRoot, {
        requestId: retentionRequestId(index),
        terminalAt: oldTerminalAt,
        diagnosticsId: retentionDiagnosticsId(index),
        attributionReport: {
          status: "incomplete",
          missingSections: ["bounded-loaded-game-readback"],
        },
      });
    }
    await seedRunOperationWorkspace(workspaceRoot, {
      requestId: "studio-run-in-game-retention-young",
      terminalAt: "2026-06-09T23:00:00.000Z",
      diagnosticsId: "run-diagnostics-retention-young",
      attributionReport: { status: "complete", missingSections: [] },
    });

    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        clock: { now: () => new Date("2026-06-10T00:00:00.000Z") },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(pathExists(join(workspaceRoot, retentionRequestId(0)))).resolves.toBe(true);
    await expect(pathExists(join(workspaceRoot, retentionRequestId(98)))).resolves.toBe(true);
    await expect(pathExists(join(workspaceRoot, retentionRequestId(99)))).resolves.toBe(false);
    await expect(pathExists(join(workspaceRoot, retentionRequestId(100)))).resolves.toBe(false);
    await expect(
      pathExists(runDiagnosticsIndexPath(workspaceRoot, retentionDiagnosticsId(0)))
    ).resolves.toBe(true);
    await expect(
      pathExists(runDiagnosticsIndexPath(workspaceRoot, retentionDiagnosticsId(100)))
    ).resolves.toBe(false);
    await expect(
      pathExists(join(workspaceRoot, "studio-run-in-game-retention-young"))
    ).resolves.toBe(true);
    await expect(
      pathExists(join(workspaceRoot, retentionRequestId(0), "attribution", "attribution.json"))
    ).resolves.toBe(true);
    await expect(
      pathExists(join(workspaceRoot, retentionRequestId(100), "attribution", "attribution.json"))
    ).resolves.toBe(false);
    await expect(
      runtime.runPromise(service.runInGameDiagnostics({ diagnosticsId: retentionDiagnosticsId(0) }))
    ).resolves.toMatchObject({
      ok: true,
      diagnostics: {
        requestId: retentionRequestId(0),
        sections: {
          attribution: {
            report: {
              status: "incomplete",
              missingSections: ["bounded-loaded-game-readback"],
            },
          },
        },
      },
    });
    await expect(
      runtime.runPromise(
        service.runInGameDiagnostics({ diagnosticsId: retentionDiagnosticsId(100) })
      )
    ).resolves.toEqual({
      ok: false,
      diagnosticsId: retentionDiagnosticsId(100),
      reason: "not-found",
    });
  });

  test("Run in Game terminalization applies workspace retention after publishing the terminal record", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-retention-terminal-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
        clock: { now: () => new Date("2026-06-10T00:00:00.000Z") },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    const oldTerminalAt = "2026-06-06T00:00:00.000Z";
    for (let index = 0; index <= 100; index += 1) {
      await seedRunOperationWorkspace(workspaceRoot, {
        requestId: retentionRequestId(index),
        terminalAt: oldTerminalAt,
        diagnosticsId: retentionDiagnosticsId(index),
      });
    }

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    await expect.poll(() => pathExists(join(workspaceRoot, retentionRequestId(100)))).toBe(false);
    await expect(pathExists(join(workspaceRoot, accepted.requestId))).resolves.toBe(true);
  });

  test("retention cleanup preserves a live active Run in Game workspace", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-retention-active-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    const blocker = deferred<void>();
    try {
      const first = makeRuntime({
        ports: {
          runInGameWorkspaceRoot: workspaceRoot,
          buildRunInGameEvidence: async () => {
            await blocker.promise;
            return { result: { ok: true } };
          },
        },
      });
      const firstService = await first.runtime.runPromise(StudioOperationRuntime);
      const active = await first.runtime.runPromise(firstService.runInGameStart(runInGameInput()));
      await expect
        .poll(async () => {
          const content = await readFile(
            join(workspaceRoot, active.requestId, "operation-record.json"),
            "utf8"
          ).catch(() => "{}");
          return (JSON.parse(content) as { status?: string }).status;
        })
        .toBe("running");
      const oldTerminalAt = "2026-06-06T00:00:00.000Z";
      for (let index = 0; index <= 100; index += 1) {
        await seedRunOperationWorkspace(workspaceRoot, {
          requestId: retentionRequestId(index),
          terminalAt: oldTerminalAt,
          diagnosticsId: retentionDiagnosticsId(index),
        });
      }

      const second = makeRuntime({
        ports: {
          runInGameWorkspaceRoot: workspaceRoot,
          clock: { now: () => new Date("2026-06-10T00:00:00.000Z") },
        },
      });
      await second.runtime.runPromise(StudioOperationRuntime);

      await expect(pathExists(join(workspaceRoot, active.requestId))).resolves.toBe(true);
      await expect(pathExists(join(workspaceRoot, retentionRequestId(100)))).resolves.toBe(false);
    } finally {
      blocker.resolve();
    }
  });

  test("competing daemons cannot both acquire one stale runtime lease", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-stale-lease-race-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    await mkdir(join(workspaceRoot, "_runtime"), { recursive: true });
    await writeFile(
      join(workspaceRoot, "_runtime", "runtime-ownership-lease.json"),
      `${JSON.stringify(
        {
          leaseId: "runtime-lease-race-stale",
          ownerKind: "run-in-game",
          requestId: "run-stale-race",
          daemonId: "studio-server-previous",
          daemonStartedAt: "2026-06-10T00:00:00.000Z",
          processId: 999_999_999,
          acquiredAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:00.500Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    const blocker = deferred<void>();
    try {
      const first = makeRuntime({
        ports: {
          runInGameWorkspaceRoot: workspaceRoot,
          buildRunInGameEvidence: async () => {
            await blocker.promise;
            return { result: { ok: true } };
          },
        },
      });
      const second = makeRuntime({
        ports: {
          runInGameWorkspaceRoot: workspaceRoot,
          buildRunInGameEvidence: async () => {
            await blocker.promise;
            return { result: { ok: true } };
          },
        },
      });
      const [firstService, secondService] = await Promise.all([
        first.runtime.runPromise(StudioOperationRuntime),
        second.runtime.runPromise(StudioOperationRuntime),
      ]);

      const attempts = await Promise.all([
        first.runtime.runPromise(Effect.either(firstService.runInGameStart(runInGameInput()))),
        second.runtime.runPromise(Effect.either(secondService.runInGameStart(runInGameInput()))),
      ]);

      const accepted = attempts.filter((attempt) => attempt._tag === "Right");
      const blocked = attempts.filter((attempt) => attempt._tag === "Left");
      expect(accepted).toHaveLength(1);
      expect(blocked).toHaveLength(1);
      expect(blocked[0]).toMatchObject({
        left: {
          tag: "OperationBlocked",
        },
      });
    } finally {
      blocker.resolve();
    }
  });

  test("daemon startup quarantines corrupt runtime leases instead of wedging admission", async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-corrupt-ownership-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    await mkdir(join(workspaceRoot, "_runtime"), { recursive: true });
    await writeFile(join(workspaceRoot, "_runtime", "runtime-ownership-lease.json"), "{", "utf8");
    const { runtime } = makeRuntime({
      ports: {
        runInGameWorkspaceRoot: workspaceRoot,
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("idempotent Save/Deploy admission releases the duplicate lease", async () => {
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart(saveDeployInput("save-idempotent"))
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    await expect(
      runtime.runPromise(service.saveDeployStart(saveDeployInput("save-idempotent")))
    ).resolves.toMatchObject({
      requestId: "save-idempotent",
      status: "complete",
    });
    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("active Save/Deploy admission by the same request id is idempotent", async () => {
    const blocker = deferred<void>();
    const { runtime } = makeRuntime({
      ports: {
        prepareSaveDeployStart: async () => {
          await blocker.promise;
          return {};
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart({
        requestId: "save-idempotent-active",
        canonicalConfig: testSaveDeployCanonicalConfig(),
      })
    );
    const duplicate = await runtime.runPromise(
      service.saveDeployStart({
        requestId: "save-idempotent-active",
        canonicalConfig: testSaveDeployCanonicalConfig(),
      })
    );

    expect(duplicate).toMatchObject({
      requestId: accepted.requestId,
      status: "running",
    });
    blocker.resolve();
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");
    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
  });

  test("post-disposal starts do not call leaf ports for any mutation", async () => {
    let generationCalls = 0;
    let savePrepareCalls = 0;
    let autoplayCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        generateRunInGameMod: async () => {
          generationCalls += 1;
          return generatedRunInGameMod();
        },
        prepareSaveDeployStart: async () => {
          savePrepareCalls += 1;
          return {};
        },
      },
      civ7: {
        runAutoplay: (input) =>
          Effect.sync(() => {
            autoplayCalls += 1;
            return {
              ok: true,
              action: input.action,
              autoplay: {},
              game: {},
              gameContext: {},
              result: {},
            };
          }),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    await runtime.dispose();

    await expect(
      expectEffectFailure(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({ tag: "RuntimeDisposed" });
    await expect(
      expectEffectFailure(service.saveDeployStart(saveDeployInput("save-1")))
    ).resolves.toMatchObject({ tag: "RuntimeDisposed" });
    await expect(expectEffectFailure(service.autoplay({ action: "stop" }))).resolves.toMatchObject({
      tag: "RuntimeDisposed",
    });

    expect(generationCalls).toBe(0);
    expect(savePrepareCalls).toBe(0);
    expect(autoplayCalls).toBe(0);
  });

  test("expired retained operations become typed tombstones", async () => {
    let now = new Date("2026-06-10T00:00:00.000Z");
    const { runtime } = makeRuntime({
      ports: {
        clock: { now: () => now },
      },
      ttlMs: 10,
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    now = new Date("2026-06-10T00:00:00.100Z");
    const currentAfterExpiry = await runtime.runPromise(service.operationsCurrent);
    expect(currentAfterExpiry.runInGame.active).toBeNull();
    expect(currentAfterExpiry.runInGame.recent).toEqual([]);
    await expect(
      expectFailure(runtime, service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toMatchObject({
      tag: "OperationExpired",
      requestId: accepted.requestId,
    });
    await expect(startRunInGameWhenLeaseReleased(runtime, service)).resolves.toMatchObject({
      requestId: expect.not.stringMatching(accepted.requestId),
      status: "running",
    });
  });

  test("retains private Run in Game diagnostics after public terminal status expires", async () => {
    let now = new Date("2026-06-10T00:00:00.000Z");
    const { runtime } = makeRuntime({
      ports: {
        clock: { now: () => now },
      },
      ttlMs: 10,
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    let diagnosticsId: string | undefined;
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        diagnosticsId = status.status === "completed" ? status.diagnosticsId : undefined;
        return diagnosticsId;
      })
      .toEqual(expect.any(String));
    if (diagnosticsId === undefined)
      throw new Error("Expected persisted Run in Game diagnostics id");

    now = new Date("2026-06-10T00:00:00.100Z");
    await expect(
      expectFailure(runtime, service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toMatchObject({
      tag: "OperationExpired",
      requestId: accepted.requestId,
    });
    await expect(
      runtime.runPromise(service.runInGameDiagnostics({ diagnosticsId }))
    ).resolves.toMatchObject({
      ok: true,
      diagnostics: {
        diagnosticsId,
        requestId: accepted.requestId,
      },
    });
  });

  test("operation event publish failure does not change registry truth", async () => {
    const failingEventHub = makeEventHub({ publishFailure: new Error("event sink failed") });
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts(),
        civ7WorkflowControl: makeCiv7WorkflowControlLayer(),
      }).pipe(Layer.provide(Layer.succeed(StudioEventHub, failingEventHub)))
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");
  });

  test("Save/Deploy event publish failure does not change registry truth", async () => {
    const failingEventHub = makeEventHub({ publishFailure: new Error("event sink failed") });
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts(),
        civ7WorkflowControl: makeCiv7WorkflowControlLayer(),
      }).pipe(Layer.provide(Layer.succeed(StudioEventHub, failingEventHub)))
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart({
        requestId: "save-publish-failure",
        canonicalConfig: testSaveDeployCanonicalConfig(),
      })
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");
  });

  test("publishes accepted and transition events from runtime projections", async () => {
    const events: StudioEvent[] = [];
    const recordingEventHub = makeEventHub({ eventSink: events });
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts(),
        civ7WorkflowControl: makeCiv7WorkflowControlLayer(),
      }).pipe(Layer.provide(Layer.succeed(StudioEventHub, recordingEventHub)))
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    await expect
      .poll(() =>
        events.filter((event) => event.type === "operation").map((event) => event.status.phase)
      )
      .toContain("completed");

    const operationEvents = events.filter((event) => event.type === "operation");
    expect(operationEvents[0]).toMatchObject({
      type: "operation",
      kind: "run-in-game",
      status: {
        requestId: accepted.requestId,
        phase: "admitting-config",
        status: "running",
      },
    });
  });

  test("publishes accepted Save/Deploy event before leaf prepare work continues", async () => {
    const events: StudioEvent[] = [];
    const prepareBlocker = deferred<void>();
    const recordingEventHub = makeEventHub({ eventSink: events });
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts({
          prepareSaveDeployStart: async () => {
            await prepareBlocker.promise;
            return {};
          },
        }),
        civ7WorkflowControl: makeCiv7WorkflowControlLayer(),
      }).pipe(Layer.provide(Layer.succeed(StudioEventHub, recordingEventHub)))
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.saveDeployStart(saveDeployInput("save-accepted"))
    );
    const firstOperationEvent = events.find(
      (event) =>
        event.type === "operation" &&
        event.kind === "save-deploy" &&
        event.status.requestId === accepted.requestId
    );
    expect(firstOperationEvent).toMatchObject({
      type: "operation",
      kind: "save-deploy",
      status: {
        requestId: "save-accepted",
        phase: "queued",
        status: "running",
      },
    });

    prepareBlocker.resolve();
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.saveDeployStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    const operationEvents = events.filter((event) => event.type === "operation");
    expect(operationEvents.map((event) => event.status.phase)).toContain("complete");
  });
});

function makeRuntime(
  overrides: {
    ports?: Partial<StudioOperationRuntimePorts>;
    civ7?: Partial<Civ7WorkflowControlApi>;
    ttlMs?: number;
    diagnosticsWriter?: typeof writeRunDiagnostics;
    eventSink?: StudioEvent[];
    eventPublishBlocker?: Promise<void> | ((event: StudioEvent) => Promise<void> | undefined);
  } = {}
) {
  const eventHub = makeEventHub({
    eventSink: overrides.eventSink,
    publishBlocker: overrides.eventPublishBlocker,
  });
  const runInGameWorkspaceRoot =
    overrides.ports?.runInGameWorkspaceRoot ??
    join(tmpdir(), `studio-operation-runtime-${process.pid}-${++runtimeWorkspaceSequence}`);
  if (overrides.ports?.runInGameWorkspaceRoot === undefined) {
    runtimeWorkspaceRoots.push(runInGameWorkspaceRoot);
  }
  const ports: StudioOperationRuntimePorts = makePorts({
    ...overrides.ports,
    runInGameWorkspaceRoot,
  });
  const runtime = ManagedRuntime.make(
    makeStudioOperationRuntimeLayer({
      ports,
      civ7WorkflowControl: makeCiv7WorkflowControlLayer(overrides.civ7),
      ttlMs: overrides.ttlMs,
      diagnosticsWriter: overrides.diagnosticsWriter,
    }).pipe(Layer.provide(Layer.succeed(StudioEventHub, eventHub)))
  );
  openRuntimes.push(runtime);
  return { runtime, eventHub };
}

function makeEventHub(
  options: Readonly<{
    eventSink?: StudioEvent[];
    publishFailure?: unknown;
    publishBlocker?: Promise<void> | ((event: StudioEvent) => Promise<void> | undefined);
  }> = {}
): StudioEventHubApi {
  return {
    publish: (event) =>
      options.publishFailure === undefined
        ? Effect.promise(async () => {
            options.eventSink?.push(event);
            await (typeof options.publishBlocker === "function"
              ? options.publishBlocker(event)
              : options.publishBlocker);
          })
        : Effect.fail(options.publishFailure),
    subscribe: () => Effect.die("operation runtime tests do not subscribe to StudioEventHub"),
    activeSubscriberCount: Effect.succeed(0),
  };
}

function makePorts(
  overrides: Partial<StudioOperationRuntimePorts> = {}
): StudioOperationRuntimePorts {
  const runInGameWorkspaceRoot =
    overrides.runInGameWorkspaceRoot ??
    join(tmpdir(), `studio-operation-runtime-port-${process.pid}-${++runtimeWorkspaceSequence}`);
  if (overrides.runInGameWorkspaceRoot === undefined) {
    runtimeWorkspaceRoots.push(runInGameWorkspaceRoot);
  }
  return {
    clock: {
      now: () => new Date("2026-06-10T00:00:00.000Z"),
    },
    runInGameWorkspaceRoot,
    generateRunInGameMod: async () => generatedRunInGameMod(),
    runInGameCanonicalConfigAdmission: {
      admit: async (canonicalConfig) => canonicalConfig,
    },
    deployRunInGame: async ({ requestId, generatedMod }) =>
      runInGameDeployment({ requestId, materialization: generatedMod.materialization }),
    waitForRunInGameLogEvidence: async () => ({ result: { ok: true } }),
    observeRunInGameRuntime: async ({ requestId, prepared, deployment, started, log }) =>
      runInGameRuntimeObservation({ requestId, prepared, deployment, started, log }),
    buildRunInGameEvidence: async () => ({ result: { ok: true } }),
    prepareSaveDeployStart: async () => ({}),
    saveMapConfig: async () => ({
      path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
      saved: true,
    }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    rollbackSaveDeploy: async () => ({
      path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
      restored: true,
    }),
    ...overrides,
  };
}

function generatedRunInGameMod(
  options: Partial<Awaited<ReturnType<StudioOperationRuntimePorts["generateRunInGameMod"]>>> = {}
): Awaited<ReturnType<StudioOperationRuntimePorts["generateRunInGameMod"]>> {
  return {
    materialization: {
      mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
      canonicalConfigDigest: "test-config-hash",
      launchEnvelopeDigest: "test-envelope-hash",
      generationManifestDigest: "test-generation-manifest-digest",
      runArtifactId: "run-test",
      generatedModRoot: join(tmpdir(), "studio-generated-run-test"),
      generatedModFileCount: 1,
      generatedModDigest: "test-generated-mod-digest",
      mapRowId: "MAP_STUDIO_RUN",
      ...options.materialization,
    },
    ...(options.cleanup === undefined ? {} : { cleanup: options.cleanup }),
  };
}

function runInGameDeployment(
  args: Readonly<{
    requestId: string;
    materialization: Awaited<
      ReturnType<StudioOperationRuntimePorts["generateRunInGameMod"]>
    >["materialization"];
    filesCopied?: number;
    files?: Awaited<
      ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>
    >["deployedSnapshot"]["files"];
  }>
): Awaited<ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>> {
  const { materialization, requestId } = args;
  const filesCopied = args.filesCopied ?? 1;
  const files = args.files ?? [
    {
      path: "maps/studio-run.js",
      sha256: "sha256-map-script",
      sizeBytes: 512,
    },
  ];
  return {
    materialization,
    deploy: {
      targetDir: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      filesCopied,
    },
    runDeployment: {
      requestId,
      deployedModId: "mod-swooper-studio-run",
      generatedModRoot: materialization.generatedModRoot,
      generatedModDigest: materialization.generatedModDigest,
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      startedAt: "2026-06-10T00:00:00.000Z",
      completedAt: "2026-06-10T00:00:01.000Z",
      filesCopied,
    },
    deployedSnapshot: {
      requestId,
      deployedModId: "mod-swooper-studio-run",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      observedAt: "2026-06-10T00:00:01.000Z",
      fileCount: files.length,
      digest: materialization.generatedModDigest,
      files,
    },
  };
}

function runInGameRuntimeObservation(
  args: Readonly<{
    requestId: string;
    prepared: RunInGamePreparedRequest;
    deployment: Awaited<ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>>;
    started: Awaited<ReturnType<Civ7WorkflowControlApi["startSinglePlayer"]>>;
    log?: Awaited<ReturnType<StudioOperationRuntimePorts["waitForRunInGameLogEvidence"]>>;
  }>
): Awaited<ReturnType<StudioOperationRuntimePorts["observeRunInGameRuntime"]>> {
  const materialization = args.deployment.materialization;
  const correlation = {
    requestId: args.requestId,
    runArtifactId: materialization?.runArtifactId ?? "run-test",
    canonicalConfigDigest: args.prepared.canonicalConfigDigest,
    launchEnvelopeDigest: args.prepared.launchEnvelopeDigest,
    generationManifestDigest:
      materialization?.generationManifestDigest ?? "test-generation-manifest-digest",
  };
  return {
    requestId: args.requestId,
    correlation,
    deploymentEvidence: {
      runDeployment: args.deployment.runDeployment,
      deployedSnapshot: args.deployment.deployedSnapshot,
    },
    scriptingLog: {
      requestId: args.requestId,
      correlation,
      logPath: "/tmp/CivilizationVII/Logs/Scripting.log",
      observedAt: "2026-06-10T00:00:02.000Z",
      startOffset: 128,
      matchedMarkers: ["[mapgen-evidence]", args.requestId, "[mapgen-complete]"],
      evidence: args.log?.logEvidence,
    },
    setupRow: {
      requestId: args.requestId,
      correlation,
      state: "matched",
      mapScript: materialization?.mapScript ?? "test-map-script",
      runArtifactId: correlation.runArtifactId,
      deployedModId: args.deployment.runDeployment.deployedModId,
      mapRowFiles: args.started.evidence.setup.mapRowFiles,
    },
    loadedGame: {
      requestId: args.requestId,
      correlation,
      marker: { requestId: args.requestId, runArtifactId: correlation.runArtifactId },
      liveStatus: {
        ok: true,
        playable: true,
        observedAt: "2026-06-10T00:00:02.000Z",
        status: { readiness: "app-ui-game" },
        appUi: { snapshot: { ui: { inGame: { ok: true, value: true } } } },
        mapSummary: { mapSize: "MAPSIZE_STANDARD" },
        autoplay: {},
      },
      liveSnapshot: {
        ok: true,
        observedAt: "2026-06-10T00:00:02.000Z",
        grid: {
          map: { width: { ok: true, value: 84 }, height: { ok: true, value: 54 } },
          plotCount: 4536,
          plots: [{}],
        },
      },
      snapshotId: "status:1:test-snapshot",
      snapshotHash: "test-snapshot",
      dimensions: { width: 84, height: 54 },
      deployedModId: args.deployment.runDeployment.deployedModId,
      deployedSnapshotDigest: args.deployment.deployedSnapshot.digest,
    },
  };
}

function runInGameInput(
  overrides: RunInGameInputOverrides = {}
): StudioInputs["runInGame"]["start"] {
  const canonicalConfigOverrides = overrides.canonicalConfig;
  const config = isRecord(overrides.config) ? overrides.config : {};
  const canonicalConfig =
    overrides.invalidCanonicalConfig ??
    testCanonicalConfig({
      id: canonicalConfigOverrides?.id ?? "studio-current",
      name: canonicalConfigOverrides?.name ?? "Studio Current",
      ...(canonicalConfigOverrides?.description === undefined
        ? {}
        : { description: canonicalConfigOverrides.description }),
      sortIndex: canonicalConfigOverrides?.sortIndex,
      ...(canonicalConfigOverrides?.latitudeBounds === undefined
        ? {}
        : { latitudeBounds: canonicalConfigOverrides.latitudeBounds }),
      config,
    }).canonicalConfig;
  return {
    canonicalConfig: canonicalConfig as StudioInputs["runInGame"]["start"]["canonicalConfig"],
    seed: overrides.seed ?? 43,
    worldSettings: {
      mapSize: overrides.mapSize ?? "MAPSIZE_STANDARD",
      ...(overrides.playerCount === undefined ? {} : { playerCount: overrides.playerCount }),
      ...(overrides.resources === undefined ? {} : { resources: overrides.resources }),
      ...overrides.worldSettings,
    },
    ...(overrides.setupConfig === undefined ? {} : { setupConfig: overrides.setupConfig }),
    ...(overrides.recovery === undefined ? {} : { recovery: overrides.recovery }),
  };
}

function testSaveDeployCanonicalConfig() {
  return testCanonicalConfig({
    id: "test-config",
    name: "Test Config",
    description: "Save/Deploy runtime fixture.",
    config: {},
  }).canonicalConfig;
}

function saveDeployInput(requestId: string): StudioInputs["mapConfigs"]["saveDeploy"] {
  return { requestId, canonicalConfig: testSaveDeployCanonicalConfig() };
}

type RunInGameInputOverrides = Omit<
  Partial<StudioInputs["runInGame"]["start"]>,
  "canonicalConfig"
> &
  Readonly<{
    seed?: string | number;
    mapSize?: string;
    resources?: string;
    playerCount?: number;
    config?: unknown;
    invalidCanonicalConfig?: unknown;
    canonicalConfig?: Readonly<{
      id?: string;
      name?: string;
      description?: string;
      sortIndex?: number;
      latitudeBounds?: Readonly<{
        topLatitude: number;
        bottomLatitude: number;
      }>;
    }>;
  }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function testCanonicalConfig(
  args: Readonly<{
    id: string;
    name: string;
    description?: string;
    sortIndex?: number;
    latitudeBounds?: Readonly<{ topLatitude: number; bottomLatitude: number }>;
    config?: Record<string, unknown>;
  }>
) {
  const canonicalConfig = {
    id: args.id,
    name: args.name,
    description: args.description ?? "Current Studio editor configuration.",
    recipe: "standard" as const,
    sortIndex: args.sortIndex ?? 9999,
    latitudeBounds: args.latitudeBounds ?? { topLatitude: 80, bottomLatitude: -80 },
    config: args.config ?? {},
  };
  return {
    canonicalConfig,
  };
}

function makeCiv7WorkflowControlLayer(
  overrides: Partial<Civ7WorkflowControlApi> = {}
): Layer.Layer<Civ7WorkflowControl> {
  const service: Civ7WorkflowControlApi = {
    startSinglePlayer: () => Effect.succeed(lifecycleStarted()),
    runAutoplay: (input) =>
      Effect.succeed({
        ok: true,
        action: input.action,
        autoplay: {},
        game: {},
        gameContext: {},
        result: {},
      }),
    ...overrides,
  };
  return Layer.succeed(Civ7WorkflowControl, service);
}

function lifecycleStarted() {
  return {
    status: "started" as const,
    evidence: {
      setup: {
        mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
        mapSize: "MAPSIZE_SMALL",
        mapSeed: 42,
        gameSeed: 42,
        targetModId: "mod-swooper-studio-run",
        mapRowFiles: ["{mod-swooper-studio-run}/maps/studio-run.js"],
      },
      runtime: { seed: 42, mapSize: "MAPSIZE_SMALL", width: 44, height: 26, plotCount: 1144 },
    },
    transition: { initialPhase: "shell" as const, activeGameExit: "not-needed" as const },
  };
}

async function expectFailure<A, E>(
  runtime: ManagedRuntime.ManagedRuntime<StudioOperationRuntime, never>,
  effect: Effect.Effect<A, E>
): Promise<E> {
  const result = await runtime.runPromise(Effect.either(effect));
  if (result._tag === "Right") {
    throw new Error(`Expected failure, got ${JSON.stringify(result.right)}`);
  }
  return result.left;
}

async function expectEffectFailure<A, E>(effect: Effect.Effect<A, E>): Promise<E> {
  const result = await Effect.runPromise(Effect.either(effect));
  if (result._tag === "Right") {
    throw new Error(`Expected failure, got ${JSON.stringify(result.right)}`);
  }
  return result.left;
}

function nonPortableJsonValues(): ReadonlyArray<readonly [string, unknown]> {
  class ConfigInstance {}
  const cycle: { self?: unknown } = {};
  cycle.self = cycle;
  const sparse: unknown[] = [];
  sparse.length = 1;
  const accessor: Record<string, unknown> = {};
  Object.defineProperty(accessor, "value", {
    enumerable: true,
    get: () => "not portable",
  });
  const symbolBearing: Record<string, unknown> = {};
  Object.defineProperty(symbolBearing, Symbol("not-json"), {
    enumerable: true,
    value: "not portable",
  });
  return [
    ["Date", new Date()],
    ["Map", new Map([["value", true]])],
    ["RegExp", /portable/],
    ["function", () => true],
    ["class instance", new ConfigInstance()],
    ["cycle", cycle],
    ["sparse array", sparse],
    ["accessor", accessor],
    ["symbol-bearing object", symbolBearing],
    ["non-finite number", Number.POSITIVE_INFINITY],
  ];
}

function hasRecursiveKey(value: unknown, target: string): boolean {
  if (Array.isArray(value)) return value.some((item) => hasRecursiveKey(item, target));
  if (value === null || typeof value !== "object") return false;
  return Object.entries(value).some(
    ([key, item]) => key === target || hasRecursiveKey(item, target)
  );
}

async function readPrivateRunOperation(
  runtime: ManagedRuntime.ManagedRuntime<StudioOperationRuntime, never>,
  service: StudioOperationRuntimeApi,
  diagnosticsId: string | undefined
): Promise<Record<string, unknown>> {
  const diagnostics = await readPrivateRunDiagnostics(runtime, service, diagnosticsId);
  const operation = diagnostics.sections.operation;
  if (operation == null || typeof operation !== "object" || Array.isArray(operation)) {
    throw new Error(`Expected operation diagnostics for ${diagnosticsId}`);
  }
  return operation as Record<string, unknown>;
}

async function readPrivateRunDiagnostics(
  runtime: ManagedRuntime.ManagedRuntime<StudioOperationRuntime, never>,
  service: StudioOperationRuntimeApi,
  diagnosticsId: string | undefined
) {
  if (!diagnosticsId) throw new Error("Expected Run in Game diagnostics id");
  const deadline = Date.now() + 2_000;
  let lastReason = "not-read";
  do {
    const lookup = await runtime.runPromise(service.runInGameDiagnostics({ diagnosticsId }));
    if (lookup.ok) return lookup.diagnostics;
    lastReason = lookup.reason;
    await delay(25);
  } while (Date.now() < deadline);
  throw new Error(`Expected private diagnostics for ${diagnosticsId}; last reason: ${lastReason}`);
}

async function readPublicRunStatusWithDiagnostics(
  runtime: ManagedRuntime.ManagedRuntime<StudioOperationRuntime, never>,
  service: StudioOperationRuntimeApi,
  expected: Pick<RunInGameRequestStatus, "requestId" | "diagnosticsId">
) {
  const deadline = Date.now() + 2_000;
  let status: RunInGameRequestStatus | undefined;
  do {
    status = await runtime.runPromise(service.runInGameStatus({ requestId: expected.requestId }));
    if (expected.diagnosticsId === undefined || status.diagnosticsId === expected.diagnosticsId) {
      return status;
    }
    await delay(25);
  } while (Date.now() < deadline);
  return status;
}

async function startRunInGameWhenLeaseReleased(
  runtime: ManagedRuntime.ManagedRuntime<StudioOperationRuntime, never>,
  service: StudioOperationRuntimeApi
) {
  const deadline = Date.now() + 2_000;
  let lastError: unknown;
  do {
    try {
      return await runtime.runPromise(service.runInGameStart(runInGameInput()));
    } catch (err) {
      lastError = err;
      if (!String(err).includes("studio-runtime-ownership-lease-held")) throw err;
      await delay(25);
    }
  } while (Date.now() < deadline);
  throw lastError;
}

async function startSaveDeployWhenLeaseReleased(
  runtime: ManagedRuntime.ManagedRuntime<StudioOperationRuntime, never>,
  service: StudioOperationRuntimeApi,
  input: StudioInputs["mapConfigs"]["saveDeploy"]
) {
  const deadline = Date.now() + 2_000;
  let lastError: unknown;
  do {
    try {
      return await runtime.runPromise(service.saveDeployStart(input));
    } catch (err) {
      lastError = err;
      if (!String(err).includes("studio-runtime-ownership-lease-held")) throw err;
      await delay(25);
    }
  } while (Date.now() < deadline);
  throw lastError;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function writeTestRunDiagnostics(
  operation: RunInGameInternalOperation,
  workspaceRoot: string | undefined
) {
  if (workspaceRoot === undefined || operation.diagnosticsId === undefined) {
    throw new Error("Expected a private diagnostics workspace and id");
  }
  const path = join(workspaceRoot, operation.requestId, "diagnostics", "diagnostics.json");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify(
      {
        diagnosticsId: operation.diagnosticsId,
        requestId: operation.requestId,
        operationRevision: operation.operationRevision,
        createdAt: operation.startedAt,
        updatedAt: operation.updatedAt,
        summary: `Run in Game ${operation.phase}`,
        sections: { operation },
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function attributionRecordValue(value: unknown): Readonly<{
  path: unknown;
  report: unknown;
}> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected attribution diagnostics object");
  }
  const record = value as Record<string, unknown>;
  if (!("path" in record) || !("report" in record)) {
    throw new Error("Expected attribution diagnostics path and report");
  }
  return { path: record.path, report: record.report };
}

async function seedRunOperationWorkspace(
  workspaceRoot: string,
  args: Readonly<{
    requestId: string;
    diagnosticsId?: string;
    terminalAt: string;
    attributionReport?: unknown;
  }>
) {
  const createdAt = "2026-06-06T00:00:00.000Z";
  const requestRoot = join(workspaceRoot, args.requestId);
  await mkdir(requestRoot, { recursive: true });
  await writeFile(
    join(requestRoot, "operation-record.json"),
    `${JSON.stringify(
      {
        recordType: "RunOperationRecord",
        requestId: args.requestId,
        daemonId: "studio-server-retention-seed",
        daemonStartedAt: createdAt,
        leaseId: `runtime-lease-${args.requestId}`,
        phase: "complete",
        status: "complete",
        operationRevision: 1,
        ...(args.diagnosticsId === undefined ? {} : { diagnosticsId: args.diagnosticsId }),
        createdAt,
        updatedAt: args.terminalAt,
        terminalAt: args.terminalAt,
        terminalOutcome: "complete",
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  if (args.diagnosticsId === undefined) return;
  if (args.attributionReport !== undefined) {
    const attributionRoot = join(requestRoot, "attribution");
    await mkdir(attributionRoot, { recursive: true });
    await writeFile(
      join(attributionRoot, "attribution.json"),
      `${JSON.stringify(args.attributionReport, null, 2)}\n`,
      "utf8"
    );
  }
  const diagnosticsRoot = join(requestRoot, "diagnostics");
  await mkdir(diagnosticsRoot, { recursive: true });
  await writeFile(
    join(diagnosticsRoot, "diagnostics.json"),
    `${JSON.stringify(
      {
        diagnosticsId: args.diagnosticsId,
        requestId: args.requestId,
        operationRevision: 1,
        createdAt,
        updatedAt: args.terminalAt,
        summary: "Seeded retained Run in Game diagnostics",
        sections: {
          ...(args.attributionReport === undefined
            ? {}
            : {
                attribution: {
                  path: join(requestRoot, "attribution", "attribution.json"),
                  report: args.attributionReport,
                },
              }),
          operation: {
            requestId: args.requestId,
          },
        },
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const indexPath = runDiagnosticsIndexPath(workspaceRoot, args.diagnosticsId);
  await mkdir(dirname(indexPath), { recursive: true });
  await writeFile(
    indexPath,
    `${JSON.stringify({ diagnosticsId: args.diagnosticsId, requestId: args.requestId })}\n`,
    "utf8"
  );
}

function retentionRequestId(index: number): string {
  return `studio-run-in-game-retention-${String(index).padStart(3, "0")}`;
}

function retentionDiagnosticsId(index: number): string {
  return `run-diagnostics-retention-${String(index).padStart(3, "0")}`;
}

async function pathExists(path: string): Promise<boolean> {
  return access(path).then(
    () => true,
    () => false
  );
}

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function operationPhases(events: readonly StudioEvent[], requestId: string): string[] {
  return events
    .filter(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === requestId
    )
    .map((event) => event.status.phase);
}

function terminalSaveDeployEvents(
  events: readonly StudioEvent[],
  requestId: string
): StudioEvent[] {
  return events.filter(
    (event) =>
      event.type === "operation" &&
      event.kind === "save-deploy" &&
      event.status.requestId === requestId &&
      event.status.status !== "running"
  );
}

function terminalRunInGameEvents(events: readonly StudioEvent[], requestId: string): StudioEvent[] {
  return events.filter(
    (event) =>
      event.type === "operation" &&
      event.kind === "run-in-game" &&
      event.status.requestId === requestId &&
      event.status.status !== "running"
  );
}

function expectTypeboxValid(schema: TSchema, value: unknown): void {
  const errors = [...Value.Errors(schema, value)].map((error) => ({
    message: error.message,
    path: error.path,
  }));
  expect(errors).toEqual([]);
}
