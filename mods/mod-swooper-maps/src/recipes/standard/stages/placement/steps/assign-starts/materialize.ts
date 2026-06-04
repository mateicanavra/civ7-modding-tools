import type { ExtendedMapContext } from "@swooper/mapgen-core";
import { clamp01, defineVizMeta } from "@swooper/mapgen-core";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";

type PlanStartsOutput = Static<(typeof placement.ops.planStarts)["output"]>;
type StartCandidate = PlanStartsOutput["candidates"][number];
type StartTier = StartCandidate["tier"];

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
  primaryAssigned: number;
  islandClusterAssigned: number;
  marginalAssigned: number;
  desperationAssigned: number;
  candidateCount: number;
  rejectionCounts: Array<PlanStartsOutput["rejectionCounts"][number]>;
  tierCounts: PlanStartsOutput["tierCounts"];
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
const START_TIER_CATEGORIES = [
  { value: 0, label: "None", color: [148, 163, 184, 0] as [number, number, number, number] },
  { value: 1, label: "Rejected", color: [100, 116, 139, 120] as [number, number, number, number] },
  { value: 2, label: "Marginal", color: [245, 158, 11, 210] as [number, number, number, number] },
  { value: 3, label: "Island Cluster", color: [14, 165, 233, 220] as [number, number, number, number] },
  { value: 4, label: "Primary", color: [34, 197, 94, 225] as [number, number, number, number] },
];

function colorForStartPosition(index: number): [number, number, number, number] {
  return START_POSITION_COLORS[index % START_POSITION_COLORS.length] ?? [148, 163, 184, 220];
}

