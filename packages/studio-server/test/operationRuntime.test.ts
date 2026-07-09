import { access, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  dependencyUnavailable,
  invalidRequest,
  operationBlocked,
  operationStatusTypeSchema,
  proofFailed,
  type RunInGameRequestStatus,
  type StudioEvent,
  studio,
  typeboxOutputSchemaFromContractProcedure,
} from "@civ7/studio-contract";
import { readStudioRunGenerationManifest } from "@civ7/studio-run-workspace";
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
      correlationDigest: "run-fingerprint",
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

  test("projects current and event Run in Game payloads without private operation detail", () => {
    const now = "2026-06-10T00:00:00.000Z";
    const privateOperation = {
      kind: "run-in-game",
      requestId: "run-private-projection",
      leaseId: "runtime-lease-private-projection",
      correlationDigest: "private-correlation-digest",
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
      completedPhases: ["resolving-source"],
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
          correlationDigest: "run-cancelled-fingerprint",
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
      terminalAt: "2026-06-10T00:00:01.000Z",
    });
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
  });

  test("cancels an active Run in Game worker after cleanup and emits one terminal event", async () => {
    const events: StudioEvent[] = [];
    const deployBlocker = deferred<void>();
    let cleanupCalls = 0;
    const runInGameWorkspaceRoot = join(
      tmpdir(),
      `studio-operation-runtime-cancel-deploy-${process.pid}-${++runtimeWorkspaceSequence}`
    );
    runtimeWorkspaceRoots.push(runInGameWorkspaceRoot);
    const { runtime } = makeRuntime({
      eventSink: events,
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
          id: "test-config",
          envelope: {},
        })
      )
    ).resolves.toMatchObject({
      requestId: "save-after-run-cancel",
      status: "running",
    });
    expect(terminalRunInGameEvents(events, accepted.requestId)).toHaveLength(1);
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
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

  test("cancellation waits for in-flight cleanup before publishing private cleanup diagnostics", async () => {
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

    cleanupBlocker.reject(new Error("in-flight cleanup failed"));
    const cancelled = await cancellation;

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
      diagnostics: {
        code: "run-in-game-cancel-cleanup-failed",
        cause: expect.stringContaining("in-flight cleanup failed"),
      },
    });
    expectTypeboxValid(operationStatusTypeSchema, cancelled);
  });

  test("cancellation during in-flight generation waits for late cleanup before publishing", async () => {
    const events: StudioEvent[] = [];
    const generationBlocker = deferred<void>();
    const cleanupStarted = deferred<void>();
    const cleanupBlocker = deferred<void>();
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        generateRunInGameMod: async () => {
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
    await new Promise((resolve) => setTimeout(resolve, 0));
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

  test("cancels Run in Game during runtime observation after cleanup", async () => {
    const proofBlocker = deferred<void>();
    let cleanupCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        generateRunInGameMod: async () => ({
          ...generatedRunInGameMod(),
          cleanup: async () => {
            cleanupCalls += 1;
          },
        }),
        waitForRunInGameLogProof: async () => {
          await proofBlocker.promise;
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
        return status.phase;
      })
      .toBe("observing-runtime");
    const cancelled = await runtime.runPromise(
      service.runInGameCancel({ requestId: accepted.requestId })
    );

    expect(cancelled).toMatchObject({
      requestId: accepted.requestId,
      status: "cancelled",
      phase: "cancelled",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(cleanupCalls).toBe(1);
    proofBlocker.resolve();
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
      saveService.saveDeployStart({ requestId: "save-active", id: "test-config", envelope: {} })
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
      id: "test-config",
      envelope: {},
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

  test("preserves source snapshot proof in the runtime-owned request projection", async () => {
    let observedSourceSnapshot: Record<string, unknown> | undefined;
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod, prepared }) => {
          observedSourceSnapshot = prepared.request.sourceSnapshot as Record<string, unknown>;
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
          selectedConfig: {
            label: "Current Editor Config",
          },
        })
      )
    );

    await expect.poll(() => observedSourceSnapshot).toBeDefined();
    expect(observedSourceSnapshot).toMatchObject({
      requestId: accepted.requestId,
      recipeSettings: { seed: 123 },
      worldSettings: { mapSize: "MAPSIZE_TINY" },
      pipelineConfig: { example: true },
      setupConfig: {
        gameOptions: {},
        playerOptions: [{ playerId: 0, options: {} }],
      },
      materializationMode: "disposable",
      selectedConfig: {
        id: "studio-current",
        label: "Current Editor Config",
      },
      identityHash: expect.any(String),
      configHash: expect.any(String),
      envelopeHash: expect.any(String),
    });
  });

  test("keeps disposable studio-current launches on exit-to-shell unless row proof requires restart", async () => {
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

    const accepted = await runtime.runPromise(
      service.runInGameStart(runInGameInput({ materialization: { mode: "disposable" } }))
    );

    await expect.poll(() => observedRequest).toBeDefined();
    expect(observedRequest).toMatchObject({
      selectedConfigId: "studio-current",
      materializationMode: "disposable",
    });
    expect(observedRequest?.restartCivProcess).toBeUndefined();
  });

  test("restarts and retries setup only after disposable setup row proof misses", async () => {
    const events: StudioEvent[] = [];
    let prepareSetupCalls = 0;
    let restartCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        restartCivForRunInGame: async () => {
          restartCalls += 1;
          return {
            processRestart: {
              command: "restart-civ",
            },
          };
        },
      },
      civ7: {
        prepareSetup: () => {
          prepareSetupCalls += 1;
          if (prepareSetupCalls === 1) {
            return Effect.fail(
              proofFailed({
                message: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
                reason: "setup-row-unavailable",
                diagnostics: {
                  code: "setup-map-row-not-visible",
                  reloadBoundary: "process-restart-required",
                },
              })
            );
          }
          return Effect.succeed({ rowProof: { rows: [{ file: "studio-current.js" }] } });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(runInGameInput({ materialization: { mode: "disposable" } }))
    );

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("completed");

    expect(prepareSetupCalls).toBe(2);
    expect(restartCalls).toBe(1);
    await expect
      .poll(() => operationPhases(events, accepted.requestId))
      .toEqual(
        expect.arrayContaining([
          "preparing-civ7",
          "preparing-civ7",
          "preparing-civ7",
          "starting-game",
          "completed",
        ])
      );
  });

  test("keeps durable Run in Game launches restart opt-in", async () => {
    let observedDurableRequest: Record<string, unknown> | undefined;
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod, prepared }) => {
          observedDurableRequest = prepared.request as Record<string, unknown>;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const durable = await runtime.runPromise(
      service.runInGameStart(
        runInGameInput({
          materialization: { mode: "durable" },
          selectedConfig: { id: "latest-juicy" },
        })
      )
    );
    await expect.poll(() => observedDurableRequest).toBeDefined();
    expect(observedDurableRequest?.restartCivProcess).toBeUndefined();

    let observedRestartRequest: Record<string, unknown> | undefined;
    const { runtime: restartRuntime } = makeRuntime({
      ports: {
        deployRunInGame: async ({ requestId, generatedMod, prepared }) => {
          observedRestartRequest = prepared.request as Record<string, unknown>;
          return runInGameDeployment({ requestId, materialization: generatedMod.materialization });
        },
      },
    });
    const restartService = await restartRuntime.runPromise(StudioOperationRuntime);
    const restartDurable = await restartRuntime.runPromise(
      restartService.runInGameStart(
        runInGameInput({
          materialization: { mode: "durable" },
          selectedConfig: { id: "latest-juicy" },
          recovery: { restartCivProcess: true },
        })
      )
    );
    await expect.poll(() => observedRestartRequest).toBeDefined();
    expect(observedRestartRequest?.restartCivProcess).toBe(true);
  });

  test("keeps one source snapshot proof identity across runtime projections and final proof", async () => {
    const events: StudioEvent[] = [];
    const workspaceRoot = await mkdtemp(join(tmpdir(), "studio-run-source-proof-"));
    runtimeWorkspaceRoots.push(workspaceRoot);
    let acceptedSourceSnapshot: Record<string, unknown> | undefined;
    let observedRuntimeObservation:
      | Awaited<ReturnType<StudioOperationRuntimePorts["observeRunInGameRuntime"]>>
      | undefined;
    const recordingEventHub = makeEventHub({ eventSink: events });
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts({
          runInGameWorkspaceRoot: workspaceRoot,
          buildRunInGameProof: async ({ requestId, prepared, deployment, observation }) => {
            acceptedSourceSnapshot = prepared.request.sourceSnapshot as Record<string, unknown>;
            observedRuntimeObservation = observation;
            return {
              result: { ok: true },
              exactAuthorshipProof: {
                status: "complete",
                requestId,
                createdAt: "2026-06-10T00:00:00.000Z",
                ...(prepared.request.sourceSnapshot === undefined
                  ? {}
                  : { sourceSnapshot: prepared.request.sourceSnapshot }),
                request: {
                  recipeId: prepared.request.recipeId,
                  fingerprint: prepared.request.fingerprint,
                },
                materialization: deployment.materialization ?? {},
                civSetup: {},
                runtime: {},
                unresolvedLinks: [],
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
          config: { beta: undefined, alpha: { z: 1, a: 2 } },
          selectedConfig: {
            id: "studio-current",
            latitudeBounds: { north: 75, south: -55 },
          },
          sourceSnapshot: {
            recipeSettings: { seed: 42, omitted: undefined },
            worldSettings: { resources: "balanced" },
            pipelineConfig: { continents: { knobs: { landmassRatio: 0.42 } } },
            setupConfig: { players: [] },
            materializationMode: "disposable",
            selectedConfig: { id: "studio-current" },
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
    expect(acceptedSourceSnapshot).toBeDefined();

    const status = await readPublicRunStatusWithDiagnostics(runtime, service, accepted);
    const operationEvents = events.filter(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId
    );

    expect(status).toMatchObject({
      requestId: accepted.requestId,
      status: "completed",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(
      operationEvents.every((event) => event.status.diagnosticsId === accepted.diagnosticsId)
    ).toBe(true);
    const finalPrivateOperation = await readPrivateRunOperation(
      runtime,
      service,
      accepted.diagnosticsId
    );
    expect(finalPrivateOperation.request?.sourceSnapshot).toEqual(acceptedSourceSnapshot);
    expect(finalPrivateOperation.exactAuthorshipProof?.sourceSnapshot).toEqual(
      acceptedSourceSnapshot
    );
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

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
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

    const failed = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
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
              mapRowId: "MAP_RUN_TEST",
            },
          };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(
        runInGameInput({
          config: { beta: undefined, alpha: { z: 1, a: 2 } },
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
      request: {
        selectedConfigId: "studio-current",
        materializationMode: "disposable",
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
        /generationManifest|runArtifactId|RunCorrelation|resolvedLaunchSource|launchEnvelope/
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
      mapRowId: "MAP_RUN_TEST",
    });
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
                  path: "maps/run-test.js",
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
        waitForRunInGameLogProof: async ({ deployment }) => {
          observeDeployment(deployment);
          return { result: { ok: true } };
        },
        buildRunInGameProof: async ({ deployment }) => {
          observeDeployment(deployment);
          return { result: { ok: true } };
        },
      },
      civ7: {
        checkPlayable: ({ deployment }) =>
          Effect.sync(() => {
            observeDeployment(deployment);
          }),
        prepareSetup: ({ deployment }) =>
          Effect.sync(() => {
            observeDeployment(deployment);
            return {};
          }),
        startGame: ({ deployment }) =>
          Effect.sync(() => {
            observeDeployment(deployment);
            return {};
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
      Array(5).fill("mod-swooper-studio-run:sha256-generated-tree:sha256-generated-tree")
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
        { path: "maps/run-test.js", sha256: "sha256-map-script", sizeBytes: 512 },
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

  test("rejects missing Run in Game config before admission", async () => {
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
            source: {
              kind: "editor",
              editorSessionId: "missing-config-editor",
              payload: {
                configId: "studio-current",
                label: "Studio Current",
                mapScript: "{swooper-maps}/maps/studio-current.js",
                pipelineConfig: undefined,
                recipeId: "mod-swooper-maps/standard",
              },
            } as StudioInputs["runInGame"]["start"]["source"],
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      diagnostics: { code: "run-in-game-editor-source-config-invalid" },
    });

    const current = await runtime.runPromise(service.operationsCurrent);
    expect(events).toEqual([]);
    expect(generationCalls).toBe(0);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toEqual([]);
  });

  test("rejects editor launch sources that do not resolve to studio-current", async () => {
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
            source: {
              kind: "editor",
              editorSessionId: "split-identity-editor",
              payload: {
                configId: "shadow-current",
                label: "Shadow Current",
                mapScript: "{swooper-maps}/maps/shadow-current.js",
                pipelineConfig: {},
                recipeId: "mod-swooper-maps/standard",
              },
            } as StudioInputs["runInGame"]["start"]["source"],
          })
        )
      )
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      diagnostics: { code: "run-in-game-editor-source-identity-invalid" },
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
      service.runInGameStart(
        runInGameInput({
          seed: "43",
          materialization: { mode: "disposable" },
        })
      )
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
          id: "test-config",
          envelope: {},
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
              { path: "maps/run-test.js", sha256: "sha256-map-script", sizeBytes: 512 },
              { path: "maps/run-test.config.json", sha256: "sha256-map-config", sizeBytes: 128 },
              { path: "modinfo.json", sha256: "sha256-modinfo", sizeBytes: 96 },
            ],
          }),
        buildRunInGameProof: async () => {
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
          id: "test-config",
          envelope: {},
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
    let proofCalls = 0;
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
        buildRunInGameProof: async () => {
          proofCalls += 1;
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

    const failed = await runtime.runPromise(service.runInGameStatus({ requestId: run.requestId }));
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
    expect(proofCalls).toBe(0);
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
      service.saveDeployStart({ requestId: "save-blocks-run", id: "test-config", envelope: {} })
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
      expectFailure(
        runtime,
        service.saveDeployStart({ requestId: "save-1", id: "test-config", envelope: {} })
      )
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
      service.saveDeployStart({ requestId: "runtime-save-id", id: "test-config", envelope: {} })
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
      service.saveDeployStart({ requestId: "save-fail", id: "test-config", envelope: {} })
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
      error: "deploy failed",
      details: {
        failedAtPhase: "deploying",
        reason: "deploy-failed",
        code: "save-deploy-deploy-failed",
        rollbackRestored: true,
      },
    });
    expect(rollbackCalls).toBe(1);
    expect(cleanupCalls).toBe(1);
    expect(terminalSaveDeployEvents(events, accepted.requestId)).toHaveLength(1);

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
      service.saveDeployStart({ requestId: "save-rollback-fail", id: "test-config", envelope: {} })
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
      error: "Save/Deploy rollback failed after workflow failure",
      details: {
        failedAtPhase: "deploying",
        reason: "rollback-failed",
        code: "save-deploy-rollback-failed",
        rollbackFailure: "restore failed",
      },
    });
    expect(rollbackCalls).toBe(1);
    expect(cleanupCalls).toBe(1);
    expect(terminalSaveDeployEvents(events, accepted.requestId)).toHaveLength(1);

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
      service.saveDeployStart({ requestId: "save-cleanup-fail", id: "test-config", envelope: {} })
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
      error: "Save/Deploy cleanup failed",
      details: {
        failedAtPhase: "deploying",
        reason: "deploy-failed",
        code: "save-deploy-cleanup-failed",
        cause: "cleanup failed",
      },
    });
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
          reason: "materialization-proof-missing",
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
        requestId: "run-restart-fail",
        input: { recovery: { restartCivProcess: true } },
        ports: {
          restartCivForRunInGame: async () => {
            throw new Error("restart failed");
          },
        },
        expected: {
          status: "failed",
          safeFailureCategory: "runtime-control",
          code: "run-in-game-restart-failed",
          reason: "restart-failed",
          failedAtPhase: "restarting-civ",
          recoveryActions: ["restart-civ-process-and-retry"],
        },
      },
      {
        requestId: "run-setup-row-fail",
        civ7: {
          prepareSetup: () =>
            Effect.fail(new Error("Civ7 setup cannot see {swooper-maps}/maps/studio-current.js")),
        },
        expected: {
          status: "failed",
          safeFailureCategory: "runtime-observation",
          code: "run-in-game-setup-row-unavailable",
          reason: "setup-row-unavailable",
          failedAtPhase: "preparing-setup",
          recoveryActions: ["exit-to-shell-and-continue"],
        },
      },
      {
        requestId: "run-start-game-fail",
        civ7: {
          startGame: () => Effect.fail(new Error("start game failed")),
        },
        expected: {
          status: "uncertain",
          safeFailureCategory: "runtime-control",
          code: "run-in-game-start-game-failed",
          reason: "start-game-failed",
          failedAtPhase: "starting-game",
          recoveryActions: ["dismiss-civ-notification-and-retry"],
        },
      },
      {
        requestId: "run-log-proof-fail",
        ports: {
          waitForRunInGameLogProof: async () => {
            throw new Error("log proof missing");
          },
        },
        expected: {
          status: "failed",
          safeFailureCategory: "runtime-observation",
          code: "run-in-game-log-proof-missing",
          reason: "log-proof-missing",
          failedAtPhase: "waiting-for-proof",
        },
      },
      {
        requestId: "run-loaded-game-readback-fail",
        ports: {
          observeRunInGameRuntime: async () => {
            throw proofFailed({
              message: "Loaded game readback did not match",
              reason: "exact-authorship-mismatch",
              diagnostics: {
                code: "run-in-game-loaded-readback-mismatch",
                failedAtPhase: "waiting-for-proof",
              },
            });
          },
        },
        expected: {
          status: "failed",
          safeFailureCategory: "runtime-observation",
          code: "run-in-game-loaded-readback-mismatch",
          reason: "exact-authorship-mismatch",
          failedAtPhase: "waiting-for-proof",
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
      expect(privateOperation.failure).toMatchObject({
        reason: entry.expected.reason,
        diagnostics: {
          code: entry.expected.code,
          failedAtPhase: entry.expected.failedAtPhase,
        },
      });
      expectTypeboxValid(operationStatusTypeSchema, failed);
    }
  });

  test("setup failure taxonomy stays private while public Run in Game status is safe", async () => {
    const events: StudioEvent[] = [];
    const { runtime } = makeRuntime({
      eventSink: events,
      civ7: {
        prepareSetup: () =>
          Effect.fail(
            proofFailed({
              message:
                "Civilization is not loading the generated Studio Run mod, so its setup map list cannot show {mod-swooper-studio-run}/maps/run-test.js.",
              reason: "setup-row-unavailable",
              diagnostics: {
                code: "generated-map-mod-not-enabled",
                setupFailureReason: "generated-map-mod-not-enabled",
                mapScript: "{mod-swooper-studio-run}/maps/run-test.js",
                targetModId: "mod-swooper-studio-run",
                activeTargetModSet: {
                  available: true,
                  identityAvailable: true,
                  truncated: false,
                  mods: [{ id: "base-standard", name: "Base Standard" }],
                },
                materialization: {
                  generatedModRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
                },
              },
            })
          ),
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(runInGameInput({ requestId: "run-setup-taxonomy-private" }))
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.status;
      })
      .toBe("failed");

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const current = await runtime.runPromise(service.operationsCurrent);
    const publicPayloads = JSON.stringify([
      status,
      current,
      events.filter((event) => event.type === "operation"),
    ]);

    expect(status).toMatchObject({
      safeFailureCategory: "runtime-observation",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(publicPayloads).toContain("runtime-observation");
    expect(publicPayloads).not.toMatch(
      /generated-map-mod-not-enabled|activeTargetModSet|base-standard|mapScript|mod-swooper-studio-run|\/tmp\/Civ7/
    );

    const diagnostics = await readPrivateRunDiagnostics(runtime, service, status.diagnosticsId);
    expect(diagnostics.sections.setupFailure).toMatchObject({
      requestId: accepted.requestId,
      setupFailureReason: "generated-map-mod-not-enabled",
      activeTargetModSet: {
        available: true,
        identityAvailable: true,
        truncated: false,
        mods: [{ id: "base-standard" }],
      },
    });
  });

  test.each([
    {
      requestId: "run-setup-timeout-private",
      setupFailureReason: "setup-read-timeout",
      directControlCode: "setup-apply-timeout",
    },
    {
      requestId: "run-tuner-unavailable-private",
      setupFailureReason: "tuner-unavailable",
      directControlCode: "connection-failed",
    },
    {
      requestId: "run-direct-control-command-private",
      setupFailureReason: "direct-control-command-failed",
      directControlCode: "unexpected-command-failed",
    },
  ])(
    "keeps $setupFailureReason private while public Run in Game status is safe",
    async ({ directControlCode, requestId, setupFailureReason }) => {
      const { runtime } = makeRuntime({
        civ7: {
          prepareSetup: () =>
            Effect.fail(
              dependencyUnavailable({
                message: "Civ7 setup control is unavailable",
                dependency: "direct-control",
                directControlCode,
                diagnostics: {
                  code: setupFailureReason,
                  setupFailureReason,
                  directControlCode,
                },
              })
            ),
        },
      });
      const service = await runtime.runPromise(StudioOperationRuntime);

      const accepted = await runtime.runPromise(
        service.runInGameStart(runInGameInput({ requestId }))
      );
      await expect
        .poll(async () => {
          const status = await runtime.runPromise(
            service.runInGameStatus({ requestId: accepted.requestId })
          );
          return status.status;
        })
        .toBe("failed");

      const status = await runtime.runPromise(
        service.runInGameStatus({ requestId: accepted.requestId })
      );
      expect(status).toMatchObject({
        safeFailureCategory: "runtime-control",
        diagnosticsId: accepted.diagnosticsId,
      });
      expect(JSON.stringify(status)).not.toContain(setupFailureReason);

      const diagnostics = await readPrivateRunDiagnostics(runtime, service, status.diagnosticsId);
      expect(diagnostics.sections.setupFailure).toMatchObject({
        setupFailureReason,
        directControlCode,
      });
    }
  );

  test("keeps setup-map-row-mismatched private while public Run in Game status is safe", async () => {
    const { runtime } = makeRuntime({
      civ7: {
        prepareSetup: () =>
          Effect.fail(
            proofFailed({
              message:
                "Civ7 selected a different setup map row than the generated Studio Run map.",
              reason: "exact-authorship-mismatch",
              diagnostics: {
                code: "setup-map-row-mismatched",
                setupFailureReason: "setup-map-row-mismatched",
                mapScript: "{mod-swooper-studio-run}/maps/run-test.js",
                observedMapScripts: ["{base-standard}/maps/continents.js"],
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

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const publicPayload = JSON.stringify(status);
    expect(status).toMatchObject({
      safeFailureCategory: "runtime-observation",
      diagnosticsId: accepted.diagnosticsId,
    });
    expect(publicPayload).not.toMatch(
      /setup-map-row-mismatched|observedMapScripts|base-standard|mapScript|mod-swooper-studio-run/
    );

    const diagnostics = await readPrivateRunDiagnostics(runtime, service, status.diagnosticsId);
    expect(diagnostics.sections.setupFailure).toMatchObject({
      setupFailureReason: "setup-map-row-mismatched",
      observedMapScripts: ["{base-standard}/maps/continents.js"],
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

  test("scoped disposal interrupts active workers and projects runtime-disposed status", async () => {
    const blocker = deferred<void>();
    const { runtime } = makeRuntime({
      ports: {
        buildRunInGameProof: async () => {
          await blocker.promise;
          return { result: { ok: true } };
        },
      },
    });

    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await runtime.dispose();

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
    blocker.resolve();
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
          phase: "waiting-for-proof",
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
    const privateOperation = await readPrivateRunOperation(
      second.runtime,
      secondService,
      abandoned.diagnosticsId
    );
    expect(privateOperation.failure).toMatchObject({
      tag: "OperationBlocked",
      diagnostics: { code: "run-in-game-ownership-lost-after-restart" },
    });

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
    const entries = await readdir(join(workspaceRoot, requestId));
    expect(entries.some((entry) => entry.startsWith("operation-record.json.corrupt-"))).toBe(true);
    await expect(
      runtime.runPromise(service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      status: "running",
    });
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
          phase: "waiting-for-proof",
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
          phase: "waiting-for-proof",
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
          buildRunInGameProof: async () => {
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
        .toBe("waiting-for-proof");

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

  test("daemon startup releases live-pid leases without matching heartbeat proof", async () => {
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
      runtime.runPromise(
        service.saveDeployStart({ requestId: "save-after-stale", id: "test-config", envelope: {} })
      )
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
          buildRunInGameProof: async () => {
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
          buildRunInGameProof: async () => {
            await blocker.promise;
            return { result: { ok: true } };
          },
        },
      });
      const second = makeRuntime({
        ports: {
          runInGameWorkspaceRoot: workspaceRoot,
          buildRunInGameProof: async () => {
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
      service.saveDeployStart({ requestId: "save-idempotent", id: "test-config", envelope: {} })
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
      runtime.runPromise(
        service.saveDeployStart({ requestId: "save-idempotent", id: "test-config", envelope: {} })
      )
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
        id: "test-config",
        envelope: {},
      })
    );
    const duplicate = await runtime.runPromise(
      service.saveDeployStart({
        requestId: "save-idempotent-active",
        id: "test-config",
        envelope: {},
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
      expectEffectFailure(
        service.saveDeployStart({ requestId: "save-1", id: "test-config", envelope: {} })
      )
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
        id: "test-config",
        envelope: {},
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
        phase: "resolving-source",
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
      service.saveDeployStart({ requestId: "save-accepted", id: "test-config", envelope: {} })
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
    readRunInGameCatalogSource: async ({ catalogSourceId }) => ({
      catalogSourceId,
      configPath: `mods/mod-swooper-maps/src/maps/configs/${catalogSourceId}.config.json`,
      name: catalogSourceId,
      description: catalogSourceId,
      sortIndex: 900,
      config: {},
    }),
    deployRunInGame: async ({ requestId, generatedMod }) =>
      runInGameDeployment({ requestId, materialization: generatedMod.materialization }),
    waitForRunInGameLogProof: async () => ({ result: { ok: true } }),
    observeRunInGameRuntime: async ({ requestId, prepared, deployment, log }) =>
      runInGameRuntimeObservation({ requestId, prepared, deployment, log }),
    buildRunInGameProof: async () => ({ result: { ok: true } }),
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
      mapScript: "{mod-swooper-studio-run}/maps/run-test.js",
      configHash: "test-config-hash",
      envelopeHash: "test-envelope-hash",
      generationManifestDigest: "test-generation-manifest-digest",
      runArtifactId: "run-test",
      generatedModRoot: join(tmpdir(), "studio-generated-run-test"),
      generatedModFileCount: 1,
      generatedModDigest: "test-generated-mod-digest",
      mapRowId: "MAP_RUN_TEST",
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
      path: "maps/run-test.js",
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
    log?: Awaited<ReturnType<StudioOperationRuntimePorts["waitForRunInGameLogProof"]>>;
  }>
): Awaited<ReturnType<StudioOperationRuntimePorts["observeRunInGameRuntime"]>> {
  const materialization = args.deployment.materialization;
  const correlation = {
    requestId: args.requestId,
    runArtifactId: materialization?.runArtifactId ?? "run-test",
    launchSourceDigest: args.prepared.launchSourceDigest,
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
      matchedMarkers: ["[mapgen-proof]", args.requestId, "[mapgen-complete]"],
      proof: args.log?.logProof,
    },
    setupRow: {
      requestId: args.requestId,
      correlation,
      state: "matched",
      mapScript: materialization?.mapScript ?? "test-map-script",
      runArtifactId: correlation.runArtifactId,
      deployedModId: args.deployment.runDeployment.deployedModId,
      rowProof: { ok: true },
      rowVisibility: { visible: true },
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
  const selectedConfig = overrides.selectedConfig;
  const config =
    overrides.source?.kind === "editor"
      ? overrides.source.payload.pipelineConfig
      : isRecord(overrides.config)
        ? overrides.config
        : {};
  const source =
    overrides.source ??
    (overrides.materialization?.mode === "durable" && typeof selectedConfig?.id === "string"
      ? {
          kind: "catalog" as const,
          catalogSourceId: selectedConfig.id,
        }
      : {
          kind: "editor" as const,
          editorSessionId: "test-editor-session",
          payload: {
            configId: "studio-current",
            label: selectedConfig?.label ?? "Studio Current",
            ...(selectedConfig?.description === undefined
              ? {}
              : { description: selectedConfig.description }),
            mapScript: "{swooper-maps}/maps/studio-current.js",
            pipelineConfig: config,
            recipeId: "mod-swooper-maps/standard",
            sortIndex: selectedConfig?.sortIndex ?? 9999,
            ...(selectedConfig?.latitudeBounds === undefined
              ? {}
              : { latitudeBounds: selectedConfig.latitudeBounds }),
          },
        });
  return {
    source,
    recipeSettings: {
      recipe: "mod-swooper-maps/standard",
      seed: overrides.seed ?? 43,
      ...overrides.recipeSettings,
    },
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

type RunInGameInputOverrides = Partial<StudioInputs["runInGame"]["start"]> &
  Readonly<{
    seed?: string | number;
    mapSize?: string;
    resources?: string;
    playerCount?: number;
    materialization?: Readonly<{ mode?: string }>;
    config?: unknown;
    sourceSnapshot?: unknown;
    selectedConfig?: Readonly<{
      id?: string;
      label?: string;
      description?: string;
      sourcePath?: string;
      sortIndex?: number;
      latitudeBounds?: unknown;
    }>;
  }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function makeCiv7WorkflowControlLayer(
  overrides: Partial<Civ7WorkflowControlApi> = {}
): Layer.Layer<Civ7WorkflowControl> {
  const service: Civ7WorkflowControlApi = {
    checkPlayable: () => Effect.void,
    prepareSetup: () => Effect.succeed({}),
    startGame: () => Effect.succeed({}),
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
