import { describe, expect, it } from "bun:test";

import { artifactModules as standardArtifactModules } from "../../../../../../../src/recipes/standard/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 1, height: 1 } as const;
const SYNTHETIC_CARDINALITY = SYNTHETIC_DIMENSIONS.width * SYNTHETIC_DIMENSIONS.height;

describe("standard recipe artifact contracts", () => {
  it("validates volcanism as part of the projected foundation plates payload", () => {
    const payload = {
      id: new Int16Array(SYNTHETIC_CARDINALITY),
      boundaryCloseness: new Uint8Array(SYNTHETIC_CARDINALITY),
      boundaryType: new Uint8Array(SYNTHETIC_CARDINALITY),
      tectonicStress: new Uint8Array(SYNTHETIC_CARDINALITY),
      upliftPotential: new Uint8Array(SYNTHETIC_CARDINALITY),
      riftPotential: new Uint8Array(SYNTHETIC_CARDINALITY),
      shieldStability: new Uint8Array(SYNTHETIC_CARDINALITY),
      volcanism: new Uint8Array(SYNTHETIC_CARDINALITY),
      movementU: new Int8Array(SYNTHETIC_CARDINALITY),
      movementV: new Int8Array(SYNTHETIC_CARDINALITY),
      rotation: new Int8Array(SYNTHETIC_CARDINALITY),
    };

    const validationContext = { dimensions: SYNTHETIC_DIMENSIONS };

    expect(standardArtifactModules.foundationPlates.validate(payload, validationContext)).toEqual(
      []
    );

    const { volcanism: _volcanism, ...withoutVolcanism } = payload;
    expect(
      standardArtifactModules.foundationPlates
        .validate(withoutVolcanism, validationContext)
        .some((issue) => issue.message.includes("volcanism"))
    ).toBe(true);
  });
});
