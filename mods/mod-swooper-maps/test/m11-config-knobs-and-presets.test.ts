import { describe, expect, it } from "bun:test";
import { stableStringify } from "@swooper/mapgen-core";

import standardRecipe from "../src/recipes/standard/recipe.js";

const env = {
  seed: 123,
  dimensions: { width: 80, height: 60 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
};

const foundationBaseConfig = {
  version: 1,
  profiles: {
    resolutionProfile: "balanced",
    lithosphereProfile: "maximal-basaltic-lid-v1",
    mantleProfile: "maximal-potential-v1",
  },
  knobs: { plateCount: 28, plateActivity: 0.5 },
};

describe("M11 config layering: knobs-last (foundation + morphology)", () => {
  it("applies knobs as deterministic transforms over profile defaults", () => {
    const compiled = standardRecipe.compileConfig(env, {
      foundation: {
        ...foundationBaseConfig,
        knobs: { plateCount: 12, plateActivity: 0.8 },
      },
      "morphology-coasts": {
        knobs: { seaLevel: "water-heavy", coastRuggedness: "rugged" },
        advanced: {
          "landmass-plates": { seaLevel: { strategy: "default", config: { targetWaterPercent: 60 } } },
          "rugged-coasts": {
            coastlines: {
              strategy: "default",
              config: {
                coast: {
                  plateBias: {
                    threshold: 0.4,
                    power: 1.4,
                    convergent: 2.2,
                    transform: 0.3,
                    divergent: -0.3,
                    interior: 0.5,
                    bayWeight: 1.0,
                    bayNoiseBonus: 0.6,
                    fjordWeight: 0.7,
                  },
                  bay: { noiseGateAdd: 0, rollDenActive: 4, rollDenDefault: 5 },
                  fjord: { baseDenom: 12, activeBonus: 1, passiveBonus: 2 },
                },
              },
            },
          },
        },
      },
      "morphology-erosion": {
        knobs: { erosion: "high" },
        advanced: {
          geomorphology: {
            geomorphology: {
              strategy: "default",
              config: {
                geomorphology: {
                  fluvial: { rate: 0.2, m: 0.5, n: 1.0 },
                  diffusion: { rate: 0.2, talus: 0.5 },
                  deposition: { rate: 0.1 },
                  eras: 2,
                },
                worldAge: "mature",
              },
            },
          },
        },
      },
      "morphology-features": {
        knobs: { volcanism: "high" },
        advanced: {
          volcanoes: {
            volcanoes: {
              strategy: "default",
              config: { baseDensity: 0.01, hotspotWeight: 0.12, convergentMultiplier: 2.4 },
            },
          },
        },
      },
      "map-morphology": {
        knobs: { orogeny: "high" },
        mountains: { mountains: { strategy: "default", config: { tectonicIntensity: 1.0, mountainThreshold: 0.6, hillThreshold: 0.35 } } },
      },
    });

    // Foundation:
    // - plateCount sets authored plate count before dimension-aware scaling.
    const area = env.dimensions.width * env.dimensions.height;
    const meshScale = Math.pow(
      area / compiled.foundation.mesh.computeMesh.config.referenceArea,
      compiled.foundation.mesh.computeMesh.config.plateScalePower
    );
    const expectedMeshPlateCount = Math.max(2, Math.round(12 * meshScale));
    expect(compiled.foundation.mesh.computeMesh.config.plateCount).toBe(expectedMeshPlateCount);

    const plateGraphScale = Math.pow(
      area / compiled.foundation["plate-graph"].computePlateGraph.config.referenceArea,
      compiled.foundation["plate-graph"].computePlateGraph.config.plateScalePower
    );
    const expectedPlateGraphPlateCount = Math.max(2, Math.round(12 * plateGraphScale));
    expect(compiled.foundation["plate-graph"].computePlateGraph.config.plateCount).toBe(
      expectedPlateGraphPlateCount
    );
    // - plateActivity=0.8 scales kinematics and shifts boundary influence distance from the profile baseline.
    expect(compiled.foundation.projection.computePlates.config.boundaryInfluenceDistance).toBe(13);
    expect(compiled.foundation.projection.computePlates.config.movementScale).toBeCloseTo(72.8, 6);
    expect(compiled.foundation.projection.computePlates.config.rotationScale).toBeCloseTo(89.6, 6);

    // Morphology:
    // - seaLevel=water-heavy adds +15 to targetWaterPercent.
    expect(compiled["morphology-coasts"]["landmass-plates"].seaLevel.config.targetWaterPercent).toBe(75);

    // - erosion=high scales rates by 1.35.
    expect(compiled["morphology-erosion"].geomorphology.geomorphology.config.geomorphology.fluvial.rate).toBeCloseTo(0.27, 6);
    expect(compiled["morphology-erosion"].geomorphology.geomorphology.config.geomorphology.diffusion.rate).toBeCloseTo(0.27, 6);
    expect(compiled["morphology-erosion"].geomorphology.geomorphology.config.geomorphology.deposition.rate).toBeCloseTo(0.135, 6);

    // - coastRuggedness=rugged scales bay/fjord weights by 1.4.
    expect(compiled["morphology-coasts"]["rugged-coasts"].coastlines.config.coast.plateBias.bayWeight).toBeCloseTo(1.4, 6);
    expect(compiled["morphology-coasts"]["rugged-coasts"].coastlines.config.coast.plateBias.bayNoiseBonus).toBeCloseTo(0.84, 6);
    expect(compiled["morphology-coasts"]["rugged-coasts"].coastlines.config.coast.plateBias.fjordWeight).toBeCloseTo(0.98, 6);

    // - volcanism=high scales density/weights deterministically.
    expect(compiled["morphology-features"].volcanoes.volcanoes.config.baseDensity).toBeCloseTo(0.015, 6);
    expect(compiled["morphology-features"].volcanoes.volcanoes.config.hotspotWeight).toBeCloseTo(0.18, 6);
    expect(compiled["morphology-features"].volcanoes.volcanoes.config.convergentMultiplier).toBeCloseTo(3.0, 6);

    // - orogeny=high scales intensity and lowers thresholds.
    expect(compiled["map-morphology"]["plot-mountains"].mountains.config.tectonicIntensity).toBeCloseTo(1.25, 6);
    expect(compiled["map-morphology"]["plot-mountains"].mountains.config.mountainThreshold).toBeCloseTo(0.55, 6);
    expect(compiled["map-morphology"]["plot-mountains"].mountains.config.hillThreshold).toBeCloseTo(0.32, 6);
  });

  it("compiles deterministically for identical inputs", () => {
    const config = {
      foundation: foundationBaseConfig,
      "morphology-coasts": { knobs: { seaLevel: "earthlike", coastRuggedness: "normal" } },
    };
    const first = standardRecipe.compileConfig(env, config);
    const second = standardRecipe.compileConfig(env, config);
    expect(stableStringify(first.foundation)).toBe(stableStringify(second.foundation));
  });
});
