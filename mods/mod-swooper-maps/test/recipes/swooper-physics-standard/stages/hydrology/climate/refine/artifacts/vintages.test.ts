import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { ArtifactValidationError } from "@swooper/mapgen-core/authoring";
import { publishTestArtifact, withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";

const SYNTHETIC_DIMENSIONS = { width: 2, height: 2 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;
const context = { dimensions: SYNTHETIC_DIMENSIONS } as const;

describe("Standard climate artifact vintages", () => {
  it("gives baseline and final-refined climate distinct immutable identities", () => {
    expect(hydrologyArtifacts.baselineClimateField.id).toBe(
      "artifact:hydrology.baselineClimateField"
    );
    expect(hydrologyArtifacts.climateField.id).toBe("artifact:hydrology.climateField");
    expect(hydrologyArtifacts.baselineClimateField.id).not.toBe(hydrologyArtifacts.climateField.id);
  });

  it("rejects rainfall outside the Standard climate range", () => {
    for (const artifact of [
      hydrologyArtifacts.baselineClimateField,
      hydrologyArtifacts.climateField,
    ]) {
      expect(
        artifact
          .validate(
            {
              rainfall: new Uint8Array([0, 1, 200, 201]),
              humidity: new Uint8Array(SYNTHETIC_CARDINALITY),
            },
            context
          )
          .map((issue) => issue.message)
      ).toEqual(
        expect.arrayContaining(["Expected climate.rainfall[3] to be within 0..200 (received 201)."])
      );
    }
  });

  it("fails publication rather than coercing an out-of-domain producer result", () => {
    const mapContext = createMapContext({
      setup: admitMapSetup({
        mapSeed: 1,
        dimensions: SYNTHETIC_DIMENSIONS,
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      }),
      adapter: createMockAdapter(SYNTHETIC_DIMENSIONS),
    });

    expect(() =>
      withMapContextExecutionForTest(mapContext, (stepContext) =>
        publishTestArtifact(stepContext, hydrologyArtifacts.climateField, {
          rainfall: new Uint8Array([0, 1, 200, 201]),
          humidity: new Uint8Array(SYNTHETIC_CARDINALITY),
        })
      )
    ).toThrow(ArtifactValidationError);
  });
});
