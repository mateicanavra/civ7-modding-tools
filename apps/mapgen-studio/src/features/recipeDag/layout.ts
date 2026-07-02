import type { RecipeDagResult } from "@civ7/studio-contract";
import { formatArtifactGroupLabel, formatArtifactLabel } from "./artifactPresentation";

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
  phaseRow: number;
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

export type RoutedArtifactEdgeLabel = Readonly<{
  id: string;
  fromStageId: string;
  toStageIds: readonly string[];
  edgeIds: readonly string[];
  artifact: string;
  artifacts: readonly string[];
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
const RANK_GAP_X = 150;
const GRAPH_PAD_X = 80;
const GRAPH_PAD_TOP = 96;
const GRAPH_PAD_BOTTOM = 110;
const PHASE_TITLE_HEIGHT = 42;
const PHASE_MIN_HEIGHT = 188;
const STAGE_GAP_Y = 36;
const EDGE_STEM = 34;
const EDGE_LABEL_MIN_GAP = 26;
const EDGE_LABEL_ENDPOINT_MIN_OFFSET = 118;
const EDGE_LABEL_ENDPOINT_MAX_OFFSET = 168;
const EDGE_LABEL_ENDPOINT_FRACTION = 0.28;
const EDGE_LABEL_DESTINATION_X_OFFSET = 128;
const EDGE_LABEL_COLLISION_GAP = 30;

export function buildRecipeDagLayout(dag: RecipeDagResult): RecipeDagLayout {
  const edgeGroups = groupStageEdges(dag);
  const phaseIndexById = new Map(dag.phases.map((phase, index) => [phase.id, index]));
  const rankByStageId = assignDependencyRanks(dag, edgeGroups);
  const phaseRowByStageId = assignPhaseRows(dag, phaseIndexById);
  const rankCount = Math.max(1, Math.max(...Array.from(rankByStageId.values()), 0) + 1);
  const phaseMetrics = measurePhaseLanes(dag, phaseIndexById, phaseRowByStageId);
  const positions = positionStages(
    dag,
    phaseMetrics,
    phaseIndexById,
    rankByStageId,
    phaseRowByStageId
  );
  const width = Math.max(
    1040,
    GRAPH_PAD_X * 2 + rankCount * STAGE_WIDTH + Math.max(0, rankCount - 1) * RANK_GAP_X
  );
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
    edgeGroups: spreadEdgeLabels(routeEdges(edgeGroups, positions)),
  };
}

