import type { CompletionId } from "@swooper/mapgen-core/authoring/contracts";

/** Causal edges for Standard engine-state prerequisites that no exact artifact expresses. */
export const STANDARD_COMPLETIONS = {
  coastsPlotted: "completion:map.coasts-plotted",
  continentsPlotted: "completion:map.continents-plotted",
  mountainsPlotted: "completion:map.mountains-plotted",
  volcanoesPlotted: "completion:map.volcanoes-plotted",
  rainfallProjected: "completion:map.rainfall-projected",
  elevationBuilt: "completion:map.elevation-built",
  riversPlotted: "completion:map.rivers-plotted",
  biomesApplied: "completion:engine.biomes-applied",
  featuresApplied: "completion:engine.features-applied",
  naturalWondersPlaced: "completion:placement.natural-wonders-placed",
  surfacePrepared: "completion:placement.surface-prepared",
  resourcesPlaced: "completion:placement.resources-placed",
  discoveriesPlaced: "completion:placement.discoveries-placed",
} as const satisfies Record<string, CompletionId>;
