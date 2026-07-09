import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

describe("daemon deploy isolation", () => {
  it("does not replay dependency build outputs during Play or Save & Deploy", () => {
    expect(buildSwooperMapsStudioDeployPlan({ env: { PATH: "/bin" } }).buildTask).toBe(
      "mod-swooper-maps:build:studio-deploy"
    );
    expect(buildSwooperMapsStudioDeployPlan({ env: { PATH: "/bin" } }).buildArgs).toEqual([
      "run",
      "nx",
      "run",
      "mod-swooper-maps:build:studio-deploy",
      "--outputStyle=static",
    ]);
    expect(
      buildSwooperMapsStudioDeployPlan({
        requestId: "studio-run-in-game-test",
        env: { PATH: "/bin" },
      }).buildTask
    ).toBe("mod-swooper-maps:build:studio-deploy");
    expect(
      buildSwooperMapsStudioDeployPlan({
        requestId: "studio-run-in-game-test",
        env: { PATH: "/bin" },
      }).env
    ).toMatchObject({
      SWOOPER_STUDIO_RUN_ID: "studio-run-in-game-test",
      SWOOPER_INCLUDE_STUDIO_CURRENT: "1",
    });
  });
});
