import { artifactContracts as hydrologyClimateRefineArtifactContracts } from "./artifacts/index.js";

export { HydrologyClimateDiagnosticsSchema } from "./artifacts/climate-diagnostics.artifact.js";
export { HydrologyClimateIndicesSchema } from "./artifacts/climate-indices.artifact.js";
export { HydrologyCryosphereSchema } from "./artifacts/cryosphere.artifact.js";

export const hydrologyClimateRefineArtifacts = {
  climateIndices: hydrologyClimateRefineArtifactContracts.climateIndices.artifact,
  cryosphere: hydrologyClimateRefineArtifactContracts.cryosphere.artifact,
  climateDiagnostics: hydrologyClimateRefineArtifactContracts.climateDiagnostics.artifact,
} as const;
