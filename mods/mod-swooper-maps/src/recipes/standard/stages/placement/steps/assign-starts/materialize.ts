import type { ExtendedMapContext } from "@swooper/mapgen-core";
import { defineVizMeta } from "@swooper/mapgen-core";
import { wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";

type PlanStartsOutput = Static<(typeof placement.ops.planStarts)["output"]>;

type AssignStartPositionsArgs = {
  context: ExtendedMapContext;
  starts: DeepReadonly<PlanStartsOutput>;
  slotByTile: Uint8Array;
};

export type StartAssignmentResult = {
  positions: number[];
  assigned: number;
  regionalAssigned: number;
  openPoolAssigned: number;
  openPoolUsed: boolean;
};

const GROUP_GAMEPLAY = "Gameplay / Placement";
const START_POSITION_COLORS: Array<[number, number, number, number]> = [
  [59, 130, 246, 230],
  [239, 68, 68, 230],
  [34, 197, 94, 230],
  [245, 158, 11, 230],
  [168, 85, 247, 230],
  [14, 116, 144, 230],
  [249, 115, 22, 230],
  [99, 102, 241, 230],
];

function colorForStartPosition(index: number): [number, number, number, number] {
  return START_POSITION_COLORS[index % START_POSITION_COLORS.length] ?? [148, 163, 184, 220];
}

/**
 * Assigns player starts through one deterministic tiered policy.
 *
 * The first tier respects west/east landmass ownership and active start-sector
 * constraints. The open-pool tier is not a compatibility fallback; it is the
 * declared completion tier for maps whose configured player count exceeds the
 * strictly regional candidate supply. The artifact reports both tiers so review
 * can see when a map is relying on open-pool assignment without treating it as
 * hidden recovery behavior.
 */
export function assignStartPositions({
  context,
  starts,
  slotByTile,
}: AssignStartPositionsArgs): StartAssignmentResult {
  const { adapter } = context;
  const { width, height } = context.dimensions;
  const playersWest = Math.max(0, starts.playersLandmass1 | 0);
  const playersEast = Math.max(0, starts.playersLandmass2 | 0);
  const totalPlayers = playersWest + playersEast;

  if (totalPlayers <= 0) {
    return {
      positions: new Array<number>(Math.max(0, totalPlayers)).fill(-1),
      assigned: 0,
      regionalAssigned: 0,
      openPoolAssigned: 0,
      openPoolUsed: false,
    };
  }

  const expected = Math.max(0, (width | 0) * (height | 0));
  if (slotByTile.length !== expected) {
    throw new Error(`Expected slotByTile length ${expected} (received ${slotByTile.length}).`);
  }

  const used = new Uint8Array(width * height);
  const positions = new Array<number>(totalPlayers).fill(-1);

  const westCandidates = collectCandidates(slotByTile, 1);
  const eastCandidates = collectCandidates(slotByTile, 2);
  const allCandidates = collectCandidates(slotByTile, null);

  const startSectors = Array.isArray(starts.startSectors) ? starts.startSectors : [];
  const sectorRows = Math.max(0, starts.startSectorRows | 0);
  const sectorCols = Math.max(0, starts.startSectorCols | 0);

  const selectForRegion = (
    region: "west" | "east",
    candidates: number[],
    count: number
  ): number[] => {
    if (count <= 0) return [];
    const filtered = filterCandidatesBySectors(
      candidates,
      width,
      height,
      sectorRows,
      sectorCols,
      startSectors,
      region
    );
    const pool = filtered.length ? filtered : candidates;
    return chooseStartTiles(pool, count, width, height, used);
  };

  const selectedWest = selectForRegion("west", westCandidates, playersWest);
  const selectedEast = selectForRegion("east", eastCandidates, playersEast);

  for (let i = 0; i < playersWest; i++) {
    positions[i] = selectedWest[i] ?? -1;
  }
  for (let i = 0; i < playersEast; i++) {
    positions[playersWest + i] = selectedEast[i] ?? -1;
  }

  let assigned = 0;
  for (let i = 0; i < positions.length; i++) {
    const plotIndex = positions[i] ?? -1;
    if (plotIndex >= 0) {
      adapter.setStartPosition(plotIndex, i);
      assigned++;
    }
  }
  const regionalAssigned = assigned;
  let openPoolAssigned = 0;
  let openPoolUsed = false;

  if (assigned < totalPlayers && allCandidates.length) {
    openPoolUsed = true;
    const remaining = totalPlayers - assigned;
    const openPoolSelection = chooseStartTiles(allCandidates, remaining, width, height, used);
    let writeIndex = 0;
    for (let i = 0; i < positions.length && writeIndex < openPoolSelection.length; i++) {
      if (positions[i] >= 0) continue;
      const plotIndex = openPoolSelection[writeIndex] ?? -1;
      positions[i] = plotIndex;
      if (plotIndex >= 0) {
        adapter.setStartPosition(plotIndex, i);
        assigned++;
        openPoolAssigned++;
      }
      writeIndex++;
    }
  }

  if (assigned !== totalPlayers) {
    throw new Error(
      `[Placement] Unable to assign all start positions through deterministic tiered selection (assigned ${assigned}/${totalPlayers}, westCandidates=${westCandidates.length}, eastCandidates=${eastCandidates.length}, allCandidates=${allCandidates.length}, regionalAssigned=${regionalAssigned}, openPoolAssigned=${openPoolAssigned}).`
    );
  }

  return { positions, assigned, regionalAssigned, openPoolAssigned, openPoolUsed };
}

export function emitStartSectorViz(
  context: ExtendedMapContext,
  slotByTile: Uint8Array,
  starts: DeepReadonly<PlanStartsOutput>
): void {
  const { width, height } = context.dimensions;
  const rows = Math.max(0, starts.startSectorRows | 0);
  const cols = Math.max(0, starts.startSectorCols | 0);
  if (rows <= 0 || cols <= 0) return;
  const sectors = Array.isArray(starts.startSectors) ? starts.startSectors : [];

  const grid = buildStartSectorGrid({ width, height, slotByTile, rows, cols, sectors });
  if (!grid) return;

  context.viz?.dumpGrid(context.trace, {
    dataTypeKey: "placement.starts.sectorId",
    spaceId: "tile.hexOddQ",
    dims: { width, height },
    format: "u16",
    values: grid,
    meta: defineVizMeta("placement.starts.sectorId", {
      label: "Start Sectors",
      group: GROUP_GAMEPLAY,
      description:
        "Derived start-sector grid for placement planning (0 = inactive). Values are sector ids.",
      palette: "categorical",
      visibility: "debug",
      categories: [{ value: 0, label: "Inactive", color: [148, 163, 184, 0] }],
    }),
  });
}

function buildStartSectorGrid(input: {
  width: number;
  height: number;
  slotByTile: Uint8Array;
  rows: number;
  cols: number;
  sectors: unknown[];
}): Uint16Array | null {
  const { width, height, slotByTile, rows, cols, sectors } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  if (slotByTile.length !== size) return null;

  const sectorsPerRegion = rows * cols;
  const usesSingleRegion = sectors.length === sectorsPerRegion;
  const usesDualRegion = sectors.length === sectorsPerRegion * 2;

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxCol = Math.max(1, cols);
  const maxRow = Math.max(1, rows);

  const out = new Uint16Array(size);
  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    const col = Math.min(maxCol - 1, Math.max(0, Math.floor(x / cellWidth)));
    const row = Math.min(maxRow - 1, Math.max(0, Math.floor(y / cellHeight)));
    const baseIndex = row * cols + col;

    let sectorIndex = baseIndex;
    if (usesDualRegion) {
      const slot = slotByTile[i] ?? 0;
      if (slot === 2) sectorIndex = baseIndex + sectorsPerRegion;
      if (slot !== 1 && slot !== 2) {
        out[i] = 0;
        continue;
      }
    }

    const isActive = usesSingleRegion || usesDualRegion ? Boolean(sectors[sectorIndex]) : true;
    out[i] = isActive ? baseIndex + 1 : 0;
  }

  return out;
}

