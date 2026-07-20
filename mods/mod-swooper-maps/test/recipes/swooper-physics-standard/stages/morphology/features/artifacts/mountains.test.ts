import { describe, expect, it } from "bun:test";

import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 1, height: 1 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;

describe("morphology-features mountains artifact", () => {
  it("refuses nonbinary mountain-region membership", () => {
    const payload = {
      mountainMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      mountainRegionMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      mountainRegionIdByTile: new Int32Array(SYNTHETIC_CARDINALITY).fill(-1),
      hillMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      foothillMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      roughLandMask: new Uint8Array(SYNTHETIC_CARDINALITY),
      orogenyPotential: new Uint8Array(SYNTHETIC_CARDINALITY),
      fracturePotential: new Uint8Array(SYNTHETIC_CARDINALITY),
      roughnessPotential: new Uint8Array(SYNTHETIC_CARDINALITY),
    };
    payload.mountainRegionMask[0] = 2;

    expect(
      morphologyArtifactModules.mountains
        .validate(payload, { dimensions: SYNTHETIC_DIMENSIONS })
        .some((issue) => issue.message.includes("mountainRegionMask"))
    ).toBe(true);
  });
});
