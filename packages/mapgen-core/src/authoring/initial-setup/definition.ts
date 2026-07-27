import {
  BASE_PHYSICAL_INITIAL_SETUP_ID,
  bindInitialSetupInternal,
  findInitialSetupBindingInternal,
} from "@mapgen/core/initial-setup-binding.js";
import {
  admitMapSetup,
  isMapSetupInternal,
  type MapSetup,
  type MapSetupInput,
  MapSetupSchema,
} from "@mapgen/core/map-setup.js";
import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";
import { createPortableJsonSnapshot } from "@mapgen/lib/json/portable-snapshot.js";
import { IsObject, type Static, type TObject } from "typebox";
import { Value } from "typebox/value";

import { applySchemaConventions } from "../schema/conventions.js";
import { freezeContractGraph, snapshotContractGraph } from "../snapshot/contract-graph.js";

type InitialSetupIssueSink = Readonly<{
  add: (message: string) => void;
}>;

type InitialSetupRefinementFacilities = Readonly<{
  issues: InitialSetupIssueSink;
}>;

/** Optional cross-field semantic admission over one structurally admitted initial value. */
export type InitialSetupRefinement<Schema extends TObject> = (
  value: DeepReadonlyInitialSetup<Static<NoInfer<Schema>>>,
  facilities: InitialSetupRefinementFacilities
) => undefined;

/** Canonical schema-backed authority for one recipe's complete per-run initial state. */
export type InitialSetupDefinition<
  Id extends string = string,
  Schema extends TObject = any,
> = Readonly<{
  id: Id;
  schema: Schema;
  physical: {
    bivarianceHack(value: DeepReadonlyInitialSetup<Static<Schema>>): MapSetup | MapSetupInput;
  }["bivarianceHack"];
}>;

/** Immutable input inferred directly from an initial-setup authority's TypeBox schema. */
export type InitialSetupInputOf<Definition extends InitialSetupDefinition> =
  DeepReadonlyInitialSetup<Static<Definition["schema"]>>;

/** Deeply immutable value admitted for a recipe run and exposed only to declaring steps. */
export type InitialSetupValueOf<Definition extends InitialSetupDefinition> =
  DeepReadonlyInitialSetup<Static<Definition["schema"]>>;

type InitialSetupDefinitionData = Readonly<{
  id: unknown;
  schema: unknown;
  physical: unknown;
  refine: unknown;
}>;

const canonicalInitialSetupDefinitions = new WeakSet<object>();
const initialSetupRefinements = new WeakMap<object, InitialSetupRefinement<any> | undefined>();

function readInitialSetupDefinitionData(input: unknown): InitialSetupDefinitionData {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("initial setup definition must be an object");
  }

  const descriptors = Object.getOwnPropertyDescriptors(input);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (key !== "id" && key !== "schema" && key !== "physical" && key !== "refine") {
      throw new TypeError("initial setup definition contains an unknown property");
    }
  }

  const read = (key: "id" | "schema" | "physical"): unknown => {
    const descriptor = descriptors[key];
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(
        `initial setup definition ${key} must be an own enumerable data property`
      );
    }
    return descriptor.value;
  };

  return Object.freeze({
    id: read("id"),
    schema: read("schema"),
    physical: read("physical"),
    refine: readOptionalInitialSetupRefinement(descriptors),
  });
}

function readOptionalInitialSetupRefinement(descriptors: PropertyDescriptorMap): unknown {
  const descriptor = descriptors.refine;
  if (descriptor === undefined) return undefined;
  if (!descriptor.enumerable || !("value" in descriptor)) {
    throw new TypeError("initial setup definition refine must be an own enumerable data property");
  }
  return descriptor.value;
}

function initialSetupAdmissionError(path: string, message: string): TypeError {
  return new TypeError(`Initial setup at "${path}" is invalid: ${message}`);
}

