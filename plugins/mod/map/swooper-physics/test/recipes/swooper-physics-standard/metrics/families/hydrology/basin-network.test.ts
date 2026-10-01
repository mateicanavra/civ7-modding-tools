import { describe, expect, it } from "bun:test";
import {
  measureStandardBasinNetwork,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/basin-network.js";

import { basinCapture as capture, quantizedCapture } from "../../fixtures/basin-network.js";
import { measureBasinLedger } from "../../../../../../src/recipes/standard/metrics/families/hydrology/basin-ledger.js";
import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";
import { hugeRoot17, standardRoots37And39 } from "../../../../../domains/hydrology/hydrography/ops/compute-basin-network/fixtures/retained-fixtures.js";

const { computeBasinNetwork: basinNetwork } = hydrologyOpsPublic.hydrography.ops;

describe("certified basin-network integrity measurements", () => {
  it("independently measures retained quantized closure and equal-sill inward reservoir support", () => {
    for (const input of [hugeRoot17(), standardRoots37And39()]) {
      const output = basinNetwork.run(input, { strategy: "stationary-sill-spill", config: {} });
      if (output.status !== "supported") throw new Error("Expected supported retained basin.");
      const { plan } = output, size = input.width * input.height, base = capture();
      const measured = measureBasinLedger({ ...base, provenance: { width: input.width, height: input.height }, model: {
        ...base.model, externalWaterMask: input.externalWaterMask, seaLevel: input.externalWaterHead,
        exposedLandMask: Uint8Array.from(input.externalWaterMask, (external, cell) => external === 0 && plan.wetMask[cell] === 0 ? 1 : 0),
        elevation: input.elevation, baselineRainfall: input.rainfall,
        plannedLakeMask: plan.wetMask, flowDir: plan.receiver, terminalType: plan.terminalType, riverClass: new Uint8Array(size),
        mountainMask: new Uint8Array(size), volcanoMask: new Uint8Array(size),
        physicalHydrology: { model: "certified-sill-spill", runoff: input.localRunoff, potentialDemand: input.potentialDemand,
          discharge: plan.dryDischarge, bodyId: plan.bodyId, componentId: plan.componentId, basinId: plan.terminalId,
          waterSurface: plan.waterSurface, mouthBodyId: new Int32Array(size), pools: plan.pools, bodies: plan.bodies,
          components: plan.components, transfers: plan.transfers, ports: plan.ports, terminals: plan.terminals,
          marineExits: plan.marineExits, boundaryExits: plan.boundaryExits, conservation: plan.conservation },
      } });
      expect(measured).toMatchObject({ conservationValid: true, partitionsAndLedgersValid: true, physicalFootprintsValid: true,
        invalidClosureCount: 0, invalidTransferCount: 0, invalidPortCount: 0, routingCycleVertexCount: 0 });
    }
  });

  it("measures admitted conservation, complete wet partition, and exact dry native sources without a lake quota", () => {
    const measured = measureStandardBasinNetwork(capture());
    expect(measured).toMatchObject({
      bodyCount: 1,
      wetTileCount: 1,
      dryChannelSourceCount: 1,
      reportedResidual: 0,
      recomputedResidual: 0,
      roundoffBound: 1e-13,
      conservationValid: true,
      partitionsAndLedgersValid: true,
      physicalFootprintsValid: true,
      exposureValid: true,
      lakeProjectionComplete: true,
      authoredSourcesComplete: true,
      nativeClassesMatch: true,
    });
  });

  it("keeps initially wet finite source and retained-lake cells in the basin domain", () => {
    const input = capture();
    const expected = measureStandardBasinNetwork(input);
    input.model.landMask.fill(0);
    expect(input.model.externalWaterMask).toEqual(Uint8Array.of(1, 0, 0));
    expect(input.model.exposedLandMask).toEqual(Uint8Array.of(0, 1, 0));
    expect(measureStandardBasinNetwork(input)).toEqual(expected);
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      wetTileCount: 1, dryChannelSourceCount: 1,
      conservationValid: true, partitionsAndLedgersValid: true,
      physicalFootprintsValid: true, exposureValid: true,
    });
  });

  it("rejects retired evidence instead of inventing certified counters", () => {
    const input = capture();
    expect(() =>
      measureStandardBasinNetwork({
        ...input,
        model: {
          ...input.model,
          physicalHydrology: {
            model: "legacy-sink-budget",
            routingElevation: new Float32Array(3),
            outletMask: new Uint8Array(3),
          },
        },
      } as unknown as Parameters<typeof measureStandardBasinNetwork>[0])
    ).toThrow("Expected completed basin evidence");
  });

  it("detects changed supplied runoff, reported residuals, and body ledger demand independently", () => {
    const changedRunoff = capture();
    changedRunoff.model.physicalHydrology.runoff[1] = 3;
    expect(measureStandardBasinNetwork(changedRunoff)).toMatchObject({
      conservationValid: false,
      recomputedResidual: 1,
    });
    const changedResidual = capture();
    changedResidual.model.physicalHydrology.conservation.residual = 1e-9;
    expect(measureStandardBasinNetwork(changedResidual)?.conservationValid).toBe(false);
    const changedDemand = capture();
    changedDemand.model.physicalHydrology.bodies[0]!.flux.wetDemand = 2;
    expect(measureStandardBasinNetwork(changedDemand)).toMatchObject({
      conservationValid: false,
      partitionsAndLedgersValid: false,
      invalidBodyLedgerCount: 1,
    });
  });

  it("detects invalid body, pool, component and terminal partitions independently", () => {
    const missing = capture();
    missing.model.physicalHydrology.components = [];
    expect(measureStandardBasinNetwork(missing)?.partitionsAndLedgersValid).toBe(false);
    const duplicated = capture();
    duplicated.model.physicalHydrology.pools[0]!.catchmentCells.push(2);
    expect(measureStandardBasinNetwork(duplicated)?.poolPartitionMismatchCount).toBeGreaterThan(0);
    const terminal = capture();
    terminal.model.physicalHydrology.basinId[2] = 3;
    expect(measureStandardBasinNetwork(terminal)?.terminalPartitionMismatchCount).toBeGreaterThan(0);
    for (const invalid of [-1, Number.NaN]) {
      const outflow = capture();
      outflow.model.physicalHydrology.bodies[0]!.outflow = invalid;
      expect(measureStandardBasinNetwork(outflow)).toMatchObject({ invalidBodyLedgerCount: 1, partitionsAndLedgersValid: false });
    }
  });

  it("checks signed internal exchange and component export without pretending the body has a dry receiver", () => {
    const input = capture();
    expect(measureStandardBasinNetwork(input)?.partitionsAndLedgersValid).toBe(true);
    input.model.physicalHydrology.transfers[0]!.signedDischarge *= -1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({ partitionsAndLedgersValid: false, conservationValid: false });
    const port = capture();
    port.model.physicalHydrology.ports[0]!.discharge--;
    expect(measureStandardBasinNetwork(port)?.invalidPortCount).toBeGreaterThan(0);
    const fabricated = capture();
    fabricated.model.flowDir[2] = 1;
    expect(measureStandardBasinNetwork(fabricated)?.invalidTransferCount).toBeGreaterThan(0);
  });

  it("retains positive quantization uncertainty separately from physical exports and roundoff", () => {
    const input = quantizedCapture();
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      conservationValid: true, partitionsAndLedgersValid: true, physicalFootprintsValid: true,
      unresolvedResidual: 3, normalizedUnresolvedResidual: 0.25, reportedResidual: 0, recomputedResidual: 0,
      marineDischarge: 0, boundaryDischarge: 0, authoredSourcesComplete: true,
    });
    const closure = input.model.physicalHydrology.pools[0]!.closure;
    if (closure?.resolution !== "shoreline-quantization") throw new Error("Expected bracket.");
    closure.after.balance = -2;
    expect(measureStandardBasinNetwork(input)?.invalidClosureCount).toBeGreaterThan(0);
    const erased = quantizedCapture();
    erased.model.physicalHydrology.conservation.unresolvedResidual = 0;
    expect(measureStandardBasinNetwork(erased)?.conservationValid).toBe(false);
  });

  it("admits an exact-zero interval without rounding the binary64 water surface", () => {
    const input = quantizedCapture(), physical = input.model.physicalHydrology;
    const head = Number.MIN_VALUE;
    physical.waterSurface[2] = head;
    physical.potentialDemand[2] = 12;
    physical.pools[0]!.level = head;
    physical.pools[0]!.flux.wetDemand = 12;
    physical.pools[0]!.flux.balance = 0;
    physical.pools[0]!.unresolvedResidual = 0;
    physical.pools[0]!.closure = { resolution: "exact-balance", levels: { lower: 0, upper: 2, lowerInclusive: false, upperInclusive: true } };
    for (const record of [...physical.bodies, ...physical.components]) {
      record.level = head; record.flux.wetDemand = 12; record.flux.balance = 0; record.unresolvedResidual = 0;
    }
    physical.conservation.wetDemand = 12;
    physical.conservation.unresolvedResidual = 0;
    physical.conservation.normalizedUnresolvedResidual = 0;
    expect(measureStandardBasinNetwork(input)).toMatchObject({ conservationValid: true, partitionsAndLedgersValid: true, physicalFootprintsValid: true });
  });

  it("refuses fabricated or missing native wet exchanges rather than inferring a lake outlet", () => {
    const input = capture();
    input.projection.navigableRivers.wetTransitionDispositions = [];
    expect(measureStandardBasinNetwork(input)).toMatchObject({ missingWetTransitionDispositionCount: 1, authoredSourcesComplete: false });
    const fabricated = quantizedCapture();
    fabricated.projection.navigableRivers.wetTransitionWrites.push({ bodyId: 3, role: "outlet", sourceCell: 2,
      receiverCell: 1, direction: "WEST", riverClass: "NAVIGABLE" });
    expect(measureStandardBasinNetwork(fabricated)).toMatchObject({ invalidWetTransitionWriteCount: 1, authoredSourcesComplete: false });
  });

  it("does not accept widened roundoff as a replacement for actual conservation", () => {
    const input = capture();
    input.model.physicalHydrology.conservation.roundoffBound = 1;
    input.model.physicalHydrology.runoff[1]! += 0.1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({ roundoffBoundValid: false, conservationValid: false });
  });

  it("resolves boundary export separately from marine without fabricating a receiver", () => {
    const input = capture(), physical = input.model.physicalHydrology;
    physical.ports = [{ kind: "boundary-export", componentId: 2, fromCell: 1, side: "north", discharge: 11 }];
    physical.marineExits = [];
    physical.boundaryExits = [{ fromCell: 1, side: "north", discharge: 11 }];
    physical.terminals[0]!.role = "boundary-export";
    physical.conservation.marineDischarge = 0; physical.conservation.boundaryDischarge = 11;
    physical.discharge[1] = 0; input.model.flowDir[1] = -2; input.model.terminalType.set([0, 2, 2]);
    input.model.riverClass[1] = 0;
    input.projection.navigableRivers.wetTransitionDispositions[0]!.disposition = "receiver-not-dry-nav";
    Object.assign(input.projection.navigableRivers, { authoredSourceCount: 0, plannedMajorRiverTileCount: 0, writes: [], wetTransitionWrites: [] });
    input.projection.riverReadback.terrainNavigableRiverTileCount = 0;
    expect(measureStandardBasinNetwork(input)).toMatchObject({ conservationValid: true, partitionsAndLedgersValid: true,
      physicalFootprintsValid: true, authoredSourcesComplete: true, marineDischarge: 0, boundaryDischarge: 11 });
  });

  it("admits quantized subtile and exact dry terminals without wet bodies or invented outlets", () => {
    for (const state of ["subtile", "dry"] as const) {
      const input = capture(), physical = input.model.physicalHydrology;
      input.model.elevation.set([-1, 2, 0]); input.model.plannedLakeMask.fill(0);
      input.model.exposedLandMask.set([0, 1, 1]);
      input.model.riverClass.fill(0); input.model.flowDir.set([-1, 2, -2]);
      input.model.terminalType.set([0, state === "subtile" ? 4 : 5, state === "subtile" ? 4 : 5]);
      input.model.baselineRainfall.fill(0);
      physical.waterSurface = [0, 2, 0]; physical.bodyId.fill(0); physical.componentId.set([0, 0, 3]); physical.basinId.set([-1, 3, 3]);
      physical.runoff = state === "subtile" ? [0, 1, 1] : [0, 0, 0]; physical.discharge = state === "subtile" ? [0, 1, 0] : [0, 0, 0];
      physical.potentialDemand.set([0, 0, 4]);
      const amount = state === "subtile" ? 2 : 0;
      const flux = { incomingOverflow: 0, dryRunoff: amount, wetPrecipitation: 0, wetDemand: 0, balance: amount };
      physical.pools = [{ poolId: 1, componentId: 3, leafIds: [1], catchmentCells: [1, 2], wetCells: [], state, level: 0,
        flux, outflow: 0, unresolvedResidual: amount, closure: state === "dry" ? null : {
          resolution: "shoreline-quantization", level: 0, cohortCells: [2], before: { ...flux },
          after: { ...flux, dryRunoff: 1, wetPrecipitation: 0, wetDemand: 4, balance: -3 }, jumpMagnitude: 5, unresolvedResidual: 2 } }];
      physical.components = [{ componentId: 3, poolId: 1, bodyIds: [], memberCells: [2], junctionCells: [2], anchorCell: 2, level: 0,
        state, flux: { ...flux, incomingOverflow: amount / 2, dryRunoff: amount / 2 }, outflow: 0, unresolvedResidual: amount, terminalId: 3 }];
      physical.terminals = [{ terminalId: 3, role: state, anchorCell: 2, componentId: 3 }];
      physical.bodies = []; physical.transfers = []; physical.ports = []; physical.marineExits = [];
      physical.conservation = { dryRunoff: amount, wetPrecipitation: 0, wetDemand: 0, marineDischarge: 0, boundaryDischarge: 0,
        externalDischarge: 0, unresolvedResidual: amount, normalizedUnresolvedResidual: amount ? 1 : 0, residual: 0, roundoffBound: 1e-13 };
      Object.assign(input.projection.navigableRivers, { authoredSourceCount: 0, plannedMajorRiverTileCount: 0,
        writes: [], wetTransitionWrites: [], wetTransitionDispositions: [] });
      input.projection.lakes.plannedLakeTileCount = 0; input.projection.lakes.stampedLakeTileCount = 0;
      input.observation.isWater[2] = 0; input.projection.riverReadback.terrainNavigableRiverTileCount = 0;
      expect(measureStandardBasinNetwork(input)).toMatchObject({ bodyCount: 0, wetTileCount: 0, conservationValid: true,
        partitionsAndLedgersValid: true, physicalFootprintsValid: true, authoredSourcesComplete: true });
    }
  });

  it("separates original-marine native lake classification from certified footprint realization", () => {
    const input = capture();
    input.observation.isLake[0] = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      observedOriginalMarineNativeLakeTileCount: 1,
      lakeFootprintMismatchCount: 0,
      lakeProjectionComplete: true,
    });
    input.observation.isWater[1] = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      observedOriginalMarineNativeLakeTileCount: 1,
      lakeFootprintMismatchCount: 1,
      lakeProjectionComplete: false,
    });
  });

  it("detects clipped wet membership, altered dry ground, uphill receivers, and landform overlap", () => {
    const clipped = capture();
    clipped.model.physicalHydrology.bodies[0]!.wetCells = [];
    expect(measureStandardBasinNetwork(clipped)?.physicalFootprintsValid).toBe(false);
    const raised = capture();
    raised.model.physicalHydrology.waterSurface[1] = 3;
    expect(measureStandardBasinNetwork(raised)).toMatchObject({
      dryGroundMismatchCount: 1,
      physicalFootprintsValid: false,
    });
    const uphill = capture();
    uphill.model.seaLevel = 3;
    expect(measureStandardBasinNetwork(uphill)).toMatchObject({
      nonascendingGroundViolationCount: 1,
      physicalFootprintsValid: false,
    });
    const blocked = capture();
    blocked.model.mountainMask[2] = 1;
    blocked.model.volcanoMask[1] = 1;
    expect(measureStandardBasinNetwork(blocked)).toMatchObject({
      blockingWetTileCount: 1,
      blockingDryChannelCount: 1,
      exposureValid: false,
    });
  });

  it("detects lake clipping and native source omission, duplication, extra sources, and demotion", () => {
    const lake = capture();
    lake.observation.isWater[2] = 0;
    expect(measureStandardBasinNetwork(lake)).toMatchObject({
      lakeFootprintMismatchCount: 1,
      lakeProjectionComplete: false,
    });
    const missing = capture();
    missing.projection.navigableRivers.writes = [];
    expect(measureStandardBasinNetwork(missing)?.writes).toMatchObject({
      missingSourceCount: 1,
      complete: false,
    });
    const duplicate = capture();
    duplicate.projection.navigableRivers.writes.push({
      ...duplicate.projection.navigableRivers.writes[0]!,
    });
    expect(measureStandardBasinNetwork(duplicate)?.writes).toMatchObject({
      duplicateSourceCount: 1,
      complete: false,
    });
    const extra = capture();
    extra.projection.navigableRivers.writes.push({
      sourceCell: 2,
      receiverCell: 1,
      direction: "WEST",
      riverClass: "MINOR",
    });
    expect(measureStandardBasinNetwork(extra)?.writes).toMatchObject({
      extraSourceCount: 1,
      complete: false,
    });
    const demoted = capture();
    demoted.projection.navigableRivers.writes[0]!.riverClass = "MINOR";
    expect(measureStandardBasinNetwork(demoted)?.writes).toMatchObject({
      wrongClassCount: 1,
      complete: false,
    });
    const readback = capture();
    readback.projection.riverReadback.minorRiverMismatchCount = 1;
    expect(measureStandardBasinNetwork(readback)?.nativeClassesMatch).toBe(false);
  });

  it("accepts complete coast-water bodies while retaining native classification differences", () => {
    const input = capture();
    input.observation.isLake[2] = 0;
    input.projection.lakes.nonLakeTileCount = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      lakeFootprintMismatchCount: 0,
      lakeProjectionComplete: true,
      observedPhysicalWaterNativeLakeTileCount: 0,
      observedPhysicalWaterNonLakeTileCount: 1,
      physicalWaterTerrainMismatchCount: 0,
    });
    input.observation.isLake[2] = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      lakeProjectionComplete: true,
      observedPhysicalWaterNativeLakeTileCount: 1,
      observedPhysicalWaterNonLakeTileCount: 0,
    });
    input.observation.terrain[2] = 4;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      lakeFootprintMismatchCount: 0,
      lakeProjectionComplete: false,
      physicalWaterTerrainMismatchCount: 1,
    });
    expect(Array.from(input.model.plannedLakeMask)).toEqual([0, 0, 1]);
  });
});
