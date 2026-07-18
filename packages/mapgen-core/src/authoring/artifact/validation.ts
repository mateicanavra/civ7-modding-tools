import type { TSchema } from "typebox";
import { Value } from "typebox/value";

import {
  isTypedArrayOf,
  type SupportedTypedArray,
  type TypedArrayConstructor,
} from "../typed-arrays.js";

export type ArtifactValidationIssue = Readonly<{ message: string }>;

export type ArtifactValidationContext = Readonly<{
  dimensions?: Readonly<{ width: number; height: number }>;
}>;

/** Projects TypeBox failures into the stable issue shape used by artifact admission. */
export function validateArtifactSchema(
  schema: TSchema,
  value: unknown
): readonly ArtifactValidationIssue[] {
  return Object.freeze(
    Array.from(Value.Errors(schema, value), (error) => {
      const path =
        (error as { path?: string; instancePath?: string }).path ??
        (error as { instancePath?: string }).instancePath ??
        "/";
      return { message: `${path} ${error.message}` };
    })
  );
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
