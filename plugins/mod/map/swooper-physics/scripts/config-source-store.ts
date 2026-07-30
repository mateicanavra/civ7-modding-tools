import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { MapConfigId } from "@civ7/studio-contract";
import { admitMapConfigCatalogConfig } from "../src/maps/catalog/admission.js";
import { admitMapConfigCatalogIds } from "../src/maps/catalog/membership.js";
import {
  admitStandardMapConfig,
  type ValidatedMapConfig,
} from "../src/maps/configs/canonical.js";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "../src/recipes/standard/artifacts.js";

export type PreparedSwooperMapConfigSourceWrite = Readonly<{
  configId: MapConfigId;
  write(): Promise<void>;
  rollback(): Promise<Readonly<{ restored?: true; deleted?: true }>>;
}>;

function isNodeNotFound(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

/**
 * Creates the definition-owned source store used by production tooling and
 * isolated filesystem tests. Config identities determine filenames only after
 * the complete Standard envelope has been admitted.
 */
export function createSwooperMapConfigSourceStore(sourceDirectory: string) {
  return {
    async loadCatalog(catalogConfigIds: unknown): Promise<ValidatedMapConfig[]> {
      const configIds = admitMapConfigCatalogIds(catalogConfigIds);
      const configsById = new Map<MapConfigId, ValidatedMapConfig>();
      const readErrors: string[] = [];

      for (const configId of configIds) {
        const sourcePath = resolve(sourceDirectory, `${configId}.config.json`);
        try {
          const raw = JSON.parse(await readFile(sourcePath, "utf-8")) as unknown;
          configsById.set(
            configId,
            admitMapConfigCatalogConfig({
              configId,
              canonicalConfig: raw,
              recipeSchema: STANDARD_RECIPE_CONFIG_SCHEMA,
            })
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          readErrors.push(`${sourcePath}: ${message}`);
        }
      }

      if (readErrors.length > 0) {
        throw new Error(
          `Invalid Swooper map catalog config references:\n${readErrors
            .map((error) => `- ${error}`)
            .join("\n")}`
        );
      }

      const configs = configIds.map((configId) => {
        const config = configsById.get(configId);
        if (!config) throw new Error(`Catalog config was not loaded: ${configId}`);
        return config;
      });
      if (configs.length === 0) {
        throw new Error(`No canonical map configs found in ${sourceDirectory}`);
      }
      return configs;
    },

    async prepareWrite(value: unknown): Promise<PreparedSwooperMapConfigSourceWrite> {
      const canonicalConfig = admitStandardMapConfig(value);
      const target = resolve(sourceDirectory, `${canonicalConfig.id}.config.json`);
      const previous = await readFile(target, "utf8").catch((error: unknown) => {
        if (isNodeNotFound(error)) return null;
        throw error;
      });

      return Object.freeze({
        configId: canonicalConfig.id,
        write: async () => {
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, `${JSON.stringify(canonicalConfig, null, 2)}\n`);
        },
        rollback: async () => {
          if (previous === null) {
            await rm(target, { force: true });
            return { deleted: true } as const;
          }
          await writeFile(target, previous);
          return { restored: true } as const;
        },
      });
    },
  } as const;
}
