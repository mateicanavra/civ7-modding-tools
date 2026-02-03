import { describe, expect, it } from "bun:test";

import standardRecipe from "../src/recipes/standard/recipe.js";

const env = {
  seed: 123,
  dimensions: { width: 80, height: 60 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
};

describe("M11 config layering: knobs-last (foundation + morphology)", () => {
  it("treats missing knobs the same as explicit empty knobs objects", () => {
    const compiledMissing = standardRecipe.compileConfig(env, {});
    const compiledExplicit = standardRecipe.compileConfig(env, {
      foundation: { knobs: {} },
      "morphology-coasts": { knobs: {} },
      "morphology-routing": { knobs: {} },
      "morphology-erosion": { knobs: {} },
      "morphology-features": { knobs: {} },
      "map-morphology": { knobs: {} },
    });

    expect(compiledMissing.foundation).toEqual(compiledExplicit.foundation);
    expect(compiledMissing["morphology-coasts"]).toEqual(compiledExplicit["morphology-coasts"]);
    expect(compiledMissing["morphology-routing"]).toEqual(compiledExplicit["morphology-routing"]);
    expect(compiledMissing["morphology-erosion"]).toEqual(compiledExplicit["morphology-erosion"]);
    expect(compiledMissing["morphology-features"]).toEqual(compiledExplicit["morphology-features"]);
    expect(compiledMissing["map-morphology"]).toEqual(compiledExplicit["map-morphology"]);
  });

  it("applies knobs as deterministic transforms over advanced config baselines", () => {
    const compiled = standardRecipe.compileConfig(env, {
      foundation: {
        knobs: { plateCount: "dense", plateActivity: "high" },
        advanced: {
          mesh: { computeMesh: { strategy: "default", config: { plateCount: 10 } } },
          "plate-graph": { computePlateGraph: { strategy: "default", config: { plateCount: 10 } } },
          projection: {
            computePlates: {
              strategy: "default",
              config: {
                boundaryInfluenceDistance: 5,
                boundaryDecay: 0.55,
                movementScale: 100,
                rotationScale: 100,
              },
            },
          },
        },
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
    // - plateCount=dense multiplies plateCount by 1.25 before op normalization (area scaling).
    expect(compiled.foundation.mesh.computeMesh.config.plateCount).toBe(14);
    expect(compiled.foundation["plate-graph"].computePlateGraph.config.plateCount).toBe(14);
    // - plateActivity=high shifts boundaryInfluenceDistance by +2 and scales kinematics by 1.2.
    expect(compiled.foundation.projection.computePlates.config.boundaryInfluenceDistance).toBe(7);
    expect(compiled.foundation.projection.computePlates.config.movementScale).toBeCloseTo(120, 6);
    expect(compiled.foundation.projection.computePlates.config.rotationScale).toBeCloseTo(120, 6);

    // Morphology:
    // - seaLevel=water-heavy adds +7 to targetWaterPercent.
    expect(compiled["morphology-coasts"]["landmass-plates"].seaLevel.config.targetWaterPercent).toBe(67);

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
});
