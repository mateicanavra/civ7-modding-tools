import { describe, expect, it } from "bun:test";
import { artifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";

const { mesh } = artifacts;
const SYNTHETIC_CELL_COUNT = 3;

function validMesh() {
  return {
    cellCount: SYNTHETIC_CELL_COUNT,
    wrapWidth: 128,
    siteX: new Float32Array(SYNTHETIC_CELL_COUNT),
    siteY: new Float32Array(SYNTHETIC_CELL_COUNT),
    neighborsOffsets: new Int32Array(SYNTHETIC_CELL_COUNT + 1),
    neighbors: new Int32Array(SYNTHETIC_CELL_COUNT),
    areas: new Float32Array(SYNTHETIC_CELL_COUNT),
    bbox: { xl: 0, xr: 128, yt: 0, yb: 64 },
  };
}

function validationMessages(value: unknown): string {
  return mesh
    .validate(value)
    .map((issue) => issue.message)
    .join("\n");
}

describe("foundation mesh artifact", () => {
  it("requires a finite positive wrap width", () => {
    const valid = validMesh();
    expect(mesh.validate(valid)).toEqual([]);
    expect(validationMessages({ ...valid, wrapWidth: Number.NaN })).toContain("wrapWidth");
    expect(validationMessages({ ...valid, wrapWidth: 0 })).toContain("wrapWidth");
  });

  it("closes neighbor offsets over every mesh cell", () => {
    const valid = validMesh();
    expect(
      validationMessages({
        ...valid,
        neighborsOffsets: new Int32Array(SYNTHETIC_CELL_COUNT),
      })
    ).toContain("neighborsOffsets");
  });
});
