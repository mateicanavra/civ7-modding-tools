import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { buildStepTestDependencies, publishTestArtifact, withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";
import morphology from "../../../../../../src/domain/morphology/router.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as coastsArtifacts } from "../../../../../../src/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as landformsArtifacts } from "../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { LandmassesStep } from "../../../../../../src/recipes/standard/stages/morphology/features/steps/landmasses/step.js";
import { ResolvedCoastlineStep } from "../../../../../../src/recipes/standard/stages/morphology/features/steps/resolved-coastline/step.js";
import { createEmptyWaterFixture } from "./fixtures/surface-water.js";

describe("resolved surface geography composition", () => {
  it("publishes landmass and shoreline from the same final exposure without initial geometry", () => {
    const width = 8, height = 3;
    const exposure = new Uint8Array(width * height);
    // Newly dry wrapped land and a second island; all other cells remain water.
    exposure[width] = exposure[width * 2 - 1] = exposure[width + 4] = 1;
    const before = exposure.slice();
    const context = createMapContext({ adapter: createMockAdapter({ width, height }), setup: admitMapSetup({
      mapSeed: 1018, dimensions: { width, height }, latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }) });
    const { computeLandmasses } = morphology.landforms.ops;
    const { computeCoastalAdjacency, computeDistanceToCoast } = morphology.coasts.ops;
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        ...createEmptyWaterFixture(width, height).hydrography, exposedLandMask: exposure,
      });
      LandmassesStep.run(stepContext, { landmasses: computeLandmasses.defaultConfig },
        { landmasses: computeLandmasses.run }, buildStepTestDependencies(LandmassesStep, stepContext));
      ResolvedCoastlineStep.run(stepContext, {
        adjacency: computeCoastalAdjacency.defaultConfig, distanceToCoast: computeDistanceToCoast.defaultConfig,
      }, { adjacency: computeCoastalAdjacency.run, distanceToCoast: computeDistanceToCoast.run },
      buildStepTestDependencies(ResolvedCoastlineStep, stepContext));
    });
    const landmasses = readArtifact(context, landformsArtifacts.landmasses);
    const coast = readArtifact(context, coastsArtifacts.resolvedCoastline);
    expect(landmasses.landmasses).toHaveLength(2);
    expect(landmasses.landmassIdByTile[width]).toBe(landmasses.landmassIdByTile[width * 2 - 1]);
    for (let cell = 0; cell < exposure.length; cell++) {
      expect(landmasses.landmassIdByTile[cell]! >= 0).toBe(exposure[cell] === 1);
      if (coast.coastalLand[cell] === 1) expect(exposure[cell]).toBe(1);
      if (coast.coastalWater[cell] === 1) expect(exposure[cell]).toBe(0);
      if (coast.coastalLand[cell] || coast.coastalWater[cell]) expect(coast.distanceToCoast[cell]).toBe(0);
    }
    expect(exposure).toEqual(before);
  });
});
