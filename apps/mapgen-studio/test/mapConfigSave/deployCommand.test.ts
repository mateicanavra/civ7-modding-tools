import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

describe("Swooper Maps Studio deploy plan", () => {
  it("uses the Studio deploy build target for save/deploy without request markers", () => {
    const plan = buildSwooperMapsStudioDeployPlan({ env: { PATH: "/bin" } });

    expect(plan.buildTask).toBe("mod-swooper-maps:build:studio-deploy");
    expect(plan.buildArgs).toEqual([
      "run",
      "nx",
      "run",
      "mod-swooper-maps:build:studio-deploy",
      "--outputStyle=static",
    ]);
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_RUN_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_INCLUDE_STUDIO_CURRENT");
  });

  it("adds the Run in Game request marker and transient map row only for proof-correlated launches", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      requestId: "studio-run-in-game-test",
      env: { PATH: "/bin" },
    });

    expect(plan.buildArgs).toEqual([
      "run",
      "nx",
      "run",
      "mod-swooper-maps:build:studio-deploy",
      "--outputStyle=static",
    ]);
    expect(plan.env.SWOOPER_STUDIO_RUN_ID).toBe("studio-run-in-game-test");
    expect(plan.env.SWOOPER_INCLUDE_STUDIO_CURRENT).toBe("1");
  });
});
