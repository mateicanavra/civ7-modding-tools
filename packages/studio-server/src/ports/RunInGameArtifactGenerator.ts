import type { StudioRunGenerationManifestReference } from "@civ7/studio-run-workspace";
import type { RunInGameGeneratedMod } from "./workflowTypes.js";

export type RunInGameArtifactGenerator = Readonly<{
  generateRunInGameMod(
    args: Readonly<{
      generationManifest: StudioRunGenerationManifestReference;
      signal?: AbortSignal;
    }>
  ): Promise<RunInGameGeneratedMod>;
}>;