function runInitialSetupRefinement<Definition extends InitialSetupDefinition>(
  definition: Definition,
  value: InitialSetupValueOf<Definition>
): void {
  const refine = initialSetupRefinements.get(definition);
  if (refine === undefined) return;

  const stored: { message: string }[] = [];
  let open = true;
  const add = Object.freeze((message: string): void => {
    if (!open) throw new Error("Initial setup refinement issue sink is closed.");
    if (typeof message !== "string") {
      throw new TypeError("Initial setup refinement issues.add requires a string message.");
    }
    stored.push(Object.freeze({ message }));
  });
  const facilities = Object.freeze({
    issues: Object.freeze({ add }),
  });

  let result: unknown;
  try {
    result = refine(value, facilities);
  } finally {
    open = false;
  }

  const completion = classifyThenable(result);
  if (completion.kind !== "none") {
    containThenable(completion);
    throw new TypeError("Initial setup refinements must return undefined synchronously.");
  }
  if (result !== undefined) {
    throw new TypeError("Initial setup refinements must return undefined.");
  }
  if (stored.length > 0) {
    throw new TypeError(
      `Initial setup authority "${definition.id}" refused semantic admission: ${stored
        .map(({ message }) => message)
        .join("; ")}`
    );
  }
}

/** Reports whether an exact definition identity came from `defineInitialSetup`. */
export function isInitialSetupDefinitionInternal(value: object): value is InitialSetupDefinition {
  return canonicalInitialSetupDefinitions.has(value);
}

/** Refuses structural initial-setup lookalikes at authoring composition boundaries. */
export function assertInitialSetupDefinitionInternal(
  value: unknown
): asserts value is InitialSetupDefinition {
  if (
    (typeof value !== "object" && typeof value !== "function") ||
    value === null ||
    !canonicalInitialSetupDefinitions.has(value)
  ) {
    throw new Error("initial setup authority must be created by defineInitialSetup");
  }
}

/**
 * Defines one canonical schema and physical-projection authority for recipe initial state.
 *
 * The schema graph is detached, closed by Core conventions, and frozen before the definition can
 * admit values. The physical projection therefore observes the exact deeply immutable value that
 * passed schema parsing rather than caller-owned input.
 */
export function defineInitialSetup<const Id extends string, const Schema extends TObject>(input: {
  id: Id;
  schema: Schema;
  refine?: InitialSetupRefinement<Schema>;
  physical: (value: DeepReadonlyInitialSetup<Static<Schema>>) => MapSetup | MapSetupInput;
}): InitialSetupDefinition<Id, Schema> {
  const data = readInitialSetupDefinitionData(input);
  if (typeof data.id !== "string" || data.id.trim().length === 0) {
    throw new TypeError("initial setup definition id must be a non-empty string");
  }
  if (data.schema === null || typeof data.schema !== "object" || Array.isArray(data.schema)) {
    throw new TypeError("initial setup definition schema must be a TypeBox object schema");
  }
  if (typeof data.physical !== "function") {
    throw new TypeError("initial setup definition physical must be a function");
  }
  if (data.refine !== undefined && typeof data.refine !== "function") {
    throw new TypeError("initial setup definition refine must be a function when provided");
  }

  const schema = snapshotContractGraph(data.schema, `initial setup "${data.id}" schema`) as Schema;
  if (!IsObject(schema)) {
    throw new TypeError("initial setup definition schema must be a TypeBox object schema");
  }
  applySchemaConventions(schema);
  freezeContractGraph(schema);

  const definition = Object.freeze({
    id: data.id,
    schema,
    physical: data.physical,
  }) as InitialSetupDefinition<Id, Schema>;
  canonicalInitialSetupDefinitions.add(definition);
  initialSetupRefinements.set(
    definition,
    data.refine as InitialSetupRefinement<Schema> | undefined
  );
  return definition;
}

declare const basePhysicalInitialSetupBrand: unique symbol;

/**
 * Exact type identity of Core's physical-only authority.
 *
 * The private brand prevents another definition that reuses the same textual id from being
 * mistaken for Core's base authority by conditional public APIs.
 */
export type BasePhysicalInitialSetupDefinition = InitialSetupDefinition<
  typeof BASE_PHYSICAL_INITIAL_SETUP_ID,
  typeof MapSetupSchema
> &
  Readonly<{ [basePhysicalInitialSetupBrand]: true }>;

/**
 * Default recipe authority whose complete initial value is the admitted physical map setup.
 *
 * Recipes that need product-specific launch facts replace this authority explicitly; physical-only
 * recipes retain the historical setup surface without gaining ambient extension state.
 */
