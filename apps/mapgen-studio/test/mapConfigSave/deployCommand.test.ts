import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

describe("Swooper Maps Studio deploy plan", () => {
  it("uses the Studio deploy build target for save/deploy without request markers", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      env: {
        PATH: "/bin",
        SWOOPER_INCLUDE_STUDIO_CURRENT: "1",
        SWOOPER_STUDIO_LAUNCH_CONFIG_ID: "stale-config",
        SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST: "stale-digest",
        SWOOPER_STUDIO_RUN_ID: "stale-run",
      },
    });

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
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_CONFIG_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST");
  });

  it("adds Run in Game proof markers only for proof-correlated launches", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      requestId: "studio-run-in-game-test",
      launchConfigId: "studio-current",
      launchEnvelopeDigest: "launch-envelope-digest-test",
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
    expect(plan.env.SWOOPER_STUDIO_LAUNCH_CONFIG_ID).toBe("studio-current");
    expect(plan.env.SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST).toBe("launch-envelope-digest-test");
  });
});
