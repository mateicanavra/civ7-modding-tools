import { describe, expect, it } from "bun:test";

import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 1, height: 1 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;

describe("hydrography artifact", () => {
  it("refuses nonbinary outlets and unknown terminal classes", () => {
    const payload = {
      runoff: new Float32Array(SYNTHETIC_CARDINALITY),
      discharge: new Float32Array(SYNTHETIC_CARDINALITY),
      riverClass: new Uint8Array(SYNTHETIC_CARDINALITY),
      flowDir: new Int32Array(SYNTHETIC_CARDINALITY).fill(-1),
      sinkMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      outletMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      terminalType: new Uint8Array(SYNTHETIC_CARDINALITY),
    };
    payload.outletMask[0] = 2;
    payload.terminalType[0] = 3;

    const messages = hydrologyHydrographyArtifactModules.hydrography
      .validate(payload, { dimensions: SYNTHETIC_DIMENSIONS })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("outletMask"))).toBe(true);
    expect(messages.some((message) => message.includes("terminalType"))).toBe(true);
  });
});
