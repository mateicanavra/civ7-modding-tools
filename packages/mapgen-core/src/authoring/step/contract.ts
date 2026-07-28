import { assertCompletionId, type CompletionId } from "@mapgen/engine/completion.js";
import { type TObject, type TSchema, Type } from "typebox";
import { type Artifact, assertArtifact } from "../artifact/contract.js";
import {
  assertInitialSetupDefinitionInternal,
  type InitialSetupDefinition,
} from "../initial-setup/definition.js";
import { isCanonicalOpContract } from "../operation/contract.js";
import { buildOpEnvelopeSchema } from "../operation/envelope.js";
import type { OpTypeBagOf } from "../operation/types.js";
import { applySchemaConventions } from "../schema/conventions.js";
import { freezeContractGraph, snapshotContractGraph } from "../snapshot/contract-graph.js";
import { registerCanonicalStepContractInternal } from "./authority.js";
import { type AuthoredEngineAdapterKey, isAuthoredEngineAdapterKey } from "./engine-authority.js";
import { assertNoStepStageIdentityAliases } from "./identity.js";
import type {
  OpContractAny,
  StepOpsDecl,
  StepOpsDeclInput,
  StepOpUse,
  ValidatedStepOpsDeclInput,
} from "./ops.js";
import { registerScopedStepOpDeclarationInternal } from "./ops.js";

type PropsOf<T extends TObject> = T extends TObject<infer P> ? P : never;

type OpPropsFromDecl<Ops extends StepOpsDecl> = {
  [K in keyof Ops & string]: Ops[K]["config"];
};

type SchemaWithOps<
  Schema extends TObject,
  Ops extends StepOpsDecl | undefined,
> = Ops extends StepOpsDecl
  ? keyof Ops extends never
    ? Schema
    : TObject<PropsOf<Schema> & OpPropsFromDecl<Ops>>
  : Schema;

function createEmptyStepSchema() {
  return Type.Object({}, { additionalProperties: false });
}

type EmptyStepSchema = ReturnType<typeof createEmptyStepSchema>;

type StepSchema<Schema extends TObject | undefined> = Schema extends TObject
  ? Schema
  : EmptyStepSchema;

function objectProperties(schema: TObject): Record<string, TSchema> {
  return ((schema as any).properties as Record<string, TSchema> | undefined) ?? {};
}

const OBJECT_SCHEMA_STRUCTURE_KEYS = new Set<PropertyKey>([
  "~kind",
  "type",
  "required",
  "properties",
  "additionalProperties",
]);
const COMPOSABLE_STEP_SCHEMA_OPTION_KEYS = new Set<PropertyKey>([
  "$schema",
  "$id",
  "title",
  "default",
  "readOnly",
  "writeOnly",
]);

function buildSchemaWithOps<const Schema extends TObject, const Ops extends StepOpsDecl>(input: {
  stepId: string;
  schema: Schema;
  ops: Ops;
}): SchemaWithOps<Schema, Ops> {
  const baseProps = objectProperties(input.schema);
  const opProps: Record<string, TSchema> = {};
  const opDefaults: Record<string, unknown> = {};
  const opKeys = Object.keys(input.ops) as Array<keyof Ops & string>;

  if (opKeys.length === 0) return input.schema as SchemaWithOps<Schema, Ops>;
  if (Object.prototype.hasOwnProperty.call(input.schema, "~codec")) {
    throw new TypeError(
      `step "${input.stepId}" cannot compose operation config into a root codec schema`
    );
  }

  for (const opKey of opKeys) {
    if (Object.prototype.hasOwnProperty.call(baseProps, opKey)) {
      throw new Error(
        `step "${input.stepId}" schema already defines key "${opKey}" (declare it only via contract.ops)`
      );
    }
    const contract = input.ops[opKey]!;
    if (!contract.config) {
      throw new Error(`step "${input.stepId}" op "${String(opKey)}" missing contract.config`);
    }
    opProps[opKey] = contract.config;
    opDefaults[opKey] = contract.defaultConfig;
  }

  const schema = Type.Object(
    { ...baseProps, ...(opProps as any) },
    { additionalProperties: false }
  );
  for (const key of Reflect.ownKeys(input.schema)) {
    if (OBJECT_SCHEMA_STRUCTURE_KEYS.has(key)) continue;
    if (typeof key === "string" && !COMPOSABLE_STEP_SCHEMA_OPTION_KEYS.has(key)) {
      throw new TypeError(
        `step "${input.stepId}" schema option "${key}" cannot be composed with operation config`
      );
    }
    const descriptor = Object.getOwnPropertyDescriptor(input.schema, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new TypeError("step schema options must contain data properties only");
    }

    let value = descriptor.value;
    if (key === "default") {
      const rootDefault = value;
      if (
        rootDefault === null ||
        typeof rootDefault !== "object" ||
        Array.isArray(rootDefault) ||
        (Object.getPrototypeOf(rootDefault) !== Object.prototype &&
          Object.getPrototypeOf(rootDefault) !== null)
      ) {
        throw new TypeError(`step "${input.stepId}" object schema default must be a plain object`);
      }
      value = { ...rootDefault, ...opDefaults };
    }
    Object.defineProperty(schema, key, { ...descriptor, value });
  }

  return schema as SchemaWithOps<Schema, Ops>;
}

