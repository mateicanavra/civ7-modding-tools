/// <reference types="@civ7/types" />

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_CIV7_MAP_LATITUDE_BOUNDS,
  createMockAdapter,
  getCiv7MapInfoByDimensions,
  getCiv7MapSizeTypeByDimensions,
} from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { deriveRunId } from "@swooper/mapgen-core/engine";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { canonicalRecipeConfig, isPlainObject as isCanonicalMapConfigObject } from "../../maps/configs/canonical.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../recipes/standard/runtime.js";
import swooperEarthlikeConfigRaw from "../../maps/configs/swooper-earthlike.config.json";
import { createTraceDumpSink, createVizDumper } from "../viz/dump.js";
import { isPlainObject, mergeDeep, parseArgs } from "./shared.js";

function parseIntOr(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

function parseLabel(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw.length > 0) return raw;
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return `diag-${stamp}-${process.pid}`;
}

function loadOverride(flags: Record<string, string | true>): unknown {
  const overrideRaw = flags.override;
  const overrideFile = flags.overrideFile;
  if (overrideRaw && overrideRaw !== true) return JSON.parse(String(overrideRaw)) as unknown;
  if (overrideFile && overrideFile !== true) {
    const text = readFileSync(String(overrideFile), "utf8");
    return JSON.parse(text) as unknown;
  }
  return null;
}

function loadConfig(flags: Record<string, string | true>): unknown {
  const configFile = flags.configFile;
  if (configFile && configFile !== true) {
    const text = readFileSync(String(configFile), "utf8");
    return JSON.parse(text) as unknown;
  }
  return swooperEarthlikeConfigRaw as unknown;
}

/**
 * Data-first dump runner for the full standard pipeline.
 *
 * Usage:
 *   bun ./src/dev/diagnostics/run-standard-dump.ts -- 106 66 1337 --label probe --override '{...}'
 *
 * Output:
 *   {"runId":"...","outputDir":"..."}
 */
async function main(): Promise<void> {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const width = parseIntOr(positionals[0], 106);
  const height = parseIntOr(positionals[1], 66);
  const seed = parseIntOr(positionals[2], 1337);

  const label = parseLabel(flags.label);
  const outputRoot = join(process.cwd(), "dist", "visualization", label);
  const traceSink = createTraceDumpSink({ outputRoot });
  const viz = createVizDumper({ outputRoot });

  const civ7MapInfo = getCiv7MapInfoByDimensions(width, height);
  const mapSizeId = getCiv7MapSizeTypeByDimensions(width, height) ?? 1;
  const mapInfo = civ7MapInfo ?? {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };
  const latitudeBounds = civ7MapInfo
    ? DEFAULT_CIV7_MAP_LATITUDE_BOUNDS
    : {
        topLatitude: mapInfo.MaxLatitude ?? 60,
        bottomLatitude: mapInfo.MinLatitude ?? -60,
      };

  const envBase = {
    seed,
    dimensions: { width, height },
    latitudeBounds,
  } as const;

  const loadedConfig = loadConfig(flags);
  const baseConfig =
    isCanonicalMapConfigObject(loadedConfig) && isCanonicalMapConfigObject(loadedConfig.config)
      ? canonicalRecipeConfig(loadedConfig)
      : loadedConfig;
  const override = loadOverride(flags);
  const merged =
    override && isPlainObject(baseConfig) && isPlainObject(override) ? mergeDeep(baseConfig, override) : baseConfig;

  const plan = standardRecipe.compile(envBase, merged);
  const verboseSteps = Object.fromEntries(plan.nodes.map((node: any) => [node.stepId, "verbose"] as const));
  const env = { ...envBase, trace: { enabled: true, steps: verboseSteps } } as const;

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId,
    latitudeBounds,
    rng: createLabelRng(seed),
    terrainTypeIndices: { ...CIV7_BROWSER_TABLES_V0.terrainTypeIndices },
    biomeGlobals: { ...CIV7_BROWSER_TABLES_V0.biomeGlobals },
    featureTypes: { ...CIV7_BROWSER_TABLES_V0.featureTypes },
  });

  const context = createExtendedMapContext({ width, height }, adapter, env);
  context.viz = viz;

  initializeStandardRuntime(context, { mapInfo, logPrefix: "[diag]", storyEnabled: true });
  standardRecipe.run(context, env, merged, { traceSink, log: () => {} });

  const runId = deriveRunId(plan);
  console.log(JSON.stringify({ runId, outputDir: join(outputRoot, runId) }));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
