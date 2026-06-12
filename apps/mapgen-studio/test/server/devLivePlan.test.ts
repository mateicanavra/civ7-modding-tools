import { describe, expect, test } from "vitest";

import { makeDevLivePlan, parseDevLiveArgs } from "../../src/server/daemon/devLive";

describe("dev-live plan", () => {
  test("defaults: daemon on 5174, vite frontend proxying to it", () => {
    const plan = makeDevLivePlan(parseDevLiveArgs([]));
    expect(plan.backendUrl).toBe("http://127.0.0.1:5174");
    expect(plan.rpcProxyTarget).toBe(plan.backendUrl);
    expect(plan.frontendUrl).toBe("http://127.0.0.1:5173/");
    expect(plan.daemon.args).toEqual([
      "--watch",
      "src/server/daemon/daemon.ts",
      "--host",
      "127.0.0.1",
      "--port",
      "5174",
    ]);
    expect(plan.vite.args).toEqual(["run", "dev:frontend"]);
    expect(plan.vite.env).toEqual({ STUDIO_DEV_RPC_TARGET: "http://127.0.0.1:5174" });
  });

  test("ports and host are overridable", () => {
    const plan = makeDevLivePlan(
      parseDevLiveArgs(["--host", "0.0.0.0", "--port", "6000", "--backend-port", "6001"]),
    );
    expect(plan.backendUrl).toBe("http://0.0.0.0:6001");
    expect(plan.frontendUrl).toBe("http://0.0.0.0:6000/");
    expect(plan.vite.env).toEqual({ STUDIO_DEV_RPC_TARGET: "http://0.0.0.0:6001" });
  });
});
