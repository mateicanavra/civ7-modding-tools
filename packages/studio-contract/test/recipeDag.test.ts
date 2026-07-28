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
            completionRequires: [],
            completionProvides: [],
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

  it("admits duplicate providers without inventing a consumer", () => {
    const canonical = canonicalRecipeDag();
    const artifact = { id: "artifact:foundation.mesh", name: "foundationMesh" };
    const providers = [
      { stageId: "foundation", stepId: "mesh-a", fullStepId: "foundation.mesh-a" },
      { stageId: "foundation", stepId: "mesh-b", fullStepId: "foundation.mesh-b" },
    ];

    expect(
      Value.Check(RecipeDagResultSchema, {
        ...canonical,
        diagnostics: [
          {
            kind: "artifact-provider-duplicate",
            artifact,
            providers,
            consumers: [],
          },
        ],
      })
    ).toBe(true);
  });

  it("admits exact artifact-authority mismatch evidence", () => {
    const canonical = canonicalRecipeDag();

    expect(
      Value.Check(RecipeDagResultSchema, {
        ...canonical,
        diagnostics: [
          {
            kind: "artifact-authority-mismatch",
            artifact: { id: "artifact:foundation.mesh", name: "requiredMesh" },
            providedArtifact: { id: "artifact:foundation.mesh", name: "providedMesh" },
            provider: {
              stageId: "foundation",
              stepId: "publish-mesh",
              fullStepId: "foundation.publish-mesh",
            },
            consumer: {
              stageId: "morphology",
              stepId: "consume-mesh",
              fullStepId: "morphology.consume-mesh",
            },
          },
        ],
      })
    ).toBe(true);
  });

  it("rejects the retired singular duplicate-provider consumer", () => {
    const canonical = canonicalRecipeDag();
    const endpoint = {
      stageId: "foundation",
      stepId: "mesh",
      fullStepId: "foundation.mesh",
    };

    expect(
      Value.Check(RecipeDagResultSchema, {
        ...canonical,
        diagnostics: [
          {
            kind: "artifact-provider-duplicate",
            artifact: { id: "artifact:foundation.mesh", name: "foundationMesh" },
            providers: [endpoint, endpoint],
            consumer: endpoint,
          },
        ],
      })
    ).toBe(false);
  });

  it("rejects a duplicate-provider diagnostic without two providers", () => {
    const canonical = canonicalRecipeDag();

    expect(
      Value.Check(RecipeDagResultSchema, {
        ...canonical,
        diagnostics: [
          {
            kind: "artifact-provider-duplicate",
            artifact: { id: "artifact:foundation.mesh", name: "foundationMesh" },
            providers: [],
            consumers: [],
          },
        ],
      })
    ).toBe(false);
  });
});
