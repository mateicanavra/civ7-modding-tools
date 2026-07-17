import * as climateField from "./climate-field.artifact.js";
import * as climateSeasonality from "./climate-seasonality.artifact.js";
import * as windField from "./wind-field.artifact.js";

export { climateField, climateSeasonality, windField };

/** Full baseline-climate modules exposing schemas, artifact handles, and validators. */
export const artifactContracts = {
  climateField,
  climateSeasonality,
  windField,
} as const;

/**
 * Baseline-climate artifact handles shared by refinement and Ecology. The catalog exposes one
 * registered identity for climate, seasonality, and internal wind/current fields.
 */
export const artifacts = {
  climateField: climateField.artifact,
  climateSeasonality: climateSeasonality.artifact,
  windField: windField.artifact,
} as const;

/** Validators keyed exactly like the baseline-climate artifacts they admit. */
export const validators = {
  climateField: climateField.validate,
  climateSeasonality: climateSeasonality.validate,
  windField: windField.validate,
} as const;
