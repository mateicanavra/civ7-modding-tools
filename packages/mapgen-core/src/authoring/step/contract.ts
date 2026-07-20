import type { DependencyTag, GenerationPhase } from "@mapgen/engine/index.js";
import { type TObject, type TSchema, Type } from "typebox";
import { type ArtifactContract, assertCanonicalArtifactContract } from "../artifact/contract.js";
import type { ArtifactModule } from "../artifact/module.js";
import { buildOpEnvelopeSchemaWithDefaultStrategy } from "../op/envelope.js";
import { applySchemaConventions } from "../schema.js";
import type { StepOpsDecl, StepOpsDeclInput, StepOpUse } from "./ops.js";

type PropsOf<T extends TObject> = T extends TObject<infer P> ? P : never;

type OpPropsFromDecl<Ops extends StepOpsDecl> = {
  [K in keyof Ops & string]: Ops[K]["config"];
};

type SchemaWithOps<
  Schema extends TObject,
  Ops extends StepOpsDecl | undefined,
> = Ops extends StepOpsDecl ? TObject<PropsOf<Schema> & OpPropsFromDecl<Ops>> : Schema;

function objectProperties(schema: TObject): Record<string, TSchema> {
  return ((schema as any).properties as Record<string, TSchema> | undefined) ?? {};
}

function buildSchemaWithOps<const Schema extends TObject, const Ops extends StepOpsDecl>(input: {
  stepId: string;
  schema: Schema;
  ops: Ops;
}): SchemaWithOps<Schema, Ops> {
  const baseProps = objectProperties(input.schema);
  const opProps: Record<string, TSchema> = {};

  for (const opKey of Object.keys(input.ops) as Array<keyof Ops & string>) {
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
  }

  return Type.Object({ ...baseProps, ...(opProps as any) }, { additionalProperties: false }) as any;
}

type StepOpsDeclNormalizedFromInput<Ops extends StepOpsDeclInput> = Readonly<{
  [K in keyof Ops & string]: NormalizeOpDecl<Ops[K]>;
}>;

type NormalizeOpDecl<T> = T extends StepOpUse<infer C> ? C : T;

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
    if (!defaultStrategy) {
      out[opKey] = contract;
      continue;
    }

    const { schema: config, defaultConfig } = buildOpEnvelopeSchemaWithDefaultStrategy(
      contract.id,
      contract.strategies,
      defaultStrategy
    );
    applySchemaConventions(config, `op:${contract.id}.config`);

    out[opKey] = {
      ...contract,
      config,
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
  if (value === null || typeof value !== "object") {
    throw new Error(`step "${stepId}" artifact module at index ${index} must be an object`);
  }

  const artifactDescriptor = Object.getOwnPropertyDescriptor(value, "artifact");
  const validateDescriptor = Object.getOwnPropertyDescriptor(value, "validate");
  if (!artifactDescriptor || !("value" in artifactDescriptor)) {
    throw new Error(`step "${stepId}" artifact modules must own artifact data properties`);
  }
  if (!validateDescriptor || !("value" in validateDescriptor)) {
    throw new Error(`step "${stepId}" artifact modules must own validate data properties`);
  }

  const artifact = admitArtifactContract(
    stepId,
    artifactDescriptor.value,
    `artifact module at index ${index}`
  );
  const validate = validateDescriptor.value;
  if (typeof validate !== "function") {
    throw new Error(`step "${stepId}" artifact module at index ${index} is invalid`);
  }
  return Object.freeze({ artifact, validate });
}

function snapshotArtifactModuleList(stepId: string, value: unknown): readonly ArtifactModule[] {
  if (!Array.isArray(value)) {
    throw new Error(`step "${stepId}" artifact modules must be an array`);
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== value.length + 1) {
    throw new Error(`step "${stepId}" artifact modules must be a dense array without extra keys`);
  }

  const modules: ArtifactModule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      throw new Error(`step "${stepId}" artifact module at index ${index} must be a data property`);
    }
    modules.push(snapshotArtifactModule(stepId, descriptor.value, index));
  }
  return Object.freeze(modules);
}

