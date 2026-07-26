import { CIV7_BROWSER_TABLES_V0 } from "../civ7-tables.gen.js";
import {
  getNaturalWonderFootprintOffsetsByParity,
  hasUnsupportedNaturalWonderPolicyTags,
  type NaturalWonderFootprintOffset,
  resolveNaturalWonderMaterializationDirection,
  resolveNaturalWonderPlacementDirection,
} from "../natural-wonder-footprints.js";
import type { NaturalWonderCatalogEntry } from "../types.js";

/**
 * Generated natural-wonder catalog, const-backed to avoid runtime reads.
 * Source: feature order is stable per `CIV7_BROWSER_TABLES_V0.featureTypes`;
 * support is derived from generated Civ feature policy rows.
 */
const { featureTypes } = CIV7_BROWSER_TABLES_V0;
const featurePolicies = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
  string,
  | {
      noLake?: boolean;
      minimumElevation?: number;
      placementClass?: string;
      naturalWonderDirection?: number;
      naturalWonderTiles?: number;
      naturalWonderPlaceFirst?: boolean;
    }
  | undefined
>;
const featureTags = CIV7_BROWSER_TABLES_V0.featureTagsByFeatureType as Record<
  string,
  readonly string[] | undefined
>;
const validTerrainTypes = CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices as Record<
  string,
  readonly number[] | undefined
>;
const validBiomeTypes = CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices as Record<
  string,
  readonly number[] | undefined
>;

function naturalWonderDirection(featureType: number): number {
  return resolveNaturalWonderPlacementDirection(featurePolicies[String(featureType)] ?? {});
}

function freezeNumbers(values: readonly number[] | undefined): readonly number[] {
  return Object.freeze([...(values ?? [])]);
}

function freezeStrings(values: readonly string[] | undefined): readonly string[] {
  return Object.freeze([...(values ?? [])]);
}

function freezeFootprint(
  offsets: readonly NaturalWonderFootprintOffset[]
): readonly NaturalWonderFootprintOffset[] {
  return Object.freeze(offsets.map(({ dx, dy }) => Object.freeze({ dx, dy })));
}

function naturalWonderCatalogEntry(featureType: number): NaturalWonderCatalogEntry | null {
  const policy = featurePolicies[String(featureType)];
  if (!policy || !policy.naturalWonderTiles) return null;
  if (hasUnsupportedNaturalWonderPolicyTags(featureTags[String(featureType)])) return null;

  const direction = resolveNaturalWonderMaterializationDirection(
    policy,
    naturalWonderDirection(featureType)
  );
  const footprintOffsetsByParity = getNaturalWonderFootprintOffsetsByParity(policy, direction);
  if (!footprintOffsetsByParity) return null;

  return Object.freeze({
    featureType,
    direction,
    validTerrainTypes: freezeNumbers(validTerrainTypes[String(featureType)]),
    validBiomeTypes: freezeNumbers(validBiomeTypes[String(featureType)]),
    ...(policy.minimumElevation !== undefined ? { minimumElevation: policy.minimumElevation } : {}),
    ...(policy.noLake ? { noLake: true as const } : {}),
    ...(policy.naturalWonderPlaceFirst ? { placeFirst: true as const } : {}),
    featureTags: freezeStrings(featureTags[String(featureType)]),
    footprintOffsetsByParity: Object.freeze({
      even: freezeFootprint(footprintOffsetsByParity.even),
      odd: freezeFootprint(footprintOffsetsByParity.odd),
    }),
  });
}

/**
 * Planner-ready Civ7 natural-wonder policy in stable feature-type order.
 *
 * Each deeply frozen row includes only data consumed by natural-wonder planning:
 * emitted direction, legal terrain/biome surfaces, placement tags, priority,
 * and parity-aware footprint geometry.
 */
export const NATURAL_WONDER_CATALOG: readonly NaturalWonderCatalogEntry[] = Object.freeze(
  Object.values(featureTypes)
    .map((featureType) => Math.trunc(featureType))
    .filter((featureType) => Number.isFinite(featureType))
    .map(naturalWonderCatalogEntry)
    .filter((entry): entry is NaturalWonderCatalogEntry => entry !== null)
    .sort((a, b) => a.featureType - b.featureType)
);

/**
 * Builds the static Civ7 exclusion surface for natural-wonder planning.
 *
 * Civ7 reserves the generated polar-water row count at both map edges. The
 * returned map-grid mask marks those rows with `1` and every admitted interior
 * tile with `0`.
 */
export function buildNaturalWonderBlockedMask(width: number, height: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const polarWaterRows = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);
  if (polarWaterRows === 0) return mask;

  for (let y = 0; y < height; y++) {
    if (y >= polarWaterRows && y < height - polarWaterRows) continue;
    const rowStart = y * width;
    mask.fill(1, rowStart, rowStart + width);
  }
  return mask;
}
