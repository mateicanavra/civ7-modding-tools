import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import type { StandardMapCapture } from "../../capture.js";

export type StandardBasinNetworkMeasurementInput = Readonly<{
  provenance: Pick<StandardMapCapture["provenance"], "width" | "height">;
  model: Pick<
    StandardMapCapture["model"],
    | "physicalHydrology"
    | "landMask"
    | "elevation"
    | "plannedLakeMask"
    | "riverClass"
    | "flowDir"
    | "mountainMask"
    | "volcanoMask"
    | "baselineRainfall"
  >;
  projection: Pick<StandardMapCapture["projection"], "lakes" | "navigableRivers" | "riverReadback">;
  observation: Pick<StandardMapCapture["observation"], "isWater" | "isLake" | "terrain" | "coastTerrain">;
}>;

/** Measures certified facts without quotas; legacy absence is null, not fabricated passing evidence. */
export function measureStandardBasinNetwork(capture: StandardBasinNetworkMeasurementInput) {
  const physical = capture.model.physicalHydrology;
  if (physical.model === "legacy-sink-budget") return null;
  const { width, height } = capture.provenance;
  const size = width * height;
  const {
    landMask,
    plannedLakeMask: wet,
    elevation,
    riverClass,
    flowDir,
    mountainMask,
    volcanoMask,
  } = capture.model;
  const represented = new Uint8Array(size);
  const certificateIds = new Set<number>();
  let invalidCertificateCount = 0,
    duplicateCertificateCount = 0;
  for (const certificate of physical.certificates) {
    if (certificateIds.has(certificate.nodeId)) duplicateCertificateCount++;
    certificateIds.add(certificate.nodeId);
    if (!Number.isFinite(certificate.spillBalance) || certificate.spillBalance <= 0)
      invalidCertificateCount++;
  }
  let missingBodyCertificateCount = 0,
    invalidBodyLedgerCount = 0;
  let bodyFootprintMismatchCount = 0,
    bodyOutletMismatchCount = 0;
  let ledgerWetDemand = 0,
    ledgerWetPrecipitation = 0;
  const bodyIds = new Set<number>();
  for (const body of physical.bodies) {
    if (!certificateIds.has(body.nodeId)) missingBodyCertificateCount++;
    if (bodyIds.has(body.nodeId)) bodyFootprintMismatchCount++;
    bodyIds.add(body.nodeId);
    const flux = body.flux;
    if (
      !Object.values(flux).every((value) => Number.isFinite(value) && value >= 0) ||
      !Number.isFinite(body.outflow) ||
      body.outflow < 0 ||
      flux.dryRunoff !== 0 ||
      flux.balance !== body.outflow ||
      Math.abs(flux.incomingOverflow + flux.wetPrecipitation - flux.wetDemand - body.outflow) >
        physical.conservation.roundoffBound
    )
      invalidBodyLedgerCount++;
    ledgerWetDemand += flux.wetDemand;
    ledgerWetPrecipitation += flux.wetPrecipitation;
    const members = new Set(body.wetCells);
    if (
      !members.has(body.floorCell) ||
      body.floorElevation !== elevation[body.floorCell] ||
      body.floorElevation >= body.spillElevation
    )
      bodyFootprintMismatchCount++;
    if (
      !members.has(body.outletCell) ||
      members.has(body.receiverCell) ||
      flowDir[body.outletCell] !== body.receiverCell
    )
      bodyOutletMismatchCount++;
    let exits = 0;
    for (const cell of body.wetCells) {
      if (
        cell < 0 ||
        cell >= size ||
        represented[cell] ||
        wet[cell] !== 1 ||
        landMask[cell] !== 1 ||
        physical.bodyId[cell] !== body.nodeId ||
        physical.waterSurface[cell] !== body.spillElevation ||
        elevation[cell]! >= body.spillElevation
      )
        bodyFootprintMismatchCount++;
      if (cell >= 0 && cell < size) represented[cell] = 1;
      if (
        !getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height).includes(
          flowDir[cell]!
        ) ||
        physical.waterSurface[flowDir[cell]!]! > physical.waterSurface[cell]!
      )
        bodyOutletMismatchCount++;
      if (!members.has(flowDir[cell]!)) exits++;
    }
    if (exits !== 1) bodyOutletMismatchCount++;
    for (const cell of body.connectorCells)
      if (wet[cell] !== 0 || elevation[cell] !== body.spillElevation) bodyOutletMismatchCount++;
  }
  let wetTileCount = 0,
    dryChannelSourceCount = 0,
    wetChannelClassCount = 0;
  let minorSourceCount = 0,
    majorSourceCount = 0;
  let blockingWetTileCount = 0,
    blockingDryChannelCount = 0,
    lakeFootprintMismatchCount = 0;
  let observedOriginalMarineNativeLakeTileCount = 0;
  let observedPhysicalWaterNativeLakeTileCount = 0,
    observedPhysicalWaterNonLakeTileCount = 0,
    physicalWaterTerrainMismatchCount = 0;
  let dryGroundMismatchCount = 0,
    nonascendingGroundViolationCount = 0;
  let dryRunoff = 0,
    wetPrecipitation = 0;
  const expectedSources = new Set<number>();
  for (let cell = 0; cell < size; cell++) {
    if (represented[cell] !== wet[cell] || (wet[cell] === 0 && physical.bodyId[cell] !== 0))
      bodyFootprintMismatchCount++;
    // Original marine water can be classified as a native lake without becoming a physical body.
    if (landMask[cell] || wet[cell]) {
      if (wet[cell] !== capture.observation.isWater[cell]) lakeFootprintMismatchCount++;
    } else if (capture.observation.isLake[cell]) observedOriginalMarineNativeLakeTileCount++;
    if (wet[cell]) {
      wetTileCount++;
      if (capture.observation.isWater[cell]) {
        if (capture.observation.isLake[cell]) observedPhysicalWaterNativeLakeTileCount++;
        else observedPhysicalWaterNonLakeTileCount++;
      }
      if (capture.observation.terrain[cell] !== capture.observation.coastTerrain) physicalWaterTerrainMismatchCount++;
      wetPrecipitation += capture.model.baselineRainfall[cell]!;
      if (mountainMask[cell] || volcanoMask[cell]) blockingWetTileCount++;
      if (riverClass[cell] !== 0 || physical.discharge[cell] !== 0) wetChannelClassCount++;
    } else if (landMask[cell]) {
      dryRunoff += physical.runoff[cell]!;
      if (physical.waterSurface[cell] !== elevation[cell]) dryGroundMismatchCount++;
      const dest = flowDir[cell]!;
      if (
        dest < 0 ||
        dest >= size ||
        !getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height).includes(
          dest
        ) ||
        elevation[dest]! > elevation[cell]!
      )
        nonascendingGroundViolationCount++;
      if (riverClass[cell]! > 0) {
        dryChannelSourceCount++;
        expectedSources.add(cell);
        if (riverClass[cell] === 1) minorSourceCount++;
        else majorSourceCount++;
        if (mountainMask[cell] || volcanoMask[cell]) blockingDryChannelCount++;
      }
    } else if (riverClass[cell] !== 0) wetChannelClassCount++;
  }
  const externalDischarge = physical.marineExits.reduce((sum, exit) => sum + exit.discharge, 0);
  // Demand is the published body ledger, not a reconstruction from refined climate.
  const recomputedResidual = dryRunoff + wetPrecipitation - ledgerWetDemand - externalDischarge;
  const conservation = physical.conservation;
  const roundoffBound = conservation.roundoffBound;
  const conservationValid =
    Object.values(conservation).every(Number.isFinite) &&
    roundoffBound >= 0 &&
    Number.isFinite(recomputedResidual) &&
    Math.abs(conservation.residual) <= roundoffBound &&
    Math.abs(recomputedResidual) <= roundoffBound &&
    Math.abs(dryRunoff - conservation.dryRunoff) <= roundoffBound &&
    Math.abs(wetPrecipitation - conservation.wetPrecipitation) <= roundoffBound &&
    Math.abs(ledgerWetPrecipitation - wetPrecipitation) <= roundoffBound &&
    Math.abs(ledgerWetDemand - conservation.wetDemand) <= roundoffBound &&
    Math.abs(externalDischarge - conservation.externalDischarge) <= roundoffBound;
  const projection = capture.projection.navigableRivers;
  const writes = (() => {
    if (projection.model !== "certified-sill-spill") return null;
    const seen = new Set<number>();
    let duplicateSourceCount = 0,
      extraSourceCount = 0,
      wrongReceiverCount = 0,
      wrongClassCount = 0;
    for (const write of projection.writes) {
      if (seen.has(write.sourceCell)) duplicateSourceCount++;
      seen.add(write.sourceCell);
      if (!expectedSources.has(write.sourceCell)) extraSourceCount++;
      if (write.receiverCell !== flowDir[write.sourceCell]) wrongReceiverCount++;
      const expectedClass = riverClass[write.sourceCell] === 1 ? "MINOR" : "NAVIGABLE";
      if (write.riverClass !== expectedClass) wrongClassCount++;
    }
    const missingSourceCount = [...expectedSources].filter((cell) => !seen.has(cell)).length;
    return Object.freeze({
      sourceCount: projection.writes.length,
      missingSourceCount,
      duplicateSourceCount,
      extraSourceCount,
      wrongReceiverCount,
      wrongClassCount,
      complete:
        projection.authoredSourceCount === projection.writes.length &&
        projection.writes.length === dryChannelSourceCount &&
        projection.plannedMinorRiverTileCount === minorSourceCount &&
        projection.plannedMajorRiverTileCount === majorSourceCount &&
        missingSourceCount === 0 &&
        duplicateSourceCount === 0 &&
        extraSourceCount === 0 &&
        wrongReceiverCount === 0 &&
        wrongClassCount === 0,
    });
  })();
  const lakes = capture.projection.lakes;
  const lakeProjectionComplete =
    lakeFootprintMismatchCount === 0 &&
    physicalWaterTerrainMismatchCount === 0 &&
    lakes.plannedLakeTileCount === wetTileCount &&
    lakes.stampedLakeTileCount === wetTileCount &&
    lakes.morphologyProtectedLakeTileCount === 0 &&
    lakes.isolatedFragmentProtectedLakeTileCount === 0 &&
    lakes.rejectedLakeTileCount === 0 &&
    lakes.terrainMismatchTileCount === 0;
  const readback = capture.projection.riverReadback;
  const nativeClassesMatch =
    readback.terrainNavigableRiverTileCount === majorSourceCount &&
    readback.riverMismatchCount === 0 &&
    readback.selectedRiverRejectedCount === 0 &&
    readback.extraEngineRiverCount === 0 &&
    readback.minorRiverMismatchCount === 0 &&
    readback.navigableMetadataMismatchCount === 0;
  return Object.freeze({
    bodyCount: physical.bodies.length,
    certificateCount: physical.certificates.length,
    wetTileCount,
    dryChannelSourceCount,
    reportedResidual: conservation.residual,
    recomputedResidual,
    roundoffBound,
    invalidCertificateCount,
    duplicateCertificateCount,
    missingBodyCertificateCount,
    invalidBodyLedgerCount,
    bodyFootprintMismatchCount,
    bodyOutletMismatchCount,
    dryGroundMismatchCount,
    nonascendingGroundViolationCount,
    blockingWetTileCount,
    blockingDryChannelCount,
    wetChannelClassCount,
    lakeFootprintMismatchCount,
    observedOriginalMarineNativeLakeTileCount,
    observedPhysicalWaterNativeLakeTileCount,
    observedPhysicalWaterNonLakeTileCount,
    physicalWaterTerrainMismatchCount,
    conservationValid,
    certificatesAndLedgersValid:
      invalidCertificateCount === 0 &&
      duplicateCertificateCount === 0 &&
      missingBodyCertificateCount === 0 &&
      invalidBodyLedgerCount === 0,
    physicalFootprintsValid:
      bodyFootprintMismatchCount === 0 &&
      bodyOutletMismatchCount === 0 &&
      dryGroundMismatchCount === 0 &&
      nonascendingGroundViolationCount === 0,
    exposureValid:
      blockingWetTileCount === 0 && blockingDryChannelCount === 0 && wetChannelClassCount === 0,
    lakeProjectionComplete,
    writes,
    authoredSourcesComplete: writes !== null && writes.complete,
    nativeClassesMatch,
  });
}

export type StandardBasinNetworkMetrics = NonNullable<
  ReturnType<typeof measureStandardBasinNetwork>
>;
