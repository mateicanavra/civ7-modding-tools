import { describe, expect, it } from "vitest";

import {
  buildArtifactEdgeLabels,
  buildRecipeDagLayout,
  groupStageEdges,
  pointsToPath,
  resolveEdgeLabelPosition,
  resolveEdgeLabelPositions,
  type RoutedStageEdgeGroup,
} from "../../src/features/recipeDag/layout";
import type { RecipeDagResult } from "../../src/features/recipeDag/client";

describe("recipe DAG layout", () => {
  it("places stages by dependency rank while preserving phase grouping", () => {
    const layout = buildRecipeDagLayout(recipeDag());

    expect(layout.positions.get("source")?.rank).toBe(0);
    expect(layout.positions.get("branch-a")?.rank).toBe(1);
    expect(layout.positions.get("branch-b")?.rank).toBe(1);
    expect(layout.positions.get("sink")?.rank).toBe(2);
    expect(layout.positions.get("sink")?.phaseId).toBe("finish");
    expect(layout.rankColumns.map((column) => column.label)).toEqual(["Sources", "D1", "D2"]);
  });

  it("assigns every stage in a phase to its own vertical row", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const source = layout.positions.get("source");
    const branchA = layout.positions.get("branch-a");
    const branchB = layout.positions.get("branch-b");
    const sink = layout.positions.get("sink");
    const shapeBand = layout.phaseBands.find((phase) => phase.id === "shape");

    expect(source?.phaseRow).toBe(0);
    expect(branchA?.phaseRow).toBe(1);
    expect(branchB?.phaseRow).toBe(2);
    expect(sink?.phaseRow).toBe(0);
    expect(new Set([source?.y, branchA?.y, branchB?.y])).toHaveLength(3);
    expect(branchA?.rank).toBe(branchB?.rank);
    expect(branchA?.y).not.toBe(branchB?.y);
    expect(shapeBand).toBeDefined();
    expect(shapeBand!.y + shapeBand!.height).toBeGreaterThanOrEqual(branchB!.y + branchB!.height + 26);
  });

  it("groups stage edges and produces routed orthogonal paths", () => {
    const dag = recipeDag();
    const groups = groupStageEdges(dag);
    const layout = buildRecipeDagLayout(dag);
    const routed = layout.edgeGroups.find((edge) => edge.fromStageId === "source" && edge.toStageId === "branch-a");

    expect(groups).toHaveLength(4);
    expect(routed?.artifacts).toEqual(["seed-grid"]);
    expect(pointsToPath(routed?.points ?? [])).toContain("L");
  });

  it("spreads crowded edge labels in the same horizontal bucket", () => {
    const layout = buildRecipeDagLayout(crowdedRecipeDag());
    const labels = layout.edgeGroups
      .filter((edge) => edge.fromStageId === "source")
      .map((edge) => edge.labelY)
      .sort((a, b) => a - b);

    expect(labels.length).toBe(4);
    for (let index = 1; index < labels.length; index += 1) {
      expect(labels[index]! - labels[index - 1]!).toBeGreaterThanOrEqual(26);
    }
  });

  it("pulls selected-stage edge labels toward the dependency destination", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const edge = layout.edgeGroups.find((candidate) => candidate.fromStageId === "source" && candidate.toStageId === "branch-a");

    expect(edge).toBeDefined();
    const routed = edge!;
    const last = routed.points[routed.points.length - 1]!;
    const defaultPosition = resolveEdgeLabelPosition(routed, null);
    const sourcePosition = resolveEdgeLabelPosition(routed, "source");
    const targetPosition = resolveEdgeLabelPosition(routed, "branch-a");
    const unrelatedPosition = resolveEdgeLabelPosition(routed, "sink");

    expect(defaultPosition).toEqual({ x: routed.labelX, y: routed.labelY });
    expect(unrelatedPosition).toEqual(defaultPosition);
    expect(Math.abs(sourcePosition.y - last.y)).toBeLessThan(Math.abs(defaultPosition.y - last.y));
    expect(Math.abs(targetPosition.y - last.y)).toBeLessThan(Math.abs(defaultPosition.y - last.y));
    expect(sourcePosition.x).toBeLessThan(last.x);
  });

  it("fans crowded selected-stage labels around the shared destination", () => {
    const edges: RoutedStageEdgeGroup[] = [
      routedEdge("a->sink", "a", "sink", 98),
      routedEdge("b->sink", "b", "sink", 100),
      routedEdge("c->sink", "c", "sink", 102),
    ];
    const resolved = resolveEdgeLabelPositions(edges, "sink");
    const positions = edges
      .map((edge) => resolved.get(edge.id)!)
      .sort((a, b) => a.y - b.y);

    expect(positions[1]!.y - positions[0]!.y).toBeGreaterThanOrEqual(30);
    expect(positions[2]!.y - positions[1]!.y).toBeGreaterThanOrEqual(30);
  });

  it("applies destination crowding to the non-selected graph", () => {
    const edges: RoutedStageEdgeGroup[] = [
      routedEdge("a->sink", "a", "sink", 98),
      routedEdge("b->sink", "b", "sink", 100),
      routedEdge("c->sink", "c", "sink", 102),
    ];
    const resolved = resolveEdgeLabelPositions(edges, null);
    const positions = edges
      .map((edge) => resolved.get(edge.id)!)
      .sort((a, b) => a.y - b.y);

    expect(positions.every((position) => position.x < 320)).toBe(true);
    expect(positions[1]!.y - positions[0]!.y).toBeGreaterThanOrEqual(30);
    expect(positions[2]!.y - positions[1]!.y).toBeGreaterThanOrEqual(30);
  });

  it("bundles shared-source edges before separating toward destinations", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const outgoing = layout.edgeGroups.filter((edge) => edge.fromStageId === "source");

    expect(outgoing).toHaveLength(2);
    expect(new Set(outgoing.map((edge) => edge.points[0]?.y))).toHaveLength(1);
    expect(new Set(outgoing.map((edge) => edge.points[1]?.x))).toHaveLength(1);
    expect(new Set(outgoing.map((edge) => edge.points[2]?.y))).toHaveLength(2);
  });

  it("labels each provided artifact once across split destination connectors", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const labels = buildArtifactEdgeLabels(layout.edgeGroups);
    const seedLabels = labels.filter((label) => label.artifact === "seed-grid");
    const seedLabel = seedLabels[0];
    const sourceEdge = layout.edgeGroups.find((edge) => edge.fromStageId === "source")!;

    expect(seedLabels).toHaveLength(1);
    expect(seedLabel?.edgeIds).toHaveLength(2);
    expect(seedLabel?.toStageIds).toEqual(["branch-a", "branch-b"]);
    expect(seedLabel?.label).toBe("seed-grid");
    expect(seedLabel?.labelX).toBeGreaterThan(sourceEdge.points[0]!.x);
    expect(seedLabel?.labelX).toBeLessThanOrEqual(sourceEdge.points[1]!.x);
    expect(seedLabel?.labelX).toBeGreaterThan(sourceEdge.points[0]!.x + (sourceEdge.points[1]!.x - sourceEdge.points[0]!.x) * 0.7);
  });

  it("moves a split artifact label near the selected destination branch", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const labels = buildArtifactEdgeLabels(layout.edgeGroups, "branch-b");
    const seedLabel = labels.find((label) => label.artifact === "seed-grid");
    const branchBEdge = layout.edgeGroups.find((edge) => edge.fromStageId === "source" && edge.toStageId === "branch-b")!;
    const branchBEndpoint = branchBEdge.points[branchBEdge.points.length - 1]!;

    expect(seedLabel).toBeDefined();
    expect(seedLabel?.edgeIds).toHaveLength(2);
    expect(seedLabel?.toStageIds).toEqual(["branch-a", "branch-b"]);
    expect(seedLabel?.labelX).toBeGreaterThan(branchBEdge.points[1]!.x);
    expect(Math.abs(seedLabel!.labelY - branchBEndpoint.y)).toBeLessThan(8);
  });
});

