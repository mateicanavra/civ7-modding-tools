import {
  type ArtifactContract,
  type ArtifactModule,
  type ArtifactValueOf,
  implementArtifactModules,
} from "@mapgen/authoring/index.js";
import type { MapContext } from "@mapgen/core/map-context.js";

function isArtifactPublisher<C extends ArtifactContract>(
  candidate: unknown,
  contract: C
): candidate is Readonly<{
  contract: C;
  publish: (context: MapContext, value: ArtifactValueOf<C>) => unknown;
}> {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "contract" in candidate &&
    candidate.contract === contract &&
    "publish" in candidate &&
    typeof candidate.publish === "function"
  );
}

/**
 * Publishes test setup through an artifact module's production validation and write-once path.
 * The caller must already own the MapContext execution lifecycle.
 */
export function publishTestArtifact<C extends ArtifactContract>(
  context: MapContext,
  module: ArtifactModule<C>,
  value: ArtifactValueOf<C>
): void {
  const runtimes = implementArtifactModules([module] as const);
  const runtime = Object.values(runtimes).find((candidate) =>
    isArtifactPublisher(candidate, module.artifact)
  );
  if (!runtime) throw new Error(`Missing test artifact runtime for "${module.artifact.name}".`);
  runtime.publish(context, value);
}
