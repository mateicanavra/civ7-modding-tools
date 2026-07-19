import type { RecipeDagResult } from "@civ7/studio-contract";
import { describe, expect, it } from "vitest";
import {
  buildArtifactEdgeLabels,
  buildRecipeDagLayout,
  groupStageEdges,
  pointsToPath,
  type RoutedStageEdgeGroup,
  resolveEdgeLabelPosition,
  resolveEdgeLabelPositions,
} from "../src/components/panels/recipe-dag/layout.js";
import { recipeDagFixture } from "../src/storybook/recipeDagFixture.js";
import recipeDagLayoutFixture from "./fixtures/recipe-dag-layout.json" with { type: "json" };

describe("recipe DAG layout", () => {
  // The fixture is a whole-layout regression oracle. JSON whitespace and
  // object-member order are serialization details, not layout behavior.
  it("matches the committed whole-layout fixture", () => {
    const layout = buildRecipeDagLayout(recipeDagFixture);
    const layoutValue: unknown = JSON.parse(
      JSON.stringify(layout, (_key, value) =>
        value instanceof Map ? Object.fromEntries(value) : value
      )
    );

    expect(layoutValue).toEqual(recipeDagLayoutFixture);
  });

  it("places stages by dependency rank while preserving derived domain grouping", () => {
    const layout = buildRecipeDagLayout(recipeDag());

    expect(layout.positions.get("shape-source")?.rank).toBe(0);
    expect(layout.positions.get("shape-branch-a")?.rank).toBe(1);
    expect(layout.positions.get("shape-branch-b")?.rank).toBe(1);
    expect(layout.positions.get("finish")?.rank).toBe(2);
    expect(layout.positions.get("finish")?.domainId).toBe("finish");
    expect(layout.rankColumns.map((column) => column.label)).toEqual(["Sources", "D1", "D2"]);
  });

  it("assigns every stage in a derived domain to its own vertical row", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const source = layout.positions.get("shape-source");
    const branchA = layout.positions.get("shape-branch-a");
    const branchB = layout.positions.get("shape-branch-b");
    const sink = layout.positions.get("finish");
    const morphologyBand = layout.domainBands.find((domain) => domain.id === "morphology");

    expect(source?.domainRow).toBe(0);
    expect(branchA?.domainRow).toBe(1);
    expect(branchB?.domainRow).toBe(2);
    expect(sink?.domainRow).toBe(0);
    expect(new Set([source?.y, branchA?.y, branchB?.y])).toHaveLength(3);
    expect(branchA?.rank).toBe(branchB?.rank);
    expect(branchA?.y).not.toBe(branchB?.y);
    expect(morphologyBand).toBeDefined();
    expect(morphologyBand!.y + morphologyBand!.height).toBeGreaterThanOrEqual(
      branchB!.y + branchB!.height + 26
    );
  });

  it("groups stage edges and produces routed orthogonal paths", () => {
    const dag = recipeDag();
    const groups = groupStageEdges(dag);
    const layout = buildRecipeDagLayout(dag);
    const routed = layout.edgeGroups.find(
      (edge) => edge.fromStageId === "shape-source" && edge.toStageId === "shape-branch-a"
    );

    expect(groups).toHaveLength(4);
    expect(routed?.artifacts).toEqual(["seed-grid"]);
    expect(pointsToPath(routed?.points ?? [])).toContain("L");
  });

  it("spreads crowded edge labels in the same horizontal bucket", () => {
    const layout = buildRecipeDagLayout(crowdedRecipeDag());
    const labels = layout.edgeGroups
      .filter((edge) => edge.fromStageId === "shape-source")
      .map((edge) => edge.labelY)
      .sort((a, b) => a - b);

    expect(labels.length).toBe(4);
    for (let index = 1; index < labels.length; index += 1) {
      expect(labels[index]! - labels[index - 1]!).toBeGreaterThanOrEqual(26);
    }
  });

  it("pulls selected-stage edge labels toward the dependency destination", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const edge = layout.edgeGroups.find(
      (candidate) =>
        candidate.fromStageId === "shape-source" && candidate.toStageId === "shape-branch-a"
    );

    expect(edge).toBeDefined();
    const routed = edge!;
    const last = routed.points[routed.points.length - 1]!;
    const defaultPosition = resolveEdgeLabelPosition(routed, null);
    const sourcePosition = resolveEdgeLabelPosition(routed, "shape-source");
    const targetPosition = resolveEdgeLabelPosition(routed, "shape-branch-a");
    const unrelatedPosition = resolveEdgeLabelPosition(routed, "finish");

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
    const positions = edges.map((edge) => resolved.get(edge.id)!).sort((a, b) => a.y - b.y);

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
    const positions = edges.map((edge) => resolved.get(edge.id)!).sort((a, b) => a.y - b.y);

    expect(positions.every((position) => position.x < 320)).toBe(true);
    expect(positions[1]!.y - positions[0]!.y).toBeGreaterThanOrEqual(30);
    expect(positions[2]!.y - positions[1]!.y).toBeGreaterThanOrEqual(30);
  });

  it("bundles shared-source edges before separating toward destinations", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const outgoing = layout.edgeGroups.filter((edge) => edge.fromStageId === "shape-source");

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
    const sourceEdge = layout.edgeGroups.find((edge) => edge.fromStageId === "shape-source")!;

    expect(seedLabels).toHaveLength(1);
    expect(seedLabel?.edgeIds).toHaveLength(2);
    expect(seedLabel?.toStageIds).toEqual(["shape-branch-a", "shape-branch-b"]);
    expect(seedLabel?.label).toBe("seed-grid");
    expect(seedLabel?.labelX).toBeGreaterThan(sourceEdge.points[0]!.x);
    expect(seedLabel?.labelX).toBeLessThanOrEqual(sourceEdge.points[1]!.x);
    expect(seedLabel?.labelX).toBeGreaterThan(
      sourceEdge.points[0]!.x + (sourceEdge.points[1]!.x - sourceEdge.points[0]!.x) * 0.7
    );
  });

  it("moves a split artifact label near the selected destination branch", () => {
    const layout = buildRecipeDagLayout(recipeDag());
    const labels = buildArtifactEdgeLabels(layout.edgeGroups, "shape-branch-b");
    const seedLabel = labels.find((label) => label.artifact === "seed-grid");
    const branchBEdge = layout.edgeGroups.find(
      (edge) => edge.fromStageId === "shape-source" && edge.toStageId === "shape-branch-b"
    )!;
    const branchBEndpoint = branchBEdge.points[branchBEdge.points.length - 1]!;

    expect(seedLabel).toBeDefined();
    expect(seedLabel?.edgeIds).toHaveLength(2);
    expect(seedLabel?.toStageIds).toEqual(["shape-branch-a", "shape-branch-b"]);
    expect(seedLabel?.labelX).toBeGreaterThan(branchBEdge.points[1]!.x);
    expect(Math.abs(seedLabel!.labelY - branchBEndpoint.y)).toBeLessThan(8);
  });
});