export const basePhysicalInitialSetupDefinition = defineInitialSetup({
  id: BASE_PHYSICAL_INITIAL_SETUP_ID,
  schema: MapSetupSchema,
  physical: (value) => value,
}) as BasePhysicalInitialSetupDefinition;

export type AdmittedInitialSetup<
  Definition extends InitialSetupDefinition = InitialSetupDefinition,
> = Readonly<{
  setup: MapSetup;
  value: InitialSetupValueOf<Definition>;
}>;

/**
 * @internal Admits one full recipe setup or reuses its exact private binding from a physical setup.
 */
export function admitInitialSetupInternal<Definition extends InitialSetupDefinition>(
  definition: Definition,
  input: unknown
): AdmittedInitialSetup<Definition> {
  assertInitialSetupDefinitionInternal(definition);

  if (isMapSetupInternal(input)) {
    const existing = findInitialSetupBindingInternal(input);
    if (existing !== undefined) {
      if (existing.definition !== definition) {
        throw new Error(
          `MapSetup is bound to initial setup authority "${existing.definitionId}", not "${definition.id}".`
        );
      }
      return Object.freeze({
        setup: input,
        value: existing.value as InitialSetupValueOf<Definition>,
      });
    }
    if (
      (definition as InitialSetupDefinition) !==
      (basePhysicalInitialSetupDefinition as InitialSetupDefinition)
    ) {
      throw new Error(
        `Initial setup authority "${definition.id}" requires its complete schema input before the physical MapSetup can be used.`
      );
    }
    const binding = bindInitialSetupInternal(input, {
      definition,
      definitionId: definition.id,
      value: input,
    });
    return Object.freeze({
      setup: input,
      value: binding.value as InitialSetupValueOf<Definition>,
    });
  }

  const inputSnapshot = createPortableJsonSnapshot(input, "/initialSetup");
  if (!inputSnapshot.ok) {
    throw initialSetupAdmissionError(inputSnapshot.path, inputSnapshot.message);
  }

  let parsed;
  try {
    parsed = Value.Parse(definition.schema, inputSnapshot.value);
  } catch {
    throw initialSetupAdmissionError("/initialSetup", "schema parsing failed");
  }

  const valueSnapshot = createPortableJsonSnapshot(parsed, "/initialSetup");
  if (!valueSnapshot.ok) {
    throw initialSetupAdmissionError(valueSnapshot.path, valueSnapshot.message);
  }
  const value = valueSnapshot.value as InitialSetupValueOf<Definition>;
  runInitialSetupRefinement(definition, value);
  const physical = definition.physical(value);
  const projection = classifyThenable(physical);
  if (projection.kind !== "none") {
    containThenable(projection);
    throw new TypeError("Initial setup physical projections must complete synchronously.");
  }
  const setup = admitMapSetup(physical);
  bindInitialSetupInternal(setup, {
    definition,
    definitionId: definition.id,
    value,
  });
  return Object.freeze({ setup, value });
}

/** @internal Reads a bound value only for the exact authority declared by a step. */
export function readInitialSetupValueInternal<Definition extends InitialSetupDefinition>(
  setup: MapSetup,
  definition: Definition
): InitialSetupValueOf<Definition> {
  assertInitialSetupDefinitionInternal(definition);
  const binding = findInitialSetupBindingInternal(setup);
  if (binding === undefined) {
    throw new Error(
      `MapSetup has no admitted value for initial setup authority "${definition.id}".`
    );
  }
  if (binding.definition !== definition) {
    throw new Error(
      `MapSetup is bound to initial setup authority "${binding.definitionId}", not "${definition.id}".`
    );
  }
  return binding.value as InitialSetupValueOf<Definition>;
}
/**
 * Portable deeply readonly projection used by public initial-setup inference.
 *
 * This small structural form intentionally remains package-owned: TypeFest's
 * `ReadonlyDeep` currently exposes private helper identities when TypeScript 7
 * names inferred recipe declarations.
 */
export type DeepReadonlyInitialSetup<T> = T extends readonly unknown[]
  ? { readonly [Key in keyof T]: DeepReadonlyInitialSetup<T[Key]> }
  : T extends object
    ? { readonly [Key in keyof T]: DeepReadonlyInitialSetup<T[Key]> }
    : T;
