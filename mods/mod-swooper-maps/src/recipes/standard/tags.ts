import type { EffectDependencyTag } from "@swooper/mapgen-core/authoring";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

type EffectTagSatisfiesProperties = Pick<EffectDependencyTag, "satisfies">;

const VERIFIED_EFFECT_SATISFIES: Partial<Record<string, EffectTagSatisfiesProperties>> = {
  [STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied]: {
    satisfies: (evidence) => evidence.verifyEffect(),
  },
};

/**
 * Runtime definitions for every Standard effect tag. Biome completion verifies adapter evidence;
 * other effects are committed by successful provider execution. Data dependencies are registered
 * by their step-selected Artifact authorities instead of this catalog.
 */
export const STANDARD_TAG_DEFINITIONS: readonly EffectDependencyTag[] = [
  ...Object.values(MAP_PROJECTION_EFFECT_TAGS.map).map(effectTagDefinition),
  ...Object.values(PLACEMENT_PRODUCT_EFFECT_TAGS.placement).map(effectTagDefinition),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine).map(verifiedEffectTagDefinition),
];

function effectTagDefinition(id: string): EffectDependencyTag {
  return {
    id,
    kind: "effect",
  };
}

function verifiedEffectTagDefinition(id: string): EffectDependencyTag {
  return {
    ...effectTagDefinition(id),
    ...VERIFIED_EFFECT_SATISFIES[id],
  };
}
