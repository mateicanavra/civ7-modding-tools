import type { Static, TSchema } from "typebox";

import { applySchemaConventions } from "../schema.js";
import { isCanonicalArtifact, registerCanonicalArtifact } from "./authority.js";

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

export type ArtifactContract<
  Name extends string = string,
  Id extends string = string,
  Schema extends TSchema = TSchema,
> = Readonly<{
  name: Name;
  id: Id;
  schema: Schema;
}>;

export type ArtifactValueOf<C extends ArtifactContract<any, any, any>> = Static<C["schema"]>;

export type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

export type ArtifactReadValueOf<C extends ArtifactContract<any, any, any>> = DeepReadonly<
  ArtifactValueOf<C>
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
  };
}

function assertArtifactContractShape(value: unknown): asserts value is ArtifactContract {
  if (value === null || typeof value !== "object" || !Object.isFrozen(value)) {
    throw new Error("artifact contract must be a frozen object");
  }

  const ownKeys = Reflect.ownKeys(value);
  if (
    ownKeys.length !== 3 ||
    !ownKeys.includes("name") ||
    !ownKeys.includes("id") ||
    !ownKeys.includes("schema")
  ) {
    throw new Error("artifact contract must own exactly name, id, and schema");
  }

  const name = Object.getOwnPropertyDescriptor(value, "name");
  const id = Object.getOwnPropertyDescriptor(value, "id");
  const schema = Object.getOwnPropertyDescriptor(value, "schema");
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
    typeof schema.value !== "object"
  ) {
    throw new Error(
      "artifact contract name, id, and schema must be own enumerable data properties"
    );
  }

  assertValidArtifactName(name.value);
  assertValidArtifactId(id.value);
}

/**
 * Asserts the canonical runtime shape, factory provenance, and semantic identity of an artifact.
 * Admission inspects only own data descriptors, so hostile accessors cannot execute while a
 * consumer decides whether to retain the identity.
 */
export function assertCanonicalArtifactContract(value: unknown): asserts value is ArtifactContract {
  assertArtifactContractShape(value);
  if (!isCanonicalArtifact(value)) {
    throw new Error("artifact contract must be created by defineArtifact");
  }
}

export function defineArtifact<
  const Name extends string,
  const Id extends string,
  const Schema extends TSchema,
>(def: { name: Name; id: Id; schema: Schema }): ArtifactContract<Name, Id, Schema> {
  const admitted = readArtifactDefinitionData(def);
  assertValidArtifactName(admitted.name);
  assertValidArtifactId(admitted.id);
  if (admitted.schema === null || typeof admitted.schema !== "object") {
    throw new TypeError("artifact schema must be an object");
  }

  const name = admitted.name as Name;
  const id = admitted.id as Id;
  const schema = admitted.schema as Schema;
  applySchemaConventions(schema, `artifact:${id}`);
  freezeSchemaGraph(schema);
  const artifact = Object.freeze({ name, id, schema });
  assertArtifactContractShape(artifact);
  registerCanonicalArtifact(artifact);
  return artifact;
}
