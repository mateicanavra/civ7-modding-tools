#!/usr/bin/env bun
//
// output-parity — verify a map's LIVE engine OUTPUT against the headless recipe
// surface for the same config + seed. This is the OUTPUT check that the
// `studio-run-in-game-live` SIGSEGV/[mapgen-complete] gate does NOT do: a map can
// generate cleanly yet produce the wrong geography.
//
// Unlike `final-surface-parity` (which consumes a Studio exactAuthorshipEvidence), this
// mode is Studio-free: it loads the map itself (or reads the currently-loaded game with
// --no-load), recomputes the headless surface from this worktree's config, and diffs
// per-tile with the SAME primitives the official parity uses
// (runLocalFinalSurfaceSnapshot / liveGridToFinalSurfaceSnapshot / diffFinalSurfaceSnapshots).
//
// Single command:
//   nx run mod-swooper-maps:verify -- --mode output-parity \
//     --map-script "{swooper-maps}/maps/swooper-earthlike.js" --map-size MAPSIZE_HUGE \
//     --seed 1337 --game-seed 1337 --player-count 10 --from-running-game exit-to-shell
//
// HEALTHY baseline is ~98-100% per-tile parity, NOT 100%: the engine natively carves
// extra TERRAIN_NAVIGABLE_RIVER (also stripping floodplain features there) and re-runs
// resource placement through Resource_ValidPlacements. The bimodal signal lives in the
// hypsometry buckets (ocean / coast / mountain), which match the headless surface
// near-exactly. Defaults below tolerate the engine-owned divergence and fail on more.
//
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMockAdapter } from "@civ7/adapter";
import {
  type Civ7DirectControlOptions,
  type Civ7SetupOptionValue,
  checkCiv7DirectControlHealth,
  getCiv7FullMapGrid,
  runCiv7SinglePlayerFromSetup,
} from "@civ7/direct-control";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  createFinalSurfaceParityMapInfo,
  diffFinalSurfaceSnapshots,
  liveGridToFinalSurfaceSnapshot,
  runLocalFinalSurfaceSnapshot,
} from "../../src/dev/diagnostics/live-parity.js";
import { canonicalRecipeConfig } from "../../src/maps/configs/canonical.js";

const MAP_SCRIPT_PATTERN = /^\{swooper-maps\}\/maps\/([a-z0-9]+(?:-[a-z0-9]+)*)\.js$/;

type FieldThresholds = { terrain: number; biome: number; feature: number; resource: number };

type Args = {
  host?: string;
  port?: number;
  timeoutMs: number;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
  mapScript?: string;
  config?: string;
  mapSize?: string;
  seed?: number;
  gameSeed?: number;
  playerCount?: number;
  fromRunningGame: "reject" | "exit-to-shell";
  load: boolean;
  options: Record<string, Civ7SetupOptionValue>;
  thresholds: FieldThresholds;
  output?: string;
  help: boolean;
};

const usage = `Usage:
  nx run mod-swooper-maps:verify -- --mode output-parity --map-script <file> --map-size <size> --seed <seed> [flags]

Required (load + compare):
  --map-script "{swooper-maps}/maps/<name>.js"
  --map-size <MAPSIZE_*>   --seed <seed>

Optional:
  --config <basename>            Headless config to recompute (default: map-script basename)
  --game-seed <seed>  --player-count <n>  --option Key=value
  --from-running-game reject|exit-to-shell   (default: exit-to-shell)
  --no-load                      Skip launch; read the CURRENTLY-loaded live game instead
  --max-terrain-pct <n>          Max terrain mismatch % (default 5)
  --max-biome-pct <n>            (default 3)
  --max-feature-pct <n>          (default 4)
  --max-resource-pct <n>         (default 7)
  --host <host>  --port <port>  --timeout-ms <ms>  --wait-timeout-ms <ms>
  --output <path>                Write full JSON report

Compares the live engine surface (terrain/biome/feature/resource) to the headless
recipe output for the same seed, and reports a hypsometry breakdown both sides.`;

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

