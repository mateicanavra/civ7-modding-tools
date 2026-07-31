import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";

import {
  measureStandardLakeProjection,
  StandardLakeProjectionMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/lake-projection.js";

describe("Standard lake-projection measurements", () => {
  it("admits historical v1 records without the additive fragment diagnostic", () => {
    expect(
      Value.Check(StandardLakeProjectionMeasurementsSchema, {
        version: 1,
        plannedLakeTileCount: 4,
        morphologyProtectedLakeTileCount: 1,
        stampedLakeTileCount: 3,
        rejectedLakeTileCount: 0,
        nonLakeTileCount: 0,
        terrainMismatchTileCount: 0,
        components: {
          componentCount: 1,
          largestComponentSize: 3,
          maximumComponentDiameter: 2,
          singleTileComponentCount: 0,
        },
      })
    ).toBe(true);
  });

  it("emits isolated-fragment evidence for current v1 measurements", () => {
    const measurement = measureStandardLakeProjection({
      dimensions: { width: 3, height: 1 },
      projectedLakeMask: new Uint8Array([1, 1, 0]),
      plannedLakeTileCount: 3,
      morphologyProtectedLakeTileCount: 1,
      isolatedFragmentProtectedLakeTileCount: 1,
      stampedLakeTileCount: 2,
      rejectedLakeTileCount: 0,
      nonLakeTileCount: 0,
      terrainMismatchTileCount: 0,
    });

    expect(measurement.isolatedFragmentProtectedLakeTileCount).toBe(1);
    expect(Value.Check(StandardLakeProjectionMeasurementsSchema, measurement)).toBe(true);
  });
});
