import type { Tagged } from "type-fest";
import type { Static, TArray, TIntersect, TObject, TProperties, TSchema, TUnion } from "typebox";

import type { TTypedArraySchema, TypedArrayCardinalityPaths } from "../typed-array-schemas.js";
import {
  isTypedArrayOf,
  type SupportedTypedArray,
  type TypedArrayConstructor,
} from "../typed-arrays.js";

type PropertyPathSegment = Readonly<{
  kind: "property";
  key: string;
  optional: boolean;
}>;

const arrayItem = Object.freeze({ kind: "array-item" as const });
type ValuePathSegment = PropertyPathSegment | typeof arrayItem;

type TypedArrayRuntimeMetadata = Readonly<{
  kind: "typed-array";
  ctor: SupportedTypedArrayName;
  cardinality: TypedArrayCardinalityPaths | null;
}>;

type SupportedTypedArrayName = keyof typeof supportedTypedArrayConstructors;

const supportedTypedArrayConstructors = Object.freeze({
  Uint8Array,
  Int8Array,
  Uint16Array,
  Uint32Array,
  Int16Array,
  Int32Array,
  Float32Array,
});

type TypedArrayAdmissionAlternative = Readonly<{
  constructorName: SupportedTypedArrayName;
  constructor: TypedArrayConstructor<SupportedTypedArray>;
  cardinalityPaths: readonly (readonly string[])[] | null;
}>;

type TypedArrayAdmissionCheck = Readonly<{
  valuePath: readonly ValuePathSegment[];
  alternatives: readonly TypedArrayAdmissionAlternative[];
}>;

/** Immutable operation-entry program compiled once from a contract input schema. */
export type OperationInputAdmissionPlan = Readonly<{
  opId: string;
  checks: readonly TypedArrayAdmissionCheck[];
}>;

/** Exact-constructor typed array admitted under its declared non-grid cardinality contract. */
export type AdmittedBuffer<Value extends SupportedTypedArray> = Tagged<
  Value,
  "MapGenAdmittedBuffer"
>;

/** Grid-coupled typed array whose declared contract-relative cardinality has been admitted. */
export type GridBuffer<Value extends SupportedTypedArray> = Tagged<Value, "MapGenGridBuffer">;

type MapDirectAdmittedSchema<Schema extends TSchema> =
  Schema extends TTypedArraySchema<
    infer Value extends SupportedTypedArray,
    infer Cardinality extends TypedArrayCardinalityPaths | null
  >
    ? [Cardinality] extends [readonly ["width", "height"]]
      ? readonly ["width", "height"] extends Cardinality
        ? GridBuffer<Value>
        : AdmittedBuffer<Value>
      : AdmittedBuffer<Value>
    : never;

type MapAdmittedArray<Schema extends TArray, Item extends TSchema> =
  Static<Schema> extends unknown[]
    ? MapAdmittedInputSchema<Item>[]
    : readonly MapAdmittedInputSchema<Item>[];

type MapAdmittedObject<Schema extends TObject, Properties extends TProperties> = {
  [Key in keyof Static<Schema>]: Key extends keyof Properties
    ? MapAdmittedInputSchema<Extract<Properties[Key], TSchema>>
    : Static<Schema>[Key];
};

type MapAdmittedIntersection<Types extends TSchema[]> = Types extends [
  infer Left extends TSchema,
  ...infer Right extends TSchema[],
]
  ? MapAdmittedInputSchema<Left> & MapAdmittedIntersection<Right>
  : unknown;

type MapAdmittedInputSchema<Schema extends TSchema> =
  Schema extends TTypedArraySchema<SupportedTypedArray, TypedArrayCardinalityPaths | null>
    ? MapDirectAdmittedSchema<Schema>
    : Schema extends TArray<infer Item extends TSchema>
      ? MapAdmittedArray<Schema, Item>
      : Schema extends TObject<infer Properties extends TProperties>
        ? MapAdmittedObject<Schema, Properties>
        : Schema extends TUnion<infer Types extends TSchema[]>
          ? MapAdmittedInputSchema<Types[number]>
          : Schema extends TIntersect<infer Types extends TSchema[]>
            ? MapAdmittedIntersection<Types>
            : Static<Schema>;

