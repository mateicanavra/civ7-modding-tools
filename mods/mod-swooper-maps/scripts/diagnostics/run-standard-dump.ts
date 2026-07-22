/// <reference types="@civ7/types" />

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createMockAdapter, findCiv7StandardMapSizePreset } from "@civ7/adapter";
import {
  createLabelRng,
  createMapContext,
  type TraceEvent,
  type TraceSink,
} from "@swooper/mapgen-core";
import { createDiagnosticDumpAdapters } from "@swooper/mapgen-diagnostics";

import { admitStandardMapConfig } from "../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { isJsonDataObject, mergeDiagnosticConfig, parseDiagnosticArgs } from "./command-input.js";

const DEFAULT_MAP_SIZE_ID = "MAPSIZE_STANDARD";
const DEFAULT_MAP_SEED = 1337;

function parseMapSeed(value: string | true | undefined): number {
  if (value === undefined) return DEFAULT_MAP_SEED;
  if (value === true || !/^-?\d+$/.test(value)) {
    throw new Error("--seed requires an integer value.");
  }
  const seed = Number(value);
  if (!Number.isSafeInteger(seed)) throw new Error("--seed must be a safe integer.");
  return seed;
}

function parseMapSize(value: string | true | undefined) {
  if (value === true) throw new Error("--map-size requires a Civ7 standard map-size id.");
  const mapSizeId = value ?? DEFAULT_MAP_SIZE_ID;
  const preset = findCiv7StandardMapSizePreset(mapSizeId);
  if (!preset) {
    throw new Error(
      `Unknown Civ7 standard map size "${mapSizeId}". Expected MAPSIZE_TINY, MAPSIZE_SMALL, MAPSIZE_STANDARD, MAPSIZE_LARGE, or MAPSIZE_HUGE.`
    );
  }
  return preset;
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
 *   bun ./scripts/diagnostics/run-standard-dump.ts -- --map-size MAPSIZE_STANDARD --seed 1337 --label probe --override '{...}'
 *
 * Output:
 *   {"runId":"...","outputDir":"..."}
 */
async function main(): Promise<void> {
  const { positionals, flags } = parseDiagnosticArgs(process.argv.slice(2));
  if (positionals.length > 0) {
    throw new Error("Diagnostic dumps accept --map-size and --seed; positional dimensions retire.");
  }
  const preset = parseMapSize(flags["map-size"]);
  const seed = parseMapSeed(flags.seed);
  const { width, height } = preset.dimensions;
  const envelope = admitStandardMapConfig(loadConfig(flags));

  const label = parseLabel(flags.label);
  const outputRoot = join(process.cwd(), "dist", "visualization", label);
  const vizOutputs = createDiagnosticDumpAdapters({ outputRoot });

  const mapInfo = preset.mapInfo;

  const setupBase = {
    mapSeed: seed,
    dimensions: { width, height },
    latitudeBounds: envelope.latitudeBounds,
  } as const;

  const baseConfig = envelope.config;
  const override = loadOverride(flags);
  const mergedConfig =
    override && isJsonDataObject(baseConfig) && isJsonDataObject(override)
      ? mergeDiagnosticConfig(baseConfig, override)
      : baseConfig;
  const config = admitStandardMapConfig({ ...envelope, config: mergedConfig }).config;

  const plan = standardRecipe.compile(setupBase, config);
  const verboseSteps = Object.fromEntries(
    plan.nodes.map((node) => [node.stepId, "verbose"] as const)
  );
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: preset.id,
    aliveMajorCount: preset.defaultPlayers,
    rng: createLabelRng(seed),
  });

  const context = createMapContext({ setup: plan.setup, adapter });
  let runId: string | undefined;
  const traceSink: TraceSink = {
    emit: (event: TraceEvent): undefined => {
      if (event.kind === "run.start") runId = event.runId;
      vizOutputs.traceSink.emit(event);
      return undefined;
    },
  };

  standardRecipe.execute(context, plan, {
    trace: {
      config: { steps: verboseSteps },
      sink: traceSink,
    },
    facets: vizOutputs.facetSinks,
    log: () => {},
  });

  if (!runId) throw new Error("Standard dump execution emitted no run.start evidence.");
  console.log(JSON.stringify({ runId, outputDir: join(outputRoot, runId) }));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
