import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import type { DependencyEvidence, DependencyTagDefinition } from "@swooper/mapgen-core/authoring";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

export { STANDARD_ENGINE_EFFECT_TAGS } from "./tag-contracts.js";

type EffectTagSatisfiesProperties = Pick<DependencyTagDefinition, "satisfies">;

const VERIFIED_EFFECT_SATISFIES: Partial<Record<string, EffectTagSatisfiesProperties>> = {
  [STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied]: {
    satisfies: (evidence) => evidence.verifyEffect(),
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned]: {
    satisfies: (evidence) => isStartAssignmentSatisfied(evidence),
  },
};

/**
 * Runtime definitions for every Standard effect tag. Biome completion verifies
 * adapter evidence; start completion verifies the domain-owned assignment.
 * Data dependencies are registered by their step-selected Artifact authorities
 * instead of this catalog.
 */
export const STANDARD_TAG_DEFINITIONS: readonly DependencyTagDefinition[] = [
  ...Object.values(MAP_PROJECTION_EFFECT_TAGS.map).map(effectTagDefinition),
  ...Object.values(PLACEMENT_PRODUCT_EFFECT_TAGS.placement).map(verifiedEffectTagDefinition),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine).map(verifiedEffectTagDefinition),
];

/** Requires canonical start evidence to assign every seat with zero unseated players. */
function isStartAssignmentSatisfied(evidence: DependencyEvidence): boolean {
  const assignment = evidence.observeArtifact(placementStartArtifacts.startAssignment);
  if (!assignment.found) return false;
  return (
    assignment.value.seats.length > 0 &&
    assignment.value.assigned === assignment.value.seats.length &&
    assignment.value.unseatedCount === 0
  );
}

function effectTagDefinition(id: string): DependencyTagDefinition {
  return {
    id,
    kind: "effect",
  };
}

function verifiedEffectTagDefinition(id: string): DependencyTagDefinition {
  return {
    ...effectTagDefinition(id),
    ...VERIFIED_EFFECT_SATISFIES[id],
  };
}
