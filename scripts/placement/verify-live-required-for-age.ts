#!/usr/bin/env bun

/**
 * Live required-for-age probe (placement-realignment Milestone A4).
 *
 * Reads the live age and leaders present, calls the live
 * `ResourceBuilder.isResourceRequiredForAge` for EVERY GameInfo.Resources
 * index, and compares against the static `@civ7/map-policy` tables
 * (`CIV7_POLICY_TABLES_V1.isResourceRequiredForAge` /
 * `resourceRequiredLeaders`) to derive the live filtering rule boundary.
 *
 * Verified live API signatures (official scripts):
 *   ResourceBuilder.isResourceRequiredForAge(resourceTypeIndex, age)
 *     - .civ7/outputs/resources/Base/modules/base-standard/maps/resource-generator.js:115
 *       `ResourceBuilder.isResourceRequiredForAge(i, Game.age)`
 *       (i is the GameInfo.Resources row index; age is the Game.age hash.)
 *   Live age:
 *     - Game.age + GameInfo.Ages.lookup(Game.age) -> definition (.AgeType):
 *       .civ7/outputs/resources/Base/modules/base-standard/maps/resource-generator.js:152
 *       .civ7/outputs/resources/Base/modules/base-standard/scripts/age-transition-post-load.js:294
 *       (`option.AgeType == ageDefinition.AgeType`)
 *   Live leaders:
 *     - Players.getAliveMajorIds():
 *       .civ7/outputs/resources/Base/modules/base-standard/maps/assign-starting-plots.js:686
 *     - Players.get(playerId).leaderType (hash) + player.leaderName:
 *       .civ7/outputs/resources/Base/modules/base-standard/maps/assign-starting-plots.js:689-695
 *     - GameInfo.Leaders.lookup(<hash or string>) row (.LeaderType, .$hash):
 *       .civ7/outputs/resources/Base/modules/base-standard/maps/assign-starting-plots.js:979
 *       .civ7/outputs/resources/Base/modules/base-standard/maps/map-utilities.js:12-30
 *
 * Engine reads are batched: one exec for age + leaders, ONE exec for the full
 * per-resource isResourceRequiredForAge sweep; each returns one
 * JSON.stringify'd payload.
 *
 * This script CONNECTS TO THE LIVE GAME (read-only). Do not run while the
 * game is restarting. `--help` exits before any socket work.
 *
 * Usage:
 *   bun scripts/placement/verify-live-required-for-age.ts [--host h] [--port p] \
 *     [--timeout-ms 45000] [--output out.json]
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  type Civ7CommandResult,
  type Civ7DirectControlOptions,
  executeCiv7TunerCommand,
} from "../../packages/civ7-direct-control/src/index.ts";
import {
  CIV7_BROWSER_TABLES_V0,
  CIV7_POLICY_TABLES_V1,
} from "../../packages/civ7-map-policy/src/index.ts";

type Args = Readonly<{
  host?: string;
  port?: number;
  timeoutMs: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  bun scripts/placement/verify-live-required-for-age.ts [options]

Reads live age + leaders, sweeps ResourceBuilder.isResourceRequiredForAge for
every resource index, and compares against the static @civ7/map-policy
required-for-age tables (Milestone A4). Read-only; requires a live game.

Options:
  --host <host>       Civ7 tuner host
  --port <port>       Civ7 tuner port
  --timeout-ms <ms>   Direct-control timeout (default: 45000)
  --output <path>     Write full comparison JSON to path
  --help, -h          Show this help (no game connection)
`;

export function parseArgs(argv: string[]): Args {
  const args: {
    host?: string;
    port?: number;
    timeoutMs: number;
    output?: string;
    help: boolean;
  } = {
    timeoutMs: 45_000,
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
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

/* ---------------------------------------------------------------- engine */

type LiveGameContext = Readonly<{
  ageHash: number;
  ageType: string | null;
  leaders: ReadonlyArray<
    Readonly<{
      playerId: number;
      leaderType: string | null;
      leaderName: string | null;
    }>
  >;
}>;

