import { createServer, type Server } from "node:http";
import { type Civ7ControlOrpcContext, Civ7ControlOrpcContract } from "@civ7/control-orpc";
import { Civ7DirectControlSession, type Civ7PlayableStatusResult } from "@civ7/direct-control";
import {
  contract,
  createStudioRpcHandler,
  type StudioContract,
  type StudioOperationRuntimePorts,
  type StudioRpcHandle,
  type StudioServerContext,
  studioEffectContract,
} from "@civ7/studio-server";
import { createORPCClient, safe } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { afterEach, describe, expect, test } from "vitest";

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

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
  await Promise.all(openHandles.splice(0).map((handle) => handle.dispose()));
});

describe("one /rpc mount serves the whole unified contract", () => {
  test("studio, civ7-control, and recipeDag namespaces answer over one handler", async () => {
    const facadeCalls: Array<Civ7ControlOrpcContext["endpointDefaults"]> = [];
    const lifecycleCalls: string[] = [];
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
        directLifecycle: {
          getSetupSnapshot: async () => {
            lifecycleCalls.push("getSetupSnapshot");
            throw new Error("Studio HTTP must not acquire lifecycle mutation");
          },
        } as unknown as StudioServerContext["civ7Control"]["directLifecycle"],
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
    const serverInfo = await client.studio.serverInfo({});
    expect(serverInfo).toMatchObject({
      ok: true,
      serverInstanceId: expect.stringMatching(/^studio-server-/),
    });
    await expect(client.studio.operations.current({})).resolves.toMatchObject({
      ok: true,
      serverInstanceId: serverInfo.serverInstanceId,
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

    // The merged control contract remains discoverable, but Studio deliberately
    // withholds the lifecycle facade so setup/start can only enter through the
    // operation runtime's admission, lease, correlation, and mutation fence.
    const lifecycle = await safe(
      client.civ7.lifecycle.singlePlayer.start({
        mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
        mapSize: "MAPSIZE_STANDARD",
        seed: 43,
        targetModId: "mod-swooper-studio-run",
        gameOptions: {},
        playerOptions: {},
        activeGamePolicy: "exit-active-game",
      })
    );
    expect(lifecycle.error).toMatchObject({
      code: "LIFECYCLE_DEPENDENCY_UNAVAILABLE",
      data: { detail: "direct-lifecycle-facade-unavailable" },
    });
    expect(lifecycleCalls).toEqual([]);

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
      client.recipeDag.get({ recipeId: "mod-swooper-maps/standard" })
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

  test("serializes complete public control procedures on the daemon Tuner lease", async () => {
    const firstEntered = deferred<void>();
    const releaseFirst = deferred<void>();
    let calls = 0;
    const { client } = createInProcessStudioClient({
      civ7Control: {
        directControl: {
          getCiv7PlayableStatus: async () => {
            calls += 1;
            if (calls === 1) {
              firstEntered.resolve();
              await releaseFirst.promise;
            }
            return playableStatusResult();
          },
        } as unknown as StudioServerContext["civ7Control"]["directControl"],
        timeoutMs: 1234,
      },
    });

    const first = client.civ7.readiness.current({});
    await firstEntered.promise;
    const second = client.civ7.readiness.current({});
    await Promise.resolve();
    expect(calls).toBe(1);

    releaseFirst.resolve();
    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
    expect(calls).toBe(2);
  });

  test("removes an aborted queued control procedure before it can enter", async () => {
    const firstEntered = deferred<void>();
    const releaseFirst = deferred<void>();
    let calls = 0;
    const { client } = createInProcessStudioClient({
      civ7Control: {
        directControl: {
          getCiv7PlayableStatus: async () => {
            calls += 1;
            if (calls === 1) {
              firstEntered.resolve();
              await releaseFirst.promise;
            }
            return playableStatusResult();
          },
        } as unknown as StudioServerContext["civ7Control"]["directControl"],
        timeoutMs: 1234,
      },
    });

    const first = client.civ7.readiness.current({});
    await firstEntered.promise;
    const controller = new AbortController();
    const queued = client.civ7.readiness.current({}, { signal: controller.signal });
    controller.abort();

    await expect(queued).rejects.toBeDefined();
    releaseFirst.resolve();
    await first;
    await client.civ7.readiness.current({});
    expect(calls).toBe(2);
  });

  test("drains an admitted control procedure before cancellation releases its lease", async () => {
    const firstEntered = deferred<void>();
    const releaseFirst = deferred<void>();
    const secondEntered = deferred<void>();
    let calls = 0;
    const { client } = createInProcessStudioClient({
      civ7Control: {
        directControl: {
          getCiv7PlayableStatus: async () => {
            calls += 1;
            if (calls === 1) {
              firstEntered.resolve();
              await releaseFirst.promise;
            } else {
              secondEntered.resolve();
            }
            return playableStatusResult();
          },
        } as unknown as StudioServerContext["civ7Control"]["directControl"],
        timeoutMs: 1234,
      },
    });

    const controller = new AbortController();
    const first = client.civ7.readiness.current({}, { signal: controller.signal });
    const firstOutcome = first.then(
      () => "resolved" as const,
      () => "rejected" as const
    );
    await firstEntered.promise;
    controller.abort();
    const second = client.civ7.readiness.current({});

    const secondEntryState = await promiseStateAfter(secondEntered.promise, 20);
    const callsBeforeRelease = calls;
    releaseFirst.resolve();
    await expect(firstOutcome).resolves.toBe("rejected");
    await expect(second).resolves.toMatchObject({ readiness: "tuner-ready" });
    expect(secondEntryState).toBe("pending");
    expect(callsBeforeRelease).toBe(1);
    expect(calls).toBe(2);
  });

  test("daemon disposal drains an admitted control procedure before closing the session", async () => {
    const entered = deferred<void>();
    const release = deferred<void>();
    const { client, handler } = createInProcessStudioClient({
      civ7Control: {
        directControl: {
          getCiv7PlayableStatus: async () => {
            entered.resolve();
            await release.promise;
            return playableStatusResult();
          },
        } as unknown as StudioServerContext["civ7Control"]["directControl"],
        timeoutMs: 1234,
      },
    });

    const requestOutcome = client.civ7.readiness.current({}).then(
      () => "resolved" as const,
      () => "rejected" as const
    );
    await entered.promise;
    const disposal = handler.dispose();

    const disposalState = await promiseStateAfter(disposal, 20);
    release.resolve();
    await disposal;
    await expect(requestOutcome).resolves.toBe("resolved");
    expect(disposalState).toBe("pending");
    const openHandleIndex = openHandles.indexOf(handler);
    if (openHandleIndex >= 0) openHandles.splice(openHandleIndex, 1);
  });

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
    new RPCLink({ url: `${origin}/rpc` })
  );
  return { origin, client };
}

function createInProcessStudioClient(overrides: Partial<StudioServerContext>): {
  handler: StudioRpcHandle;
  client: ContractRouterClient<StudioContract>;
} {
  const handler = createStudioRpcHandler(makeContext(overrides));
  openHandles.push(handler);
  const client: ContractRouterClient<StudioContract> = createORPCClient(
    new RPCLink({
      url: "http://studio.test/rpc",
      fetch: async (request) => {
        const result = await handler.handle(request, { prefix: "/rpc" });
        return result.response ?? new Response("not found", { status: 404 });
      },
    })
  );
  return { handler, client };
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

function makeContext(overrides: Partial<StudioServerContext>): StudioServerContext {
  return {
    viteCommand: "serve",
    loadSetupCatalog: async () => {
      throw new Error("Unexpected setup-catalog call");
    },
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

function makeOperationRuntimePorts(): StudioOperationRuntimePorts {
  return {
    clock: {
      now: () => new Date("2026-06-12T00:00:00.000Z"),
    },
    generateRunInGameMod: async () => generatedRunInGameMod(),
    deployRunInGame: async ({ requestId, generatedMod }) =>
      runInGameDeployment({ requestId, materialization: generatedMod.materialization }),
    waitForRunInGameLogEvidence: async () => ({ result: { ok: true } }),
    observeRunInGameRuntime: async (args) => runInGameRuntimeObservation(args),
    buildRunInGameEvidence: async () => ({ result: { ok: true } }),
    prepareSaveDeployStart: async () => ({}),
    saveMapConfig: async () => ({ saved: true }),
    deploySavedMapConfig: async () => ({ deployed: true }),
    rollbackSaveDeploy: async () => ({ restored: true }),
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
      generatedModRoot: "/tmp/studio-one-mount-generated-run-test",
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
      startedAt: "2026-06-12T00:00:00.000Z",
      completedAt: "2026-06-12T00:00:01.000Z",
      filesCopied: 1,
    },
    deployedSnapshot: {
      requestId,
      deployedModId: "mod-swooper-studio-run",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      observedAt: "2026-06-12T00:00:01.000Z",
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

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function promiseStateAfter(
  promise: PromiseLike<unknown>,
  delayMs: number
): Promise<"pending" | "settled"> {
  return Promise.race([
    Promise.resolve(promise).then(
      () => "settled" as const,
      () => "settled" as const
    ),
    new Promise<"pending">((resolve) => setTimeout(() => resolve("pending"), delayMs)),
  ]);
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
