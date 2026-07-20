/**
 * Stage-owned visualization geometry helpers for Foundation.
 *
 * Foundation emits debug layers from several steps that all describe the same
 * plate/mesh coordinate systems. Keeping the Foundation-specific converters
 * on the stage surface makes that shared visualization contract explicit while
 * avoiding a `steps/viz.ts` bucket that looks like private step implementation.
 */
/** Projects plate seeds into ordered XY positions paired with their stable plate ids. */
export function pointsFromPlateSeeds(
  plates: ReadonlyArray<{ id: number; seedX: number; seedY: number }>
): { positions: Float32Array; ids: Int16Array } {
  const positions = new Float32Array(plates.length * 2);
  const ids = new Int16Array(plates.length);
  for (let i = 0; i < plates.length; i++) {
    const plate = plates[i]!;
    positions[i * 2] = plate.seedX;
    positions[i * 2 + 1] = plate.seedY;
    ids[i] = plate.id;
  }
  return { positions, ids };
}

/**
 * Projects paired mesh-cell indices into flat XY line segments, truncating to the shorter pair
 * list and using zero coordinates for missing sites.
 */
export function segmentsFromCellPairs(
  aCell: Int32Array,
  bCell: Int32Array,
  siteX: Float32Array,
  siteY: Float32Array
): Float32Array {
  const n = Math.min(aCell.length, bCell.length);
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const a = aCell[i]!;
    const b = bCell[i]!;
    out[i * 4] = siteX[a] ?? 0;
    out[i * 4 + 1] = siteY[a] ?? 0;
    out[i * 4 + 2] = siteX[b] ?? 0;
    out[i * 4 + 3] = siteY[b] ?? 0;
  }
  return out;
}

/** Projects plate centroids into ordered XY positions with aligned plate ids and tile areas. */
export function pointsFromTileCentroids(
  plates: ReadonlyArray<{ id: number; centroid: { x: number; y: number }; area: number }>
): { positions: Float32Array; ids: Int16Array; areas: Int32Array } {
  const positions = new Float32Array(plates.length * 2);
  const ids = new Int16Array(plates.length);
  const areas = new Int32Array(plates.length);
  for (let i = 0; i < plates.length; i++) {
    const plate = plates[i]!;
    positions[i * 2] = plate.centroid.x;
    positions[i * 2 + 1] = plate.centroid.y;
    ids[i] = plate.id;
    areas[i] = plate.area;
  }
  return { positions, ids, areas };
}

/**
 * Projects plate-neighbor topology into deduplicated undirected centroid segments, skipping
 * references to plate ids without a centroid.
 */
export function segmentsFromTileTopologyNeighbors(
  plates: ReadonlyArray<{ id: number; centroid: { x: number; y: number }; neighbors: number[] }>
): Float32Array {
  const centroidById = new Map<number, { x: number; y: number }>();
  for (const plate of plates) centroidById.set(plate.id, plate.centroid);

  const segments: number[] = [];
  const seen = new Set<string>();

  for (const plate of plates) {
    const a = centroidById.get(plate.id);
    if (!a) continue;
    for (const neighborId of plate.neighbors) {
      const b = centroidById.get(neighborId);
      if (!b) continue;
      const k = plate.id < neighborId ? `${plate.id}-${neighborId}` : `${neighborId}-${plate.id}`;
      if (seen.has(k)) continue;
      seen.add(k);
      segments.push(a.x, a.y, b.x, b.y);
    }
  }

  return new Float32Array(segments);
}
