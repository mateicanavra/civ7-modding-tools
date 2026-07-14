import type { LaunchEnvelopeDigest } from "@civ7/studio-contract";
import type { StudioRunGenerationManifest } from "./generationManifest.js";
import type { RunArtifactId } from "./paths.js";

export type RunCorrelation = Readonly<{
  requestId: string;
  runArtifactId: RunArtifactId;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
  generationManifestDigest: string;
}>;

export function runCorrelationForManifest(manifest: StudioRunGenerationManifest): RunCorrelation {
  return {
    requestId: manifest.payload.requestId,
    runArtifactId: manifest.payload.runArtifactId,
    canonicalConfigDigest: manifest.payload.canonicalConfigDigest,
    launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
    generationManifestDigest: manifest.generationManifestDigest,
  };
}
