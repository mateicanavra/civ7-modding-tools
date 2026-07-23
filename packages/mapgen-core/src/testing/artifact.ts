import { implementArtifacts } from "@mapgen/authoring/artifact/runtime.js";
import { type Artifact, type ArtifactValueOf } from "@mapgen/authoring/index.js";
import type { MapContext } from "@mapgen/core/map-context.js";

function isArtifactPublisher<A extends Artifact>(
  candidate: unknown,
  artifact: A
): candidate is Readonly<{
  artifact: A;
  publish: (context: MapContext, value: ArtifactValueOf<A>) => unknown;
}> {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "artifact" in candidate &&
    candidate.artifact === artifact &&
    "publish" in candidate &&
    typeof candidate.publish === "function"
  );
}

/**
 * Publishes test setup through an artifact's production validation and write-once path.
 * The caller must already own the MapContext execution lifecycle.
 */
export function publishTestArtifact<A extends Artifact>(
  context: MapContext,
  artifact: A,
  value: ArtifactValueOf<A>
): void {
  const runtimes = implementArtifacts([artifact] as const);
  const runtime = Object.values(runtimes).find((candidate) =>
    isArtifactPublisher(candidate, artifact)
  );
  if (!runtime) throw new Error(`Missing test artifact runtime for "${artifact.name}".`);
  runtime.publish(context, value);
}
