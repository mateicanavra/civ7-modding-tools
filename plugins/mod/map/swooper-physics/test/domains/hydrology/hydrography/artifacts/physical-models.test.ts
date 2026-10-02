import { describe, expect, it } from "bun:test";
import { artifacts } from "../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import {
  desertHugeRoot19,
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
    exposedLandMask: _exposedLandMask,
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
describe("certified physical water artifacts", () => {
  it("admits Desert root19's complete body and component despite binary64 delivery regrouping", () => {
    const input = desertHugeRoot19(), value = certifiedLake(input);
    const dimensions = { width: value.width, height: value.height };
    expect(value.plannedLakeTileCount).toBe(14);
    expect(value.pools[0]!.catchmentCells).toHaveLength(44);
    const barrierCells = value.pools[0]!.catchmentCells.filter(cell => input.elevation[cell] === 1000);
    expect(barrierCells).toHaveLength(2);
    for (const cell of barrierCells) {
      expect(input.externalWaterMask[cell]).toBe(0);
      expect([input.localRunoff[cell], input.rainfall[cell], input.potentialDemand[cell]]).toEqual([0, 0, 0]);
    }
    expect(value.bodies[0]!.bodyId).toBe(2636);
    expect(value.components[0]!.componentId).toBe(2636);
    for (const record of [value.bodies[0]!, value.components[0]!]) {
      expect(record.flux.balance - record.outflow - record.unresolvedResidual).toBe(2 ** -42);
      expect(record.unresolvedResidual).toBe(3.2292057291665515);
    }
    expect(artifacts.lakePlan.validate(value, { dimensions })).toEqual([]);
  });
  for (const collection of ["pools", "bodies", "components"] as const) {
    it(`refuses material source, demand, balance and disposition deficits in ${collection}`, () => {
      const valid = certifiedLake(desertHugeRoot19());
      const dimensions = { width: valid.width, height: valid.height };
      expect(artifacts.lakePlan.validate(valid, { dimensions })).toEqual([]);
      for (const key of ["incomingOverflow", "dryRunoff", "wetPrecipitation", "wetDemand", "balance"] as const) {
        const changed = structuredClone(valid), record = changed[collection][0]!;
        record.flux[key] += key === "wetDemand" || record.flux[key] === 0 ? 1e-8 : -1e-8;
        expect(artifacts.lakePlan.validate(changed, { dimensions }).map(issue => issue.message))
          .toContain("Physical ledger does not balance with explicit unresolved supply.");
      }
      for (const key of ["outflow", "unresolvedResidual"] as const) {
        const changed = structuredClone(valid);
        changed[collection][0]![key] += 1e-8;
        expect(artifacts.lakePlan.validate(changed, { dimensions }).map(issue => issue.message))
          .toContain("Physical ledger does not balance with explicit unresolved supply.");
      }
    });
  }
  it("does not trade complete membership for the local numerical ledger allowance", () => {
    const valid = certifiedLake(desertHugeRoot19());
    const dimensions = { width: valid.width, height: valid.height };
    const clipped = structuredClone(valid);
    clipped.bodies[0]!.wetCells.pop();
    expect(artifacts.lakePlan.validate(clipped, { dimensions }).map(issue => issue.message))
      .toContain("Map-grid body/component membership mismatch.");
    const duplicate = structuredClone(valid);
    duplicate.components[0]!.memberCells.push(duplicate.components[0]!.memberCells[0]!);
    expect(artifacts.lakePlan.validate(duplicate, { dimensions }).map(issue => issue.message))
      .toContain("Component must partition wet members and dry junctions.");
  });
  it("independently refuses materially missing source or disposition under finite cancellation", () => {
    const valid = certifiedLake(desertHugeRoot19());
    for (const missing of ["source", "disposition"] as const) {
      const value = structuredClone(valid), body = value.bodies[0]!;
      body.flux = { incomingOverflow: 1e9, dryRunoff: 0, wetPrecipitation: 0,
        wetDemand: missing === "source" ? 1e9 : 1e9 - 1, balance: 1 };
      body.unresolvedResidual = missing === "source" ? 1 : 0;
      expect(body.flux.incomingOverflow - body.flux.wetDemand === body.flux.balance)
        .toBe(missing === "disposition");
      expect(body.outflow + body.unresolvedResidual === body.flux.balance)
        .toBe(missing === "source");
      expect(artifacts.lakePlan.validate(value, { dimensions: value })).toEqual([
        { message: "Physical ledger does not balance with explicit unresolved supply." },
      ]);
    }
  });
  it("refuses finite terms whose derived local ledger scale or source overflows", () => {
    const valid = certifiedLake(desertHugeRoot19());
    for (const precipitation of [0, Number.MAX_VALUE]) {
      const value = structuredClone(valid), body = value.bodies[0]!;
      body.flux = { incomingOverflow: Number.MAX_VALUE, dryRunoff: 0,
        wetPrecipitation: precipitation, wetDemand: Number.MAX_VALUE, balance: precipitation };
      body.unresolvedResidual = precipitation;
      expect(Object.values(body.flux).every(Number.isFinite)).toBe(true);
      expect(Number.isFinite(body.flux.incomingOverflow + body.flux.wetPrecipitation - body.flux.wetDemand))
        .toBe(precipitation === 0);
      expect(artifacts.lakePlan.validate(value, { dimensions: value })).toEqual([
        { message: "Physical ledger does not balance with explicit unresolved supply." },
      ]);
    }
  });
  it("refuses material missing disposition at zero or low local forcing", () => {
    const valid = certifiedLake(desertHugeRoot19());
    for (const forcing of [0, 1e-16]) {
      const value = structuredClone(valid), body = value.bodies[0]!;
      body.flux = { incomingOverflow: 0, dryRunoff: 0,
        wetPrecipitation: forcing, wetDemand: forcing, balance: 0 };
      body.unresolvedResidual = 1e-8;
      expect(artifacts.lakePlan.validate(value, { dimensions: value })).toEqual([
        { message: "Physical ledger does not balance with explicit unresolved supply." },
      ]);
    }
  });
  it("refuses retired lake models and a planned count inconsistent with the complete certified footprint", () => {
    const valid = certifiedLake();
    const dimensions = { width: valid.width, height: valid.height };
    expect(artifacts.lakePlan.validate(valid, { dimensions })).toEqual([]);
    expect(
      artifacts.lakePlan.validate({ ...valid, model: "legacy-sink-budget" }, { dimensions }).length
    ).toBeGreaterThan(0);
    const retired = {
      model: "legacy-sink-budget",
      ...dimensions,
      lakeMask: new Uint8Array(dimensions.width * dimensions.height),
      plannedLakeTileCount: 0,
      sinkLakeCount: 0,
    };
    expect(artifacts.lakePlan.validate(retired, { dimensions }).length).toBeGreaterThan(0);
    const wrongCount = { ...valid, plannedLakeTileCount: valid.plannedLakeTileCount + 1 };
    expect(
      artifacts.lakePlan.validate(wrongCount, { dimensions }).some(issue =>
        issue.message.includes("does not match")
      )
    ).toBe(true);
  });
  it("preserves the exact binary64 representative inside a zero interval", () => {
    const terrain = {
      width: 6,
      height: 1,
      elevation: Int16Array.of(-1, 5, 0, 1, 6, -1),
      externalWaterMask: Uint8Array.of(1, 0, 0, 0, 0, 1),
      externalWaterHead: -1,
    };
    const value = certifiedLake({
      ...terrain,
      geometry: geometry.run(terrain, {
        strategy: "plateau-saddle-hierarchy",
        config: { allowExternalEdgeOutlets: false },
      }),
      localRunoff: Array.from(terrain.externalWaterMask, (external) => external ? 0 : 1),
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
      exposedLandMask: Uint8Array.of(0, 1, 1),
      runoff: [0, 0, 1 + 2 ** -26],
      discharge: [0, 0, 1 + 2 ** -26],
      riverClass: Uint8Array.of(0, 0, 1),
      flowDir: Int32Array.of(-1, 0, 1),
      basinId: Int32Array.of(-1, 2, 2),
      terminalType: Uint8Array.of(0, 1, 0),
    };
    expect(artifacts.hydrography.validate(value, { dimensions })).toEqual([]);
    expect(
      artifacts.hydrography.validate({ ...value, model: "legacy-sink-budget" }, { dimensions }).length
    ).toBeGreaterThan(0);
    const retired = {
      model: "legacy-sink-budget",
      runoff: new Float32Array(3),
      discharge: new Float32Array(3),
      riverClass: new Uint8Array(3),
      flowDir: new Int32Array(3).fill(-1),
      basinId: new Int32Array(3).fill(-1),
      terminalType: new Uint8Array(3),
      sinkMask: new Uint8Array(3),
      outletMask: new Uint8Array(3),
      routingElevation: new Float32Array(3),
      depressionDepth: new Float32Array(3),
    };
    expect(artifacts.hydrography.validate(retired, { dimensions }).length).toBeGreaterThan(0);
    for (const retired of ["outletMask", "sinkMask", "depressionDepth"]) {
      expect(
        artifacts.hydrography.validate({ ...value, [retired]: new Uint8Array(3) }, { dimensions }).length
      ).toBeGreaterThan(0);
    }
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
    for (const invalid of [
      { ...value, terminalType: Uint8Array.of(0, 6, 0) },
      { ...value, riverClass: Uint8Array.of(0, 0, 3) },
      { ...value, riverClass: Uint8Array.of(1, 0, 1) },
      { ...value, discharge: new Float32Array(3) },
    ]) expect(artifacts.hydrography.validate(invalid, { dimensions }).length).toBeGreaterThan(0);
  });

  it("admits certified mouth ownership and rejects retired river models, spill tags, and mountain conditioning", () => {
    const value = {
      model: "certified-sill-spill" as const,
      upstreamArea: Int32Array.of(1, 2, 3),
      streamOrderProxy: Uint8Array.of(1, 1, 1),
      mouthType: Uint8Array.of(1, 2, 5),
      mouthBodyId: Int32Array.of(0, 7, 0),
      slopeClass: Uint8Array.of(1, 2, 3),
      flowPermanenceProxy: Uint8Array.of(1, 2, 3),
    };
    expect(artifacts.riverNetwork.validate(value, { dimensions })).toEqual([]);
    const { mouthBodyId: _mouthBodyId, ...retiredFields } = value;
    expect(
      artifacts.riverNetwork.validate({ ...retiredFields, model: "legacy-sink-budget" }, { dimensions }).length
    ).toBeGreaterThan(0);
    for (const invalid of [
      { ...value, model: "legacy-sink-budget" },
      { ...value, mouthBodyId: Int32Array.of(0, 0, 0) },
      { ...value, mouthBodyId: Int32Array.of(7, 7, 0) },
      { ...value, mouthType: Uint8Array.of(4, 2, 5) },
      { ...value, slopeClass: Uint8Array.of(5, 2, 3) },
    ]) expect(artifacts.riverNetwork.validate(invalid, { dimensions }).length).toBeGreaterThan(0);
  });
});
