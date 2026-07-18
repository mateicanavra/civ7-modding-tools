/// <reference types="@civ7/types" />

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, createLabelRng } from "@swooper/mapgen-core";
import { deriveRunId } from "@swooper/mapgen-core/engine";

import { admitStandardMapConfig } from "../../maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../maps/configs/swooper-earthlike.config.json";
import standardRecipe from "../../recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../recipes/standard/runtime.js";
import { createVizDumpAdapters } from "../viz/dump.js";
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
  const vizOutputs = createVizDumpAdapters({ outputRoot });

  // Player/sector geometry defaults reproduce the historical 8-player frame;
  // override to match a live engine Maps row (e.g. HUGE live row is
  // PlayersLandmass1/2 = 6/6, StartSectorRows/Cols = 4/3, with the game's
  // alive-major count possibly below the slot sum — Milestone A evidence).
  const players1 = parseIntOr(typeof flags.players1 === "string" ? flags.players1 : undefined, 4);
  const players2 = parseIntOr(typeof flags.players2 === "string" ? flags.players2 : undefined, 4);
  const sectorRows = parseIntOr(
    typeof flags.sectorRows === "string" ? flags.sectorRows : undefined,
    4
  );
  const sectorCols = parseIntOr(
    typeof flags.sectorCols === "string" ? flags.sectorCols : undefined,
    4
  );
  const aliveMajorCount = parseIntOr(
    typeof flags.alive === "string" ? flags.alive : undefined,
    players1 + players2
  );
  // Live engine init params carry +/-90 on HUGE (probed via getPlotLatitude,
  // Milestone A7); the historical default here stays +/-60 for old labels.
  const minLat = parseIntOr(typeof flags.minLat === "string" ? flags.minLat : undefined, -60);
  const maxLat = parseIntOr(typeof flags.maxLat === "string" ? flags.maxLat : undefined, 60);
  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: minLat,
    MaxLatitude: maxLat,
    PlayersLandmass1: players1,
    PlayersLandmass2: players2,
    StartSectorRows: sectorRows,
    StartSectorCols: sectorCols,
  } as const;

  const envBase = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: mapInfo.MaxLatitude,
      bottomLatitude: mapInfo.MinLatitude,
    },
  } as const;

  const envelope = admitStandardMapConfig(loadConfig(flags));
  const baseConfig = envelope.config;
  const override = loadOverride(flags);
  const mergedConfig =
    override && isPlainObject(baseConfig) && isPlainObject(override)
      ? mergeDeep(baseConfig, override)
      : baseConfig;
  const config = admitStandardMapConfig({ ...envelope, config: mergedConfig }).config;

  const plan = standardRecipe.compile(envBase, config);
  const verboseSteps = Object.fromEntries(
    plan.nodes.map((node) => [node.stepId, "verbose"] as const)
  );
  const env = { ...envBase, trace: { enabled: true, steps: verboseSteps } } as const;

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    aliveMajorCount,
    rng: createLabelRng(seed),
  });

  const context = createExtendedMapContext({ width, height }, adapter, env);
  context.viz = vizOutputs.legacyVizDumper;

  initializeStandardRuntime(context, { mapInfo, logPrefix: "[diag]" });
  standardRecipe.run(context, env, config, {
    traceSink: vizOutputs.traceSink,
    facets: vizOutputs.facetSinks,
    log: () => {},
  });

  const runId = deriveRunId(plan);
  console.log(JSON.stringify({ runId, outputDir: join(outputRoot, runId) }));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
