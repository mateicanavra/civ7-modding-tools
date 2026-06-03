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