function parseNumber(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a number: ${value}`);
  return parsed;
}

function parseOptionValue(value: string): Civ7SetupOptionValue {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    timeoutMs: 60_000,
    fromRunningGame: "exit-to-shell",
    load: true,
    options: {},
    thresholds: { terrain: 5, biome: 3, feature: 4, resource: 7 },
    help: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      index += 1;
      return next;
    };
    switch (arg) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--host":
        args.host = value();
        break;
      case "--port":
        args.port = parseInteger(value(), arg);
        break;
      case "--timeout-ms":
        args.timeoutMs = parseInteger(value(), arg);
        break;
      case "--wait-timeout-ms":
        args.waitTimeoutMs = parseInteger(value(), arg);
        break;
      case "--poll-interval-ms":
        args.pollIntervalMs = parseInteger(value(), arg);
        break;
      case "--map-script":
        args.mapScript = value();
        break;
      case "--config":
        args.config = value();
        break;
      case "--map-size":
        args.mapSize = value();
        break;
      case "--seed":
        args.seed = parseInteger(value(), arg);
        break;
      case "--game-seed":
        args.gameSeed = parseInteger(value(), arg);
        break;
      case "--player-count":
        args.playerCount = parseInteger(value(), arg);
        break;
      case "--from-running-game": {
        const mode = value();
        if (mode !== "reject" && mode !== "exit-to-shell")
          throw new Error(`Invalid --from-running-game value: ${mode}`);
        args.fromRunningGame = mode;
        break;
      }
      case "--no-load":
        args.load = false;
        break;
      case "--max-terrain-pct":
        args.thresholds.terrain = parseNumber(value(), arg);
        break;
      case "--max-biome-pct":
        args.thresholds.biome = parseNumber(value(), arg);
        break;
      case "--max-feature-pct":
        args.thresholds.feature = parseNumber(value(), arg);
        break;
      case "--max-resource-pct":
        args.thresholds.resource = parseNumber(value(), arg);
        break;
      case "--option": {
        const raw = value();
        const sep = raw.indexOf("=");
        if (sep <= 0) throw new Error(`Invalid --option value, expected Key=value: ${raw}`);
        args.options[raw.slice(0, sep)] = parseOptionValue(raw.slice(sep + 1));
        break;
      }
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function configBasename(args: Args): string {
  if (args.config) return args.config;
  if (!args.mapScript) throw new Error("--config or --map-script is required");
  const match = MAP_SCRIPT_PATTERN.exec(args.mapScript);
  if (!match)
    throw new Error(`Cannot derive config from map-script: ${args.mapScript} (pass --config)`);
  return match[1]!;
}

function loadConfig(repoRoot: string, basename: string): unknown {
  const path = resolve(
    repoRoot,
    "mods/mod-swooper-maps/src/maps/configs",
    `${basename}.config.json`
  );
  return canonicalRecipeConfig(JSON.parse(readFileSync(path, "utf8")));
}

function probeNumber(value: unknown): number | undefined {
  if (
    value &&
    typeof value === "object" &&
    (value as { ok?: unknown }).ok === true &&
    typeof (value as { value?: unknown }).value === "number"
  ) {
    return (value as { value: number }).value;
  }
  return undefined;
}

function terrainHistogram(values: ReadonlyArray<number | null>, idx: (n: string) => number) {
  const OCEAN = idx("TERRAIN_OCEAN");
  const COAST = idx("TERRAIN_COAST");
  const FLAT = idx("TERRAIN_FLAT");
  const HILL = idx("TERRAIN_HILL");
  const MOUNTAIN = idx("TERRAIN_MOUNTAIN");
  const NAVR = idx("TERRAIN_NAVIGABLE_RIVER");
  const c = {
    ocean: 0,
    coast: 0,
    flat: 0,
    hill: 0,
    mountain: 0,
    navRiver: 0,
    other: 0,
    nullTiles: 0,
  };
  for (const v of values) {
    if (v === null || v === undefined) c.nullTiles += 1;
    else if (v === OCEAN) c.ocean += 1;
    else if (v === COAST) c.coast += 1;
    else if (v === FLAT) c.flat += 1;
    else if (v === HILL) c.hill += 1;
    else if (v === MOUNTAIN) c.mountain += 1;
    else if (v === NAVR) c.navRiver += 1;
    else c.other += 1;
  }
  const total = values.length;
  const water = c.ocean + c.coast;
  const land = c.flat + c.hill + c.mountain + c.navRiver + c.other;
  const r = (n: number, d: number) => (d === 0 ? 0 : +((100 * n) / d).toFixed(2));
  return {
    counts: c,
    total,
    water,
    land,
    waterPct: r(water, total),
    landPct: r(land, total),
    shelfShareOfWater: r(c.coast, water),
    deepShareOfWater: r(c.ocean, water),
    hillPlusMountainShareOfLand: r(c.hill + c.mountain, land),
    mountainShareOfLand: r(c.mountain, land),
  };
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }
  const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
  const options: Civ7DirectControlOptions = {
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  };
  const report: Record<string, unknown> = {
    ok: false,
    startedAt: new Date().toISOString(),
    mapScript: args.mapScript,
    config: configBasename(args),
    loaded: false,
    stages: [],
  };
  const stages = report.stages as unknown[];

  try {
    const health = await checkCiv7DirectControlHealth(options);
    stages.push({ name: "health", ok: health.ok });
    if (!health.ok) {
      report.failureStage = "health";
      report.error = "Civ7 tuner not reachable";
      console.log(JSON.stringify(report, null, 2));
      return 2;
    }

    if (args.load) {
      if (!args.mapScript || !args.mapSize || args.seed === undefined)
        throw new Error("Loading requires --map-script, --map-size, and --seed (or use --no-load)");
      const run = await runCiv7SinglePlayerFromSetup(
        {
          mapScript: args.mapScript,
          mapSize: args.mapSize,
          seed: args.seed,
          gameSeed: args.gameSeed,
          playerCount: args.playerCount,
          options: args.options,
          fromRunningGame: args.fromRunningGame,
          waitForTuner: true,
          waitTimeoutMs: args.waitTimeoutMs,
          pollIntervalMs: args.pollIntervalMs,
        },
        options
      );
      report.loaded = run.verified;
      stages.push({ name: "load", ok: run.verified, startVerified: run.start.verified });
      if (!run.verified) {
        report.failureStage = "load";
        console.log(JSON.stringify(report, null, 2));
        return 2;
      }
    }

    const grid = (await getCiv7FullMapGrid(
      {
        fields: ["terrain", "biome", "feature", "resource", "hydrology"],
        includeHidden: true,
        maxPlotsPerRead: 512,
      },
      options
    )) as {
      map?: { width?: number; height?: number };
      summary?: { map?: { randomSeed?: unknown } };
      plots?: unknown[];
    };
    const width = grid.map?.width ?? 0;
    const height = grid.map?.height ?? 0;
    const liveSeed = probeNumber(grid.summary?.map?.randomSeed);
    const plotsReturned = Array.isArray(grid.plots) ? grid.plots.length : 0;
    if (!width || !height || plotsReturned === 0) {
      report.failureStage = "live-readback";
      report.error = `Empty live grid (width=${width} height=${height} plots=${plotsReturned})`;
      console.log(JSON.stringify(report, null, 2));
      return 2;
    }

    // Recompute headless from THIS worktree's config, at the live seed + dimensions.
    const seedForHeadless = liveSeed ?? args.seed ?? 0;
    const config = loadConfig(repoRoot, configBasename(args));
    const local = runLocalFinalSurfaceSnapshot({ width, height, seed: seedForHeadless, config });
    const live = liveGridToFinalSurfaceSnapshot({ grid, width, height, seed: liveSeed });

    // Terrain name -> engine index via the same MockAdapter table the recipe uses.
    const { mapInfo } = createFinalSurfaceParityMapInfo(width, height);
    const tAdapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: mapInfo.MapSizeType ?? 1,
      rng: createLabelRng(seedForHeadless),
    });
    const idx = (n: string) => tAdapter.getTerrainTypeIndex(n);

    const diffs = diffFinalSurfaceSnapshots(local, live, { maxExamples: 6 }) as Array<{
      field?: string;
      key?: string;
      status?: string;
      compared?: number;
      mismatches?: number;
      examples?: unknown[];
    }>;

    const thresholdByField = args.thresholds as Record<string, number>;
    const parity = diffs.map((d) => {
      const field = (d.field ?? d.key)!;
      const compared = d.compared ?? 0;
      const mismatches = d.mismatches ?? 0;
      const mismatchPct = compared ? +((100 * mismatches) / compared).toFixed(3) : 0;
      const threshold = thresholdByField[field];
      const within = threshold === undefined ? true : mismatchPct <= threshold;
      return {
        field,
        compared,
        mismatches,
        matchPct: compared ? +((100 * (compared - mismatches)) / compared).toFixed(2) : null,
        mismatchPct,
        threshold,
        within,
        examples: (d.examples ?? []).slice(0, 4),
      };
    });

    const fieldsWithinThreshold = parity.every((p) => p.within);
    const seedMatch = liveSeed === undefined || args.seed === undefined || liveSeed === args.seed;

    report.live = {
      width,
      height,
      liveSeed,
      requestedSeed: args.seed,
      seedForHeadless,
      plotsReturned,
      seedMatch,
    };
    report.parity = parity;
    report.hypsometry = {
      headlessExpected: terrainHistogram(local.surfaces.terrain.values, idx),
      live: terrainHistogram(live.surfaces.terrain.values, idx),
    };
    report.ok = fieldsWithinThreshold && seedMatch;
    report.finishedAt = new Date().toISOString();

    if (args.output) {
      const absolute = resolve(args.output);
      mkdirSync(dirname(absolute), { recursive: true });
      writeFileSync(absolute, JSON.stringify(report, null, 2));
    }
    console.log(JSON.stringify(report, null, 2));
    return report.ok ? 0 : 3;
  } catch (error) {
    report.failureStage ??= "exception";
    report.error = error instanceof Error ? (error.stack ?? error.message) : String(error);
    report.finishedAt = new Date().toISOString();
    console.log(JSON.stringify(report, null, 2));
    return 1;
  }
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(JSON.stringify({ ok: false, error: String(error) }, null, 2));
      process.exitCode = 1;
    });
}
