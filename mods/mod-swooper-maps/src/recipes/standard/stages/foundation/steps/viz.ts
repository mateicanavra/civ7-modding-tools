export function interleaveXY(x: Float32Array, y: Float32Array): Float32Array {
  const n = Math.min(x.length, y.length);
  const out = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    out[i * 2] = x[i];
    out[i * 2 + 1] = y[i];
  }
  return out;
}

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

export function segmentsFromMeshNeighbors(
  neighborsOffsets: Int32Array,
  neighbors: Int32Array,
  siteX: Float32Array,
  siteY: Float32Array
): Float32Array {
  const cellCount = Math.max(0, Math.min(siteX.length, siteY.length));
  if (cellCount <= 0) return new Float32Array();
  if (neighborsOffsets.length < cellCount + 1) return new Float32Array();

  const segments: number[] = [];

  for (let cell = 0; cell < cellCount; cell++) {
    const start = neighborsOffsets[cell] ?? 0;
    const end = neighborsOffsets[cell + 1] ?? start;
    const x0 = siteX[cell] ?? 0;
    const y0 = siteY[cell] ?? 0;

    for (let j = start; j < end; j++) {
      const other = neighbors[j] ?? -1;
      // Deduplicate undirected edges.
      if (other <= cell) continue;
      if (other < 0 || other >= cellCount) continue;
      const x1 = siteX[other] ?? 0;
      const y1 = siteY[other] ?? 0;
      segments.push(x0, y0, x1, y1);
    }
  }

  return new Float32Array(segments);
}

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
