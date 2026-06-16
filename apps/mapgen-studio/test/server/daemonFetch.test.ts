import { describe, expect, test } from "vitest";

import {
  createStudioDaemonFetch,
  parseStudioDaemonArgs,
  type StudioDaemonDeps,
} from "../../src/server/daemon/daemon";

function makeDeps(overrides: Partial<StudioDaemonDeps> = {}): {
  deps: StudioDaemonDeps;
  calls: string[];
} {
  const calls: string[] = [];
  const deps: StudioDaemonDeps = {
    studioRpc: {
      handle: async () => {
        calls.push("studio");
        return { matched: true, response: new Response("studio", { status: 200 }) };
      },
    },
    health: () => ({ ok: true, probe: "test" }),
    ...overrides,
  };
  return { deps, calls };
}

describe("studio daemon fetch router", () => {
  test("daemon args accept an env override for isolated dev ports", () => {
    expect(
      parseStudioDaemonArgs([], {
        repoRoot: "/repo",
        env: { STUDIO_DAEMON_PORT: "5274" },
      })
    ).toMatchObject({
      host: "127.0.0.1",
      port: 5274,
      repoRoot: "/repo",
    });
  });

  test("explicit daemon port args override the env port", () => {
    expect(
      parseStudioDaemonArgs(["--port", "5374"], {
        repoRoot: "/repo",
        env: { STUDIO_DAEMON_PORT: "5274" },
      }).port
    ).toBe(5374);
  });

  test("serves /healthz from the health probe", async () => {
    const { deps } = makeDeps();
    const fetchHandler = createStudioDaemonFetch(deps);
    const res = await fetchHandler(new Request("http://daemon.test/healthz"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true, probe: "test" });
  });

  test("healthz reports 503 when the probe is unhealthy", async () => {
    const { deps } = makeDeps({ health: () => ({ ok: false }) });
    const res = await createStudioDaemonFetch(deps)(new Request("http://daemon.test/healthz"));
    expect(res.status).toBe(503);
  });

  test("routes every /rpc namespace to the ONE handler", async () => {
    const { deps, calls } = makeDeps();
    const fetchHandler = createStudioDaemonFetch(deps);

    for (const path of [
      "/rpc/civ7/status",
      "/rpc/civ7/readiness/current",
      "/rpc/recipeDag/get",
      "/rpc/studio/serverInfo",
    ]) {
      const res = await fetchHandler(new Request(`http://daemon.test${path}`, { method: "POST" }));
      await expect(res.text(), path).resolves.toBe("studio");
    }
    expect(calls).toEqual(["studio", "studio", "studio", "studio"]);
  });

  test("unmatched RPC paths under the mounted prefix are 404", async () => {
    const { deps } = makeDeps({
      studioRpc: { handle: async () => ({ matched: false }) },
    });
    const res = await createStudioDaemonFetch(deps)(
      new Request("http://daemon.test/rpc/nope", { method: "POST" })
    );
    expect(res.status).toBe(404);
  });

  test("retired /api paths are 404 — legacy REST and the former satellite mounts", async () => {
    const { deps, calls } = makeDeps();
    const fetchHandler = createStudioDaemonFetch(deps);
    for (const path of [
      "/api/civ7/status",
      "/api/civ7/run-in-game/status?requestId=x",
      "/api/map-configs",
      "/api/studio/server-info",
      // The satellite oRPC mounts died with the runtime-one-mount slice.
      "/api/civ7/rpc/readiness/current",
      "/api/recipe-dag/rpc/recipeDag/get",
    ]) {
      const res = await fetchHandler(new Request(`http://daemon.test${path}`));
      expect(res.status, path).toBe(404);
    }
    expect(calls).toEqual([]);
  });

  test("retired /api paths stay 404 even with a static assets root", async () => {
    const { deps } = makeDeps({ assetsRoot: "/tmp/does-not-exist-assets" });
    const res = await createStudioDaemonFetch(deps)(
      new Request("http://daemon.test/api/civ7/rpc/readiness/current")
    );
    expect(res.status).toBe(404);
  });

  test("non-API paths without an assets root are 404", async () => {
    const { deps } = makeDeps();
    const res = await createStudioDaemonFetch(deps)(new Request("http://daemon.test/"));
    expect(res.status).toBe(404);
  });
});