type StepOpsDeclNormalizedFromInput<Ops extends StepOpsDeclInput> = Readonly<{
  [K in keyof Ops & string]: NormalizeOpDecl<Ops[K]>;
}>;

type NormalizeOpDecl<T> =
  T extends Readonly<{
    contract: infer C;
    defaultStrategy: infer DefaultStrategy;
  }>
    ? C extends OpContractAny
      ? DefaultStrategy extends keyof C["strategies"] & string
        ? Omit<C, "defaultStrategy" | "defaultConfig"> &
            Readonly<{
              defaultStrategy: DefaultStrategy;
              defaultConfig: Extract<
                OpTypeBagOf<C>["envelope"],
                Readonly<{ strategy: DefaultStrategy }>
              >;
            }>
        : never
      : never
    : T extends StepOpUse<infer C>
      ? C
      : T;

function isOpUse(value: unknown): value is StepOpUse {
  return Boolean(value) && typeof value === "object" && "contract" in (value as any);
}

function normalizeOpsDecl<const Ops extends StepOpsDeclInput>(input: {
  stepId: string;
  ops: Ops;
}): StepOpsDeclNormalizedFromInput<Ops> {
  const out: Record<string, any> = {};

  for (const opKey of Object.keys(input.ops) as Array<keyof Ops & string>) {
    const entry = input.ops[opKey];

    if (!isOpUse(entry)) {
      out[opKey] = entry;
      continue;
    }

    const contract = entry.contract;
    const defaultStrategy = entry.defaultStrategy;
    const { schema: config, defaultConfig } = buildOpEnvelopeSchema(
      contract.id,
      contract.strategies,
      defaultStrategy
    );
    applySchemaConventions(config);

    const declaration = {
      ...contract,
      config,
      defaultStrategy,
      defaultConfig,
    };
    freezeContractGraph(defaultConfig);
    Object.freeze(declaration);
    registerScopedStepOpDeclarationInternal(declaration, contract);
    out[opKey] = declaration;
  }

  return Object.freeze(out) as StepOpsDeclNormalizedFromInput<Ops>;
}

/** One completion id or exact artifact authority selected by a step dependency edge. */
export type StepDependency = CompletionId | Artifact;

/** Ordered dependency selection authored for one direction of a step contract. */
export type StepDependencyList = readonly StepDependency[];

function admitArtifact(stepId: string, value: unknown, location: string): Artifact {
  try {
    assertArtifact(value);
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : "";
    throw new Error(`step "${stepId}" ${location} must be a canonical artifact${detail}`);
  }
  return value;
}

function readDenseArrayLength(value: readonly unknown[], location: string): number {
  const descriptor = Object.getOwnPropertyDescriptor(value, "length");
  if (!descriptor || !("value" in descriptor) || typeof descriptor.value !== "number") {
    throw new Error(`${location} must own a numeric length data property`);
  }
  const length = descriptor.value;
  if (!Number.isSafeInteger(length) || length < 0) {
    throw new Error(`${location} length must be a non-negative safe integer`);
  }
  if (Reflect.ownKeys(value).length !== length + 1) {
    throw new Error(`${location} must be a dense array without extra keys`);
  }
  return length;
}

