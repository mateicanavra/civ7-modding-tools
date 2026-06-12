import type { RecipeDagResult } from "./client";

export type DagPoint = Readonly<{
  x: number;
  y: number;
}>;

export type StagePosition = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  rank: number;
  phaseId: string;
}>;

export type StageEdgeGroup = Readonly<{
  id: string;
  fromStageId: string;
  toStageId: string;
  artifacts: readonly string[];
}>;

export type RoutedStageEdgeGroup = StageEdgeGroup &
  Readonly<{
    points: readonly DagPoint[];
    label: string;
    labelX: number;
    labelY: number;
  }>;

export type PhaseBand = Readonly<{
  id: string;
  y: number;
  height: number;
}>;

export type RankColumn = Readonly<{
  rank: number;
  x: number;
  label: string;
}>;

export type RecipeDagLayout = Readonly<{
  width: number;
  height: number;
  positions: ReadonlyMap<string, StagePosition>;
  phaseBands: readonly PhaseBand[];
  rankColumns: readonly RankColumn[];
  edgeGroups: readonly RoutedStageEdgeGroup[];
}>;

const STAGE_WIDTH = 248;
const STAGE_HEIGHT = 122;
const RANK_GAP_X = 122;
const GRAPH_PAD_X = 80;
const GRAPH_PAD_TOP = 96;
const GRAPH_PAD_BOTTOM = 110;
const PHASE_TITLE_HEIGHT = 42;
const PHASE_MIN_HEIGHT = 188;
const STAGE_GAP_Y = 28;
const EDGE_STEM = 34;

export function buildRecipeDagLayout(dag: RecipeDagResult): RecipeDagLayout {
  const edgeGroups = groupStageEdges(dag);
  const phaseIndexById = new Map(dag.phases.map((phase, index) => [phase.id, index]));
  const rankByStageId = assignDependencyRanks(dag, edgeGroups);
  const rankCount = Math.max(1, Math.max(...Array.from(rankByStageId.values()), 0) + 1);
  const phaseMetrics = measurePhaseLanes(dag, phaseIndexById, rankByStageId);
  const positions = positionStages(dag, phaseMetrics, phaseIndexById, rankByStageId);
  const width = Math.max(1040, GRAPH_PAD_X * 2 + rankCount * STAGE_WIDTH + Math.max(0, rankCount - 1) * RANK_GAP_X);
  const height = Math.max(560, GRAPH_PAD_TOP + phaseMetrics.totalHeight + GRAPH_PAD_BOTTOM);
  const rankColumns = Array.from({ length: rankCount }, (_, rank) => ({
    rank,
    x: GRAPH_PAD_X + rank * (STAGE_WIDTH + RANK_GAP_X),
    label: rank === 0 ? "Sources" : `D${rank}`,
  }));

  return {
    width,
    height,
    positions,
    phaseBands: dag.phases.map((phase) => {
      const metrics = phaseMetrics.byPhaseId.get(phase.id);
      return {
        id: phase.id,
        y: metrics?.y ?? GRAPH_PAD_TOP,
        height: metrics?.height ?? PHASE_MIN_HEIGHT,
      };
    }),
    rankColumns,
    edgeGroups: routeEdges(edgeGroups, positions),
  };
}

export function groupStageEdges(dag: RecipeDagResult): StageEdgeGroup[] {
  const groups = new Map<string, { fromStageId: string; toStageId: string; artifacts: Set<string> }>();
  for (const edge of dag.edges) {
    if (edge.internal) continue;
    const key = `${edge.from.stageId}->${edge.to.stageId}`;
    const existing = groups.get(key) ?? {
      fromStageId: edge.from.stageId,
      toStageId: edge.to.stageId,
      artifacts: new Set<string>(),
    };
    existing.artifacts.add(edge.artifact.id);
    groups.set(key, existing);
  }
  return Array.from(groups.entries()).map(([id, group]) => ({
    id,
    fromStageId: group.fromStageId,
    toStageId: group.toStageId,
    artifacts: Array.from(group.artifacts).sort(),
  }));
}

