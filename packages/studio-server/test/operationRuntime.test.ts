import { Effect, ManagedRuntime } from "effect";
import { afterEach, describe, expect, test } from "vitest";

import { createStudioEventHub, type StudioEventHubApi } from "../src/services/StudioEventHub";
import {
  makeStudioOperationRuntimeLayer,
  StudioOperationRuntime,
  type StudioOperationRuntimePorts,
} from "../src/operationRuntime";
import type { StudioEvent } from "../src/contract/studio";

const openRuntimes: ManagedRuntime.ManagedRuntime<StudioOperationRuntime, never>[] = [];
const openEventHubs: StudioEventHubApi[] = [];

afterEach(async () => {
  await Promise.all(openRuntimes.splice(0).map((runtime) => runtime.dispose()));
  await Promise.all(openEventHubs.splice(0).map((eventHub) => eventHub.shutdown()));
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
    expect(eventHub.activeSubscriberCount()).toBe(0);
  });

  test("preserves source snapshot proof in the runtime-owned request projection", async () => {
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart({
        recipeId: "mod-swooper-maps/standard",
        sourceSnapshot: {
          recipeSettings: { seed: "123" },
          worldSettings: { mapSize: "tiny" },
          pipelineConfig: { example: true },
          setupConfig: { players: [] },
          materializationMode: "disposable",
          selectedConfig: { id: "current" },
        },
      })
    );

    expect(accepted.request?.sourceSnapshot).toMatchObject({
      requestId: accepted.requestId,
      recipeSettings: { seed: "123" },
      worldSettings: { mapSize: "tiny" },
      pipelineConfig: { example: true },
      setupConfig: { players: [] },
      materializationMode: "disposable",
      selectedConfig: { id: "current" },
      identityHash: expect.any(String),
      configHash: expect.any(String),
      envelopeHash: expect.any(String),
    });
  });

  test("keeps one source snapshot proof identity across runtime projections and final proof", async () => {
    const events: StudioEvent[] = [];
    const eventHub = createStudioEventHub();
    openEventHubs.push(eventHub);
    const recordingEventHub: StudioEventHubApi = {
      ...eventHub,
      publish: async (event) => {
        events.push(event);
        await eventHub.publish(event);
      },
    };
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts({
          waitForRunInGameProof: async ({ requestId, prepared, deployment }) => ({
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
          }),
        }),
        eventHub: recordingEventHub,
      })
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart({
        recipeId: "mod-swooper-maps/standard",
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
    );
    const acceptedSourceSnapshot = accepted.request?.sourceSnapshot;
    expect(acceptedSourceSnapshot).toBeDefined();

    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const current = await runtime.runPromise(service.operationsCurrent);
    const currentRecord = current.runInGame.recent.find(
      (operation) => operation.requestId === accepted.requestId
    );
    const operationEvents = events.filter(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId
    );

    expect(status.request?.sourceSnapshot).toEqual(acceptedSourceSnapshot);
    expect(currentRecord?.request?.sourceSnapshot).toEqual(acceptedSourceSnapshot);
    expect(operationEvents.some((event) => event.status.request?.sourceSnapshot)).toBe(true);
    expect(
      operationEvents.every(
        (event) =>
          event.status.request?.sourceSnapshot === undefined ||
          event.status.request.sourceSnapshot.identityHash === acceptedSourceSnapshot?.identityHash
      )
    ).toBe(true);
    expect(status.exactAuthorshipProof?.sourceSnapshot).toEqual(acceptedSourceSnapshot);
  });

  test("returns duplicate Run in Game fingerprint from the runtime registry", async () => {
    const blocker = deferred<void>();
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async () => {
          await blocker.promise;
          return {};
        },
      },
    });

    const service = await runtime.runPromise(StudioOperationRuntime);
    const first = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    const second = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );

    expect(second.requestId).toBe(first.requestId);
    expect(second.details).toMatchObject({
      duplicateRequest: true,
      activeRequestId: first.requestId,
    });

    blocker.resolve();
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: first.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    const duplicateAfterComplete = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    expect(duplicateAfterComplete.requestId).toBe(first.requestId);
    expect(duplicateAfterComplete.details).toMatchObject({
      duplicateRequest: true,
      activeRequestId: first.requestId,
    });
  });

  test("returns duplicate Run in Game fingerprint after a failed terminal record", async () => {
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async () => {
          throw new Error("deploy failed before launch");
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    const first = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: first.requestId })
        );
        return status.status === "running" ? "running" : "terminal";
      }, { timeout: 5_000 })
      .toBe("terminal");

    const duplicateAfterFailure = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    expect(duplicateAfterFailure.requestId).toBe(first.requestId);
    expect(duplicateAfterFailure.details).toMatchObject({
      duplicateRequest: true,
      activeRequestId: first.requestId,
    });
  }, 10_000);

  test("rejects cross-operation mutation while a worker is active", async () => {
    const blocker = deferred<void>();
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async () => {
          await blocker.promise;
          return {};
        },
      },
    });

    const service = await runtime.runPromise(StudioOperationRuntime);
    const run = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
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

  test("blocked starts do not call mutation leaf ports", async () => {
    const blocker = deferred<void>();
    let savePrepareCalls = 0;
    let autoplayCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        deployRunInGame: async () => {
          await blocker.promise;
          return {};
        },
        prepareSaveDeployStart: async () => {
          savePrepareCalls += 1;
          return {};
        },
        runAutoplay: async (input) => {
          autoplayCalls += 1;
          return {
            ok: true,
            action: input.action,
            autoplay: {},
            game: {},
            gameContext: {},
            result: {},
          };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await runtime.runPromise(service.runInGameStart({ recipeId: "mod-swooper-maps/standard" }));
    await expect(
      expectFailure(
        runtime,
        service.saveDeployStart({ requestId: "save-1", id: "test-config", envelope: {} })
      )
    ).resolves.toMatchObject({ tag: "OperationBlocked" });
    await expect(expectFailure(runtime, service.autoplay({ action: "start" }))).resolves.toMatchObject({
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
    const { runtime } = makeRuntime({
      ports: {
        deploySavedMapConfig: async () => {
          throw new Error("deploy failed");
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
      },
    });

    await expect(
      runtime.runPromise(service.runInGameStart({ recipeId: "mod-swooper-maps/standard" }))
    ).resolves.toMatchObject({
      ok: true,
      status: "running",
    });
  });

  test("maps status misses to runtime-owned not-found failures with identity available", async () => {
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(
        runtime,
        service.runInGameStatus({ requestId: "missing" })
      )
    ).resolves.toMatchObject({
      tag: "OperationNotFound",
      requestId: "missing",
    });
  });

  test("scoped disposal interrupts active workers and projects runtime-disposed status", async () => {
    const blocker = deferred<void>();
    const { runtime } = makeRuntime({
      ports: {
        waitForRunInGameProof: async () => {
          await blocker.promise;
          return { result: { ok: true } };
        },
      },
    });

    const service = await runtime.runPromise(StudioOperationRuntime);
    const accepted = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    await runtime.dispose();

    await expect(
      Effect.runPromise(Effect.either(service.runInGameStatus({ requestId: accepted.requestId })))
    ).resolves.toMatchObject({
      _tag: "Right",
      right: {
        requestId: accepted.requestId,
        phase: "failed",
        status: "failed",
        error: "Studio operation runtime disposed while operation was still running.",
        details: {
          code: "studio-operation-runtime-disposed",
        },
      },
    });
    await expect(
      expectEffectFailure(service.runInGameStart({ recipeId: "mod-swooper-maps/standard" }))
    ).resolves.toMatchObject({
      tag: "RuntimeDisposed",
      reason: "runtime-disposed",
    });
    blocker.resolve();
  });

  test("post-disposal starts do not call leaf ports for any mutation", async () => {
    let materializeCalls = 0;
    let savePrepareCalls = 0;
    let autoplayCalls = 0;
    const { runtime } = makeRuntime({
      ports: {
        materializeRunInGame: async () => {
          materializeCalls += 1;
          return {};
        },
        prepareSaveDeployStart: async () => {
          savePrepareCalls += 1;
          return {};
        },
        runAutoplay: async (input) => {
          autoplayCalls += 1;
          return {
            ok: true,
            action: input.action,
            autoplay: {},
            game: {},
            gameContext: {},
            result: {},
          };
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);
    await runtime.dispose();

    await expect(
      expectEffectFailure(service.runInGameStart({ recipeId: "mod-swooper-maps/standard" }))
    ).resolves.toMatchObject({ tag: "RuntimeDisposed" });
    await expect(
      expectEffectFailure(
        service.saveDeployStart({ requestId: "save-1", id: "test-config", envelope: {} })
      )
    ).resolves.toMatchObject({ tag: "RuntimeDisposed" });
    await expect(
      expectEffectFailure(service.autoplay({ action: "stop" }))
    ).resolves.toMatchObject({ tag: "RuntimeDisposed" });

    expect(materializeCalls).toBe(0);
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

    const accepted = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    now = new Date("2026-06-10T00:00:00.100Z");
    await expect(
      expectFailure(runtime, service.runInGameStatus({ requestId: accepted.requestId }))
    ).resolves.toMatchObject({
      tag: "OperationExpired",
      requestId: accepted.requestId,
    });
    await expect(
      expectFailure(
        runtime,
        service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
      )
    ).resolves.toMatchObject({
      tag: "OperationExpired",
      requestId: accepted.requestId,
    });
  });

  test("operation event publish failure does not change registry truth", async () => {
    const eventHub = createStudioEventHub();
    openEventHubs.push(eventHub);
    const failingEventHub: StudioEventHubApi = {
      ...eventHub,
      publish: async () => {
        throw new Error("event sink failed");
      },
    };
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts(),
        eventHub: failingEventHub,
      })
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");
  });

  test("publishes accepted and transition events from runtime projections", async () => {
    const events: StudioEvent[] = [];
    const eventHub = createStudioEventHub();
    openEventHubs.push(eventHub);
    const recordingEventHub: StudioEventHubApi = {
      ...eventHub,
      publish: async (event) => {
        events.push(event);
        await eventHub.publish(event);
      },
    };
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts(),
        eventHub: recordingEventHub,
      })
    );
    openRuntimes.push(runtime);
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart({ recipeId: "mod-swooper-maps/standard" })
    );
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

    const operationEvents = events.filter((event) => event.type === "operation");
    expect(operationEvents[0]).toMatchObject({
      type: "operation",
      kind: "run-in-game",
      status: {
        requestId: accepted.requestId,
        phase: "materializing",
        status: "running",
      },
    });
    expect(operationEvents.map((event) => event.status.phase)).toContain("complete");
  });

  test("publishes accepted Save/Deploy event before leaf prepare work continues", async () => {
    const events: StudioEvent[] = [];
    const prepareBlocker = deferred<void>();
    const eventHub = createStudioEventHub();
    openEventHubs.push(eventHub);
    const recordingEventHub: StudioEventHubApi = {
      ...eventHub,
      publish: async (event) => {
        events.push(event);
        await eventHub.publish(event);
      },
    };
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts({
          prepareSaveDeployStart: async () => {
            await prepareBlocker.promise;
            return {};
          },
        }),
        eventHub: recordingEventHub,
      })
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
  });
});

