import { describe, expect, it } from "bun:test";
import { artifactModules as foundationArtifactModules } from "@mapgen/domain/foundation/artifacts";

const { plateMotion } = foundationArtifactModules;
const SYNTHETIC_CELL_COUNT = 3;
const SYNTHETIC_PLATE_COUNT = 2;

function validPlateMotion() {
  return {
    version: 1,
    cellCount: SYNTHETIC_CELL_COUNT,
    plateCount: SYNTHETIC_PLATE_COUNT,
    plateCenterX: new Float32Array(SYNTHETIC_PLATE_COUNT),
    plateCenterY: new Float32Array(SYNTHETIC_PLATE_COUNT),
    plateVelocityX: new Float32Array(SYNTHETIC_PLATE_COUNT),
    plateVelocityY: new Float32Array(SYNTHETIC_PLATE_COUNT),
    plateOmega: new Float32Array(SYNTHETIC_PLATE_COUNT),
    plateFitRms: new Float32Array(SYNTHETIC_PLATE_COUNT),
    plateFitP90: new Float32Array(SYNTHETIC_PLATE_COUNT),
    plateQuality: new Uint8Array(SYNTHETIC_PLATE_COUNT),
    cellFitError: new Uint8Array(SYNTHETIC_CELL_COUNT),
  };
}

function validationMessages(value: unknown): string {
  return plateMotion
    .validate(value)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation plate-motion artifact", () => {
  it("closes every plate-indexed field over plateCount", () => {
    const valid = validPlateMotion();
    expect(plateMotion.validate(valid)).toEqual([]);

    expect(
      validationMessages({
        ...valid,
        plateVelocityX: new Float32Array(SYNTHETIC_PLATE_COUNT - 1),
      })
    ).toContain("plateVelocityX");
    expect(
      validationMessages({
        ...valid,
        plateQuality: new Uint8Array(SYNTHETIC_PLATE_COUNT + 1),
      })
    ).toContain("plateQuality");
  });
});
