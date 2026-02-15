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

describe("pipeline earth metrics", () => {
  it("produces broad earth-like coverage metrics on the standard preset", () => {
    const seed = 1337;
    const width = 48;
    const height = 28;
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
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[earth-metrics]", storyEnabled: true });
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

    const metrics = computeEarthMetrics({
      width,
      height,
      landMask: topography.landMask,
      lakeMask: hydrography.sinkMask,
      riverClass: hydrography.riverClass,
      biomeIndex: classification.biomeIndex,
    });

    expect(metrics.landShare).toBeGreaterThan(0.15);
    expect(metrics.landShare).toBeLessThan(0.9);
    expect(metrics.lakeShare).toBeLessThan(0.2);
    expect(metrics.riverClassShare).toBeGreaterThan(0);
    expect(metrics.biomeDiversity).toBeGreaterThanOrEqual(2);
    expect(metrics.dominantBiome).not.toBeNull();
  });
});
