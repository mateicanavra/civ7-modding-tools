import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { ArtifactValidationError, implementArtifactModules } from "@swooper/mapgen-core/authoring";
import { artifactModules as baselineModules } from "../../../../../../../../src/recipes/standard/stages/hydrology-climate-baseline/artifacts/index.js";
import { artifactModules as refineModules } from "../../../../../../../../src/recipes/standard/stages/hydrology-climate-refine/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 2, height: 2 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;
const context = { dimensions: SYNTHETIC_DIMENSIONS } as const;

describe("Standard climate artifact vintages", () => {
  it("gives baseline and final-refined climate distinct immutable identities", () => {
    expect(baselineModules.baselineClimateField.artifact.id).toBe(
      "artifact:hydrology.baselineClimateField"
    );
    expect(refineModules.climateField.artifact.id).toBe("artifact:climateField");
    expect(baselineModules.baselineClimateField.artifact.id).not.toBe(
      refineModules.climateField.artifact.id
    );
  });

  it("rejects wrong typed-array classes, spatial drift, and out-of-domain rainfall", () => {
    for (const module of [baselineModules.baselineClimateField, refineModules.climateField]) {
      expect(
        module
          .validate(
            {
              rainfall: new Int16Array(SYNTHETIC_CARDINALITY),
              humidity: new Float32Array(SYNTHETIC_CARDINALITY),
            },
            context
          )
          .map((issue) => issue.message)
      ).toEqual(
        expect.arrayContaining([
          "Expected climate.rainfall to be Uint8Array.",
          "Expected climate.humidity to be Uint8Array.",
        ])
      );

      expect(
        module
          .validate(
            {
              rainfall: new Uint8Array([0, 1, 2, 201]),
              humidity: new Uint8Array(SYNTHETIC_CARDINALITY - 1),
            },
            context
          )
          .map((issue) => issue.message)
      ).toEqual(
        expect.arrayContaining([
          "Expected climate.rainfall[3] to be within 0..200 (received 201).",
          `Expected climate.humidity length ${SYNTHETIC_CARDINALITY} (received ${SYNTHETIC_CARDINALITY - 1}).`,
        ])
      );
    }
  });

  it("fails publication rather than coercing an out-of-domain producer result", () => {
    const runtime = implementArtifactModules([refineModules.climateField]);
    const mapContext = createMapContext({
      setup: admitMapSetup({
        mapSeed: 1,
        dimensions: SYNTHETIC_DIMENSIONS,
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      }),
      adapter: createMockAdapter(SYNTHETIC_DIMENSIONS),
    });

    expect(() =>
      runtime.climateField.publish(mapContext, {
        rainfall: new Uint8Array([0, 1, 200, 201]),
        humidity: new Uint8Array(SYNTHETIC_CARDINALITY),
      })
    ).toThrow(ArtifactValidationError);
  });
});
