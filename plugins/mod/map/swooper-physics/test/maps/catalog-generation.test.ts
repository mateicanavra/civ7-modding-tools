import { describe, expect, it } from "bun:test";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { generateSwooperStudioCatalogMetadata } from "../../scripts/generate-studio-map-catalog";
import { MAP_CONFIG_CATALOG_IDS } from "../../src/maps/catalog/membership";

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
      ).rejects.toThrow(`${missing}.config.json`);
      expect(await outputPaths(outputRoot)).toEqual([]);
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });
});
