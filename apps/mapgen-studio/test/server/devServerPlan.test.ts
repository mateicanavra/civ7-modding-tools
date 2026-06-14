import { describe, expect, test } from "vitest";

import { makeStudioDevPlan, parseStudioDevArgs } from "../../src/server/dev";

describe("dev server plan", () => {
  test("defaults: Studio server on 5174, Vite frontend proxying to it", () => {
    const plan = makeStudioDevPlan(parseStudioDevArgs([]));
    expect(plan.backendUrl).toBe("http://127.0.0.1:5174");
    expect(plan.rpcProxyTarget).toBe(plan.backendUrl);
    expect(plan.frontendUrl).toBe("http://127.0.0.1:5173/");
    expect(plan.watchEntrypoint).toBe("src/server/dev.ts");
    expect(plan.studioServer).toEqual({ host: "127.0.0.1", port: 5174 });
    expect(plan.vite.env).toEqual({ STUDIO_DEV_RPC_TARGET: "http://127.0.0.1:5174" });
  });

  test("ports and host are overridable", () => {
    const plan = makeStudioDevPlan(
      parseStudioDevArgs(["--host", "0.0.0.0", "--port", "6000", "--backend-port", "6001"]),
    );
    expect(plan.backendUrl).toBe("http://0.0.0.0:6001");
    expect(plan.frontendUrl).toBe("http://0.0.0.0:6000/");
    expect(plan.studioServer).toEqual({ host: "0.0.0.0", port: 6001 });
    expect(plan.vite.env).toEqual({ STUDIO_DEV_RPC_TARGET: "http://0.0.0.0:6001" });
  });
});
