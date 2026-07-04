import { artifactContracts as hydrologyClimateBaselineArtifactContracts } from "./artifacts/index.js";

export { ClimateFieldArtifactSchema } from "./artifacts/climate-field.artifact.js";
export { ClimateSeasonalityArtifactSchema } from "./artifacts/climate-seasonality.artifact.js";

export const hydrologyClimateBaselineArtifacts = {
  climateField: hydrologyClimateBaselineArtifactContracts.climateField.artifact,
  climateSeasonality: hydrologyClimateBaselineArtifactContracts.climateSeasonality.artifact,
  windField: hydrologyClimateBaselineArtifactContracts.windField.artifact,
} as const;
