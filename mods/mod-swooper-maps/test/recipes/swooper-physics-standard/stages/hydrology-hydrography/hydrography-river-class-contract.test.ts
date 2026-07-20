import { describe, expect, it } from "bun:test";
import { isMajorRiverClass } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { validators as hydrologyHydrographyArtifactValidators } from "../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";

describe("hydrography river class contract", () => {
  it("validates river classes as u8 intent with >=2 major/projectable", () => {
    const payload = {
      runoff: new Float32Array(4),
      discharge: new Float32Array(4),
      riverClass: new Uint8Array([0, 1, 2, 3]),
      flowDir: new Int32Array(4).fill(-1),
      sinkMask: new Uint8Array(4),
      outletMask: new Uint8Array(4),
    };

    expect(
      hydrologyHydrographyArtifactValidators.hydrography(payload, { width: 4, height: 1 })
    ).toEqual([]);
    expect(isMajorRiverClass(payload.riverClass[3])).toBe(true);
  });
});
