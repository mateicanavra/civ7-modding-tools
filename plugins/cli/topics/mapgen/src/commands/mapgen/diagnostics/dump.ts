import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createMockAdapter } from "@civ7/adapter";
import { findProjectRoot } from "@civ7/config";
import { type Civ7StandardMapSizePreset, findCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { CIV7_SIGNED_INT_SEED_MAX, CIV7_SIGNED_INT_SEED_MIN } from "@civ7/map-policy/setup";
import { Command, Flags } from "@oclif/core";
import {
  createLabelRng,
  createMapContext,
  type TraceEvent,
  type TraceSink,
} from "@swooper/mapgen-core";
import { createDiagnosticDumpAdapters } from "@swooper/mapgen-diagnostics";
import { standardMapConfigs } from "@swooper/swooper-physics/catalog";
import standardRecipe, {
  createStandardInitialSetupInput,
  createUnavailableStandardInitialOptionEvidence,
} from "@swooper/swooper-physics/standard";
import { admitStandardMapConfig } from "@swooper/swooper-physics/standard/map-config";

const DEFAULT_CONFIG_ID = "swooper-earthlike";
const DEFAULT_MAP_SIZE_ID = "MAPSIZE_STANDARD";
const DEFAULT_OUTPUT_ROOT = join(
  "plugins",
  "mod",
  "map",
  "swooper-physics",
  "dist",
  "visualization"
);

type JsonDataObject = Record<string, unknown>;

export default class MapgenDiagnosticsDump extends Command {
  static summary = "Run the complete Swooper Standard recipe and write diagnostic evidence";

  static examples = [
    "<%= config.bin %> mapgen diagnostics dump --map-seed 1337 --game-seed=7331 --players 0,1,2,3",
    "<%= config.bin %> mapgen diagnostics dump --map-size MAPSIZE_TINY --map-seed 1337 --game-seed=-1337 --players 0,1 --label probe --override '{\"foundation-lithosphere\":{}}'",
  ];

  static flags = {
    "map-size": Flags.string({
      default: DEFAULT_MAP_SIZE_ID,
      description: "Official Civ7 map-size id",
      options: [
        "MAPSIZE_TINY",
        "MAPSIZE_SMALL",
        "MAPSIZE_STANDARD",
        "MAPSIZE_LARGE",
        "MAPSIZE_HUGE",
      ],
    }),
    "map-seed": Flags.integer({
      description: "Signed 32-bit map-generation seed",
      max: CIV7_SIGNED_INT_SEED_MAX,
      min: CIV7_SIGNED_INT_SEED_MIN,
      required: true,
    }),
    "game-seed": Flags.integer({
      description: "Signed 32-bit gameplay seed",
      max: CIV7_SIGNED_INT_SEED_MAX,
      min: CIV7_SIGNED_INT_SEED_MIN,
      required: true,
    }),
    players: Flags.string({
      description: "Ordered comma-separated alive-major Civ7 player ids",
      required: true,
    }),
    label: Flags.string({ description: "Human-readable diagnostic run group" }),
    override: Flags.string({ description: "JSON object merged into the admitted recipe config" }),
    "config-file": Flags.file({
      description: "Canonical Standard map-config envelope; defaults to swooper-earthlike",
      exists: true,
    }),
    "output-root": Flags.string({
      description: "Parent directory for the generated run evidence",
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MapgenDiagnosticsDump);
    const preset = requireMapSize(flags["map-size"]);
    const aliveMajorPlayerIds = parsePlayerIds(flags.players);
    const inputConfig = loadConfig(flags["config-file"]);
    const override = flags.override === undefined ? null : parseJsonObject(flags.override);
    const envelope = admitStandardMapConfig(inputConfig);
    const config =
      override === null
        ? envelope.config
        : admitStandardMapConfig({
            ...envelope,
            config: mergeJsonObjects(envelope.config, override),
          }).config;
    const plan = standardRecipe.compile(
      createStandardInitialSetupInput({
        mapSeed: flags["map-seed"],
        gameSeed: flags["game-seed"],
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
      }),
      config
    );
    const adapter = createMockAdapter({
      width: preset.dimensions.width,
      height: preset.dimensions.height,
      mapInfo: preset.mapInfo,
      mapSizeId: preset.id,
      aliveMajorPlayerIds,
      rng: createLabelRng(flags["map-seed"]),
    });
    const context = createMapContext({ setup: plan.setup, adapter });
    const outputBase =
      flags["output-root"] === undefined
        ? join(findProjectRoot(process.cwd()), DEFAULT_OUTPUT_ROOT)
        : resolve(process.cwd(), flags["output-root"]);
    const outputRoot = join(outputBase, parseLabel(flags.label));
    const outputs = createDiagnosticDumpAdapters({ outputRoot });
    const verboseSteps = Object.fromEntries(
      plan.nodes.map((node) => [node.stepId, "verbose"] as const)
    );
    let runId: string | undefined;
    const traceSink: TraceSink = {
      emit: (event: TraceEvent): undefined => {
        if (event.kind === "run.start") runId = event.runId;
        outputs.traceSink.emit(event);
        return undefined;
      },
    };

    standardRecipe.execute(context, plan, {
      trace: { config: { steps: verboseSteps }, sink: traceSink },
      facets: outputs.facetSinks,
      log: () => {},
    });

    if (!runId) this.error("Standard dump execution emitted no run.start evidence.");
    this.log(JSON.stringify({ runId, outputDir: join(outputRoot, runId) }));
  }
}

function loadConfig(configFile: string | undefined): unknown {
  if (configFile !== undefined) return JSON.parse(readFileSync(configFile, "utf8")) as unknown;
  const config = standardMapConfigs.find((candidate) => candidate.id === DEFAULT_CONFIG_ID);
  if (!config) throw new Error(`Standard map config "${DEFAULT_CONFIG_ID}" is unavailable.`);
  return config;
}

function mergeJsonObjects(base: unknown, override: unknown): unknown {
  if (!isJsonObject(base) || !isJsonObject(override)) return override;
  const merged: JsonDataObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = mergeJsonObjects(merged[key], value);
  }
  return merged;
}

function isJsonObject(value: unknown): value is JsonDataObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseJsonObject(raw: string): JsonDataObject {
  const value = JSON.parse(raw) as unknown;
  if (!isJsonObject(value)) throw new Error("--override must contain a JSON object.");
  return value;
}

function parseLabel(value: string | undefined): string {
  const label = value?.trim();
  if (label) return label;
  return `diag-${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}`;
}

function parsePlayerIds(value: string): readonly number[] {
  if (value.trim().length === 0) {
    throw new Error("--players requires an ordered comma-separated list of Civ7 player ids.");
  }
  const ids = value.split(",").map((part) => {
    const token = part.trim();
    if (!/^(?:0|[1-9]\d*)$/.test(token)) {
      throw new Error("--players requires nonnegative base-10 integer ids.");
    }
    return Number(token);
  });
  if (new Set(ids).size !== ids.length) throw new Error("--players requires unique player ids.");
  return Object.freeze(ids);
}

function requireMapSize(id: string): Civ7StandardMapSizePreset {
  const preset = findCiv7StandardMapSizePreset(id);
  if (!preset) throw new Error(`Unknown Civ7 standard map size "${id}".`);
  return preset;
}
