import { type ArtifactContract, assertCanonicalArtifactContract } from "./contract.js";
import type { ArtifactValidator } from "./validation.js";
import { assertArtifactValidatorBoundTo } from "./validation.js";

/**
 * One artifact contract paired with its complete structural and semantic admission function.
 * The validator is the sole authority used when publishing, validating observations, or satisfying
 * the artifact.
 */
export type ArtifactModule<C extends ArtifactContract = ArtifactContract> = Readonly<{
  artifact: C;
  validate: ArtifactValidator<C>;
}>;

type ArtifactModules = Readonly<Record<string, ArtifactModule>>;

type ArtifactSourceModule<C extends ArtifactContract = ArtifactContract> = ArtifactModule<C> &
  Readonly<{
    Schema: C["schema"];
  }>;

type ArtifactSourceModules = Readonly<Record<string, ArtifactSourceModule>>;

type SchemaBoundArtifactSourceModules<Modules extends ArtifactSourceModules> = Readonly<{
  [Key in keyof Modules]: ArtifactSourceModule<Modules[Key]["artifact"]>;
}>;

type ExactArtifactSourceModules<Modules extends ArtifactSourceModules> = Readonly<{
  [Key in keyof Modules]: Modules[Key] &
    Record<Exclude<keyof Modules[Key], keyof ArtifactSourceModule>, never>;
}>;

/** Exact artifact-validator pairing for a tuple crossing a type-erased module boundary. */
export type SchemaBoundArtifactModuleList<Modules extends readonly ArtifactModule[]> = Readonly<{
  [Key in keyof Modules]: ArtifactModule<Modules[Key]["artifact"]>;
}>;

type ArtifactHandles<Modules extends ArtifactModules> = Readonly<{
  [Key in Extract<keyof Modules, string>]: Modules[Key]["artifact"];
}>;

type CatalogModules<Modules extends ArtifactModules> = Readonly<{
  [Key in Extract<keyof Modules, string>]: ArtifactModule<Modules[Key]["artifact"]>;
}>;

type StringKeyedModules<Modules> = Exclude<keyof Modules, string> extends never ? unknown : never;

const RESERVED_CATALOG_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const ARTIFACT_SOURCE_EXPORTS = new Set(["Schema", "artifact", "validate"]);

/** A frozen artifact-module catalog and the artifact handles derived from that same authority. */
export type ArtifactCatalog<Modules extends ArtifactModules> = Readonly<{
  modules: CatalogModules<Modules>;
  artifacts: ArtifactHandles<Modules>;
}>;

/**
 * Snapshots the minimal artifact authority from own data properties only.
 * Exact factory provenance and artifact-validator binding are checked before the frozen pair can
 * cross a type-erased runtime boundary; accessors and unrelated namespace exports are not retained.
 */
export function snapshotArtifactModule<const C extends ArtifactContract>(
  value: ArtifactModule<C>,
  location: string
): ArtifactModule<C>;
export function snapshotArtifactModule(value: unknown, location: string): ArtifactModule;
export function snapshotArtifactModule(value: unknown, location: string): ArtifactModule {
  if (value === null || typeof value !== "object") {
    throw new Error(`${location} must contain an artifact module`);
  }

  const artifactDescriptor = Object.getOwnPropertyDescriptor(value, "artifact");
  const validateDescriptor = Object.getOwnPropertyDescriptor(value, "validate");
  if (!artifactDescriptor || !("value" in artifactDescriptor)) {
    throw new Error(`${location} must own an artifact data property`);
  }
  if (!validateDescriptor || !("value" in validateDescriptor)) {
    throw new Error(`${location} must own a validate data property`);
  }

  const artifact: unknown = artifactDescriptor.value;
  assertCanonicalArtifactContract(artifact);
  const validate: unknown = validateDescriptor.value;
  assertArtifactValidatorBoundTo(artifact, validate);
  return Object.freeze({ artifact, validate });
}

