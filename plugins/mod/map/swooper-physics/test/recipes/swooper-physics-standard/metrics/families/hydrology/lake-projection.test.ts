import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";

import {
  measureStandardLakeProjection,
  StandardLakeProjectionMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/lake-projection.js";

describe("Standard lake-projection measurements", () => {
  it("rejects retired suppression evidence in the closed measurement record", () => {
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
    ).toBe(false);
  });

  it("emits complete projection topology and native outcome evidence", () => {
    const measurement = measureStandardLakeProjection({
      dimensions: { width: 3, height: 1 },
      projectedLakeMask: new Uint8Array([1, 1, 0]),
      plannedLakeTileCount: 2,
      stampedLakeTileCount: 2,
      rejectedLakeTileCount: 0,
      nonLakeTileCount: 0,
      terrainMismatchTileCount: 0,
    });

    expect(measurement).toMatchObject({ plannedLakeTileCount: 2, stampedLakeTileCount: 2,
      rejectedLakeTileCount: 0, nonLakeTileCount: 0, terrainMismatchTileCount: 0,
      components: { componentCount: 1, largestComponentSize: 2, singleTileComponentCount: 0 } });
    expect(Value.Check(StandardLakeProjectionMeasurementsSchema, measurement)).toBe(true);
  });
});
