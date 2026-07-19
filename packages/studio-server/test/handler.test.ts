import { once } from "node:events";
import { rm } from "node:fs/promises";
import { createServer, type RequestListener, type Server } from "node:http";
import { createServer as createTunerServer, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type Civ7AutoplayActionResult,
  type Civ7PlayableStatusResult,
  type Civ7RuntimeProbe,
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
} from "@civ7/direct-control";
import type { JsonWireObject } from "@civ7/studio-contract";
import { createRunArtifactId } from "@civ7/studio-run-workspace";
import { createORPCClient, isDefinedError, ORPCError, safe } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Effect, Layer, ManagedRuntime, Option } from "effect";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  Civ7TunerClient,
  createStudioRouter,
  createStudioRpcHandler,
  StudioConfig,
  type StudioEvent,
  StudioEventHub,
  type StudioEventHubApi,
  StudioEventHubLive,
  type StudioInputs,
  type StudioOperationRuntimePorts,
  type StudioRouter,
  type StudioRouterRuntime,
  type StudioRpcHandle,
  type StudioServerContext,
  studioEventSubscriptionIterator,
  verificationFailed,
} from "../src/index";
import {
  makeStudioOperationRuntimeLayer,
  StudioOperationRuntime,
  type StudioOperationRuntimeApi,
} from "../src/operationRuntime/index";
import { Civ7WorkflowControl, type Civ7WorkflowControlApi } from "../src/ports";

const openServers: Server[] = [];
const openHandles: StudioRpcHandle[] = [];
const runtimeWorkspaceRoots: string[] = [];
let runtimeWorkspaceSequence = 0;

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
  await Promise.all(openHandles.splice(0).map((handle) => handle.dispose()));
  await Promise.all(
    runtimeWorkspaceRoots.splice(0).map((root) => rm(root, { recursive: true, force: true }))
  );
});

