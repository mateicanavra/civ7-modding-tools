#!/usr/bin/env bun

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import {
  liveCiv7ControlOrpcDirectControlFacade,
  liveCiv7ControlOrpcDirectLifecycleFacade,
} from "@civ7/control-orpc/runtime";
import {
  type Civ7DirectControlOptions,
  type Civ7SavedGameConfiguration,
  type Civ7SavedGameConfigurationRef,
  type Civ7SetupOptionValue,
  checkCiv7DirectControlHealth,
  createCiv7ControlRequestId,
  DEFAULT_CIV7_SCRIPTING_LOG,
  getCiv7SetupMapRows,
  getCiv7SetupSnapshot,
  listCiv7SavedGameConfigurations,
  snapshotFile,
  waitForFreshLogMarkers,
} from "@civ7/direct-control";
import { serializeVerifierError } from "./verifier-error";

type LiveVerificationArgs = {
  host?: string;
  port?: number;
  timeoutMs?: number;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
  mapScript?: string;
  mapSize?: string;
  seed?: number;
  playerCount?: number;
  savedConfig?: string;
  mutate: boolean;
  options: Record<string, Civ7SetupOptionValue>;
  help: boolean;
};

function resolveLocalModsDir(): string {
  const platform = process.platform;
  if (platform === "darwin") {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return join(home, "Library", "Application Support", "Civilization VII", "Mods");
  }
  if (platform === "win32") {
    const userProfile = process.env.USERPROFILE || "";
    return join(userProfile, "Documents", "My Games", "Sid Meier's Civilization VII", "Mods");
  }
  const home = process.env.HOME || process.env.USERPROFILE || "";
  return join(home, ".local", "share", "civ7", "Mods");
}

const usage = `Usage:
  nx run mod-swooper-maps:verify:operational -- --mode studio-run-in-game-live [flags]

Read-only default:
  --host <host> --port <port> --timeout-ms <ms>
  --map-script <file>

Mutating setup/start evidence:
  --mutate --map-script <file> --map-size <size> --seed <seed>
  [--player-count <n>]
  [--saved-config <name|fileName|path>]
  [--option Key=value]

Notes:
  Without --mutate this only checks LSQ health, setup snapshot, and optional
  map-row visibility. With --mutate it prepares and starts a disposable
  single-player session through @civ7/control-orpc.

  --saved-config loads one of Civ7's saved game setups (.Civ7Cfg) before the
  map is applied, so the launched game uses that config's leader/civ/difficulty/
  speed/player-count. The value matches a config by displayName, fileName,
  id, or absolute path (case-insensitive; e.g. "ToT Config"). Omit
  --player-count to honor the saved config's own count; any --option is applied
  on top of the loaded config. Note: --seed/--map-script/--map-size still govern
  the map (Civ7 stores saved seeds as signed 32-bit, and prepare overrides the
  seed from --seed regardless), so the saved config's own map/seed are not used.

  For {swooper-maps}/maps/*.js, this verifier also blocks stale installed mod
  bundles by comparing the local generated map script with the deployed Civ Mods
  script before launching.`;

export type MapScriptFileIdentity = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
  mtimeMs: number;
  mtimeIso: string;
}>;

export type MapScriptMarkerEvidence = Readonly<{
  marker: string;
  present: boolean;
}>;

export type SwooperMapScriptDeploymentStage = Readonly<{
  name: "deployed-script-identity";
  ok: boolean;
  status: "not-swooper-map-script" | "matched" | "unresolved";
  mapScript: string;
  localPath?: string;
  deployedPath?: string;
  local?: MapScriptFileIdentity;
  deployed?: MapScriptFileIdentity;
  localMarkers?: ReadonlyArray<MapScriptMarkerEvidence>;
  deployedMarkers?: ReadonlyArray<MapScriptMarkerEvidence>;
  unresolvedLinks: ReadonlyArray<string>;
  recoveryHint?: string;
}>;

