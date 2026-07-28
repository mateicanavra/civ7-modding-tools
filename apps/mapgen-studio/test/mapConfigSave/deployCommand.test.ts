import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

describe("Swooper Maps Studio deploy plan", () => {
  it("uses the Studio deploy build target for save/deploy without request markers", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      env: {
        PATH: "/bin",
        SWOOPER_INCLUDE_STUDIO_CURRENT: "1",
        SWOOPER_STUDIO_DEPLOY_CONFIG_ID: "stale-config",
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
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_DEPLOY_CONFIG_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_CONFIG_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST");
  });

  it("selects the saved config by id alone for operation deploy builds", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      launchConfigId: "saved-config",
      env: { PATH: "/bin", SWOOPER_STUDIO_RUN_ID: "stale-run" },
    });

    expect(plan.env.SWOOPER_STUDIO_DEPLOY_CONFIG_ID).toBe("saved-config");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_RUN_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_CONFIG_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST");
  });
});
