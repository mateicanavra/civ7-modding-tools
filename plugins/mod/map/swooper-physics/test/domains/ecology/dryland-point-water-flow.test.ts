import { describe, expect, it } from "bun:test";
import { getEngineFeatureLegality } from "@civ7/map-policy";
import { OperationInputAdmissionError } from "@swooper/mapgen-core/authoring";
import { biomeSymbolFromIndex } from "../../../src/domain/ecology/index.js";
import ecology from "../../../src/domain/ecology/router.js";
import hydrology from "../../../src/domain/hydrology/router.js";
import standardRecipe from "../../../src/recipes/standard/recipe.js";
import { deriveFeatureOccupancy } from "../../../src/recipes/standard/stages/ecology/features/model/policy/derive-feature-occupancy.js";
import { SWOOPER_LAND_BIOME_PROJECTION } from "../../../src/recipes/standard/stages/ecology/model/policy/biome-projection.js";
import { resolveFeatureKeyForIntent } from "../../../src/recipes/standard/stages/ecology/model/policy/feature-projection.js";
import { deriveWetlandTerrainBiomeCompatibilityMasks } from "../../../src/recipes/standard/stages/ecology/model/policy/wetland-terrain-biome-compatibility.js";
import { noLocalWaterSources } from "../../fixtures/local-water-sources.js";
import {
  createStandardRecipeTestInitialSetup,
  standardMapConfig,
} from "../../recipes/swooper-physics-standard/fixtures/standard-recipe.js";

const compiled = standardRecipe.compileConfig(
  createStandardRecipeTestInitialSetup(),
  standardMapConfig.config
);
const baselineConfig = compiled["hydrology-climate-baseline"]["climate-baseline"];
const refineConfig = compiled["hydrology-climate-refine"]["climate-refine"];
const pedologyConfig = compiled["ecology-pedology"].pedology.classify;
const biomeConfig = compiled["ecology-biomes"].biomes.classify;
const scoreConfig = compiled["ecology-features"]["score-layers"];
const plannerConfig = compiled["ecology-features"]["plan-wetlands"].planWetlands;
const features = ecology.features.ops;
const budget = hydrology.climate.ops.computeLandWaterBudget;
const width = 5, height = 3, size = width * height, donor = 7, receiver = 8;
const receiverIntent = { x: 3, y: 1 };
type Source = "ordinary" | "finite-body";

// Defaults retain independent precipitation/wetness owner-boundary controls,
// not quantities reachable through the current atmospheric forcing producer.
function fixture(source: Source = "ordinary", supply = 420, options: {
  sedimentSignal?: number;
  temperature?: number;
  precipitation?: number;
  moistureForcing?: ReturnType<typeof hydrology.climate.ops.computeMoistureForcing.run>;
} = {}) {
  const surfaceTemperatureC = new Float32Array(size).fill(options.temperature ?? 22);
  const surfaceWetness = options.moistureForcing?.surfaceWetness ?? new Float32Array(size).fill(80 / 255);
  const precipitation = options.moistureForcing?.precipitation ?? new Float32Array(size).fill(options.precipitation ?? 5);
  const demandInput = {
    width, height, surfaceTemperatureC, surfaceWetness,
    parameters: baselineConfig.potentialDemand,
  };
  const demand = hydrology.climate.ops.computePotentialDemand.run(demandInput, refineConfig.computePotentialDemand);
  const input = {
    width, height, ...noLocalWaterSources(width, height),
    landMask: new Uint8Array(size).fill(1),
    precipitation,
    surfaceWetness, pet: demand.pet,
  };
  input.elevation.fill(10);
  if (source === "ordinary") {
    input.discharge[donor] = supply + 7;
    input.runoff[donor] = 7;
  } else {
    input.landMask[donor] = 0;
    input.componentId[donor] = 1;
    input.elevation[donor] = 9;
    if (supply > 0) {
      // An admitted open-body boundary, not a claim of full generated drainage reachability.
      const baselineDemand = hydrology.climate.ops.computePotentialDemand.run(demandInput, baselineConfig.computePotentialDemand);
      const basinBudget = hydrology.hydrography.ops.computeBasinWaterBudget;
      const body = basinBudget.run({
        cells: [{
          cell: donor, ground: 9, localRunoff: 0,
          precipitation: input.precipitation[donor]!, potentialDemand: baselineDemand.pet[donor]!,
        }],
        incomingOverflow: supply - input.precipitation[donor]!, attainedLevel: 9, spillElevation: 10,
      }, basinBudget.defaultConfig);
      expect(body.state).toBe("open");
      if (body.state !== "open") throw new Error("Expected the admitted finite body to reach its outward sill.");
      expect(body.wetCells).toEqual([donor]);
      input.bodies.push({
        bodyId: 8, componentId: 1, poolId: 1, wetCells: body.wetCells, level: body.level,
        flux: body.flux, outflow: body.overflow, unresolvedResidual: body.unresolvedResidual,
      });
    }
  }
  const cryosphere = hydrology.cryosphere.ops.computeCryosphereState.run({
    width, height, landMask: input.landMask, surfaceTemperatureC, precipitation: input.precipitation,
  }, refineConfig.computeCryosphereState);
  return {
    input, surfaceTemperatureC, freezeIndex: cryosphere.freezeIndex, permafrost01: cryosphere.permafrost01,
    sedimentDepth: new Float32Array(size).fill(options.sedimentSignal ?? 1),
    bedrockAge: new Int16Array(size).fill(options.sedimentSignal ?? 1),
  };
}