/**
 * Transient strategy view produced only after Core admits every annotated typed-array field.
 * Public operation callers continue to supply the raw structural `Static<InputSchema>` value.
 */
export type AdmittedOperationInput<InputSchema extends TSchema> = Tagged<
  MapAdmittedInputSchema<InputSchema>,
  "MapGenAdmittedOperationInput"
>;

/** One deterministic, pathful refusal emitted by operation-input admission. */
export type OperationInputAdmissionIssue =
  | Readonly<{
      code: "typed-array-container";
      path: string;
      expectedContainer: "array";
      observedContainer: string;
    }>
  | Readonly<{
      code: "typed-array-constructor";
      path: string;
      expectedConstructors: readonly SupportedTypedArrayName[];
      observedConstructor: string;
    }>
  | Readonly<{
      code: "typed-array-cardinality-source";
      path: string;
      sourcePath: string;
      observed: unknown;
    }>
  | Readonly<{
      code: "typed-array-cardinality-overflow";
      path: string;
      cardinalityPaths: readonly string[];
      factors: readonly number[];
    }>
  | Readonly<{
      code: "typed-array-cardinality";
      path: string;
      cardinalityPaths: readonly string[];
      expectedLength: number;
      observedLength: number;
    }>;

/** Typed refusal raised before strategy selection can observe an inadmissible operation input. */
export class OperationInputAdmissionError extends Error {
  readonly opId: string;
  readonly issues: readonly OperationInputAdmissionIssue[];

  constructor(opId: string, issues: readonly OperationInputAdmissionIssue[]) {
    super(`Operation ${opId} refused ${issues.length} input admission issue(s).`);
    this.name = "OperationInputAdmissionError";
    this.opId = opId;
    this.issues = Object.freeze([...issues]);
    Object.freeze(this);
  }
}

/** Compiles and validates the recursive typed-array admission program for one operation contract. */
export function compileOperationInputAdmissionPlan(
  opId: string,
  inputSchema: TSchema
): OperationInputAdmissionPlan {
  const checks: TypedArrayAdmissionCheck[] = [];
  collectChecks(inputSchema, inputSchema, [], checks, new Set<TSchema>());
  return Object.freeze({ opId, checks: Object.freeze(checks) });
}

/**
 * Executes one compiled admission transition and returns the same value under the strategy-only
 * admitted view. It never defaults, clones, or performs general TypeBox validation.
 */
export function admitOperationInput<InputSchema extends TSchema>(
  plan: OperationInputAdmissionPlan,
  input: Static<InputSchema>
): AdmittedOperationInput<InputSchema> {
  const issues: OperationInputAdmissionIssue[] = [];
  const refusedArrayContainers = new Set<string>();
  for (const check of plan.checks) {
    for (const observed of resolveValues(input, check.valuePath)) {
      if (observed.kind === "array-container") {
        if (!refusedArrayContainers.has(observed.path)) {
          refusedArrayContainers.add(observed.path);
          issues.push(
            Object.freeze({
              code: "typed-array-container" as const,
              path: observed.path,
              expectedContainer: "array" as const,
              observedContainer: observedConstructorName(observed.value),
            })
          );
        }
        continue;
      }

      const alternative = check.alternatives.find(({ constructor }) =>
        isTypedArrayOf(observed.value, constructor)
      );
      if (!alternative) {
        issues.push(
          Object.freeze({
            code: "typed-array-constructor" as const,
            path: observed.path,
            expectedConstructors: Object.freeze(
              check.alternatives.map(({ constructorName }) => constructorName)
            ),
            observedConstructor: observedConstructorName(observed.value),
          })
        );
        continue;
      }
      validateCardinality(
        input,
        { ...observed, value: observed.value as SupportedTypedArray },
        alternative,
        issues
      );
    }
  }
  if (issues.length > 0) {
    issues.sort((left, right) => {
      const leftKey = `${left.path}:${left.code}`;
      const rightKey = `${right.path}:${right.code}`;
      return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
    });
    throw new OperationInputAdmissionError(plan.opId, issues);
  }
  return input as AdmittedOperationInput<InputSchema>;
}

