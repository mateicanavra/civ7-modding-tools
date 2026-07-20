import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/ops";
import {
  runAdmittedOperationForTest,
  validateSchemaValueForTest,
} from "@swooper/mapgen-core/testing";

const { computeLandmasses } = morphologyDomain.ops;

describe("morphology operations", () => {
  it("computes landmass components and validates output", () => {
    const syntheticDimensions = { width: 4, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const landMask = new Uint8Array([1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1]);

    const result = runAdmittedOperationForTest(
      computeLandmasses,
      { width, height, landMask },
      { strategy: "default", config: {} }
    );

    validateSchemaValueForTest(
      computeLandmasses.output,
      result,
      "/ops/morphology/compute-landmasses/output"
    );
    expect(result.landmasses.length).toBeGreaterThan(0);
    expect(result.landmassIdByTile.length).toBe(width * height);
    expect(result.landmassIdByTile[2]).toBe(-1);
  });
});
