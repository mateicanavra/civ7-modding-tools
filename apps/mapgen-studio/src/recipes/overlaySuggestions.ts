import type { StudioRecipeId } from "./catalog";

export type OverlaySuggestion = Readonly<{
  id: string;
  primaryDataTypeKey: string;
  overlayDataTypeKey: string;
  label: string;
}>;

const SUGGESTIONS_BY_RECIPE: Readonly<Record<string, readonly OverlaySuggestion[]>> = {
  "mod-swooper-maps/standard": [
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
  ],
  "mod-swooper-maps/browser-test": [
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
  ],
};

export function getOverlaySuggestions(recipeId: StudioRecipeId): readonly OverlaySuggestion[] {
  return SUGGESTIONS_BY_RECIPE[recipeId] ?? [];
}