function collectChecks(
  rootSchema: TSchema,
  schema: TSchema,
  valuePath: readonly ValuePathSegment[],
  checks: TypedArrayAdmissionCheck[],
  ancestors: Set<TSchema>
): void {
  if (ancestors.has(schema)) return;

  const metadata = readTypedArrayMetadata(schema);
  if (metadata) {
    addConjunctiveCheck(checks, valuePath, [compileAlternative(rootSchema, metadata)]);
    return;
  }

  ancestors.add(schema);
  try {
    const schemaRecord = schema as Record<PropertyKey, unknown>;
    const unionMembers = readSchemaMembers(schemaRecord, "anyOf");
    if (unionMembers) {
      const alternatives = unionMembers.flatMap((member) => {
        const metadata = readTypedArrayMetadata(member);
        return metadata ? [metadata] : [];
      });
      const undefinedMembers = unionMembers.filter(isExplicitUndefinedSchema);
      if (
        alternatives.length > 0 &&
        alternatives.length + undefinedMembers.length === unionMembers.length
      ) {
        if (undefinedMembers.length > 0 && !isOptionalValuePath(valuePath)) {
          throw new Error(
            `Operation typed-array union at "${formatValuePath(valuePath)}" admits undefined only for an optional property`
          );
        }
        addConjunctiveCheck(
          checks,
          valuePath,
          alternatives.map((alternative) => compileAlternative(rootSchema, alternative))
        );
        return;
      }
      if (unionMembers.some((member) => containsTypedArrayMetadata(member, new Set<TSchema>()))) {
        throw new Error(
          `Operation typed-array union at "${formatValuePath(valuePath)}" must contain only direct typed-array alternatives`
        );
      }
      return;
    }

    assertNoUnsupportedTypedArrayContainers(schemaRecord, valuePath);

    const properties = hasOwn(schemaRecord, "properties") ? schemaRecord.properties : undefined;
    if (isRecord(properties)) {
      for (const key of Object.keys(properties).sort()) {
        const child = properties[key];
        if (isSchema(child)) {
          collectChecks(
            rootSchema,
            child,
            [
              ...valuePath,
              Object.freeze({
                kind: "property",
                key,
                optional: isPropertyOptionalAtPath(rootSchema, valuePath, key),
              }),
            ],
            checks,
            ancestors
          );
        }
      }
    }

    const items = hasOwn(schemaRecord, "items") ? schemaRecord.items : undefined;
    if (isSchema(items)) {
      collectChecks(rootSchema, items, [...valuePath, arrayItem], checks, ancestors);
    }

    const intersectionMembers = readSchemaMembers(schemaRecord, "allOf");
    if (intersectionMembers) {
      for (const member of intersectionMembers) {
        collectChecks(rootSchema, member, valuePath, checks, ancestors);
      }
    }
  } finally {
    ancestors.delete(schema);
  }
}

function compileAlternative(
  rootSchema: TSchema,
  metadata: TypedArrayRuntimeMetadata
): TypedArrayAdmissionAlternative {
  const cardinalityPaths =
    metadata.cardinality === null
      ? null
      : Object.freeze(
          metadata.cardinality.map((path) => {
            const segments = parseSourcePath(path);
            assertCardinalitySource(rootSchema, path, segments);
            return Object.freeze(segments);
          })
        );
  return Object.freeze({
    constructorName: metadata.ctor,
    constructor: supportedTypedArrayConstructors[metadata.ctor],
    cardinalityPaths,
  });
}

