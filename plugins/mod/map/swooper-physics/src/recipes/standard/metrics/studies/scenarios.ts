import {
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import { stableStringify } from "@swooper/mapgen-core";

import {
  admitStandardMapConfig,
  canonicalMapConfigDigest,
  type StandardMapConfigEnvelope,
} from "../../../../maps/configs/canonical.js";
import { MAP_CONFIG_CATALOG_IDS } from "../../../../maps/catalog/membership.js";
import latestJuicyRaw from "../../../../maps/configs/latest-juicy.config.json";
import mountainPatchRaw from "../../../../maps/configs/mountain-patch.config.json";
import mountainsOfTimeEarthlikeRaw from "../../../../maps/configs/mountains-of-time-earthlike.config.json";
import mountainsOfTimeOriginalRaw from "../../../../maps/configs/mountains-of-time-original.config.json";
import shatteredRingRaw from "../../../../maps/configs/shattered-ring.config.json";
import sunderedArchipelagoRaw from "../../../../maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsRaw from "../../../../maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeRaw from "../../../../maps/configs/swooper-earthlike.config.json";
import { defineStandardMapMetricScenario, type StandardPresetMetricScenario } from "../scenario.js";

/** Explicit per-run identity axes retained by one headless Standard product scenario. */
export type StandardMetricScenarioIdentity = Readonly<{
  mapSeed: number;
  gameSeed: number;
  aliveMajorPlayerIds: readonly number[];
}>;

/** Stable identities admitted by the shipped Standard recipe study bank. */
export type ShippedStandardConfigurationId = (typeof MAP_CONFIG_CATALOG_IDS)[number];

const SHIPPED_STANDARD_CONFIGURATION_SOURCES = {
  "swooper-desert-mountains": swooperDesertMountainsRaw,
  "swooper-earthlike": swooperEarthlikeRaw,
  "shattered-ring": shatteredRingRaw,
  "sundered-archipelago": sunderedArchipelagoRaw,
  "mountains-of-time-earthlike": mountainsOfTimeEarthlikeRaw,
  "latest-juicy": latestJuicyRaw,
  "mountain-patch": mountainPatchRaw,
  "mountains-of-time-original": mountainsOfTimeOriginalRaw,
} as const satisfies Readonly<Record<ShippedStandardConfigurationId, unknown>>;

/**
 * Every durable catalog configuration, admitted once in catalog order for product-metrics studies.
 *
 * Broad integrity, geography, and identity studies consume this complete set.
 */
export const SHIPPED_STANDARD_CONFIGURATIONS = Object.freeze(
  MAP_CONFIG_CATALOG_IDS.map((id) =>
    shippedConfiguration(id, SHIPPED_STANDARD_CONFIGURATION_SOURCES[id])
  )
);

/** Civ7 presets used by Standard product studies, admitted explicitly from canonical metadata. */
export const STANDARD_METRIC_PRESETS = Object.freeze({
  tiny: getCiv7StandardMapSizePreset("MAPSIZE_TINY"),
  small: getCiv7StandardMapSizePreset("MAPSIZE_SMALL"),
  standard: getCiv7StandardMapSizePreset("MAPSIZE_STANDARD"),
  large: getCiv7StandardMapSizePreset("MAPSIZE_LARGE"),
  huge: getCiv7StandardMapSizePreset("MAPSIZE_HUGE"),
});

/**
 * Ordered player identities selected by the Standard study bank for each official Civ7 preset.
 *
 * These are study inputs, not values synthesized by the adapter during generation.
 */
const STANDARD_METRIC_PLAYER_IDS = Object.freeze({
  MAPSIZE_TINY: Object.freeze([0, 1, 2, 3]),
  MAPSIZE_SMALL: Object.freeze([0, 1, 2, 3, 4, 5]),
  MAPSIZE_STANDARD: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7]),
  MAPSIZE_LARGE: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  MAPSIZE_HUGE: Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
}) satisfies Readonly<Record<Civ7StandardMapSizeId, readonly number[]>>;

/**
 * Selects explicit seed axes and the study bank's ordered player identities for one Civ7 preset.
 *
 * Map and game seeds remain separate parameters even when a study intentionally gives them the
 * same numeric value.
 */
export function standardMetricScenarioIdentity(
  preset: Civ7StandardMapSizePreset,
  mapSeed: number,
  gameSeed: number
): StandardMetricScenarioIdentity {
  return Object.freeze({
    mapSeed,
    gameSeed,
    aliveMajorPlayerIds: STANDARD_METRIC_PLAYER_IDS[preset.id],
  });
}

/**
 * Constructs one admitted product scenario from a config, Civ7 preset, and complete run identity.
 * Construction is pure; run-local reconciliation owns identity conflicts and capture deduplication.
 */
export function standardProductMetricScenario(
  config: StandardMapConfigEnvelope,
  preset: Civ7StandardMapSizePreset,
  identity: StandardMetricScenarioIdentity
): StandardPresetMetricScenario {
  const playerIdentity = identity.aliveMajorPlayerIds.join("-");
  const id =
    `standard/${config.id}/${preset.id}` +
    `/map-${identity.mapSeed}/game-${identity.gameSeed}/players-${playerIdentity}`;
  return defineStandardMapMetricScenario({
    kind: "civ7-preset",
    id,
    config,
    preset,
    ...identity,
  }) as StandardPresetMetricScenario;
}

/**
 * Produces the stable semantic signature used to detect conflicting scenario definitions.
 * The config digest and complete preset metadata ensure an ID cannot hide changed product inputs.
 */
export function standardMetricScenarioSignature(scenario: StandardPresetMetricScenario): string {
  return stableStringify({
    id: scenario.id,
    kind: scenario.kind,
    configurationId: scenario.config.id,
    configurationDigest: canonicalMapConfigDigest(scenario.config),
    mapSeed: scenario.mapSeed,
    gameSeed: scenario.gameSeed,
    aliveMajorPlayerIds: scenario.aliveMajorPlayerIds,
    preset: scenario.preset,
  });
}

function shippedConfiguration(
  expectedId: ShippedStandardConfigurationId,
  raw: unknown
): Readonly<{ id: ShippedStandardConfigurationId; config: StandardMapConfigEnvelope }> {
  const config = admitStandardMapConfig(raw);
  if (config.id !== expectedId) {
    throw new Error(`Expected shipped Standard config ${expectedId}, received ${config.id}.`);
  }
  return Object.freeze({ id: expectedId, config });
}
