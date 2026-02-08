import type { BiomeSymbol } from "@mapgen/domain/ecology/types.js";
import { clamp01 } from "@swooper/mapgen-core";

/**
 * Computes vegetation density using climate signals and stress penalties.
 */
export function vegetationDensityForBiome(
  symbol: BiomeSymbol,
  params: {
    base: number;
    moistureWeight: number;
    humidityWeight: number;
    moistureNorm: number;
    humidityNorm: number;
    energy01: number;
    freezeIndex: number;
    aridityIndex: number;
    aridityPenalty: number;
  }
): number {
  const {
    base,
    moistureWeight,
    humidityWeight,
    moistureNorm,
    humidityNorm,
    energy01,
    freezeIndex,
    aridityIndex,
    aridityPenalty,
  } = params;

  let density =
    base + moistureWeight * moistureNorm + humidityWeight * humidityNorm;
  void symbol;

  // Mechanistic postures:
  // - energy01 suppresses growth in cold climates
  // - freezeIndex penalizes perennial cold/frozen regimes
  // - aridityIndex reduces density via a PET proxy penalty
  density *= clamp01(energy01);
  density *= clamp01(1 - freezeIndex);
  density -= aridityIndex * aridityPenalty;

  return Math.max(0, Math.min(1, density));
}
