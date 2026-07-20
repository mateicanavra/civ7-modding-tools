import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { loadSwooperStudioDeployConfigRegistry } from "../../scripts/generate-map-artifacts";
import {
  buildSwooperStudioCatalogMetadataPlan,
  generateSwooperStudioCatalogMetadata,
} from "../../scripts/generate-studio-map-catalog";
import { CatalogSourceIndex } from "../../src/maps/catalog/sourceIndex";
import { CATALOG_CONFIG_PATH_PREFIX } from "../../src/maps/catalog/sources";

function indexedSource(index: number): string {
  return CatalogSourceIndex[index] as string;
}

async function outputPaths(root: string): Promise<string[]> {
  try {
    const dir = resolve(root, "dist/recipes");
    return (await readdir(dir)).sort();
  } catch {
    return [];
  }
}

async function fakeRepoWithConfig(args: {
  root: string;
  fileName: string;
  config: unknown;
}): Promise<string> {
  const configDir = resolve(args.root, CATALOG_CONFIG_PATH_PREFIX);
  await mkdir(configDir, { recursive: true });
  await writeFile(resolve(configDir, args.fileName), JSON.stringify(args.config, null, 2));
  return `${CATALOG_CONFIG_PATH_PREFIX}${args.fileName}`;
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

describe("Swooper catalog generation index cutover", () => {
  it("emits Studio catalog metadata from the supplied index order only", async () => {
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-cutover-"));
    try {
      const selected = [indexedSource(1), indexedSource(0)];
      const plan = await buildSwooperStudioCatalogMetadataPlan({ catalogSourceIndex: selected });

      const result = await generateSwooperStudioCatalogMetadata({
        catalogSourceIndex: selected,
        outputRoot,
      });

      expect(result).toEqual({ configCount: 2, fileCount: 3 });
      expect(await outputPaths(outputRoot)).toEqual([
        "standard-map-config.schema.json",
        "standard-map-configs.d.ts",
        "standard-map-configs.js",
      ]);

      expect(plan.metadata.configProjections.map((entry) => entry.canonicalConfig.id)).toEqual([
        "swooper-earthlike",
        "swooper-desert-mountains",
      ]);
      expect(
        plan.metadata.configProjections.map((entry) =>
          entry.sourceKind === "catalog" ? entry.sourcePath : undefined
        )
      ).toEqual([selected[0], selected[1]]);
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("fails before emitting metadata when an indexed source is missing", async () => {
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-missing-"));
    try {
      const missing = `${CATALOG_CONFIG_PATH_PREFIX}missing-indexed-source.config.json`;

      await expect(
        generateSwooperStudioCatalogMetadata({ catalogSourceIndex: [missing], outputRoot })
      ).rejects.toThrow("does not resolve in the repository");
      expect(await outputPaths(outputRoot)).toEqual([]);
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("fails before emitting metadata when an indexed source is invalid", async () => {
    const fakeRepoRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-invalid-repo-"));
    const outputRoot = await mkdtemp(resolve(tmpdir(), "swooper-catalog-index-invalid-output-"));
    try {
      const configPath = await fakeRepoWithConfig({
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
      const invalid = configPath;

      await expect(
        generateSwooperStudioCatalogMetadata({
          catalogSourceIndex: [invalid],
          outputRoot,
          repoRoot: fakeRepoRoot,
        })
      ).rejects.toThrow("Invalid Swooper catalog source index config references");
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
      const configPath = await fakeRepoWithConfig({
        root: fakeRepoRoot,
        fileName: "saved-config.config.json",
        config: await savedConfigFixture("saved-config"),
      });

      await expect(
        generateSwooperStudioCatalogMetadata({
          catalogSourceIndex: [],
          outputRoot,
          repoRoot: fakeRepoRoot,
        })
      ).rejects.toThrow("No canonical map configs found");
      expect(await outputPaths(outputRoot)).toEqual([]);

      const deployConfigs = await loadSwooperStudioDeployConfigRegistry({
        catalogSourceIndex: [],
        deployConfig: { id: "saved-config", path: configPath },
        repoRoot: fakeRepoRoot,
      });

      expect(deployConfigs.map((config) => config.canonicalConfig.id)).toEqual(["saved-config"]);
    } finally {
      await rm(fakeRepoRoot, { recursive: true, force: true });
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("rejects a deploy config id that does not match the selected config file", async () => {
    const fakeRepoRoot = await mkdtemp(resolve(tmpdir(), "swooper-deploy-id-mismatch-repo-"));
    try {
      const configPath = await fakeRepoWithConfig({
        root: fakeRepoRoot,
        fileName: "saved-config.config.json",
        config: await savedConfigFixture("saved-config"),
      });

      await expect(
        loadSwooperStudioDeployConfigRegistry({
          catalogSourceIndex: [],
          deployConfig: { id: "other-config", path: configPath },
          repoRoot: fakeRepoRoot,
        })
      ).rejects.toThrow(
        'Studio deploy config id "other-config" must match loaded config id "saved-config"'
      );
    } finally {
      await rm(fakeRepoRoot, { recursive: true, force: true });
    }
  });
});
