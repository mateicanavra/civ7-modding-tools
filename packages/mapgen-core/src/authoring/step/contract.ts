import type { DependencyTag } from "@mapgen/engine/index.js";
import { type TObject, type TSchema, Type } from "typebox";
import { type ArtifactContract, assertCanonicalArtifactContract } from "../artifact/contract.js";
import {
  type ArtifactModule,
  type SchemaBoundArtifactModuleList,
  snapshotArtifactModule as snapshotBoundArtifactModule,
} from "../artifact/module.js";
import { buildOpEnvelopeSchema } from "../op/envelope.js";
import type { OpTypeBagOf } from "../op/types.js";
import { applySchemaConventions } from "../schema.js";
import { registerCanonicalStepContractInternal } from "./authority.js";
import { assertNoStepStageIdentityAliases } from "./identity.js";
import type {
  OpContractAny,
  StepOpsDecl,
  StepOpsDeclInput,
  StepOpUse,
  ValidatedStepOpsDeclInput,
} from "./ops.js";

type PropsOf<T extends TObject> = T extends TObject<infer P> ? P : never;

function freezeStepContractGraph(value: unknown, seen = new WeakSet<object>()): void {
  if (value === null || typeof value !== "object" || seen.has(value)) {
    return;
  }

  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new TypeError("step contract graphs must contain data properties only");
    }
    freezeStepContractGraph(descriptor.value, seen);
  }
  Object.freeze(value);
}

type StepContractSnapshotState = Readonly<{
  active: WeakSet<object>;
  snapshots: WeakMap<object, object>;
}>;

function snapshotStepContractGraph(
  value: unknown,
  location: string,
  state: StepContractSnapshotState = {
    active: new WeakSet<object>(),
    snapshots: new WeakMap<object, object>(),
  }
): unknown {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) return value;

  // TypeBox codecs carry executable behavior. The contract borrows callback identity while
  // detaching and freezing the surrounding schema data that selects and describes that behavior.
  if (typeof value === "function") return value;
  if (state.active.has(value)) {
    throw new TypeError(`${location} must not contain cyclic schema metadata`);
  }
  const existing = state.snapshots.get(value);
  if (existing) return existing;

  const isArray = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);
  const expectedPrototype = isArray ? Array.prototype : Object.prototype;
  if (prototype !== expectedPrototype && prototype !== null) {
    throw new TypeError(
      `${location} must contain only plain schema data; mutable object instances are unsupported`
    );
  }

  const snapshot: object = isArray ? [] : Object.create(prototype);
  state.active.add(value);
  state.snapshots.set(value, snapshot);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) {
      throw new TypeError(`${location} must contain data properties only`);
    }
    const child = `${location}${typeof key === "symbol" ? `[${String(key)}]` : `.${key}`}`;
    Object.defineProperty(snapshot, key, {
      ...descriptor,
      value: snapshotStepContractGraph(descriptor.value, child, state),
    });
  }
  state.active.delete(value);
  return snapshot;
}

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
  "description",
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
    applySchemaConventions(config, `op:${contract.id}.config`);

    out[opKey] = {
      ...contract,
      config,
      defaultStrategy,
      defaultConfig,
    };
  }

  return out as StepOpsDeclNormalizedFromInput<Ops>;
}

/**
 * Artifact dependencies owned by a step contract.
 * Requirements name consumed contracts; providers carry the complete contract and validator
 * module so dependency identity and publication admission cannot diverge.
 */
export type StepArtifactsDecl<
  Requires extends readonly ArtifactContract[] | undefined = undefined,
  Provides extends readonly ArtifactModule[] | undefined = undefined,
> = Readonly<{
  requires?: Requires;
  provides?: Provides;
}>;

/** Type-erased artifact declaration used by generic step-authoring helpers. */
export type StepArtifactsDeclAny = StepArtifactsDecl<
  readonly ArtifactContract[] | undefined,
  readonly ArtifactModule[] | undefined
>;

type StepArtifactsDeclInput = Readonly<{
  requires?: readonly ArtifactContract[];
  provides?: readonly ArtifactModule[];
}>;

