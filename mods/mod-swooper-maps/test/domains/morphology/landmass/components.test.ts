import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/router";
import {
  runAdmittedOperationForTest,
  validateSchemaValueForTest,
} from "@swooper/mapgen-core/testing";

const { computeLandmasses } = morphologyDomain.landforms.ops;

describe("morphology operations", () => {
  it("computes landmass components and validates output", () => {
    const syntheticDimensions = { width: 4, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const landMask = new Uint8Array([1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1]);

    const result = runAdmittedOperationForTest(
      computeLandmasses,
      { width, height, landMask },
      { strategy: "wrapped-hex-components", config: {} }
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
