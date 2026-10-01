import type { DeclarationEmission } from "./declaration-emit.js";
import { compareUtf8 } from "./source-maps.js";

/** Exact official support modules admitted to the authored map-script surface. */
export const CIV7_MAP_SCRIPT_MODULE_ROOT_IDS = [
  "/base-standard/maps/map-globals.js",
  "/base-standard/maps/assign-advanced-start-region.js",
  "/base-standard/maps/assign-starting-plots.js",
  "/base-standard/maps/discovery-generator.js",
  "/base-standard/maps/elevation-terrain-generator.js",
  "/base-standard/maps/feature-biome-generator.js",
  "/base-standard/maps/map-utilities.js",
  "/base-standard/maps/resource-generator.js",
  "/base-standard/maps/snow-generator.js",
  "/base-standard/scripts/voronoi-utils.js",
] as const;

export const CIV7_MAP_SCRIPT_MODULE_RESOLUTION_FILE = "map-resolution.json" as const;

interface MapScriptResolutionModule {
  readonly virtualId: string;
  readonly declarationPath: `./generated/modules/${string}`;
}

export interface MapScriptModuleResolution {
  readonly rootIds: readonly string[];
  readonly modules: readonly MapScriptResolutionModule[];
  readonly config: {
    readonly compilerOptions: {
      readonly paths: Readonly<Record<string, readonly [string]>>;
    };
  };
}

/** Serializes the exact generated TypeScript resolution face. */
export function renderMapScriptModuleResolution(resolution: MapScriptModuleResolution): string {
  return `${JSON.stringify(resolution.config, null, 2)}\n`;
}

/**
 * Closes the explicit MapGen roots over declaration edges and points TypeScript directly at the
 * generated evidence shards. Unsafe closure facts are refused rather than hidden behind shims.
 */
export function projectMapScriptModuleResolution(
  declarations: Pick<DeclarationEmission, "shards">
): MapScriptModuleResolution {
  const shardByVirtualId = new Map(
    declarations.shards.map((shard) => [shard.virtualId, shard] as const)
  );
  if (shardByVirtualId.size !== declarations.shards.length) {
    throw new Error("Map-script module resolution received duplicate declaration virtual ids");
  }

  const selected = new Set<string>();
  const pending: string[] = [...CIV7_MAP_SCRIPT_MODULE_ROOT_IDS];
  while (pending.length > 0) {
    const virtualId = pending.shift();
    if (virtualId === undefined || selected.has(virtualId)) continue;
    const shard = shardByVirtualId.get(virtualId);
    if (shard === undefined) {
      throw new Error(`Map-script module resolution root or dependency has no shard: ${virtualId}`);
    }
    if (shard.globalAugmentationCount !== 0) {
      throw new Error(
        `Map-script module resolution refuses global augmentation in ${virtualId}: ${shard.globalAugmentationCount}`
      );
    }

    selected.add(virtualId);
    for (const edge of shard.edges) {
      if (edge.fromVirtualId !== virtualId) {
        throw new Error(
          `Map-script declaration edge has the wrong source: ${virtualId} contains ${edge.fromVirtualId}`
        );
      }
      if (edge.status === "external") continue;
      if (edge.status !== "declaration" || edge.targetVirtualId === undefined) {
        throw new Error(
          `Map-script module resolution refuses ${edge.status} edge: ${virtualId} -> ${edge.rewrittenSpecifier}`
        );
      }
      pending.push(edge.targetVirtualId);
    }
  }

  const modules = [...selected].sort(compareUtf8).map((virtualId) => {
    const shard = shardByVirtualId.get(virtualId);
    if (shard === undefined) {
      throw new Error(`Map-script module resolution lost selected shard: ${virtualId}`);
    }
    return {
      virtualId,
      declarationPath: `./generated/modules/${shard.outputFileName}` as const,
    };
  });
  const paths: Record<string, readonly [string]> = {};
  for (const module of modules) paths[module.virtualId] = [module.declarationPath];

  return {
    rootIds: CIV7_MAP_SCRIPT_MODULE_ROOT_IDS,
    modules,
    config: { compilerOptions: { paths } },
  };
}
