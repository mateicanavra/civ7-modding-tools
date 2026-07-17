import * as climateDiagnostics from "./climate-diagnostics.artifact.js";
import * as climateIndices from "./climate-indices.artifact.js";
import * as cryosphere from "./cryosphere.artifact.js";

export { climateDiagnostics, climateIndices, cryosphere };

/** Full refined-climate modules exposing schemas, artifact handles, and validators. */
export const artifactContracts = {
  climateDiagnostics,
  climateIndices,
  cryosphere,
} as const;

/**
 * Refined-climate artifact handles consumed by Ecology and diagnostics. The catalog keeps
 * climate indices, cryosphere, and diagnostics on one post-refinement vintage.
 */
export const artifacts = {
  climateDiagnostics: climateDiagnostics.artifact,
  climateIndices: climateIndices.artifact,
  cryosphere: cryosphere.artifact,
} as const;

/** Validators keyed exactly like the refined-climate artifacts they admit. */
export const validators = {
  climateDiagnostics: climateDiagnostics.validate,
  climateIndices: climateIndices.validate,
  cryosphere: cryosphere.validate,
} as const;
