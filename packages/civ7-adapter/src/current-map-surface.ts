import type { CurrentRiverSurface, RiverProjectionResult } from "./types.js";

type CurrentMapLayer = Int16Array | Int32Array | Uint8Array;

type CurrentMapLayerConstructor<Layer extends CurrentMapLayer> = new (length: number) => Layer;

type CurrentRiverSurfaceReader = Readonly<{
  width: number;
  height: number;
  noRiverType: number;
  minorRiverType: number;
  navigableRiverType: number;
  navigableRiverTerrainType: number;
  typeReadbackSupported: boolean;
  unsupportedReason: string;
  getTerrainType: (x: number, y: number) => number;
  getRiverType: (x: number, y: number) => number;
  isRiver: (x: number, y: number) => boolean;
  isNavigableRiver: (x: number, y: number) => boolean;
}>;

/**
 * Reads one detached row-major map layer through an adapter's public getter semantics.
 *
 * Adapter implementations share this acquisition path so subclasses and test doubles can
 * override the same getter capabilities that ordinary point reads expose.
 *
 * @param width - Number of columns in the active map.
 * @param height - Number of rows in the active map.
 * @param Layer - Exact typed-array constructor required by the layer contract.
 * @param read - Adapter-owned point reader for the requested layer.
 * @returns Fresh storage containing the current value for every map cell.
 * @internal
 */
export function captureCurrentMapLayer<Layer extends CurrentMapLayer>(
  width: number,
  height: number,
  Layer: CurrentMapLayerConstructor<Layer>,
  read: (x: number, y: number) => number
): Layer {
  const values = new Layer(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      values[y * width + x] = read(x, y);
    }
  }
  return values;
}

/**
 * Captures only the detached engine channels required for river-plan parity.
 * Keeping this acquisition narrow prevents a river readback from depending on
 * later biome, feature, elevation, water, or lake projection APIs.
 */
export function captureCurrentRiverSurface(reader: CurrentRiverSurfaceReader): CurrentRiverSurface {
  const { width, height } = reader;
  const size = width * height;
  const terrainType = new Int32Array(size);
  const riverType = new Int32Array(size);
  const riverMask = new Uint8Array(size);
  const navigableRiverMask = new Uint8Array(size);
  const minorRiverMask = new Uint8Array(size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const observedRiverType = reader.getRiverType(x, y) | 0;
      const hasRiverMetadata = observedRiverType !== reader.noRiverType;
      const isRiver = reader.isRiver(x, y) || hasRiverMetadata;
      const isNavigable =
        reader.isNavigableRiver(x, y) || observedRiverType === reader.navigableRiverType;

      terrainType[index] = reader.getTerrainType(x, y) | 0;
      riverType[index] = observedRiverType;
      riverMask[index] = isRiver ? 1 : 0;
      navigableRiverMask[index] = isNavigable ? 1 : 0;
      minorRiverMask[index] = isRiver && observedRiverType === reader.minorRiverType ? 1 : 0;
    }
  }

  return Object.freeze({
    width,
    height,
    terrainType,
    riverType,
    riverMask,
    navigableRiverMask,
    minorRiverMask,
    sentinels: Object.freeze({
      navigableRiverTerrainType: reader.navigableRiverTerrainType,
    }),
    riverMetadata: Object.freeze({
      typeReadbackSupported: reader.typeReadbackSupported,
      unsupportedReason: reader.unsupportedReason,
    }),
  });
}

/** @internal Projects deterministic river-plan parity from one detached current-map observation. */
export function deriveRiverProjectionFromCurrentSurface(
  surface: CurrentRiverSurface,
  plannedNavigableRiverMask: ArrayLike<number>,
  owner: string
): RiverProjectionResult {
  const { width, height } = surface;
  const size = width * height;
  if (plannedNavigableRiverMask.length !== size) {
    throw new Error(
      `[${owner}] Invalid river mask length for readRiverProjection (expected ${size}, got ${plannedNavigableRiverMask.length}).`
    );
  }
  const plannedNavigableRiverSnapshot = Uint8Array.from(plannedNavigableRiverMask);

  const stampedNavigableRiverMask = new Uint8Array(size);
  const rejectedNavigableRiverMask = new Uint8Array(size);
  const terrainNavigableRiverMask = new Uint8Array(size);
  const navigableRiverMismatchMask = new Uint8Array(size);
  let plannedNavigableRiverTileCount = 0;
  let stampedNavigableRiverTileCount = 0;
  let rejectedNavigableRiverTileCount = 0;
  let extraNavigableRiverTileCount = 0;
  let navigableRiverMismatchTileCount = 0;
  let engineRiverTileCount = 0;
  let engineNavigableRiverTileCount = 0;
  let engineMinorRiverTileCount = 0;
  let terrainNavigableRiverTileCount = 0;

  for (let index = 0; index < size; index++) {
    const planned = plannedNavigableRiverSnapshot[index] === 1;
    const hasNavigableTerrain =
      surface.terrainType[index] === surface.sentinels.navigableRiverTerrainType;
    const isRiver = surface.riverMask[index] === 1;
    const isNavigable = surface.navigableRiverMask[index] === 1;
    const isMinor = surface.minorRiverMask[index] === 1;

    terrainNavigableRiverMask[index] = hasNavigableTerrain ? 1 : 0;
    if (planned) plannedNavigableRiverTileCount += 1;
    if (isRiver) engineRiverTileCount += 1;
    if (isNavigable) engineNavigableRiverTileCount += 1;
    if (isMinor) engineMinorRiverTileCount += 1;
    if (hasNavigableTerrain) terrainNavigableRiverTileCount += 1;

    if (planned && hasNavigableTerrain) {
      stampedNavigableRiverMask[index] = 1;
      stampedNavigableRiverTileCount += 1;
    } else if (planned) {
      rejectedNavigableRiverMask[index] = 1;
      rejectedNavigableRiverTileCount += 1;
    } else if (hasNavigableTerrain) {
      extraNavigableRiverTileCount += 1;
    }

    if (planned !== hasNavigableTerrain) {
      navigableRiverMismatchMask[index] = 1;
      navigableRiverMismatchTileCount += 1;
    }
  }

  return {
    width,
    height,
    plannedNavigableRiverMask: plannedNavigableRiverSnapshot,
    stampedNavigableRiverMask,
    rejectedNavigableRiverMask,
    engineTerrain: surface.terrainType,
    engineRiverType: surface.riverType,
    engineIsRiverMask: surface.riverMask,
    engineNavigableRiverMask: surface.navigableRiverMask,
    engineMinorRiverMask: surface.minorRiverMask,
    terrainNavigableRiverMask,
    navigableRiverMismatchMask,
    plannedNavigableRiverTileCount,
    stampedNavigableRiverTileCount,
    rejectedNavigableRiverTileCount,
    extraNavigableRiverTileCount,
    navigableRiverMismatchTileCount,
    engineRiverTileCount,
    engineNavigableRiverTileCount,
    engineMinorRiverTileCount,
    terrainNavigableRiverTileCount,
    minorRiverStampingSupported: surface.riverMetadata.typeReadbackSupported,
    minorRiverUnsupportedReason: surface.riverMetadata.unsupportedReason,
  };
}
