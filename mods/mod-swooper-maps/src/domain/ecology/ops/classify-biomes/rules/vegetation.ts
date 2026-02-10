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
    moistureNorm: number;
    energy01: number;
    freezeIndex: number;
    aridityIndex: number;
    aridityPenalty: number;
    fertility01: number;
    soilType: number;
  }
): number {
  const {
    base,
    moistureWeight,
    moistureNorm,
    energy01,
    freezeIndex,
    aridityIndex,
    aridityPenalty,
    fertility01,
    soilType,
  } = params;

  let density = base + moistureWeight * moistureNorm;
  void symbol;

  // Mechanistic postures:
  // - energy01 suppresses growth in cold climates
  // - freezeIndex penalizes perennial cold/frozen regimes
  // - aridityIndex reduces density via a PET proxy penalty
  density *= clamp01(energy01);
  density *= clamp01(1 - freezeIndex);
  density -= aridityIndex * aridityPenalty;

  // Soils: fertility (0..1) and soil palette bucket gently modulate vegetation density.
  // Deterministic and local: we consume soils artifact without re-deriving Hydrology indices.
  const soilTypeDelta =
    soilType === 0 ? -0.15 : // rocky
    soilType === 1 ? -0.08 : // sandy
    soilType === 3 ? 0.02 : // clayish / wet
    0.05; // loam/default
  const fertilityFactor = 0.6 + 0.5 * clamp01(fertility01);
  const soilFactor = Math.max(0, fertilityFactor + soilTypeDelta);
  density *= soilFactor;

  return Math.max(0, Math.min(1, density));
}
