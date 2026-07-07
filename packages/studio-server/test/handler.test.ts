import { createServer, type Server } from "node:http";
import { createORPCClient, isDefinedError, ORPCError, safe } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Effect, Layer, ManagedRuntime } from "effect";
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
  type StudioOperationRuntimePorts,
  type StudioRouter,
  type StudioRpcHandle,
  type StudioRuntime,
  type StudioServerContext,
  studioEventSubscriptionIterator,
} from "../src/index";
import {
  StudioOperationRuntime,
  type StudioOperationRuntimeApi,
} from "../src/operationRuntime/index";

const openServers: Server[] = [];
const openHandles: StudioRpcHandle[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
  await Promise.all(openHandles.splice(0).map((handle) => handle.dispose()));
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
      client.mapConfigs.saveDeploy({ requestId: "save-1", id: "test-config", envelope: {} })
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
          deployRunInGame: async () => {
            await blocker.promise;
            return {};
          },
        }),
      });
      const client = await listenWithClient(context);
      const run = await client.runInGame.start({
        recipeId: "mod-swooper-maps/standard",
        seed: 43,
        mapSize: "MAPSIZE_STANDARD",
        config: {},
      });

      const { error } = await safe(
        client.mapConfigs.saveDeploy({ requestId: "save-1", id: "test-config", envelope: {} })
      );
      blocker.resolve();

      expect(error).toBeInstanceOf(ORPCError);
      if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
      expect(isDefinedError(error)).toBe(true);
      expect(error.code).toBe("SAVE_DEPLOY_BLOCKED");
      expect(error.status).toBe(409);
      expect(error.message).toBe(
        "run-in-game is running; wait for it to finish before starting another Studio operation."
      );
      expect(error.data).toMatchObject({
        tag: "OperationBlocked",
        namespace: "saveDeploy",
        reason: "active-operation-conflict",
        activeRequestId: run.requestId,
        diagnostics: { code: "studio-operation-active" },
      });
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      blocker.resolve();
      consoleError.mockRestore();
    }
  });

  test("delivers a run-in-game status miss as RUN_IN_GAME_STATUS_NOT_FOUND with the server-identity echo", async () => {
    const context = makeContext();
    const client = await listenWithClient(context);

    const { error } = await safe(client.runInGame.status({ requestId: "run-1" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("RUN_IN_GAME_STATUS_NOT_FOUND");
    expect(error.status).toBe(404);
    // PARITY INVARIANT: the public 404 stays safe while echoing server identity
    // for restart detection.
    expect(error.data).toEqual({
      namespace: "runInGame",
      recoveryActions: ["copy-diagnostics", "retry-status"],
      requestId: "run-1",
      safeFailureCategory: "request-validation",
      serverInstanceId: expect.stringMatching(/^studio-server-/),
      serverStartedAt: "2026-06-10T00:00:00.000Z",
    });
  });

  test("delivers a save/deploy status miss as SAVE_DEPLOY_STATUS_NOT_FOUND with the server-identity echo", async () => {
    const context = makeContext();
    const client = await listenWithClient(context);

    const { error } = await safe(client.mapConfigs.status({ requestId: "save-1" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("SAVE_DEPLOY_STATUS_NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({
      tag: "OperationNotFound",
      namespace: "saveDeploy",
      reason: "status-not-found",
      message: "Save/Deploy request not found: save-1",
      recoveryActions: ["retry-status", "copy-diagnostics"],
      requestId: "save-1",
      serverInstanceId: expect.stringMatching(/^studio-server-/),
      serverStartedAt: "2026-06-10T00:00:00.000Z",
      diagnostics: { code: "save-deploy-request-not-found" },
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

  test("keeps civ7.live.status at 200 with per-field errors for partial tuner failures", async () => {
    await withRouterCiv7Client(
      {
        ...unavailableTunerClient("unused"),
        playableStatus: () => Effect.succeed({ playable: true, readiness: "ready" }),
        appUiSnapshot: () => Effect.fail(new Error("app-ui down")),
        liveMapSummary: () => Effect.succeed({ map: "visible" }),
        autoplayStatus: () => Effect.fail("autoplay unavailable"),
      },
      async ({ client }) => {
        await expect(client.civ7.live.status({})).resolves.toMatchObject({
          ok: true,
          playable: true,
          status: { playable: true, readiness: "ready" },
          appUi: { error: "Error: app-ui down" },
          mapSummary: { map: "visible" },
          autoplay: { error: "autoplay unavailable" },
        });
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
      id: "test-config",
      envelope: {},
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

    const run = await client.runInGame.start({
      recipeId: "mod-swooper-maps/standard",
      seed: 43,
      mapSize: "MAPSIZE_STANDARD",
      config: {},
    });
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
    res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
  });
  return createORPCClient<RouterClient<StudioRouter>>(new RPCLink({ url: `${origin}/rpc` }));
}

async function listen(handler: Parameters<typeof createServer>[0]): Promise<string> {
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
      timeoutMs: 1234,
    },
    operationRuntime: makeOperationRuntimePorts(),
    ...overrides,
  };
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
    phases: [],
    stages: [],
    edges: [],
    diagnostics: [],
  };
}

function unavailableTunerClient(message: string): Civ7TunerClient {
  const fail = () => Effect.fail(new Error(message));
  return {
    playableStatus: fail,
    mapSummary: fail,
    liveMapSummary: fail,
    appUiSnapshot: fail,
    autoplayStatus: fail,
    gameInfoRows: fail,
    setupSnapshot: fail,
    savedConfigurations: fail,
    mapGrid: fail,
    playerSummary: fail,
    unitSummary: fail,
    citySummary: fail,
  } as unknown as Civ7TunerClient;
}

function makeOperationRuntimePorts(
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
    saveMapConfig: async () => ({ saved: true }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    rollbackSaveDeploy: async () => ({ restored: true }),
    ...overrides,
  };
}

function makeOperationRuntimeApi(): StudioOperationRuntimeApi {
  const identity = {
    serverInstanceId: "studio-server-test",
    serverStartedAt: "2026-06-10T00:00:00.000Z",
  };
  const unsupported = () => Effect.die("operation runtime method is not used by watch tests");
  return {
    identity,
    runInGameStart: unsupported,
    runInGameStatus: unsupported,
    saveDeployStart: unsupported,
    saveDeployStatus: unsupported,
    autoplay: unsupported,
    operationsCurrent: Effect.succeed({
      ok: true,
      ...identity,
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
    runtime: StudioRuntime;
  }) => Promise<T>
): Promise<T> {
  const runtime = ManagedRuntime.make(
    Layer.mergeAll(
      StudioEventHubLive,
      Layer.succeed(StudioConfig, makeContext()),
      Layer.succeed(StudioOperationRuntime, makeOperationRuntimeApi())
    )
  ) as unknown as StudioRuntime;
  try {
    const eventHub = await runtime.runPromise(StudioEventHub);
    const rpcHandler = new RPCHandler(createStudioRouter(runtime));
    const client = createORPCClient<RouterClient<StudioRouter>>(
      new RPCLink({
        url: "http://studio.test/rpc",
        fetch: async (request) => {
          const result = await rpcHandler.handle(request, { prefix: "/rpc" });
          if (!result.matched || !result.response) {
            return new Response("not found", { status: 404 });
          }
          return result.response;
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
  fn: (args: { client: RouterClient<StudioRouter>; runtime: StudioRuntime }) => Promise<T>
): Promise<T> {
  const runtime = ManagedRuntime.make(
    Layer.mergeAll(
      Layer.succeed(Civ7TunerClient, tunerClient),
      Layer.succeed(StudioConfig, makeContext()),
      StudioEventHubLive,
      Layer.succeed(StudioOperationRuntime, makeOperationRuntimeApi())
    )
  ) as unknown as StudioRuntime;
  try {
    const rpcHandler = new RPCHandler(createStudioRouter(runtime));
    const client = createORPCClient<RouterClient<StudioRouter>>(
      new RPCLink({
        url: "http://studio.test/rpc",
        fetch: async (request) => {
          const result = await rpcHandler.handle(request, { prefix: "/rpc" });
          if (!result.matched || !result.response) {
            return new Response("not found", { status: 404 });
          }
          return result.response;
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
  try {
    return { status: "fulfilled", value: await promise };
  } catch (reason) {
    return { status: "rejected", reason };
  }
}
