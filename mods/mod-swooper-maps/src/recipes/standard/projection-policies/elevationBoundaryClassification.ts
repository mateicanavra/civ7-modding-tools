import { CIV7_BROWSER_TABLES_V0 } from "@civ7/adapter";
import { forEachHexNeighborOddQ, wrapX } from "@swooper/mapgen-core/lib/grid";

type Civ7TablePolicyView = typeof CIV7_BROWSER_TABLES_V0 & {
  readonly mapGlobals?: {
    readonly polarWaterRows?: number;
  };
};

const CIV7_POLICY_TABLE = CIV7_BROWSER_TABLES_V0 as Civ7TablePolicyView;
const DEFAULT_CIV7_POLAR_WATER_ROWS = 2;
const MAP_GLOBALS_SOURCE = "Base/modules/base-standard/maps/map-globals.js";
const ELEVATION_GENERATOR_SOURCE = "Base/modules/base-standard/maps/elevation-terrain-generator.js";

const policySources = Array.from(
  new Set([...CIV7_POLICY_TABLE.source, MAP_GLOBALS_SOURCE, ELEVATION_GENERATOR_SOURCE])
);

/**
 * Static Civ7 build-elevation boundary policy evidence.
 *
 * Civ7's native TerrainBuilder.buildElevation can normalize low polar-edge
 * saddle tiles inside mountain provinces into coast water. MapGen owns that
 * input policy by stamping those compliance tiles before buildElevation so the
 * native materializer receives a surface it can preserve.
 */
export const CIV7_BUILD_ELEVATION_BOUNDARY_POLICY_V0 = {
  version: 0,
  polarWaterRows: CIV7_POLICY_TABLE.mapGlobals?.polarWaterRows ?? DEFAULT_CIV7_POLAR_WATER_ROWS,
  saddleElevationCeiling: 0,
  source: policySources,
  rationale:
    "Civ7 standard map scripts keep a polar water buffer and call TerrainBuilder.buildElevation after terrain/lake stamping. Live readback shows native buildElevation promotes low edge-row mountain saddles to coast; MapGen preprojects that compliance tile instead of accepting post-build drift.",
} as const;

export type BuildElevationBoundaryPolicyResult = Readonly<{
  landMask: Uint8Array;
  policyCoastMask: Uint8Array;
  promotedLandToCoast: number;
  polarWaterRows: number;
  saddleElevationCeiling: number;
}>;

function assertGridLength(label: string, value: { length: number }, expected: number): void {
  if (value.length !== expected) {
    throw new Error(
      `[elevationBoundaryClassification] ${label} length ${value.length} does not match ${expected}.`
    );
  }
}

function hasOpposingHorizontalMountains(params: {
  x: number;
  y: number;
  width: number;
  landMask: Uint8Array;
  mountainMask: Uint8Array;
}): boolean {
  const west = params.y * params.width + wrapX(params.x - 1, params.width);
  const east = params.y * params.width + wrapX(params.x + 1, params.width);
  return (
    params.landMask[west] === 1 &&
    params.landMask[east] === 1 &&
    params.mountainMask[west] === 1 &&
    params.mountainMask[east] === 1
  );
}

function countMountainNeighbors(params: {
  x: number;
  y: number;
  width: number;
  height: number;
  landMask: Uint8Array;
  mountainMask: Uint8Array;
}): number {
  let count = 0;
  forEachHexNeighborOddQ(params.x, params.y, params.width, params.height, (nx, ny) => {
    const ni = ny * params.width + nx;
    if (params.landMask[ni] === 1 && params.mountainMask[ni] === 1) count += 1;
  });
  return count;
}

export function applyCiv7BuildElevationBoundaryPolicy(params: {
  width: number;
  height: number;
  landMask: Uint8Array;
  mountainMask: Uint8Array;
  mountainRegionMask: Uint8Array;
  hillMask: Uint8Array;
  elevation: Int16Array | Uint16Array | Int32Array | Float32Array | Float64Array | readonly number[];
  seaLevel?: number;
  polarWaterRows?: number;
  saddleElevationCeiling?: number;
}): BuildElevationBoundaryPolicyResult {
  const width = Math.max(0, params.width | 0);
  const height = Math.max(0, params.height | 0);
  const size = width * height;

  assertGridLength("landMask", params.landMask, size);
  assertGridLength("mountainMask", params.mountainMask, size);
  assertGridLength("mountainRegionMask", params.mountainRegionMask, size);
  assertGridLength("hillMask", params.hillMask, size);
  assertGridLength("elevation", params.elevation, size);

  const polarWaterRows = Math.max(
    0,
    Math.min(
      height,
      Math.trunc(params.polarWaterRows ?? CIV7_BUILD_ELEVATION_BOUNDARY_POLICY_V0.polarWaterRows)
    )
  );
  const seaLevel = Number.isFinite(params.seaLevel) ? Number(params.seaLevel) : 0;
  const saddleElevationCeiling = Number.isFinite(params.saddleElevationCeiling)
    ? Number(params.saddleElevationCeiling)
    : Math.max(seaLevel, CIV7_BUILD_ELEVATION_BOUNDARY_POLICY_V0.saddleElevationCeiling);
  const landMask = new Uint8Array(params.landMask);
  const policyCoastMask = new Uint8Array(size);
  let promotedLandToCoast = 0;

  if (polarWaterRows === 0 || width === 0 || height === 0) {
    return { landMask, policyCoastMask, promotedLandToCoast, polarWaterRows, saddleElevationCeiling };
  }

  for (let y = 0; y < height; y++) {
    const inPolarEdge = y < polarWaterRows || y >= height - polarWaterRows;
    if (!inPolarEdge) continue;

    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (params.landMask[idx] !== 1) continue;
      if (params.mountainRegionMask[idx] !== 1) continue;
      if (params.mountainMask[idx] === 1) continue;
      if (params.hillMask[idx] !== 1) continue;
      if ((params.elevation[idx] ?? 0) > saddleElevationCeiling) continue;

      const opposingHorizontalMountains = hasOpposingHorizontalMountains({
        x,
        y,
        width,
        landMask: params.landMask,
        mountainMask: params.mountainMask,
      });
      const mountainNeighborCount = countMountainNeighbors({
        x,
        y,
        width,
        height,
        landMask: params.landMask,
        mountainMask: params.mountainMask,
      });
      if (!opposingHorizontalMountains && mountainNeighborCount < 3) continue;

      landMask[idx] = 0;
      policyCoastMask[idx] = 1;
      promotedLandToCoast += 1;
    }
  }

  return { landMask, policyCoastMask, promotedLandToCoast, polarWaterRows, saddleElevationCeiling };
}
