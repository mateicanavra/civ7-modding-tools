import { describe, expect, it } from "bun:test";
import { artifacts as hydrographyArtifacts } from "../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const dimensions = TEST_MAP_SIZE.dimensions;
const cellCount = dimensions.width * dimensions.height;

describe("hydrography artifact", () => {
  it("refuses nonbinary outlets and unknown terminal classes", () => {
    const payload = {
      runoff: new Float32Array(cellCount),
      discharge: new Float32Array(cellCount),
      riverClass: new Uint8Array(cellCount),
      flowDir: new Int32Array(cellCount).fill(-1),
      sinkMask: new Uint8Array(cellCount),
      outletMask: new Uint8Array(cellCount),
      basinId: new Int32Array(cellCount).fill(-1),
      routingElevation: new Float32Array(cellCount),
      depressionDepth: new Float32Array(cellCount),
      terminalType: new Uint8Array(cellCount),
    };
    payload.outletMask[0] = 2;
    payload.terminalType[0] = 3;

    const messages = hydrographyArtifacts.hydrography
      .validate(payload, { dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("outletMask"))).toBe(true);
    expect(messages.some((message) => message.includes("terminalType"))).toBe(true);
  });
});
