/// <reference types="@civ7/types" />

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { createMockAdapter } from "@civ7/adapter";
import { type Civ7StandardMapSizePreset, findCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { assessCiv7SignedIntSeed } from "@civ7/map-policy/setup";
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

const DEFAULT_MAP_SIZE_ID = "MAPSIZE_STANDARD";

type JsonDataObject = Record<string, unknown>;

type StandardDumpCommandInput = Readonly<{
  preset: Civ7StandardMapSizePreset;
  mapSeed: number;
  gameSeed: number;
  aliveMajorPlayerIds: readonly number[];
  label: string;
  inputConfig: unknown;
  override: JsonDataObject | null;
}>;

function isJsonDataObject(value: unknown): value is JsonDataObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeDiagnosticConfig(base: unknown, override: unknown): unknown {
  if (!isJsonDataObject(base) || !isJsonDataObject(override)) return override;

  const merged: JsonDataObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = mergeDiagnosticConfig(merged[key], value);
  }
  return merged;
}

function parseJsonDataObject(raw: string, source: string): JsonDataObject {
  const value = JSON.parse(raw) as unknown;
  if (!isJsonDataObject(value)) throw new Error(`${source} must contain a JSON object.`);
  return value;
}

function parseRequiredSeed(value: string | undefined, flag: "--map-seed" | "--game-seed"): number {
  if (value === undefined || !/^-?\d+$/.test(value)) {
    throw new Error(`${flag} requires an integer value.`);
  }
  const result = assessCiv7SignedIntSeed(Number(value));
  if (!result.ok) {
    throw new Error(`${flag} must be an integer from ${result.min} to ${result.max}.`);
  }
  return result.value;
}

function parseRequiredPlayerIds(value: string | undefined): readonly number[] {
  if (value === undefined || value.trim().length === 0) {
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

function parseMapSize(value: string | undefined): Civ7StandardMapSizePreset {
  const mapSizeId = value ?? DEFAULT_MAP_SIZE_ID;
  const preset = findCiv7StandardMapSizePreset(mapSizeId);
  if (!preset) {
    throw new Error(
      `Unknown Civ7 standard map size "${mapSizeId}". Expected MAPSIZE_TINY, MAPSIZE_SMALL, MAPSIZE_STANDARD, MAPSIZE_LARGE, or MAPSIZE_HUGE.`
    );
  }
  return preset;
}

function parseLabel(value: string | undefined): string {
  const raw = value?.trim() ?? "";
  if (raw.length > 0) return raw;
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return `diag-${stamp}-${process.pid}`;
}

function loadConfig(configFile: string | undefined): unknown {
  if (configFile !== undefined) return JSON.parse(readFileSync(configFile, "utf8")) as unknown;
  return swooperEarthlikeConfigRaw as unknown;
}

/**
 * Parses the explicit Standard replay inputs understood by the dump command.
 * Negative seeds use Node's unambiguous `--flag=-123` option form.
 */
export function parseStandardDumpArgs(argv: readonly string[]): StandardDumpCommandInput {
  const { values } = parseArgs({
    args: argv,
    allowPositionals: false,
    options: {
      "map-size": { type: "string" },
      "map-seed": { type: "string" },
      "game-seed": { type: "string" },
      players: { type: "string" },
      label: { type: "string" },
      override: { type: "string" },
      "config-file": { type: "string" },
    },
    strict: true,
  });

  return {
    preset: parseMapSize(values["map-size"]),
    mapSeed: parseRequiredSeed(values["map-seed"], "--map-seed"),
    gameSeed: parseRequiredSeed(values["game-seed"], "--game-seed"),
    aliveMajorPlayerIds: parseRequiredPlayerIds(values.players),
    label: parseLabel(values.label),
    inputConfig: loadConfig(values["config-file"]),
    override:
      values.override === undefined ? null : parseJsonDataObject(values.override, "--override"),
  };
}

/**
 * Data-first dump runner for the full standard pipeline.
 *
 * Usage:
 *   bun ./scripts/diagnostics/run-standard-dump.ts -- --map-size MAPSIZE_STANDARD --map-seed 1337 --game-seed=-1337 --players 0,1,2,3,4,5,6,7 --label probe --override '{...}'
 *
 * Output:
 *   {"runId":"...","outputDir":"..."}
 */
async function main(): Promise<void> {
  const { preset, mapSeed, gameSeed, aliveMajorPlayerIds, label, inputConfig, override } =
    parseStandardDumpArgs(process.argv.slice(2));
  const { width, height } = preset.dimensions;
  const envelope = admitStandardMapConfig(inputConfig);

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
  const mergedConfig = override === null ? baseConfig : mergeDiagnosticConfig(baseConfig, override);
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

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