function snapshotArtifactsDecl(
  stepId: string,
  input: StepArtifactsDeclInput | undefined
): StepArtifactsDeclInput | undefined {
  if (input === undefined) return undefined;

  const snapshot: {
    requires?: readonly ArtifactContract[];
    provides?: readonly ArtifactModule[];
  } = {};
  if (Object.prototype.hasOwnProperty.call(input, "requires")) {
    snapshot.requires =
      input.requires === undefined
        ? undefined
        : Object.freeze(
            input.requires.map((artifact, index) =>
              admitArtifactContract(stepId, artifact, `required artifact at index ${index}`)
            )
          );
  }
  if (Object.prototype.hasOwnProperty.call(input, "provides")) {
    snapshot.provides =
      input.provides === undefined ? undefined : snapshotArtifactModuleList(stepId, input.provides);
  }
  return Object.freeze(snapshot);
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
  phase: GenerationPhase;
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
  phase: GenerationPhase;
  requires: readonly DependencyTag[];
  provides: readonly DependencyTag[];
  artifacts?: Artifacts;
  schema: Schema;
  ops?: Ops;
}>;

const STEP_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  def: StepContractInput<Schema, Id, undefined, Artifacts> & { artifacts: Artifacts }
): StepContract<Schema, Id, undefined, StepArtifactsDeclFromInput<Artifacts>>;

export function defineStep<
  const Schema extends TObject,
  const Id extends string,
  const Ops extends StepOpsDeclInput,
>(
  def: StepContractInput<Schema, Id, Ops, undefined> & { ops: Ops }
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
  def: StepContractInput<Schema, Id, Ops, Artifacts> & { ops: Ops; artifacts: Artifacts }
): StepContract<
  SchemaWithOps<Schema, StepOpsDeclNormalizedFromInput<Ops>>,
  Id,
  StepOpsDeclNormalizedFromInput<Ops>,
  StepArtifactsDeclFromInput<Artifacts>
>;

export function defineStep(def: any): any {
  if (!STEP_ID_RE.test(def.id)) {
    throw new Error(`step id "${def.id}" must be kebab-case (e.g. "plot-vegetation")`);
  }

  const artifacts = snapshotArtifactsDecl(def.id, def.artifacts);
  const artifactRequires: string[] =
    artifacts?.requires?.map((artifact: ArtifactContract) => artifact.id) ?? [];
  const artifactProvides: string[] =
    artifacts?.provides?.map((module: ArtifactModule) => module.artifact.id) ?? [];
  const hasArtifacts = artifacts !== undefined;

  if (hasArtifacts) {
    const directArtifactTags = [...def.requires, ...def.provides].filter((tag: string) =>
      tag.startsWith("artifact:")
    );
    if (directArtifactTags.length > 0) {
      throw new Error(
        `step "${def.id}" mixes artifact ids in requires/provides with artifacts.*; move artifact ids into artifacts.*`
      );
    }
  }

  const requiredArtifactIds = new Set<string>();
  const providedArtifactIds = new Set<string>();
  const seenProvidedNames = new Set<string>();
  for (const id of artifactRequires) {
    if (requiredArtifactIds.has(id)) {
      throw new Error(
        `step "${def.id}" declares artifact "${id}" multiple times in artifacts.requires`
      );
    }
    requiredArtifactIds.add(id);
  }
  for (const module of artifacts?.provides ?? []) {
    const { id, name } = module.artifact;
    if (requiredArtifactIds.has(id)) {
      throw new Error(
        `step "${def.id}" declares artifact "${id}" in both artifacts.requires and artifacts.provides`
      );
    }
    if (providedArtifactIds.has(id)) {
      throw new Error(
        `step "${def.id}" declares duplicate artifact id "${id}" in artifacts.provides`
      );
    }
    if (seenProvidedNames.has(name)) {
      throw new Error(
        `step "${def.id}" declares duplicate artifact name "${name}" in artifacts.provides`
      );
    }
    providedArtifactIds.add(id);
    seenProvidedNames.add(name);
  }

  const requires = Object.freeze([...def.requires, ...artifactRequires]);
  const provides = Object.freeze([...def.provides, ...artifactProvides]);

  const ops = def.ops ? normalizeOpsDecl({ stepId: def.id, ops: def.ops }) : undefined;

  const schema = ops ? buildSchemaWithOps({ stepId: def.id, schema: def.schema, ops }) : def.schema;
  applySchemaConventions(schema, `step:${def.id}.schema`);

  return Object.freeze({
    ...def,
    ...(hasArtifacts ? { artifacts } : {}),
    requires,
    provides,
    ops,
    schema,
  });
}
