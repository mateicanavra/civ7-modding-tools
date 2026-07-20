import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/ops";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const selection = { strategy: "default", config: {} } as const;

describe("compute-coastal-adjacency", () => {
  it("classifies both sides of a wrapped land-water shoreline", () => {
    const syntheticDimensions = { width: 4, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const landMask = Uint8Array.from([1, 1, 0, 0]);
    const result = runAdmittedOperationForTest(
      morphologyDomain.ops.computeCoastalAdjacency,
      { width, height, landMask },
      selection
    );

    expect(Array.from(result.coastalLand)).toEqual([1, 1, 0, 0]);
    expect(Array.from(result.coastalWater)).toEqual([0, 0, 1, 1]);
    expect(Array.from(landMask)).toEqual([1, 1, 0, 0]);
  });

  it("leaves a uniform land row without coastal tiles", () => {
    const syntheticDimensions = { width: 3, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const result = runAdmittedOperationForTest(
      morphologyDomain.ops.computeCoastalAdjacency,
      {
        width,
        height,
        landMask: Uint8Array.from([1, 1, 1]),
      },
      selection
    );

    expect(Array.from(result.coastalLand)).toEqual([0, 0, 0]);
    expect(Array.from(result.coastalWater)).toEqual([0, 0, 0]);
  });
});
