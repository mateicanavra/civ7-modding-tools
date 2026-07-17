import type { ExtendedMapContext } from "@mapgen/core/types.js";

import type { ArtifactContract, ArtifactReadValueOf } from "./contract.js";
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  validateArtifactSchema,
} from "./validation.js";

/** A registered artifact contract paired with the validator that admits its stored value. */
export type ArtifactModule<C extends ArtifactContract> = Readonly<{
  artifact: C;
  validate: (
    value: unknown,
    context?: ArtifactValidationContext
  ) => readonly ArtifactValidationIssue[];
}>;

/**
 * Reads and validates one stored artifact for tooling or observation outside a step runtime.
 * The contract schema owns structural narrowing before the module validator applies semantic
 * invariants. This function neither snapshots the value nor invents missing evidence, so callers
 * that cross a mutable boundary must copy what they consume.
 */
export function readValidatedArtifact<C extends ArtifactContract>(
  context: ExtendedMapContext,
  module: ArtifactModule<C>
): ArtifactReadValueOf<C> {
  if (!context.artifacts.has(module.artifact.id)) {
    throw new Error(`Missing required artifact ${module.artifact.id}.`);
  }
  const value: unknown = context.artifacts.get(module.artifact.id);
  const schemaIssues = validateArtifactSchema(module.artifact.schema, value);
  const issues =
    schemaIssues.length > 0
      ? schemaIssues
      : module.validate(value, { dimensions: context.dimensions });
  if (issues.length > 0) {
    throw new Error(
      `Invalid artifact ${module.artifact.id}: ${issues.map(({ message }) => message).join("; ")}`
    );
  }
  return value as ArtifactReadValueOf<C>;
}