export const SWOOPER_MAP_SCRIPT_PATTERN =
  /^\{swooper-maps\}\/maps\/([a-z0-9]+(?:-[a-z0-9]+)*\.js)$/;

export const REQUIRED_SWOOPER_RIVER_MATERIALIZATION_MARKERS = [
  "map.rivers.authoredTerrainMaterialization",
  "POST-AUTHORED-RIVERS",
] as const;

function parseArgs(argv: string[]): LiveVerificationArgs {
  const args: LiveVerificationArgs = {
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
      case "--player-count":
        args.playerCount = parseInteger(value(), arg);
        break;
      case "--saved-config":
        args.savedConfig = value();
        break;
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

/**
 * Resolve a `--saved-config` query to the saved game configurations it matches.
 *
 * Matches case-insensitively against a config's displayName, fileName,
 * fileName-without-extension, id, or absolute path. Returns every distinct
 * file that matched (deduped by path) so the caller can reject ambiguous
 * queries instead of silently picking one.
 */
export function matchSavedGameConfigurations(
  configurations: ReadonlyArray<Civ7SavedGameConfiguration>,
  query: string
): ReadonlyArray<Civ7SavedGameConfiguration> {
  const needle = query.trim().toLowerCase();
  const byPath = new Map<string, Civ7SavedGameConfiguration>();
  for (const config of configurations) {
    const matched =
      config.id.toLowerCase() === needle ||
      config.displayName.toLowerCase() === needle ||
      config.fileName.toLowerCase() === needle ||
      config.fileName.replace(/\.civ7cfg$/i, "").toLowerCase() === needle ||
      config.path.toLowerCase() === needle;
    if (matched) byPath.set(config.path, config);
  }
  return [...byPath.values()];
}

export function resolveSwooperMapScriptPaths(args: {
  mapScript: string;
  repoRoot: string;
  modsDir: string;
}):
  | Readonly<{
      localPath: string;
      deployedPath: string;
    }>
  | undefined {
  const match = SWOOPER_MAP_SCRIPT_PATTERN.exec(args.mapScript);
  if (!match) return undefined;
  const fileName = match[1]!;
  return {
    localPath: resolve(args.repoRoot, "mods/mod-swooper-maps/mod/maps", fileName),
    deployedPath: resolve(args.modsDir, "mod-swooper-maps/maps", fileName),
  };
}

export function buildSwooperMapScriptDeploymentStage(args: {
  mapScript: string;
  localPath?: string;
  deployedPath?: string;
  local?: MapScriptFileIdentity;
  deployed?: MapScriptFileIdentity;
  localMarkers?: ReadonlyArray<MapScriptMarkerEvidence>;
  deployedMarkers?: ReadonlyArray<MapScriptMarkerEvidence>;
}): SwooperMapScriptDeploymentStage {
  if (!args.localPath || !args.deployedPath) {
    return {
      name: "deployed-script-identity",
      ok: true,
      status: "not-swooper-map-script",
      mapScript: args.mapScript,
      unresolvedLinks: [],
    };
  }

  const unresolvedLinks: string[] = [];
  if (!args.local) unresolvedLinks.push("local-mod-script.missing");
  if (!args.deployed) unresolvedLinks.push("deployed-mod-script.missing");
  if (args.local && args.deployed && args.local.sha256 !== args.deployed.sha256) {
    unresolvedLinks.push("deployed-mod-script.hash-mismatch");
  }
  for (const evidence of args.localMarkers ?? []) {
    if (!evidence.present)
      unresolvedLinks.push(`local-mod-script.marker-missing.${markerId(evidence.marker)}`);
  }
  for (const evidence of args.deployedMarkers ?? []) {
    if (!evidence.present)
      unresolvedLinks.push(`deployed-mod-script.marker-missing.${markerId(evidence.marker)}`);
  }

  const ok = unresolvedLinks.length === 0;
  return {
    name: "deployed-script-identity",
    ok,
    status: ok ? "matched" : "unresolved",
    mapScript: args.mapScript,
    localPath: args.localPath,
    deployedPath: args.deployedPath,
    ...(args.local ? { local: args.local } : {}),
    ...(args.deployed ? { deployed: args.deployed } : {}),
    ...(args.localMarkers ? { localMarkers: args.localMarkers } : {}),
    ...(args.deployedMarkers ? { deployedMarkers: args.deployedMarkers } : {}),
    unresolvedLinks,
    ...(ok
      ? {}
      : {
          recoveryHint:
            "Build and deploy the current Swooper Maps bundle before live verification: nx run mod-swooper-maps:deploy",
        }),
  };
}

async function checkSwooperMapScriptDeployment(args: {
  mapScript: string;
  repoRoot: string;
}): Promise<SwooperMapScriptDeploymentStage> {
  const paths = resolveSwooperMapScriptPaths({
    mapScript: args.mapScript,
    repoRoot: args.repoRoot,
    modsDir: resolveLocalModsDir(),
  });
  if (!paths) {
    return buildSwooperMapScriptDeploymentStage({ mapScript: args.mapScript });
  }

  const [local, deployed, localText, deployedText] = await Promise.all([
    fileIdentity(paths.localPath),
    fileIdentity(paths.deployedPath),
    readFile(paths.localPath, "utf8").catch(() => undefined),
    readFile(paths.deployedPath, "utf8").catch(() => undefined),
  ]);

  return buildSwooperMapScriptDeploymentStage({
    mapScript: args.mapScript,
    ...paths,
    ...(local ? { local } : {}),
    ...(deployed ? { deployed } : {}),
    ...(localText !== undefined ? { localMarkers: markerEvidence(localText) } : {}),
    ...(deployedText !== undefined ? { deployedMarkers: markerEvidence(deployedText) } : {}),
  });
}

async function fileIdentity(path: string): Promise<MapScriptFileIdentity | undefined> {
  try {
    const [metadata, bytes] = await Promise.all([stat(path), readFile(path)]);
    return {
      path,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      sizeBytes: metadata.size,
      mtimeMs: metadata.mtimeMs,
      mtimeIso: metadata.mtime.toISOString(),
    };
  } catch {
    return undefined;
  }
}

function markerEvidence(text: string): ReadonlyArray<MapScriptMarkerEvidence> {
  return REQUIRED_SWOOPER_RIVER_MATERIALIZATION_MARKERS.map((marker) => ({
    marker,
    present: text.includes(marker),
  }));
}

function markerId(marker: string): string {
  return marker
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
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
    2
  );
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }

  const verificationId = createCiv7ControlRequestId("studio-run-in-game-live-verification");
  const options: Civ7DirectControlOptions = {
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  };
  const report: Record<string, unknown> = {
    ok: false,
    verificationId,
    startedAt: new Date().toISOString(),
    mode: args.mutate ? "mutating-setup-start" : "read-only",
    mutationAttempted: false,
    controlOptions: options,
    stages: [],
  };
  const stages = report.stages as unknown[];
  const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));

  try {
    const health = await checkCiv7DirectControlHealth(options);
    stages.push({ name: "health", ok: health.ok, health });
    if (!health.ok) {
      report.failureStage = "health";
      report.error = serializeVerifierError(health.error);
      console.log(safeJson(report));
      return 2;
    }

    const setupSnapshot = await getCiv7SetupSnapshot(options);
    stages.push({
      name: "setup-snapshot",
      ok: true,
      phase: setupSnapshot.snapshot.phase,
      selectedMapRow: setupSnapshot.snapshot.selectedMapRow ?? null,
      config: setupSnapshot.snapshot.config,
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
      const deploymentStage = await checkSwooperMapScriptDeployment({
        mapScript: args.mapScript,
        repoRoot,
      });
      stages.push(deploymentStage);
      if (!deploymentStage.ok) {
        report.failureStage = deploymentStage.name;
        report.error = {
          message: deploymentStage.recoveryHint ?? "Deployed map script identity is unresolved",
          unresolvedLinks: deploymentStage.unresolvedLinks,
        };
        report.finishedAt = new Date().toISOString();
        console.log(safeJson(report));
        return 2;
      }
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

    let savedConfigRef: Civ7SavedGameConfigurationRef | undefined;
    if (args.savedConfig) {
      const list = await listCiv7SavedGameConfigurations();
      const matches = matchSavedGameConfigurations(list.configurations, args.savedConfig);
      if (matches.length === 0) {
        throw new Error(
          `No saved game config matched "${args.savedConfig}" in ${list.directory}. ` +
            `Available: ${list.configurations.map((config) => config.displayName).join(", ") || "(none)"}`
        );
      }
      if (matches.length > 1) {
        throw new Error(
          `--saved-config "${args.savedConfig}" is ambiguous; matched ${matches.length}: ` +
            matches.map((config) => config.fileName).join(", ")
        );
      }
      const matched = matches[0]!;
      savedConfigRef = {
        id: matched.id,
        displayName: matched.displayName,
        fileName: matched.fileName,
        path: matched.path,
      };
      stages.push({
        name: "saved-config-resolution",
        ok: true,
        query: args.savedConfig,
        directory: list.directory,
        resolved: savedConfigRef,
        summary: matched.summary,
      });
    }

    const scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
    const scriptingSnapshot = await snapshotFile(scriptingLogPath);
    const correlationId = createCiv7ControlRequestId("studio-live");
    const run = await createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      directLifecycle: liveCiv7ControlOrpcDirectLifecycleFacade,
      endpointDefaults: options,
      correlation: { correlationId },
    }).lifecycle.singlePlayer.start({
      mapScript: args.mapScript,
      mapSize: args.mapSize,
      seed: args.seed,
      playerCount: args.playerCount,
      targetModId: targetModIdFromMapScript(args.mapScript),
      ...(savedConfigRef ? { savedConfig: savedConfigRef } : {}),
      gameOptions: args.options,
      playerOptions: {},
      activeGamePolicy: "exit-active-game",
    });
    stages.push({
      name: "setup-start",
      ok: run.status === "started",
      setup: run.evidence.setup,
      runtime: run.evidence.runtime,
    });
    const logEvidence = await waitForFreshLogMarkers({
      logPath: scriptingLogPath,
      snapshot: scriptingSnapshot,
      markers: ["[mapgen-complete]", `"seed":${args.seed}`],
      timeoutMs: args.waitTimeoutMs,
      pollIntervalMs: args.pollIntervalMs,
      rejectPattern:
        /\[mapgen-failure\]|Map generation failed|\[recipe:[^\]]+\].*fail|StepExecutionError|\b(?:TextEncoder|Uncaught|Exception|Error)\b/i,
    });
    stages.push({
      name: "mapgen-log-completion",
      ok: true,
      logPath: logEvidence.logPath,
      observedAt: logEvidence.observedAt,
      matched: logEvidence.matched,
    });
    report.ok = run.status === "started";
    report.finishedAt = new Date().toISOString();
    console.log(safeJson(report));
    return run.status === "started" ? 0 : 3;
  } catch (error) {
    report.failureStage ??= "exception";
    report.error = serializeVerifierError(error);
    report.finishedAt = new Date().toISOString();
    console.log(safeJson(report));
    return 1;
  }
}

function targetModIdFromMapScript(mapScript: string): string {
  const end = mapScript.indexOf("}");
  if (!mapScript.startsWith("{") || end <= 1) {
    throw new Error(`Map script does not identify its owning mod: ${mapScript}`);
  }
  return mapScript.slice(1, end);
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(safeJson({ ok: false, error: serializeVerifierError(error) }));
      process.exitCode = 1;
    });
}
