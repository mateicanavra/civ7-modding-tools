import { type Artifact, assertArtifact } from "./contract.js";

type Artifacts = Readonly<Record<string, Artifact>>;

type StringKeyedArtifacts<Entries> = Exclude<keyof Entries, string> extends never ? unknown : never;

type ArtifactNamesMatchKeys<Entries extends Artifacts> = {
  [Key in keyof Entries]: Entries[Key] extends Artifact<Extract<Key, string>, string>
    ? Entries[Key]
    : never;
};

const RESERVED_CATALOG_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** One frozen consumer-facing map of canonical artifact authorities. */
export type ArtifactCatalog<Entries extends Artifacts> = Readonly<{
  [Key in Extract<keyof Entries, string>]: Entries[Key];
}>;

/**
 * Defines one direct artifact catalog.
 *
 * Each key must equal its artifact's authoring name, giving catalogs and step dependencies one
 * property identity. Duplicate names or ids are refused because either would make publication
 * ambiguous.
 */
export function defineArtifactCatalog<const Entries extends Artifacts>(
  entries: Entries & StringKeyedArtifacts<Entries> & ArtifactNamesMatchKeys<Entries>
): ArtifactCatalog<Entries> {
  const prototype = Object.getPrototypeOf(entries);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error("artifact catalog entries must be a plain or null-prototype object");
  }

  const admitted: Array<readonly [string, Artifact]> = [];
  const ids = new Set<string>();

  for (const key of Reflect.ownKeys(entries)) {
    if (typeof key !== "string") {
      throw new Error("artifact catalog keys must be strings");
    }
    const descriptor = Object.getOwnPropertyDescriptor(entries, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      throw new Error(`artifact catalog key "${key}" must be an enumerable data property`);
    }
    if (RESERVED_CATALOG_KEYS.has(key)) {
      throw new Error(`artifact catalog key "${key}" is reserved`);
    }

    const artifact: unknown = descriptor.value;
    assertArtifact(artifact);
    if (key !== artifact.name) {
      throw new Error(`artifact catalog key "${key}" must match artifact name "${artifact.name}"`);
    }
    if (ids.has(artifact.id)) {
      throw new Error(`duplicate artifact id "${artifact.id}" in artifact catalog`);
    }
    ids.add(artifact.id);
    admitted.push([key, artifact]);
  }

  return Object.freeze(Object.fromEntries(admitted)) as ArtifactCatalog<Entries>;
}
