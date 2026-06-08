import { CIV7_BROWSER_TABLES_V0 } from "./civ7-tables.gen.js";
import { computeHexDistanceToMask } from "./policy-grid.js";

export const WATER_CLASS_LAND = 0;
export const WATER_CLASS_COAST = 1;
export const WATER_CLASS_OCEAN = 2;

type Civ7TablePolicyView = typeof CIV7_BROWSER_TABLES_V0 & {
  readonly mapGlobals?: {
    readonly oceanWaterColumns?: number;
  };
};

const CIV7_POLICY_TABLE = CIV7_BROWSER_TABLES_V0 as Civ7TablePolicyView;
const DEFAULT_CIV7_OCEAN_WATER_COLUMNS = 4;
const MAP_GLOBALS_SOURCE = "Base/modules/base-standard/maps/map-globals.js";

const policySources: readonly string[] = CIV7_POLICY_TABLE.source.includes(MAP_GLOBALS_SOURCE)
  ? CIV7_POLICY_TABLE.source
  : [...CIV7_POLICY_TABLE.source, MAP_GLOBALS_SOURCE];

/**
 * Static Civ7 terrain-classification policy evidence.
 *
 * The constants are generated from official resources, but the projection is
 * caller-owned: MapGen stamps the final water class so Civ7 does not need to
 * repair near-coast ocean tiles during validation/elevation.
 */
export const CIV7_COAST_CLASSIFICATION_POLICY_V0 = {
  version: 0,
  coastBufferTiles: CIV7_POLICY_TABLE.mapGlobals?.oceanWaterColumns ?? DEFAULT_CIV7_OCEAN_WATER_COLUMNS,
  source: policySources,
  rationale:
    "Civ7 normalizes shallow/near-coast ocean into coast terrain. MapGen should project a deterministic odd-q coast band before engine maintenance runs.",
} as const;

export type CoastClassificationPolicyResult = Readonly<{
  waterClass: Uint8Array;
  policyCoastMask: Uint8Array;
  promotedOceanToCoast: number;
  coastBufferTiles: number;
}>;

export function applyCiv7CoastClassificationPolicy(params: {
  width: number;
  height: number;
  waterClass: Uint8Array;
  coastBufferTiles?: number;
}): CoastClassificationPolicyResult {
  const width = Math.max(0, params.width | 0);
  const height = Math.max(0, params.height | 0);
  const size = width * height;
  if (params.waterClass.length !== size) {
    throw new Error(
      `[coastClassification] waterClass length ${params.waterClass.length} does not match ${size}.`
    );
  }

  const coastBufferTiles = Math.max(
    0,
    Math.min(
      64,
      Math.trunc(params.coastBufferTiles ?? CIV7_COAST_CLASSIFICATION_POLICY_V0.coastBufferTiles)
    )
  );
  if (coastBufferTiles === 0) {
    return {
      waterClass: new Uint8Array(params.waterClass),
      policyCoastMask: new Uint8Array(size),
      promotedOceanToCoast: 0,
      coastBufferTiles,
    };
  }

  const coastSeed = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    if ((params.waterClass[i] | 0) === WATER_CLASS_COAST) coastSeed[i] = 1;
  }

  const distanceToStampedCoast = computeHexDistanceToMask({
    mask: coastSeed,
    width,
    height,
    maxDistance: coastBufferTiles,
  });

  const waterClass = new Uint8Array(params.waterClass);
  const policyCoastMask = new Uint8Array(size);
  let promotedOceanToCoast = 0;
  for (let i = 0; i < size; i++) {
    if ((waterClass[i] | 0) !== WATER_CLASS_OCEAN) continue;
    const distance = distanceToStampedCoast[i] ?? 255;
    if (distance <= 0 || distance > coastBufferTiles) continue;
    waterClass[i] = WATER_CLASS_COAST;
    policyCoastMask[i] = 1;
    promotedOceanToCoast += 1;
  }

  return {
    waterClass,
    policyCoastMask,
    promotedOceanToCoast,
    coastBufferTiles,
  };
}
