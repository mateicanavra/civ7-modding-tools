import type { ArtifactContract } from "./contract.js";
import type { ArtifactValidationContext, ArtifactValidationIssue } from "./validation.js";

/**
 * One artifact contract paired with its complete structural and semantic admission function.
 * The validator is the sole authority used when publishing, validating observations, or satisfying
 * the artifact.
 */
export type ArtifactModule<C extends ArtifactContract = ArtifactContract> = Readonly<{
  artifact: C;
  validate: (
    value: unknown,
    context?: ArtifactValidationContext
  ) => readonly ArtifactValidationIssue[];
}>;

type ArtifactModules = Readonly<Record<string, ArtifactModule>>;

type ArtifactHandles<Modules extends ArtifactModules> = Readonly<{
  [Key in Extract<keyof Modules, string>]: Modules[Key]["artifact"];
}>;

type CatalogModules<Modules extends ArtifactModules> = Readonly<{
  [Key in Extract<keyof Modules, string>]: ArtifactModule<Modules[Key]["artifact"]>;
}>;

type StringKeyedModules<Modules> = Exclude<keyof Modules, string> extends never ? unknown : never;

const RESERVED_CATALOG_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** A frozen artifact-module catalog and the artifact handles derived from that same authority. */
export type ArtifactCatalog<Modules extends ArtifactModules> = Readonly<{
  modules: CatalogModules<Modules>;
  artifacts: ArtifactHandles<Modules>;
}>;

/**
 * Defines one artifact catalog without duplicating its handles or validators in sibling maps.
 * Catalog keys are consumer-facing lookup names; artifact ids and names remain contract authority.
 * Duplicate ids or names are refused because either would make runtime publication ambiguous.
 */
export function defineArtifactCatalog<const Modules extends ArtifactModules>(
  modules: Modules & StringKeyedModules<Modules>
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

    const module = descriptor.value as ArtifactModule | null | undefined;
    if (module === null || typeof module !== "object") {
      throw new Error(`artifact catalog module key "${key}" must contain an artifact module`);
    }
    const { artifact, validate } = module;
    if (artifact === null || typeof artifact !== "object" || typeof validate !== "function") {
      throw new Error(`artifact catalog module key "${key}" must contain an artifact module`);
    }
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
