import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

const servicePath = fileURLToPath(
  new URL("../../src/server/recipeDag/service.ts", import.meta.url)
);

describe("daemon deploy isolation", () => {
  it("keeps deploy-written recipe dist artifacts out of the daemon recipe-DAG import graph", async () => {
    const serviceSource = await readFile(servicePath, "utf8");

    expect(serviceSource).not.toMatch(/from\s+["']mod-swooper-maps\/recipes\//);
    expect(serviceSource).toContain("mods/mod-swooper-maps/src/recipes");
    expect(serviceSource).toContain("/standard/recipe.js");
    expect(serviceSource).toContain("/browser-test/recipe.js");
  });

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
  });
});