export function groupStageEdges(dag: RecipeDagResult): StageEdgeGroup[] {
  const groups = new Map<
    string,
    { fromStageId: string; toStageId: string; artifacts: Set<string> }
  >();
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

  for (const stage of [...dag.stages].sort(
    (a, b) => a.order - b.order || a.stageId.localeCompare(b.stageId)
  )) {
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
  phaseRowByStageId: ReadonlyMap<string, number>
): {
  totalHeight: number;
  byPhaseId: ReadonlyMap<string, { y: number; height: number; rowCount: number }>;
} {
  const rowCountByPhaseId = new Map<string, number>();
  for (const stage of dag.stages) {
    const phaseId = resolveStagePhaseId(dag, phaseIndexById, stage.phases);
    const phaseRow = phaseRowByStageId.get(stage.stageId) ?? 0;
    rowCountByPhaseId.set(phaseId, Math.max(rowCountByPhaseId.get(phaseId) ?? 0, phaseRow + 1));
  }

  const byPhaseId = new Map<string, { y: number; height: number; rowCount: number }>();
  let cursor = GRAPH_PAD_TOP;
  for (const phase of dag.phases) {
    const rowCount = Math.max(1, rowCountByPhaseId.get(phase.id) ?? 1);
    const height = Math.max(
      PHASE_MIN_HEIGHT,
      PHASE_TITLE_HEIGHT + rowCount * STAGE_HEIGHT + Math.max(0, rowCount - 1) * STAGE_GAP_Y + 26
    );
    byPhaseId.set(phase.id, { y: cursor, height, rowCount });
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
  rankByStageId: ReadonlyMap<string, number>,
  phaseRowByStageId: ReadonlyMap<string, number>
): ReadonlyMap<string, StagePosition> {
  const positions = new Map<string, StagePosition>();

  for (const stage of dag.stages) {
    const phaseId = resolveStagePhaseId(dag, phaseIndexById, stage.phases);
    const rank = rankByStageId.get(stage.stageId) ?? 0;
    const phaseRow = phaseRowByStageId.get(stage.stageId) ?? 0;
    const phase = phaseMetrics.byPhaseId.get(phaseId);
    positions.set(stage.stageId, {
      x: GRAPH_PAD_X + rank * (STAGE_WIDTH + RANK_GAP_X),
      y: (phase?.y ?? GRAPH_PAD_TOP) + PHASE_TITLE_HEIGHT + phaseRow * (STAGE_HEIGHT + STAGE_GAP_Y),
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      rank,
      phaseRow,
      phaseId,
    });
  }

  return positions;
}

function assignPhaseRows(
  dag: RecipeDagResult,
  phaseIndexById: ReadonlyMap<string, number>
): ReadonlyMap<string, number> {
  const rowByStageId = new Map<string, number>();
  const nextRowByPhaseId = new Map<string, number>();
  for (const stage of [...dag.stages].sort(
    (a, b) => a.order - b.order || a.stageId.localeCompare(b.stageId)
  )) {
    const phaseId = resolveStagePhaseId(dag, phaseIndexById, stage.phases);
    const row = nextRowByPhaseId.get(phaseId) ?? 0;
    rowByStageId.set(stage.stageId, row);
    nextRowByPhaseId.set(phaseId, row + 1);
  }
  return rowByStageId;
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

    const outboundEdges = outboundIndex.get(edge.fromStageId) ?? [];
    const outOffset =
      outboundEdges.length > 1
        ? from.height / 2
        : anchorOffset(outboundEdges, edge.id, from.height);
    const inOffset = anchorOffset(inboundIndex.get(edge.toStageId) ?? [], edge.id, to.height);
    const start = { x: from.x + from.width, y: from.y + outOffset };
    const end = { x: to.x, y: to.y + inOffset };
    const forward = end.x > start.x;
    const bundleX = forward
      ? start.x + Math.min(Math.max(EDGE_STEM, (end.x - start.x) * 0.32), EDGE_STEM * 2.4)
      : start.x + EDGE_STEM * 1.6;
    const points = forward
      ? [
          start,
          { x: bundleX, y: start.y },
          { x: bundleX, y: end.y },
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
      labelX: forward ? bundleX : (start.x + end.x) / 2,
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
  const index = Math.max(
    0,
    edges.findIndex((edge) => edge.id === edgeId)
  );
  const count = Math.max(1, edges.length);
  const top = 38;
  const bottom = height - 28;
  return top + ((bottom - top) * (index + 1)) / (count + 1);
}

function formatEdgeLabel(artifacts: readonly string[]): string {
  return formatArtifactGroupLabel(artifacts);
}

function spreadEdgeLabels(edgeGroups: readonly RoutedStageEdgeGroup[]): RoutedStageEdgeGroup[] {
  const routed = edgeGroups
    .filter((edge) => edge.points.length > 0)
    .sort((a, b) => a.labelX - b.labelX || a.labelY - b.labelY);
  const buckets = new Map<number, RoutedStageEdgeGroup[]>();
  for (const edge of routed) {
    const bucket = Math.round(edge.labelX / 96);
    buckets.set(bucket, [...(buckets.get(bucket) ?? []), edge]);
  }

  const labelYByEdgeId = new Map<string, number>();
  for (const edges of buckets.values()) {
    let previousY = Number.NEGATIVE_INFINITY;
    for (const edge of [...edges].sort((a, b) => a.labelY - b.labelY)) {
      const nextY = Math.max(edge.labelY, previousY + EDGE_LABEL_MIN_GAP);
      labelYByEdgeId.set(edge.id, nextY);
      previousY = nextY;
    }
  }

  return edgeGroups.map((edge) => ({
    ...edge,
    labelY: labelYByEdgeId.get(edge.id) ?? edge.labelY,
  }));
}

function resolveStagePhaseId(
  dag: RecipeDagResult,
  phaseIndexById: ReadonlyMap<string, number>,
  stagePhases: readonly string[]
): string {
  return (
    stagePhases.find((phaseId) => phaseIndexById.has(phaseId)) ?? dag.phases[0]?.id ?? "unphased"
  );
}

export function pointsToPath(points: readonly DagPoint[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return [`M ${first.x} ${first.y}`, ...rest.map((point) => `L ${point.x} ${point.y}`)].join(" ");
}

export function buildArtifactEdgeLabels(
  edgeGroups: readonly RoutedStageEdgeGroup[],
  selectedStageId: string | null = null
): readonly RoutedArtifactEdgeLabel[] {
  const labelsByKey = new Map<
    string,
    { fromStageId: string; artifact: string; edges: RoutedStageEdgeGroup[] }
  >();
  for (const edge of edgeGroups) {
    for (const artifact of edge.artifacts) {
      const key = `${edge.fromStageId}:${artifact}`;
      const label = labelsByKey.get(key) ?? { fromStageId: edge.fromStageId, artifact, edges: [] };
      label.edges.push(edge);
      labelsByKey.set(key, label);
    }
  }

  const labels = Array.from(labelsByKey.values()).map((label) => {
    const edges = [...label.edges].sort(
      (a, b) => a.toStageId.localeCompare(b.toStageId) || a.id.localeCompare(b.id)
    );
    const position = resolveArtifactLabelPreferredPosition(edges, selectedStageId);
    return {
      id: `${label.fromStageId}:${label.artifact}`,
      fromStageId: label.fromStageId,
      toStageIds: Array.from(new Set(edges.map((edge) => edge.toStageId))).sort(),
      edgeIds: edges.map((edge) => edge.id).sort(),
      artifact: label.artifact,
      artifacts: [label.artifact],
      label: formatArtifactLabel(label.artifact),
      labelX: position.x,
      labelY: position.y,
    };
  });

  return spreadArtifactLabels(labels, selectedStageId);
}

export function resolveEdgeLabelPosition(
  edge: RoutedStageEdgeGroup,
  selectedStageId: string | null
): DagPoint {
  if (!selectedStageId || edge.points.length === 0) return { x: edge.labelX, y: edge.labelY };
  const selectedIsSource = edge.fromStageId === selectedStageId;
  const selectedIsTarget = edge.toStageId === selectedStageId;
  if (!selectedIsSource && !selectedIsTarget) return { x: edge.labelX, y: edge.labelY };

  return resolveDestinationEdgeLabelPosition(edge);
}

export function resolveEdgeLabelPositions(
  edgeGroups: readonly RoutedStageEdgeGroup[],
  selectedStageId: string | null
): ReadonlyMap<string, DagPoint> {
  const positions = new Map(
    edgeGroups.map((edge) => [
      edge.id,
      selectedStageId
        ? resolveEdgeLabelPosition(edge, selectedStageId)
        : resolveDestinationEdgeLabelPosition(edge),
    ])
  );

  const clusters = new Map<string, RoutedStageEdgeGroup[]>();
  for (const edge of edgeGroups) {
    if (!edge.points.length) continue;
    if (
      selectedStageId &&
      edge.fromStageId !== selectedStageId &&
      edge.toStageId !== selectedStageId
    )
      continue;
    clusters.set(edge.toStageId, [...(clusters.get(edge.toStageId) ?? []), edge]);
  }

  for (const edges of clusters.values()) {
    if (edges.length < 2) continue;
    const sorted = [...edges].sort((a, b) => {
      const aPosition = positions.get(a.id) ?? { x: a.labelX, y: a.labelY };
      const bPosition = positions.get(b.id) ?? { x: b.labelX, y: b.labelY };
      return aPosition.y - bPosition.y || a.id.localeCompare(b.id);
    });
    const resolvedY = resolveVerticalLabelCollisions(
      sorted.map((edge) => positions.get(edge.id)?.y ?? edge.labelY),
      EDGE_LABEL_COLLISION_GAP
    );
    sorted.forEach((edge, index) => {
      const position = positions.get(edge.id) ?? { x: edge.labelX, y: edge.labelY };
      positions.set(edge.id, { x: position.x, y: resolvedY[index] ?? position.y });
    });
  }

  return positions;
}

function resolveArtifactLabelPreferredPosition(
  edges: readonly RoutedStageEdgeGroup[],
  selectedStageId: string | null
): DagPoint {
  const first = edges[0];
  if (!first) return { x: 0, y: 0 };
  const selectedDestinationEdge = selectedStageId
    ? edges.find((edge) => edge.toStageId === selectedStageId)
    : null;
  if (selectedDestinationEdge) return resolveDestinationEdgeLabelPosition(selectedDestinationEdge);
  if (edges.length === 1) return resolveDestinationEdgeLabelPosition(first);

  const start = first.points[0];
  const trunk = first.points[1];
  if (!start || !trunk) return { x: first.labelX, y: first.labelY };
  return {
    x: start.x + (trunk.x - start.x) * 0.82,
    y: start.y,
  };
}

function spreadArtifactLabels(
  labels: readonly RoutedArtifactEdgeLabel[],
  selectedStageId: string | null
): readonly RoutedArtifactEdgeLabel[] {
  const clusters = new Map<string, RoutedArtifactEdgeLabel[]>();
  for (const label of labels) {
    const clusterKey =
      selectedStageId && label.toStageIds.includes(selectedStageId)
        ? `destination:${selectedStageId}`
        : label.toStageIds.length > 1
          ? `source:${label.fromStageId}`
          : `destination:${label.toStageIds[0] ?? label.fromStageId}`;
    clusters.set(clusterKey, [...(clusters.get(clusterKey) ?? []), label]);
  }

  const labelYById = new Map<string, number>();
  for (const cluster of clusters.values()) {
    const sorted = [...cluster].sort((a, b) => a.labelY - b.labelY || a.id.localeCompare(b.id));
    const resolvedY = resolveVerticalLabelCollisions(
      sorted.map((label) => label.labelY),
      EDGE_LABEL_COLLISION_GAP
    );
    sorted.forEach((label, index) => labelYById.set(label.id, resolvedY[index] ?? label.labelY));
  }

  return labels
    .map((label) => ({
      ...label,
      labelY: labelYById.get(label.id) ?? label.labelY,
    }))
    .sort((a, b) => a.labelX - b.labelX || a.labelY - b.labelY || a.id.localeCompare(b.id));
}

function resolveDestinationEdgeLabelPosition(edge: RoutedStageEdgeGroup): DagPoint {
  if (edge.points.length === 0) return { x: edge.labelX, y: edge.labelY };
  const length = polylineLength(edge.points);
  if (length === 0) return { x: edge.labelX, y: edge.labelY };

  const endpointOffset = Math.min(
    EDGE_LABEL_ENDPOINT_MAX_OFFSET,
    Math.max(EDGE_LABEL_ENDPOINT_MIN_OFFSET, length * EDGE_LABEL_ENDPOINT_FRACTION)
  );
  const distanceFromStart = Math.max(0, length - endpointOffset);
  return nudgeLabelOutsideDestination(edge, pointAlongPolyline(edge.points, distanceFromStart));
}

function nudgeLabelOutsideDestination(edge: RoutedStageEdgeGroup, point: DagPoint): DagPoint {
  const destination = edge.points[edge.points.length - 1];
  if (!destination) return point;
  const branchStart = edge.points.length >= 3 ? edge.points[edge.points.length - 3] : null;
  const destinationX = Math.max(
    GRAPH_PAD_X * 0.75,
    destination.x - EDGE_LABEL_DESTINATION_X_OFFSET,
    branchStart ? branchStart.x + EDGE_STEM * 0.55 : Number.NEGATIVE_INFINITY
  );
  return {
    x: destinationX,
    y: destination.y,
  };
}

function resolveVerticalLabelCollisions(preferredY: readonly number[], gap: number): number[] {
  if (preferredY.length < 2) return [...preferredY];

  const resolved = [...preferredY];
  for (let index = 1; index < resolved.length; index += 1) {
    resolved[index] = Math.max(resolved[index]!, resolved[index - 1]! + gap);
  }

  const preferredCenter = average(preferredY);
  const resolvedCenter = average(resolved);
  return resolved.map((y) => y + preferredCenter - resolvedCenter);
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function polylineLength(points: readonly DagPoint[]): number {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += distance(points[index - 1]!, points[index]!);
  }
  return length;
}

function pointAlongPolyline(points: readonly DagPoint[], distanceFromStart: number): DagPoint {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0]!;

  let remaining = distanceFromStart;
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]!;
    const end = points[index]!;
    const segmentLength = distance(start, end);
    if (segmentLength === 0) continue;
    if (remaining <= segmentLength) {
      const progress = remaining / segmentLength;
      return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
      };
    }
    remaining -= segmentLength;
  }

  return points[points.length - 1]!;
}

function distance(a: DagPoint, b: DagPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}
