import { describe, expect, it } from "bun:test";
import { stableStringify } from "@swooper/mapgen-core";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { RecipeCompileError } from "@swooper/mapgen-core/compiler/recipe-compile";

import standardRecipe, { STANDARD_STAGES } from "../src/recipes/standard/recipe.js";

function collectSchemaKeys(schema: unknown, keys: Set<string>) {
  if (!schema || typeof schema !== "object") return;
  if (Array.isArray(schema)) {
    schema.forEach((item) => collectSchemaKeys(item, keys));
    return;
  }
  const node = schema as Record<string, unknown>;
  const properties = node.properties;
  if (properties && typeof properties === "object") {
    for (const [key, value] of Object.entries(properties)) {
      keys.add(key);
      collectSchemaKeys(value, keys);
    }
  }
  const anyOf = node.anyOf;
  if (Array.isArray(anyOf)) anyOf.forEach((item) => collectSchemaKeys(item, keys));
  const oneOf = node.oneOf;
  if (Array.isArray(oneOf)) oneOf.forEach((item) => collectSchemaKeys(item, keys));
  const allOf = node.allOf;
  if (Array.isArray(allOf)) allOf.forEach((item) => collectSchemaKeys(item, keys));
  if ("items" in node) collectSchemaKeys(node.items as unknown, keys);
}

const env = {
  seed: 123,
  dimensions: { width: 80, height: 60 },
  latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
};

const foundationBaseConfig = {
  knobs: { plateCount: 28, plateActivity: 0.5 },
};

