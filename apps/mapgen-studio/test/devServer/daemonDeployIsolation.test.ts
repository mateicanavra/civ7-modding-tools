import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

describe("daemon deploy isolation", () => {
  it("does not replay dependency build outputs during Save & Deploy", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      launchConfig: {
        id: "studio-current",
        path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      },
      env: {
        PATH: "/bin",
        SWOOPER_INCLUDE_STUDIO_CURRENT: "1",
        SWOOPER_STUDIO_RUN_ID: "stale-run",
        SWOOPER_STUDIO_LAUNCH_CONFIG_ID: "stale-config",
        SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST: "stale-digest",
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
    expect(plan.env).toMatchObject({
      SWOOPER_STUDIO_DEPLOY_CONFIG_ID: "studio-current",
      SWOOPER_STUDIO_DEPLOY_CONFIG_PATH:
        "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
    });
    expect(plan.env).not.toHaveProperty("SWOOPER_INCLUDE_STUDIO_CURRENT");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_RUN_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_CONFIG_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST");
  });
});
