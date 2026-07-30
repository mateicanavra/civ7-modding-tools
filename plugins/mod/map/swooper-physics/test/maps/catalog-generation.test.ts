import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { generateSwooperStudioCatalogMetadata } from "../../scripts/generate-studio-map-catalog";
import { MAP_CONFIG_CATALOG_IDS } from "../../src/maps/catalog/membership";

const CATALOG_CONFIG_DIRECTORY = "plugins/mod/map/swooper-physics/src/maps/configs";

function catalogConfigId(index: number): string {
  return MAP_CONFIG_CATALOG_IDS[index] as string;
}

async function outputPaths(root: string): Promise<string[]> {
  try {
    const dir = resolve(root, "dist/recipes");
    return (await readdir(dir)).sort();
  } catch {
    return [];
  }
}

async function importCatalogEntries(root: string) {
  const module = (await import(
    pathToFileURL(resolve(root, "dist/recipes/standard-map-configs.js")).href
  )) as Readonly<{
    standardMapConfigs: readonly Readonly<{ id: string }>[];
  }>;
  return module.standardMapConfigs;
}

async function fakeRepoWithConfig(args: {
  root: string;
  fileName: string;
  config: unknown;
}): Promise<string> {
  const configDir = resolve(args.root, CATALOG_CONFIG_DIRECTORY);
  await mkdir(configDir, { recursive: true });
  await writeFile(resolve(configDir, args.fileName), JSON.stringify(args.config, null, 2));
  return args.fileName.replace(/\.config\.json$/, "");
}

describe("Swooper catalog generation identity cutover", () => {
  it("emits Studio catalog metadata from the supplied id order only", async () => {
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-cutover-"));
    try {
      const selected = [catalogConfigId(1), catalogConfigId(0)];

      const result = await generateSwooperStudioCatalogMetadata({
        catalogConfigIds: selected,
        outputRoot,
      });

      expect(result).toEqual({ configCount: 2 });
      expect(await outputPaths(outputRoot)).toEqual([
        "standard-map-config.schema.json",
        "standard-map-configs.d.ts",
        "standard-map-configs.js",
      ]);

      const entries = await importCatalogEntries(outputRoot);
      expect(entries.map((entry) => entry.id)).toEqual(selected);
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("derives the config filename from an id and fails before metadata emits when it is missing", async () => {
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-missing-"));
    try {
      const missing = "missing-indexed-source";

      await expect(
        generateSwooperStudioCatalogMetadata({ catalogConfigIds: [missing], outputRoot })
      ).rejects.toThrow(`${CATALOG_CONFIG_DIRECTORY}/${missing}.config.json`);
      expect(await outputPaths(outputRoot)).toEqual([]);
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("fails before emitting metadata when an indexed source is invalid", async () => {
    const fakeRepoRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-invalid-repo-"));
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-invalid-output-"));
    try {
      const configId = await fakeRepoWithConfig({
        root: fakeRepoRoot,
        fileName: "indexed-invalid.config.json",
        config: {
          id: "indexed-invalid",
          name: "Indexed Invalid",
          description: "Invalid indexed config",
          recipe: "standard",
          sortIndex: 1,
          config: "not-an-object",
        },
      });
      const invalid = configId;

      await expect(
        generateSwooperStudioCatalogMetadata({
          catalogConfigIds: [invalid],
          outputRoot,
          repoRoot: fakeRepoRoot,
        })
      ).rejects.toThrow("Invalid Swooper map catalog config references");
      expect(await outputPaths(outputRoot)).toEqual([]);
    } finally {
      await rm(fakeRepoRoot, { recursive: true, force: true });
      await rm(outputRoot, { recursive: true, force: true });
    }
  });
});
