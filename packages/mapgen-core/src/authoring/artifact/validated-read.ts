import type { MapContext } from "@mapgen/core/map-context.js";

import type { ArtifactContract, ArtifactReadValueOf } from "./contract.js";
import { type ArtifactModule, snapshotArtifactModule } from "./module.js";

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
  const snapshot = snapshotArtifactModule(module, "artifact module");
  const artifact = snapshot.artifact;
  const validate = snapshot.validate;
  if (!context.artifacts.has(artifact.id)) {
    throw new Error(`Missing required artifact ${artifact.id}.`);
  }
  const value: unknown = context.artifacts.get(artifact.id);
  const issues = validate(value, { dimensions: context.setup.dimensions });
  if (issues.length > 0) {
    throw new Error(
      `Invalid artifact ${artifact.id}: ${issues.map(({ message }) => message).join("; ")}`
    );
  }
  return value as ArtifactReadValueOf<C>;
}