function readDenseArrayEntry(value: readonly unknown[], index: number, location: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
  if (!descriptor?.enumerable || !("value" in descriptor)) {
    throw new Error(`${location} at index ${index} must be an enumerable data property`);
  }
  return descriptor.value;
}

function readOptionalOwnDataProperty(
  value: object,
  key: PropertyKey,
  location: string
): Readonly<{ present: boolean; value: unknown }> {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor) return { present: false, value: undefined };
  if (!descriptor.enumerable || !("value" in descriptor)) {
    throw new TypeError(`${location} must be an own enumerable data property`);
  }
  return { present: true, value: descriptor.value };
}

function snapshotDependencyList(
  stepId: string,
  property: "requires" | "provides",
  value: unknown
): StepDependencyList {
  if (!Array.isArray(value)) {
    throw new TypeError(`step "${stepId}" ${property} must be an array`);
  }

  const location = `step "${stepId}" ${property}`;
  const length = readDenseArrayLength(value, location);
  const dependencies: StepDependency[] = [];
  for (let index = 0; index < length; index += 1) {
    const dependency = readDenseArrayEntry(value, index, location);
    if (typeof dependency === "string") {
      if (dependency.startsWith("artifact:")) {
        throw new TypeError(
          `${location} at index ${index} must use the canonical artifact authority instead of raw id "${dependency}"`
        );
      }
      assertCompletionId(dependency);
      dependencies.push(dependency);
      continue;
    }
    dependencies.push(admitArtifact(stepId, dependency, `${property} at index ${index}`));
  }
  return Object.freeze(dependencies);
}

/**
 * Frozen authoring contract for one recipe step.
 * Each ordered dependency list retains completion ids and exact artifact authorities in one place;
 * recipe compilation validates their causal providers and projects their ids for diagnostics.
 */
export type StepContract<
  Schema extends TObject,
  Id extends string,
  Ops extends StepOpsDecl | undefined = undefined,
  Requires extends StepDependencyList = StepDependencyList,
  Provides extends StepDependencyList = StepDependencyList,
  Engine extends StepEngineDecl | undefined = StepEngineDecl | undefined,
  InitialSetup extends InitialSetupDefinition | undefined = InitialSetupDefinition | undefined,
> = Readonly<{
  id: Id;
  description?: string;
  requires: Requires;
  provides: Provides;
  engine?: Engine;
  initialSetup?: InitialSetup;
  schema: Schema;
  ops?: Ops;
}>;

type StepContractBaseInput<
  Id extends string,
  Ops extends StepOpsDeclInput | undefined,
  Requires extends StepDependencyList,
  Provides extends StepDependencyList,
  Engine extends StepEngineDecl | undefined,
  InitialSetup extends InitialSetupDefinition | undefined,
> = Readonly<{
  id: Id;
  description?: string;
  requires: Requires;
  provides: Provides;
  engine?: Engine;
  initialSetup?: InitialSetup;
  ops?: Ops;
}>;

type StepContractInput<
  Schema extends TObject | undefined,
  Id extends string,
  Ops extends StepOpsDeclInput | undefined,
  Requires extends StepDependencyList,
  Provides extends StepDependencyList,
  Engine extends StepEngineDecl | undefined,
  InitialSetup extends InitialSetupDefinition | undefined,
> = StepContractBaseInput<Id, Ops, Requires, Provides, Engine, InitialSetup> &
  Readonly<{
    schema?: Schema &
      (Schema extends TObject ? (keyof PropsOf<Schema> extends never ? never : unknown) : unknown);
  }>;

const STEP_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STEP_DEFINITION_KEYS = new Set<PropertyKey>([
  "id",
  "description",
  "requires",
  "provides",
  "engine",
  "initialSetup",
  "schema",
  "ops",
]);

function assertStepDefinitionKeys(def: object): void {
  for (const key of Reflect.ownKeys(def)) {
    if (!STEP_DEFINITION_KEYS.has(key)) {
      throw new TypeError(`step contract cannot own unsupported property "${String(key)}"`);
    }
  }
}

