import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

describe("Swooper Maps Studio deploy plan", () => {
  it("uses the mod-only build task for save/deploy without request markers", () => {
    const plan = buildSwooperMapsStudioDeployPlan({ env: { PATH: "/bin" } });

    expect(plan.buildTask).toBe("mod-swooper-maps#build");
    expect(plan.buildArgs).toEqual([
      "x",
      "turbo",
      "run",
      "build",
      "--filter=mod-swooper-maps",
      "--only",
    ]);
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_RUN_ID");
  });

  it("adds the Run in Game request marker only for proof-correlated launches", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      requestId: "studio-run-in-game-test",
      env: { PATH: "/bin" },
    });

    expect(plan.buildArgs).toEqual([
      "x",
      "turbo",
      "run",
      "build",
      "--filter=mod-swooper-maps",
      "--only",
    ]);
    expect(plan.env.SWOOPER_STUDIO_RUN_ID).toBe("studio-run-in-game-test");
  });
});
