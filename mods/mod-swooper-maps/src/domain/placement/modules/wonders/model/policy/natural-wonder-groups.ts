import { NATURAL_WONDER_CATALOG } from "@civ7/map-policy";
import { clamp01 } from "@swooper/mapgen-core";

export type WonderGroup = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I";

export type GroupSuitabilitySignals = {
  relief: number;
  elevN: number;
  arid: number;
  warm: number;
  temperate: number;
  vegN: number;
  fertN: number;
  dischN: number;
  slopeN: number;
  shelfN: number;
  deepN: number;
  moist: number;
};

export type WonderGroupDefinition = {
  features: readonly number[];
  suitability: (signals: GroupSuitabilitySignals) => number;
};

/**
 * Load-bearing natural-wonder suitability policy grouped by shared physical requirements. Each
 * formula maps normalized terrain, climate, and ecology signals into [0, 1]; catalog coverage
 * is asserted below so a supported wonder cannot silently bypass grouping.
 */
export const WONDER_GROUPS: Readonly<Record<WonderGroup, WonderGroupDefinition>> = {
  A: {
    features: [35, 41],
    suitability: (s) => clamp01(0.55 * s.relief + 0.35 * s.elevN + 0.1 * s.warm),
  },
  B: {
    features: [37],
    suitability: (s) => clamp01(0.5 * s.shelfN + 0.3 * s.relief + 0.2 * s.warm),
  },
  C: {
    features: [29, 44, 45],
    suitability: (s) => clamp01(0.55 * s.shelfN + 0.3 * s.warm + 0.15 * (1 - s.arid)),
  },
  D: { features: [0], suitability: (s) => clamp01(0.7 * s.deepN + 0.3 * (1 - s.arid)) },
  E: {
    features: [32, 34],
    suitability: (s) => clamp01(0.45 * s.dischN + 0.3 * s.slopeN + 0.25 * s.relief),
  },
  F: {
    features: [1, 33, 36, 38, 40, 42, 43],
    suitability: (s) => clamp01(0.5 * s.elevN + 0.4 * s.relief + 0.1 * (1 - s.vegN)),
  },
  G: {
    features: [28],
    suitability: (s) => clamp01(0.45 * s.fertN + 0.3 * s.moist + 0.25 * (1 - s.relief)),
  },
  H: {
    features: [31, 39],
    suitability: (s) => clamp01(0.5 * s.arid + 0.3 * s.elevN + 0.2 * s.relief),
  },
  I: {
    features: [30],
    suitability: (s) => clamp01(0.55 * s.vegN + 0.3 * s.moist + 0.15 * s.temperate),
  },
};

const WONDER_GROUP_BY_FEATURE: ReadonlyMap<number, WonderGroup> = new Map(
  (Object.entries(WONDER_GROUPS) as Array<[WonderGroup, WonderGroupDefinition]>).flatMap(
    ([group, definition]) =>
      definition.features.map((featureType): [number, WonderGroup] => [featureType, group])
  )
);

/**
 * Official wonder feature IDs that lack a physical-suitability group. Module initialization
 * rejects any entry so catalog growth cannot silently bypass placement policy.
 */
export const NATURAL_WONDER_GROUP_POLICY_GAPS = NATURAL_WONDER_CATALOG.map(
  (entry) => entry.featureType
).filter((featureType) => !WONDER_GROUP_BY_FEATURE.has(featureType));

if (NATURAL_WONDER_GROUP_POLICY_GAPS.length > 0) {
  throw new Error(
    `Missing natural wonder group policy for supported feature ids: ${NATURAL_WONDER_GROUP_POLICY_GAPS.join(
      ", "
    )}`
  );
}

/**
 * Returns the physical-requirement group for an official natural-wonder feature ID. Unknown
 * IDs fail closed because an ungrouped wonder has no admitted suitability formula.
 */
export function wonderGroup(featureType: number): WonderGroup {
  const group = WONDER_GROUP_BY_FEATURE.get(featureType);
  if (group !== undefined) return group;
  throw new Error(`Missing natural wonder group policy for feature id: ${featureType}`);
}
