import { createServer, type Server } from "node:http";
import { createORPCClient, isDefinedError, ORPCError, safe } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { afterEach, describe, expect, test } from "vitest";

import {
  createStudioEventHub,
  createStudioRpcHandler,
  type StudioEvent,
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

  test("yields hub-published events after the initial studio.events.watch hello", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const handler = trackHandle(createStudioRpcHandler(makeContext({ eventHub })));
    const client = directClient(handler);

    const iterator = await client.studio.events.watch({});
    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { type: "hello" },
    });

    await eventHub.publish({
      type: "operation",
      kind: "run-in-game",
      observedAt: "2026-06-10T00:00:01.000Z",
      status: {
        ok: true,
        requestId: "run-event-1",
        phase: "complete",
        status: "complete",
        startedAt: "2026-06-10T00:00:00.000Z",
        updatedAt: "2026-06-10T00:00:01.000Z",
        completedPhases: ["materializing", "complete"],
      },
    });

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: {
        type: "operation",
        kind: "run-in-game",
        status: { requestId: "run-event-1", phase: "complete" },
      },
    });
    await iterator.return?.();
    await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
  }, 10_000);

  test("replays latest live-game event to new studio.events.watch subscribers after hello", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const handler = trackHandle(createStudioRpcHandler(makeContext({ eventHub })));
    const client = directClient(handler);

    await eventHub.publish({
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
    });

    const iterator = await client.studio.events.watch({});
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
    await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
  }, 10_000);

  test("operation mutations push through the watched RPC event stream", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const handler = trackHandle(createStudioRpcHandler(makeContext({ eventHub })));
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

    const run = await client.runInGame.start({ recipeId: "mod-swooper-maps/standard" });
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
    await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
  }, 10_000);

  test("repeated studio.events.watch subscribe and close returns subscriber count to baseline", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const handler = trackHandle(createStudioRpcHandler(makeContext({ eventHub })));
    const client = directClient(handler);

    for (let index = 0; index < 3; index += 1) {
      const iterator = await client.studio.events.watch({});
      await expect(iterator.next()).resolves.toMatchObject({
        done: false,
        value: { type: "hello" },
      });
      expect(eventHub.activeSubscriberCount()).toBe(1);
      await iterator.return?.();
      await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
    }
  }, 10_000);

  test("cancelling the watch response body releases the subscription", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const handler = trackHandle(createStudioRpcHandler(makeContext({ eventHub })));
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
    expect(eventHub.activeSubscriberCount()).toBe(1);

    await reader.cancel();
    await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
  }, 10_000);

  test("disposing the RPC handle interrupts pending watch response reads", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const handler = trackHandle(createStudioRpcHandler(makeContext({ eventHub })));
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
    expect(eventHub.activeSubscriberCount()).toBe(1);

    const pendingRead = settle(reader.read());
    await handler.dispose();
    const pendingOutcome = await withTimeout(pendingRead, 1_000, "pending watch response read to settle");
    expect(pendingOutcome.status).toBe("fulfilled");
    await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
    await reader.cancel().catch(() => undefined);
  }, 10_000);

  test("event hub shutdown interrupts open watch subscriptions and releases scopes", async () => {
    const eventHub = trackEventHub(createStudioEventHub());
    const iterator = eventHub.subscribe({
      initialEvents: [
        {
          type: "hello",
          serverInstanceId: "studio-server-test",
          serverStartedAt: "2026-06-10T00:00:00.000Z",
          observedAt: "2026-06-10T00:00:00.000Z",
        },
      ],
    });

    await expect(iterator.next()).resolves.toMatchObject({
      done: false,
      value: { type: "hello" },
    });
    expect(eventHub.activeSubscriberCount()).toBe(1);

    const pendingNext = settle(iterator.next());
    await eventHub.shutdown();
    const pendingOutcome = await withTimeout(pendingNext, 1_000, "pending event iterator read to settle");
    expect(pendingOutcome.status).toBe("rejected");
    if (pendingOutcome.status === "rejected") {
      expect(String(pendingOutcome.reason)).toMatch(/interrupted|FiberFailure|shutdown/i);
    }
    await expect.poll(() => eventHub.activeSubscriberCount(), { timeout: 1_000 }).toBe(0);
    await iterator.return?.();
  });
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
    waitForRunInGameLogProof: async () => ({ result: { ok: true } }),
    buildRunInGameProof: async () => ({ result: { ok: true } }),
    prepareSaveDeployStart: async () => ({}),
    saveMapConfig: async () => ({ saved: true }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    rollbackSaveDeploy: async () => ({ restored: true }),
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

async function readUntil(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  needle: string
): Promise<string> {
  const decoder = new TextDecoder();
  let text = "";
  while (!text.includes(needle)) {
    const chunk = await withTimeout(reader.read(), 1_000, `event stream chunk containing ${needle}`);
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
