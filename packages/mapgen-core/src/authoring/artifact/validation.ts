import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";
import type { Primitive } from "type-fest";
import type { Static, TSchema } from "typebox";
import { Value } from "typebox/value";

import type { SupportedTypedArray } from "../schema/typed-array.js";
import {
  compileTypedArrayAdmissionPlan,
  type TypedArrayAdmissionIssue,
  validateTypedArrayAdmission,
} from "../schema/typed-array-admission.js";

type ReadonlyArtifactTypedArray<T extends SupportedTypedArray> = {
  readonly [index: number]: number;
  readonly BYTES_PER_ELEMENT: number;
  readonly byteLength: number;
  readonly byteOffset: number;
  readonly length: number;
  readonly [Symbol.toStringTag]: string;
  [Symbol.iterator](): ArrayIterator<number>;
  at(index: number): number | undefined;
  entries(): ArrayIterator<[number, number]>;
  every(
    predicate: (value: number, index: number, array: ReadonlyArtifactTypedArray<T>) => unknown,
    thisArg?: unknown
  ): boolean;
  filter(
    predicate: (value: number, index: number, array: ReadonlyArtifactTypedArray<T>) => unknown,
    thisArg?: unknown
  ): T;
  find(
    predicate: (value: number, index: number, array: ReadonlyArtifactTypedArray<T>) => boolean,
    thisArg?: unknown
  ): number | undefined;
  findIndex(
    predicate: (value: number, index: number, array: ReadonlyArtifactTypedArray<T>) => boolean,
    thisArg?: unknown
  ): number;
  forEach(
    callbackfn: (value: number, index: number, array: ReadonlyArtifactTypedArray<T>) => void,
    thisArg?: unknown
  ): void;
  includes(searchElement: number, fromIndex?: number): boolean;
  indexOf(searchElement: number, fromIndex?: number): number;
  join(separator?: string): string;
  keys(): ArrayIterator<number>;
  lastIndexOf(searchElement: number, fromIndex?: number): number;
  map(
    callbackfn: (value: number, index: number, array: ReadonlyArtifactTypedArray<T>) => number,
    thisArg?: unknown
  ): T;
  reduce(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: ReadonlyArtifactTypedArray<T>
    ) => number
  ): number;
  reduce(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: ReadonlyArtifactTypedArray<T>
    ) => number,
    initialValue: number
  ): number;
  reduce<U>(
    callbackfn: (
      previousValue: U,
      currentValue: number,
      currentIndex: number,
      array: ReadonlyArtifactTypedArray<T>
    ) => U,
    initialValue: U
  ): U;
  reduceRight(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: ReadonlyArtifactTypedArray<T>
    ) => number
  ): number;
  reduceRight(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: ReadonlyArtifactTypedArray<T>
    ) => number,
    initialValue: number
  ): number;
  reduceRight<U>(
    callbackfn: (
      previousValue: U,
      currentValue: number,
      currentIndex: number,
      array: ReadonlyArtifactTypedArray<T>
    ) => U,
    initialValue: U
  ): U;
  slice(start?: number, end?: number): T;
  some(
    predicate: (value: number, index: number, array: ReadonlyArtifactTypedArray<T>) => unknown,
    thisArg?: unknown
  ): boolean;
  subarray(begin?: number, end?: number): ReadonlyArtifactTypedArray<T>;
  toLocaleString(): string;
  toString(): string;
  values(): ArrayIterator<number>;
  valueOf(): ReadonlyArtifactTypedArray<T>;
};

type ArtifactRefinementValue<T> = T extends SupportedTypedArray
  ? ReadonlyArtifactTypedArray<T>
  : T extends Primitive
    ? T
    : T extends (...args: never[]) => unknown
      ? T
      : T extends ReadonlyMap<infer Key, infer Value>
        ? ReadonlyMap<ArtifactRefinementValue<Key>, ArtifactRefinementValue<Value>>
        : T extends ReadonlySet<infer Item>
          ? ReadonlySet<ArtifactRefinementValue<Item>>
          : T extends readonly unknown[]
            ? { readonly [Key in keyof T]: ArtifactRefinementValue<T[Key]> }
            : T extends object
              ? { readonly [Key in keyof T]: ArtifactRefinementValue<T[Key]> }
              : T;

/** One stable, human-readable artifact admission failure. */
type ArtifactValidationIssue = Readonly<{ message: string }>;

/** Runtime facts required by complete artifact admission. */
type ArtifactValidationContext = Readonly<{
  dimensions: Readonly<{ width: number; height: number }>;
}>;

/** Core-owned semantic issue accumulator available only while one refinement is running. */
type ArtifactIssueSink = Readonly<{
  add: (message: string) => void;
  addGridCoordinates: (
    label: string,
    coordinates: readonly Readonly<{ x: number; y: number }>[]
  ) => void;
}>;

/** Admitted contextual facilities supplied to an artifact's semantic refinement. */
type ArtifactRefinementFacilities = Readonly<{
  dimensions: Readonly<{ width: number; height: number }>;
  cellCount: number;
  issues: ArtifactIssueSink;
}>;

/** Optional contextual semantic admission after structural and typed-array admission succeed. */
export type ArtifactRefinement<Schema extends TSchema> = (
  value: ArtifactRefinementValue<Static<NoInfer<Schema>>>,
  facilities: ArtifactRefinementFacilities
) => undefined;

/** Complete structural, exact typed-array, and semantic admission owned by one artifact. */
export type ArtifactValidator = (
  value: unknown,
  context: ArtifactValidationContext
) => readonly ArtifactValidationIssue[];

