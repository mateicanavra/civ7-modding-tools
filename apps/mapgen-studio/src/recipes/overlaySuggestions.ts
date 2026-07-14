import type { StudioRecipeId } from "./catalog";

export type OverlaySuggestion = Readonly<{
  id: string;
  primaryDataTypeKey: string;
  overlayDataTypeKey: string;
  label: string;
}>;

const SUGGESTIONS_BY_RECIPE: Readonly<Record<string, readonly OverlaySuggestion[]>> = {
  standard: [
    {
      id: "foundation.history.boundaryType::foundation.tectonics.boundaryType",
      primaryDataTypeKey: "foundation.history.boundaryType",
      overlayDataTypeKey: "foundation.tectonics.boundaryType",
      label: "Boundary events (snapshot)",
    },
    {
      id: "map.morphology.mountains.orogenyPotential::morphology.drivers.uplift",
      primaryDataTypeKey: "map.morphology.mountains.orogenyPotential",
      overlayDataTypeKey: "morphology.drivers.uplift",
      label: "Uplift driver",
    },
    // Placement (S7). Overlay candidates are gated on BOTH dataTypeKeys being
    // published by the selected step (App overlayCandidates + per-step
    // dataTypeModel), so every pair below is emitted by a single step:
    // assign-starts, plan-resources, or adjust-resources. The emitted-key
    // coverage guard lives in mods/mod-swooper-maps/test/recipes/swooper-physics-standard/stages/placement/viz-coverage.test.ts.
    {
      id: "placement.starts.viabilityScore::placement.starts.startPosition",
      primaryDataTypeKey: "placement.starts.viabilityScore",
      overlayDataTypeKey: "placement.starts.startPosition",
      label: "Start seats",
    },
    {
      id: "placement.starts.viabilityTier::placement.starts.startPosition",
      primaryDataTypeKey: "placement.starts.viabilityTier",
      overlayDataTypeKey: "placement.starts.startPosition",
      label: "Start seats",
    },
    {
      id: "placement.starts.viabilityScore::placement.starts.seatRung",
      primaryDataTypeKey: "placement.starts.viabilityScore",
      overlayDataTypeKey: "placement.starts.seatRung",
      label: "Seat rungs (fallback ladder)",
    },
    {
      id: "placement.resources.habitat.terrestrial::placement.resources.intents",
      primaryDataTypeKey: "placement.resources.habitat.terrestrial",
      overlayDataTypeKey: "placement.resources.intents",
      label: "Planned resource sites",
    },
    {
      id: "placement.resources.habitat.aquatic::placement.resources.intents",
      primaryDataTypeKey: "placement.resources.habitat.aquatic",
      overlayDataTypeKey: "placement.resources.intents",
      label: "Planned resource sites",
    },
    {
      id: "placement.resources.habitat.cultivated::placement.resources.intents",
      primaryDataTypeKey: "placement.resources.habitat.cultivated",
      overlayDataTypeKey: "placement.resources.intents",
      label: "Planned resource sites",
    },
    {
      id: "placement.resources.habitat.geological::placement.resources.intents",
      primaryDataTypeKey: "placement.resources.habitat.geological",
      overlayDataTypeKey: "placement.resources.intents",
      label: "Planned resource sites",
    },
    {
      id: "placement.resources.eligibleTypeCount::placement.resources.intents",
      primaryDataTypeKey: "placement.resources.eligibleTypeCount",
      overlayDataTypeKey: "placement.resources.intents",
      label: "Planned resource sites",
    },
    {
      id: "placement.starts.supportRadius::placement.resources.supportAdjustment",
      primaryDataTypeKey: "placement.starts.supportRadius",
      overlayDataTypeKey: "placement.resources.supportAdjustment",
      label: "Support adjustments",
    },
  ],
};

export function getOverlaySuggestions(recipeId: StudioRecipeId): readonly OverlaySuggestion[] {
  return SUGGESTIONS_BY_RECIPE[recipeId] ?? [];
}