describe("studio-server RPC handler", () => {
  test("serves stateful Studio operations through the native effect-oRPC handler", async () => {
    const calls: string[] = [];
    const context = makeContext({
      operationRuntime: makeOperationRuntimePorts({
        prepareSaveDeployStart: async ({ requestId }) => {
          calls.push(`prepare:${requestId}`);
          return {};
        },
        saveMapConfig: async ({ requestId }) => {
          calls.push(`save:${requestId}`);
          return { saved: true };
        },
        deploySavedMapConfig: async ({ requestId }) => {
          calls.push(`deploy:${requestId}`);
          return { deployed: true };
        },
      }),
    });
    const client = await listenWithClient(context);

    const serverInfo = await client.studio.serverInfo({});
    expect(serverInfo).toEqual({
      ok: true,
      serverInstanceId: expect.stringMatching(/^studio-server-/),
      startedAt: "2026-06-10T00:00:00.000Z",
      runInGameApiVersion: 2,
      viteCommand: "serve",
    });
    await expect(
      client.mapConfigs.saveDeploy({
        requestId: "save-1",
        canonicalConfig: testCanonicalConfig({ id: "test-config", name: "Test Config" })
          .canonicalConfig,
      })
    ).resolves.toMatchObject({
      ok: true,
      requestId: "save-1",
      phase: "queued",
      status: "running",
    });
    await expect
      .poll(async () => (await client.mapConfigs.status({ requestId: "save-1" })).phase)
      .toBe("complete");
    await expect(client.mapConfigs.status({ requestId: "save-1" })).resolves.toMatchObject({
      ok: true,
      requestId: "save-1",
      phase: "complete",
      status: "complete",
      saved: true,
      deployed: true,
    });
    await expect(client.studio.operations.current({})).resolves.toMatchObject({
      ok: true,
      serverInstanceId: serverInfo.serverInstanceId,
      runInGame: { active: null, recent: [] },
      saveDeploy: {
        active: null,
        recent: [
          {
            requestId: "save-1",
            phase: "complete",
            status: "complete",
          },
        ],
      },
    });
    expect(calls).toEqual(["prepare:save-1", "save:save-1", "deploy:save-1"]);
  }, 10_000);

  test("maps runtime operation conflicts as the DEFINED SAVE_DEPLOY_BLOCKED error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const blocker = deferred<void>();
    try {
      const context = makeContext({
        operationRuntime: makeOperationRuntimePorts({
          deployRunInGame: async ({ requestId, generatedMod }) => {
            await blocker.promise;
            return runInGameDeployment({
              requestId,
              materialization: generatedMod.materialization,
            });
          },
        }),
      });
      const client = await listenWithClient(context);
      await client.runInGame.start(runInGameStartInput());

      const { error } = await safe(
        client.mapConfigs.saveDeploy({
          requestId: "save-1",
          canonicalConfig: testCanonicalConfig({ id: "test-config", name: "Test Config" })
            .canonicalConfig,
        })
      );
      blocker.resolve();

      expect(error).toBeInstanceOf(ORPCError);
      if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
      expect(isDefinedError(error)).toBe(true);
      expect(error.code).toBe("SAVE_DEPLOY_BLOCKED");
      expect(error.status).toBe(409);
      expect(error.message).toBe("Save/Deploy is blocked by another Studio operation.");
      expect(error.data).toEqual({
        namespace: "saveDeploy",
        recoveryActions: ["copy-diagnostics", "retry-status"],
        safeFailureCategory: "ownership",
      });
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      blocker.resolve();
      consoleError.mockRestore();
    }
  });

  test("delivers a run-in-game status miss as RUN_IN_GAME_STATUS_NOT_FOUND without daemon identity", async () => {
    const context = makeContext();
    const client = await listenWithClient(context);

    const { error } = await safe(client.runInGame.status({ requestId: "run-1" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("RUN_IN_GAME_STATUS_NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({
      namespace: "runInGame",
      recoveryActions: ["copy-diagnostics", "retry-status"],
      requestId: "run-1",
      safeFailureCategory: "request-validation",
    });
  });

  test("serves private Run in Game attribution through diagnostics lookup only", async () => {
    const runtime = makeTestStudioRuntime(makeContext());
    const client = directRuntimeClient(runtime);
    const iterator = await client.studio.events.watch({});
    try {
      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "hello" },
      });

      const accepted = await client.runInGame.start(runInGameStartInput());
      const diagnosticsId = Option.fromNullable(accepted.diagnosticsId).pipe(
        Option.getOrThrowWith(() => new Error("Expected accepted run diagnostics id"))
      );

      const runEvent = await readOperationEvent(
        iterator,
        (event) => event.kind === "run-in-game" && event.status.requestId === accepted.requestId
      );
      await expect
        .poll(async () => (await client.runInGame.status({ requestId: accepted.requestId })).phase)
        .toBe("completed");

      const status = await client.runInGame.status({ requestId: accepted.requestId });
      const current = await client.studio.operations.current({});
      for (const publicValue of [accepted, runEvent, status, current]) {
        expect(JSON.stringify(publicValue)).not.toContain("attribution");
      }

      await expect
        .poll(async () => {
          const lookup = await client.runInGame.diagnostics({
            diagnosticsId,
          });
          return lookup.ok && hasCompleteAttributionReport(lookup.diagnostics.sections.attribution);
        })
        .toBe(true);
      const diagnostics = await client.runInGame.diagnostics({
        diagnosticsId,
      });
      expect(diagnostics.ok).toBe(true);
      if (!diagnostics.ok) throw new Error("Expected diagnostics lookup result");
      expect(diagnostics.diagnostics.sections.attribution).toMatchObject({
        report: {
          requestId: accepted.requestId,
          status: "complete",
          missingSections: [],
          sections: {
            source: expect.any(Object),
            manifest: expect.any(Object),
            generation: expect.any(Object),
            deployment: expect.any(Object),
            scriptingLogObservation: expect.any(Object),
            setupRowReadback: expect.any(Object),
            boundedLoadedGameReadback: expect.any(Object),
            terminalResult: expect.any(Object),
          },
        },
      });

      await expect(
        client.runInGame.diagnostics({ diagnosticsId: "run-diagnostics-handler-missing" })
      ).resolves.toEqual({
        ok: false,
        diagnosticsId: "run-diagnostics-handler-missing",
        reason: "not-found",
      });
    } finally {
      await iterator.return?.();
      await runtime.dispose();
    }
  }, 10_000);

  test("reports lifecycle setup-row mismatches through safe public RPC status and private diagnostics", async () => {
    const runtime = makeTestStudioRuntime(makeContext(), {
      startSinglePlayer: () =>
        Effect.fail(
          verificationFailed({
            message: "Civ7 setup selected a different map row than the generated Studio Run map.",
            reason: "exact-authorship-mismatch",
            diagnostics: {
              code: "setup-map-row-mismatched",
              setupFailureReason: "setup-map-row-mismatched",
              expectedMapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
              observedMapScripts: ["{base-standard}/maps/continents.js"],
            },
          })
        ),
    });
    const client = directRuntimeClient(runtime);
    try {
      const accepted = await client.runInGame.start(runInGameStartInput());
      if (!accepted.diagnosticsId) throw new Error("Expected accepted run diagnostics id");

      await expect
        .poll(async () => (await client.runInGame.status({ requestId: accepted.requestId })).status)
        .toBe("failed");
      await expect
        .poll(
          async () =>
            (await client.runInGame.status({ requestId: accepted.requestId })).diagnosticsId
        )
        .toBe(accepted.diagnosticsId);

      const status = await client.runInGame.status({ requestId: accepted.requestId });
      const current = await client.studio.operations.current({});
      const publicPayload = JSON.stringify([accepted, status, current]);
      expect(status).toMatchObject({
        status: "failed",
        safeFailureCategory: "runtime-observation",
        diagnosticsId: accepted.diagnosticsId,
      });
      expect(publicPayload).not.toMatch(
        /setup-map-row-mismatched|base-standard|mod-swooper-studio-run|\/tmp\//
      );

      const diagnostics = await client.runInGame.diagnostics({
        diagnosticsId: accepted.diagnosticsId,
      });
      expect(diagnostics.ok).toBe(true);
      if (!diagnostics.ok) throw new Error("Expected diagnostics lookup result");
      expect(diagnostics.diagnostics.sections.setupFailure).toMatchObject({
        setupFailureReason: "setup-map-row-mismatched",
        expectedGeneratedMapFile: "{mod-swooper-studio-run}/maps/studio-run.js",
        observedMapScripts: ["{base-standard}/maps/continents.js"],
      });
    } finally {
      await runtime.dispose();
    }
  }, 10_000);

  test("maps raw-control Run in Game start payloads to the declared invalid-request error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const context = makeContext();
      const client = await listenWithClient(context);

      const { error } = await safe(
        client.runInGame.start({
          ...runInGameStartInput(),
          canonicalConfig: testCanonicalConfig({
            id: "studio-current",
            name: "Studio Current",
            config: { rawJs: "UI.notifyUIReady()" },
          }).canonicalConfig,
        } as StudioInputs["runInGame"]["start"])
      );

      expect(error).toBeInstanceOf(ORPCError);
      if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
      expect(isDefinedError(error)).toBe(true);
      expect(error.code).toBe("RUN_IN_GAME_INVALID");
      expect(error.status).toBe(400);
      expect(error.data).toMatchObject({
        namespace: "runInGame",
        safeFailureCategory: "request-validation",
      });
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  test("serves explicit Run in Game cancellation through the public command", async () => {
    const blocker = deferred<void>();
    let cleanupCalls = 0;
    try {
      const context = makeContext({
        operationRuntime: makeOperationRuntimePorts({
          generateRunInGameMod: async () => ({
            ...generatedRunInGameMod(),
            cleanup: async () => {
              cleanupCalls += 1;
            },
          }),
          deployRunInGame: async ({ requestId, generatedMod }) => {
            await blocker.promise;
            return runInGameDeployment({
              requestId,
              materialization: generatedMod.materialization,
            });
          },
        }),
      });
      const client = await listenWithClient(context);
      const run = await client.runInGame.start(runInGameStartInput());

      await expect
        .poll(async () => (await client.runInGame.status({ requestId: run.requestId })).phase)
        .toBe("deploying");
      let cancelResolved = false;
      const cancelPromise = client.runInGame
        .cancel({ requestId: run.requestId })
        .then((cancelled) => {
          cancelResolved = true;
          return cancelled;
        });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(cancelResolved).toBe(false);

      blocker.resolve();
      await expect(cancelPromise).resolves.toMatchObject({
        requestId: run.requestId,
        status: "cancelled",
        phase: "cancelled",
        safeFailureCategory: "operation-cancelled",
        diagnosticsId: run.diagnosticsId,
      });
      expect(cleanupCalls).toBe(1);
      await expect(client.runInGame.cancel({ requestId: run.requestId })).resolves.toMatchObject({
        requestId: run.requestId,
        status: "cancelled",
        phase: "cancelled",
      });
    } finally {
      blocker.resolve();
    }
  });

  test("does not treat an aborted transport signal as Run in Game cancellation", async () => {
    const blocker = deferred<void>();
    try {
      const context = makeContext({
        operationRuntime: makeOperationRuntimePorts({
          deployRunInGame: async ({ requestId, generatedMod }) => {
            await blocker.promise;
            return runInGameDeployment({
              requestId,
              materialization: generatedMod.materialization,
            });
          },
        }),
      });
      const studioRpc = trackHandle(createStudioRpcHandler(context));
      const controller = new AbortController();
      const client = createORPCClient<RouterClient<StudioRouter>>(
        new RPCLink({
          url: "http://studio.test/rpc",
          fetch: async (request) => {
            const result = await studioRpc.handle(request, { prefix: "/rpc" });
            controller.abort();
            if (!result.matched || !result.response) {
              return new Response("not found", { status: 404 });
            }
            return result.response;
          },
        })
      );

      const run = await client.runInGame.start(runInGameStartInput(), {
        signal: controller.signal,
      });

      await expect
        .poll(async () => (await client.runInGame.status({ requestId: run.requestId })).phase)
        .toBe("deploying");
      await expect(client.runInGame.status({ requestId: run.requestId })).resolves.toMatchObject({
        requestId: run.requestId,
        status: "running",
      });
    } finally {
      blocker.resolve();
    }
  });

  test("delivers a run-in-game cancel miss as RUN_IN_GAME_STATUS_NOT_FOUND without daemon identity", async () => {
    const context = makeContext();
    const client = await listenWithClient(context);

    const { error } = await safe(client.runInGame.cancel({ requestId: "run-1" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("RUN_IN_GAME_STATUS_NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({
      namespace: "runInGame",
      recoveryActions: ["copy-diagnostics", "retry-status"],
      requestId: "run-1",
      safeFailureCategory: "request-validation",
    });
  });

  test("delivers a sealed save/deploy status miss without daemon or diagnostic data", async () => {
    const context = makeContext();
    const client = await listenWithClient(context);

    const { error } = await safe(client.mapConfigs.status({ requestId: "save-1" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("SAVE_DEPLOY_STATUS_NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({
      namespace: "saveDeploy",
      recoveryActions: ["copy-diagnostics", "retry-status"],
      requestId: "save-1",
      safeFailureCategory: "request-validation",
    });
  });

  test("maps recipeDag.get not-found and explicit unavailable errors as defined errors without stack spam", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const notFound = namedError("RecipeDagNotFound", "missing recipe");
      const unavailable = namedError("RecipeDagUnavailable", "recipe DAG unavailable");
      const client = await listenWithClient(
        makeContext({
          recipeDagService: {
            getRecipeDag: async (recipeId) => {
              if (recipeId === "missing/recipe") throw notFound;
              if (recipeId === "unavailable/recipe") throw unavailable;
              return recipeDagResult(recipeId);
            },
          },
        })
      );

      await expect(
        client.recipeDag.get({ recipeId: "mod-swooper-maps/standard" })
      ).resolves.toMatchObject({
        recipeId: "mod-swooper-maps/standard",
        recipeKey: "mod-swooper-maps/standard",
      });

      const missing = await safe(client.recipeDag.get({ recipeId: "missing/recipe" }));
      expect(missing.error).toBeInstanceOf(ORPCError);
      if (!(missing.error instanceof ORPCError)) throw new Error("expected an ORPCError");
      expect(isDefinedError(missing.error)).toBe(true);
      expect(missing.error.code).toBe("RECIPE_DAG_RECIPE_NOT_FOUND");
      expect(missing.error.status).toBe(404);
      expect(missing.error.data).toEqual({
        procedureKey: "recipeDag.get",
        recipeId: "missing/recipe",
      });

      const failed = await safe(client.recipeDag.get({ recipeId: "unavailable/recipe" }));
      expect(failed.error).toBeInstanceOf(ORPCError);
      if (!(failed.error instanceof ORPCError)) throw new Error("expected an ORPCError");
      expect(isDefinedError(failed.error)).toBe(true);
      expect(failed.error.code).toBe("RECIPE_DAG_UNAVAILABLE");
      expect(failed.error.status).toBe(503);
      expect(failed.error.data).toEqual({
        procedureKey: "recipeDag.get",
        recipeId: "unavailable/recipe",
        source: "recipe-dag-service",
      });
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  test("logs unexpected recipeDag.get defects exactly once instead of declaring them expected", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const client = await listenWithClient(
        makeContext({
          recipeDagService: {
            getRecipeDag: async () => {
              throw new TypeError("recipe graph invariant exploded");
            },
          },
        })
      );

      const { error } = await safe(client.recipeDag.get({ recipeId: "broken/recipe" }));

      expect(error).toBeInstanceOf(ORPCError);
      if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
      expect(isDefinedError(error)).toBe(false);
      expect(error.code).not.toBe("RECIPE_DAG_UNAVAILABLE");
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError.mock.calls[0]?.[0]).toBe("[studio-server] rpc error");
    } finally {
      consoleError.mockRestore();
    }
  });

  test("maps read and live RPC unavailable paths to their declared statuses", async () => {
    await withRouterCiv7Client(unavailableTunerClient("tuner unavailable"), async ({ client }) => {
      const status = await safe(client.civ7.status({}));
      expect(status.error).toMatchObject({
        code: "CIV7_STATUS_UNAVAILABLE",
        status: 500,
      });

      const mapSummary = await safe(client.civ7.mapSummary({}));
      expect(mapSummary.error).toMatchObject({
        code: "CIV7_MAP_SUMMARY_UNAVAILABLE",
        status: 500,
      });

      const gameInfo = await safe(client.civ7.gameInfo({ table: "Terrains" }));
      expect(gameInfo.error).toMatchObject({
        code: "CIV7_GAMEINFO_FAILED",
        status: 400,
      });

      const setupConfig = await safe(client.civ7.setupConfig({}));
      expect(setupConfig.error).toMatchObject({
        code: "SETUP_CONFIG_UNAVAILABLE",
        status: 503,
        data: { observedAt: expect.any(String) },
      });

      const snapshot = await safe(client.civ7.live.snapshot({}));
      expect(snapshot.error).toMatchObject({
        code: "CIV7_LIVE_SNAPSHOT_FAILED",
        status: 400,
      });

      const entities = await safe(client.civ7.live.entities({}));
      expect(entities.error).toMatchObject({
        code: "CIV7_LIVE_ENTITIES_FAILED",
        status: 400,
      });

      const liveGameInfo = await safe(client.civ7.live.gameInfo({ tables: "Terrains" }));
      expect(liveGameInfo.error).toMatchObject({
        code: "CIV7_LIVE_GAMEINFO_FAILED",
        status: 400,
      });
    });
  });

  test("validates live snapshot fields before forwarding one exact map read", async () => {
    const mapGrid = vi.fn<Civ7TunerClient["mapGrid"]>((input) =>
      Effect.succeed({
        host: "127.0.0.1",
        port: 4318,
        state: { id: "1", name: "Tuner" },
        bounds: input.bounds,
        fields: [...input.fields],
        plotCount: 0,
        omitted: 0,
        hiddenInfoPolicy: "not-player-scoped",
        map: {
          width: probe(84),
          height: probe(54),
        },
        plots: [],
      })
    );
    await withRouterCiv7Client(
      {
        ...unavailableTunerClient("unused"),
        mapGrid,
      },
      async ({ client }) => {
        await expect(
          client.civ7.live.snapshot({ fields: " terrain, visibility ", maxPlots: 3 })
        ).resolves.toMatchObject({
          ok: true,
          grid: {
            fields: ["terrain", "visibility"],
          },
        });
        expect(mapGrid).toHaveBeenCalledWith({
          bounds: { x: 0, y: 0, width: 24, height: 18 },
          fields: ["terrain", "visibility"],
          maxPlots: 3,
        });

        const invalid = await safe(client.civ7.live.snapshot({ fields: "terrain,enemy" }));
        expect(invalid.error).toMatchObject({
          code: "CIV7_LIVE_SNAPSHOT_FAILED",
          status: 400,
          message: "Unsupported Civ7 plot field: enemy",
        });
        expect(mapGrid).toHaveBeenCalledTimes(1);
      }
    );
  });

  test("projects civ7.live.status from one coherent playable-status observation", async () => {
    const playable = playableStatusFixture();
    const read = vi.fn(() => Effect.succeed(playable));
    await withRouterCiv7Client(
      {
        ...unavailableTunerClient("unused"),
        playableStatus: read,
      },
      async ({ client }) => {
        await expect(client.civ7.live.status({})).resolves.toMatchObject({
          ok: true,
          playable: true,
          status: { playable: true, readiness: "app-ui-game" },
          appUi: playable.appUi,
          mapSummary: {
            map: {
              randomSeed: { ok: true, value: 43 },
              width: { ok: true, value: 84 },
              height: { ok: true, value: 54 },
            },
            game: {
              turn: { ok: true, value: 12 },
              hash: { ok: true, value: 987654321 },
            },
          },
          autoplay: {
            autoplay: playable.appUi.snapshot.autoplay,
            game: playable.appUi.snapshot.game,
            gameContext: playable.appUi.snapshot.gameContext,
          },
        });
        expect(read).toHaveBeenCalledTimes(1);
      }
    );
  });

  test("keeps civ7.live.status at 200 with one coherent error when observation fails", async () => {
    const read = vi.fn(() => Effect.fail(new Error("tuner down")));
    await withRouterCiv7Client(
      { ...unavailableTunerClient("unused"), playableStatus: read },
      async ({ client }) => {
        await expect(client.civ7.live.status({})).resolves.toMatchObject({
          ok: false,
          playable: false,
          status: { error: "Error: tuner down" },
          appUi: { error: "Error: tuner down" },
          mapSummary: { error: "Error: tuner down" },
          autoplay: { error: "Error: tuner down" },
        });
        expect(read).toHaveBeenCalledTimes(1);
      }
    );
  });

  test("does not project the App UI turn sentinel as successful runtime evidence", async () => {
    const playable = playableStatusFixture(-1);
    await withRouterCiv7Client(
      { ...unavailableTunerClient("unused"), playableStatus: () => Effect.succeed(playable) },
      async ({ client }) => {
        const result = await client.civ7.live.status({});
        expect(result).toMatchObject({
          mapSummary: {
            game: {
              hash: playable.appUi.snapshot.game.hash,
            },
          },
        });
        expect(result.mapSummary).not.toMatchObject({ game: { turn: expect.anything() } });
      }
    );
  });

  test("passes non-rpc paths through for host fallback middleware", async () => {
    const handler = trackHandle(createStudioRpcHandler(makeContext()));
    const result = await handler.handle(new Request("http://studio.local/not-rpc"), {
      prefix: "/rpc",
    });

    expect(result.matched).toBe(false);
  });

  test("serves studio.events.watch on /rpc with hello delivery and subscription cleanup", async () => {
    const handler = trackHandle(createStudioRpcHandler(makeContext()));
    const client = directClient(handler);

    const iterator = await client.studio.events.watch({});

    await expect(iterator.next()).resolves.toEqual({
      done: false,
      value: {
        type: "hello",
        serverInstanceId: expect.stringMatching(/^studio-server-/),
        serverStartedAt: "2026-06-10T00:00:00.000Z",
        observedAt: expect.any(String),
      },
    });

    await iterator.return?.();
  }, 10_000);

  test("normal handler initialization starts and replays the live-game watcher", async () => {
    const tuner = await startPlayableStatusTunerServer();
    vi.stubEnv("CIV7_TUNER_HOSTS", "127.0.0.1");
    vi.stubEnv("CIV7_TUNER_HOST", "127.0.0.1");
    vi.stubEnv("CIV7_TUNER_PORT", String(tuner.port));
    try {
      const handler = createStudioRpcHandler(makeContext(), {
        liveGameWatch: {
          initialDelayMs: 0,
          intervalMs: 60_000,
          now: () => new Date("2026-06-13T00:00:00.000Z"),
        },
      });
      try {
        const iterator = await directClient(handler).studio.events.watch({});
        await expect(iterator.next()).resolves.toMatchObject({
          done: false,
          value: { type: "hello" },
        });
        const observed = await withTimeout(iterator.next(), 2_000, "live-game watcher event");
        expect(observed).toMatchObject({
          done: false,
          value: {
            type: "live-game",
            state: {
              status: "ok",
              turn: 12,
              gameHash: 987654321,
              readiness: "tuner-ready",
            },
          },
        });
        await iterator.return?.();
        expect(tuner.received.filter((message) => message.startsWith("CMD:"))).toHaveLength(2);
      } finally {
        await handler.dispose();
      }
    } finally {
      vi.unstubAllEnvs();
      await tuner.close();
    }
  }, 10_000);

  test("operation mutations push through the watched RPC event stream", async () => {
    const handler = trackHandle(createStudioRpcHandler(makeContext()));
    const client = directClient(handler);

    const iterator = await client.studio.events.watch({});
    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { type: "hello" },
    });

    const save = await client.mapConfigs.saveDeploy({
      requestId: "save-watch-1",
      canonicalConfig: testCanonicalConfig({ id: "test-config", name: "Test Config" })
        .canonicalConfig,
    });
    const saveEvent = await readOperationEvent(
      iterator,
      (event) => event.kind === "save-deploy" && event.status.requestId === save.requestId
    );
    expect(saveEvent).toMatchObject({
      type: "operation",
      kind: "save-deploy",
      status: {
        requestId: "save-watch-1",
        status: "running",
      },
    });

    await expect
      .poll(async () => (await client.mapConfigs.status({ requestId: save.requestId })).phase)
      .toBe("complete");
    await readOperationEvent(
      iterator,
      (event) =>
        event.kind === "save-deploy" &&
        event.status.requestId === save.requestId &&
        event.status.phase === "complete"
    );

    const run = await client.runInGame.start(runInGameStartInput());
    const runEvent = await readOperationEvent(
      iterator,
      (event) => event.kind === "run-in-game" && event.status.requestId === run.requestId
    );
    expect(runEvent).toMatchObject({
      type: "operation",
      kind: "run-in-game",
      status: {
        requestId: run.requestId,
        status: "running",
      },
    });

    await iterator.return?.();
  }, 10_000);

  test("repeated studio.events.watch subscribe and close returns subscriber count to baseline", async () => {
    const handler = trackHandle(createStudioRpcHandler(makeContext()));
    const client = directClient(handler);

    for (let index = 0; index < 3; index += 1) {
      const iterator = await client.studio.events.watch({});
      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "hello" },
      });
      await iterator.return?.();
    }
  }, 10_000);

  test("router watch iterator return releases the runtime-owned EventHub subscription", async () => {
    await withRouterEventHub(async ({ client, eventHub }) => {
      const iterator = await client.studio.events.watch({});
      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "hello" },
      });
      await expect(Effect.runPromise(eventHub.activeSubscriberCount)).resolves.toBe(1);

      await iterator.return?.();

      await expect(Effect.runPromise(eventHub.activeSubscriberCount)).resolves.toBe(0);
    });
  }, 10_000);

  test("runtime disposal racing watch acquisition leaves no registered subscribers", async () => {
    await withRouterEventHub(async ({ client, eventHub, runtime }) => {
      const watchAttempts = Array.from({ length: 16 }, async () => {
        const watch = await settle(client.studio.events.watch({}));
        if (watch.status === "rejected") return;

        const first = await withTimeout(
          settle(watch.value.next()),
          1_000,
          "watch hello or disposal interruption"
        );
        if (first.status === "fulfilled") {
          await watch.value.return?.();
        }
      });

      await Promise.resolve();
      await runtime.dispose();
      await Promise.allSettled(watchAttempts);

      await expect(Effect.runPromise(eventHub.activeSubscriberCount)).resolves.toBe(0);
    });
  }, 10_000);

  test("cancelling the watch response body releases the subscription", async () => {
    const handler = trackHandle(createStudioRpcHandler(makeContext()));
    const result = await handler.handle(
      new Request("http://studio.test/rpc/studio/events/watch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ json: {} }),
      }),
      { prefix: "/rpc" }
    );

    expect(result.matched).toBe(true);
    expect(result.response?.status).toBe(200);
    expect(result.response?.headers.get("content-type")).toContain("text/event-stream");
    expect(result.response?.body).not.toBeNull();

    const reader = result.response!.body!.getReader();
    const text = await readUntil(reader, "hello");
    expect(text).toContain("hello");

    await reader.cancel();
  }, 10_000);

  test("disposing the RPC handle interrupts pending watch response reads", async () => {
    const handler = trackHandle(createStudioRpcHandler(makeContext()));
    const result = await handler.handle(
      new Request("http://studio.test/rpc/studio/events/watch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ json: {} }),
      }),
      { prefix: "/rpc" }
    );

    expect(result.matched).toBe(true);
    expect(result.response?.status).toBe(200);
    expect(result.response?.body).not.toBeNull();

    const reader = result.response!.body!.getReader();
    const text = await readUntil(reader, "hello");
    expect(text).toContain("hello");

    const pendingRead = settle(reader.read());
    await handler.dispose();
    const pendingOutcome = await withTimeout(
      pendingRead,
      1_000,
      "pending watch response read to settle"
    );
    expect(pendingOutcome.status).toBe("fulfilled");
    await reader.cancel().catch(() => undefined);
  }, 10_000);

  test("scoped event hub replays the latest published live-game event after hello", async () => {
    await withScopedEventHub(async ({ eventHub }) => {
      await Effect.runPromise(eventHub.publish(liveGameEvent()));

      const subscription = await Effect.runPromise(
        eventHub.subscribe({ initialEvents: [helloEvent()] })
      );
      const iterator = studioEventSubscriptionIterator(subscription);

      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "hello" },
      });
      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: {
          type: "live-game",
          state: {
            status: "ok",
            turn: 12,
            snapshotId: "status:12:abcdef01",
          },
        },
      });
      await iterator.return?.();
    });
  }, 10_000);

  test("concurrent live-game publish and subscribe delivers one replay copy", async () => {
    await withScopedEventHub(async ({ eventHub }) => {
      const [subscription] = await Promise.all([
        Effect.runPromise(eventHub.subscribe({ initialEvents: [helloEvent()] })),
        Effect.runPromise(eventHub.publish(liveGameEvent())),
      ]);
      const iterator = studioEventSubscriptionIterator(subscription);

      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "hello" },
      });
      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "live-game" },
      });

      const sentinel = helloEvent("2026-06-10T00:00:02.000Z");
      await Effect.runPromise(eventHub.publish(sentinel));
      await expect(iterator.next()).resolves.toEqual({
        done: false,
        value: sentinel,
      });
      await iterator.return?.();
    });
  }, 10_000);

  test("scoped event hub shutdown interrupts open subscriptions and releases scopes", async () => {
    await withScopedEventHub(async ({ eventHub, runtime }) => {
      const subscription = await Effect.runPromise(
        eventHub.subscribe({ initialEvents: [helloEvent()] })
      );
      const iterator = studioEventSubscriptionIterator(subscription);

      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "hello" },
      });
      await expect(Effect.runPromise(eventHub.activeSubscriberCount)).resolves.toBe(1);

      const pendingNext = settle(iterator.next());
      await runtime.dispose();
      const pendingOutcome = await withTimeout(
        pendingNext,
        1_000,
        "pending event iterator read to settle"
      );
      expect(pendingOutcome.status).toBe("rejected");
      if (pendingOutcome.status === "rejected") {
        expect(String(pendingOutcome.reason)).toMatch(/interrupted|FiberFailure|shutdown/i);
      }
      await expect(Effect.runPromise(eventHub.activeSubscriberCount)).resolves.toBe(0);
      await iterator.return?.();
    });
  });
});