function addConjunctiveCheck(
  checks: TypedArrayAdmissionCheck[],
  valuePath: readonly ValuePathSegment[],
  rawAlternatives: readonly TypedArrayAdmissionAlternative[]
): void {
  const alternatives = normalizeAlternatives(valuePath, rawAlternatives);
  const index = checks.findIndex((check) => sameValuePath(check.valuePath, valuePath));
  if (index === -1) {
    checks.push(
      Object.freeze({
        valuePath: Object.freeze([...valuePath]),
        alternatives,
      })
    );
    return;
  }

  const prior = checks[index]!;
  const common = prior.alternatives.filter((left) =>
    alternatives.some((right) => sameAlternative(left, right))
  );
  if (common.length === 0) {
    throw new Error(
      `Operation typed-array intersection at "${formatValuePath(valuePath)}" has incompatible alternatives`
    );
  }
  checks[index] = Object.freeze({
    valuePath: mergeValuePaths(prior.valuePath, valuePath),
    alternatives: Object.freeze(common),
  });
}

function normalizeAlternatives(
  valuePath: readonly ValuePathSegment[],
  alternatives: readonly TypedArrayAdmissionAlternative[]
): readonly TypedArrayAdmissionAlternative[] {
  const byConstructor = new Map<SupportedTypedArrayName, TypedArrayAdmissionAlternative>();
  for (const alternative of alternatives) {
    const existing = byConstructor.get(alternative.constructorName);
    if (existing && !sameAlternative(existing, alternative)) {
      throw new Error(
        `Operation typed-array union at "${formatValuePath(valuePath)}" declares ambiguous ${alternative.constructorName} cardinalities`
      );
    }
    byConstructor.set(alternative.constructorName, alternative);
  }
  return Object.freeze(
    [...byConstructor.values()].sort((left, right) =>
      left.constructorName.localeCompare(right.constructorName)
    )
  );
}

function readTypedArrayMetadata(schema: TSchema): TypedArrayRuntimeMetadata | null {
  const schemaRecord = schema as Record<PropertyKey, unknown>;
  if (!hasOwn(schemaRecord, "x-runtime")) return null;
  const runtime = schemaRecord["x-runtime"];
  if (!isRecord(runtime)) return null;
  const isTypedArrayCandidate =
    runtime.kind === "typed-array" || hasOwn(runtime, "ctor") || hasOwn(runtime, "cardinality");
  if (!isTypedArrayCandidate) return null;
  if (!hasOwn(runtime, "kind") || runtime.kind !== "typed-array") {
    throw new Error("Operation typed-array metadata kind must be an own property");
  }
  if (
    !hasOwn(runtime, "ctor") ||
    typeof runtime.ctor !== "string" ||
    !hasOwn(supportedTypedArrayConstructors, runtime.ctor)
  ) {
    throw new Error(`Unsupported operation typed-array constructor: ${String(runtime.ctor)}`);
  }
  if (!hasOwn(runtime, "cardinality")) {
    throw new Error(`Missing typed-array cardinality metadata for ${runtime.ctor}`);
  }
  const cardinality = runtime.cardinality;
  if (cardinality !== null && (!Array.isArray(cardinality) || cardinality.length === 0)) {
    throw new Error(`Invalid typed-array cardinality metadata for ${runtime.ctor}`);
  }
  const admittedCardinality: TypedArrayCardinalityPaths | null =
    cardinality === null
      ? null
      : readCardinalityPaths(cardinality, runtime.ctor as SupportedTypedArrayName);
  return {
    kind: "typed-array",
    ctor: runtime.ctor as SupportedTypedArrayName,
    cardinality: admittedCardinality,
  };
}

