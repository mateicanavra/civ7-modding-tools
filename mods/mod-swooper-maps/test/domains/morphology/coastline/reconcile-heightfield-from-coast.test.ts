import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/ops";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const selection = { strategy: "default", config: {} } as const;

describe("reconcile-heightfield-from-coast", () => {
  it("aligns class, elevation, and bathymetry without mutating inputs", () => {
    const syntheticDimensions = { width: 4, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const landMask = Uint8Array.from([1, 1, 0, 0]);
    const coastMask = Uint8Array.from([0, 0, 1, 0]);
    const elevation = Int16Array.from([5, -3, 2, -1]);

    const result = runAdmittedOperationForTest(
      morphologyDomain.ops.reconcileHeightfieldFromCoast,
      {
        width,
        height,
        landMask,
        coastMask,
        elevation,
        seaLevel: 0,
      },
      selection
    );

    expect(Array.from(result.landMask)).toEqual([1, 1, 0, 0]);
    expect(Array.from(result.elevation)).toEqual([5, 1, 0, -1]);
    expect(Array.from(result.bathymetry)).toEqual([0, 0, 0, -1]);
    expect(Array.from(elevation)).toEqual([5, -3, 2, -1]);
    expect(Array.from(landMask)).toEqual([1, 1, 0, 0]);
    expect(Array.from(coastMask)).toEqual([0, 0, 1, 0]);
  });
});
