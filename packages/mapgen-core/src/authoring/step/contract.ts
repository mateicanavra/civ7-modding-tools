import type { DependencyTag } from "@mapgen/engine/index.js";
import { type TObject, type TSchema, Type } from "typebox";
import { type Artifact, assertArtifact } from "../artifact/contract.js";
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

/**
 * Artifact dependencies owned by a step contract.
 * Requirements and providers retain the same complete artifact authority, so dependency identity
 * and publication admission cannot diverge.
 */
export type StepArtifactsDecl<
  Requires extends readonly Artifact[] | undefined = undefined,
  Provides extends readonly Artifact[] | undefined = undefined,
> = Readonly<{
  requires?: Requires;
  provides?: Provides;
}>;

/** Type-erased artifact declaration used by generic step-authoring helpers. */
export type StepArtifactsDeclAny = StepArtifactsDecl<
  readonly Artifact[] | undefined,
  readonly Artifact[] | undefined
>;

type StepArtifactsDeclInput = Readonly<{
  requires?: readonly Artifact[];
  provides?: readonly Artifact[];
}>;

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

function snapshotArtifactList(
  stepId: string,
  property: "required" | "provided",
  value: unknown
): readonly Artifact[] {
  if (!Array.isArray(value)) {
    throw new Error(`step "${stepId}" ${property} artifacts must be an array`);
  }

  const location = `step "${stepId}" ${property} artifacts`;
  const length = readDenseArrayLength(value, location);
  const artifacts: Artifact[] = [];
  for (let index = 0; index < length; index += 1) {
    artifacts.push(
      admitArtifact(
        stepId,
        readDenseArrayEntry(value, index, location),
        `${property} artifact at index ${index}`
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
    requires?: readonly Artifact[];
    provides?: readonly Artifact[];
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
        : snapshotArtifactList(stepId, "required", requires.value);
  }
  if (provides.present) {
    snapshot.provides =
      provides.value === undefined
        ? undefined
        : snapshotArtifactList(stepId, "provided", provides.value);
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
  Extract<T, readonly Artifact[]> extends never ? undefined : Extract<T, readonly Artifact[]>;

type StepArtifactsDeclFromInput<T extends StepArtifactsDeclInput | undefined> =
  T extends StepArtifactsDeclInput
    ? StepArtifactsDecl<
        CoerceArtifactList<StepArtifactsRequires<T>>,
        CoerceArtifactList<StepArtifactsProvides<T>>
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
  Engine extends StepEngineDecl | undefined = StepEngineDecl | undefined,
> = Readonly<{
  id: Id;
  requires: readonly DependencyTag[];
  provides: readonly DependencyTag[];
  artifacts?: Artifacts;
  engine?: Engine;
  schema: Schema;
  ops?: Ops;
}>;

type StepContractInput<
  Schema extends TObject,
  Id extends string,
  Ops extends StepOpsDeclInput | undefined,
  Artifacts extends StepArtifactsDeclInput | undefined,
  Engine extends StepEngineDecl | undefined,
> = Readonly<{
  id: Id;
  requires: readonly DependencyTag[];
  provides: readonly DependencyTag[];
  artifacts?: Artifacts;
  engine?: Engine;
  schema: Schema;
  ops?: Ops;
}>;

const STEP_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  requires: unknown;
  provides: unknown;
  artifacts: unknown;
  engine: unknown;
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
  const engine = readOptionalOwnDataProperty(def, "engine", "step contract engine");
  const ops = readOptionalOwnDataProperty(def, "ops", "step contract ops");

  return {
    id: required("id"),
    requires: required("requires"),
    provides: required("provides"),
    artifacts: artifacts.value,
    engine: engine.value,
    schema: required("schema"),
    ops: ops.value,
  };
}

/**
 * Admits and freezes a step contract, deriving dependency tags from its artifact authorities.
 */
export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Engine extends StepEngineDecl | undefined = undefined,
>(
  def: StepContractInput<Schema, Id, undefined, undefined, Engine> &
    ValidatedStepEngineDeclInput<Engine>
): StepContract<Schema, Id, undefined, undefined, Engine>;

export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Artifacts extends StepArtifactsDeclInput,
  const Engine extends StepEngineDecl | undefined = undefined,
>(
  def: StepContractInput<Schema, Id, undefined, Artifacts, Engine> & {
    artifacts: Artifacts;
  } & ValidatedStepEngineDeclInput<Engine>
): StepContract<Schema, Id, undefined, StepArtifactsDeclFromInput<Artifacts>, Engine>;

export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Ops extends StepOpsDeclInput,
  const Engine extends StepEngineDecl | undefined = undefined,
>(
  def: StepContractInput<Schema, Id, Ops, undefined, Engine> & {
    ops: Ops & ValidatedStepOpsDeclInput<Ops>;
  } & ValidatedStepEngineDeclInput<Engine>
): StepContract<
  SchemaWithOps<Schema, StepOpsDeclNormalizedFromInput<Ops>>,
  Id,
  StepOpsDeclNormalizedFromInput<Ops>,
  undefined,
  Engine
>;

export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Ops extends StepOpsDeclInput,
  const Artifacts extends StepArtifactsDeclInput,
  const Engine extends StepEngineDecl | undefined = undefined,
>(
  def: StepContractInput<Schema, Id, Ops, Artifacts, Engine> & {
    ops: Ops & ValidatedStepOpsDeclInput<Ops>;
    artifacts: Artifacts;
  } & ValidatedStepEngineDeclInput<Engine>
): StepContract<
  SchemaWithOps<Schema, StepOpsDeclNormalizedFromInput<Ops>>,
  Id,
  StepOpsDeclNormalizedFromInput<Ops>,
  StepArtifactsDeclFromInput<Artifacts>,
  Engine
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
  const engine = snapshotEngineDecl(stepId, admitted.engine);
  const artifactRequires: string[] =
    artifacts?.requires?.map((artifact: Artifact) => artifact.id) ?? [];
  const artifactProvides: string[] =
    artifacts?.provides?.map((artifact: Artifact) => artifact.id) ?? [];
  const hasArtifacts = artifacts !== undefined;

  const directArtifactTags = [...declaredRequires, ...declaredProvides].filter((tag: string) =>
    tag.startsWith("artifact:")
  );
  if (directArtifactTags.length > 0) {
    throw new Error(
      `step "${stepId}" cannot declare artifact ids in requires/provides; use artifacts.requires/provides so the artifact remains authoritative`
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
  for (const artifact of artifacts?.provides ?? []) {
    const { id, name } = artifact;
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
      : (snapshotContractGraph(admitted.ops, `step "${stepId}" ops`, {
          preserve: isCanonicalOpContract,
        }) as StepOpsDeclInput);
  const ops = detachedOps ? normalizeOpsDecl({ stepId, ops: detachedOps }) : undefined;

  const declaredSchema = snapshotContractGraph(
    admitted.schema,
    `step "${stepId}" schema`
  ) as TObject;
  const schema = ops ? buildSchemaWithOps({ stepId, schema: declaredSchema, ops }) : declaredSchema;
  applySchemaConventions(schema);

  const contract = {
    id: stepId,
    requires,
    provides,
    ...(hasArtifacts ? { artifacts } : {}),
    ...(engine === undefined ? {} : { engine }),
    schema,
    ...(ops === undefined ? {} : { ops }),
  };
  // TypeBox schemas remain composable builder values. Caller inputs were detached above; freeze
  // the owned records/defaults and outer authority without freezing any public schema graph.
  Object.freeze(contract);
  registerCanonicalStepContractInternal(contract);
  return contract;
}
