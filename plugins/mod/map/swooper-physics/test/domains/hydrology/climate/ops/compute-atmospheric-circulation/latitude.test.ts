import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";
import {
  deriveTestOperationSeed,
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SIZE,
} from "../../../../../setup.js";

const { computeAtmosphericCirculation } = hydrologyOpsPublic.climate.ops;
const { width: WIDTH, height: HEIGHT } = TEST_MAP_SIZE.dimensions;
const OPERATION_SEED = deriveTestOperationSeed(
  "test:hydrology:atmospheric-circulation:latitude"
);
const LATITUDE_CONFIG = {
  windJetStreaks: 3,
  windJetStrength: 1,
  windVariance: 0.6,
} as const;

function latitudeRamp(): Float32Array {
  const latitudeByRow = new Float32Array(HEIGHT);
  const { topLatitude, bottomLatitude } = TEST_MAP_LATITUDE_BOUNDS;
  for (let row = 0; row < HEIGHT; row += 1) {
    latitudeByRow[row] =
      topLatitude + (bottomLatitude - topLatitude) * (row / Math.max(1, HEIGHT - 1));
  }
  return latitudeByRow;
}

function runLatitude(rngSeed: number): { windU: Int8Array; windV: Int8Array } {
  return computeAtmosphericCirculation.run(
    {
      width: WIDTH,
      height: HEIGHT,
      latitudeByRow: latitudeRamp(),
      rngSeed,
      pressureField: new Float32Array(WIDTH * HEIGHT),
    },
    { strategy: "latitude", config: LATITUDE_CONFIG }
  );
}

describe("hydrology/compute-atmospheric-circulation (latitude)", () => {
  it("derives stable row variation from the complete explicit seed", () => {
    const first = runLatitude(OPERATION_SEED);
    const repeated = runLatitude(OPERATION_SEED);
    const changedHighByte = runLatitude(OPERATION_SEED ^ 0x100);

    expect(first.windU).toEqual(repeated.windU);
    expect(first.windV).toEqual(repeated.windV);
    expect(changedHighByte.windU).not.toEqual(first.windU);
    expect(changedHighByte.windV).not.toEqual(first.windV);
  });
});
