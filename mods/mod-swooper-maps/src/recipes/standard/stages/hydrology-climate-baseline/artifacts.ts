import { artifact as climateFieldArtifact } from "./artifacts/climate-field.artifact.js";
import { artifact as climateSeasonalityArtifact } from "./artifacts/climate-seasonality.artifact.js";
import { artifact as windFieldArtifact } from "./artifacts/wind-field.artifact.js";

export { ClimateFieldArtifactSchema } from "./artifacts/climate-field.artifact.js";
export { ClimateSeasonalityArtifactSchema } from "./artifacts/climate-seasonality.artifact.js";

export const hydrologyClimateBaselineArtifacts = {
  climateField: climateFieldArtifact,
  climateSeasonality: climateSeasonalityArtifact,
  windField: windFieldArtifact,
} as const;
