import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import ComputeLandWaterBudgetContract from "../../contract.js";
import PetAridityDefinition from "./config.js";

const EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT = 0.35;

/**
 * Derives atmospheric effective moisture and aridity from supplied demand and climate.
 * All terrestrial indices remain exactly zero outside resolved exposed land.
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
      if (input.landMask[i] !== 1) {
        pet[i] = 0;
        effectiveMoisture[i] = 0;
        aridityIndex[i] = 0;
        continue;
      }

      const humidityRaw = input.humidity[i]!;
      const precip = input.rainfall[i]!;
      effectiveMoisture[i] = precip + EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT * humidityRaw;

      const petValue = input.pet[i]!;
      pet[i] = petValue;

      const denom = petValue + precip + 1;
      aridityIndex[i] = denom <= 0 ? 0 : clamp01(petValue / denom);
    }

    return { pet, effectiveMoisture, aridityIndex } as const;
  },
});

export default petAridityStrategy;
