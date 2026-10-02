import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  validateSchemaValueForTest,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import morphology from "../../../../../../../../src/domain/morphology/router.js";
import { artifacts as erosionArtifacts } from "../../../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as terrainArtifacts } from "../../../../../../../../src/domain/morphology/modules/terrain/artifacts/index.js";
import morphologyErosionStage from "../../../../../../../../src/recipes/standard/stages/morphology/erosion/index.js";
import { config as geomorphologyStepConfig } from "../../../../../../../../src/recipes/standard/stages/morphology/erosion/steps/geomorphology/config.js";
import { GeomorphologyStep } from "../../../../../../../../src/recipes/standard/stages/morphology/erosion/steps/geomorphology/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../../setup.js";
import {
  createStandardRecipeTestConfig,
  standardMapConfig,
} from "../../../../../fixtures/standard-recipe.js";

const setup = admitMapSetup({
  mapSeed: TEST_MAP_SEED,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
});

function normalizeErosion(erosion: "low" | "normal" | "high") {
  if (!GeomorphologyStep.normalize) throw new Error("Geomorphology must normalize erosion.");
  const stageConfig = createStandardRecipeTestConfig()["morphology-erosion"];
  stageConfig.geomorphology.geomorphology.config.geomorphology.diffusion.rate = 0.23;
  stageConfig.knobs.erosion = erosion;
  const admitted = validateSchemaValueForTest(
    morphologyErosionStage.surfaceSchema, stageConfig, "/morphology-erosion"
  );
  const { knobs, rawSteps } = morphologyErosionStage.toInternal({ setup, stageConfig: admitted });
  const config = validateSchemaValueForTest(
    geomorphologyStepConfig.schema, rawSteps.geomorphology, "/morphology-erosion/geomorphology"
  );
  return validateSchemaValueForTest(
    geomorphologyStepConfig.schema,
    GeomorphologyStep.normalize(config, { setup, knobs }),
    "/morphology-erosion/geomorphology"
  );
}

describe("morphology geomorphology authoring", () => {
  it("normalizes only diffusion across low, normal, and high postures", () => {
    for (const [posture, multiplier] of [["low", 0.75], ["normal", 1], ["high", 1.35]] as const) {
      const selection = normalizeErosion(posture).geomorphology;
      expect(selection.strategy).toBe("hillslope-diffusion");
      expect(selection.config.geomorphology.diffusion.rate).toBeCloseTo(0.23 * multiplier, 12);
      expect(Object.keys(selection.config.geomorphology).sort()).toEqual(["diffusion", "eras"]);
      expect(selection.config.geomorphology.eras).toBe(1);
      expect(selection.config.worldAge).toBe("young");
    }
  });

  it("refuses the displaced strategy and fluvial/deposition leaves at the step surface", () => {
    const stageConfig = createStandardRecipeTestConfig()["morphology-erosion"];
    const selection = stageConfig.geomorphology.geomorphology;
    const admits = (geomorphology: unknown) => validateSchemaValueForTest(
      geomorphologyStepConfig.schema, { geomorphology }, "/geomorphology"
    );
    expect(() => admits({ ...selection, strategy: "stream-power-diffusion" })).toThrow();
    for (const process of ["fluvial", "deposition"]) {
      expect(() => admits({
        ...selection,
        config: {
          ...selection.config,
          geomorphology: { ...selection.config.geomorphology, [process]: { rate: 0 } },
        },
      })).toThrow();
    }
  });

  it("dispatches with only base topography and substrate authorities", () => {
    const { width, height } = setup.dimensions;
    const size = width * height;
    const context = createMapContext({ setup, adapter: createMockAdapter({ width, height }) });
    const topography = {
      elevation: new Int16Array(size).fill(10), seaLevel: 0,
      landMask: new Uint8Array(size).fill(1), bathymetry: new Int16Array(size),
    };
    topography.elevation[0] = 30;
    const substrate = {
      erodibilityK: new Float32Array(size).fill(0.2),
      sedimentDepth: new Float32Array(size).fill(0.125),
    };
    const before = structuredClone({ topography, substrate });
    let calls = 0;
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, terrainArtifacts.baseTopography, topography);
      publishTestArtifact(stepContext, terrainArtifacts.baseSubstrate, substrate);
      GeomorphologyStep.run(stepContext, normalizeErosion("low"), {
        geomorphology: (...[input, selection]: Parameters<typeof morphology.erosion.ops.computeGeomorphicCycle.run>) => {
          calls += 1;
          expect(Object.keys(input).sort()).toEqual([
            "elevation", "erodibilityK", "height", "landMask", "seaLevel", "sedimentDepth", "width",
          ]);
          return morphology.erosion.ops.computeGeomorphicCycle.run(input, selection);
        },
      }, buildStepTestDependencies(GeomorphologyStep, stepContext));
    });
    expect(calls).toBe(1);
    expect({ topography, substrate }).toEqual(before);
    expect(readArtifact(context, erosionArtifacts.erodedTopography).elevation[0]).toBeLessThan(30);
    expect(readArtifact(context, erosionArtifacts.substrate)).toEqual(substrate);
    expect(GeomorphologyStep.contract.requires).toEqual([
      terrainArtifacts.baseTopography, terrainArtifacts.baseSubstrate,
    ]);
  });
});
