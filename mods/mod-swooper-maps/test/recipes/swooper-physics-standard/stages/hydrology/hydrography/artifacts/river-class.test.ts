import { describe, expect, it } from "bun:test";
import { isMajorRiverClass } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 4, height: 1 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;

describe("hydrography river class contract", () => {
  it("validates river classes as u8 intent with >=2 major/projectable", () => {
    const payload = {
      runoff: new Float32Array(SYNTHETIC_CARDINALITY),
      discharge: new Float32Array(SYNTHETIC_CARDINALITY),
      riverClass: new Uint8Array([0, 1, 2, 3]),
      flowDir: new Int32Array(SYNTHETIC_CARDINALITY).fill(-1),
      sinkMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      outletMask: new Uint8Array(SYNTHETIC_CARDINALITY),
    };

    expect(
      hydrologyHydrographyArtifactModules.hydrography.validate(payload, {
        dimensions: SYNTHETIC_DIMENSIONS,
      })
    ).toEqual([]);
    expect(isMajorRiverClass(payload.riverClass[3])).toBe(true);
  });
});
