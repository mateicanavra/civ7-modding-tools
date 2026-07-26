import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";

import {
  isTypedArrayOf,
  type SupportedTypedArray,
  type TypedArrayConstructor,
} from "../typed-arrays.js";
import { bindArtifactValidator, isArtifactValidatorBoundTo } from "./authority.js";
import { type ArtifactContract, assertCanonicalArtifactContract } from "./contract.js";

/** One stable, human-readable artifact admission failure. */
export type ArtifactValidationIssue = Readonly<{ message: string }>;

/** Runtime facts available to complete artifact admission checks. */
export type ArtifactValidationContext = Readonly<{
  dimensions?: Readonly<{ width: number; height: number }>;
}>;

declare const artifactValidatorBrand: unique symbol;

/**
 * Complete admission validator bound to one artifact contract.
 *
 * Validators can be created only through `defineArtifactValidator`, preventing a module from
 * accidentally pairing an artifact with a plain or differently bound validation function.
 */
export type ArtifactValidator<C extends ArtifactContract = ArtifactContract> = ((
  value: unknown,
  context?: ArtifactValidationContext
) => readonly ArtifactValidationIssue[]) &
  Readonly<{ [artifactValidatorBrand]: C }>;

type LocalArtifactValidator = (
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
    throw new TypeError("Artifact-local validators must return issues synchronously.");
  }
  if (!Array.isArray(value)) {
    throw new TypeError("Artifact-local validators must return an array of issues.");
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

/**
 * Creates the complete validator for one artifact contract.
 *
 * The contract's immutable canonical schema always runs first. Artifact-local checks run only
 * after structural admission succeeds, but still receive `unknown` because permissive schema
 * nodes may not prove their runtime invariants. Every result and issue is copied and frozen,
 * preserving issue order without retaining caller-owned objects.
 */
export function defineArtifactValidator<const C extends ArtifactContract>(
  artifact: C,
  local?: LocalArtifactValidator
): ArtifactValidator<C> {
  assertCanonicalArtifactContract(artifact);
  const validate = (
    value: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const structuralIssues = validateArtifactSchema(artifact.schema, value);
    if (structuralIssues.length > 0 || local === undefined) return structuralIssues;
    const localIssues: unknown = local(value, context);
    return freezeLocalIssues(localIssues);
  };

  bindArtifactValidator(validate, artifact);
  return Object.freeze(validate) as ArtifactValidator<C>;
}

/**
 * Refuses an artifact module whose validator was constructed for a different contract object.
 * This runtime identity check closes type-erased module boundaries without exposing validator
 * metadata or accepting merely shape-compatible artifact contracts.
 */
export function assertArtifactValidatorBoundTo<const C extends ArtifactContract>(
  artifact: C,
  validator: unknown
): asserts validator is ArtifactValidator<C> {
  assertCanonicalArtifactContract(artifact);
  if (typeof validator !== "function" || !isArtifactValidatorBoundTo(validator, artifact)) {
    throw new Error(`artifact validator must be bound to exact contract "${artifact.id}"`);
  }
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