function snapshotArtifactSourceModule(value: unknown, location: string): ArtifactModule {
  if (value === null || typeof value !== "object") {
    throw new Error(`${location} must contain an artifact source module`);
  }

  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === "string" && !ARTIFACT_SOURCE_EXPORTS.has(key)) {
      throw new Error(`${location} exposes unsupported runtime export "${key}"`);
    }
  }

  const Schema = readArtifactSourceExport(value, "Schema", location);
  const artifact = readArtifactSourceExport(value, "artifact", location);
  const validate = readArtifactSourceExport(value, "validate", location);
  const module = snapshotArtifactModule({ artifact, validate }, location);
  if (Schema !== module.artifact.schema) {
    throw new Error(`${location} Schema must be the exact schema held by its artifact contract`);
  }
  return module;
}

function readArtifactSourceExport(
  source: object,
  key: "Schema" | "artifact" | "validate",
  location: string
): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(source, key);
  if (!descriptor?.enumerable) {
    throw new Error(`${location} must own an enumerable ${key} export`);
  }
  if ("value" in descriptor) return descriptor.value;
  if (descriptor.configurable || descriptor.set || !descriptor.get) {
    throw new Error(`${location} ${key} export must be readable and immutable`);
  }
  return descriptor.get.call(source);
}

/**
 * Defines one artifact catalog without duplicating its handles or validators in sibling maps.
 * Catalog keys are consumer-facing lookup names; artifact ids and names remain contract authority.
 * Duplicate ids or names are refused because either would make runtime publication ambiguous.
 * Native and bundled ESM namespace getters are evaluated exactly once at this source boundary;
 * the returned catalog retains only frozen data-property modules.
 */
export function defineArtifactCatalog<const Modules extends ArtifactSourceModules>(
  modules: Modules &
    SchemaBoundArtifactSourceModules<Modules> &
    ExactArtifactSourceModules<Modules> &
    StringKeyedModules<Modules>
): ArtifactCatalog<Modules> {
  const prototype = Object.getPrototypeOf(modules);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error("artifact catalog modules must be a plain or null-prototype object");
  }

  const moduleEntries: Array<readonly [string, ArtifactModule]> = [];
  const handleEntries: Array<readonly [string, ArtifactContract]> = [];
  const names = new Set<string>();
  const ids = new Set<string>();

  for (const key of Reflect.ownKeys(modules)) {
    if (typeof key !== "string") {
      throw new Error("artifact catalog module keys must be strings");
    }
    const descriptor = Object.getOwnPropertyDescriptor(modules, key);
    if (!descriptor?.enumerable) {
      throw new Error(`artifact catalog module key "${key}" must be enumerable`);
    }
    if (RESERVED_CATALOG_KEYS.has(key)) {
      throw new Error(`artifact catalog module key "${key}" is reserved`);
    }
    if (!("value" in descriptor)) {
      throw new Error(`artifact catalog module key "${key}" must be a data property`);
    }

    const module = snapshotArtifactSourceModule(
      descriptor.value,
      `artifact catalog module key "${key}"`
    );
    const artifact = module.artifact;
    const validate = module.validate;
    if (names.has(artifact.name)) {
      throw new Error(`duplicate artifact name "${artifact.name}" in artifact catalog`);
    }
    if (ids.has(artifact.id)) {
      throw new Error(`duplicate artifact id "${artifact.id}" in artifact catalog`);
    }
    names.add(artifact.name);
    ids.add(artifact.id);
    moduleEntries.push([key, Object.freeze({ artifact, validate })]);
    handleEntries.push([key, artifact]);
  }

  return Object.freeze({
    modules: Object.freeze(Object.fromEntries(moduleEntries)) as CatalogModules<Modules>,
    artifacts: Object.freeze(Object.fromEntries(handleEntries)) as ArtifactHandles<Modules>,
  });
}
