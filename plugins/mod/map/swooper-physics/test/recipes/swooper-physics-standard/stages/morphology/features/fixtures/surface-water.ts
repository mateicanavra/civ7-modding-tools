import type { ArtifactValueOf } from "@swooper/mapgen-core/authoring";
import { artifacts } from "../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { closedLakeProjectionFixture } from "../../../../fixtures/closed-lake-projection.js";

type LakePlan = ArtifactValueOf<typeof artifacts.lakePlan>;
type Hydrography = ArtifactValueOf<typeof artifacts.hydrography>;

/** Matched consumer evidence: one elevated wet cell, two dry channel classes, and original marine water. */
export function createSurfaceWaterFixture(
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
  const topography = { landMask, externalWaterMask: Uint8Array.from(landMask, (land) => land === 0 ? 1 : 0), elevation, seaLevel: 0, bathymetry: new Int16Array(size) };
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
    exposedLandMask: Uint8Array.from(landMask, (land, cell) => land === 1 && cell !== wetCell ? 1 : 0),
    riverClass,
    flowDir,
    basinId: new Int32Array(size).fill(-1),
    terminalType: new Uint8Array(size),
  };
  const model = "certified-sill-spill";
  const bodyId = new Int32Array(size);
  bodyId[wetCell] = wetCell + 1;
  const componentId = new Int32Array(size);
  componentId[wetCell] = componentId[minorChannel] = minorChannel + 1;
  const waterSurface = Array.from(elevation);
  waterSurface[wetCell] = 801;
  const flux = { incomingOverflow: 1, dryRunoff: 0, wetPrecipitation: 1, wetDemand: 0, balance: 2 };
  const lakePlan: LakePlan = {
    model,
    ...commonLake,
    bodyId,
    componentId,
    waterSurface,
    bodies: [{
      bodyId: wetCell + 1, componentId: minorChannel + 1, poolId: 1,
      wetCells: [wetCell],
      level: 801, flux, outflow: 2, unresolvedResidual: 0,
    }],
    pools: [{ poolId: 1, componentId: minorChannel + 1, leafIds: [1], catchmentCells: [minorChannel, wetCell],
      wetCells: [wetCell], state: "open", level: 801, flux, outflow: 2, unresolvedResidual: 0, closure: null }],
    components: [{ componentId: minorChannel + 1, poolId: 1, bodyIds: [wetCell + 1], memberCells: [minorChannel, wetCell],
      junctionCells: [minorChannel], anchorCell: minorChannel, level: 801, state: "open", flux, outflow: 2, unresolvedResidual: 0, terminalId: 1 }],
    transfers: [{ componentId: minorChannel + 1, cellA: minorChannel, cellB: wetCell, bodyA: 0, bodyB: wetCell + 1, signedDischarge: -2 }],
    ports: [{ kind: "adjacent", componentId: minorChannel + 1, fromCell: minorChannel, toCell: 0, destination: "marine", destinationComponentId: 0, discharge: 2 }],
    terminals: [{ terminalId: 1, role: "marine", anchorCell: 0, componentId: 0 }],
    marineExits: [{ fromCell: minorChannel, marineCell: 0, discharge: 2 }], boundaryExits: [],
    conservation: { dryRunoff: 1, wetPrecipitation: 1, wetDemand: 0, marineDischarge: 2, boundaryDischarge: 0,
      externalDischarge: 2, unresolvedResidual: 0, normalizedUnresolvedResidual: 0, residual: 0, roundoffBound: 0 },
  };
  const discharge = Array<number>(size).fill(0);
  discharge[minorChannel] = 2;
  discharge[majorChannel] = 1;
  flowDir[wetCell] = -2;
  const runoff = Array<number>(size).fill(0);
  runoff[majorChannel] = 1;
  const hydrography: Hydrography = { model, ...commonHydrography, runoff, discharge };
  return { topography, lakePlan, hydrography, wetCell, minorChannel, majorChannel, dryCell };
}

/** Zero-supply consumer/projection evidence; specialized tests own only the arrays they change. */
export function createEmptyWaterFixture(width: number, height: number, lakeMask = new Uint8Array(width * height)) {
  const size = width * height;
  return {
    hydrography: {
      model: "certified-sill-spill" as const,
      exposedLandMask: Uint8Array.from(lakeMask, (wet) => wet === 0 ? 1 : 0),
      riverClass: new Uint8Array(size), flowDir: new Int32Array(size).fill(-1),
      basinId: new Int32Array(size).fill(-1), terminalType: new Uint8Array(size),
      runoff: Array<number>(size).fill(0), discharge: Array<number>(size).fill(0),
    } satisfies Hydrography,
    lakePlan: closedLakeProjectionFixture(width, height, lakeMask),
    riverNetwork: {
      model: "certified-sill-spill" as const,
      upstreamArea: new Int32Array(size), streamOrderProxy: new Uint8Array(size),
      mouthType: new Uint8Array(size), slopeClass: new Uint8Array(size),
      flowPermanenceProxy: new Uint8Array(size), mouthBodyId: new Int32Array(size),
    } satisfies ArtifactValueOf<typeof artifacts.riverNetwork>,
  };
}
