import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { deriveRecipeConfigSchema } from "@swooper/mapgen-core/authoring";
import { describe, expect, it } from "vitest";
import { CatalogSourceIndex } from "../../src/maps/catalog/sourceIndex";
import {
  type CatalogSourceEntry,
  parseCatalogSourceIndex,
  readCatalogSourceIndex,
  validateCatalogSourceIndex,
} from "../../src/maps/catalog/sources";
import {
  type CanonicalMapConfigEnvelope,
  validateCanonicalMapConfig,
} from "../../src/maps/configs/canonical";
import { STANDARD_STAGES } from "../../src/recipes/standard/recipe";

const pkgRoot = resolve(import.meta.dirname, "../..");
const configsDir = resolve(pkgRoot, "src/maps/configs");
const transientStudioCurrentConfig = "studio-current.config.json";

describe("Swooper catalog source index", () => {
  it("parses the tracked index and keeps every source id/path unique", async () => {
    const { knownConfigPaths, metadataByPath } = await loadCanonicalConfigMetadata();
    const parsed = parseCatalogSourceIndex(CatalogSourceIndex, {
      knownConfigPaths,
      configMetadataByPath: metadataByPath,
    });

    expect(parsed.ok).toBe(true);
    expect(parsed.entries.map((entry) => entry.catalogSourceId)).toEqual(
      [...metadataByPath.values()].map((config) => config.id)
    );
    expect(new Set(parsed.entries.map((entry) => entry.catalogSourceId))).toHaveLength(
      parsed.entries.length
    );
    expect(new Set(parsed.entries.map((entry) => entry.configPath))).toHaveLength(
      parsed.entries.length
    );
  });

  it("matches the current default catalog generation source set", async () => {
    const { knownConfigPaths, metadataByPath } = await loadCanonicalConfigMetadata();
    const expectedPaths = await currentDefaultGenerationConfigPaths();
    const indexPaths = readCatalogSourceIndex({
      knownConfigPaths,
      configMetadataByPath: metadataByPath,
    }).map((entry) => entry.configPath);

    expect(indexPaths).toEqual(expectedPaths);
    expect(indexPaths).not.toContain(
      `mods/mod-swooper-maps/src/maps/configs/${transientStudioCurrentConfig}`
    );
  });

  it("rejects duplicate ids, duplicate paths, missing paths, and digest drift", async () => {
    const first = CatalogSourceIndex[0];
    const duplicateId = { ...CatalogSourceIndex[1], catalogSourceId: first.catalogSourceId };
    const duplicatePath = { ...CatalogSourceIndex[1], configPath: first.configPath };
    const missingPath = {
      ...CatalogSourceIndex[1],
      catalogSourceId: "missing-config",
      configPath: "mods/mod-swooper-maps/src/maps/configs/missing-config.config.json",
      digestInputs: [
        {
          kind: "config-file",
          path: "mods/mod-swooper-maps/src/maps/configs/missing-config.config.json",
        },
      ],
    } satisfies CatalogSourceEntry;
    const digestDrift = {
      ...CatalogSourceIndex[1],
      digestInputs: [{ kind: "config-file", path: first.configPath }],
    } satisfies CatalogSourceEntry;
    const digestShapeDrift = {
      ...CatalogSourceIndex[1],
      digestInputs: [
        { kind: "config-file", path: CatalogSourceIndex[1].configPath },
        { kind: "config-file", path: CatalogSourceIndex[1].configPath },
      ],
    };
    const { knownConfigPaths } = await loadCanonicalConfigMetadata();

    expect(
      validateCatalogSourceIndex(
        [first, duplicateId, duplicatePath, missingPath, digestDrift, digestShapeDrift],
        {
          knownConfigPaths,
        }
      )
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("duplicates CatalogSourceIndex[0]/catalogSourceId"),
        expect.stringContaining("duplicates CatalogSourceIndex[0]/configPath"),
        expect.stringContaining("does not resolve in the repository"),
        expect.stringContaining("digestInputs[0]/path must match configPath"),
        expect.stringContaining("digestInputs must contain exactly one config-file input"),
      ])
    );
  });

  it("rejects unknown entry, digest input, and latitude bounds keys", () => {
    const extraEntryKey = {
      ...CatalogSourceIndex[0],
      stale: true,
    };
    const extraDigestInputKey = {
      ...CatalogSourceIndex[1],
      digestInputs: [{ ...CatalogSourceIndex[1].digestInputs[0], stale: true }],
    };
    const extraLatitudeBoundsKey = {
      ...CatalogSourceIndex[0],
      latitudeBounds: { ...CatalogSourceIndex[0].latitudeBounds, stale: true },
    };

    expect(
      validateCatalogSourceIndex([extraEntryKey, extraDigestInputKey, extraLatitudeBoundsKey])
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/stale is not a catalog source key"),
        expect.stringContaining("/digestInputs[0]/stale is not a catalog source key"),
        expect.stringContaining("/latitudeBounds/stale is not a catalog source key"),
      ])
    );
  });

  it("rejects display metadata that drifts from the referenced canonical config", async () => {
    const { metadataByPath } = await loadCanonicalConfigMetadata();
    const { latitudeBounds: _latitudeBounds, ...firstWithoutLatitudeBounds } =
      CatalogSourceIndex[0];
    const drifted = {
      ...firstWithoutLatitudeBounds,
      name: "Stale Name",
      sortIndex: -1,
    } satisfies CatalogSourceEntry;

    expect(validateCatalogSourceIndex([drifted], { configMetadataByPath: metadataByPath })).toEqual(
      expect.arrayContaining([
        expect.stringContaining('/name must match config name "Swooper Desert Mountains"'),
        expect.stringContaining("/sortIndex must match config sortIndex 500"),
        expect.stringContaining("/latitudeBounds must match config latitudeBounds"),
      ])
    );
  });
});

