import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import {
  ArtifactDoublePublishError,
  ArtifactValidationError,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createMapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { publishTestArtifact, withMapContextExecutionForTest } from "@mapgen/testing/index.js";
import { Type } from "typebox";

const syntheticDimensions = { width: 2, height: 2 } as const;

const gridArtifact = defineArtifact({
  name: "testGrid",
  id: "artifact:test.testing-grid",
  schema: Type.Object({ values: Type.Any() }, { additionalProperties: false }),
});

const gridArtifactModule = {
  artifact: gridArtifact,
  validate: (
    value: unknown,
    context?: Readonly<{ dimensions?: Readonly<{ width: number; height: number }> }>
  ) => {
    const issues = [...validateArtifactSchema(gridArtifact.schema, value)];
    if (issues.length > 0) return issues;
    appendArtifactTypedArrayIssues(
      issues,
      "values",
      (value as { values: unknown }).values,
      Uint8Array,
      artifactCellCount(context)
    );
    return issues;
  },
};

function createSyntheticContext() {
  return createMapContext({
    setup: admitMapSetup({
      mapSeed: 7,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter: createMockAdapter(syntheticDimensions),
  });
}

describe("artifact testing surface", () => {
  it("uses production cardinality validation and write-once publication", () => {
    const context = createSyntheticContext();

    withMapContextExecutionForTest(context, () => {
      expect(() =>
        publishTestArtifact(context, gridArtifactModule, {
          values: new Uint8Array(3),
        })
      ).toThrow(
        expect.objectContaining({
          issues: [{ message: "Expected values length 4 (received 3)." }],
        })
      );

      const admitted = { values: new Uint8Array(4) };
      publishTestArtifact(context, gridArtifactModule, admitted);
      expect(context.artifacts.get(gridArtifact.id)).toBe(admitted);

      expect(() =>
        publishTestArtifact(context, gridArtifactModule, {
          values: new Uint8Array(4),
        })
      ).toThrow(ArtifactDoublePublishError);
    });

    const invalidContext = createSyntheticContext();
    expect(() =>
      withMapContextExecutionForTest(invalidContext, () =>
        publishTestArtifact(invalidContext, gridArtifactModule, {
          values: new Int8Array(4) as unknown as Uint8Array,
        })
      )
    ).toThrow(ArtifactValidationError);
  });
});
