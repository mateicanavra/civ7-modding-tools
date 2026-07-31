const QUALIFYING_LANDMASS_MIN_SHARE = 0.1;
const MIN_RESOURCE_OBSERVATIONS_PER_LANDMASS = 2;

/** One landmass large enough to participate in resource-density equity. */
type QualifyingLandmassRow = Readonly<{
  id: number;
  tileCount: number;
}>;

/** Resource density measured on one qualifying landmass. */
type QualifyingLandmassDensityRow = QualifyingLandmassRow &
  Readonly<{
    resourceCount: number;
    density: number;
  }>;

/** Max/min resource-density spread across the qualifying landmasses. */
type QualifyingLandmassDensitySpread = Readonly<{
  rows: readonly QualifyingLandmassDensityRow[];
  minDensity: number;
  maxDensity: number;
  densityRatio: number;
  totalResourceCount: number;
}>;

/** Selects landmasses that own at least ten percent of the map's land tiles. */
export function qualifyingLandmassRows(
  landmassTileCounts: ArrayLike<number>
): readonly QualifyingLandmassRow[] {
  let totalLandTiles = 0;
  for (let id = 0; id < landmassTileCounts.length; id++) {
    totalLandTiles += landmassTileCounts[id] ?? 0;
  }
  if (totalLandTiles <= 0) return [];

  const rows: QualifyingLandmassRow[] = [];
  for (let id = 0; id < landmassTileCounts.length; id++) {
    const tileCount = landmassTileCounts[id] ?? 0;
    if (tileCount / totalLandTiles >= QUALIFYING_LANDMASS_MIN_SHARE) {
      rows.push({ id, tileCount });
    }
  }
  return rows;
}

/** Measures the max/min resource-density spread for the supplied qualifying rows. */
export function qualifyingLandmassDensitySpread(
  qualifyingRows: readonly QualifyingLandmassRow[],
  resourceCountByLandmass: ReadonlyMap<number, number>
): QualifyingLandmassDensitySpread {
  const rows = qualifyingRows.map(({ id, tileCount }) => {
    const resourceCount = resourceCountByLandmass.get(id) ?? 0;
    return {
      id,
      tileCount,
      resourceCount,
      density: tileCount > 0 ? resourceCount / tileCount : 0,
    };
  });
  const minDensity =
    rows.length > 0 ? Math.min(...rows.map((row) => row.density)) : 0;
  const maxDensity =
    rows.length > 0 ? Math.max(...rows.map((row) => row.density)) : 0;
  const densityRatio =
    maxDensity === 0
      ? 1
      : minDensity === 0
        ? Number.POSITIVE_INFINITY
        : maxDensity / minDensity;

  return {
    rows,
    minDensity,
    maxDensity,
    densityRatio,
    totalResourceCount: rows.reduce((total, row) => total + row.resourceCount, 0),
  };
}

/**
 * Admits one prospective move or addition without crossing a healthy spread or
 * worsening a spread that is already above the configured maximum. The law
 * remains open until at least two resources per qualifying landmass exist.
 */
export function admitsQualifyingLandmassDensityChange(args: {
  qualifyingRows: readonly QualifyingLandmassRow[];
  resourceCountByLandmass: ReadonlyMap<number, number>;
  maxDensityRatio: number;
  removedLandmassId?: number | null;
  addedLandmassId?: number | null;
}): boolean {
  const current = qualifyingLandmassDensitySpread(
    args.qualifyingRows,
    args.resourceCountByLandmass
  );
  if (
    current.rows.length < 2 ||
    current.totalResourceCount <
      current.rows.length * MIN_RESOURCE_OBSERVATIONS_PER_LANDMASS
  ) {
    return true;
  }

  const nextCounts = new Map(
    current.rows.map((row) => [row.id, row.resourceCount] as const)
  );
  if (
    args.removedLandmassId !== null &&
    args.removedLandmassId !== undefined &&
    nextCounts.has(args.removedLandmassId)
  ) {
    const nextCount = (nextCounts.get(args.removedLandmassId) ?? 0) - 1;
    if (nextCount < 0) return false;
    nextCounts.set(args.removedLandmassId, nextCount);
  }
  if (
    args.addedLandmassId !== null &&
    args.addedLandmassId !== undefined &&
    nextCounts.has(args.addedLandmassId)
  ) {
    nextCounts.set(
      args.addedLandmassId,
      (nextCounts.get(args.addedLandmassId) ?? 0) + 1
    );
  }

  const prospective = qualifyingLandmassDensitySpread(
    args.qualifyingRows,
    nextCounts
  );
  if (current.densityRatio <= args.maxDensityRatio) {
    return prospective.densityRatio <= args.maxDensityRatio;
  }
  if (prospective.densityRatio !== current.densityRatio) {
    return prospective.densityRatio < current.densityRatio;
  }
  return (
    current.densityRatio !== Number.POSITIVE_INFINITY ||
    prospective.maxDensity <= current.maxDensity
  );
}
