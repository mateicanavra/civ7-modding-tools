import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

function f32(size: number, value: number): Float32Array {
  return new Float32Array(size).fill(value);
}

function broadVegetationHabitatFields(size: number) {
  return {
    flatLandMask: new Uint8Array(size).fill(1),
    biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
    surfaceTemperature: f32(size, 20),
    effectiveMoisture: f32(size, 120),
    aridityIndex: f32(size, 0.4),
    vegetationDensity: f32(size, 0.35),
  };
}

describe("ecology feature planner policies", () => {
  it("rejects weak positive scores across all feature-family planners", () => {
    const width = 1;
    const height = 1;
    const size = width * height;
    const weakPositive = 0.05;

    const reefs = ecology.ops.planReefs.run(
      {
        width,
        height,
        seed: 1,
        scoreReef01: f32(size, weakPositive),
        scoreColdReef01: f32(size, weakPositive),
        scoreAtoll01: f32(size, weakPositive),
        scoreLotus01: f32(size, weakPositive),
        lakeMask: new Uint8Array(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planReefs, { strategy: "default", config: {} })
    );

    const wetlands = ecology.ops.planWetlands.run(
      {
        width,
        height,
        seed: 1,
        scoreMarsh01: f32(size, weakPositive),
        scoreTundraBog01: f32(size, weakPositive),
        scoreMangrove01: f32(size, weakPositive),
        scoreOasis01: f32(size, weakPositive),
        scoreWateringHole01: f32(size, weakPositive),
        flatLandMask: new Uint8Array(size).fill(1),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planWetlands, { strategy: "default", config: {} })
    );

    const vegetation = ecology.ops.planVegetation.run(
      {
        width,
        height,
        seed: 1,
        scoreForest01: f32(size, weakPositive),
        scoreRainforest01: f32(size, weakPositive),
        scoreTaiga01: f32(size, weakPositive),
        scoreSavannaWoodland01: f32(size, weakPositive),
        scoreSagebrushSteppe01: f32(size, weakPositive),
        landMask: new Uint8Array(size).fill(1),
        ...broadVegetationHabitatFields(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planVegetation, { strategy: "default", config: {} })
    );

    const ice = ecology.ops.planIce.run(
      {
        width,
        height,
        seed: 1,
        score01: f32(size, weakPositive),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planIce, { strategy: "default", config: {} })
    );

    const continentalIce = ecology.ops.planIce.run(
      {
        width,
        height,
        seed: 1,
        score01: f32(size, weakPositive),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOpSelectionOrThrow(ecology.ops.planIce, { strategy: "continentality", config: {} })
    );

    expect(reefs.placements).toEqual([]);
    expect(wetlands.placements).toEqual([]);
    expect(vegetation.placements).toEqual([]);
    expect(ice.placements).toEqual([]);
    expect(continentalIce.placements).toEqual([]);
  });

  it("keeps score-to-intent policies local to each feature planner family", () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const opsRoot = path.resolve(testDir, "..", "..", "src", "domain", "ecology", "ops");
    const families = [
      "features-plan-reefs",
      "features-plan-wetlands",
      "features-plan-vegetation",
      "features-plan-ice",
    ] as const;

    // This is a category guard: future ecology feature families should attach
    // planner policy locally instead of restoring a generic routing owner.
    expect(existsSync(path.join(opsRoot, "features-plan-shared"))).toBe(false);
    expect(existsSync(path.join(opsRoot, "score-shared"))).toBe(false);
    for (const family of families) {
      const policyDir = path.join(opsRoot, family, "policy");
      expect(existsSync(policyDir), `${family} should own local policies`).toBe(true);
      const strategyDir = path.join(opsRoot, family, "strategies");
      const strategyFiles = readdirSync(strategyDir).filter(
        (file) => file.endsWith(".ts") && file !== "index.ts"
      );
      for (const strategyFile of strategyFiles) {
        const strategy = readFileSync(path.join(strategyDir, strategyFile), "utf8");
        expect(strategy).toContain("../policy/index.js");
      }
    }
  });
});
