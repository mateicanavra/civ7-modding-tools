import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";

import { RecipeDagResultSchema } from "../src/recipeDag/schema.js";

function canonicalRecipeDag() {
  return {
    recipeId: "mod-swooper-maps/standard",
    recipeKey: "standard",
    namespace: "mod-swooper-maps",
    title: "Standard",
    stages: [
      {
        stageId: "foundation",
        order: 0,
        steps: [
          {
            stageId: "foundation",
            stepId: "seed-crust",
            fullStepId: "foundation.seed-crust",
            order: 0,
            orderInStage: 0,
            artifactRequires: [],
            artifactProvides: [],
            tagRequires: [],
            tagProvides: [],
          },
        ],
        artifactRequires: [],
        artifactProvides: [],
        inboundArtifactEdgeCount: 0,
        outboundArtifactEdgeCount: 0,
        internalArtifactEdgeCount: 0,
        diagnosticCount: 0,
      },
    ],
    edges: [],
    diagnostics: [],
  };
}

describe("RecipeDagResultSchema", () => {
  it("admits canonical identity fields and rejects retired stage and step id aliases", () => {
    const canonical = canonicalRecipeDag();
    expect(Value.Check(RecipeDagResultSchema, canonical)).toBe(true);

    const [stage] = canonical.stages;
    if (!stage) throw new Error("Expected recipe DAG stage fixture.");
    const [step] = stage.steps;
    if (!step) throw new Error("Expected recipe DAG step fixture.");

    expect(
      Value.Check(RecipeDagResultSchema, {
        ...canonical,
        stages: [{ ...stage, id: stage.stageId }],
      })
    ).toBe(false);
    expect(
      Value.Check(RecipeDagResultSchema, {
        ...canonical,
        stages: [{ ...stage, steps: [{ ...step, id: step.fullStepId }] }],
      })
    ).toBe(false);
  });
});
