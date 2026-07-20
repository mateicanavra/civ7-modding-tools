import type { LaunchEnvelopeDigest, LaunchSourceDigest } from "@civ7/studio-contract";
import type { StudioRunGenerationManifest } from "./generationManifest.js";
import type { RunArtifactId } from "./paths.js";

export type RunCorrelation = Readonly<{
  requestId: string;
  runArtifactId: RunArtifactId;
  launchSourceDigest: LaunchSourceDigest;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
  generationManifestDigest: string;
}>;

export function runCorrelationForManifest(manifest: StudioRunGenerationManifest): RunCorrelation {
  return {
    requestId: manifest.payload.requestId,
    runArtifactId: manifest.payload.runArtifactId,
    launchSourceDigest: manifest.payload.launchSourceDigest,
    launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
    generationManifestDigest: manifest.generationManifestDigest,
  };
}