function trackHandle(handle: StudioRpcHandle): StudioRpcHandle {
  openHandles.push(handle);
  return handle;
}

function directClient(handler: StudioRpcHandle): RouterClient<StudioRouter> {
  return createORPCClient<RouterClient<StudioRouter>>(
    new RPCLink({
      url: "http://studio.test/rpc",
      fetch: async (request) => {
        const result = await handler.handle(request, { prefix: "/rpc" });
        if (!result.matched || !result.response) {
          return new Response("not found", { status: 404 });
        }
        return result.response;
      },
    })
  );
}

function directRuntimeClient(runtime: StudioRouterRuntime): RouterClient<StudioRouter> {
  const handler = new RPCHandler(createStudioRouter(runtime));
  return createORPCClient<RouterClient<StudioRouter>>(
    new RPCLink({
      url: "http://studio.test/rpc",
      fetch: async (request) => {
        const result = await handler.handle(request, { prefix: "/rpc" });
        if (!result.matched || !result.response) {
          return new Response("not found", { status: 404 });
        }
        return result.response;
      },
    })
  );
}

function makeTestStudioRuntime(
  context: StudioServerContext,
  civ7Overrides: Partial<Civ7WorkflowControlApi> = {}
): StudioRouterRuntime {
  const eventHubLayer = StudioEventHubLive;
  const operationRuntimeLayer = makeStudioOperationRuntimeLayer({
    ports: context.operationRuntime,
    civ7WorkflowControl: makeCiv7WorkflowControlLayer(civ7Overrides),
  }).pipe(Layer.provide(eventHubLayer));
  const runtime: StudioRouterRuntime = ManagedRuntime.make(
    Layer.mergeAll(
      Layer.succeed(Civ7TunerClient, unavailableTunerClient("unused")),
      eventHubLayer,
      operationRuntimeLayer,
      Layer.succeed(StudioConfig, context)
    )
  );
  return runtime;
}