type LiveRequiredSweep = Readonly<{
  count: number;
  rows: ReadonlyArray<Readonly<{ index: number; type: string | null; required: boolean }>>;
}>;

function jsonPayloadFromCommandResult<T>(result: Civ7CommandResult, label: string): T {
  const payload = [...result.output].reverse().find((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith("{") || trimmed.startsWith("[");
  });
  try {
    return JSON.parse(payload ?? "{}") as T;
  } catch (error) {
    throw new Error(`${label} returned invalid JSON: ${result.output.join("\n") || "<empty>"}`, {
      cause: error,
    });
  }
}

async function execJson<T>(
  options: Civ7DirectControlOptions,
  command: string,
  label: string
): Promise<T> {
  const result = await executeCiv7TunerCommand({ ...options, command });
  return jsonPayloadFromCommandResult<T>(result, label);
}

function buildGameContextCommand(): string {
  return `(() => {
    const ageHash = Game.age;
    const ageRow = GameInfo.Ages.lookup(ageHash);
    const leaders = [];
    const aliveMajorIds = Players.getAliveMajorIds();
    for (const playerId of aliveMajorIds) {
      const player = Players.get(playerId);
      if (!player) continue;
      const leaderRow = GameInfo.Leaders.lookup(player.leaderType);
      leaders.push({
        playerId,
        leaderType: leaderRow && typeof leaderRow.LeaderType === "string" ? leaderRow.LeaderType : null,
        leaderName: typeof player.leaderName === "string" ? player.leaderName : null,
      });
    }
    return JSON.stringify({
      ageHash,
      ageType: ageRow && typeof ageRow.AgeType === "string" ? ageRow.AgeType : null,
      leaders,
    });
  })()`;
}

function buildRequiredForAgeSweepCommand(): string {
  return `(() => {
    const rows = [];
    for (let i = 0; i < GameInfo.Resources.length; i++) {
      const row = GameInfo.Resources.lookup(i);
      rows.push({
        index: i,
        type: row && typeof row.ResourceType === "string" ? row.ResourceType : null,
        required: ResourceBuilder.isResourceRequiredForAge(i, Game.age) === true,
      });
    }
    return JSON.stringify({ count: GameInfo.Resources.length, rows });
  })()`;
}

/* ------------------------------------------------------------------ main */

const V0_RESOURCE_TYPES = CIV7_BROWSER_TABLES_V0.resourceTypes as Readonly<Record<string, number>>;
const V1_REQUIRED_FOR_AGE = CIV7_POLICY_TABLES_V1.isResourceRequiredForAge;
const V1_REQUIRED_LEADERS = CIV7_POLICY_TABLES_V1.resourceRequiredLeaders;

