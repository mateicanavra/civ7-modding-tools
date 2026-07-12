import { describe, expect, it } from "bun:test";

import {
  FOUNDATION_TECTONIC_HISTORY_TILES_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_PROVENANCE_TILES_ARTIFACT_TAG,
} from "@swooper/mapgen-core";

import { validators as standardArtifactValidators } from "../../../../src/recipes/standard/artifacts/index.js";
import { mapArtifacts } from "../../../../src/recipes/standard/map-artifacts.js";

describe("standard recipe artifact contracts", () => {
  it("validates volcanism as part of the projected foundation plates payload", () => {
    const payload = {
      id: new Int16Array(1),
      boundaryCloseness: new Uint8Array(1),
      boundaryType: new Uint8Array(1),
      tectonicStress: new Uint8Array(1),
      upliftPotential: new Uint8Array(1),
      riftPotential: new Uint8Array(1),
      shieldStability: new Uint8Array(1),
      volcanism: new Uint8Array(1),
      movementU: new Int8Array(1),
      movementV: new Int8Array(1),
      rotation: new Int8Array(1),
    };

    const validationContext = { dimensions: { width: 1, height: 1 } };

    expect(standardArtifactValidators.foundationPlates(payload, validationContext)).toEqual([]);

    const { volcanism: _volcanism, ...withoutVolcanism } = payload;
    expect(
      standardArtifactValidators
        .foundationPlates(withoutVolcanism, validationContext)
        .some((issue) => issue.message.includes("volcanism"))
    ).toBe(true);
  });

  it("publishes canonical map-facing foundation artifact ids", () => {
    expect(mapArtifacts.foundationTectonicHistoryTiles.id).toBe(
      FOUNDATION_TECTONIC_HISTORY_TILES_ARTIFACT_TAG
    );
    expect(mapArtifacts.foundationTectonicProvenanceTiles.id).toBe(
      FOUNDATION_TECTONIC_PROVENANCE_TILES_ARTIFACT_TAG
    );
  });
});