function routedEdge(id: string, fromStageId: string, toStageId: string, destinationY: number): RoutedStageEdgeGroup {
  return {
    id,
    fromStageId,
    toStageId,
    artifacts: [`${fromStageId}-artifact`],
    points: [
      { x: 80, y: destinationY },
      { x: 240, y: destinationY },
      { x: 240, y: 100 },
      { x: 320, y: 100 },
    ],
    label: id,
    labelX: 220,
    labelY: destinationY,
  };
}

function recipeDag(): RecipeDagResult {
  return {
    recipeId: "standard",
    recipeKey: "mod-swooper-maps/standard",
    namespace: "mod-swooper-maps",
    title: "Swooper Maps / Standard",
    phases: [
      { id: "shape", order: 0, stageIds: ["source", "branch-a", "branch-b"], stepCount: 3 },
      { id: "finish", order: 1, stageIds: ["sink"], stepCount: 1 },
    ],
    stages: [
      stage("source", 0, "shape", [], ["seed-grid"]),
      stage("branch-a", 1, "shape", ["seed-grid"], ["coast-grid"]),
      stage("branch-b", 2, "shape", ["seed-grid"], ["height-grid"]),
      stage("sink", 3, "finish", ["coast-grid", "height-grid"], []),
    ],
    edges: [
      edge("source", "seed", "branch-a", "coast", "seed-grid"),
      edge("source", "seed", "branch-b", "height", "seed-grid"),
      edge("branch-a", "coast", "sink", "finalize", "coast-grid"),
      edge("branch-b", "height", "sink", "finalize", "height-grid"),
    ],
    diagnostics: [],
  };
}

