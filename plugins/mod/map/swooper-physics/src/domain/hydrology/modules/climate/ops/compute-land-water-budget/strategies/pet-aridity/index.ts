import {
  isMajorRiverClass,
  isMinorRiverClass,
} from "../../../../../hydrography/model/policy/river-class.js";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import ComputeLandWaterBudgetContract from "../../contract.js";
import PetAridityDefinition from "./config.js";

const EFFECTIVE_MOISTURE_WETNESS_WEIGHT = 0.35;
const MINOR_RIVER_MOISTURE_BONUS = 4;
const MAJOR_RIVER_MOISTURE_BONUS = 8;

/**
 * Derives effective moisture and aridity from supplied demand, climate, and river evidence.
 * Effective moisture uses the Civ7 hex neighborhood so diagonal square-grid corners cannot create
 * false riparian influence; all terrestrial indices remain exactly zero on water.
 */
const petAridityStrategy = createStrategy(ComputeLandWaterBudgetContract, PetAridityDefinition, {
  run: (input) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;
    if (input.pet.length !== size) {
      throw new RangeError(`Expected ${size} potential-demand samples, received ${input.pet.length}.`);
    }

    const pet = new Float32Array(size);
    const effectiveMoisture = new Float32Array(size);
    const aridityIndex = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (!Number.isFinite(input.precipitation[i]) || input.precipitation[i]! < 0 ||
          !Number.isFinite(input.surfaceWetness[i]) || input.surfaceWetness[i]! < 0 || input.surfaceWetness[i]! > 1) {
        throw new RangeError("Land water budget requires nonnegative precipitation and surface wetness in 0..1.");
      }
      if (input.landMask[i] !== 1) {
        pet[i] = 0;
        effectiveMoisture[i] = 0;
        aridityIndex[i] = 0;
        continue;
      }

      const wetness = input.surfaceWetness[i]!;
      const precip = input.precipitation[i]!;
      let maximumRiverClass = input.riverClass[i]!;
      if (!isMajorRiverClass(maximumRiverClass)) {
        const x = i % width;
        const y = (i / width) | 0;
        forEachHexNeighborOddQ(x, y, width, height, (neighborX, neighborY) => {
          const riverClass = input.riverClass[neighborY * width + neighborX]!;
          if (riverClass > maximumRiverClass) maximumRiverClass = riverClass;
        });
      }
      const riparianBonus = isMajorRiverClass(maximumRiverClass)
        ? MAJOR_RIVER_MOISTURE_BONUS
        : isMinorRiverClass(maximumRiverClass)
          ? MINOR_RIVER_MOISTURE_BONUS
          : 0;
      effectiveMoisture[i] =
        precip + EFFECTIVE_MOISTURE_WETNESS_WEIGHT * (255 * wetness) + riparianBonus;

      const petValue = input.pet[i]!;
      pet[i] = petValue;

      const denom = petValue + precip + 1;
      aridityIndex[i] = denom <= 0 ? 0 : clamp01(petValue / denom);
    }

    return { pet, effectiveMoisture, aridityIndex } as const;
  },
});

export default petAridityStrategy;