export function emitStartPositionsViz(context: ExtendedMapContext, startPositions: number[]): void {
  if (!startPositions.length) return;
  const { width, height } = context.dimensions;
  const valid = startPositions
    .map((plotIndex, playerIndex) => ({ plotIndex, playerIndex }))
    .filter((entry) => Number.isFinite(entry.plotIndex) && entry.plotIndex >= 0);
  if (!valid.length) return;

  const size = Math.max(0, (width | 0) * (height | 0));
  const grid = new Uint16Array(size);
  for (let i = 0; i < valid.length; i++) {
    const plotIndex = valid[i]!.plotIndex;
    if (plotIndex < 0 || plotIndex >= grid.length) continue;
    grid[plotIndex] = (valid[i]!.playerIndex ?? 0) + 1;
  }

  const positions = new Float32Array(valid.length * 2);
  const values = new Uint16Array(valid.length);
  for (let i = 0; i < valid.length; i++) {
    const { plotIndex, playerIndex } = valid[i]!;
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    positions[i * 2] = x;
    positions[i * 2 + 1] = y;
    values[i] = playerIndex + 1;
  }

  const categories = Array.from({ length: startPositions.length }, (_, index) => ({
    value: index + 1,
    label: `Player ${index + 1}`,
    color: colorForStartPosition(index),
  }));
  const gridCategories = [
    { value: 0, label: "None", color: [148, 163, 184, 0] as [number, number, number, number] },
    ...categories,
  ];

  context.viz?.dumpGrid(context.trace, {
    dataTypeKey: "placement.starts.startPosition",
    spaceId: "tile.hexOddQ",
    dims: { width, height },
    format: "u16",
    values: grid,
    meta: defineVizMeta("placement.starts.startPosition", {
      label: "Start Positions",
      group: GROUP_GAMEPLAY,
      role: "membership",
      categories: gridCategories,
      palette: "categorical",
    }),
  });

  context.viz?.dumpPoints(context.trace, {
    dataTypeKey: "placement.starts.startPosition",
    spaceId: "tile.hexOddQ",
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.starts.startPosition", {
      label: "Start Positions",
      group: GROUP_GAMEPLAY,
      categories,
      palette: "categorical",
    }),
  });
}

