import type { StandardMapCapture } from "../../capture.js";
import { measureBasinLedger } from "./basin-ledger.js";
import { measureWetTransitions } from "./wet-transitions.js";

export type StandardBasinNetworkMeasurementInput = Readonly<{
  provenance: Pick<StandardMapCapture["provenance"], "width" | "height">;
  model: Pick<StandardMapCapture["model"], "physicalHydrology" | "externalWaterMask" | "exposedLandMask" | "seaLevel" | "elevation" | "plannedLakeMask" |
    "riverClass" | "flowDir" | "terminalType" | "mountainMask" | "volcanoMask" | "baselineRainfall">;
  projection: Pick<StandardMapCapture["projection"], "lakes" | "navigableRivers" | "riverReadback">;
  observation: Pick<StandardMapCapture["observation"], "isWater" | "isLake" | "terrain" | "coastTerrain">;
}>;

/** Measures completed physical facts without selection quotas. */
export function measureStandardBasinNetwork(capture: StandardBasinNetworkMeasurementInput) {
  const physical = capture.model.physicalHydrology;
  const ledger = measureBasinLedger(capture);
  const { exchanges: _exchanges, selected: _selected, writes: _wetWrites, ...wetTransitions } = measureWetTransitions(capture);
  const { width, height } = capture.provenance;
  const { externalWaterMask, exposedLandMask, plannedLakeMask: wet, riverClass, flowDir, mountainMask, volcanoMask } = capture.model;
  let wetTileCount = 0, dryChannelSourceCount = 0, wetChannelClassCount = 0;
  let minorSourceCount = 0, majorSourceCount = 0;
  let blockingWetTileCount = 0, blockingDryChannelCount = 0, lakeFootprintMismatchCount = 0;
  let observedOriginalMarineNativeLakeTileCount = 0;
  let observedPhysicalWaterNativeLakeTileCount = 0, observedPhysicalWaterNonLakeTileCount = 0, physicalWaterTerrainMismatchCount = 0;
  const expectedSources = new Set<number>();
  for (let cell = 0; cell < width * height; cell++) {
    // Native lake categories on prescribed external water do not create physical bodies.
    if (externalWaterMask[cell] === 0) {
      if (wet[cell] !== capture.observation.isWater[cell]) lakeFootprintMismatchCount++;
    } else if (capture.observation.isLake[cell]) observedOriginalMarineNativeLakeTileCount++;
    if (wet[cell]) {
      wetTileCount++;
      if (capture.observation.isWater[cell]) {
        if (capture.observation.isLake[cell]) observedPhysicalWaterNativeLakeTileCount++;
        else observedPhysicalWaterNonLakeTileCount++;
      }
      if (capture.observation.terrain[cell] !== capture.observation.coastTerrain) physicalWaterTerrainMismatchCount++;
      if (mountainMask[cell] || volcanoMask[cell]) blockingWetTileCount++;
      if (riverClass[cell] !== 0 || physical.discharge[cell] !== 0) wetChannelClassCount++;
    } else if (exposedLandMask[cell] === 1) {
      if (riverClass[cell]! > 0) {
        dryChannelSourceCount++;
        expectedSources.add(cell);
        if (riverClass[cell] === 1) minorSourceCount++;
        else majorSourceCount++;
        if (mountainMask[cell] || volcanoMask[cell]) blockingDryChannelCount++;
      }
    } else if (riverClass[cell] !== 0) wetChannelClassCount++;
  }
  const projection = capture.projection.navigableRivers;
  const writes = (() => {
    const seen = new Set<number>();
    let duplicateSourceCount = 0, extraSourceCount = 0, wrongReceiverCount = 0, wrongClassCount = 0;
    for (const write of projection.writes) {
      if (seen.has(write.sourceCell)) duplicateSourceCount++;
      seen.add(write.sourceCell);
      if (!expectedSources.has(write.sourceCell)) extraSourceCount++;
      if (write.receiverCell !== flowDir[write.sourceCell]) wrongReceiverCount++;
      if (write.riverClass !== (riverClass[write.sourceCell] === 1 ? "MINOR" : "NAVIGABLE")) wrongClassCount++;
    }
    const missingSourceCount = [...expectedSources].filter((cell) => !seen.has(cell)).length;
    return Object.freeze({
      sourceCount: projection.writes.length, missingSourceCount, duplicateSourceCount, extraSourceCount, wrongReceiverCount, wrongClassCount,
      complete: projection.authoredSourceCount === projection.writes.length && projection.writes.length === dryChannelSourceCount &&
        projection.plannedMinorRiverTileCount === minorSourceCount && projection.plannedMajorRiverTileCount === majorSourceCount &&
        missingSourceCount === 0 && duplicateSourceCount === 0 && extraSourceCount === 0 && wrongReceiverCount === 0 && wrongClassCount === 0,
    });
  })();
  const lakes = capture.projection.lakes;
  const lakeProjectionComplete = lakeFootprintMismatchCount === 0 && physicalWaterTerrainMismatchCount === 0 &&
    lakes.plannedLakeTileCount === wetTileCount && lakes.stampedLakeTileCount === wetTileCount &&
    lakes.rejectedLakeTileCount === 0 && lakes.terrainMismatchTileCount === 0;
  const readback = capture.projection.riverReadback;
  const nativeClassesMatch = readback.terrainNavigableRiverTileCount === majorSourceCount && readback.riverMismatchCount === 0 &&
    readback.selectedRiverRejectedCount === 0 && readback.extraEngineRiverCount === 0 && readback.minorRiverMismatchCount === 0 &&
    readback.navigableMetadataMismatchCount === 0;
  return Object.freeze({
    ...ledger, bodyCount: physical.bodies.length, wetTileCount, dryChannelSourceCount,
    blockingWetTileCount, blockingDryChannelCount, wetChannelClassCount, lakeFootprintMismatchCount,
    observedOriginalMarineNativeLakeTileCount, observedPhysicalWaterNativeLakeTileCount, observedPhysicalWaterNonLakeTileCount,
    physicalWaterTerrainMismatchCount,
    exposureValid: blockingWetTileCount === 0 && blockingDryChannelCount === 0 && wetChannelClassCount === 0,
    lakeProjectionComplete, writes, ...wetTransitions,
    authoredSourcesComplete: writes.complete && wetTransitions.wetTransitionsComplete, nativeClassesMatch,
  });
}

export type StandardBasinNetworkMetrics = ReturnType<typeof measureStandardBasinNetwork>;
