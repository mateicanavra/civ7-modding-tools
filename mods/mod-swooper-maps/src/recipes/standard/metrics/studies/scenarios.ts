import {
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/adapter";
import { stableStringify } from "@swooper/mapgen-core";

import {
  admitStandardMapConfig,
  canonicalMapConfigDigest,
  type StandardMapConfigEnvelope,
} from "../../../../maps/configs/canonical.js";
import shatteredRingRaw from "../../../../maps/configs/shattered-ring.config.json";
import sunderedArchipelagoRaw from "../../../../maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsRaw from "../../../../maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeRaw from "../../../../maps/configs/swooper-earthlike.config.json";
import { defineStandardMapMetricScenario, type StandardPresetMetricScenario } from "../scenario.js";

/** Stable identities admitted by the shipped Standard recipe study bank. */
export type ShippedStandardConfigurationId =
  | "swooper-earthlike"
  | "shattered-ring"
  | "sundered-archipelago"
  | "swooper-desert-mountains";

/** Shipped Standard configurations admitted once for every product-metrics study. */
export const SHIPPED_STANDARD_CONFIGURATIONS = Object.freeze([
  shippedConfiguration("swooper-earthlike", swooperEarthlikeRaw),
  shippedConfiguration("shattered-ring", shatteredRingRaw),
  shippedConfiguration("sundered-archipelago", sunderedArchipelagoRaw),
  shippedConfiguration("swooper-desert-mountains", swooperDesertMountainsRaw),
]);

/** Civ7 presets used by Standard product studies, admitted explicitly from canonical metadata. */
export const STANDARD_METRIC_PRESETS = Object.freeze({
  tiny: requirePreset("MAPSIZE_TINY"),
  small: requirePreset("MAPSIZE_SMALL"),
  standard: requirePreset("MAPSIZE_STANDARD"),
  large: requirePreset("MAPSIZE_LARGE"),
  huge: requirePreset("MAPSIZE_HUGE"),
});

/**
 * Constructs one admitted product scenario from a config, Civ7 preset, and seed.
 * Construction is pure; run-local reconciliation owns identity conflicts and capture deduplication.
 */
export function standardProductMetricScenario(
  config: StandardMapConfigEnvelope,
  preset: Civ7StandardMapSizePreset,
  seed: number
): StandardPresetMetricScenario {
  const id = `standard/${config.id}/${preset.id}/seed-${seed}`;
  return defineStandardMapMetricScenario({
    kind: "civ7-preset",
    id,
    config,
    preset,
    seed,
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
    seed: scenario.seed,
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

function requirePreset(id: Civ7StandardMapSizeId): Civ7StandardMapSizePreset {
  const preset = getCiv7StandardMapSizePreset(id);
  if (!preset) throw new Error(`Missing required Civ7 map-size metadata for ${id}.`);
  return preset;
}