function readCardinalityPaths(
  cardinality: readonly unknown[],
  constructorName: SupportedTypedArrayName
): TypedArrayCardinalityPaths {
  const paths: string[] = [];
  for (let index = 0; index < cardinality.length; index += 1) {
    if (!hasOwn(cardinality as unknown as Record<PropertyKey, unknown>, index)) {
      throw new Error(`Invalid typed-array cardinality metadata for ${constructorName}`);
    }
    const path = cardinality[index];
    if (typeof path !== "string" || path.length === 0) {
      throw new Error(`Invalid typed-array cardinality metadata for ${constructorName}`);
    }
    paths.push(path);
  }
  return Object.freeze(paths) as unknown as TypedArrayCardinalityPaths;
}

function containsTypedArrayMetadata(schema: TSchema, visited: Set<TSchema>): boolean {
  if (visited.has(schema)) return false;
  visited.add(schema);
  if (readTypedArrayMetadata(schema)) return true;
  const schemaRecord = schema as Record<PropertyKey, unknown>;
  const properties = hasOwn(schemaRecord, "properties") ? schemaRecord.properties : undefined;
  if (
    isRecord(properties) &&
    Object.values(properties).some(
      (property) => isSchema(property) && containsTypedArrayMetadata(property, visited)
    )
  ) {
    return true;
  }
  const items = hasOwn(schemaRecord, "items") ? schemaRecord.items : undefined;
  if (isSchema(items) && containsTypedArrayMetadata(items, visited)) return true;
  for (const key of ["anyOf", "allOf"] as const) {
    const members = readSchemaMembers(schemaRecord, key);
    if (members?.some((member) => containsTypedArrayMetadata(member, visited))) return true;
  }
  if (
    unsupportedSchemaChildren(schemaRecord).some((child) =>
      containsTypedArrayMetadata(child, visited)
    )
  ) {
    return true;
  }
  return false;
}

function assertNoUnsupportedTypedArrayContainers(
  schema: Record<PropertyKey, unknown>,
  valuePath: readonly ValuePathSegment[]
): void {
  if (
    unsupportedSchemaChildren(schema).some((child) =>
      containsTypedArrayMetadata(child, new Set<TSchema>())
    )
  ) {
    throw new Error(
      `Operation typed-array metadata at "${formatValuePath(valuePath)}" uses an unsupported schema container`
    );
  }
}

function unsupportedSchemaChildren(schema: Record<PropertyKey, unknown>): readonly TSchema[] {
  const children: TSchema[] = [];
  for (const key of ["anyOf", "allOf"] as const) {
    if (!hasOwn(schema, key) || readSchemaMembers(schema, key)) continue;
    const value = schema[key];
    if (Array.isArray(value)) children.push(...value.filter(isSchema));
    else if (isSchema(value)) children.push(value);
  }
  for (const key of ["items", "prefixItems", "oneOf"] as const) {
    const value = hasOwn(schema, key) ? schema[key] : undefined;
    if (Array.isArray(value)) {
      children.push(...value.filter(isSchema));
    }
  }
  for (const key of [
    "$defs",
    "definitions",
    "patternProperties",
    "dependentSchemas",
    "dependencies",
  ] as const) {
    const value = hasOwn(schema, key) ? schema[key] : undefined;
    if (isRecord(value)) {
      children.push(...Object.values(value).filter(isSchema));
    }
  }
  for (const key of [
    "additionalProperties",
    "additionalItems",
    "contains",
    "not",
    "if",
    "then",
    "else",
    "propertyNames",
    "unevaluatedItems",
    "unevaluatedProperties",
    "$ref",
  ] as const) {
    const value = hasOwn(schema, key) ? schema[key] : undefined;
    if (isSchema(value)) children.push(value);
  }
  return children;
}

function isPropertyOptionalAtPath(
  rootSchema: TSchema,
  parentPath: readonly ValuePathSegment[],
  key: string
): boolean {
  return !resolveSchemasAtValuePath(rootSchema, parentPath).some((schema) =>
    schemaRequiresProperty(schema, key, new Set<TSchema>())
  );
}

