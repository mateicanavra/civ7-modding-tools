import type { ArtifactValueOf } from "@swooper/mapgen-core/authoring";
import { artifacts } from "../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";

type LakePlan = ArtifactValueOf<typeof artifacts.lakePlan>;
type Hydrography = ArtifactValueOf<typeof artifacts.hydrography>;

/** Matched consumer evidence: one elevated wet cell, two dry channel classes, and original marine water. */
export function createSurfaceWaterFixture(
  model: LakePlan["model"],
  width: number,
  height: number
) {
  const size = width * height;
  const wetCell = 2;
  const minorChannel = 1;
  const majorChannel = 3;
  const dryCell = 4;
  const landMask = new Uint8Array(size).fill(1);
  landMask[0] = 0;
  const elevation = new Int16Array(size).fill(802);
  elevation[0] = -20;
  elevation[wetCell] = 800;
  elevation[dryCell] = 800;
  elevation[minorChannel] = 801;
  const topography = { landMask, elevation, seaLevel: 0, bathymetry: new Int16Array(size) };
  const lakeMask = new Uint8Array(size);
  lakeMask[wetCell] = 1;
  const commonLake = { width, height, lakeMask, plannedLakeTileCount: 1 };
  const riverClass = new Uint8Array(size);
  riverClass[minorChannel] = 1;
  riverClass[majorChannel] = 2;
  const flowDir = new Int32Array(size).fill(-1);
  flowDir[majorChannel] = wetCell;
  flowDir[wetCell] = minorChannel;
  flowDir[minorChannel] = 0;
  const commonHydrography = {
    riverClass,
    flowDir,
    basinId: new Int32Array(size).fill(-1),
    terminalType: new Uint8Array(size),
  };
  let lakePlan: LakePlan;
  let hydrography: Hydrography;
  if (model === "certified-sill-spill") {
    const bodyId = new Int32Array(size);
    bodyId[wetCell] = 1;
    const waterSurface = elevation.slice();
    waterSurface[wetCell] = 801;
    lakePlan = {
      model,
      ...commonLake,
      bodyId,
      waterSurface,
      bodies: [{
        nodeId: 1,
        wetCells: [wetCell],
        floorCell: wetCell,
        floorElevation: 800,
        spillElevation: 801,
        outletCell: wetCell,
        receiverCell: minorChannel,
        connectorCells: [],
        flux: { incomingOverflow: 0, dryRunoff: 0, wetPrecipitation: 1, wetDemand: 0, balance: 1 },
        outflow: 1,
      }],
      certificates: [{ nodeId: 1, spillBalance: 1 }],
      marineExits: [{ fromCell: minorChannel, marineCell: 0, discharge: 1 }],
      conservation: { dryRunoff: 0, wetPrecipitation: 1, wetDemand: 0, externalDischarge: 1, residual: 0, roundoffBound: 0 },
    };
    const discharge = Array<number>(size).fill(0);
    discharge[minorChannel] = 1;
    hydrography = { model, ...commonHydrography, runoff: Array<number>(size).fill(0), discharge };
  } else {
    lakePlan = { model, ...commonLake, sinkLakeCount: 1 };
    hydrography = {
      model,
      ...commonHydrography,
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
      routingElevation: Float32Array.from(elevation),
      depressionDepth: new Float32Array(size),
    };
  }
  return { topography, lakePlan, hydrography, wetCell, minorChannel, majorChannel, dryCell };
}
