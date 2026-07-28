import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadSwooperStudioDeployConfigRegistry } from "../../scripts/generate-map-artifacts";
import { generateSwooperStudioCatalogMetadata } from "../../scripts/generate-studio-map-catalog";
import { MAP_CONFIG_CATALOG_IDS } from "../../src/maps/catalog/membership";

const CATALOG_CONFIG_DIRECTORY = "mods/mod-swooper-maps/src/maps/configs";

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

async function savedConfigFixture(id: string): Promise<unknown> {
  const source = JSON.parse(
    await readFile(
      resolve(import.meta.dirname, "../../src/maps/configs/swooper-earthlike.config.json"),
      "utf8"
    )
  ) as Record<string, unknown>;
  return {
    ...source,
    id,
    name: "Saved Config",
    description: "Saved operation config",
    sortIndex: 9021,
  };
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

  it("keeps deploy-only selected configs outside catalog membership", async () => {
    const fakeRepoRoot = await mkdtemp(resolve(tmpdir(), "swooper-deploy-config-repo-"));
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-empty-catalog-output-"));
    try {
      await fakeRepoWithConfig({
        root: fakeRepoRoot,
        fileName: "saved-config.config.json",
        config: await savedConfigFixture("saved-config"),
      });

      await expect(
        generateSwooperStudioCatalogMetadata({
          catalogConfigIds: [],
          outputRoot,
          repoRoot: fakeRepoRoot,
        })
      ).rejects.toThrow("No canonical map configs found");
      expect(await outputPaths(outputRoot)).toEqual([]);

      const deployConfigs = await loadSwooperStudioDeployConfigRegistry({
        catalogConfigIds: [],
        deployConfigId: "saved-config",
        repoRoot: fakeRepoRoot,
      });

      expect(deployConfigs.map((config) => config.canonicalConfig.id)).toEqual(["saved-config"]);
    } finally {
      await rm(fakeRepoRoot, { recursive: true, force: true });
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("rejects a deploy config whose canonical id does not match the id-derived filename", async () => {
    const fakeRepoRoot = await mkdtemp(resolve(tmpdir(), "swooper-deploy-id-mismatch-repo-"));
    try {
      await fakeRepoWithConfig({
        root: fakeRepoRoot,
        fileName: "other-config.config.json",
        config: await savedConfigFixture("saved-config"),
      });

      await expect(
        loadSwooperStudioDeployConfigRegistry({
          catalogConfigIds: [],
          deployConfigId: "other-config",
          repoRoot: fakeRepoRoot,
        })
      ).rejects.toThrow(
        'Canonical map config id must match file stem "other-config", got "saved-config"'
      );
    } finally {
      await rm(fakeRepoRoot, { recursive: true, force: true });
    }
  });

  it("rejects every explicitly malformed deploy config id", async () => {
    for (const deployConfigId of ["", "not a config id"]) {
      await expect(
        loadSwooperStudioDeployConfigRegistry({
          catalogConfigIds: [],
          deployConfigId,
        })
      ).rejects.toThrow("Invalid Swooper map catalog membership");
    }
  });
});
