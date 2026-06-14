import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, test } from "vitest";

import { createORPCClient, safe } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import {
  createStudioEventHub,
  createStudioRpcHandler,
  contract,
  studioEffectContract,
  type StudioContract,
  type StudioEventHubApi,
  type StudioRpcHandle,
  type StudioServerContext,
} from "@civ7/studio-server";
import { Civ7ControlOrpcContract, type Civ7ControlOrpcContext } from "@civ7/control-orpc";
import { Civ7DirectControlSession, type Civ7PlayableStatusResult } from "@civ7/direct-control";

import { RecipeDagNotFound } from "../../src/server/recipeDag/service";

// ============================================================================
// Single-mount contract pin (runtime-one-mount slice, S1.1).
//
// THE invariant of the slice: every namespace — the studio surface, the
// absorbed `civ7.*` control namespaces, and `recipeDag.*` — answers over ONE
// real `createStudioRpcHandler` mounted at ONE `/rpc` prefix, with session
// sharing structural (the control facade receives the runtime's shared,
// memoized session) and no second handler anywhere.
// ============================================================================

const openServers: Server[] = [];
const openHandles: StudioRpcHandle[] = [];
const openEventHubs: StudioEventHubApi[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
  await Promise.all(openHandles.splice(0).map((handle) => handle.dispose()));
  await Promise.all(openEventHubs.splice(0).map((eventHub) => eventHub.shutdown()));
});

describe("one /rpc mount serves the whole unified contract", () => {
  test("studio, civ7-control, and recipeDag namespaces answer over one handler", async () => {
    const facadeCalls: Array<Civ7ControlOrpcContext["endpointDefaults"]> = [];
    const recipeDagCalls: string[] = [];
    const { client } = await listenWithStudioServer({
      loadSetupCatalog: async () =>
        ({
          observedAt: "2026-06-12T00:00:00.000Z",
          roots: [],
          sourceFileCount: 0,
          leaders: [],
          civilizations: [],
          difficulties: [],
          gameSpeeds: [],
        }) as Awaited<ReturnType<StudioServerContext["loadSetupCatalog"]>>,
      civ7Control: {
        directControl: {
          getCiv7PlayableStatus: async (options: Civ7ControlOrpcContext["endpointDefaults"]) => {
            facadeCalls.push(options);
            return playableStatusResult();
          },
        } as unknown as StudioServerContext["civ7Control"]["directControl"],
        timeoutMs: 4321,
      },
      recipeDagService: {
        getRecipeDag: async (recipeId) => {
          recipeDagCalls.push(recipeId);
          if (recipeId === "missing/recipe") throw new RecipeDagNotFound(recipeId);
          return minimalRecipeDagResult(recipeId);
        },
      },
    });

    // (a) studio namespace.
    await expect(client.studio.serverInfo({})).resolves.toMatchObject({
      ok: true,
      serverInstanceId: "one-mount-test",
    });
    await expect(client.studio.operations.current({})).resolves.toMatchObject({
      ok: true,
      serverInstanceId: "one-mount-test",
      runInGame: { active: null, recent: [] },
      saveDeploy: { active: null, recent: [] },
    });

    // (a2) the STUDIO half of the merged `civ7.*` node — this is the half the
    // handler's spread can silently drop (review P2-1: a mutation removing
    // `...studioCiv7` from the merge must fail HERE, not just at the contract
    // collision pin below).
    await expect(client.civ7.setupCatalog({})).resolves.toMatchObject({
      ok: true,
      catalog: { leaders: [], sourceFileCount: 0 },
    });

    // (b) civ7 control namespace — twice, to pin session memoization.
    const readiness = await client.civ7.readiness.current({});
    await client.civ7.readiness.current({});
    expect(readiness).toMatchObject({ playable: true, readiness: "tuner-ready" });

    // Structural session sharing: the facade received the host timeout AND the
    // runtime's shared session — the SAME instance across calls.
    expect(facadeCalls).toHaveLength(2);
    const [first, second] = facadeCalls;
    expect(first?.timeoutMs).toBe(4321);
    expect(first?.session).toBeInstanceOf(Civ7DirectControlSession);
    expect(second?.session).toBe(first?.session);

    // Sanitization parity (pins moved from the deleted satellite-client test):
    // raw runtime detail stays out of readiness.current.
    const serialized = JSON.stringify(readiness);
    expect(serialized).not.toContain('"host"');
    expect(serialized).not.toContain('"port"');
    expect(serialized).not.toContain('"state"');
    expect(serialized).not.toContain("App UI");
    expect(serialized).not.toContain("Tuner");

    // (c) recipeDag namespace — success and the typed not-found error.
    await expect(
      client.recipeDag.get({ recipeId: "mod-swooper-maps/standard" }),
    ).resolves.toMatchObject({ recipeKey: "mod-swooper-maps/standard" });
    const { error } = await safe(client.recipeDag.get({ recipeId: "missing/recipe" }));
    expect(error).toMatchObject({ code: "RECIPE_DAG_RECIPE_NOT_FOUND" });
    expect(recipeDagCalls).toEqual(["mod-swooper-maps/standard", "missing/recipe"]);
  }, 20_000);

  test("out-of-scope paths fall through to the host 404", async () => {
    const { origin } = await listenWithStudioServer({});
    for (const path of ["/not-rpc", "/api/civ7/rpc/readiness/current", "/api/recipe-dag/rpc"]) {
      const res = await fetch(`${origin}${path}`);
      expect(res.status, path).toBe(404);
      await expect(res.text()).resolves.toBe("not found");
    }
  }, 20_000);

  test("the civ7 namespace merge is collision-free", () => {
    // The unified `civ7.*` node is the studio read surface plus the control
    // namespaces. If a future control namespace collides with a studio key
    // (or vice versa), the spread silently shadows — this pin makes that loud.
    const studioKeys = Object.keys(studioEffectContract.civ7);
    const controlKeys = Object.keys(Civ7ControlOrpcContract);
    const overlap = studioKeys.filter((key) => controlKeys.includes(key));
    expect(overlap).toEqual([]);
    // And the unified contract carries BOTH halves.
    const unifiedKeys = Object.keys(contract.civ7);
    for (const key of [...studioKeys, ...controlKeys]) {
      expect(unifiedKeys).toContain(key);
    }
  });
});