function assignDependencyRanks(
  dag: RecipeDagResult,
  edgeGroups: readonly StageEdgeGroup[]
): ReadonlyMap<string, number> {
  const rankByStageId = new Map(dag.stages.map((stage) => [stage.stageId, 0]));
  const stageOrderById = new Map(dag.stages.map((stage) => [stage.stageId, stage.order]));
  const incomingByStageId = new Map<string, StageEdgeGroup[]>();
  for (const edge of edgeGroups) {
    const incoming = incomingByStageId.get(edge.toStageId) ?? [];
    incoming.push(edge);
    incomingByStageId.set(edge.toStageId, incoming);
  }

  for (const stage of [...dag.stages].sort((a, b) => a.order - b.order)) {
    const incoming = incomingByStageId.get(stage.stageId) ?? [];
    let rank = rankByStageId.get(stage.stageId) ?? 0;
    for (const edge of incoming) {
      const fromOrder = stageOrderById.get(edge.fromStageId) ?? -1;
      if (fromOrder > stage.order) continue;
      rank = Math.max(rank, (rankByStageId.get(edge.fromStageId) ?? 0) + 1);
    }
    rankByStageId.set(stage.stageId, rank);
  }

  return rankByStageId;
}

function measurePhaseLanes(
  dag: RecipeDagResult,
  phaseIndexById: ReadonlyMap<string, number>,
  rankByStageId: ReadonlyMap<string, number>
): {
  totalHeight: number;
  byPhaseId: ReadonlyMap<string, { y: number; height: number; maxSlotCount: number }>;
} {
  const slotCountByPhaseRank = new Map<string, number>();
  for (const stage of dag.stages) {
    const phaseId = resolveStagePhaseId(dag, phaseIndexById, stage.phases);
    const rank = rankByStageId.get(stage.stageId) ?? 0;
    const key = `${phaseId}:${rank}`;
    slotCountByPhaseRank.set(key, (slotCountByPhaseRank.get(key) ?? 0) + 1);
  }

  const byPhaseId = new Map<string, { y: number; height: number; maxSlotCount: number }>();
  let cursor = GRAPH_PAD_TOP;
  for (const phase of dag.phases) {
    let maxSlotCount = 1;
    for (const [key, count] of slotCountByPhaseRank) {
      if (key.startsWith(`${phase.id}:`)) maxSlotCount = Math.max(maxSlotCount, count);
    }
    const height = Math.max(PHASE_MIN_HEIGHT, PHASE_TITLE_HEIGHT + maxSlotCount * STAGE_HEIGHT + Math.max(0, maxSlotCount - 1) * STAGE_GAP_Y + 26);
    byPhaseId.set(phase.id, { y: cursor, height, maxSlotCount });
    cursor += height + 28;
  }

  return {
    totalHeight: Math.max(PHASE_MIN_HEIGHT, cursor - GRAPH_PAD_TOP),
    byPhaseId,
  };
}

function positionStages(
  dag: RecipeDagResult,
  phaseMetrics: ReturnType<typeof measurePhaseLanes>,
  phaseIndexById: ReadonlyMap<string, number>,
  rankByStageId: ReadonlyMap<string, number>
): ReadonlyMap<string, StagePosition> {
  const positions = new Map<string, StagePosition>();
  const stagesByPhaseRank = new Map<string, typeof dag.stages>();
  for (const stage of dag.stages) {
    const phaseId = resolveStagePhaseId(dag, phaseIndexById, stage.phases);
    const rank = rankByStageId.get(stage.stageId) ?? 0;
    const key = `${phaseId}:${rank}`;
    stagesByPhaseRank.set(key, [...(stagesByPhaseRank.get(key) ?? []), stage]);
  }

  for (const [key, stages] of stagesByPhaseRank) {
    const [phaseId, rankText] = key.split(":");
    const rank = Number(rankText);
    const phase = phaseMetrics.byPhaseId.get(phaseId);
    const sortedStages = [...stages].sort((a, b) => a.order - b.order);
    sortedStages.forEach((stage, slot) => {
      positions.set(stage.stageId, {
        x: GRAPH_PAD_X + rank * (STAGE_WIDTH + RANK_GAP_X),
        y: (phase?.y ?? GRAPH_PAD_TOP) + PHASE_TITLE_HEIGHT + slot * (STAGE_HEIGHT + STAGE_GAP_Y),
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        rank,
        phaseId,
      });
    });
  }

  return positions;
}