/** Exact callable engine methods admitted to one authored step contract. */
export type StepEngineDecl = readonly AuthoredEngineAdapterKey[];

type ValidatedStepEngineDeclInput<Engine extends StepEngineDecl | undefined> =
  Engine extends StepEngineDecl
    ? number extends Engine["length"]
      ? Readonly<{ engine: never }>
      : unknown
    : unknown;

function snapshotEngineDecl(stepId: string, value: unknown): StepEngineDecl | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new TypeError(`step "${stepId}" engine declaration must be an array`);
  }
  const location = `step "${stepId}" engine declaration`;
  const length = readDenseArrayLength(value, location);
  const out: AuthoredEngineAdapterKey[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < length; index++) {
    const key = readDenseArrayEntry(value, index, location);
    if (!isAuthoredEngineAdapterKey(key)) {
      throw new Error(
        `step "${stepId}" declares unavailable authored engine method "${String(key)}"`
      );
    }
    if (seen.has(key)) {
      throw new Error(`step "${stepId}" declares engine method "${key}" multiple times`);
    }
    seen.add(key);
    out.push(key);
  }
  return Object.freeze(out);
}

function snapshotStepDefinition(def: unknown): Readonly<{
  id: unknown;
  description: unknown;
  requires: unknown;
  provides: unknown;
  engine: unknown;
  initialSetup: unknown;
  schema: unknown;
  ops: unknown;
}> {
  if (def === null || typeof def !== "object" || Array.isArray(def)) {
    throw new TypeError("step contract definition must be an object");
  }
  assertNoStepStageIdentityAliases(def, "step contract");
  assertStepDefinitionKeys(def);

  const required = (key: "id" | "requires" | "provides"): unknown => {
    const property = readOptionalOwnDataProperty(def, key, `step contract ${key}`);
    if (!property.present) {
      throw new TypeError(`step contract must own ${key}`);
    }
    return property.value;
  };
  const description = readOptionalOwnDataProperty(def, "description", "step contract description");
  const engine = readOptionalOwnDataProperty(def, "engine", "step contract engine");
  const initialSetup = readOptionalOwnDataProperty(
    def,
    "initialSetup",
    "step contract initialSetup"
  );
  const ops = readOptionalOwnDataProperty(def, "ops", "step contract ops");
  const id = required("id");
  const requires = required("requires");
  const provides = required("provides");
  const schema = readOptionalOwnDataProperty(def, "schema", "step contract schema");

  return {
    id,
    description: description.value,
    requires,
    provides,
    engine: engine.value,
    initialSetup: initialSetup.value,
    schema: schema.value,
    ops: ops.value,
  };
}

/** Admits and freezes one step contract with exact completion and artifact dependencies. */
export function defineStep<
  const Id extends string,
  const Requires extends StepDependencyList,
  const Provides extends StepDependencyList,
  const Schema extends TObject | undefined = undefined,
  const Engine extends StepEngineDecl | undefined = undefined,
  const InitialSetup extends InitialSetupDefinition | undefined = undefined,
>(
  def: StepContractInput<Schema, Id, undefined, Requires, Provides, Engine, InitialSetup> &
    ValidatedStepEngineDeclInput<Engine>
): StepContract<StepSchema<Schema>, Id, undefined, Requires, Provides, Engine, InitialSetup>;

export function defineStep<
  const Id extends string,
  const Ops extends StepOpsDeclInput,
  const Requires extends StepDependencyList,
  const Provides extends StepDependencyList,
  const Schema extends TObject | undefined = undefined,
  const Engine extends StepEngineDecl | undefined = undefined,
  const InitialSetup extends InitialSetupDefinition | undefined = undefined,
>(
  def: StepContractInput<Schema, Id, Ops, Requires, Provides, Engine, InitialSetup> & {
    ops: Ops & ValidatedStepOpsDeclInput<Ops>;
  } & ValidatedStepEngineDeclInput<Engine>
): StepContract<
  SchemaWithOps<StepSchema<Schema>, StepOpsDeclNormalizedFromInput<Ops>>,
  Id,
  StepOpsDeclNormalizedFromInput<Ops>,
  Requires,
  Provides,
  Engine,
  InitialSetup
>;