describe("M11 config layering: knobs-last (foundation + morphology)", () => {
  it("keeps foundation surface knobs-first (no stage-level public bridge keys)", () => {
    const schema = deriveRecipeConfigSchema(STANDARD_STAGES) as {
      properties?: Record<string, unknown>;
    };
    const foundation = schema.properties?.foundation;
    expect(foundation).toBeTruthy();
    const keys = new Set<string>();
    collectSchemaKeys(foundation, keys);
    const forbidden = ["version", "profiles", "advanced"];
    const hits = [...keys].filter((key) => forbidden.includes(key));
    expect(hits).toEqual([]);
  });
  it("applies knobs as deterministic transforms over step defaults", () => {
    const compiled = standardRecipe.compileConfig(env, {
      foundation: {
        ...foundationBaseConfig,
        knobs: { plateCount: 12, plateActivity: 0.8 },
      },
      "morphology-coasts": {
        knobs: { seaLevel: "water-heavy", coastRuggedness: "rugged" },
        waterCoverage: { targetWaterPercent: 60 },
        coastlineShape: {
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
      "morphology-erosion": {
        knobs: { erosion: "high" },
        geomorphicCycle: {
          geomorphology: {
            fluvial: { rate: 0.2, m: 0.5, n: 1.0 },
            diffusion: { rate: 0.2, talus: 0.5 },
            deposition: { rate: 0.1 },
            eras: 2,
          },
          worldAge: "mature",
        },
      },
      "morphology-features": {
        knobs: { volcanism: "high", orogeny: "high" },
        mountainRanges: {
          tectonicActivity: 1.0,
          rangeSystemSpacingTiles: 20,
          rangeSystemLengthTiles: 22,
          provinceRadiusTiles: 4,
          ridgeWidthTiles: 1,
          foothillExtentTiles: 3,
          interiorHighlandExpression: 0.55,
          terrainTextureFractalMix: 0.45,
          erosionMaturity: 0.45,
          tectonicSignalSensitivity: 1.0,
        },
        volcanoes: { baseDensity: 0.01, hotspotWeight: 0.12, convergentMultiplier: 2.4 },
      },
      "map-morphology": {},
    });

    // Foundation:
    // - plateCount is the authored override for the selected map size.
    expect(compiled.foundation.mesh.computeMesh.config.plateCount).toBe(12);
    expect(compiled.foundation["plate-graph"].computePlateGraph.config.plateCount).toBe(12);
    expect(compiled.foundation.mesh.computeMesh.config).not.toHaveProperty("referenceArea");
    expect(compiled.foundation.mesh.computeMesh.config).not.toHaveProperty("plateScalePower");
    expect(compiled.foundation["plate-graph"].computePlateGraph.config).not.toHaveProperty(
      "referenceArea"
    );
    expect(compiled.foundation["plate-graph"].computePlateGraph.config).not.toHaveProperty(
      "plateScalePower"
    );
    // - plateActivity influences projection through knob transforms (no stage profile bridge).
    expect(
      compiled.foundation.projection.computePlates.config.boundaryInfluenceDistance
    ).toBeGreaterThan(0);
    expect(compiled.foundation.projection.computePlates.config.movementScale).toBeGreaterThan(0);
    expect(compiled.foundation.projection.computePlates.config.rotationScale).toBeGreaterThan(0);

    // Morphology:
    // - seaLevel=water-heavy adds +15 to targetWaterPercent.
    expect(
      compiled["morphology-coasts"]["landmass-plates"].seaLevel.config.targetWaterPercent
    ).toBe(75);

    // - erosion=high scales rates by 1.35.
    expect(
      compiled["morphology-erosion"].geomorphology.geomorphology.config.geomorphology.fluvial.rate
    ).toBeCloseTo(0.27, 6);
    expect(
      compiled["morphology-erosion"].geomorphology.geomorphology.config.geomorphology.diffusion.rate
    ).toBeCloseTo(0.27, 6);
    expect(
      compiled["morphology-erosion"].geomorphology.geomorphology.config.geomorphology.deposition
        .rate
    ).toBeCloseTo(0.135, 6);

    // - coastRuggedness=rugged scales bay/fjord weights by 1.4.
    expect(
      compiled["morphology-coasts"]["rugged-coasts"].coastlines.config.coast.plateBias.bayWeight
    ).toBeCloseTo(1.4, 6);
    expect(
      compiled["morphology-coasts"]["rugged-coasts"].coastlines.config.coast.plateBias.bayNoiseBonus
    ).toBeCloseTo(0.84, 6);
    expect(
      compiled["morphology-coasts"]["rugged-coasts"].coastlines.config.coast.plateBias.fjordWeight
    ).toBeCloseTo(0.98, 6);

    // - volcanism=high scales density/weights deterministically.
    expect(compiled["morphology-features"].volcanoes.volcanoes.config.baseDensity).toBeCloseTo(
      0.015,
      6
    );
    expect(compiled["morphology-features"].volcanoes.volcanoes.config.hotspotWeight).toBeCloseTo(
      0.18,
      6
    );
    expect(
      compiled["morphology-features"].volcanoes.volcanoes.config.convergentMultiplier
    ).toBeCloseTo(3.0, 6);

    // - orogeny=high scales Morphology truth planning before map projection.
    expect(compiled["morphology-features"].mountains.ridges.config.tectonicIntensity).toBeCloseTo(
      1.25,
      6
    );
    expect(compiled["morphology-features"].mountains.ridges.config.mountainThreshold).toBeCloseTo(
      0.2,
      6
    );
    expect(compiled["morphology-features"].mountains.ridges.config.hillThreshold).toBeCloseTo(
      0.1555,
      6
    );

    // All mountain-family planners should receive the same knob transform (they share the knob envelope).
    expect(
      compiled["morphology-features"].mountains.foothills.config.tectonicIntensity
    ).toBeCloseTo(1.25, 6);
    expect(
      compiled["morphology-features"].mountains.foothills.config.mountainThreshold
    ).toBeCloseTo(0.2, 6);
    expect(compiled["morphology-features"].mountains.foothills.config.hillThreshold).toBeCloseTo(
      0.1555,
      6
    );
    expect(
      compiled["morphology-features"].mountains.roughLands.config.tectonicIntensity
    ).toBeCloseTo(1.25, 6);
    expect(
      compiled["morphology-features"].mountains.roughLands.config.mountainThreshold
    ).toBeCloseTo(0.2, 6);
    expect(compiled["morphology-features"].mountains.roughLands.config.hillThreshold).toBeCloseTo(
      0.1555,
      6
    );
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

  it("rejects stale internal ridge/foothill mountain-family config on the public surface", () => {
    expect(() =>
      standardRecipe.compileConfig(env, {
        "morphology-features": {
          mountains: {
            ridges: {
              strategy: "default",
              config: { tectonicIntensity: 1.0 },
            },
            foothills: {
              strategy: "default",
              config: { tectonicIntensity: 0.8 },
            },
          },
        },
      })
    ).toThrow(RecipeCompileError);
  });
});