function routeEdges(
  edgeGroups: readonly StageEdgeGroup[],
  positions: ReadonlyMap<string, StagePosition>
): RoutedStageEdgeGroup[] {
  const outboundIndex = indexEdgesByEndpoint(edgeGroups, "fromStageId");
  const inboundIndex = indexEdgesByEndpoint(edgeGroups, "toStageId");

  return edgeGroups.map((edge) => {
    const from = positions.get(edge.fromStageId);
    const to = positions.get(edge.toStageId);
    if (!from || !to) {
      return {
        ...edge,
        points: [],
        label: formatEdgeLabel(edge.artifacts),
        labelX: 0,
        labelY: 0,
      };
    }

    const outOffset = anchorOffset(outboundIndex.get(edge.fromStageId) ?? [], edge.id, from.height);
    const inOffset = anchorOffset(inboundIndex.get(edge.toStageId) ?? [], edge.id, to.height);
    const start = { x: from.x + from.width, y: from.y + outOffset };
    const end = { x: to.x, y: to.y + inOffset };
    const forward = end.x > start.x;
    const midX = forward ? start.x + Math.max(EDGE_STEM * 2, (end.x - start.x) / 2) : start.x + EDGE_STEM * 1.6;
    const points = forward
      ? [
          start,
          { x: start.x + EDGE_STEM, y: start.y },
          { x: midX, y: start.y },
          { x: midX, y: end.y },
          { x: end.x - EDGE_STEM, y: end.y },
          end,
        ]
      : [
          start,
          { x: start.x + EDGE_STEM, y: start.y },
          { x: start.x + EDGE_STEM, y: Math.max(start.y, end.y) + 42 },
          { x: end.x - EDGE_STEM, y: Math.max(start.y, end.y) + 42 },
          { x: end.x - EDGE_STEM, y: end.y },
          end,
        ];

    return {
      ...edge,
      points,
      label: formatEdgeLabel(edge.artifacts),
      labelX: forward ? midX : (start.x + end.x) / 2,
      labelY: (start.y + end.y) / 2,
    };
  });
}

function indexEdgesByEndpoint(
  edgeGroups: readonly StageEdgeGroup[],
  endpoint: "fromStageId" | "toStageId"
): ReadonlyMap<string, readonly StageEdgeGroup[]> {
  const byEndpoint = new Map<string, StageEdgeGroup[]>();
  for (const edge of edgeGroups) {
    const edges = byEndpoint.get(edge[endpoint]) ?? [];
    edges.push(edge);
    byEndpoint.set(edge[endpoint], edges);
  }
  for (const [stageId, edges] of byEndpoint) {
    byEndpoint.set(
      stageId,
      [...edges].sort((a, b) => a.id.localeCompare(b.id))
    );
  }
  return byEndpoint;
}

function anchorOffset(edges: readonly StageEdgeGroup[], edgeId: string, height: number): number {
  const index = Math.max(0, edges.findIndex((edge) => edge.id === edgeId));
  const count = Math.max(1, edges.length);
  const top = 38;
  const bottom = height - 28;
  return top + ((bottom - top) * (index + 1)) / (count + 1);
}

function formatEdgeLabel(artifacts: readonly string[]): string {
  if (artifacts.length === 0) return "artifact";
  if (artifacts.length === 1) return artifacts[0] ?? "artifact";
  return `${artifacts[0]} +${artifacts.length - 1}`;
}

function resolveStagePhaseId(
  dag: RecipeDagResult,
  phaseIndexById: ReadonlyMap<string, number>,
  stagePhases: readonly string[]
): string {
  return stagePhases.find((phaseId) => phaseIndexById.has(phaseId)) ?? dag.phases[0]?.id ?? "unphased";
}

export function pointsToPath(points: readonly DagPoint[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return [
    `M ${first.x} ${first.y}`,
    ...rest.map((point) => `L ${point.x} ${point.y}`),
  ].join(" ");
}
