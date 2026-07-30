import {
  isMajorRiverClass,
  isMinorRiverClass,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import ComputeLandWaterBudgetContract from "../../contract.js";
import { lerp01 } from "../../rules/index.js";
import PetAridityDefinition from "./config.js";

const EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT = 0.35;
const MINOR_RIVER_MOISTURE_BONUS = 4;
const MAJOR_RIVER_MOISTURE_BONUS = 8;

/**
 * Derives effective moisture, bounded PET, and aridity from admitted climate and river evidence.
 * Effective moisture uses the Civ7 hex neighborhood so diagonal square-grid corners cannot create
 * false riparian influence; all terrestrial indices remain exactly zero on water.
 */
const petAridityStrategy = createStrategy(ComputeLandWaterBudgetContract, PetAridityDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const pet = new Float32Array(size);
    const effectiveMoisture = new Float32Array(size);
    const aridityIndex = new Float32Array(size);

    const tMin = config.tMinC;
    const tMax = Math.max(tMin + 1e-6, config.tMaxC);
    const petBase = config.petBase;
    const petTempWeight = config.petTemperatureWeight;
    const humidityDampening = config.humidityDampening;

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) {
        pet[i] = 0;
        effectiveMoisture[i] = 0;
        aridityIndex[i] = 0;
        continue;
      }

      const temp = input.surfaceTemperatureC[i]!;
      const humidityRaw = input.humidity[i]!;
      const humidity = humidityRaw / 255;
      const precip = input.rainfall[i]!;
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
        precip + EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT * humidityRaw + riparianBonus;

      const tempFactor = lerp01(temp, tMin, tMax);
      const damp = 1 - humidityDampening * clamp01(humidity);
      const petValue = (petBase + petTempWeight * tempFactor) * clamp01(damp);
      pet[i] = petValue;

      const denom = petValue + precip + 1;
      aridityIndex[i] = denom <= 0 ? 0 : clamp01(petValue / denom);
    }

    return { pet, effectiveMoisture, aridityIndex } as const;
  },
});

export default petAridityStrategy;