export function defineStep(def: any): any {
  const admitted = snapshotStepDefinition(def);
  if (typeof admitted.id !== "string" || !STEP_ID_RE.test(admitted.id)) {
    throw new Error(`step id "${String(admitted.id)}" must be kebab-case (e.g. "plot-vegetation")`);
  }
  const stepId = admitted.id;
  if (
    admitted.description !== undefined &&
    (typeof admitted.description !== "string" || admitted.description.trim().length === 0)
  ) {
    throw new TypeError(`step "${stepId}" description must be a non-empty string`);
  }
  const description = admitted.description as string | undefined;
  const requires = snapshotDependencyList(stepId, "requires", admitted.requires);
  const provides = snapshotDependencyList(stepId, "provides", admitted.provides);
  const engine = snapshotEngineDecl(stepId, admitted.engine);
  const initialSetup =
    admitted.initialSetup === undefined
      ? undefined
      : (assertInitialSetupDefinitionInternal(admitted.initialSetup), admitted.initialSetup);
  const requiredDependencyIds = new Set<string>();
  const providedDependencyIds = new Set<string>();
  const seenArtifactNames = new Set<string>();
  for (const dependency of requires) {
    const id = typeof dependency === "string" ? dependency : dependency.id;
    if (requiredDependencyIds.has(id)) {
      throw new Error(`step "${stepId}" declares dependency "${id}" multiple times in requires`);
    }
    requiredDependencyIds.add(id);
    if (typeof dependency === "string") continue;
    const { name } = dependency;
    if (seenArtifactNames.has(name)) {
      throw new Error(`step "${stepId}" declares duplicate artifact name "${name}"`);
    }
    seenArtifactNames.add(name);
  }
  for (const dependency of provides) {
    const id = typeof dependency === "string" ? dependency : dependency.id;
    if (requiredDependencyIds.has(id)) {
      throw new Error(`step "${stepId}" declares dependency "${id}" in both requires and provides`);
    }
    if (providedDependencyIds.has(id)) {
      throw new Error(`step "${stepId}" declares dependency "${id}" multiple times in provides`);
    }
    providedDependencyIds.add(id);
    if (typeof dependency === "string") continue;
    const { name } = dependency;
    if (seenArtifactNames.has(name)) {
      throw new Error(`step "${stepId}" declares duplicate artifact name "${name}"`);
    }
    seenArtifactNames.add(name);
  }

  const detachedOps =
    admitted.ops === undefined
      ? undefined
      : (snapshotContractGraph(admitted.ops, `step "${stepId}" ops`, {
          preserve: isCanonicalOpContract,
        }) as StepOpsDeclInput);
  const ops = detachedOps ? normalizeOpsDecl({ stepId, ops: detachedOps }) : undefined;

  const declaredSchema =
    admitted.schema === undefined
      ? createEmptyStepSchema()
      : (snapshotContractGraph(admitted.schema, `step "${stepId}" schema`) as TObject);
  if (
    admitted.schema !== undefined &&
    Object.prototype.hasOwnProperty.call(declaredSchema, "description")
  ) {
    throw new TypeError(
      `step "${stepId}" schema cannot own description; author it through step.description`
    );
  }
  if (admitted.schema !== undefined && Object.keys(objectProperties(declaredSchema)).length === 0) {
    throw new TypeError(
      `step "${stepId}" schema adds no authored fields; omit schema and use step.description for semantic context`
    );
  }
  const schema = ops ? buildSchemaWithOps({ stepId, schema: declaredSchema, ops }) : declaredSchema;
  if (description !== undefined) {
    Object.defineProperty(schema, "description", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: description,
    });
  }
  applySchemaConventions(schema);

  const contract = {
    id: stepId,
    ...(description === undefined ? {} : { description }),
    requires,
    provides,
    ...(engine === undefined ? {} : { engine }),
    ...(initialSetup === undefined ? {} : { initialSetup }),
    schema,
    ...(ops === undefined ? {} : { ops }),
  };
  // TypeBox schemas remain composable builder values. Caller inputs were detached above; freeze
  // the owned records/defaults and outer authority without freezing any public schema graph.
  Object.freeze(contract);
  registerCanonicalStepContractInternal(contract);
  return contract;
}
