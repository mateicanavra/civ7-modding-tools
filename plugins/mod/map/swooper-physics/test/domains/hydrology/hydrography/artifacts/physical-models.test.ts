import { describe, expect, it } from "bun:test";
import { artifacts } from "../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";

const dimensions = { width: 3, height: 1 };
function certifiedLake() {
  return {
    model: "certified-sill-spill" as const, ...dimensions,
    lakeMask: Uint8Array.of(0, 1, 0), plannedLakeTileCount: 1,
    bodyId: Int32Array.of(0, 1, 0), waterSurface: Int16Array.of(-1, 2, 2),
    bodies: [{
      nodeId: 1, wetCells: [1], floorCell: 1, floorElevation: 0, spillElevation: 2,
      outletCell: 1, receiverCell: 0, connectorCells: [],
      flux: { incomingOverflow: 0, dryRunoff: 0, wetPrecipitation: 30, wetDemand: 10, balance: 20 }, outflow: 20,
    }],
    certificates: [{ nodeId: 1, spillBalance: 20 }],
    marineExits: [{ fromCell: 1, marineCell: 0, discharge: 20 }],
    conservation: { dryRunoff: 0, wetPrecipitation: 30, wetDemand: 10, externalDischarge: 20, residual: 0, roundoffBound: Number.EPSILON },
  };
}
describe("model-discriminated physical water artifacts", () => {
  it("admits exact body evidence and refuses clipped membership, contradictory outflow, or exceeded conservation", () => {
    const valid = certifiedLake();
    expect(artifacts.lakePlan.validate(valid, { dimensions })).toEqual([]);
    const clipped = certifiedLake(); clipped.lakeMask[1] = 0; clipped.plannedLakeTileCount = 0;
    expect(artifacts.lakePlan.validate(clipped, { dimensions }).length).toBeGreaterThan(0);
    const ledger = certifiedLake(); ledger.bodies[0]!.outflow = 0;
    expect(artifacts.lakePlan.validate(ledger, { dimensions }).length).toBeGreaterThan(0);
    const residual = certifiedLake(); residual.conservation.residual = 1;
    expect(artifacts.lakePlan.validate(residual, { dimensions }).length).toBeGreaterThan(0);
    expect(artifacts.lakePlan.validate({ ...valid, sinkLakeCount: 1 }, { dimensions }).length).toBeGreaterThan(0);
  });

  it("retains Number precision without admitting legacy conditioning fields or missing grid entries", () => {
    const value = {
      model: "certified-sill-spill" as const,
      runoff: [0, 0, 1 + 2 ** -26], discharge: [0, 0, 1 + 2 ** -26],
      riverClass: Uint8Array.of(0, 0, 1), flowDir: Int32Array.of(-1, 0, 1),
      basinId: Int32Array.of(-1, 2, 2), terminalType: Uint8Array.of(0, 1, 0),
    };
    expect(artifacts.hydrography.validate(value, { dimensions })).toEqual([]);
    expect(value.runoff[2]).not.toBe(Math.fround(value.runoff[2]!));
    expect(artifacts.hydrography.validate({ ...value, discharge: [0] }, { dimensions }).length).toBeGreaterThan(0);
    expect(artifacts.hydrography.validate({ ...value, routingElevation: new Float32Array(3) }, { dimensions }).length).toBeGreaterThan(0);
    expect(artifacts.hydrography.validate({ ...value, runoff: [0, 0, NaN] }, { dimensions }).length).toBeGreaterThan(0);
  });
});
