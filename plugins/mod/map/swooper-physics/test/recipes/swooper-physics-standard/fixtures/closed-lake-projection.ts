import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";

/** Synthetic zero-supply closed water for native projection tests, not solver evidence. */
export function closedLakeProjectionFixture(width: number, height: number, lakeMask: Uint8Array) {
  const size = width * height;
  const bodyId = new Int32Array(size);
  const wetGroups: number[][] = [];
  for (let cell = 0; cell < size; cell++) {
    if (!lakeMask[cell] || bodyId[cell]) continue;
    const wetCells = [cell];
    bodyId[cell] = cell + 1;
    for (let head = 0; head < wetCells.length; head++) {
      const current = wetCells[head]!;
      for (const neighbor of getHexNeighborIndicesOddQ(current % width, Math.floor(current / width), width, height)) {
        if (lakeMask[neighbor] && !bodyId[neighbor]) {
          bodyId[neighbor] = cell + 1;
          wetCells.push(neighbor);
        }
      }
    }
    wetGroups.push(wetCells.sort((a, b) => a - b));
  }
  const flux = { incomingOverflow: 0, dryRunoff: 0, wetPrecipitation: 0, wetDemand: 0, balance: 0 };
  const bodies = wetGroups.map((wetCells) => ({ bodyId: wetCells[0]! + 1, componentId: wetCells[0]! + 1,
    poolId: wetCells[0]! + 1, wetCells, level: 0, flux: { ...flux }, outflow: 0, unresolvedResidual: 0 }));
  return {
    model: "certified-sill-spill" as const, width, height, lakeMask,
    plannedLakeTileCount: lakeMask.reduce((sum, value) => sum + value, 0),
    bodyId, componentId: bodyId.slice(), waterSurface: Array<number>(size).fill(0), bodies,
    pools: bodies.map((body) => ({ poolId: body.poolId, componentId: body.componentId,
      leafIds: [body.poolId], catchmentCells: body.wetCells, wetCells: body.wetCells,
      state: "closed" as const, level: 0, flux: { ...flux }, outflow: 0, unresolvedResidual: 0,
      closure: { resolution: "exact-balance" as const, levels: { lower: 0, lowerInclusive: true, upper: 0, upperInclusive: true } } })),
    components: bodies.map((body) => ({ componentId: body.componentId, poolId: body.poolId,
      bodyIds: [body.bodyId], memberCells: body.wetCells, junctionCells: [], anchorCell: body.wetCells[0]!,
      state: "closed" as const, level: 0, flux: { ...flux }, outflow: 0, unresolvedResidual: 0, terminalId: body.bodyId })),
    terminals: bodies.map((body) => ({ terminalId: body.bodyId, role: "closed-wet" as const,
      anchorCell: body.wetCells[0]!, componentId: body.componentId })),
    transfers: [], ports: [], marineExits: [], boundaryExits: [],
    conservation: { dryRunoff: 0, wetPrecipitation: 0, wetDemand: 0, marineDischarge: 0, boundaryDischarge: 0,
      externalDischarge: 0, unresolvedResidual: 0, normalizedUnresolvedResidual: 0, residual: 0, roundoffBound: 0 },
  };
}
