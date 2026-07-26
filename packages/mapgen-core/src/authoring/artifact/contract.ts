import type { ReadonlyDeep } from "type-fest";
import type { Static, TSchema } from "typebox";

import { applySchemaConventions } from "../schema/conventions.js";
import {
  type ArtifactRefinement,
  type ArtifactValidator,
  createArtifactValidatorInternal,
} from "./validation.js";

const ARTIFACT_NAME_RE = /^[a-z][a-zA-Z0-9]*$/;
const RESERVED_ARTIFACT_NAMES = new Set(["__proto__", "prototype", "constructor"]);
const ARTIFACT_ID_PREFIX = "artifact:";
const ARTIFACT_ID_SUFFIX_RE = /@v\d+/;

function freezeSchemaGraph(schema: TSchema): void {
  const visited = new WeakSet<object>();
  const freeze = (value: unknown): void => {
    if (
      value === null ||
      (typeof value !== "object" && typeof value !== "function") ||
      visited.has(value)
    ) {
      return;
    }

    visited.add(value);
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor && "value" in descriptor) freeze(descriptor.value);
    }
    Object.freeze(value);
  };

  freeze(schema);
}

/** One canonical artifact authority: identity, schema, and complete admission behavior. */
export type Artifact<
  Name extends string = string,
  Id extends string = string,
  Schema extends TSchema = TSchema,
> = Readonly<{
  name: Name;
  id: Id;
  schema: Schema;
  validate: ArtifactValidator;
}>;

export type ArtifactValueOf<A extends Artifact<any, any, any>> = Static<A["schema"]>;

/** Deep readonly projection used for values after immutable artifact publication. */
export type DeepReadonly<T> = ReadonlyDeep<T>;

export type ArtifactReadValueOf<A extends Artifact<any, any, any>> = DeepReadonly<
  ArtifactValueOf<A>
>;

function assertValidArtifactName(name: unknown): asserts name is string {
  if (typeof name !== "string") {
    throw new Error("artifact name must be a string");
  }
  if (!ARTIFACT_NAME_RE.test(name)) {
    throw new Error(
      `artifact name "${name}" must be camelCase (e.g. "featureIntents") and contain only letters/numbers`
    );
  }
  if (RESERVED_ARTIFACT_NAMES.has(name)) {
    throw new Error(`artifact name "${name}" is reserved and cannot be used`);
  }
}

function assertValidArtifactId(id: unknown): asserts id is string {
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("artifact id must be a non-empty string");
  }
  if (!id.startsWith(ARTIFACT_ID_PREFIX)) {
    throw new Error(`artifact id "${id}" must start with "${ARTIFACT_ID_PREFIX}"`);
  }
  if (id.length === ARTIFACT_ID_PREFIX.length) {
    throw new Error(`artifact id "${id}" must include a name after "${ARTIFACT_ID_PREFIX}"`);
  }
  if (ARTIFACT_ID_SUFFIX_RE.test(id)) {
    throw new Error(`artifact id "${id}" must not include fake @vN suffixes`);
  }
}

function readArtifactDefinitionData(def: unknown): {
  name: unknown;
  id: unknown;
  schema: unknown;
  refine: unknown;
} {
  if (def === null || typeof def !== "object") {
    throw new TypeError("artifact definition must be an object");
  }

  const read = (key: "name" | "id" | "schema"): unknown => {
    const descriptor = Object.getOwnPropertyDescriptor(def, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new TypeError(`artifact definition ${key} must be an own enumerable data property`);
    }
    return descriptor.value;
  };

  return {
    name: read("name"),
    id: read("id"),
    schema: read("schema"),
    refine: readOptionalArtifactRefinement(def),
  };
}

function readOptionalArtifactRefinement(def: object): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(def, "refine");
  if (!descriptor) return undefined;
  if (!descriptor.enumerable || !("value" in descriptor)) {
    throw new TypeError("artifact definition refine must be an own enumerable data property");
  }
  return descriptor.value;
}

function assertArtifactShape(value: unknown): asserts value is Artifact {
  if (value === null || typeof value !== "object" || !Object.isFrozen(value)) {
    throw new Error("artifact must be a frozen object");
  }

  const ownKeys = Reflect.ownKeys(value);
  if (
    ownKeys.length !== 4 ||
    !ownKeys.includes("name") ||
    !ownKeys.includes("id") ||
    !ownKeys.includes("schema") ||
    !ownKeys.includes("validate")
  ) {
    throw new Error("artifact must own exactly name, id, schema, and validate");
  }

  const name = Object.getOwnPropertyDescriptor(value, "name");
  const id = Object.getOwnPropertyDescriptor(value, "id");
  const schema = Object.getOwnPropertyDescriptor(value, "schema");
  const validate = Object.getOwnPropertyDescriptor(value, "validate");
  if (
    !name?.enumerable ||
    !("value" in name) ||
    typeof name.value !== "string" ||
    !id?.enumerable ||
    !("value" in id) ||
    typeof id.value !== "string" ||
    !schema?.enumerable ||
    !("value" in schema) ||
    schema.value === null ||
    typeof schema.value !== "object" ||
    !Object.isFrozen(schema.value) ||
    !validate?.enumerable ||
    !("value" in validate) ||
    typeof validate.value !== "function" ||
    !Object.isFrozen(validate.value)
  ) {
    throw new Error(
      "artifact name, id, schema, and validate must be own enumerable data properties"
    );
  }

  assertValidArtifactName(name.value);
  assertValidArtifactId(id.value);
}

/** Asserts the complete frozen runtime shape and semantic identity of an artifact. */
export function assertArtifact(value: unknown): asserts value is Artifact {
  assertArtifactShape(value);
}

/** Reports whether a value has the complete frozen artifact shape. */
export function isArtifact(value: unknown): value is Artifact {
  try {
    assertArtifactShape(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates the canonical authority used to declare, validate, and publish one artifact.
 *
 * The factory snapshots identity through owned data properties, applies Core schema conventions,
 * freezes the schema graph, and binds structural and typed-array admission ahead of the optional
 * semantic refinement. Step contracts and artifact runtimes can therefore share one immutable
 * definition without rebuilding its validation path.
 *
 * @param def - Artifact identity, TypeBox schema, and optional synchronous semantic refinement.
 * @returns The frozen artifact authority consumed by catalogs, steps, and write-once runtimes.
 */
export function defineArtifact<
  const Name extends string,
  const Id extends string,
  const Schema extends TSchema,
>(def: {
  name: Name;
  id: Id;
  schema: Schema;
  refine?: ArtifactRefinement<Schema>;
}): Artifact<Name, Id, Schema> {
  const admitted = readArtifactDefinitionData(def);
  assertValidArtifactName(admitted.name);
  assertValidArtifactId(admitted.id);
  if (admitted.schema === null || typeof admitted.schema !== "object") {
    throw new TypeError("artifact schema must be an object");
  }
  if (admitted.refine !== undefined && typeof admitted.refine !== "function") {
    throw new TypeError("artifact refine must be a function when provided");
  }

  const name = admitted.name as Name;
  const id = admitted.id as Id;
  const schema = admitted.schema as Schema;
  applySchemaConventions(schema);
  freezeSchemaGraph(schema);
  const validate = createArtifactValidatorInternal(
    schema,
    admitted.refine as ArtifactRefinement<Schema> | undefined
  );
  const artifact = Object.freeze({ name, id, schema, validate });
  assertArtifactShape(artifact);
  return artifact;
}