async function listenWithClient(context: StudioServerContext): Promise<RouterClient<StudioRouter>> {
  const studioRpc = trackHandle(createStudioRpcHandler(context));
  const origin = await listen(async (req, res) => {
    const request = await nodeRequestToWebRequest(req);
    const { matched, response } = await studioRpc.handle(request, { prefix: "/rpc" });
    if (!matched || !response) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  return createORPCClient<RouterClient<StudioRouter>>(new RPCLink({ url: `${origin}/rpc` }));
}

async function listen(handler: RequestListener): Promise<string> {
  const server = createServer(handler);
  openServers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected TCP server address");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

type FakePlayableStatusTunerServer = Readonly<{
  port: number;
  received: ReadonlyArray<string>;
  close(): Promise<void>;
}>;

async function startPlayableStatusTunerServer(): Promise<FakePlayableStatusTunerServer> {
  const received: string[] = [];
  const sockets = new Set<Socket>();
  const server = createTunerServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const parsed = parseCiv7TunerFrame(buffer);
        if (!parsed) return;
        buffer = buffer.subarray(parsed.bytesRead);
        const message = parsed.frame.parts.join("\0");
        received.push(message);
        socket.write(
          encodeCiv7TunerRequest(
            parsed.frame.listenerId,
            playableStatusTunerResponse(message).join("\0")
          )
        );
      }
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    throw new Error("Expected fake Civ7 tuner TCP address");
  }
  return {
    port: address.port,
    received,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        server.close((error) =>
          Option.fromNullable(error).pipe(
            Option.match({
              onNone: resolve,
              onSome: reject,
            })
          )
        );
      });
    },
  };
}

