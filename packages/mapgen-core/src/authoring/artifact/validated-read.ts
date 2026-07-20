import type { MapContext } from "@mapgen/core/map-context.js";

import type { ArtifactContract, ArtifactReadValueOf } from "./contract.js";
import type { ArtifactModule } from "./module.js";

/**
 * Reads and validates one stored artifact for tooling or observation outside a step runtime.
 * The module's complete validator owns structural and semantic admission. This function neither
 * snapshots the value nor invents missing evidence, so callers that cross a mutable boundary must
 * copy what they consume.
 */
export function readValidatedArtifact<C extends ArtifactContract>(
  context: MapContext,
  module: ArtifactModule<C>
): ArtifactReadValueOf<C> {
  if (!context.artifacts.has(module.artifact.id)) {
    throw new Error(`Missing required artifact ${module.artifact.id}.`);
  }
  const value: unknown = context.artifacts.get(module.artifact.id);
  const issues = module.validate(value, { dimensions: context.setup.dimensions });
  if (issues.length > 0) {
    throw new Error(
      `Invalid artifact ${module.artifact.id}: ${issues.map(({ message }) => message).join("; ")}`
    );
  }
  return value as ArtifactReadValueOf<C>;
}
