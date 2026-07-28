import { describe, expect, it } from "bun:test";
import {
  buildRecipeDag,
  type CompletionId,
  createStage,
  createStep,
  defineArtifact,
  defineStep,
} from "@mapgen/authoring/index.js";

import { Type } from "typebox";

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false, default: {} });
const EXTERNAL_READY = "completion:test.external-ready" as const satisfies CompletionId;

const sourceArtifact = defineArtifact({
  name: "sourceArtifact",
  id: "artifact:test.source",
  schema: Type.Object({}, { additionalProperties: false }),
});

const internalArtifact = defineArtifact({
  name: "internalArtifact",
  id: "artifact:test.internal",
  schema: Type.Object({}, { additionalProperties: false }),
});

const terminalArtifact = defineArtifact({
  name: "terminalArtifact",
  id: "artifact:test.terminal",
  schema: Type.Object({}, { additionalProperties: false }),
});

const missingArtifact = defineArtifact({
  name: "missingArtifact",
  id: "artifact:test.missing",
  schema: Type.Object({}, { additionalProperties: false }),
});

function step(input: {
  id: string;
  requires?: readonly ReturnType<typeof defineArtifact>[];
  provides?: readonly ReturnType<typeof defineArtifact>[];
  completionRequires?: readonly CompletionId[];
  completionProvides?: readonly CompletionId[];
}) {
  const requires = input.requires ?? [];
  const provides = input.provides ?? [];
  const contract = defineStep({
    id: input.id,
    requires: [...(input.completionRequires ?? []), ...requires],
    provides: [...(input.completionProvides ?? []), ...provides],
  });
  return createStep(contract, { run: () => {} });
}

function stage(id: string, steps: readonly ReturnType<typeof step>[]) {
  return createStage({
    id,
    knobsSchema: EmptyKnobsSchema,
    steps,
  });
}

describe("recipe DAG authoring model", () => {
  it("rejects duplicate stage identities before accumulating graph nodes", () => {
    const duplicate = stage("foundation", [step({ id: "produce-source" })]);

    expect(() => buildRecipeDag({ recipeId: "duplicate", stages: [duplicate, duplicate] })).toThrow(
      'duplicate stage id "foundation"'
    );
  });

  it("builds stage nodes and artifact edges from authored artifact contracts", () => {
    const stages = [
      stage("source-stage", [
        step({
          id: "produce-source",
          provides: [sourceArtifact],
          completionProvides: [EXTERNAL_READY],
        }),
        step({
          id: "consume-internal",
          requires: [internalArtifact],
          completionRequires: [EXTERNAL_READY],
        }),
      ]),
      stage("target-stage", [
        step({
          id: "produce-internal",
          provides: [internalArtifact],
        }),
        step({
          id: "consume-source",
          requires: [sourceArtifact],
          provides: [terminalArtifact],
        }),
      ]),
    ];

    const dag = buildRecipeDag({
      namespace: "test-mod",
      recipeId: "standard",
      stages,
    });

    expect(dag.recipeKey).toBe("test-mod/standard");
    expect(dag.stages.map((node) => node.stageId)).toEqual(["source-stage", "target-stage"]);
    const completionMetadata = dag.stages
      .flatMap((stage) => stage.steps)
      .filter((step) => step.completionRequires.length > 0 || step.completionProvides.length > 0)
      .map((step) => ({
        stepId: step.stepId,
        completionRequires: step.completionRequires,
        completionProvides: step.completionProvides,
      }));
    expect(completionMetadata).toEqual([
      {
        stepId: "produce-source",
        completionRequires: [],
        completionProvides: [EXTERNAL_READY],
      },
      {
        stepId: "consume-internal",
        completionRequires: [EXTERNAL_READY],
        completionProvides: [],
      },
    ]);
    expect(
      dag.edges.map((edge) => ({
        artifact: edge.artifact.id,
        from: edge.from.fullStepId,
        to: edge.to.fullStepId,
        internal: edge.internal,
      }))
    ).toEqual([
      {
        artifact: "artifact:test.internal",
        from: "test-mod.standard.target-stage.produce-internal",
        to: "test-mod.standard.source-stage.consume-internal",
        internal: false,
      },
      {
        artifact: "artifact:test.source",
        from: "test-mod.standard.source-stage.produce-source",
        to: "test-mod.standard.target-stage.consume-source",
        internal: false,
      },
    ]);
    expect(dag.stages[0]).toMatchObject({
      inboundArtifactEdgeCount: 1,
      outboundArtifactEdgeCount: 1,
      internalArtifactEdgeCount: 0,
    });
    expect(dag.stages[1]).toMatchObject({
      inboundArtifactEdgeCount: 1,
      outboundArtifactEdgeCount: 1,
      diagnosticCount: 1,
    });
    expect(dag.diagnostics).toEqual([
      {
        kind: "artifact-consumer-missing",
        artifact: { id: "artifact:test.terminal", name: "terminalArtifact" },
        provider: {
          stageId: "target-stage",
          stepId: "consume-source",
          fullStepId: "test-mod.standard.target-stage.consume-source",
        },
      },
    ]);
  });

  it("keeps same-stage artifact dependencies visible as internal edges", () => {
    const stages = [
      stage("foundation", [
        step({
          id: "produce-source",
          provides: [sourceArtifact],
        }),
        step({
          id: "consume-source",
          requires: [sourceArtifact],
        }),
      ]),
    ];

    const dag = buildRecipeDag({ recipeId: "mini", stages });

    expect(dag.edges).toHaveLength(1);
    expect(dag.edges[0]).toMatchObject({
      artifact: { id: "artifact:test.source", name: "sourceArtifact" },
      internal: true,
    });
    expect(dag.stages[0]).toMatchObject({
      inboundArtifactEdgeCount: 0,
      outboundArtifactEdgeCount: 0,
      internalArtifactEdgeCount: 1,
    });
  });

  it("reports missing and duplicate artifact providers without inventing edges", () => {
    const stages = [
      stage("alpha", [
        step({
          id: "produce-a",
          provides: [sourceArtifact],
        }),
      ]),
      stage("beta", [
        step({
          id: "produce-b",
          provides: [sourceArtifact],
        }),
        step({
          id: "consume-missing",
          requires: [missingArtifact],
        }),
        step({
          id: "consume-duplicate",
          requires: [sourceArtifact],
        }),
      ]),
    ];

    const dag = buildRecipeDag({ recipeId: "diagnostic", stages });

    expect(dag.edges).toEqual([]);
    expect(dag.diagnostics.map((diagnostic) => diagnostic.kind)).toEqual([
      "artifact-provider-missing",
      "artifact-provider-duplicate",
    ]);
    expect(dag.stages.map((node) => [node.stageId, node.diagnosticCount])).toEqual([
      ["alpha", 1],
      ["beta", 3],
    ]);
  });
});
