import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { computeEarthMetrics } from "../../src/dev/diagnostics/extract-earth-metrics.js";
import { standardConfig } from "../support/standard-config.js";

function runMetrics(seed: number, width: number, height: number) {
  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };
  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: { topLatitude: mapInfo.MaxLatitude, bottomLatitude: mapInfo.MinLatitude },
  };

  const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[seed-matrix]", storyEnabled: true });
  standardRecipe.run(context, env, standardConfig, { log: () => {} });

  const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
    | { landMask?: Uint8Array }
    | undefined;
  const hydrography = context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
    | { riverClass?: Uint8Array; sinkMask?: Uint8Array }
    | undefined;
  const classification = context.artifacts.get(ecologyArtifacts.biomeClassification.id) as
    | { biomeIndex?: Uint8Array }
    | undefined;
  if (!(topography?.landMask instanceof Uint8Array)) throw new Error("Missing topography.landMask.");
  if (!(hydrography?.riverClass instanceof Uint8Array)) throw new Error("Missing hydrography.riverClass.");
  if (!(hydrography?.sinkMask instanceof Uint8Array)) throw new Error("Missing hydrography.sinkMask.");
  if (!(classification?.biomeIndex instanceof Uint8Array)) throw new Error("Missing biomeClassification.biomeIndex.");

  return computeEarthMetrics({
    width,
    height,
    landMask: topography.landMask,
    lakeMask: hydrography.sinkMask,
    riverClass: hydrography.riverClass,
    biomeIndex: classification.biomeIndex,
  });
}

describe("pipeline seed matrix stats", () => {
  it("remains deterministic and non-degenerate across canonical seeds", () => {
    const seeds = [1337, 4242, 9001];
    for (const seed of seeds) {
      const metricsA = runMetrics(seed, 32, 20);
      const metricsB = runMetrics(seed, 32, 20);
      expect(metricsA).toEqual(metricsB);

      expect(metricsA.landShare).toBeGreaterThan(0);
      expect(metricsA.landShare).toBeLessThan(1);
      expect(metricsA.lakeShare).toBeGreaterThanOrEqual(0);
      expect(metricsA.lakeShare).toBeLessThan(0.5);
      expect(metricsA.riverClassShare).toBeGreaterThanOrEqual(0);
      expect(metricsA.riverClassShare).toBeLessThan(1);
      expect(metricsA.biomeDiversity).toBeGreaterThanOrEqual(1);
    }
  });
});
