import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

describe("daemon deploy isolation", () => {
  it("does not replay dependency build outputs during Save & Deploy", () => {
    const plan = buildSwooperMapsStudioDeployPlan({
      launchConfigId: "studio-current",
      env: {
        PATH: "/bin",
        SWOOPER_INCLUDE_STUDIO_CURRENT: "1",
        SWOOPER_STUDIO_RUN_ID: "stale-run",
        SWOOPER_STUDIO_LAUNCH_CONFIG_ID: "stale-config",
        SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST: "stale-digest",
      },
    });

    expect(plan.task).toBe("swooper-physics-mod:deploy:studio");
    expect(plan.args).toEqual([
      "run",
      "nx",
      "run",
      "swooper-physics-mod:deploy:studio",
      "--outputStyle=static",
    ]);
    expect(plan.env).toMatchObject({
      SWOOPER_STUDIO_DEPLOY_CONFIG_ID: "studio-current",
    });
    expect(plan.env).not.toHaveProperty("SWOOPER_INCLUDE_STUDIO_CURRENT");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_RUN_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_CONFIG_ID");
    expect(plan.env).not.toHaveProperty("SWOOPER_STUDIO_LAUNCH_ENVELOPE_DIGEST");
  });
});