function makeRuntime(overrides: {
  ports?: Partial<StudioOperationRuntimePorts>;
  ttlMs?: number;
} = {}) {
  const eventHub = createStudioEventHub();
  openEventHubs.push(eventHub);
  const ports: StudioOperationRuntimePorts = {
    ...makePorts(),
    ...overrides.ports,
  };
  const runtime = ManagedRuntime.make(
    makeStudioOperationRuntimeLayer({
      ports,
      eventHub,
      ttlMs: overrides.ttlMs,
    })
  );
  openRuntimes.push(runtime);
  return { runtime, eventHub };
}

function makePorts(overrides: Partial<StudioOperationRuntimePorts> = {}): StudioOperationRuntimePorts {
  return {
    clock: {
      now: () => new Date("2026-06-10T00:00:00.000Z"),
    },
    materializeRunInGame: async () => ({}),
    deployRunInGame: async () => ({}),
    checkCiv7ForRunInGame: async () => undefined,
    prepareSetupForRunInGame: async () => ({}),
    startGameForRunInGame: async () => ({}),
    waitForRunInGameProof: async () => ({ result: { ok: true } }),
    prepareSaveDeployStart: async () => ({}),
    saveMapConfig: async () => ({
      path: "mods/mod-swooper-maps/src/maps/configs/test.config.json",
      saved: true,
    }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    runAutoplay: async (input) => ({
      ok: true,
      action: input.action,
      autoplay: {},
      game: {},
      gameContext: {},
      result: {},
    }),
    ...overrides,
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

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