type ValidatedStepArtifactsDeclInput<Artifacts extends StepArtifactsDeclInput> = Artifacts extends {
  provides: infer Modules extends readonly ArtifactModule[];
}
  ? Readonly<{ provides: Modules & SchemaBoundArtifactModuleList<Modules> }>
  : unknown;

function admitArtifactContract(stepId: string, value: unknown, location: string): ArtifactContract {
  try {
    assertCanonicalArtifactContract(value);
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : "";
    throw new Error(`step "${stepId}" ${location} must be a canonical artifact contract${detail}`);
  }
  return value;
}

function snapshotArtifactModule(stepId: string, value: unknown, index: number): ArtifactModule {
  return snapshotBoundArtifactModule(value, `step "${stepId}" artifact module at index ${index}`);
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

function snapshotArtifactModuleList(stepId: string, value: unknown): readonly ArtifactModule[] {
  if (!Array.isArray(value)) {
    throw new Error(`step "${stepId}" artifact modules must be an array`);
  }

  const location = `step "${stepId}" artifact modules`;
  const length = readDenseArrayLength(value, location);
  const modules: ArtifactModule[] = [];
  for (let index = 0; index < length; index += 1) {
    modules.push(
      snapshotArtifactModule(stepId, readDenseArrayEntry(value, index, location), index)
    );
  }
  return Object.freeze(modules);
}

function snapshotRequiredArtifactList(stepId: string, value: unknown): readonly ArtifactContract[] {
  if (!Array.isArray(value)) {
    throw new Error(`step "${stepId}" required artifacts must be an array`);
  }

  const location = `step "${stepId}" required artifacts`;
  const length = readDenseArrayLength(value, location);
  const artifacts: ArtifactContract[] = [];
  for (let index = 0; index < length; index += 1) {
    artifacts.push(
      admitArtifactContract(
        stepId,
        readDenseArrayEntry(value, index, location),
        `required artifact at index ${index}`
      )
    );
  }
  return Object.freeze(artifacts);
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

function snapshotArtifactsDecl(stepId: string, input: unknown): StepArtifactsDeclInput | undefined {
  if (input === undefined) return undefined;
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError(`step "${stepId}" artifacts must be an object`);
  }

  const snapshot: {
    requires?: readonly ArtifactContract[];
    provides?: readonly ArtifactModule[];
  } = {};
  const requires = readOptionalOwnDataProperty(
    input,
    "requires",
    `step "${stepId}" artifacts.requires`
  );
  const provides = readOptionalOwnDataProperty(
    input,
    "provides",
    `step "${stepId}" artifacts.provides`
  );
  if (requires.present) {
    snapshot.requires =
      requires.value === undefined
        ? undefined
        : snapshotRequiredArtifactList(stepId, requires.value);
  }
  if (provides.present) {
    snapshot.provides =
      provides.value === undefined ? undefined : snapshotArtifactModuleList(stepId, provides.value);
  }
  return Object.freeze(snapshot);
}

function snapshotDependencyTagList(
  stepId: string,
  property: "requires" | "provides",
  value: unknown
): readonly DependencyTag[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`step "${stepId}" ${property} must be an array`);
  }

  const location = `step "${stepId}" ${property}`;
  const length = readDenseArrayLength(value, location);
  const tags: DependencyTag[] = [];
  for (let index = 0; index < length; index += 1) {
    const tag = readDenseArrayEntry(value, index, location);
    if (typeof tag !== "string") {
      throw new TypeError(`${location} at index ${index} must be a string`);
    }
    tags.push(tag as DependencyTag);
  }
  return Object.freeze(tags);
}

type StepArtifactsRequires<T> = T extends { requires?: infer R } ? R : undefined;
type StepArtifactsProvides<T> = T extends { provides?: infer P } ? P : undefined;

type CoerceArtifactList<T> =
  Extract<T, readonly ArtifactContract[]> extends never
    ? undefined
    : Extract<T, readonly ArtifactContract[]>;

type SnapshotArtifactModuleList<T extends readonly ArtifactModule[]> = {
  readonly [K in keyof T]: T[K] extends ArtifactModule<infer Artifact>
    ? ArtifactModule<Artifact>
    : never;
};

