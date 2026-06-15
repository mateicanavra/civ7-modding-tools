import { createServer, type Server } from "node:http";
import { createORPCClient, isDefinedError, ORPCError, safe } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { afterEach, describe, expect, test } from "vitest";

import {
  createStudioEventHub,
  createStudioRpcHandler,
  invalidRequest,
  operationBlocked,
  type StudioEventHubApi,
  type StudioOperationRuntimePorts,
  type StudioRouter,
  type StudioRpcHandle,
  type StudioServerContext,
} from "../src/index";

const openServers: Server[] = [];
const openHandles: StudioRpcHandle[] = [];
const openEventHubs: StudioEventHubApi[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
  await Promise.all(openHandles.splice(0).map((handle) => handle.dispose()));
  await Promise.all(openEventHubs.splice(0).map((eventHub) => eventHub.shutdown()));
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
    const blocker = deferred<void>();
    const context = makeContext({
      operationRuntime: makeOperationRuntimePorts({
        deployRunInGame: async () => {
          await blocker.promise;
          return {};
        },
      }),
    });
    const client = await listenWithClient(context);
    const run = await client.runInGame.start({ recipeId: "mod-swooper-maps/standard" });

    const { error } = await safe(
      client.mapConfigs.saveDeploy({ requestId: "save-1", id: "test-config", envelope: {} })
    );
    blocker.resolve();

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("SAVE_DEPLOY_BLOCKED");
    expect(error.status).toBe(409);
    expect(error.message).toBe("run-in-game is running; wait for it to finish before starting another Studio operation.");
    expect(error.data).toMatchObject({
      tag: "OperationBlocked",
      namespace: "saveDeploy",
      reason: "active-operation-conflict",
      activeRequestId: run.requestId,
      diagnostics: { code: "studio-operation-active" },
    });
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
    // PARITY INVARIANT: the 404 echoes the server identity for restart detection.
    expect(error.data).toEqual({
      tag: "OperationNotFound",
      namespace: "runInGame",
      reason: "status-not-found",
      message: "Run in Game request not found: run-1",
      recoveryActions: ["retry-status", "copy-diagnostics"],
      requestId: "run-1",
      diagnostics: { code: "run-in-game-request-not-found" },
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

  test("maps typed runtime leaf failures through the package error spine", async () => {
    const context = makeContext({
      operationRuntime: makeOperationRuntimePorts({
        runAutoplay: async () => {
          throw operationBlocked({
            message: "Autoplay blocked by test",
            activeRequestId: "run-1",
            activePhase: "deploying",
            diagnostics: { code: "autoplay-test-blocked" },
          });
        },
      }),
    });
    const client = await listenWithClient(context);

    const { error } = await safe(client.civ7.autoplay({ action: "start" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("AUTOPLAY_BLOCKED");
    expect(error.status).toBe(409);
    expect(error.data).toMatchObject({
      tag: "OperationBlocked",
      namespace: "autoplay",
      reason: "active-operation-conflict",
      message: "Autoplay blocked by test",
      activeRequestId: "run-1",
      activePhase: "deploying",
      diagnostics: { code: "autoplay-test-blocked" },
    });
  });

  test("passes non-rpc paths through for host fallback middleware", async () => {
    const handler = trackHandle(createStudioRpcHandler(makeContext()));
    const result = await handler.handle(new Request("http://studio.local/not-rpc"), {
      prefix: "/rpc",
    });

    expect(result.matched).toBe(false);
  });

  test("serves studio.events.watch on /rpc with hello delivery and subscription cleanup", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const handler = trackHandle(createStudioRpcHandler(makeContext({ eventHub })));
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
    expect(eventHub.activeSubscriberCount()).toBe(1);

    await iterator.return?.();
    await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
  }, 10_000);
});

function trackHandle(handle: StudioRpcHandle): StudioRpcHandle {
  openHandles.push(handle);
  return handle;
}

function trackEventHub(eventHub: StudioEventHubApi): StudioEventHubApi {
  openEventHubs.push(eventHub);
  return eventHub;
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
  const eventHub = overrides.eventHub ?? trackEventHub(createStudioEventHub());
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
    eventHub,
    operationRuntime: makeOperationRuntimePorts(),
    ...overrides,
  };
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
    checkCiv7ForRunInGame: async () => undefined,
    prepareSetupForRunInGame: async () => ({}),
    startGameForRunInGame: async () => ({}),
    waitForRunInGameProof: async () => ({ result: { ok: true } }),
    prepareSaveDeployStart: async () => ({}),
    saveMapConfig: async () => ({ saved: true }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    runAutoplay: async (input) => ({
      ok: true,
      action: input.action,
      autoplay: {},
      game: {},
      gameContext: {},
      result: {},
    }),
    normalizeSaveDeployFailure: ({ err }) =>
      invalidRequest({
        message: err instanceof Error ? err.message : "Save failed",
        diagnostics: { code: "save-deploy-test-failed" },
      }),
    ...overrides,
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