function routedEdge(
  id: string,
  fromStageId: string,
  toStageId: string,
  destinationY: number
): RoutedStageEdgeGroup {
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
    stages: [
      stage("shape-source", 0, [], ["seed-grid"]),
      stage("shape-branch-a", 1, ["seed-grid"], ["coast-grid"]),
      stage("shape-branch-b", 2, ["seed-grid"], ["height-grid"]),
      stage("finish", 3, ["coast-grid", "height-grid"], []),
    ],
    edges: [
      edge("shape-source", "seed", "shape-branch-a", "coast", "seed-grid"),
      edge("shape-source", "seed", "shape-branch-b", "height", "seed-grid"),
      edge("shape-branch-a", "coast", "finish", "finalize", "coast-grid"),
      edge("shape-branch-b", "height", "finish", "finalize", "height-grid"),
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
    stages: [
      stage("shape-source", 0, [], ["seed-a", "seed-b", "seed-c", "seed-d"]),
      stage("shape-branch-a", 1, ["seed-a"], []),
      stage("shape-branch-b", 2, ["seed-b"], []),
      stage("shape-branch-c", 3, ["seed-c"], []),
      stage("shape-branch-d", 4, ["seed-d"], []),
    ],
    edges: [
      edge("shape-source", "seed", "shape-branch-a", "step", "seed-a"),
      edge("shape-source", "seed", "shape-branch-b", "step", "seed-b"),
      edge("shape-source", "seed", "shape-branch-c", "step", "seed-c"),
      edge("shape-source", "seed", "shape-branch-d", "step", "seed-d"),
    ],
    diagnostics: [],
  };
}

function stage(
  stageId: string,
  order: number,
  requires: readonly string[],
  provides: readonly string[]
): RecipeDagResult["stages"][number] {
  return {
    stageId,
    order,
    steps: [
      {
        stageId,
        stepId: "step",
        fullStepId: `mod-swooper-maps.standard.${stageId}.step`,
        order,
        orderInStage: 0,
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
