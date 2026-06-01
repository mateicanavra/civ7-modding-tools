/**
 * Vegetation layers are continuous biome suitability fields. Keeping the
 * score-to-intent policy beside vegetation planning prevents every marginal
 * land tile from becoming forest-like cover while leaving vegetation-specific
 * habitat tradeoffs in this family.
 */
export function admitVegetationIntent(candidate: Readonly<{ confidence01: number }>): boolean {
  return candidate.confidence01 > 0.12;
}