function runFlow(fields: ReturnType<typeof fixture>, flatLandMask = fields.input.landMask.slice(),
  featureOccupancyMask = deriveFeatureOccupancy({ width, height })) {
  const before = structuredClone(fields);
  const { input, surfaceTemperatureC, freezeIndex, permafrost01, sedimentDepth, bedrockAge } = fields;
  const indices = budget.run(input, refineConfig.computeLandWaterBudget);
  const pedology = ecology.pedology.ops.classifyPedology.run({
    width, height, landMask: input.landMask, elevation: input.elevation,
    precipitation: input.precipitation, surfaceWetness: input.surfaceWetness, sedimentDepth, bedrockAge,
  }, pedologyConfig);
  const biomes = ecology.biomes.ops.classifyBiomes.run({
    width, height, landMask: input.landMask, surfaceTemperatureC, freezeIndex, permafrost01,
    effectiveMoisture: indices.effectiveMoisture, aridityIndex: indices.aridityIndex,
    plantEffectiveMoisture: indices.plantEffectiveMoisture, plantWaterStress: indices.plantWaterStress,
    soilType: pedology.soilType, fertility: pedology.fertility,
  }, biomeConfig);
  const scoreInput = {
    width, height, landMask: input.landMask,
    localSurfaceWaterOpportunity: indices.localSurfaceWaterOpportunity,
    pet: indices.pet, aridityIndex: indices.aridityIndex,
  };
  const oasis = features.scoreWetOasis.run(scoreInput, scoreConfig.scoreWetOasis).score01;
  const wateringHole = features.scoreWetWateringHole.run(scoreInput, scoreConfig.scoreWetWateringHole).score01;
  const plannerInput = {
    width, height, seed: 1, flatLandMask, featureOccupancyMask,
    terrainBiomeCompatibilityMasks: deriveWetlandTerrainBiomeCompatibilityMasks({
      width, height, flatLandMask, biomeIndex: biomes.biomeIndex,
    }),
    scoreMarsh01: new Float32Array(size), scoreTundraBog01: new Float32Array(size),
    scoreMangrove01: new Float32Array(size), scoreOasis01: oasis, scoreWateringHole01: wateringHole,
  };
  const placements = features.planWetlands.run(plannerInput, plannerConfig).placements;
  for (const placement of placements) {
    const cell = placement.y * width + placement.x;
    const symbol = biomeSymbolFromIndex(biomes.biomeIndex[cell]!);
    const legality = getEngineFeatureLegality(resolveFeatureKeyForIntent(placement.feature));
    expect(input.landMask[cell]).toBe(1);
    expect(flatLandMask[cell]).toBe(1);
    expect(featureOccupancyMask[cell]).toBe(0);
    expect(legality?.biomes).toContain(SWOOPER_LAND_BIOME_PROJECTION[symbol]);
    expect(legality?.terrains).toContain("TERRAIN_FLAT");
  }
  for (const scores of [oasis, wateringHole]) {
    expect(Array.from(scores).every((score) => Number.isFinite(score) && score >= 0 && score <= 1)).toBe(true);
  }
  expect(biomes.effectiveMoisture).toEqual(indices.effectiveMoisture);
  expect(biomes.aridityIndex).toEqual(indices.aridityIndex);
  expect(biomes.surfaceTemperature).toEqual(surfaceTemperatureC);
  expect(biomes.freezeIndex).toEqual(freezeIndex);
  expect(fields).toEqual(before);
  return { indices, pedology, biomes, oasis, wateringHole, plannerInput, placements };
}

