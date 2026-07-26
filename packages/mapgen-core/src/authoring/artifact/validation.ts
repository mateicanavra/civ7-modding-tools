import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";

import {
  isTypedArrayOf,
  type SupportedTypedArray,
  type TypedArrayConstructor,
} from "../schema/typed-array.js";

/** One stable, human-readable artifact admission failure. */
export type ArtifactValidationIssue = Readonly<{ message: string }>;

/** Runtime facts available to complete artifact admission checks. */
export type ArtifactValidationContext = Readonly<{
  dimensions?: Readonly<{ width: number; height: number }>;
}>;

/** Complete structural and semantic admission function owned by one artifact. */
export type ArtifactValidator = (
  value: unknown,
  context?: ArtifactValidationContext
) => readonly ArtifactValidationIssue[];

/** Optional relational or domain admission appended after an artifact's structural schema check. */
export type ArtifactRefinement = (
  value: unknown,
  context?: ArtifactValidationContext
) => readonly ArtifactValidationIssue[];

function freezeIssues(
  issues: Iterable<ArtifactValidationIssue>
): readonly ArtifactValidationIssue[] {
  return Object.freeze(Array.from(issues, (issue) => Object.freeze({ message: issue.message })));
}

function freezeLocalIssues(value: unknown): readonly ArtifactValidationIssue[] {
  const completion = classifyThenable(value);
  if (completion.kind !== "none") {
    containThenable(completion);
    throw new TypeError("Artifact refinements must return issues synchronously.");
  }
  if (!Array.isArray(value)) {
    throw new TypeError("Artifact refinements must return an array of issues.");
  }
  return freezeIssues(value);
}

function validateArtifactSchema(
  schema: TSchema,
  value: unknown
): readonly ArtifactValidationIssue[] {
  return freezeIssues(
    Array.from(Value.Errors(schema, value), (error) => {
      const path = error.instancePath || "/";
      return { message: `${path} ${error.message}` };
    })
  );
}

/** @internal Creates the complete validator retained by `defineArtifact`. */
export function createArtifactValidatorInternal(
  schema: TSchema,
  refine?: ArtifactRefinement
): ArtifactValidator {
  const validate = (
    value: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const structuralIssues = validateArtifactSchema(schema, value);
    if (structuralIssues.length > 0 || refine === undefined) return structuralIssues;
    const refinementIssues: unknown = refine(value, context);
    return freezeLocalIssues(refinementIssues);
  };

  return Object.freeze(validate);
}

/** Multiplies the already-admitted map dimensions available to an artifact validator. */
export function artifactCellCount(
  context: ArtifactValidationContext | undefined
): number | undefined {
  const dimensions = context?.dimensions;
  return dimensions ? dimensions.width * dimensions.height : undefined;
}

/**
 * Appends admission issues for an exact typed-array constructor and optional cardinality.
 *
 * The boolean return narrows the value for artifact-owned semantic checks. A cardinality
 * mismatch still returns true because the runtime constructor itself was admitted.
 */
export function appendArtifactTypedArrayIssues<T extends SupportedTypedArray>(
  issues: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  constructor: TypedArrayConstructor<T>,
  expectedLength?: number
): value is T {
  if (!isTypedArrayOf(value, constructor)) {
    const name = (constructor as { readonly name?: string }).name ?? "TypedArray";
    issues.push({ message: `Expected ${label} to be ${name}.` });
    return false;
  }
  if (expectedLength !== undefined && value.length !== expectedLength) {
    issues.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

/**
 * Appends admission issues for grid coordinates outside the admitted map or repeated in one set.
 *
 * Artifact schemas remain responsible for coordinate value shape. This helper owns only the
 * generic relational mechanics shared by immutable tile-indexed products.
 */
export function appendArtifactGridCoordinateIssues(
  issues: ArtifactValidationIssue[],
  label: string,
  coordinates: readonly Readonly<{ x: number; y: number }>[],
  dimensions: Readonly<{ width: number; height: number }> | undefined
): void {
  const seen = new Set<string>();

  for (const [index, coordinate] of coordinates.entries()) {
    const key = `${coordinate.x},${coordinate.y}`;
    if (seen.has(key)) {
      issues.push({ message: `${label}[${index}] duplicates the tile claim at ${key}.` });
    } else {
      seen.add(key);
    }

    if (
      dimensions &&
      (coordinate.x < 0 ||
        coordinate.x >= dimensions.width ||
        coordinate.y < 0 ||
        coordinate.y >= dimensions.height)
    ) {
      issues.push({
        message: `${label}[${index}] coordinate ${key} is outside ${dimensions.width}x${dimensions.height}.`,
      });
    }
  }
}
