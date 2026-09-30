import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { MapConfigId } from "@civ7/studio-contract";
import { admitMapConfigCatalogIds } from "../src/maps/catalog/membership.js";
import type { ValidatedMapConfig } from "../src/maps/configs/canonical.js";
import { projectSwooperMapConfigCatalog, serializeSwooperMapConfig } from "../authoring/index.js";

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
    async loadCatalog(catalogConfigIds: unknown): Promise<readonly ValidatedMapConfig[]> {
      const configIds = admitMapConfigCatalogIds(catalogConfigIds);
      const configsById = new Map<MapConfigId, unknown>();
      const readErrors: string[] = [];

      for (const configId of configIds) {
        const sourcePath = resolve(sourceDirectory, `${configId}.config.json`);
        try {
          const raw = JSON.parse(await readFile(sourcePath, "utf-8")) as unknown;
          configsById.set(configId, raw);
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

      return projectSwooperMapConfigCatalog({
        catalogConfigIds: configIds,
        configsById,
      });
    },

    async prepareWrite(value: unknown): Promise<PreparedSwooperMapConfigSourceWrite> {
      const serialized = serializeSwooperMapConfig(value);
      const target = resolve(sourceDirectory, `${serialized.configId}.config.json`);
      const previous = await readFile(target, "utf8").catch((error: unknown) => {
        if (isNodeNotFound(error)) return null;
        throw error;
      });

      return Object.freeze({
        configId: serialized.configId,
        write: async () => {
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, serialized.content);
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
