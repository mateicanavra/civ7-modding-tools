/**
 * Estimates a whole-map target count as tile area divided by representative spacing squared.
 * Dimensions are coerced to signed 32-bit integers and clamped at zero; callers normally supply
 * admitted map dimensions. Empty maps or nonpositive spacing return `0`, while an enabled nonempty
 * map is guaranteed at least one target.
 */
export function resolveTileAreaSpacingTarget(params: {
  width: number;
  height: number;
  spacingTiles: number;
}): number {
  const width = Math.max(0, params.width | 0);
  const height = Math.max(0, params.height | 0);
  const areaTiles = width * height;
  const spacingTiles = Math.max(0, params.spacingTiles);
  if (areaTiles <= 0 || spacingTiles <= 0) return 0;
  return Math.max(1, Math.round(areaTiles / (spacingTiles * spacingTiles))) | 0;
}
