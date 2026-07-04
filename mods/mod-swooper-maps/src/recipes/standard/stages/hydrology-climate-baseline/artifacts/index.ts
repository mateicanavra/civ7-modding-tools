import * as climateField from "./climate-field.artifact.js";
import * as climateSeasonality from "./climate-seasonality.artifact.js";
import * as windField from "./wind-field.artifact.js";

export { climateField, climateSeasonality, windField };

export const artifactContracts = {
  climateField,
  climateSeasonality,
  windField,
} as const;

export const validators = {
  climateField: climateField.validate,
  climateSeasonality: climateSeasonality.validate,
  windField: windField.validate,
} as const;
