import { describe, expect, it } from "vitest";

import { buildRecipeDagLayout, groupStageEdges, pointsToPath } from "../../src/features/recipeDag/layout";
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
});

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