function playableStatusTunerResponse(message: string): ReadonlyArray<string> {
  if (message === "LSQ:") return ["65535", "App UI", "1", "Tuner"];
  if (message.includes("network: {")) {
    return [JSON.stringify(playableStatusFixture().appUi.snapshot)];
  }
  if (message.includes("snapshot.ready")) {
    return [
      JSON.stringify({
        evalOk: 2,
        ready: true,
        globals: {
          Game: "object",
          Autoplay: "object",
          GameplayMap: "object",
          Players: "object",
          Network: "object",
        },
        turn: probe(12),
        turnDate: probe("4000 BCE"),
        width: probe(84),
        height: probe(54),
        aliveIds: probe([0]),
        aliveHumanIds: probe([0]),
        autoplayActive: probe(false),
      }),
    ];
  }
  return ["null"];
}

async function nodeRequestToWebRequest(req: import("node:http").IncomingMessage): Promise<Request> {
  const method = req.method ?? "GET";
  const host = (req.headers.host as string | undefined) ?? "localhost";
  const url = `http://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  let body: Buffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    body = Buffer.concat(chunks);
  }
  return new Request(url, {
    method,
    headers,
    ...(body && body.length > 0 ? { body, duplex: "half" } : {}),
  } as RequestInit & { duplex?: "half" });
}

function makeContext(overrides: Partial<StudioServerContext> = {}): StudioServerContext {
  return {
    viteCommand: "serve",
    loadSetupCatalog: async () =>
      ({
        leaders: [],
        civilizations: [],
        maps: [],
        mapSizes: [],
        ruleSets: [],
        gameSpeeds: [],
        difficulties: [],
        age: [],
      }) as any,
    recipeDagService: {
      getRecipeDag: async () => {
        throw new Error("Unexpected recipe-DAG call");
      },
    },
    civ7Control: {
      directControl: {} as StudioServerContext["civ7Control"]["directControl"],
      directLifecycle: {} as StudioServerContext["civ7Control"]["directLifecycle"],
      timeoutMs: 1234,
    },
    operationRuntime: makeOperationRuntimePorts(),
    ...overrides,
  };
}

function makeCiv7WorkflowControlLayer(overrides: Partial<Civ7WorkflowControlApi> = {}) {
  const service: Civ7WorkflowControlApi = {
    startSinglePlayer: () => Effect.succeed(lifecycleStarted()),
    runAutoplay: (input) => Effect.succeed(autoplayOutput(input.action)),
    ...overrides,
  };
  return Layer.succeed(Civ7WorkflowControl, service);
}

function autoplayOutput(action: "start" | "stop") {
  const result = autoplayActionResult(action);
  return {
    ok: true as const,
    action,
    autoplay: result.after.autoplay,
    game: result.after.game,
    gameContext: result.after.gameContext,
    result,
  };
}

function autoplayActionResult(action: "start" | "stop"): Civ7AutoplayActionResult {
  const appUi = playableStatusFixture().appUi;
  const snapshot = appUi.snapshot.autoplay;
  const autoplay = {
    isActive: action === "start",
    turns: snapshot.turns,
    isPaused: snapshot.isPaused,
    isPausedOrPending: snapshot.isPausedOrPending,
    observeAsPlayer: snapshot.observeAsPlayer,
    returnAsPlayer: snapshot.returnAsPlayer,
  };
  const status = {
    host: appUi.host,
    port: appUi.port,
    state: appUi.state,
    autoplay,
    game: appUi.snapshot.game,
    gameContext: appUi.snapshot.gameContext,
  };
  return {
    host: appUi.host,
    port: appUi.port,
    state: appUi.state,
    before: status,
    after: status,
    commands: [],
    verified: true,
  };
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

function hasCompleteAttributionReport(value: unknown): boolean {
  return isUnknownRecord(value) && isCompleteAttributionReport(value.report);
}

function isCompleteAttributionReport(value: unknown): boolean {
  return (
    isUnknownRecord(value) &&
    value.status === "complete" &&
    Array.isArray(value.missingSections) &&
    value.missingSections.length === 0
  );
}

function isUnknownRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function namedError(name: string, message: string): Error {
  const err = new Error(message);
  err.name = name;
  return err;
}

function recipeDagResult(
  recipeId: string
): Awaited<ReturnType<StudioServerContext["recipeDagService"]["getRecipeDag"]>> {
  return {
    recipeId,
    recipeKey: recipeId,
    title: "Test Recipe",
    stages: [],
    edges: [],
    diagnostics: [],
  };
}

function unavailableTunerClient(message: string): Civ7TunerClient {
  return Civ7TunerClient.make({
    playableStatus: () => Effect.fail(new Error(message)),
    mapSummary: () => Effect.fail(new Error(message)),
    gameInfoRows: () => Effect.fail(new Error(message)),
    setupSnapshot: () => Effect.fail(new Error(message)),
    savedConfigurations: () => Effect.fail(new Error(message)),
    mapGrid: () => Effect.fail(new Error(message)),
    playerSummary: () => Effect.fail(new Error(message)),
    unitSummary: () => Effect.fail(new Error(message)),
    citySummary: () => Effect.fail(new Error(message)),
  });
}

function playableStatusFixture(turn = 12): Civ7PlayableStatusResult {
  const endpoint = { host: "127.0.0.1", port: 4318 } as const;
  const state = { id: "65535", name: "App UI" };
  return {
    ...endpoint,
    playable: true,
    readiness: "app-ui-game",
    appUi: {
      ...endpoint,
      state,
      snapshot: {
        network: {
          isInSession: probe(true),
          numPlayers: probe(1),
          hostPlayerId: probe(0),
          isConnectedToNetwork: probe(false),
          isAuthenticated: probe(false),
          isLoggedIn: probe(false),
        },
        autoplay: {
          isActive: false,
          turns: 0,
          isPaused: false,
          isPausedOrPending: false,
          observeAsPlayer: -1,
          returnAsPlayer: -1,
        },
        game: {
          turn,
          age: 0,
          maxTurns: 500,
          turnDate: probe("4000 BCE"),
          hash: probe(987654321),
        },
        ui: {
          inGame: probe(true),
          inShell: probe(false),
          inLoading: probe(false),
          loadingState: probe(8),
          loadingStateName: "GameStarted",
          canBeginGame: probe(false),
          canNotifyUIReady: "function",
          skipStartButton: probe(false),
          automationActive: probe(false),
          activeInputContext: probe(0),
          activeInputContextName: null,
        },
        gameContext: {
          localPlayerID: 0,
          localObserverID: -1,
          hasRequestedPause: probe(false),
        },
        players: {
          maxPlayers: 8,
          aliveIds: probe([0]),
          aliveHumanIds: probe([0]),
          numAliveHumans: probe(1),
        },
        map: {
          width: probe(84),
          height: probe(54),
          plotCount: probe(4536),
          mapSize: probe(3),
          randomSeed: probe(43),
        },
      },
    },
    errors: [],
  };
}

function probe<T>(value: T): Civ7RuntimeProbe<T> {
  return { ok: true, value };
}

function makeOperationRuntimePorts(
  overrides: Partial<StudioOperationRuntimePorts> = {}
): StudioOperationRuntimePorts {
  const runInGameWorkspaceRoot =
    overrides.runInGameWorkspaceRoot ??
    join(tmpdir(), `studio-server-handler-${process.pid}-${++runtimeWorkspaceSequence}`);
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
    observeRunInGameRuntime: async (args) => runInGameRuntimeObservation(args),
    buildRunInGameEvidence: async () => ({ result: { ok: true } }),
    prepareSaveDeployStart: async () => ({}),
    saveMapConfig: async () => ({ saved: true }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    rollbackSaveDeploy: async () => ({ restored: true }),
    ...overrides,
  };
}

function generatedRunInGameMod(): Awaited<
  ReturnType<StudioOperationRuntimePorts["generateRunInGameMod"]>
> {
  return {
    materialization: {
      mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
      canonicalConfigDigest: "test-config-hash",
      launchEnvelopeDigest: "test-envelope-hash",
      generationManifestDigest: "test-generation-manifest-digest",
      runArtifactId: "run-test",
      generatedModRoot: join(tmpdir(), "studio-handler-generated-run-test"),
      generatedModFileCount: 1,
      generatedModDigest: "test-generated-mod-digest",
      mapRowId: "MAP_STUDIO_RUN",
    },
  };
}

function runInGameDeployment(
  args: Readonly<{
    requestId: string;
    materialization: Awaited<
      ReturnType<StudioOperationRuntimePorts["generateRunInGameMod"]>
    >["materialization"];
  }>
): Awaited<ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>> {
  const { materialization, requestId } = args;
  const files: Awaited<
    ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>
  >["deployedSnapshot"]["files"] = [
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
      filesCopied: 1,
    },
    runDeployment: {
      requestId,
      deployedModId: "mod-swooper-studio-run",
      generatedModRoot: materialization.generatedModRoot,
      generatedModDigest: materialization.generatedModDigest,
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      startedAt: "2026-06-10T00:00:00.000Z",
      completedAt: "2026-06-10T00:00:01.000Z",
      filesCopied: 1,
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
  args: Parameters<StudioOperationRuntimePorts["observeRunInGameRuntime"]>[0]
): Awaited<ReturnType<StudioOperationRuntimePorts["observeRunInGameRuntime"]>> {
  const materialization = args.deployment.materialization;
  const correlation = {
    requestId: args.requestId,
    runArtifactId: createRunArtifactId(args.requestId),
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
      matchedMarkers: ["[mapgen-evidence]", args.requestId, "[mapgen-complete]"],
      evidence: args.log.logEvidence,
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
      dimensions: { width: 84, height: 54 },
      deployedModId: args.deployment.runDeployment.deployedModId,
      deployedSnapshotDigest: args.deployment.deployedSnapshot.digest,
    },
  };
}

function runInGameStartInput(): StudioInputs["runInGame"]["start"] {
  return {
    canonicalConfig: testCanonicalConfig({
      id: "studio-current",
      name: "Studio Current",
    }).canonicalConfig,
    seed: 43,
    worldSettings: {
      mapSize: "MAPSIZE_STANDARD",
    },
  };
}

function testCanonicalConfig(
  args: Readonly<{
    id: string;
    name: string;
    description?: string;
    sortIndex?: number;
    latitudeBounds?: Readonly<{ topLatitude: number; bottomLatitude: number }>;
    config?: JsonWireObject;
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

function makeOperationRuntimeApi(): StudioOperationRuntimeApi {
  const identity = {
    serverInstanceId: "studio-server-test",
    serverStartedAt: "2026-06-10T00:00:00.000Z",
  };
  const unsupported = Effect.die("operation runtime method is not used by watch tests");
  return {
    identity,
    runInGameStart: () => unsupported,
    runInGameStatus: () => unsupported,
    runInGameCancel: () => unsupported,
    runInGameDiagnostics: () => unsupported,
    saveDeployStart: () => unsupported,
    saveDeployStatus: () => unsupported,
    autoplay: () => unsupported,
    operationsCurrent: Effect.succeed({
      ok: true,
      ...identity,
      observedAt: "2026-06-10T00:00:00.000Z",
      runInGame: { active: null, recent: [] },
      saveDeploy: { active: null, recent: [] },
    }),
  };
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

async function readUntil(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  needle: string
): Promise<string> {
  const decoder = new TextDecoder();
  let text = "";
  while (!text.includes(needle)) {
    const chunk = await withTimeout(
      reader.read(),
      1_000,
      `event stream chunk containing ${needle}`
    );
    if (chunk.done) break;
    text += decoder.decode(chunk.value, { stream: true });
  }
  text += decoder.decode();
  return text;
}

async function readOperationEvent(
  iterator: AsyncIterator<StudioEvent>,
  predicate: (event: Extract<StudioEvent, { type: "operation" }>) => boolean
): Promise<Extract<StudioEvent, { type: "operation" }>> {
  for (let index = 0; index < 10; index += 1) {
    const next = await withTimeout(iterator.next(), 1_000, "operation event");
    if (next.done) throw new Error("event stream closed before operation event");
    if (next.value.type === "operation" && predicate(next.value)) return next.value;
  }
  throw new Error("operation event did not arrive");
}

async function withScopedEventHub<T>(
  fn: (args: {
    eventHub: StudioEventHubApi;
    runtime: ManagedRuntime.ManagedRuntime<StudioEventHub, never>;
  }) => Promise<T>
): Promise<T> {
  const runtime = ManagedRuntime.make(StudioEventHubLive);
  try {
    const eventHub = await runtime.runPromise(StudioEventHub);
    return await fn({ eventHub, runtime });
  } finally {
    await runtime.dispose();
  }
}

async function withRouterEventHub<T>(
  fn: (args: {
    client: RouterClient<StudioRouter>;
    eventHub: StudioEventHubApi;
    runtime: StudioRouterRuntime;
  }) => Promise<T>
): Promise<T> {
  const runtime: StudioRouterRuntime = ManagedRuntime.make(
    Layer.mergeAll(
      Layer.succeed(Civ7TunerClient, unavailableTunerClient("unused")),
      StudioEventHubLive,
      Layer.succeed(StudioConfig, makeContext()),
      Layer.succeed(StudioOperationRuntime, makeOperationRuntimeApi())
    )
  );
  try {
    const eventHub = await runtime.runPromise(StudioEventHub);
    const rpcHandler = new RPCHandler(createStudioRouter(runtime));
    const client = createORPCClient<RouterClient<StudioRouter>>(
      new RPCLink({
        url: "http://studio.test/rpc",
        fetch: async (request) => {
          const result = await rpcHandler.handle(request, { prefix: "/rpc" });
          return Option.fromNullable(result.response).pipe(
            Option.filter(() => result.matched),
            Option.getOrElse(() => new Response("not found", { status: 404 }))
          );
        },
      })
    );

    return await fn({ client, eventHub, runtime });
  } finally {
    await runtime.dispose();
  }
}

async function withRouterCiv7Client<T>(
  tunerClient: Civ7TunerClient,
  fn: (args: { client: RouterClient<StudioRouter>; runtime: StudioRouterRuntime }) => Promise<T>
): Promise<T> {
  const runtime: StudioRouterRuntime = ManagedRuntime.make(
    Layer.mergeAll(
      Layer.succeed(Civ7TunerClient, tunerClient),
      Layer.succeed(StudioConfig, makeContext()),
      StudioEventHubLive,
      Layer.succeed(StudioOperationRuntime, makeOperationRuntimeApi())
    )
  );
  try {
    const rpcHandler = new RPCHandler(createStudioRouter(runtime));
    const client = createORPCClient<RouterClient<StudioRouter>>(
      new RPCLink({
        url: "http://studio.test/rpc",
        fetch: async (request) => {
          const result = await rpcHandler.handle(request, { prefix: "/rpc" });
          return Option.fromNullable(result.response).pipe(
            Option.filter(() => result.matched),
            Option.getOrElse(() => new Response("not found", { status: 404 }))
          );
        },
      })
    );

    return await fn({ client, runtime });
  } finally {
    await runtime.dispose();
  }
}

function helloEvent(
  observedAt = "2026-06-10T00:00:00.000Z"
): Extract<StudioEvent, { type: "hello" }> {
  return {
    type: "hello",
    serverInstanceId: "studio-server-test",
    serverStartedAt: "2026-06-10T00:00:00.000Z",
    observedAt,
  };
}

function liveGameEvent(): Extract<StudioEvent, { type: "live-game" }> {
  return {
    type: "live-game",
    observedAt: "2026-06-10T00:00:01.000Z",
    state: {
      status: "ok",
      turn: 12,
      gameHash: 987654,
      seed: 123,
      readiness: "ready",
      snapshotStatus: "idle",
      snapshotId: "status:12:abcdef01",
      snapshotHash: "abcdef01",
      bindingStatus: "unbound-runtime",
      failureCount: 0,
    },
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${label}`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

async function settle<T>(
  promise: Promise<T>
): Promise<{ status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown }> {
  return await promise.then(
    (value) => ({ status: "fulfilled" as const, value }),
    (reason: unknown) => ({ status: "rejected" as const, reason })
  );
}
