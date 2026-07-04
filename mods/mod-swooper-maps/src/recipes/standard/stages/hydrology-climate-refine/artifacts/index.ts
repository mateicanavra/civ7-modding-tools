import * as climateDiagnostics from "./climate-diagnostics.artifact.js";
import * as climateIndices from "./climate-indices.artifact.js";
import * as cryosphere from "./cryosphere.artifact.js";

export { climateDiagnostics, climateIndices, cryosphere };

export const artifactContracts = {
  climateDiagnostics,
  climateIndices,
  cryosphere,
} as const;

export const validators = {
  climateDiagnostics: climateDiagnostics.validate,
  climateIndices: climateIndices.validate,
  cryosphere: cryosphere.validate,
} as const;
