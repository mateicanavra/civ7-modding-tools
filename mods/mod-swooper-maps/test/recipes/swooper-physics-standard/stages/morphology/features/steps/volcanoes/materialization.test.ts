import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import morphologyDomain from "@mapgen/domain/morphology/ops";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { artifactModules as standardArtifactModules } from "../../../../../../../../src/recipes/standard/artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { VolcanoesStep } from "../../../../../../../../src/recipes/standard/stages/morphology-features/steps/volcanoes/step.js";
import { TEST_MAP_SIZE } from "../../../../../../../map-size.js";

describe("morphology-features volcano materialization", () => {
  it("filters invalid and water plans before deriving sorted tectonic evidence", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const waterIndex = 2;
    const riftIndex = 3;
    const subductionIndex = 4;
    const hotspotIndex = 5;
    const landMask = new Uint8Array(size).fill(1);
    landMask[waterIndex] = 0;

    const boundaryType = new Uint8Array(size);
    boundaryType[riftIndex] = 2;
    boundaryType[subductionIndex] = 1;
    const volcanism = new Uint8Array(size);
    volcanism[riftIndex] = 128;
    volcanism[subductionIndex] = 255;
    volcanism[hotspotIndex] = 64;

    const setup = admitMapSetup({
      mapSeed: 424242,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
    });
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width, height }),
    });
    const dependencies = buildStepTestDependencies(VolcanoesStep);

    withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, standardArtifactModules.foundationPlates, {
        id: new Int16Array(size),
        boundaryCloseness: new Uint8Array(size),
        boundaryType,
        tectonicStress: new Uint8Array(size),
        upliftPotential: new Uint8Array(size),
        riftPotential: new Uint8Array(size),
        shieldStability: new Uint8Array(size),
        volcanism,
        movementU: new Int8Array(size),
        movementV: new Int8Array(size),
        rotation: new Int8Array(size),
      });
      publishTestArtifact(context, morphologyArtifactModules.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });

      VolcanoesStep.run(
        context,
        { volcanoes: structuredClone(morphologyDomain.ops.planVolcanoes.defaultConfig) },
        {
          volcanoes: () => ({
            volcanoes: [
              { index: hotspotIndex },
              { index: size },
              { index: waterIndex },
              { index: -1 },
              { index: subductionIndex },
              { index: riftIndex },
            ],
          }),
        },
        dependencies
      );

      const evidence = dependencies.artifacts.volcanoes.read(context);
      expect(evidence.volcanoes).toEqual([
        { tileIndex: riftIndex, kind: "rift", strength01: 128 / 255 },
        { tileIndex: subductionIndex, kind: "subductionArc", strength01: 1 },
        { tileIndex: hotspotIndex, kind: "hotspot", strength01: 64 / 255 },
      ]);
      expect(
        Array.from(evidence.volcanoMask.entries())
          .filter(([, present]) => present === 1)
          .map(([tileIndex]) => tileIndex)
      ).toEqual([riftIndex, subductionIndex, hotspotIndex]);
    });
  });
});