function crowdedRecipeDag(): RecipeDagResult {
  return {
    recipeId: "crowded",
    recipeKey: "mod-swooper-maps/crowded",
    namespace: "mod-swooper-maps",
    title: "Crowded DAG",
    phases: [
      { id: "shape", order: 0, stageIds: ["source", "branch-a", "branch-b", "branch-c", "branch-d"], stepCount: 5 },
    ],
    stages: [
      stage("source", 0, "shape", [], ["seed-a", "seed-b", "seed-c", "seed-d"]),
      stage("branch-a", 1, "shape", ["seed-a"], []),
      stage("branch-b", 2, "shape", ["seed-b"], []),
      stage("branch-c", 3, "shape", ["seed-c"], []),
      stage("branch-d", 4, "shape", ["seed-d"], []),
    ],
    edges: [
      edge("source", "seed", "branch-a", "step", "seed-a"),
      edge("source", "seed", "branch-b", "step", "seed-b"),
      edge("source", "seed", "branch-c", "step", "seed-c"),
      edge("source", "seed", "branch-d", "step", "seed-d"),
    ],
    diagnostics: [],
  };
}

function stage(
  stageId: string,
  order: number,
  phase: string,
  requires: readonly string[],
  provides: readonly string[]
): RecipeDagResult["stages"][number] {
  return {
    id: stageId,
    stageId,
    order,
    phases: [phase],
    steps: [
      {
        id: `mod-swooper-maps.standard.${stageId}.step`,
        stageId,
        stepId: "step",
        fullStepId: `mod-swooper-maps.standard.${stageId}.step`,
        order,
        orderInStage: 0,
        phase,
        artifactRequires: requires.map((id) => ({ id, name: id })),
        artifactProvides: provides.map((id) => ({ id, name: id })),
        tagRequires: [],
        tagProvides: [],
      },
    ],
    artifactRequires: requires.map((id) => ({ id, name: id })),
    artifactProvides: provides.map((id) => ({ id, name: id })),
    inboundArtifactEdgeCount: requires.length,
    outboundArtifactEdgeCount: provides.length,
    internalArtifactEdgeCount: 0,
    diagnosticCount: 0,
  };
}

function edge(
  fromStageId: string,
  fromStepId: string,
  toStageId: string,
  toStepId: string,
  artifactId: string
): RecipeDagResult["edges"][number] {
  return {
    id: `${fromStageId}->${toStageId}:${artifactId}`,
    artifact: { id: artifactId, name: artifactId },
    from: {
      stageId: fromStageId,
      stepId: fromStepId,
      fullStepId: `mod-swooper-maps.standard.${fromStageId}.${fromStepId}`,
    },
    to: {
      stageId: toStageId,
      stepId: toStepId,
      fullStepId: `mod-swooper-maps.standard.${toStageId}.${toStepId}`,
    },
    internal: false,
  };
}
