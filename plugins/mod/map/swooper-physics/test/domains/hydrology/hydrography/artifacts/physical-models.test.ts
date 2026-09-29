import { describe, expect, it } from "bun:test";
import { artifacts } from "../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import {
  hugeRoot17,
  standardRoots37And39,
} from "../ops/compute-basin-network/fixtures/retained-fixtures.js";

const { computeBasinNetwork: network, computeDrainageBasins: geometry } = hydrology.hydrography.ops;

const dimensions = { width: 3, height: 1 };
function certifiedLake(input = hugeRoot17()) {
  const result = network.run(input, network.defaultConfig);
  if (result.status !== "supported") throw new Error(JSON.stringify(result));
  const {
    wetMask,
    receiver: _receiver,
    terminalId: _terminalId,
    terminalType: _terminalType,
    dryDischarge: _dryDischarge,
    ...records
  } = result.plan;
  return {
    model: "certified-sill-spill" as const,
    width: input.width,
    height: input.height,
    lakeMask: wetMask,
    plannedLakeTileCount: wetMask.reduce((sum, wet) => sum + wet, 0),
    ...records,
  };
}
describe("model-discriminated physical water artifacts", () => {
  it("preserves the exact binary64 representative inside a zero interval", () => {
    const terrain = {
      width: 6,
      height: 1,
      elevation: Int16Array.of(-1, 5, 0, 1, 6, -1),
      landMask: Uint8Array.of(0, 1, 1, 1, 1, 0),
    };
    const value = certifiedLake({
      ...terrain,
      geometry: geometry.run(terrain, {
        strategy: "plateau-saddle-hierarchy",
        config: { allowExternalEdgeOutlets: false },
      }),
      localRunoff: Array.from(terrain.landMask),
      rainfall: new Uint8Array(6),
      potentialDemand: Float32Array.of(0, 0, 1, 0, 0, 0),
    });
    expect(value.waterSurface[2]).toBe(Number.MIN_VALUE);
    expect(artifacts.lakePlan.validate(value, { dimensions: terrain })).toEqual([]);
    const rounded = structuredClone(value);
    rounded.waterSurface[2] = 0;
    expect(artifacts.lakePlan.validate(rounded, { dimensions: terrain }).length).toBeGreaterThan(0);
  });
  it("admits exact body evidence and refuses clipped membership, contradictory outflow, or exceeded conservation", () => {
    const valid = certifiedLake();
    const dimensions = { width: valid.width, height: valid.height };
    expect(artifacts.lakePlan.validate(valid, { dimensions })).toEqual([]);
    const clipped = certifiedLake();
    clipped.lakeMask[43] = 0;
    clipped.plannedLakeTileCount = 0;
    expect(artifacts.lakePlan.validate(clipped, { dimensions }).length).toBeGreaterThan(0);
    const ledger = certifiedLake();
    ledger.bodies[0]!.outflow = 1;
    expect(artifacts.lakePlan.validate(ledger, { dimensions }).length).toBeGreaterThan(0);
    const residual = certifiedLake();
    residual.conservation.residual = 1;
    expect(artifacts.lakePlan.validate(residual, { dimensions }).length).toBeGreaterThan(0);
    expect(
      artifacts.lakePlan.validate({ ...valid, sinkLakeCount: 1 }, { dimensions }).length
    ).toBeGreaterThan(0);
    expect(
      artifacts.lakePlan.validate({ ...valid, certificates: [] }, { dimensions }).length
    ).toBeGreaterThan(0);
    expect(
      artifacts.lakePlan.validate(
        { ...valid, waterSurface: new Int16Array(valid.waterSurface) },
        { dimensions }
      ).length
    ).toBeGreaterThan(0);
    const short = certifiedLake();
    short.waterSurface.pop();
    expect(artifacts.lakePlan.validate(short, { dimensions }).length).toBeGreaterThan(0);
    const nan = certifiedLake();
    nan.waterSurface[43] = NaN;
    expect(artifacts.lakePlan.validate(nan, { dimensions }).length).toBeGreaterThan(0);
    const hidden = certifiedLake();
    hidden.pools[0]!.unresolvedResidual = 0;
    expect(artifacts.lakePlan.validate(hidden, { dimensions }).length).toBeGreaterThan(0);
  });

  it("admits signed inward reservoir support without old outward-only certificates", () => {
    const valid = certifiedLake(standardRoots37And39());
    const dimensions = { width: valid.width, height: valid.height };
    expect(
      valid.transfers.find((edge) => edge.cellA === 228 && edge.cellB === 312)!.signedDischarge
    ).toBeLessThan(0);
    expect(artifacts.lakePlan.validate(valid, { dimensions })).toEqual([]);
    const duplicate = structuredClone(valid);
    duplicate.components[0]!.memberCells.push(312);
    expect(artifacts.lakePlan.validate(duplicate, { dimensions }).length).toBeGreaterThan(0);
    const edge = structuredClone(valid);
    edge.transfers[0]!.bodyA = 999;
    expect(artifacts.lakePlan.validate(edge, { dimensions }).length).toBeGreaterThan(0);
  });

  it("retains Number precision without admitting legacy conditioning fields or missing grid entries", () => {
    const value = {
      model: "certified-sill-spill" as const,
      runoff: [0, 0, 1 + 2 ** -26],
      discharge: [0, 0, 1 + 2 ** -26],
      riverClass: Uint8Array.of(0, 0, 1),
      flowDir: Int32Array.of(-1, 0, 1),
      basinId: Int32Array.of(-1, 2, 2),
      terminalType: Uint8Array.of(0, 1, 0),
    };
    expect(artifacts.hydrography.validate(value, { dimensions })).toEqual([]);
    expect(value.runoff[2]).not.toBe(Math.fround(value.runoff[2]!));
    expect(
      artifacts.hydrography.validate({ ...value, discharge: [0] }, { dimensions }).length
    ).toBeGreaterThan(0);
    expect(
      artifacts.hydrography.validate(
        { ...value, routingElevation: new Float32Array(3) },
        { dimensions }
      ).length
    ).toBeGreaterThan(0);
    expect(
      artifacts.hydrography.validate({ ...value, runoff: [0, 0, NaN] }, { dimensions }).length
    ).toBeGreaterThan(0);
  });
});