function resolveSchemasAtValuePath(
  rootSchema: TSchema,
  valuePath: readonly ValuePathSegment[]
): readonly TSchema[] {
  let current: readonly TSchema[] = [rootSchema];
  for (const segment of valuePath) {
    const next = new Set<TSchema>();
    if (segment.kind === "property") {
      for (const schema of current) {
        for (const property of resolveSchemaProperty(schema, segment.key, new Set<TSchema>())) {
          next.add(property);
        }
      }
    } else {
      for (const schema of current) {
        for (const item of resolveSchemaItems(schema, new Set<TSchema>())) next.add(item);
      }
    }
    if (next.size === 0) return [];
    current = [...next];
  }
  return current;
}

function schemaRequiresProperty(schema: TSchema, key: string, ancestors: Set<TSchema>): boolean {
  if (ancestors.has(schema)) return false;
  ancestors.add(schema);
  try {
    const schemaRecord = schema as Record<PropertyKey, unknown>;
    if (
      Array.isArray(schemaRecord.required) &&
      schemaRecord.required.some((value) => value === key)
    ) {
      return true;
    }
    return (
      readSchemaMembers(schemaRecord, "allOf")?.some((member) =>
        schemaRequiresProperty(member, key, ancestors)
      ) ?? false
    );
  } finally {
    ancestors.delete(schema);
  }
}

function resolveSchemaItems(schema: TSchema, ancestors: Set<TSchema>): readonly TSchema[] {
  if (ancestors.has(schema)) return [];
  ancestors.add(schema);
  try {
    const matches: TSchema[] = [];
    const schemaRecord = schema as Record<PropertyKey, unknown>;
    const items = hasOwn(schemaRecord, "items") ? schemaRecord.items : undefined;
    if (isSchema(items) && !Array.isArray(items)) matches.push(items);
    const intersections = readSchemaMembers(schemaRecord, "allOf");
    if (intersections) {
      for (const member of intersections) matches.push(...resolveSchemaItems(member, ancestors));
    }
    return matches;
  } finally {
    ancestors.delete(schema);
  }
}

function assertCardinalitySource(
  rootSchema: TSchema,
  path: string,
  segments: readonly string[]
): void {
  const sources = resolveSchemaPath(rootSchema, segments);
  if (
    sources.length === 0 ||
    sources.some((source) => !isNumericSchema(source, new Set<TSchema>()))
  ) {
    throw new Error(`Operation typed-array cardinality source "${path}" is not a numeric input`);
  }
}

function isNumericSchema(schema: TSchema, ancestors: Set<TSchema>): boolean {
  if (ancestors.has(schema)) return false;
  ancestors.add(schema);
  try {
    const schemaRecord = schema as Record<PropertyKey, unknown>;
    if (schemaRecord.type === "integer" || schemaRecord.type === "number") return true;
    const intersections = readSchemaMembers(schemaRecord, "allOf");
    return intersections !== null && intersections.length > 0
      ? intersections.every((member) => isNumericSchema(member, ancestors))
      : false;
  } finally {
    ancestors.delete(schema);
  }
}

function resolveSchemaPath(schema: TSchema, segments: readonly string[]): readonly TSchema[] {
  let current: readonly TSchema[] = [schema];
  for (const segment of segments) {
    const next = new Set<TSchema>();
    for (const candidate of current) {
      for (const property of resolveSchemaProperty(candidate, segment, new Set<TSchema>())) {
        next.add(property);
      }
    }
    if (next.size === 0) return [];
    current = [...next];
  }
  return current;
}

