/// <reference types="@civ7/types" />

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createMockAdapter } from "@civ7/adapter";
import { findCiv7StandardMapSizePreset } from "@civ7/map-policy";
import {
  createLabelRng,
  createMapContext,
  type TraceEvent,
  type TraceSink,
} from "@swooper/mapgen-core";
import { createDiagnosticDumpAdapters } from "@swooper/mapgen-diagnostics";

import { admitStandardMapConfig } from "../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import {
  createStandardInitialSetupInput,
  createUnavailableStandardInitialOptionEvidence,
} from "../../src/recipes/standard/initial-setup.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { isJsonDataObject, mergeDiagnosticConfig, parseDiagnosticArgs } from "./command-input.js";

const DEFAULT_MAP_SIZE_ID = "MAPSIZE_STANDARD";

function parseRequiredSeed(
  value: string | true | undefined,
  flag: "--map-seed" | "--game-seed"
): number {
  if (value === undefined || value === true || !/^-?\d+$/.test(value)) {
    throw new Error(`${flag} requires an integer value.`);
  }
  const seed = Number(value);
  if (!Number.isSafeInteger(seed)) throw new Error(`${flag} must be a safe integer.`);
  return seed;
}

function parseRequiredPlayerIds(value: string | true | undefined): readonly number[] {
  if (value === undefined || value === true || value.trim().length === 0) {
    throw new Error("--players requires an ordered comma-separated list of Civ7 player ids.");
  }
  return Object.freeze(
    value.split(",").map((part) => {
      const token = part.trim();
      if (!/^(?:0|[1-9]\d*)$/.test(token)) {
        throw new Error("--players requires nonnegative base-10 integer ids.");
      }
      return Number(token);
    })
  );
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
 *   bun ./scripts/diagnostics/run-standard-dump.ts -- --map-size MAPSIZE_STANDARD --map-seed 1337 --game-seed -1337 --players 0,1,2,3,4,5,6,7 --label probe --override '{...}'
 *
 * Output:
 *   {"runId":"...","outputDir":"..."}
 */
async function main(): Promise<void> {
  const { positionals, flags } = parseDiagnosticArgs(process.argv.slice(2));
  if (positionals.length > 0) {
    throw new Error(
      "Diagnostic dumps accept named map size, seed, and player-id arguments; positional inputs retire."
    );
  }
  const preset = parseMapSize(flags["map-size"]);
  const mapSeed = parseRequiredSeed(flags["map-seed"], "--map-seed");
  const gameSeed = parseRequiredSeed(flags["game-seed"], "--game-seed");
  const aliveMajorPlayerIds = parseRequiredPlayerIds(flags.players);
  const { width, height } = preset.dimensions;
  const envelope = admitStandardMapConfig(loadConfig(flags));

  const label = parseLabel(flags.label);
  const outputRoot = join(process.cwd(), "dist", "visualization", label);
  const vizOutputs = createDiagnosticDumpAdapters({ outputRoot });

  const mapInfo = preset.mapInfo;

  const setupInput = createStandardInitialSetupInput({
    mapSeed,
    gameSeed,
    latitudeBounds: envelope.latitudeBounds,
    selection: Object.freeze({
      kind: "civ7-preset" as const,
      id: preset.id,
      dimensions: preset.dimensions,
      mapInfo: preset.mapInfo,
      startSlotCapacity: Object.freeze({
        west: preset.mapInfo.PlayersLandmass1,
        east: preset.mapInfo.PlayersLandmass2,
        total: preset.mapInfo.PlayersLandmass1 + preset.mapInfo.PlayersLandmass2,
      }),
    }),
    aliveMajorPlayerIds,
    options: createUnavailableStandardInitialOptionEvidence(
      "configuration-api-unavailable",
      aliveMajorPlayerIds
    ),
  });

  const baseConfig = envelope.config;
  const override = loadOverride(flags);
  const mergedConfig =
    override && isJsonDataObject(baseConfig) && isJsonDataObject(override)
      ? mergeDiagnosticConfig(baseConfig, override)
      : baseConfig;
  const config = admitStandardMapConfig({ ...envelope, config: mergedConfig }).config;

  const plan = standardRecipe.compile(setupInput, config);
  const verboseSteps = Object.fromEntries(
    plan.nodes.map((node) => [node.stepId, "verbose"] as const)
  );
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: preset.id,
    aliveMajorPlayerIds,
    rng: createLabelRng(mapSeed),
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