function receiverPlacements(result: ReturnType<typeof runFlow>) {
  return result.placements.filter(({ x, y }) => x === receiverIntent.x && y === receiverIntent.y);
}

describe("Earthlike source-led dryland point-water consumer flow", () => {
  it("joins current moisture publication to a lawful oasis with insufficient and absent-source contrasts", () => {
    const parameters = baselineConfig.computeMoistureForcing.config;
    const k = parameters.backgroundExtractionRate;
    // Calm marine deposition P=E*(1+expm1(-k)/k); this is a separate publication
    // fixture composed with a land consumer, not same-world rainfall reachability.
    const moistureForcing = hydrology.climate.ops.computeMoistureForcing.run({
      width, height, landMask: new Uint8Array(size), externalWaterMask: new Uint8Array(size).fill(1),
      elevation: new Int16Array(size), seaLevel: 0,
      windU: new Int8Array(size), windV: new Int8Array(size),
      sstC: new Float32Array(size).fill(32), seaIceMask: new Uint8Array(size),
    }, {
      ...baselineConfig.computeMoistureForcing,
      config: { ...parameters, marineSourceRate: 5 / (parameters.wetnessScale * 0.65 * (1 + Math.expm1(-k) / k)) },
    });
    expect(moistureForcing.precipitation).toEqual(new Float32Array(size).fill(5));
    expect(moistureForcing.surfaceWetness).toEqual(new Float32Array(size).fill(5 / 200));
    const fields = fixture("ordinary", 420, { moistureForcing });
    expect(fields.surfaceTemperatureC[receiver]).toBe(22);
    expect(fields.input.pet[receiver]).toBe((19 + 82 * (22 / 36)) * (1 - 0.5 * Math.fround(5 / 200)));
    const result = runFlow(fields);
    expect(plannerConfig.config.minConfidence01).toBe(0.42);
    expect(result.indices.localSurfaceWaterOpportunity[receiver]).toBe(60);
    expect(result.indices.pet[receiver]).toBe(Math.fround(fields.input.pet[receiver]!));
    expect(biomeSymbolFromIndex(result.biomes.biomeIndex[receiver]!)).toBe("desert");
    expect(result.oasis[receiver]).toBeCloseTo(0.4266611, 6);
    expect(result.oasis[receiver]).toBeGreaterThan(plannerConfig.config.minConfidence01);
    expect(result.plannerInput.terrainBiomeCompatibilityMasks.oasis[receiver]).toBe(1);
    expect(receiverPlacements(result)).toEqual([{ ...receiverIntent, feature: "oasis" }]);
    for (const supply of [350, 0]) {
      const contrast = runFlow(fixture("ordinary", supply, { moistureForcing }));
      expect(contrast.indices.pet).toEqual(result.indices.pet);
      expect(contrast.indices.effectiveMoisture).toEqual(result.indices.effectiveMoisture);
      expect(contrast.indices.aridityIndex).toEqual(result.indices.aridityIndex);
      expect(contrast.indices.localSurfaceWaterOpportunity[receiver]).toBe(supply / 7);
      expect(biomeSymbolFromIndex(contrast.biomes.biomeIndex[receiver]!)).toBe("desert");
      expect(contrast.oasis[receiver]).toBeLessThan(plannerConfig.config.minConfidence01);
      if (supply === 0) expect(contrast.oasis[receiver]).toBe(0);
      expect(receiverPlacements(contrast)).toEqual([]);
    }
  });

  for (const source of ["ordinary", "finite-body"] as const) {
    for (const family of ["oasis", "watering-hole"] as const) {
      it(`admits lawful ${family} from ${source} opportunity with independent P/W owner controls, not a hand-set biome`, () => {
        const oasis = family === "oasis";
        const fields = fixture(source, oasis ? 420 : 630, { sedimentSignal: oasis ? 1 : 0 });
        const result = runFlow(fields);
        const contrast = runFlow(fixture(source, oasis ? 420 : 630, { sedimentSignal: oasis ? 0 : 1 }));
        expect(plannerConfig.config.minConfidence01).toBe(0.42);
        expect(fields.input.pet[receiver]).toBe((19 + 82 * (22 / 36)) * (1 - 0.5 * Math.fround(80 / 255)));
        expect(result.indices.pet[receiver]).toBe(Math.fround(fields.input.pet[receiver]!));
        expect(result.indices.localSurfaceWaterOpportunity[receiver]).toBe(oasis ? 60 : 90);
        expect(result.indices.effectiveMoisture[receiver]).toBe(33);
        expect(result.indices.plantEffectiveMoisture[receiver]).toBe(oasis ? 93 : 123);
        expect(biomeSymbolFromIndex(result.biomes.biomeIndex[receiver]!)).toBe(oasis ? "desert" : "temperateDry");
        expect(result.pedology.fertility[receiver]).toBeCloseTo(oasis ? 0.7794 : 0.39397, 5);
        expect(result.biomes.freezeIndex[receiver]).toBe(0);
        expect(fields.permafrost01[receiver]).toBe(0);
        if (source === "finite-body") {
          const body = fields.input.bodies[0]!;
          expect(body.flux.wetPrecipitation).toBe(5);
          expect(body.flux.wetDemand).toBe(fields.input.pet[donor]!);
          expect(body.flux.incomingOverflow).toBe((oasis ? 420 : 630) - 5);
          expect(body.outflow).toBe(body.flux.balance);
        }
        expect(result.pedology.fertility[receiver]).not.toBe(contrast.pedology.fertility[receiver]);
        expect(result.biomes.biomeIndex).toEqual(contrast.biomes.biomeIndex);
        expect(result.oasis).toEqual(contrast.oasis);
        expect(result.wateringHole).toEqual(contrast.wateringHole);
        expect(contrast.placements).toEqual(result.placements);
        expect((oasis ? result.oasis : result.wateringHole)[receiver]).toBeCloseTo(oasis ? 0.4444701 : 0.6070001, 6);
        expect(receiverPlacements(result)).toEqual([{ ...receiverIntent, feature: family }]);
        const contactCells = source === "ordinary" ? [2, 3, 6, 7, 8, 12, 13] : [2, 3, 6, 8, 12, 13];
        expect(result.placements).toEqual(contactCells.map((cell) => ({
          x: cell % width, y: Math.floor(cell / width), feature: family,
        })));
      });
    }

    it(`does not invent ${source} support without supply, across a high bank, or on resolved water`, () => {
      const noSource = runFlow(fixture(source, 0));
      expect(noSource.indices.localSurfaceWaterOpportunity).toEqual(new Float32Array(size));
      expect(noSource.oasis).toEqual(new Float32Array(size));
      expect(noSource.wateringHole).toEqual(new Float32Array(size));
      expect(noSource.placements).toEqual([]);
      const highBank = fixture(source);
      highBank.input.elevation[receiver] = 11;
      const waterReceiver = fixture(source);
      waterReceiver.input.landMask[receiver] = 0;
      for (const inaccessible of [runFlow(highBank), runFlow(waterReceiver)]) {
        expect(inaccessible.indices.localSurfaceWaterOpportunity[receiver]).toBe(0);
        expect(inaccessible.oasis[receiver]).toBe(0);
        expect(inaccessible.wateringHole[receiver]).toBe(0);
        expect(receiverPlacements(inaccessible)).toEqual([]);
      }
    });

    it(`retains climatic dryness at ${source} receivers even with abundant local supply`, () => {
      const humid = runFlow(fixture(source, 630, { precipitation: 100 }));
      expect(humid.indices.localSurfaceWaterOpportunity[receiver]).toBe(90);
      expect(humid.indices.aridityIndex[receiver]).toBeLessThan(0.45);
      expect(humid.oasis[receiver]).toBe(0);
      expect(humid.wateringHole[receiver]).toBe(0);
      expect(humid.placements).toEqual([]);
    });
  }

  it("excludes a valid marine donor without treating its ordinary flow as terrestrial opportunity", () => {
    const marine = fixture();
    marine.input.landMask[donor] = 0;
    marine.input.externalWaterMask[donor] = 1;
    const result = runFlow(marine);
    expect(result.indices.localSurfaceWaterOpportunity).toEqual(new Float32Array(size));
    expect(result.oasis).toEqual(new Float32Array(size));
    expect(result.wateringHole).toEqual(new Float32Array(size));
    expect(result.placements).toEqual([]);
  });

  it("keeps admitted source scores while rejecting nonflat terrain and actual prior floodplain intent", () => {
    const fields = fixture();
    const supported = runFlow(fields);
    const scoreDesertMinor01 = new Float32Array(size);
    scoreDesertMinor01[receiver] = 1;
    const prior = features.planFloodplains.run({
      width, height, seed: 1, scoreDesertMinor01,
      scoreDesertNavigable01: new Float32Array(size),
      scoreGrasslandMinor01: new Float32Array(size), scoreGrasslandNavigable01: new Float32Array(size),
      scorePlainsMinor01: new Float32Array(size), scorePlainsNavigable01: new Float32Array(size),
      scoreTropicalMinor01: new Float32Array(size), scoreTropicalNavigable01: new Float32Array(size),
      scoreTundraMinor01: new Float32Array(size), scoreTundraNavigable01: new Float32Array(size),
      featureOccupancyMask: new Uint8Array(size),
    }, compiled["ecology-features"]["plan-floodplains"].planFloodplains).placements;
    expect(prior).toEqual([{ ...receiverIntent, feature: "desert-floodplain-minor" }]);
    const flatLandMask = fields.input.landMask.slice();
    flatLandMask[receiver] = 0;
    const nonflat = runFlow(fields, flatLandMask);
    const occupied = runFlow(fields, fields.input.landMask.slice(), deriveFeatureOccupancy({ width, height }, prior));
    for (const excluded of [nonflat, occupied]) {
      expect(excluded.oasis).toEqual(supported.oasis);
      expect(excluded.wateringHole).toEqual(supported.wateringHole);
      expect(receiverPlacements(excluded)).toEqual([]);
    }
  });

  it("allows source growth to cross the unchanged floor inside DESERT and strengthen PLAINS without demanding either class", () => {
    const weakOasis = runFlow(fixture("ordinary", 350));
    const oasis = runFlow(fixture("ordinary", 420));
    const weakHole = runFlow(fixture("ordinary", 490));
    const hole = runFlow(fixture("ordinary", 630));
    for (const result of [weakOasis, oasis]) expect(biomeSymbolFromIndex(result.biomes.biomeIndex[receiver]!)).toBe("desert");
    for (const result of [weakHole, hole]) expect(biomeSymbolFromIndex(result.biomes.biomeIndex[receiver]!)).toBe("temperateDry");
    expect(weakOasis.indices.localSurfaceWaterOpportunity[receiver]).toBe(50);
    expect(weakOasis.oasis[receiver]).toBeLessThan(0.42);
    expect(receiverPlacements(weakOasis)).toEqual([]);
    expect(oasis.oasis[receiver]).toBeGreaterThan(0.42);
    expect(receiverPlacements(oasis)).toEqual([{ ...receiverIntent, feature: "oasis" }]);
    expect(hole.wateringHole[receiver]).toBeGreaterThan(weakHole.wateringHole[receiver]!);
    for (const result of [weakHole, hole]) expect(receiverPlacements(result)).toEqual([{ ...receiverIntent, feature: "watering-hole" }]);
    for (const result of [oasis, weakHole, hole]) {
      expect(result.indices.pet).toEqual(weakOasis.indices.pet);
      expect(result.indices.effectiveMoisture).toEqual(weakOasis.indices.effectiveMoisture);
      expect(result.indices.aridityIndex).toEqual(weakOasis.indices.aridityIndex);
    }
    const incompatible = runFlow(fixture("ordinary", 980));
    expect(incompatible.indices.localSurfaceWaterOpportunity[receiver]).toBe(140);
    expect(biomeSymbolFromIndex(incompatible.biomes.biomeIndex[receiver]!)).toBe("temperateHumid");
    expect(incompatible.oasis[receiver]).toBeGreaterThan(0.42);
    expect(incompatible.wateringHole[receiver]).toBeGreaterThan(0.42);
    expect(receiverPlacements(incompatible)).toEqual([]);
  });

  it("dilutes fixed supply with contact area and never amplifies a repeated body identity or display label", () => {
    const broad = runFlow(fixture("ordinary", 350));
    const smallerArea = fixture("ordinary", 350);
    smallerArea.input.elevation[6] = 11;
    const concentrated = runFlow(smallerArea);
    expect(broad.indices.localSurfaceWaterOpportunity[receiver]).toBe(50);
    expect(concentrated.indices.localSurfaceWaterOpportunity[receiver]).toBe(Math.fround(350 / 6));
    expect(concentrated.oasis[receiver]).toBeGreaterThan(broad.oasis[receiver]!);
    expect(receiverPlacements(broad)).toEqual([]);
    expect(biomeSymbolFromIndex(concentrated.biomes.biomeIndex[receiver]!)).toBe("desert");
    expect(receiverPlacements(concentrated)).toEqual([{ ...receiverIntent, feature: "oasis" }]);
    const finite = fixture("finite-body");
    const original = runFlow(finite);
    finite.input.bodies[0]!.wetCells.push(donor, donor);
    finite.input.bodies.push(structuredClone(finite.input.bodies[0]!));
    expect(runFlow(finite)).toEqual(original);
    expect(receiverPlacements(original)).toEqual([{ ...receiverIntent, feature: "oasis" }]);
    const ordinary = fixture();
    const originalOrdinary = runFlow(ordinary);
    for (const label of [0, 1, 2]) {
      const displayedInput = { ...ordinary.input, riverClass: new Uint8Array(size).fill(label) };
      expect(() => budget.run(displayedInput,
        refineConfig.computeLandWaterBudget)).toThrow(OperationInputAdmissionError);
      expect(runFlow(ordinary)).toEqual(originalOrdinary);
    }
  });

  it("reports the actual cold-desert response without inventing a scorer frost veto", () => {
    const cold = runFlow(fixture("ordinary", 350, { temperature: 0 }));
    expect(biomeSymbolFromIndex(cold.biomes.biomeIndex[receiver]!)).toBe("desert");
    expect(cold.biomes.freezeIndex[receiver]).toBe(Math.fround(2 / 14));
    expect(cold.oasis[receiver]).toBeGreaterThan(0);
    expect(cold.oasis[receiver]).toBeLessThan(0.42);
    expect(cold.wateringHole[receiver]).toBeGreaterThan(0.42);
    expect(cold.plannerInput.terrainBiomeCompatibilityMasks["watering-hole"][receiver]).toBe(0);
    expect(receiverPlacements(cold)).toEqual([]);
  });

  it("keeps zero source and demand finite, and lets positive source at zero demand retain the climatic and land gates", () => {
    const input = {
      width: 4, height: 1, landMask: new Uint8Array([1, 1, 1, 0]),
      localSurfaceWaterOpportunity: new Float32Array([0, 2, 2, 2]),
      pet: new Float32Array([0, 0, 0, 1]), aridityIndex: new Float32Array([1, 1, 0, 1]),
    };
    expect(features.scoreWetOasis.run(input, scoreConfig.scoreWetOasis).score01).toEqual(new Float32Array([0, 1, 0, 0]));
    expect(features.scoreWetWateringHole.run(input, scoreConfig.scoreWetWateringHole).score01).toEqual(new Float32Array([0, 1, 0, 0]));
  });
});
