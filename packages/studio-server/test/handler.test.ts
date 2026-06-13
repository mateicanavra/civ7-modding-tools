import { createServer, type Server } from "node:http";
import { createORPCClient, isDefinedError, safe, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { afterEach, describe, expect, test } from "vitest";

import {
  createStudioEventHub,
  createStudioRpcHandler,
  type StudioEventHubApi,
  type StudioRpcHandle,
  type StudioRouter,
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
      mapConfigStatus: async ({ requestId }) => {
        calls.push(`status:${requestId}`);
        return {
          ok: true,
          requestId,
          phase: "complete",
          status: "complete",
          startedAt: "2026-06-10T00:00:00.000Z",
          updatedAt: "2026-06-10T00:00:01.000Z",
          saved: true,
          deployed: true,
        };
      },
    });
    const client = await listenWithClient(context);

    await expect(client.studio.serverInfo({})).resolves.toEqual({
      ok: true,
      serverInstanceId: "studio-server-test",
      startedAt: "2026-06-10T00:00:00.000Z",
      runInGameApiVersion: 2,
      viteCommand: "serve",
    });
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
      serverInstanceId: "studio-server-test",
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
    expect(calls).toEqual(["status:save-1"]);
  }, 10_000);

  test("delivers an engine 409 as the DEFINED SAVE_DEPLOY_BLOCKED error", async () => {
    // The host context throws a RAW ORPCError whose code/status/data match the
    // declared contract entry (contract/errors.ts) — oRPC must validate it into
    // a defined error client-side (the "combining both approaches" rule).
    const context = makeContext({
      mapConfigSaveDeploy: async () => {
        throw new ORPCError("SAVE_DEPLOY_BLOCKED", {
          status: 409,
          message: "Save/Deploy is already running.",
          data: {
            details: {
              code: "save-deploy-operation-active",
              activeRequestId: "save-0",
            },
          },
        });
      },
    });
    const client = await listenWithClient(context);

    const { error } = await safe(
      client.mapConfigs.saveDeploy({ requestId: "save-1", id: "test-config", envelope: {} })
    );

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("SAVE_DEPLOY_BLOCKED");
    expect(error.status).toBe(409);
    expect(error.message).toBe("Save/Deploy is already running.");
    expect(error.data).toEqual({
      details: {
        code: "save-deploy-operation-active",
        activeRequestId: "save-0",
      },
    });
  });

  test("delivers a run-in-game status miss as RUN_IN_GAME_STATUS_NOT_FOUND with the server-identity echo", async () => {
    const context = makeContext({
      runInGameStatus: async () => {
        throw new ORPCError("RUN_IN_GAME_STATUS_NOT_FOUND", {
          status: 404,
          message: "Run in Game request not found: run-1",
          data: {
            serverInstanceId: "studio-server-test",
            serverStartedAt: "2026-06-10T00:00:00.000Z",
          },
        });
      },
    });
    const client = await listenWithClient(context);

    const { error } = await safe(client.runInGame.status({ requestId: "run-1" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("RUN_IN_GAME_STATUS_NOT_FOUND");
    expect(error.status).toBe(404);
    // PARITY INVARIANT: the 404 echoes the server identity for restart detection.
    expect(error.data).toEqual({
      serverInstanceId: "studio-server-test",
      serverStartedAt: "2026-06-10T00:00:00.000Z",
    });
  });

  test("delivers a save/deploy status miss as SAVE_DEPLOY_STATUS_NOT_FOUND with the server-identity echo", async () => {
    const context = makeContext({
      mapConfigStatus: async () => {
        throw new ORPCError("SAVE_DEPLOY_STATUS_NOT_FOUND", {
          status: 404,
          message: "Save/Deploy request not found: save-1",
          data: {
            serverInstanceId: "studio-server-test",
            serverStartedAt: "2026-06-10T00:00:00.000Z",
            details: {
              code: "save-deploy-status-not-found",
              requestId: "save-1",
            },
          },
        });
      },
    });
    const client = await listenWithClient(context);

    const { error } = await safe(client.mapConfigs.status({ requestId: "save-1" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("SAVE_DEPLOY_STATUS_NOT_FOUND");
    expect(error.status).toBe(404);
    expect(error.data).toEqual({
      serverInstanceId: "studio-server-test",
      serverStartedAt: "2026-06-10T00:00:00.000Z",
      details: {
        code: "save-deploy-status-not-found",
        requestId: "save-1",
      },
    });
  });

  test("wraps an unexpected engine throw as the namespace FAILED defined error", async () => {
    const context = makeContext({
      runInGameStart: async () => {
        throw new Error("engine exploded");
      },
    });
    const client = await listenWithClient(context);

    const { error } = await safe(client.runInGame.start({ recipeId: "mod-swooper-maps/standard" }));

    expect(error).toBeInstanceOf(ORPCError);
    if (!(error instanceof ORPCError)) throw new Error("expected an ORPCError");
    expect(isDefinedError(error)).toBe(true);
    expect(error.code).toBe("RUN_IN_GAME_FAILED");
    expect(error.status).toBe(500);
    expect(error.message).toBe("engine exploded");
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
        serverInstanceId: "studio-server-test",
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
    serverInstanceId: "studio-server-test",
    serverStartedAt: "2026-06-10T00:00:00.000Z",
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
    autoplay: async () => {
      throw new Error("Unexpected autoplay call");
    },
    runInGameStart: async () => {
      throw new Error("Unexpected run-in-game start call");
    },
    runInGameStatus: async () => {
      throw new Error("Unexpected run-in-game status call");
    },
    mapConfigSaveDeploy: async () => {
      throw new Error("Unexpected map-config save/deploy call");
    },
    mapConfigStatus: async () => {
      throw new Error("Unexpected map-config status call");
    },
    operationsCurrent: async () => ({
      ok: true,
      serverInstanceId: "studio-server-test",
      serverStartedAt: "2026-06-10T00:00:00.000Z",
      observedAt: "2026-06-10T00:00:00.000Z",
      runInGame: {
        active: null,
        recent: [],
      },
      saveDeploy: {
        active: null,
        recent: [
          {
            ok: true,
            requestId: "save-1",
            phase: "complete",
            status: "complete",
            startedAt: "2026-06-10T00:00:00.000Z",
            updatedAt: "2026-06-10T00:00:01.000Z",
            saved: true,
            deployed: true,
          },
        ],
      },
    }),
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
    ...overrides,
  };
}