function collectCandidates(slotByTile: Uint8Array, slot: number | null): number[] {
  const candidates: number[] = [];
  for (let i = 0; i < slotByTile.length; i++) {
    const value = slotByTile[i] ?? 0;
    if (slot === null) {
      if (value !== 0) candidates.push(i);
      continue;
    }
    if (value === slot) candidates.push(i);
  }
  return candidates;
}

function filterCandidatesBySectors(
  candidates: number[],
  width: number,
  height: number,
  rows: number,
  cols: number,
  sectors: unknown[],
  region: "west" | "east"
): number[] {
  if (rows <= 0 || cols <= 0) return candidates;
  const sectorsPerRegion = rows * cols;
  if (sectors.length !== sectorsPerRegion && sectors.length !== sectorsPerRegion * 2) {
    return candidates;
  }

  const offset =
    sectors.length === sectorsPerRegion * 2 && region === "east" ? sectorsPerRegion : 0;
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxCol = Math.max(1, cols);
  const maxRow = Math.max(1, rows);

  return candidates.filter((idx) => {
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const col = Math.min(maxCol - 1, Math.max(0, Math.floor(x / cellWidth)));
    const row = Math.min(maxRow - 1, Math.max(0, Math.floor(y / cellHeight)));
    const sectorIndex = offset + row * cols + col;
    return Boolean(sectors[sectorIndex]);
  });
}

function chooseStartTiles(
  candidates: number[],
  count: number,
  width: number,
  height: number,
  used: Uint8Array
): number[] {
  if (count <= 0) return [];
  const available = candidates.filter((idx) => used[idx] !== 1);
  if (!available.length) return [];

  const seed = pickSeedTile(available, width, height);
  const selected: number[] = [];
  if (seed >= 0) {
    selected.push(seed);
    used[seed] = 1;
  }

  while (selected.length < count) {
    let bestIdx = -1;
    let bestDistance = -1;
    for (const idx of available) {
      if (used[idx] === 1) continue;
      const distance = minDistanceToSelection(idx, selected, width, height);
      if (distance > bestDistance) {
        bestDistance = distance;
        bestIdx = idx;
      }
    }
    if (bestIdx < 0) break;
    selected.push(bestIdx);
    used[bestIdx] = 1;
  }

  return selected;
}

function pickSeedTile(candidates: number[], width: number, height: number): number {
  if (!candidates.length) return -1;
  let sumX = 0;
  let sumY = 0;
  for (const idx of candidates) {
    const y = (idx / width) | 0;
    const x = idx - y * width;
    sumX += x;
    sumY += y;
  }
  const centerX = sumX / candidates.length;
  const centerY = sumY / candidates.length;

  let bestIdx = candidates[0] ?? -1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const idx of candidates) {
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const dx = x - centerX;
    const dy = y - centerY;
    const score = dx * dx + dy * dy;
    if (score < bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
}

function minDistanceToSelection(
  idx: number,
  selected: number[],
  width: number,
  height: number
): number {
  if (!selected.length) return Infinity;
  let best = Infinity;
  for (const other of selected) {
    const dist = hexDistanceOddQ(idx, other, width, height);
    if (dist < best) best = dist;
  }
  return best;
}

function hexDistanceOddQ(aIndex: number, bIndex: number, width: number, _height: number): number {
  const ay = (aIndex / width) | 0;
  const ax = aIndex - ay * width;
  const by = (bIndex / width) | 0;
  const bx = bIndex - by * width;
  const wrappedBx = ax + wrapDeltaPeriodic(bx - ax, width);
  const aCube = oddqToCube(ax, ay);
  const bCube = oddqToCube(wrappedBx, by);
  const dx = Math.abs(aCube.x - bCube.x);
  const dy = Math.abs(aCube.y - bCube.y);
  const dz = Math.abs(aCube.z - bCube.z);
  return Math.max(dx, dy, dz);
}

function oddqToCube(x: number, y: number): { x: number; y: number; z: number } {
  const z = y - (x - (x & 1)) / 2;
  const xCube = x;
  const zCube = z;
  const yCube = -xCube - zCube;
  return { x: xCube, y: yCube, z: zCube };
}
