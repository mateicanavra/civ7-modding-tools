import { artifact as climateDiagnosticsArtifact } from "./artifacts/climate-diagnostics.artifact.js";
import { artifact as climateIndicesArtifact } from "./artifacts/climate-indices.artifact.js";
import { artifact as cryosphereArtifact } from "./artifacts/cryosphere.artifact.js";

export { HydrologyClimateDiagnosticsSchema } from "./artifacts/climate-diagnostics.artifact.js";
export { HydrologyClimateIndicesSchema } from "./artifacts/climate-indices.artifact.js";
export { HydrologyCryosphereSchema } from "./artifacts/cryosphere.artifact.js";

export const hydrologyClimateRefineArtifacts = {
  climateIndices: climateIndicesArtifact,
  cryosphere: cryosphereArtifact,
  climateDiagnostics: climateDiagnosticsArtifact,
} as const;