async function listenWithStudioServer(overrides: Partial<StudioServerContext>): Promise<{
  origin: string;
  client: ContractRouterClient<StudioContract>;
}> {
  const handler = createStudioRpcHandler(makeContext(overrides));
  openHandles.push(handler);
  const origin = await listen(async (req, res) => {
    const request = await nodeRequestToWebRequest(req);
    const { matched, response } = await handler.handle(request, { prefix: "/rpc" });
    if (!matched || !response) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
  });
  const client: ContractRouterClient<StudioContract> = createORPCClient(
    new RPCLink({ url: `${origin}/rpc` }),
  );
  return { origin, client };
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

async function nodeRequestToWebRequest(
  req: import("node:http").IncomingMessage,
): Promise<Request> {
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

function makeContext(overrides: Partial<StudioServerContext>): StudioServerContext {
  const eventHub = overrides.eventHub ?? createStudioEventHub();
  if (!overrides.eventHub) openEventHubs.push(eventHub);
  return {
    serverInstanceId: "one-mount-test",
    serverStartedAt: "2026-06-12T00:00:00.000Z",
    hostCommand: "serve",
    loadSetupCatalog: async () => {
      throw new Error("Unexpected setup-catalog call");
    },
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
      serverInstanceId: "one-mount-test",
      serverStartedAt: "2026-06-12T00:00:00.000Z",
      observedAt: "2026-06-12T00:00:00.000Z",
      runInGame: { active: null, recent: [] },
      saveDeploy: { active: null, recent: [] },
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

function playableStatusResult(): Civ7PlayableStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    playable: true,
    readiness: "tuner-ready",
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        ui: {
          inGame: probe(true),
          inShell: probe(false),
          inLoading: probe(false),
          canBeginGame: probe(false),
        },
      },
    },
    tuner: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      ready: true,
      snapshot: {
        evalOk: 2,
        ready: true,
      },
    },
    errors: ["raw runtime detail stays out of readiness.current"],
  } as Civ7PlayableStatusResult;
}

function probe<T>(value: T): { ok: true; value: T } {
  return { ok: true, value };
}

function minimalRecipeDagResult(recipeId: string) {
  return {
    recipeId: "standard",
    recipeKey: recipeId,
    namespace: "mod-swooper-maps",
    title: "Swooper Maps / Standard",
    phases: [],
    stages: [],
    edges: [],
    diagnostics: [],
  };
}
