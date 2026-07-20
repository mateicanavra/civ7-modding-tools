import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/ops";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const selection = { strategy: "default", config: {} } as const;

describe("compute-distance-to-coast", () => {
  it("finds the nearest coastal seed across the wrapped map edge", () => {
    const syntheticDimensions = { width: 4, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const result = runAdmittedOperationForTest(
      morphologyDomain.ops.computeDistanceToCoast,
      {
        width,
        height,
        coastal: Uint8Array.from([1, 0, 0, 0]),
      },
      selection
    );

    expect(Array.from(result.distanceToCoast)).toEqual([0, 1, 2, 1]);
  });

  it("selects the nearest of multiple coastal seeds", () => {
    const syntheticDimensions = { width: 5, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const result = runAdmittedOperationForTest(
      morphologyDomain.ops.computeDistanceToCoast,
      {
        width,
        height,
        coastal: Uint8Array.from([1, 0, 0, 0, 1]),
      },
      selection
    );

    expect(Array.from(result.distanceToCoast)).toEqual([0, 1, 2, 1, 0]);
  });

  it("uses the unreachable sentinel when no coast exists", () => {
    const syntheticDimensions = { width: 3, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const result = runAdmittedOperationForTest(
      morphologyDomain.ops.computeDistanceToCoast,
      {
        width,
        height,
        coastal: Uint8Array.from([0, 0, 0]),
      },
      selection
    );

    expect(Array.from(result.distanceToCoast)).toEqual([65535, 65535, 65535]);
  });
});
