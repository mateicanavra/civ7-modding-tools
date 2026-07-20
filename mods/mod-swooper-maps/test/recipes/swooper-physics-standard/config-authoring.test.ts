import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { stableStringify } from "@swooper/mapgen-core";

import { buildStandardRecipeDefaultConfig } from "../../../src/recipes/standard/artifacts.js";
import standardRecipe from "../../../src/recipes/standard/recipe.js";
import { standardMapConfig } from "./fixtures/standard-recipe.js";

const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
const setup = {
  mapSeed: 123,
  dimensions: tinyPreset.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
};

const FOUNDATION_STAGE_IDS = [
  "foundation-mantle",
  "foundation-lithosphere",
  "foundation-tectonics",
  "foundation-orogeny",
  "foundation-projection",
] as const;

describe("M11 config layering: authored config and semantic knobs", () => {
  it("uses direct plate authorities and applies remaining knob transforms", () => {
    const config = structuredClone(buildStandardRecipeDefaultConfig());
    config["foundation-mantle"].meshResolution.plateCount = 12;
    config["foundation-lithosphere"].platePartition.plateCount = 12;
    config["foundation-tectonics"].knobs.plateActivity = 0.8;
    config["morphology-coasts"].knobs.seaLevel = "water-heavy";
    config["morphology-coasts"].knobs.coastRuggedness = "rugged";
    config["morphology-coasts"].waterCoverage.targetWaterPercent = 60;
    config["morphology-coasts"].coastlineShape = {
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
    };
    config["morphology-erosion"].knobs.erosion = "high";
    config["morphology-erosion"].geomorphicCycle = {
      geomorphology: {
        fluvial: { rate: 0.2, m: 0.5, n: 1.0 },
        diffusion: { rate: 0.2, talus: 0.5 },
        deposition: { rate: 0.1 },
        eras: 2,
      },
      worldAge: "mature",
    };
    config["morphology-features"].knobs.volcanism = "high";
    config["morphology-features"].knobs.orogeny = "high";
    config["morphology-features"].mountainRanges = {
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
    };
    config["morphology-features"].volcanoes.baseDensity = 0.01;
    config["morphology-features"].volcanoes.hotspotWeight = 0.12;
    config["morphology-features"].volcanoes.convergentMultiplier = 2.4;
    const compiled = standardRecipe.compileConfig(setup, config);

    // Foundation:
    // plateCount is authored independently at each owning operation boundary.
    const mantle = compiled["foundation-mantle"];
    const plates = compiled["foundation-lithosphere"];
    const tectonics = compiled["foundation-tectonics"];
    expect(mantle.mesh.computeMesh.config.plateCount).toBe(12);
    expect(plates["plate-graph"].computePlateGraph.config.plateCount).toBe(12);
    expect(mantle.mesh.computeMesh.config).not.toHaveProperty("referenceArea");
    expect(mantle.mesh.computeMesh.config).not.toHaveProperty("plateScalePower");
    expect(plates["plate-graph"].computePlateGraph.config).not.toHaveProperty("referenceArea");
    expect(plates["plate-graph"].computePlateGraph.config).not.toHaveProperty("plateScalePower");
    // - plateActivity (0.8) scales orogeny emission intensity via the
    //   orogenyActivityGain transform injected into the tectonics step's
    //   computeEraTectonicFields op (post regime-classification). plate-motion and
    //   projection no longer read plateActivity.
    expect(tectonics.tectonics.computeEraTectonicFields.config.orogenyActivityGain).toBeCloseTo(
      1.12,
      6
    );
    expect(tectonics["plate-motion"].computePlateMotion.config).not.toHaveProperty(
      "kinematicsScale"
    );

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

    // - orogeny=high scales Morphology model planning before map projection.
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
    const config = structuredClone(buildStandardRecipeDefaultConfig());
    config["morphology-coasts"].knobs.seaLevel = "earthlike";
    config["morphology-coasts"].knobs.coastRuggedness = "normal";
    const first = standardRecipe.compileConfig(setup, config);
    const second = standardRecipe.compileConfig(setup, config);
    for (const stageId of FOUNDATION_STAGE_IDS) {
      expect(stableStringify(first[stageId]), stageId).toBe(stableStringify(second[stageId]));
    }
  });

  it("compiles Foundation Orogeny crustCharacter into the internal crust-evolution op envelope", () => {
    const crustCharacter = {
      continentalSurvivalMaturity: 0.72,
      continentalFreeboard: 0.2,
      hyperextensionBreakupBase: 0.18,
      thinningThicknessLoss: 0.62,
      oceanicAbyssalDepth: 0.84,
    };

    const config = structuredClone(buildStandardRecipeDefaultConfig());
    config["foundation-orogeny"].crustCharacter = crustCharacter;
    const compiled = standardRecipe.compileConfig(setup, config);

    const op = compiled["foundation-orogeny"]["crust-evolution"].computeCrustEvolution;
    expect(op.strategy).toBe("default");
    expect(op.config).toEqual(crustCharacter);
  });
});