type CoerceArtifactModuleList<T> =
  Extract<T, readonly ArtifactModule[]> extends infer Modules
    ? Modules extends readonly ArtifactModule[]
      ? SnapshotArtifactModuleList<Modules>
      : undefined
    : undefined;

type StepArtifactsDeclFromInput<T extends StepArtifactsDeclInput | undefined> =
  T extends StepArtifactsDeclInput
    ? StepArtifactsDecl<
        CoerceArtifactList<StepArtifactsRequires<T>>,
        CoerceArtifactModuleList<StepArtifactsProvides<T>>
      >
    : undefined;

/**
 * Frozen authoring contract for one recipe step.
 * `defineStep` derives artifact dependency tags from this contract before any implementation runs.
 */
export type StepContract<
  Schema extends TObject,
  Id extends string,
  Ops extends StepOpsDecl | undefined = undefined,
  Artifacts extends StepArtifactsDeclAny | undefined = StepArtifactsDeclAny | undefined,
> = Readonly<{
  id: Id;
  requires: readonly DependencyTag[];
  provides: readonly DependencyTag[];
  artifacts?: Artifacts;
  schema: Schema;
  ops?: Ops;
}>;

type StepContractInput<
  Schema extends TObject,
  Id extends string,
  Ops extends StepOpsDeclInput | undefined,
  Artifacts extends StepArtifactsDeclInput | undefined,
> = Readonly<{
  id: Id;
  requires: readonly DependencyTag[];
  provides: readonly DependencyTag[];
  artifacts?: Artifacts;
  schema: Schema;
  ops?: Ops;
}>;

const STEP_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function snapshotStepDefinition(def: unknown): Readonly<{
  id: unknown;
  requires: unknown;
  provides: unknown;
  artifacts: unknown;
  schema: unknown;
  ops: unknown;
}> {
  if (def === null || typeof def !== "object" || Array.isArray(def)) {
    throw new TypeError("step contract definition must be an object");
  }
  assertNoStepStageIdentityAliases(def, "step contract");

  const required = (key: "id" | "requires" | "provides" | "schema"): unknown => {
    const property = readOptionalOwnDataProperty(def, key, `step contract ${key}`);
    if (!property.present) {
      throw new TypeError(`step contract must own ${key}`);
    }
    return property.value;
  };
  const artifacts = readOptionalOwnDataProperty(def, "artifacts", "step contract artifacts");
  const ops = readOptionalOwnDataProperty(def, "ops", "step contract ops");

  return {
    id: required("id"),
    requires: required("requires"),
    provides: required("provides"),
    artifacts: artifacts.value,
    schema: required("schema"),
    ops: ops.value,
  };
}

/**
 * Admits and freezes a step contract, deriving artifact dependency tags from its declared modules.
 * Provider modules are validated here so later implementation and recipe assembly consume one
 * immutable contract/validator authority.
 */
export function defineStep<const Schema extends TObject, const Id extends string>(
  def: StepContractInput<Schema, Id, undefined, undefined>
): StepContract<Schema, Id, undefined, undefined>;

export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Artifacts extends StepArtifactsDeclInput,
>(
  def: StepContractInput<Schema, Id, undefined, Artifacts> & {
    artifacts: Artifacts & ValidatedStepArtifactsDeclInput<Artifacts>;
  }
): StepContract<Schema, Id, undefined, StepArtifactsDeclFromInput<Artifacts>>;

export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Ops extends StepOpsDeclInput,
>(
  def: StepContractInput<Schema, Id, Ops, undefined> & {
    ops: Ops & ValidatedStepOpsDeclInput<Ops>;
  }
): StepContract<
  SchemaWithOps<Schema, StepOpsDeclNormalizedFromInput<Ops>>,
  Id,
  StepOpsDeclNormalizedFromInput<Ops>,
  undefined
>;

export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Ops extends StepOpsDeclInput,
  const Artifacts extends StepArtifactsDeclInput,