function resolveSchemaProperty(
  schema: TSchema,
  key: string,
  ancestors: Set<TSchema>
): readonly TSchema[] {
  if (ancestors.has(schema)) return [];
  ancestors.add(schema);
  try {
    const matches: TSchema[] = [];
    const schemaRecord = schema as Record<PropertyKey, unknown>;
    const properties = hasOwn(schemaRecord, "properties") ? schemaRecord.properties : undefined;
    if (isRecord(properties) && hasOwn(properties, key) && isSchema(properties[key])) {
      matches.push(properties[key]);
    }
    const intersections = readSchemaMembers(schemaRecord, "allOf");
    if (intersections) {
      for (const member of intersections) {
        matches.push(...resolveSchemaProperty(member, key, ancestors));
      }
    }
    return matches;
  } finally {
    ancestors.delete(schema);
  }
}

function parseSourcePath(path: string): readonly string[] {
  const segments = path.split(".");
  if (segments.some((segment) => segment.length === 0)) {
    throw new Error(`Invalid operation typed-array cardinality source path: ${path}`);
  }
  return segments;
}

type ResolvedValue =
  | Readonly<{ kind: "value"; value: unknown; path: string }>
  | Readonly<{ kind: "array-container"; value: unknown; path: string }>;

function resolveValues(
  root: unknown,
  segments: readonly ValuePathSegment[],
  index = 0,
  path = "$"
): ResolvedValue[] {
  if (index === segments.length) return [{ kind: "value", value: root, path }];
  const segment = segments[index]!;
  if (segment.kind === "array-item") {
    if (!Array.isArray(root)) return [{ kind: "array-container", value: root, path }];
    const resolved: ResolvedValue[] = [];
    for (let itemIndex = 0; itemIndex < root.length; itemIndex += 1) {
      const itemPath = `${path}[${itemIndex}]`;
      if (!hasOwn(root as unknown as Record<PropertyKey, unknown>, itemIndex)) {
        resolved.push(missingPathObservation(segments, index + 1, itemPath));
        continue;
      }
      resolved.push(...resolveValues(root[itemIndex], segments, index + 1, itemPath));
    }
    return resolved;
  }

  const nextPath = `${path}.${segment.key}`;
  if (!isRecord(root) || !hasOwn(root, segment.key)) {
    if (segment.optional && !hasObservableProperty(root, segment.key)) return [];
    return [missingPathObservation(segments, index + 1, nextPath)];
  }
  const value = root[segment.key];
  if (value === undefined && segment.optional) return [];
  return resolveValues(value, segments, index + 1, nextPath);
}

function hasObservableProperty(root: unknown, key: string): boolean {
  if (!isRecord(root)) return false;
  try {
    return key in root;
  } catch {
    return true;
  }
}

function missingPathObservation(
  segments: readonly ValuePathSegment[],
  index: number,
  path: string
): ResolvedValue {
  let missingPath = path;
  for (let current = index; current < segments.length; current += 1) {
    const segment = segments[current]!;
    if (segment.kind === "array-item") {
      return { kind: "array-container", value: undefined, path: missingPath };
    }
    missingPath = `${missingPath}.${segment.key}`;
  }
  return { kind: "value", value: undefined, path: missingPath };
}

function validateCardinality(
  root: unknown,
  observed: Readonly<{ kind: "value"; value: SupportedTypedArray; path: string }>,
  alternative: TypedArrayAdmissionAlternative,
  issues: OperationInputAdmissionIssue[]
): void {
  if (alternative.cardinalityPaths === null) return;
  let expectedLength = 1;
  const factors: number[] = [];
  for (const sourceSegments of alternative.cardinalityPaths) {
    const sourcePath = sourceSegments.join(".");
    const source = readPath(root, sourceSegments);
    if (!Number.isSafeInteger(source) || (source as number) < 0) {
      issues.push(
        Object.freeze({
          code: "typed-array-cardinality-source" as const,
          path: observed.path,
          sourcePath,
          observed: source,
        })
      );
      return;
    }
    const factor = source as number;
    factors.push(factor);
    const nextLength = expectedLength * factor;
    if (!Number.isSafeInteger(nextLength)) {
      issues.push(
        Object.freeze({
          code: "typed-array-cardinality-overflow" as const,
          path: observed.path,
          cardinalityPaths: Object.freeze(
            alternative.cardinalityPaths.map((segments) => segments.join("."))
          ),
          factors: Object.freeze([...factors]),
        })
      );
      return;
    }
    expectedLength = nextLength;
  }
  if (observed.value.length !== expectedLength) {
    issues.push(
      Object.freeze({
        code: "typed-array-cardinality" as const,
        path: observed.path,
        cardinalityPaths: Object.freeze(
          alternative.cardinalityPaths.map((segments) => segments.join("."))
        ),
        expectedLength,
        observedLength: observed.value.length,
      })
    );
  }
}

