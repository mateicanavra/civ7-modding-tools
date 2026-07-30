import { publishArtifactValueInternal } from "@mapgen/authoring/artifact/runtime.js";
import { type Artifact, type ArtifactValueOf } from "@mapgen/authoring/index.js";
import type { MapContext } from "@mapgen/core/map-context.js";

/**
 * Publishes test setup through an artifact's production validation and write-once path.
 * The caller must already own the MapContext execution lifecycle.
 */
export function publishTestArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A,
  value: ArtifactValueOf<A>
): void {
  publishArtifactValueInternal(context, artifact, value);
}
