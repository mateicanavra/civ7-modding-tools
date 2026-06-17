import { Effect, Layer, ManagedRuntime } from "effect";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";
import { afterEach, describe, expect, test } from "vitest";
import type { StudioInputs } from "../src/context";
import { operationStatusTypeSchema } from "../src/contract/runInGame";
import { operationsCurrent, type StudioEvent, studioEventSchema } from "../src/contract/studio";
import { invalidRequest } from "../src/errors/failure";
import {
  makeStudioOperationRuntimeLayer,
  StudioOperationRuntime,
  type StudioOperationRuntimePorts,
} from "../src/operationRuntime";
import { Civ7WorkflowControl, type Civ7WorkflowControlApi } from "../src/ports";
import { StudioEventHub, type StudioEventHubApi } from "../src/services/StudioEventHub";
import { typeboxOutputSchemaFromContractProcedure } from "../src/typeboxStandardSchema";

const openRuntimes: ManagedRuntime.ManagedRuntime<unknown, never>[] = [];

afterEach(async () => {
  await Promise.all(openRuntimes.splice(0).map((runtime) => runtime.dispose()));
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

  test("reports active operations only in active and excludes them from recent", async () => {
    const runBlocker = deferred<void>();
    const { runtime: runRuntime } = makeRuntime({
      ports: {
        deployRunInGame: async () => {
          await runBlocker.promise;
          return {};
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
      .toBe("complete");
    const save = await runtime.runPromise(
      service.saveDeployStart({ requestId: "save-terminal", id: "test-config", envelope: {} })
    );
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
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    const accepted = await runtime.runPromise(
      service.runInGameStart(
        runInGameInput({
          sourceSnapshot: {
            recipeSettings: { seed: "123" },
            worldSettings: { mapSize: "tiny" },
            pipelineConfig: { example: true },
            setupConfig: { players: [] },
            materializationMode: "disposable",
            selectedConfig: { id: "current" },
          },
        })
      )
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
    const recordingEventHub = makeEventHub({ eventSink: events });
    const runtime = ManagedRuntime.make(
      makeStudioOperationRuntimeLayer({
        ports: makePorts({
          buildRunInGameProof: async ({ requestId, prepared, deployment }) => ({
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

  test("rejects raw-control Run in Game payloads before admission", async () => {
    const events: StudioEvent[] = [];
    let materializeCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        materializeRunInGame: async () => {
          materializeCalls += 1;
          return {};
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
    expect(materializeCalls).toBe(0);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toEqual([]);
  });

  test("rejects missing Run in Game config before admission", async () => {
    const events: StudioEvent[] = [];
    let materializeCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        materializeRunInGame: async () => {
          materializeCalls += 1;
          return {};
        },
      },
    });
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(runtime, service.runInGameStart(runInGameInput({ config: undefined })))
    ).resolves.toMatchObject({
      tag: "InvalidRequest",
      reason: "invalid-request",
      diagnostics: { code: "run-in-game-config-invalid" },
    });

    const current = await runtime.runPromise(service.operationsCurrent);
    expect(events).toEqual([]);
    expect(materializeCalls).toBe(0);
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
    let materializeCalls = 0;
    const { runtime } = makeRuntime({
      eventSink: events,
      ports: {
        materializeRunInGame: async () => {
          materializeCalls += 1;
          return {};
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
    expect(materializeCalls).toBe(0);
    expect(current.runInGame.active).toBeNull();
    expect(current.runInGame.recent).toEqual([]);
  });

  test("preserves a valid setup mapScript in the canonical prepared request", async () => {
    const mapScript = "{swooper-maps}/maps/studio-current.js";
    let observedMapScript: string | undefined;
    const { runtime } = makeRuntime({
      ports: {
        materializeRunInGame: async ({ prepared }) => {
          observedMapScript = prepared.request.setupConfig?.mapScript;
          return {};
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

    expect(accepted.request?.setupConfig?.mapScript).toBe(mapScript);
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");
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
        return status.phase;
      })
      .toBe("failed");

    const status = await runtime.runPromise(
      service.runInGameStatus({ requestId: accepted.requestId })
    );
    const current = await runtime.runPromise(service.operationsCurrent);
    const terminalEvent = events.find(
      (event) =>
        event.type === "operation" &&
        event.kind === "run-in-game" &&
        event.status.requestId === accepted.requestId &&
        event.status.phase === "failed"
    );

    expect(observedSeed).toBe(43);
    expect(status.details?.materialization).toBeUndefined();
    expect(status.details?.materializationSummary).toContain("studio-current.js");
    expectTypeboxValid(operationStatusTypeSchema, status);
    expectTypeboxValid(typeboxOutputSchemaFromContractProcedure(operationsCurrent), current);
    expectTypeboxValid(studioEventSchema, terminalEvent);
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
    const first = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    const second = await runtime.runPromise(service.runInGameStart(runInGameInput()));

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
      service.runInGameStart(runInGameInput())
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

    const duplicateAfterFailure = await runtime.runPromise(
      service.runInGameStart(runInGameInput())
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
      ok: true,
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
      ok: true,
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
      ok: true,
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
        code: string;
        reason: string;
        failedAtPhase: string;
        recoveryActions?: string[];
      };
    }> = [
      {
        requestId: "run-materialize-fail",
        ports: {
          materializeRunInGame: async () => {
            throw new Error("materialize failed");
          },
        },
        expected: {
          status: "failed",
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
          code: "run-in-game-log-proof-missing",
          reason: "log-proof-missing",
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
          return status.status;
        })
        .toBe(entry.expected.status);

      const failed = await runtime.runPromise(
        service.runInGameStatus({ requestId: accepted.requestId })
      );
      expect(failed).toMatchObject({
        ok: false,
        requestId: accepted.requestId,
        phase: entry.expected.status,
        status: entry.expected.status,
        details: {
          failureClass: entry.expected.status,
          code: entry.expected.code,
          reason: entry.expected.reason,
          failedAtPhase: entry.expected.failedAtPhase,
        },
      });
      for (const action of entry.expected.recoveryActions ?? []) {
        expect(failed.recoveryActions).toContain(action);
      }
      expect(failed.details?.cause).toEqual(failed.error);
      expectTypeboxValid(operationStatusTypeSchema, failed);
    }
  });

  test("maps status misses to runtime-owned not-found failures with identity available", async () => {
    const { runtime } = makeRuntime();
    const service = await runtime.runPromise(StudioOperationRuntime);

    await expect(
      expectFailure(runtime, service.runInGameStatus({ requestId: "missing" }))
    ).resolves.toMatchObject({
      tag: "OperationNotFound",
      requestId: "missing",
    });
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
        error: "Studio operation runtime disposed while operation was still running.",
        details: {
          code: "studio-operation-runtime-disposed",
        },
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

    const accepted = await runtime.runPromise(service.runInGameStart(runInGameInput()));
    await expect
      .poll(async () => {
        const status = await runtime.runPromise(
          service.runInGameStatus({ requestId: accepted.requestId })
        );
        return status.phase;
      })
      .toBe("complete");

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
    await expect(
      expectFailure(runtime, service.runInGameStart(runInGameInput()))
    ).resolves.toMatchObject({
      tag: "OperationExpired",
      requestId: accepted.requestId,
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
      .toBe("complete");
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
  } = {}
) {
  const eventHub = makeEventHub({ eventSink: overrides.eventSink });
  const ports: StudioOperationRuntimePorts = {
    ...makePorts(),
    ...overrides.ports,
  };
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
  }> = {}
): StudioEventHubApi {
  return {
    publish: (event) =>
      options.publishFailure === undefined
        ? Effect.sync(() => {
            options.eventSink?.push(event);
          })
        : Effect.fail(options.publishFailure),
    subscribe: () => Effect.die("operation runtime tests do not subscribe to StudioEventHub"),
    activeSubscriberCount: Effect.succeed(0),
  };
}

function makePorts(
  overrides: Partial<StudioOperationRuntimePorts> = {}
): StudioOperationRuntimePorts {
  return {
    clock: {
      now: () => new Date("2026-06-10T00:00:00.000Z"),
    },
    materializeRunInGame: async () => ({}),
    deployRunInGame: async () => ({}),
    waitForRunInGameLogProof: async () => ({ result: { ok: true } }),
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

function runInGameInput(
  overrides: Partial<StudioInputs["runInGame"]["start"]> = {}
): StudioInputs["runInGame"]["start"] {
  return {
    recipeId: "mod-swooper-maps/standard",
    seed: 43,
    mapSize: "MAPSIZE_STANDARD",
    config: {},
    ...overrides,
  };
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

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
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

function expectTypeboxValid(schema: TSchema, value: unknown): void {
  const errors = [...Value.Errors(schema, value)].map((error) => ({
    message: error.message,
    path: error.path,
  }));
  expect(errors).toEqual([]);
}
