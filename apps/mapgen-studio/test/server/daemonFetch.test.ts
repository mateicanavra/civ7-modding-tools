import { describe, expect, test } from "vitest";

import { createStudioDaemonFetch, type StudioDaemonDeps } from "../../src/server/daemon/daemon";
import { STUDIO_CIV7_CONTROL_ORPC_PATH } from "../../src/shared/civ7ControlOrpc";
import { STUDIO_RECIPE_DAG_ORPC_PATH } from "../../src/shared/recipeDagOrpc";

function makeDeps(overrides: Partial<StudioDaemonDeps> = {}): {
  deps: StudioDaemonDeps;
  calls: string[];
} {
  const calls: string[] = [];
  const handler = (name: string, matched = true) => ({
    handle: async () => {
      calls.push(name);
      return matched
        ? { matched: true, response: new Response(name, { status: 200 }) }
        : { matched: false as const };
    },
  });
  const deps: StudioDaemonDeps = {
    studioRpc: handler("studio"),
    controlRpc: handler("control"),
    recipeDagRpc: handler("recipeDag"),
    health: () => ({ ok: true, probe: "test" }),
    ...overrides,
  };
  return { deps, calls };
}

describe("studio daemon fetch router", () => {
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

  test("routes the three oRPC prefixes to their handlers", async () => {
    const { deps, calls } = makeDeps();
    const fetchHandler = createStudioDaemonFetch(deps);

    const studio = await fetchHandler(
      new Request("http://daemon.test/rpc/civ7/status", { method: "POST" }),
    );
    const control = await fetchHandler(
      new Request(`http://daemon.test${STUDIO_CIV7_CONTROL_ORPC_PATH}/readiness/current`, {
        method: "POST",
      }),
    );
    const recipeDag = await fetchHandler(
      new Request(`http://daemon.test${STUDIO_RECIPE_DAG_ORPC_PATH}/recipeDag/get`, {
        method: "POST",
      }),
    );

    await expect(studio.text()).resolves.toBe("studio");
    await expect(control.text()).resolves.toBe("control");
    await expect(recipeDag.text()).resolves.toBe("recipeDag");
    expect(calls).toEqual(["studio", "control", "recipeDag"]);
  });

  test("unmatched RPC paths under a mounted prefix are 404", async () => {
    const { deps } = makeDeps({
      studioRpc: { handle: async () => ({ matched: false }) },
    });
    const res = await createStudioDaemonFetch(deps)(
      new Request("http://daemon.test/rpc/nope", { method: "POST" }),
    );
    expect(res.status).toBe(404);
  });

  test("retired legacy /api paths are 404 (no fallbacks)", async () => {
    const { deps, calls } = makeDeps();
    const fetchHandler = createStudioDaemonFetch(deps);
    for (const path of [
      "/api/civ7/status",
      "/api/civ7/run-in-game/status?requestId=x",
      "/api/map-configs",
      "/api/studio/server-info",
    ]) {
      const res = await fetchHandler(new Request(`http://daemon.test${path}`));
      expect(res.status, path).toBe(404);
    }
    expect(calls).toEqual([]);
  });

  test("non-API paths without an assets root are 404", async () => {
    const { deps } = makeDeps();
    const res = await createStudioDaemonFetch(deps)(new Request("http://daemon.test/"));
    expect(res.status).toBe(404);
  });
});