type IssueCollector = Readonly<{
  sink: ArtifactIssueSink;
  addInternal: (message: string) => void;
  hasIssues: () => boolean;
  close: () => void;
  snapshot: () => readonly ArtifactValidationIssue[];
}>;

function createIssueCollector(
  dimensions: Readonly<{ width: number; height: number }>
): IssueCollector {
  const stored: ArtifactValidationIssue[] = [];
  let open = true;

  const assertOpen = (): void => {
    if (!open) throw new Error("Artifact refinement issue sink is closed.");
  };
  const append = (message: string): void => {
    stored.push(Object.freeze({ message }));
  };
  const add = Object.freeze((message: string): void => {
    assertOpen();
    if (typeof message !== "string") {
      throw new TypeError("Artifact refinement issues.add requires a string message.");
    }
    append(message);
  });
  const addGridCoordinates = Object.freeze(
    (label: string, coordinates: readonly Readonly<{ x: number; y: number }>[]): void => {
      assertOpen();
      if (typeof label !== "string" || !Array.isArray(coordinates)) {
        throw new TypeError(
          "Artifact refinement issues.addGridCoordinates requires a string label and coordinate array."
        );
      }
      const seen = new Set<string>();
      for (const [index, coordinate] of coordinates.entries()) {
        const key = `${coordinate.x},${coordinate.y}`;
        if (seen.has(key)) {
          append(`${label}[${index}] duplicates the tile claim at ${key}.`);
        } else {
          seen.add(key);
        }
        if (
          coordinate.x < 0 ||
          coordinate.x >= dimensions.width ||
          coordinate.y < 0 ||
          coordinate.y >= dimensions.height
        ) {
          append(
            `${label}[${index}] coordinate ${key} is outside ${dimensions.width}x${dimensions.height}.`
          );
        }
      }
    }
  );
  const sink = Object.freeze({ add, addGridCoordinates });

  return Object.freeze({
    sink,
    addInternal: append,
    hasIssues: () => stored.length > 0,
    close: () => {
      open = false;
    },
    snapshot: () => Object.freeze([...stored]),
  });
}

function addStructuralIssues(collector: IssueCollector, schema: TSchema, value: unknown): void {
  for (const error of Value.Errors(schema, value)) {
    const path = error.instancePath || "/";
    collector.addInternal(`${path} ${error.message}`);
  }
}

function addTypedArrayIssues(
  collector: IssueCollector,
  issues: readonly TypedArrayAdmissionIssue[]
): void {
  for (const issue of issues) collector.addInternal(formatTypedArrayIssue(issue));
}

function formatTypedArrayIssue(issue: TypedArrayAdmissionIssue): string {
  switch (issue.code) {
    case "typed-array-container":
      return `Expected ${issue.path} to traverse an array (received ${issue.observedContainer}).`;
    case "typed-array-constructor":
      return `Expected ${issue.path} to be ${formatConstructors(issue.expectedConstructors)}.`;
    case "typed-array-cardinality-source":
      return `Expected ${issue.path} cardinality source ${issue.sourcePath} to be a nonnegative safe integer (received ${formatObserved(issue.observed)}).`;
    case "typed-array-cardinality-overflow":
      return `Expected ${issue.path} cardinality ${issue.cardinalityPaths.join(" x ")} + ${issue.addend} to fit a safe integer.`;
    case "typed-array-cardinality":
      return `Expected ${issue.path} length ${issue.expectedLength} (received ${issue.observedLength}).`;
  }
}

function formatConstructors(constructors: readonly string[]): string {
  return constructors.length === 1
    ? constructors[0]!
    : `${constructors.slice(0, -1).join(", ")} or ${constructors.at(-1)}`;
}

function formatObserved(value: unknown): string {
  try {
    return String(value);
  } catch {
    return "uninspectable";
  }
}

function assertUndefinedSynchronousRefinementResult(result: unknown): void {
  const completion = classifyThenable(result);
  if (completion.kind !== "none") {
    containThenable(completion);
    throw new TypeError("Artifact refinements must return undefined synchronously.");
  }
  if (result !== undefined) {
    throw new TypeError("Artifact refinements must return undefined.");
  }
}

/** @internal Creates the complete validator retained by `defineArtifact`. */
export function createArtifactValidatorInternal<Schema extends TSchema>(
  schema: Schema,
  refine?: ArtifactRefinement<Schema>
): ArtifactValidator {
  const typedArrays = compileTypedArrayAdmissionPlan(schema, {
    subject: "Artifact",
    contextualCardinality: "allow",
  });

  const validate = (
    value: unknown,
    context: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const dimensions = context.dimensions;
    const collector = createIssueCollector(dimensions);
    addStructuralIssues(collector, schema, value);
    if (collector.hasIssues()) {
      collector.close();
      return collector.snapshot();
    }

    addTypedArrayIssues(
      collector,
      validateTypedArrayAdmission(typedArrays, value, {
        dimensions,
      })
    );

    if (collector.hasIssues() || refine === undefined) {
      collector.close();
      return collector.snapshot();
    }

    const facilities = Object.freeze({
      dimensions,
      cellCount: dimensions.width * dimensions.height,
      issues: collector.sink,
    });
    let result: unknown;
    try {
      result = refine(value as ArtifactRefinementValue<Static<Schema>>, facilities);
    } finally {
      collector.close();
    }
    assertUndefinedSynchronousRefinementResult(result);
    return collector.snapshot();
  };

  return Object.freeze(validate);
}