type PerResourceRow = {
  liveIndex: number;
  resourceType: string | null;
  staticIndex: number | null;
  indexMismatch: boolean;
  staticRequiredForLiveAge: boolean;
  liveRequired: boolean;
  keyingLeaders: ReadonlyArray<string>;
  keyingLeadersPresent: ReadonlyArray<string>;
  anyKeyingLeaderPresent: boolean;
  predictedRequired: boolean;
  matchesPrediction: boolean;
};

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }

  const directControl: Civ7DirectControlOptions = {
    ...(args.host === undefined ? {} : { host: args.host }),
    ...(args.port === undefined ? {} : { port: args.port }),
    timeoutMs: args.timeoutMs,
  };

  const context = await execJson<LiveGameContext>(
    directControl,
    buildGameContextCommand(),
    "live game context (age + leaders)"
  );
  if (!context.ageType) {
    throw new Error(`Live age unavailable: ${JSON.stringify(context)}`);
  }
  const liveAgeType = context.ageType;
  const liveLeaderTypes = new Set(
    context.leaders
      .map((leader) => leader.leaderType)
      .filter((leaderType): leaderType is string => typeof leaderType === "string")
  );

  const sweep = await execJson<LiveRequiredSweep>(
    directControl,
    buildRequiredForAgeSweepCommand(),
    "isResourceRequiredForAge sweep"
  );

  const perResource: PerResourceRow[] = sweep.rows.map((row) => {
    const staticIndex =
      row.type !== null && V0_RESOURCE_TYPES[row.type] !== undefined
        ? V0_RESOURCE_TYPES[row.type]
        : null;
    const staticKey = staticIndex !== null ? String(staticIndex) : null;
    const staticAges = staticKey !== null ? (V1_REQUIRED_FOR_AGE[staticKey] ?? []) : [];
    const keyingLeaders = staticKey !== null ? (V1_REQUIRED_LEADERS[staticKey] ?? []) : [];
    const keyingLeadersPresent = keyingLeaders.filter((leader) => liveLeaderTypes.has(leader));
    const staticRequiredForLiveAge = staticAges.includes(liveAgeType);
    const anyKeyingLeaderPresent = keyingLeadersPresent.length > 0;
    const predictedRequired = staticRequiredForLiveAge && anyKeyingLeaderPresent;
    return {
      liveIndex: row.index,
      resourceType: row.type,
      staticIndex,
      indexMismatch: staticIndex !== null && staticIndex !== row.index,
      staticRequiredForLiveAge,
      liveRequired: row.required,
      keyingLeaders,
      keyingLeadersPresent,
      anyKeyingLeaderPresent,
      predictedRequired,
      matchesPrediction: row.required === predictedRequired,
    };
  });

  const mismatchesVsPrediction = perResource.filter((row) => !row.matchesPrediction);
  const mismatchesVsStaticOnly = perResource.filter(
    (row) => row.liveRequired !== row.staticRequiredForLiveAge
  );
  const indexMismatches = perResource.filter((row) => row.indexMismatch);

  const ruleBoundary =
    mismatchesVsPrediction.length === 0
      ? "live isResourceRequiredForAge == static required-for-age set FILTERED to keying leaders present in the live game (live = static AND any-keying-leader-present)"
      : mismatchesVsStaticOnly.length === 0
        ? "live isResourceRequiredForAge == static required-for-age set (NO leader-presence filtering observed)"
        : "live behavior matches NEITHER the static set nor the leader-filtered static set; see mismatches";

  const output = {
    ok: mismatchesVsPrediction.length === 0 || mismatchesVsStaticOnly.length === 0,
    live: {
      ageHash: context.ageHash,
      ageType: liveAgeType,
      leaders: context.leaders,
      leaderTypesPresent: [...liveLeaderTypes].sort(),
      resourceCount: sweep.count,
      liveRequiredCount: perResource.filter((row) => row.liveRequired).length,
    },
    static: {
      source:
        "@civ7/map-policy CIV7_POLICY_TABLES_V1 (isResourceRequiredForAge, resourceRequiredLeaders)",
      staticRequiredForLiveAgeCount: perResource.filter((row) => row.staticRequiredForLiveAge)
        .length,
      predictedRequiredCount: perResource.filter((row) => row.predictedRequired).length,
    },
    ruleBoundary,
    mismatches: {
      vsLeaderFilteredPrediction: mismatchesVsPrediction,
      vsStaticOnly: mismatchesVsStaticOnly.map((row) => ({
        liveIndex: row.liveIndex,
        resourceType: row.resourceType,
        staticRequiredForLiveAge: row.staticRequiredForLiveAge,
        liveRequired: row.liveRequired,
        anyKeyingLeaderPresent: row.anyKeyingLeaderPresent,
      })),
      staticIndexMismatches: indexMismatches,
    },
    perResource,
    generatedAt: new Date().toISOString(),
  };

  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  console.log(`A4 rule boundary: ${ruleBoundary}`);
  return output.ok ? 0 : 2;
}

function writeOutput(path: string | undefined, output: unknown): void {
  if (!path) return;
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, `${JSON.stringify(output, null, 2)}\n`);
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(
        JSON.stringify(
          { ok: false, error: error instanceof Error ? error.message : String(error) },
          null,
          2
        )
      );
      process.exitCode = 1;
    });
}