/**
 * Assigns player starts through viability-first deterministic tiers.
 *
 * The planner owns candidate viability. This materializer only applies
 * regional sector filters, start spacing, and final adapter writes. Spacing is
 * deliberately subordinate to viability so remote one-tile islands no longer
 * win just because they maximize distance from other starts.
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
  const tierAssignments = {
    primary: 0,
    islandCluster: 0,
    marginal: 0,
  };

  if (totalPlayers <= 0) {
    return {
      positions: new Array<number>(Math.max(0, totalPlayers)).fill(-1),
      assigned: 0,
      regionalAssigned: 0,
      openPoolAssigned: 0,
      openPoolUsed: false,
      primaryAssigned: 0,
      islandClusterAssigned: 0,
      marginalAssigned: 0,
      desperationAssigned: 0,
      candidateCount: starts.candidateCount,
      rejectionCounts: cloneRejectionCounts(starts.rejectionCounts),
      tierCounts: starts.tierCounts,
    };
  }

  const expected = Math.max(0, (width | 0) * (height | 0));
  if (slotByTile.length !== expected) {
    throw new Error(`Expected slotByTile length ${expected} (received ${slotByTile.length}).`);
  }

  const used = new Uint8Array(width * height);
  const positions = new Array<number>(totalPlayers).fill(-1);
  const selectedGlobal: StartCandidate[] = [];
  const candidates = [...starts.candidates].sort(compareCandidates);

  const westCandidates = candidates.filter((candidate) => candidate.regionSlot === 1);
  const eastCandidates = candidates.filter((candidate) => candidate.regionSlot === 2);
  const allCandidates = candidates;

  const startSectors = Array.isArray(starts.startSectors) ? starts.startSectors : [];
  const sectorRows = Math.max(0, starts.startSectorRows | 0);
  const sectorCols = Math.max(0, starts.startSectorCols | 0);
  const minSpacingTiles = Math.max(0, starts.minStartSpacingTiles | 0);

  const selectForRegion = (
    region: "west" | "east",
    regionCandidates: StartCandidate[],
    count: number
  ): StartCandidate[] => {
    if (count <= 0) return [];
    const filtered = filterCandidatesBySectors(
      regionCandidates,
      width,
      height,
      sectorRows,
      sectorCols,
      startSectors,
      region
    );
    const pool = filtered.length ? filtered : regionCandidates;
    return chooseStartTiles(pool, count, width, used, selectedGlobal, minSpacingTiles);
  };

  const selectedWest = selectForRegion("west", westCandidates, playersWest);
  for (const candidate of selectedWest) {
    selectedGlobal.push(candidate);
    tierAssignments[candidate.tier] += 1;
  }
  const selectedEast = selectForRegion("east", eastCandidates, playersEast);
  for (const candidate of selectedEast) {
    selectedGlobal.push(candidate);
    tierAssignments[candidate.tier] += 1;
  }

  for (let i = 0; i < playersWest; i++) {
    positions[i] = selectedWest[i]?.plotIndex ?? -1;
  }
  for (let i = 0; i < playersEast; i++) {
    positions[playersWest + i] = selectedEast[i]?.plotIndex ?? -1;
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
    const openPoolSelection = chooseStartTiles(
      allCandidates,
      remaining,
      width,
      used,
      selectedGlobal,
      minSpacingTiles
    );
    let writeIndex = 0;
    for (let i = 0; i < positions.length && writeIndex < openPoolSelection.length; i++) {
      if (positions[i] >= 0) continue;
      const candidate = openPoolSelection[writeIndex++];
      if (!candidate) continue;
      positions[i] = candidate.plotIndex;
      adapter.setStartPosition(candidate.plotIndex, i);
      selectedGlobal.push(candidate);
      tierAssignments[candidate.tier] += 1;
      assigned++;
      openPoolAssigned++;
    }
  }

  let desperationAssigned = 0;
  if (assigned < totalPlayers) {
    const desperateCandidates = collectDesperationCandidates(slotByTile, candidates);
    const remaining = totalPlayers - assigned;
    const desperateSelection = chooseDesperationTiles(
      desperateCandidates,
      remaining,
      width,
      used,
      selectedGlobal
    );
    let writeIndex = 0;
    for (let i = 0; i < positions.length && writeIndex < desperateSelection.length; i++) {
      if (positions[i] >= 0) continue;
      const plotIndex = desperateSelection[writeIndex++] ?? -1;
      if (plotIndex < 0) continue;
      positions[i] = plotIndex;
      adapter.setStartPosition(plotIndex, i);
      used[plotIndex] = 1;
      assigned++;
      desperationAssigned++;
    }
  }

  if (assigned !== totalPlayers) {
    throw new Error(
      `[Placement] Unable to assign all start positions through viability planning (assigned ${assigned}/${totalPlayers}, candidates=${starts.candidateCount}, primary=${starts.tierCounts.primary}, islandCluster=${starts.tierCounts.islandCluster}, marginal=${starts.tierCounts.marginal}, regionalAssigned=${regionalAssigned}, openPoolAssigned=${openPoolAssigned}, desperationAssigned=${desperationAssigned}).`
    );
  }

  return {
    positions,
    assigned,
    regionalAssigned,
    openPoolAssigned,
    openPoolUsed,
    primaryAssigned: tierAssignments.primary,
    islandClusterAssigned: tierAssignments.islandCluster,
    marginalAssigned: tierAssignments.marginal,
    desperationAssigned,
    candidateCount: starts.candidateCount,
    rejectionCounts: cloneRejectionCounts(starts.rejectionCounts),
    tierCounts: starts.tierCounts,
  };
}

export function emitStartViabilityViz(
  context: ExtendedMapContext,
  starts: DeepReadonly<PlanStartsOutput>
): void {
  const { width, height } = context.dimensions;
  const size = Math.max(0, width * height);
  if (starts.scoreByTile.length === size) {
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "placement.starts.viabilityScore",
      spaceId: "tile.hexOddR",
      dims: { width, height },
      format: "f32",
      values: starts.scoreByTile as Float32Array,
      meta: defineVizMeta("placement.starts.viabilityScore", {
        label: "Start Viability",
        group: GROUP_GAMEPLAY,
        description:
          "Viability-first start score from land envelope, island cluster support, freshwater, resources, and roughness.",
        palette: "continuous",
      }),
    });
  }
  if (starts.tierByTile.length === size) {
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "placement.starts.viabilityTier",
      spaceId: "tile.hexOddR",
      dims: { width, height },
      format: "u8",
      values: starts.tierByTile as Uint8Array,
      meta: defineVizMeta("placement.starts.viabilityTier", {
        label: "Start Viability Tiers",
        group: GROUP_GAMEPLAY,
        description:
          "Candidate classification for starts: primary land envelope, island cluster, marginal fallback, or rejected.",
        palette: "categorical",
        categories: START_TIER_CATEGORIES,
      }),
    });
  }
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
    spaceId: "tile.hexOddR",
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
    spaceId: "tile.hexOddR",
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
    spaceId: "tile.hexOddR",
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

function filterCandidatesBySectors(
  candidates: readonly StartCandidate[],
  width: number,
  height: number,
  rows: number,
  cols: number,
  sectors: unknown[],
  region: "west" | "east"
): StartCandidate[] {
  if (rows <= 0 || cols <= 0) return [...candidates];
  const sectorsPerRegion = rows * cols;
  if (sectors.length !== sectorsPerRegion && sectors.length !== sectorsPerRegion * 2) {
    return [...candidates];
  }

  const offset =
    sectors.length === sectorsPerRegion * 2 && region === "east" ? sectorsPerRegion : 0;
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const maxCol = Math.max(1, cols);
  const maxRow = Math.max(1, rows);

  return candidates.filter((candidate) => {
    const idx = candidate.plotIndex;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const col = Math.min(maxCol - 1, Math.max(0, Math.floor(x / cellWidth)));
    const row = Math.min(maxRow - 1, Math.max(0, Math.floor(y / cellHeight)));
    const sectorIndex = offset + row * cols + col;
    return Boolean(sectors[sectorIndex]);
  });
}

function chooseStartTiles(
  candidates: readonly StartCandidate[],
  count: number,
  width: number,
  used: Uint8Array,
  selectedGlobal: readonly StartCandidate[],
  minSpacingTiles: number
): StartCandidate[] {
  if (count <= 0) return [];
  const selected: StartCandidate[] = [];
  for (const tier of ["primary", "islandCluster", "marginal"] as const) {
    if (selected.length >= count) break;
    const tierPool = candidates.filter((candidate) => candidate.tier === tier);
    selected.push(
      ...chooseRankedFromPool({
        candidates: tierPool,
        count: count - selected.length,
        width,
        used,
        selectedGlobal: [...selectedGlobal, ...selected],
        minSpacingTiles,
      })
    );
  }
  return selected;
}

function chooseRankedFromPool(args: {
  candidates: readonly StartCandidate[];
  count: number;
  width: number;
  used: Uint8Array;
  selectedGlobal: readonly StartCandidate[];
  minSpacingTiles: number;
}): StartCandidate[] {
  const selected: StartCandidate[] = [];
  let spacing = Math.max(0, args.minSpacingTiles | 0);

  while (selected.length < args.count) {
    let best: StartCandidate | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    const currentSelected = [...args.selectedGlobal, ...selected];

    for (const candidate of args.candidates) {
      if (args.used[candidate.plotIndex] === 1) continue;
      if (selected.some((entry) => entry.plotIndex === candidate.plotIndex)) continue;
      const distance = minDistanceToSelection(candidate, currentSelected, args.width);
      if (distance < spacing) continue;
      const spacingScore = currentSelected.length
        ? clamp01(distance / Math.max(1, spacing * 1.5))
        : 0.75;
      const rankingScore = candidate.score * 0.86 + spacingScore * 0.14;
      if (
        rankingScore > bestScore ||
        (rankingScore === bestScore && candidate.score > (best?.score ?? -1)) ||
        (rankingScore === bestScore && candidate.score === (best?.score ?? -1) && candidate.plotIndex < (best?.plotIndex ?? Infinity))
      ) {
        best = candidate;
        bestScore = rankingScore;
      }
    }

    if (!best) {
      if (spacing > 0) {
        spacing--;
        continue;
      }
      break;
    }

    selected.push(best);
    args.used[best.plotIndex] = 1;
  }

  return selected;
}

function collectDesperationCandidates(
  slotByTile: Uint8Array,
  plannedCandidates: readonly StartCandidate[]
): number[] {
  const planned = new Set(plannedCandidates.map((candidate) => candidate.plotIndex));
  const out: number[] = [];
  for (let i = 0; i < slotByTile.length; i++) {
    if ((slotByTile[i] ?? 0) === 0) continue;
    if (planned.has(i)) continue;
    out.push(i);
  }
  return out;
}

function chooseDesperationTiles(
  candidates: readonly number[],
  count: number,
  width: number,
  used: Uint8Array,
  selectedGlobal: readonly StartCandidate[]
): number[] {
  const selected: number[] = [];
  while (selected.length < count) {
    let best = -1;
    let bestDistance = Number.NEGATIVE_INFINITY;
    for (const plotIndex of candidates) {
      if (used[plotIndex] === 1 || selected.includes(plotIndex)) continue;
      const distance = selectedGlobal.length
        ? Math.min(
            ...selectedGlobal.map((candidate) =>
              hexDistanceOddQPeriodicX(plotIndex, candidate.plotIndex, width)
            )
          )
        : 0;
      if (distance > bestDistance || (distance === bestDistance && plotIndex < best)) {
        best = plotIndex;
        bestDistance = distance;
      }
    }
    if (best < 0) break;
    selected.push(best);
    used[best] = 1;
  }
  return selected;
}

function minDistanceToSelection(
  candidate: StartCandidate,
  selected: readonly StartCandidate[],
  width: number
): number {
  if (!selected.length) return Infinity;
  let best = Infinity;
  for (const other of selected) {
    const dist = hexDistanceOddQPeriodicX(candidate.plotIndex, other.plotIndex, width);
    if (dist < best) best = dist;
  }
  return best;
}

function compareCandidates(a: StartCandidate, b: StartCandidate): number {
  const tierDiff = tierValue(b.tier) - tierValue(a.tier);
  if (tierDiff !== 0) return tierDiff;
  if (b.score !== a.score) return b.score - a.score;
  return a.plotIndex - b.plotIndex;
}

function cloneRejectionCounts(
  rejectionCounts: DeepReadonly<PlanStartsOutput["rejectionCounts"]>
): Array<PlanStartsOutput["rejectionCounts"][number]> {
  return rejectionCounts.map((entry) => ({
    reason: entry.reason,
    count: entry.count,
  }));
}

function tierValue(tier: StartTier): number {
  if (tier === "primary") return 3;
  if (tier === "islandCluster") return 2;
  return 1;
}