>(
  def: StepContractInput<Schema, Id, Ops, Artifacts> & {
    ops: Ops & ValidatedStepOpsDeclInput<Ops>;
    artifacts: Artifacts & ValidatedStepArtifactsDeclInput<Artifacts>;
  }
): StepContract<
  SchemaWithOps<Schema, StepOpsDeclNormalizedFromInput<Ops>>,
  Id,
  StepOpsDeclNormalizedFromInput<Ops>,
  StepArtifactsDeclFromInput<Artifacts>
>;

export function defineStep(def: any): any {
  const admitted = snapshotStepDefinition(def);
  if (typeof admitted.id !== "string" || !STEP_ID_RE.test(admitted.id)) {
    throw new Error(`step id "${String(admitted.id)}" must be kebab-case (e.g. "plot-vegetation")`);
  }
  const stepId = admitted.id;
  const declaredRequires = snapshotDependencyTagList(stepId, "requires", admitted.requires);
  const declaredProvides = snapshotDependencyTagList(stepId, "provides", admitted.provides);

  const artifacts = snapshotArtifactsDecl(stepId, admitted.artifacts);
  const artifactRequires: string[] =
    artifacts?.requires?.map((artifact: ArtifactContract) => artifact.id) ?? [];
  const artifactProvides: string[] =
    artifacts?.provides?.map((module: ArtifactModule) => module.artifact.id) ?? [];
  const hasArtifacts = artifacts !== undefined;

  const directArtifactTags = [...declaredRequires, ...declaredProvides].filter((tag: string) =>
    tag.startsWith("artifact:")
  );
  if (directArtifactTags.length > 0) {
    throw new Error(
      `step "${stepId}" cannot declare artifact ids in requires/provides; use artifacts.requires/provides so the contract and validator remain authoritative`
    );
  }

  const requiredArtifactIds = new Set<string>();
  const providedArtifactIds = new Set<string>();
  const seenArtifactNames = new Set<string>();
  for (const contract of artifacts?.requires ?? []) {
    const { id, name } = contract;
    if (requiredArtifactIds.has(id)) {
      throw new Error(
        `step "${stepId}" declares artifact "${id}" multiple times in artifacts.requires`
      );
    }
    if (seenArtifactNames.has(name)) {
      throw new Error(`step "${stepId}" declares duplicate artifact name "${name}"`);
    }
    requiredArtifactIds.add(id);
    seenArtifactNames.add(name);
  }
  for (const module of artifacts?.provides ?? []) {
    const { id, name } = module.artifact;
    if (requiredArtifactIds.has(id)) {
      throw new Error(
        `step "${stepId}" declares artifact "${id}" in both artifacts.requires and artifacts.provides`
      );
    }
    if (providedArtifactIds.has(id)) {
      throw new Error(
        `step "${stepId}" declares duplicate artifact id "${id}" in artifacts.provides`
      );
    }
    if (seenArtifactNames.has(name)) {
      throw new Error(`step "${stepId}" declares duplicate artifact name "${name}"`);
    }
    providedArtifactIds.add(id);
    seenArtifactNames.add(name);
  }

  const requires = Object.freeze([...declaredRequires, ...artifactRequires]);
  const provides = Object.freeze([...declaredProvides, ...artifactProvides]);

  const detachedOps =
    admitted.ops === undefined
      ? undefined
      : (snapshotStepContractGraph(admitted.ops, `step "${stepId}" ops`) as StepOpsDeclInput);
  const ops = detachedOps ? normalizeOpsDecl({ stepId, ops: detachedOps }) : undefined;

  const declaredSchema = snapshotStepContractGraph(
    admitted.schema,
    `step "${stepId}" schema`
  ) as TObject;
  const schema = ops ? buildSchemaWithOps({ stepId, schema: declaredSchema, ops }) : declaredSchema;
  applySchemaConventions(schema, `step:${stepId}.schema`);

  const contract = {
    id: stepId,
    requires,
    provides,
    ...(hasArtifacts ? { artifacts } : {}),
    schema,
    ...(ops === undefined ? {} : { ops }),
  };
  freezeStepContractGraph(contract);
  registerCanonicalStepContractInternal(contract);
  return contract;
}
