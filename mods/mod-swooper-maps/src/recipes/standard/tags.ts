import type { DependencyEvidence, DependencyTagDefinition } from "@swooper/mapgen-core/authoring";
import { artifacts as placementArtifacts } from "./stages/placement/artifacts/index.js";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

export {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

type EffectTagSatisfiesProperties = Pick<DependencyTagDefinition, "satisfies">;

const VERIFIED_EFFECT_SATISFIES: Partial<Record<string, EffectTagSatisfiesProperties>> = {
  [STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied]: {
    satisfies: (evidence) => evidence.verifyEffect(),
  },
  [STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied]: {
    satisfies: (evidence) => isPlacementOutputSatisfied(evidence),
  },
};

/**
 * Runtime definitions for every Standard effect tag. Effects use adapter/artifact verification
 * where completion cannot be trusted by name; data dependencies are registered by their
 * step-selected Artifact authorities instead of this catalog.
 */
export const STANDARD_TAG_DEFINITIONS: readonly DependencyTagDefinition[] = [
  ...Object.values(MAP_PROJECTION_EFFECT_TAGS.map).map(effectTagDefinition),
  ...Object.values(PLACEMENT_PRODUCT_EFFECT_TAGS.placement).map(effectTagDefinition),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine).map(standardEngineEffectTagDefinition),
];

/** Registers the complete Standard dependency-tag vocabulary with the supplied recipe registry. */
export function registerStandardTags(registry: {
  registerTags: (definitions: readonly DependencyTagDefinition[]) => void;
}): void {
  registry.registerTags(STANDARD_TAG_DEFINITIONS);
}

function isPlacementOutputSatisfied(evidence: DependencyEvidence): boolean {
  const outputs = evidence.observeArtifact(placementArtifacts.placementOutputs);
  if (!outputs.found) return false;
  const assignment = evidence.observeArtifact(placementArtifacts.startAssignment);
  if (!assignment.found) return false;
  return (
    assignment.value.assigned === assignment.value.seats.length &&
    assignment.value.unseatedCount === 0 &&
    outputs.value.startsAssigned === assignment.value.assigned
  );
}

function effectTagDefinition(id: string): DependencyTagDefinition {
  return {
    id,
    kind: "effect",
  };
}

function standardEngineEffectTagDefinition(id: string): DependencyTagDefinition {
  return {
    ...effectTagDefinition(id),
    ...VERIFIED_EFFECT_SATISFIES[id],
  };
}
