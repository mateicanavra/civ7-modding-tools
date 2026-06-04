#!/usr/bin/env bun

import {
  checkCiv7DirectControlHealth,
  createCiv7ControlRequestId,
  DEFAULT_CIV7_SCRIPTING_LOG,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  runCiv7SinglePlayerFromSetup,
  snapshotFile,
  type Civ7DirectControlOptions,
  type Civ7SetupOptionValue,
  waitForFreshLogMarkers,
} from "../../packages/civ7-direct-control/src/index.ts";

type LiveProofArgs = {
  host?: string;
  port?: number;
  timeoutMs?: number;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
  mapScript?: string;
  mapSize?: string;
  seed?: number;
  gameSeed?: number;
  playerCount?: number;
  fromRunningGame: "reject" | "exit-to-shell";
  mutate: boolean;
  options: Record<string, Civ7SetupOptionValue>;
  help: boolean;
};

const usage = `Usage:
  bun run verify:studio-run-in-game:live -- [flags]

Read-only default:
  --host <host> --port <port> --timeout-ms <ms>
  --map-script <file>

Mutating setup/start proof:
  --mutate --map-script <file> --map-size <size> --seed <seed>
  [--game-seed <seed>] [--player-count <n>]
  [--from-running-game reject|exit-to-shell]
  [--option Key=value]

Notes:
  Without --mutate this only checks LSQ health, setup snapshot, and optional
  map-row visibility. With --mutate it prepares and starts a disposable
  single-player session through @civ7/direct-control.`;

function parseArgs(argv: string[]): LiveProofArgs {
  const args: LiveProofArgs = {
    fromRunningGame: "reject",
    mutate: false,
    options: {},
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
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
        if (mode !== "reject" && mode !== "exit-to-shell") {
          throw new Error(`Invalid --from-running-game value: ${mode}`);
        }
        args.fromRunningGame = mode;
        break;
      }
      case "--mutate":
        args.mutate = true;
        break;
      case "--option": {
        const raw = value();
        const separator = raw.indexOf("=");
        if (separator <= 0) {
          throw new Error(`Invalid --option value, expected Key=value: ${raw}`);
        }
        const key = raw.slice(0, separator);
        args.options[key] = parseOptionValue(raw.slice(separator + 1));
        break;
      }
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} must be an integer: ${value}`);
  }
  return parsed;
}

function parseOptionValue(value: string): Civ7SetupOptionValue {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: "code" in error ? error.code : undefined,
      details: "details" in error ? cloneForJson(error.details) : undefined,
    };
  }
  return { message: String(error) };
}

function cloneForJson(value: unknown): unknown {
  if (value === undefined) return undefined;
  return JSON.parse(safeJson(value));
}

function safeJson(value: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(
    value,
    (_key, item) => {
      if (typeof item === "bigint") return item.toString();
      if (typeof item !== "object" || item === null) return item;
      if (seen.has(item)) return "[circular]";
      seen.add(item);
      return item;
    },
    2,
  );
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }

  const proofId = createCiv7ControlRequestId("studio-run-in-game-live-proof");
  const options: Civ7DirectControlOptions = {
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  };
  const report: Record<string, unknown> = {
    ok: false,
    proofId,
    startedAt: new Date().toISOString(),
    mode: args.mutate ? "mutating-setup-start" : "read-only",
    mutationAttempted: false,
    controlOptions: options,
    stages: [],
  };
  const stages = report.stages as unknown[];

  try {
    const health = await checkCiv7DirectControlHealth(options);
    stages.push({ name: "health", ok: health.ok, health });
    if (!health.ok) {
      report.failureStage = "health";
      report.error = serializeError(health.error);
      console.log(safeJson(report));
      return 2;
    }

    const setupSnapshot = await getCiv7SetupSnapshot(options);
    stages.push({
      name: "setup-snapshot",
      ok: true,
      phase: setupSnapshot.snapshot.phase,
      selected: setupSnapshot.snapshot.selected,
    });

    if (args.mapScript) {
      const mapRows = await getCiv7SetupMapRows({ file: args.mapScript, limit: 25 }, options);
      stages.push({
        name: "map-row-visibility",
        ok: mapRows.rows.length > 0,
        mapScript: args.mapScript,
        matchedFile: mapRows.matchedFile,
        rowCount: mapRows.rows.length,
        rows: mapRows.rows,
      });
    }

    if (!args.mutate) {
      report.ok = true;
      report.finishedAt = new Date().toISOString();
      console.log(safeJson(report));
      return 0;
    }

    if (!args.mapScript || !args.mapSize || args.seed === undefined) {
      throw new Error("--mutate requires --map-script, --map-size, and --seed");
    }

    report.mutationAttempted = true;
    const scriptingSnapshot = await snapshotFile(DEFAULT_CIV7_SCRIPTING_LOG);
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
      options,
      {
        approved: true,
        reason: `Studio Run in Game live proof ${proofId}`,
        disposableSession: true,
      },
    );
    const logProof = await waitForFreshLogMarkers({
      logPath: DEFAULT_CIV7_SCRIPTING_LOG,
      snapshot: scriptingSnapshot,
      markers: ["[mapgen-complete]", `"seed":${args.seed}`],
      timeoutMs: args.waitTimeoutMs,
      pollIntervalMs: args.pollIntervalMs,
      rejectPattern:
        /\[mapgen-failure\]|Map generation failed|\[recipe:[^\]]+\].*fail|StepExecutionError|\b(?:TextEncoder|Uncaught|Exception|Error)\b/i,
    });
    stages.push({
      name: "setup-start",
      ok: run.verified,
      prepareVerified: run.prepare.verified,
      startVerified: run.start.verified,
      mapSummary: run.start.mapSummary,
      observations: run.start.observations.length,
    });
    stages.push({
      name: "mapgen-log-completion",
      ok: true,
      logPath: logProof.logPath,
      observedAt: logProof.observedAt,
      matched: logProof.matched,
    });
    report.ok = run.verified;
    report.finishedAt = new Date().toISOString();
    console.log(safeJson(report));
    return run.verified ? 0 : 3;
  } catch (error) {
    report.failureStage ??= "exception";
    report.error = serializeError(error);
    report.finishedAt = new Date().toISOString();
    console.log(safeJson(report));
    return 1;
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(safeJson({ ok: false, error: serializeError(error) }));
    process.exitCode = 1;
  });