function formatValuePath(segments: readonly ValuePathSegment[]): string {
  return segments.reduce<string>(
    (path, segment) => (segment.kind === "array-item" ? `${path}[*]` : `${path}.${segment.key}`),
    "$"
  );
}

function readPath(root: unknown, segments: readonly string[]): unknown {
  let current = root;
  for (const segment of segments) {
    if (!isRecord(current) || !hasOwn(current, segment)) return undefined;
    current = current[segment];
  }
  return current;
}

function readSchemaMembers(
  schema: Record<PropertyKey, unknown>,
  key: "anyOf" | "allOf"
): readonly TSchema[] | null {
  if (!hasOwn(schema, key)) return null;
  const members = schema[key];
  return Array.isArray(members) && members.every(isSchema) ? members : null;
}

function isExplicitUndefinedSchema(schema: TSchema): boolean {
  const schemaRecord = schema as Record<PropertyKey, unknown>;
  return hasOwn(schemaRecord, "type") && schemaRecord.type === "undefined";
}

function isOptionalValuePath(valuePath: readonly ValuePathSegment[]): boolean {
  const segment = valuePath.at(-1);
  return segment?.kind === "property" && segment.optional;
}

function sameValuePath(
  left: readonly ValuePathSegment[],
  right: readonly ValuePathSegment[]
): boolean {
  return (
    left.length === right.length &&
    left.every((segment, index) => {
      const other = right[index]!;
      return segment.kind === "array-item"
        ? other.kind === "array-item"
        : other.kind === "property" && segment.key === other.key;
    })
  );
}

function mergeValuePaths(
  left: readonly ValuePathSegment[],
  right: readonly ValuePathSegment[]
): readonly ValuePathSegment[] {
  return Object.freeze(
    left.map((segment, index) => {
      const other = right[index]!;
      if (segment.kind === "array-item" || other.kind === "array-item") return arrayItem;
      return Object.freeze({
        kind: "property" as const,
        key: segment.key,
        optional: segment.optional && other.optional,
      });
    })
  );
}

function sameAlternative(
  left: TypedArrayAdmissionAlternative,
  right: TypedArrayAdmissionAlternative
): boolean {
  return (
    left.constructorName === right.constructorName &&
    sameCardinalityPaths(left.cardinalityPaths, right.cardinalityPaths)
  );
}

function sameCardinalityPaths(
  left: readonly (readonly string[])[] | null,
  right: readonly (readonly string[])[] | null
): boolean {
  return (
    left === right ||
    (left !== null &&
      right !== null &&
      left.length === right.length &&
      left.every(
        (path, index) =>
          path.length === right[index]!.length &&
          path.every((segment, pathIndex) => segment === right[index]![pathIndex])
      ))
  );
}

function observedConstructorName(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value !== "object" && typeof value !== "function") return typeof value;
  try {
    const prototype = Object.getPrototypeOf(value) as unknown;
    if (isRecord(prototype) && hasOwn(prototype, "constructor")) {
      const constructor = prototype.constructor;
      if (typeof constructor === "function") return constructor.name || "anonymous";
    }
  } catch {
    return "uninspectable-object";
  }
  return "object";
}

function hasOwn(record: Record<PropertyKey, unknown>, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

function isSchema(value: unknown): value is TSchema {
  return isRecord(value);
}