async function currentDefaultGenerationConfigPaths(): Promise<string[]> {
  const entries = await readdir(configsDir, { withFileTypes: true });
  const configs = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".config.json") &&
          entry.name !== transientStudioCurrentConfig
      )
      .map(async (entry) => {
        const raw = JSON.parse(await readFile(resolve(configsDir, entry.name), "utf8")) as {
          id: string;
          sortIndex: number;
        };
        return {
          path: `mods/mod-swooper-maps/src/maps/configs/${entry.name}`,
          id: raw.id,
          sortIndex: raw.sortIndex,
        };
      })
  );
  configs.sort((a, b) => a.sortIndex - b.sortIndex || a.id.localeCompare(b.id));
  return configs.map((config) => config.path);
}

async function loadCanonicalConfigMetadata(): Promise<{
  knownConfigPaths: ReadonlySet<string>;
  metadataByPath: ReadonlyMap<
    string,
    Readonly<{
      id: string;
      name: string;
      description: string;
      recipe: string;
      sortIndex: number;
      latitudeBounds?: unknown;
    }>
  >;
}> {
  const schema = deriveRecipeConfigSchema(STANDARD_STAGES);
  const paths = await currentDefaultGenerationConfigPaths();
  const metadata = new Map<string, CanonicalMapConfigEnvelope>();
  for (const path of paths) {
    const fileName = path.replace("mods/mod-swooper-maps/src/maps/configs/", "");
    const raw = JSON.parse(
      await readFile(resolve(pkgRoot, `src/maps/configs/${fileName}`), "utf8")
    );
    metadata.set(
      path,
      validateCanonicalMapConfig({
        fileName,
        raw,
        recipeSchema: schema,
        stages: STANDARD_STAGES,
      })
    );
  }
  return {
    knownConfigPaths: new Set(paths),
    metadataByPath: metadata,
  };
}
