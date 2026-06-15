import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { promisify } from "node:util";
import {
  Civ7DirectControlError,
  createCiv7ControlRequestId,
  DEFAULT_CIV7_SCRIPTING_LOG,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  ensureCiv7SetupMapRowVisible,
  getCiv7PlayableStatus,
  getCiv7SetupSnapshot,
  logTextFromSnapshot,
  runCiv7SinglePlayerFromSetup,
  snapshotFile,
  startCiv7Autoplay,
  stopCiv7Autoplay,
  waitForFreshLogMarkers,
} from "@civ7/direct-control";
import { deployMod, resolveModsDir } from "@civ7/plugin-mods";
import type { StudioEventHubApi, StudioOperationEvent } from "@civ7/studio-server";
import { buildLiveRuntimeStatusState } from "../../features/liveRuntime/model";
import type { RunInGamePhase, RunInGameRequestStatus } from "../../features/runInGame/status";
import { buildSwooperMapsStudioDeployPlan } from "../mapConfigs/deploy";
import { createMapConfigSaveDeployOperationStore } from "../mapConfigs/operationState";
import { parseMapConfigSaveRequest } from "../mapConfigs/requestValidation";
import { waitForCiv7MapgenLogFailure } from "../runInGame/logFailure";
import {
  launchCiv7MacViaSteamWithRetries,
  shutdownCiv7MacProcess,
} from "../runInGame/macosProcessRestart";
import {
  createRunInGameOperationStore,
  type RunInGameOperationState,
} from "../runInGame/operationState";
import {
  buildRunInGameExactAuthorshipProof,
  buildRunInGameSourceSnapshotProof,
  fileContentMarkerProof,
  fileIdentity,
  mapScriptEmbedsRequestId,
  parseSwooperMapgenLogProof,
  runInGameMaterializationScriptUnresolvedLinks,
  runInGameRequiredMaterializationMarkers,
} from "../runInGame/proofIdentity";
import { parseRunInGameSetupRequest } from "../runInGame/requestValidation";
import { StudioEngineError } from "./engineErrors";

// ============================================================================
// Studio engines — the stateful server core (bun-server workstream, slice 2)
// ----------------------------------------------------------------------------
// Moved VERBATIM out of `vite.config.ts` module scope: the serialized operation
// queue, both operation stores (the dual-store 409 mutex), the server instance
// identity, and the five engine functions (autoplay, run-in-game start/status,
// save-deploy start/status). `createStudioEngines` owns ALL process-singleton
// server state — exactly one instance may exist per server process (the Bun
// daemon), shared by every oRPC mount, or the queue/mutex semantics diverge
// (architecture/10 §7).
//
// Each engine returns its success body, or THROWS:
//   - `StudioEngineError` (carries statusCode + details) — preserves the
//     non-uniform legacy status codes (409 mutex, run-in-game/save-deploy 404)
//     and known invalid/unavailable/failed engine categories.
//   - an unexpected exception — mapped by the oRPC context to `*_FAILED`.
// The oRPC context adapts return/throw → value/ORPCError (./context.ts), mapping
// each status onto the contract's DECLARED error codes (409→*_BLOCKED,
// 400→*_INVALID, 404→*_STATUS_NOT_FOUND, 503→*_UNAVAILABLE, else *_FAILED) so
// those statuses survive the oRPC boundary as defined typed errors.
// ============================================================================

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;
const SCRIPTING_LOG_FAILURE_GRACE_MS = 5_000;
const SCRIPTING_LOG_FAILURE_POLL_INTERVAL_MS = 250;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;
const RUN_IN_GAME_OPERATION_TTL_MS = 30 * 60_000;
const CIV7_STEAM_APP_ID = "1295660";
const CIV7_PROCESS_PATTERN = "CivilizationVII.app/Contents/MacOS/CivilizationVII";
const CIV7_PROCESS_GRACEFUL_QUIT_TIMEOUT_MS = 45_000;
const CIV7_PROCESS_FORCE_QUIT_TIMEOUT_MS = 30_000;
const CIV7_PROCESS_FORCE_KILL_TIMEOUT_MS = 15_000;
const CIV7_PROCESS_RESTART_WAIT_TIMEOUT_MS = 180_000;
const CIV7_PROCESS_RESTART_POLL_INTERVAL_MS = 2_000;
const CIV7_PROCESS_EXIT_STABLE_POLLS = 2;
const CIV7_PROCESS_LAUNCH_COMMAND_TIMEOUT_MS = 10_000;
const CIV7_PROCESS_LAUNCH_START_TIMEOUT_MS = 20_000;
const CIV7_PROCESS_LAUNCH_ATTEMPTS = 6;
const CIV7_PROCESS_LAUNCH_RETRY_DELAY_MS = 5_000;

function tail(value: string): string {
  return value.length > MAX_DEPLOY_OUTPUT_CHARS ? value.slice(-MAX_DEPLOY_OUTPUT_CHARS) : value;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

function stableHash(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

async function readFreshLogText(
  logPath: string,
  snapshot: Awaited<ReturnType<typeof snapshotFile>>
): Promise<string> {
  const current = await snapshotFile(logPath);
  if (!current.exists) return "";
  const fullText = await readFile(logPath, "utf8");
  return logTextFromSnapshot({ fullText, snapshot, current }).text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function invalidEngineRequest(
  message: string,
  code: string,
  details: Record<string, unknown> = {}
): StudioEngineError {
  return new StudioEngineError(400, message, {
    code,
    ...details,
    recoveryActions: ["copy-diagnostics"],
  });
}

function unavailableEngineDependency(
  message: string,
  code: string,
  err?: unknown,
  details: Record<string, unknown> = {}
): StudioEngineError {
  const directControlCode = err instanceof Civ7DirectControlError ? err.code : undefined;
  const cause = err instanceof Civ7DirectControlError ? err.details : err;
  return new StudioEngineError(503, message, {
    code,
    ...details,
    ...(directControlCode === undefined ? {} : { directControlCode }),
    ...(cause === undefined ? {} : { cause: cloneForJson(cause) }),
    recoveryActions: ["copy-diagnostics", "retry-status", "retry-run"],
  });
}

async function restartCiv7ProcessViaSteam(): Promise<{
  command: string;
  quit: { command: string; stdout: string; stderr: string };
  kill?: { command: string; stdout: string; stderr: string };
  forceKill?: { command: string; stdout: string; stderr: string };
  shutdown: Awaited<ReturnType<typeof shutdownCiv7MacProcess>>;
  launch: { command: string; stdout: string; stderr: string };
  launchAttempts: Awaited<ReturnType<typeof launchCiv7MacViaSteamWithRetries>>["attempts"];
  setupPhase?: string;
}> {
  if (process.platform !== "darwin") {
    throw unavailableEngineDependency(
      "Civ7 process restart from Studio is currently supported on macOS only",
      "civ7-process-restart-platform-unavailable",
      undefined,
      { platform: process.platform }
    );
  }

  const shutdown = await shutdownCiv7MacProcess({
    execFileAsync,
    sleep,
    tail,
    processPattern: CIV7_PROCESS_PATTERN,
    gracefulQuitTimeoutMs: CIV7_PROCESS_GRACEFUL_QUIT_TIMEOUT_MS,
    forceQuitTimeoutMs: CIV7_PROCESS_FORCE_QUIT_TIMEOUT_MS,
    forceKillTimeoutMs: CIV7_PROCESS_FORCE_KILL_TIMEOUT_MS,
    pollIntervalMs: CIV7_PROCESS_RESTART_POLL_INTERVAL_MS,
    stableAbsentPolls: CIV7_PROCESS_EXIT_STABLE_POLLS,
  }).catch((err: unknown) => {
    throw unavailableEngineDependency(
      "Unable to shut down Civ7 process before restart",
      "civ7-process-shutdown-unavailable",
      err
    );
  });

  const steamLaunch = await launchCiv7MacViaSteamWithRetries({
    execFileAsync,
    sleep,
    tail,
    steamAppId: CIV7_STEAM_APP_ID,
    processPattern: CIV7_PROCESS_PATTERN,
    launchCommandTimeoutMs: CIV7_PROCESS_LAUNCH_COMMAND_TIMEOUT_MS,
    processStartTimeoutMs: CIV7_PROCESS_LAUNCH_START_TIMEOUT_MS,
    pollIntervalMs: CIV7_PROCESS_RESTART_POLL_INTERVAL_MS,
    maxLaunchAttempts: CIV7_PROCESS_LAUNCH_ATTEMPTS,
    retryDelayMs: CIV7_PROCESS_LAUNCH_RETRY_DELAY_MS,
  }).catch((err: unknown) => {
    throw unavailableEngineDependency(
      "Unable to launch Civ7 via Steam",
      "civ7-steam-launch-unavailable",
      err
    );
  });
  const launch = steamLaunch.attempts[steamLaunch.attempts.length - 1]?.launch;
  if (!launch) {
    throw unavailableEngineDependency(
      "Civ7 Steam launch did not record an attempt",
      "civ7-steam-launch-attempt-missing",
      undefined,
      { launchAttempts: steamLaunch.attempts }
    );
  }

  const startedAt = Date.now();
  let setupPhase: string | undefined;
  while (Date.now() - startedAt <= CIV7_PROCESS_RESTART_WAIT_TIMEOUT_MS) {
    try {
      const snapshot = await getCiv7SetupSnapshot({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS });
      setupPhase = snapshot.snapshot.phase;
      if (setupPhase === "shell") break;
    } catch {
      // Civ is still starting.
    }
    await sleep(CIV7_PROCESS_RESTART_POLL_INTERVAL_MS);
  }

  if (setupPhase !== "shell") {
    throw unavailableEngineDependency(
      `Civ7 process restarted but setup shell was not ready within ${CIV7_PROCESS_RESTART_WAIT_TIMEOUT_MS}ms`,
      "civ7-setup-shell-timeout",
      undefined,
      {
        setupPhase,
        timeoutMs: CIV7_PROCESS_RESTART_WAIT_TIMEOUT_MS,
      }
    );
  }

  return {
    command: `${shutdown.quit.command} && ${steamLaunch.command}`,
    quit: shutdown.quit,
    ...(shutdown.kill === undefined ? {} : { kill: shutdown.kill }),
    ...(shutdown.forceKill === undefined ? {} : { forceKill: shutdown.forceKill }),
    shutdown,
    launch,
    launchAttempts: steamLaunch.attempts,
    setupPhase,
  };
}

// Deploy = the Turbo build graph + the @civ7/plugin-mods deploy API (the
// rivers-era canonical shape; the old parsed-stdout deploy command is gone).
// `buildSwooperMapsStudioDeployPlan` threads SWOOPER_STUDIO_RUN_ID so the
// generated bundle embeds the run's request id (the proof-identity contract).
async function deploySwooperMaps(repoRoot: string): Promise<{
  build: {
    task: string;
    stdout: string;
    stderr: string;
  };
  targetDir: string;
  modsDir: string;
  filesCopied: number;
}> {
  const plan = buildSwooperMapsStudioDeployPlan();
  const { stdout, stderr } = await execFileAsync("bun", [...plan.buildArgs], {
    cwd: repoRoot,
    timeout: DEPLOY_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    env: plan.env,
  });
  const modsDir = resolveModsDir().modsDir;
  const deployed = deployMod({
    inputDir: resolve(repoRoot, "mods/mod-swooper-maps/mod"),
    modId: "mod-swooper-maps",
    modsDir,
  });
  return {
    build: {
      task: plan.buildTask,
      stdout: tail(stdout),
      stderr: tail(stderr),
    },
    targetDir: deployed.targetDir,
    modsDir: deployed.modsDir,
    filesCopied: deployed.filesCopied,
  };
}

async function deploySwooperMapsForRun(
  repoRoot: string,
  requestId: string
): Promise<{
  build: {
    task: string;
    stdout: string;
    stderr: string;
  };
  targetDir: string;
  modsDir: string;
  filesCopied: number;
}> {
  const plan = buildSwooperMapsStudioDeployPlan({ requestId });
  const { stdout, stderr } = await execFileAsync("bun", [...plan.buildArgs], {
    cwd: repoRoot,
    timeout: DEPLOY_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    env: plan.env,
  });
  const modsDir = resolveModsDir().modsDir;
  const deployed = deployMod({
    inputDir: resolve(repoRoot, "mods/mod-swooper-maps/mod"),
    modId: "mod-swooper-maps",
    modsDir,
  });
  return {
    build: {
      task: plan.buildTask,
      stdout: tail(stdout),
      stderr: tail(stderr),
    },
    targetDir: deployed.targetDir,
    modsDir: deployed.modsDir,
    filesCopied: deployed.filesCopied,
  };
}

async function optionalFileIdentity(args: {
  repoRoot: string;
  path: string;
  exposeAs?: "relative-to-repo" | "absolute";
}) {
  return await fileIdentity(args).catch(() => undefined);
}

async function optionalFileContentMarkerProof(args: Parameters<typeof fileContentMarkerProof>[0]) {
  return await fileContentMarkerProof(args).catch(() => undefined);
}

function generatedSourceScriptPath(repoRoot: string, id: string): string {
  return resolve(repoRoot, "mods/mod-swooper-maps/src/maps/generated", `${id}.ts`);
}

function localModScriptPath(repoRoot: string, id: string): string {
  return resolve(repoRoot, "mods/mod-swooper-maps/mod/maps", `${id}.js`);
}

function deployedModScriptPath(targetDir: string, id: string): string {
  return resolve(targetDir, "maps", `${id}.js`);
}

async function regenerateSwooperMapArtifacts(repoRoot: string): Promise<void> {
  await execFileAsync("bun", ["run", "--cwd", "mods/mod-swooper-maps", "gen:maps"], {
    cwd: repoRoot,
    timeout: DEPLOY_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
  });
}

function isNodeNotFound(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
}

function assertRepoMapEnvelope(envelope: unknown, id: string): void {
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
    throw invalidEngineRequest(
      "Map config envelope must be a JSON object",
      "map-config-envelope-not-object"
    );
  }
  const record = envelope as Record<string, unknown>;
  if (record.id !== id) {
    throw invalidEngineRequest(
      "Map config envelope id must match the requested id",
      "map-config-envelope-id-mismatch"
    );
  }
  if (typeof record.name !== "string" || record.name.trim().length === 0) {
    throw invalidEngineRequest("Map config name must be non-empty", "map-config-name-empty");
  }
  if (typeof record.description !== "string" || record.description.trim().length === 0) {
    throw invalidEngineRequest(
      "Map config description must be non-empty",
      "map-config-description-empty"
    );
  }
  if (record.recipe !== "standard") {
    throw invalidEngineRequest('Map config recipe must be "standard"', "map-config-recipe-invalid");
  }
  if (!Number.isInteger(record.sortIndex))
    throw invalidEngineRequest(
      "Map config sortIndex must be an integer",
      "map-config-sort-index-invalid"
    );
  if (!record.config || typeof record.config !== "object" || Array.isArray(record.config)) {
    throw invalidEngineRequest(
      "Map config payload must be a JSON object",
      "map-config-payload-not-object"
    );
  }
}

function mapScriptForConfigId(id: string): string {
  return `{swooper-maps}/maps/${id}.js`;
}

function makeRepoMapEnvelope(args: {
  id: string;
  name: string;
  description?: string;
  sortIndex: number;
  latitudeBounds?: unknown;
  config: unknown;
}): Record<string, unknown> {
  return {
    $schema: "../../../dist/recipes/standard-map-config.schema.json",
    id: args.id,
    name: args.name,
    description: args.description?.trim() || args.name,
    recipe: "standard",
    sortIndex: args.sortIndex,
    ...(args.latitudeBounds ? { latitudeBounds: args.latitudeBounds } : {}),
    config: args.config,
  };
}

async function materializeRunInGameConfig(args: {
  repoRoot: string;
  id: string;
  sourcePath?: string;
  envelope: Record<string, unknown>;
  mode: "durable" | "disposable";
}): Promise<{
  path: string;
  mapScript: string;
  cleanup: () => Promise<void>;
}> {
  const configRoot = resolve(args.repoRoot, "mods/mod-swooper-maps/src/maps/configs");
  const target = args.sourcePath
    ? resolve(args.repoRoot, args.sourcePath)
    : resolve(configRoot, `${args.id}.config.json`);
  if (!target.startsWith(`${configRoot}/`) || !target.endsWith(".config.json")) {
    throw invalidEngineRequest(
      "Map config writes must stay in mods/mod-swooper-maps/src/maps/configs",
      "map-config-path-outside-config-root",
      { sourcePath: args.sourcePath }
    );
  }
  const path = relative(args.repoRoot, target);
  const previous = await readFile(target, "utf8").catch((err: unknown) => {
    if (isNodeNotFound(err)) return null;
    throw unavailableEngineDependency(
      "Unable to read existing map config before Run in Game materialization",
      "map-config-read-unavailable",
      err,
      { path, sourcePath: args.sourcePath }
    );
  });
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(args.envelope, null, 2)}\n`);
  return {
    path,
    mapScript: mapScriptForConfigId(args.id),
    cleanup: async () => {
      if (args.mode !== "disposable") return;
      await restoreRepoConfig(target, previous);
      await regenerateSwooperMapArtifacts(args.repoRoot);
    },
  };
}

function cloneForJson(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(value.stack === undefined ? {} : { stack: value.stack }),
    };
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function engineDetails(err: unknown): Record<string, unknown> {
  return err instanceof StudioEngineError && isRecord(err.details) ? err.details : {};
}

async function restoreRepoConfig(target: string, previous: string | null): Promise<void> {
  if (previous === null) {
    await rm(target, { force: true });
    return;
  }
  await writeFile(target, previous);
}

/** Request body accepted by the run-in-game start engine (legacy + oRPC shape). */
export interface RunInGameStartEngineBody {
  recipeId?: unknown;
  seed?: unknown;
  mapSize?: unknown;
  playerCount?: unknown;
  resources?: unknown;
  materialization?: { mode?: unknown };
  recovery?: { restartCivProcess?: unknown };
  setupConfig?: unknown;
  config?: unknown;
  sourceSnapshot?: unknown;
  selectedConfig?: {
    id?: unknown;
    label?: unknown;
    description?: unknown;
    sourcePath?: unknown;
    sortIndex?: unknown;
    latitudeBounds?: unknown;
  };
}

export type RunInGameStartResult =
  | { kind: "accepted"; operation: RunInGameOperationState }
  | { kind: "duplicate"; operation: RunInGameOperationState };

export interface AutoplayEngineResult {
  ok: boolean;
  action: "start" | "stop";
  autoplay: unknown;
  game: unknown;
  gameContext: unknown;
  result: unknown;
}

type SaveDeployOperationStore = ReturnType<typeof createMapConfigSaveDeployOperationStore>;
export type SaveDeployEngineResult = ReturnType<SaveDeployOperationStore["create"]>;
type StudioEngineEventHub = Pick<StudioEventHubApi, "publish">;
type OperationPublisher = (event: StudioOperationEvent) => void;
type RunInGameOperationEvent = Extract<StudioOperationEvent, { kind: "run-in-game" }>;
type SaveDeployOperationEvent = Extract<StudioOperationEvent, { kind: "save-deploy" }>;
export type StudioOperationsCurrent = Readonly<{
  ok: true;
  serverInstanceId: string;
  serverStartedAt: string;
  observedAt: string;
  runInGame: Readonly<{
    active: RunInGameOperationState | null;
    recent: readonly RunInGameOperationState[];
  }>;
  saveDeploy: Readonly<{
    active: SaveDeployEngineResult | null;
    recent: readonly SaveDeployEngineResult[];
  }>;
}>;

/**
 * The studio's stateful server engines — the one place long-running Civ7
 * operations (run-in-game, save/deploy, autoplay) execute and are tracked.
 *
 * Contract: engines serialize through a process-wide operation queue (one
 * Civ7-mutating operation at a time), record progress in TTL-bounded
 * operation stores keyed by request id, and throw `StudioEngineError`
 * (legacy HTTP status + structured `details`) for every client-visible
 * failure — transports map it 1:1, so error codes stay stable across the
 * Vite middleware and Bun daemon mounts.
 */
export interface StudioEngines {
  /** Process-lifetime identity — clients reconcile run-in-game state against it. */
  readonly serverInstanceId: string;
  readonly serverStartedAt: string;
  readonly repoRoot: string;
  runAutoplayEngine(action: "start" | "stop"): Promise<AutoplayEngineResult>;
  runRunInGameStartEngine(body: RunInGameStartEngineBody): Promise<RunInGameStartResult>;
  runRunInGameStatusEngine(requestId: string): RunInGameOperationState;
  runSaveDeployEngine(body: unknown): Promise<SaveDeployEngineResult>;
  runSaveDeployStatusEngine(requestId: string): SaveDeployEngineResult;
  currentOperations(): StudioOperationsCurrent;
}

function publishOperationEvent(eventHub: StudioEngineEventHub, event: StudioOperationEvent): void {
  void eventHub.publish(event).catch((error: unknown) => {
    console.error("[mapgen-studio] failed to publish operation event", error);
  });
}

function createOperationPublisher(
  eventHub: StudioEngineEventHub | undefined
): OperationPublisher | undefined {
  if (!eventHub) return undefined;
  return (event) => publishOperationEvent(eventHub, event);
}

function runInGameStatusForEvent(
  status: RunInGameOperationState
): RunInGameOperationEvent["status"] {
  const { completedPhases, recoveryActions, ...rest } = status;
  return {
    ...rest,
    completedPhases: [...completedPhases],
    ...(recoveryActions === undefined ? {} : { recoveryActions: [...recoveryActions] }),
  };
}

function saveDeployStatusForEvent(
  status: SaveDeployEngineResult
): SaveDeployOperationEvent["status"] {
  const { recoveryActions, ...rest } = status;
  return {
    ...rest,
    ...(recoveryActions === undefined ? {} : { recoveryActions: [...recoveryActions] }),
  };
}

export function createStudioEngines(
  options: Readonly<{ repoRoot: string; eventHub?: StudioEngineEventHub }>
): StudioEngines {
  const { repoRoot } = options;
  const serverStartedAt = new Date().toISOString();
  const serverInstanceId = createCiv7ControlRequestId("studio-server");
  const publishOperation = createOperationPublisher(options.eventHub);

  let studioOperationQueue = Promise.resolve();
  const runInGameOperations = createRunInGameOperationStore({
    serverInstanceId,
    serverStartedAt,
    ttlMs: RUN_IN_GAME_OPERATION_TTL_MS,
    onChange: publishOperation
      ? (status) =>
          publishOperation({
            type: "operation",
            kind: "run-in-game",
            status: runInGameStatusForEvent(status),
            observedAt: status.updatedAt,
          })
      : undefined,
  });
  const saveDeployOperations = createMapConfigSaveDeployOperationStore({
    ttlMs: RUN_IN_GAME_OPERATION_TTL_MS,
    onChange: publishOperation
      ? (status) =>
          publishOperation({
            type: "operation",
            kind: "save-deploy",
            status: saveDeployStatusForEvent(status),
            observedAt: status.updatedAt,
          })
      : undefined,
  });

  async function runAutoplayEngine(action: "start" | "stop"): Promise<AutoplayEngineResult> {
    const activeRunInGame = runInGameOperations.findActive();
    if (activeRunInGame) {
      throw new StudioEngineError(
        409,
        "Run in Game is running; wait for it to finish before changing autoplay.",
        {
          code: "run-in-game-operation-active",
          activeRequestId: activeRunInGame.requestId,
          activePhase: activeRunInGame.phase,
        }
      );
    }
    const activeSaveDeploy = saveDeployOperations.findActive();
    if (activeSaveDeploy) {
      throw new StudioEngineError(
        409,
        "Save/Deploy is running; wait for it to finish before changing autoplay.",
        {
          code: "save-deploy-operation-active",
          activeRequestId: activeSaveDeploy.requestId,
          activePhase: activeSaveDeploy.phase,
        }
      );
    }
    const opts = {
      timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
      waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
      pollIntervalMs: 1_000,
    };
    const result = await (action === "start"
      ? startCiv7Autoplay(opts)
      : stopCiv7Autoplay(opts)
    ).catch((err: unknown) => {
      throw unavailableEngineDependency(
        `Civ7 autoplay ${action} is unavailable`,
        "civ7-autoplay-unavailable",
        err,
        { action }
      );
    });
    return {
      ok: result.verified,
      action,
      autoplay: result.after.autoplay,
      game: result.after.game,
      gameContext: result.after.gameContext,
      result,
    };
  }

  /**
   * The Run-in-Game orchestrator: validate the request, materialize the map
   * config + generated script, build-and-deploy the swooper mod, prove the
   * deployed script carries this run's materialization markers (request id /
   * config hash / envelope hash / native river markers — the correctness
   * boundary: a launch must never run a stale script), restart or exit Civ7
   * to shell as needed, start the prepared single-player game, and wait for
   * the in-game mapgen log proof. Progress is recorded phase-by-phase in the
   * operation store under the request id; duplicate requests return the
   * already-tracked operation instead of double-launching.
   */
  async function runRunInGameStartEngine(
    body: RunInGameStartEngineBody
  ): Promise<RunInGameStartResult> {
    let parsedRequest: ReturnType<typeof parseRunInGameSetupRequest>;
    try {
      parsedRequest = parseRunInGameSetupRequest(body);
    } catch (err) {
      throw new StudioEngineError(
        400,
        err instanceof Error ? err.message : "Invalid Run in Game request",
        { code: "run-in-game-request-invalid" }
      );
    }
    const selected = body.selectedConfig ?? {};
    const { requestedMode, id, seed, mapSize, playerCount, restartCivProcess, setupConfig } =
      parsedRequest;
    const configHash = stableHash(body.config);
    const envelope = makeRepoMapEnvelope({
      id,
      name: typeof selected.label === "string" ? selected.label : id,
      description: typeof selected.description === "string" ? selected.description : undefined,
      sortIndex:
        typeof selected.sortIndex === "number"
          ? selected.sortIndex
          : requestedMode === "disposable"
            ? 9999
            : 900,
      latitudeBounds: selected.latitudeBounds,
      config: body.config,
    });
    assertRepoMapEnvelope(envelope, id);
    const envelopeHash = stableHash({
      id,
      recipe: "standard",
      latitudeBounds: selected.latitudeBounds ?? null,
      configHash,
    });
    const sourceSnapshotIdentityHash =
      body.sourceSnapshot === undefined
        ? undefined
        : stableHash({ sourceSnapshot: body.sourceSnapshot, configHash, envelopeHash });
    const requestFingerprint = stableHash({
      recipeId: "mod-swooper-maps/standard",
      seed,
      mapSize,
      playerCount: playerCount ?? null,
      resources: typeof body.resources === "string" ? body.resources : null,
      selectedConfigId: typeof selected.id === "string" ? selected.id : null,
      setupConfig,
      materializationMode: requestedMode,
      configHash,
      envelopeHash,
      sourceSnapshotIdentityHash: sourceSnapshotIdentityHash ?? null,
    });
    const activeOperation = runInGameOperations.findActive();
    if (activeOperation) {
      if (activeOperation.request?.fingerprint === requestFingerprint) {
        return {
          kind: "duplicate",
          operation: {
            ...activeOperation,
            details: {
              ...activeOperation.details,
              duplicateRequest: true,
              code: "run-in-game-operation-active",
              activeRequestId: activeOperation.requestId,
            },
          },
        };
      }
      throw new StudioEngineError(
        409,
        "Another Run in Game request is already running; wait for it to finish before launching a different config.",
        {
          code: "run-in-game-operation-active",
          activeRequestId: activeOperation.requestId,
          activePhase: activeOperation.phase,
        }
      );
    }
    const activeSaveDeploy = saveDeployOperations.findActive();
    if (activeSaveDeploy) {
      throw new StudioEngineError(
        409,
        "Save/Deploy is running; wait for it to finish before Run in Game.",
        {
          code: "save-deploy-operation-active",
          activeRequestId: activeSaveDeploy.requestId,
          activePhase: activeSaveDeploy.phase,
        }
      );
    }
    const requestId = createCiv7ControlRequestId("studio-run-in-game");
    const sourceSnapshotProof = buildRunInGameSourceSnapshotProof({
      requestId,
      sourceSnapshot: body.sourceSnapshot,
      configHash,
      envelopeHash,
    });
    const requestStatus: RunInGameRequestStatus = {
      recipeId: "mod-swooper-maps/standard",
      seed,
      mapSize,
      ...(playerCount === undefined ? {} : { playerCount }),
      ...(typeof body.resources === "string" ? { resources: body.resources } : {}),
      ...(typeof selected.id === "string" ? { selectedConfigId: selected.id } : {}),
      setupConfig,
      materializationMode: requestedMode,
      ...(restartCivProcess ? { restartCivProcess } : {}),
      fingerprint: requestFingerprint,
      ...(sourceSnapshotProof ? { sourceSnapshot: sourceSnapshotProof } : {}),
    };
    const operation = runInGameOperations.create(requestId, requestStatus);
    const run = async () => {
      let materialized: Awaited<ReturnType<typeof materializeRunInGameConfig>> | undefined;
      let materialization: RunInGameOperationState["materialization"] = {
        mode: requestedMode,
        configHash,
        envelopeHash,
      };
      let phase: RunInGamePhase = "materializing";
      try {
        runInGameOperations.update(requestId, { phase });
        materialized = await materializeRunInGameConfig({
          repoRoot,
          id,
          sourcePath:
            requestedMode === "durable" && typeof selected.sourcePath === "string"
              ? selected.sourcePath
              : undefined,
          envelope,
          mode: requestedMode,
        });
        materialization = {
          mode: requestedMode,
          path: materialized.path,
          mapScript: materialized.mapScript,
          configHash,
          envelopeHash,
          ...(await optionalFileIdentity({ repoRoot, path: materialized.path }).then(
            (sourceConfig) => (sourceConfig ? { sourceConfig } : {})
          )),
        };
        runInGameOperations.update(requestId, { materialization });

        const scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
        const scriptingSnapshot = await snapshotFile(scriptingLogPath);

        phase = "deploying";
        runInGameOperations.update(requestId, { phase, materialization });
        let deploy;
        deploy = await deploySwooperMapsForRun(repoRoot, requestId);
        const generatedSourceScript = await optionalFileIdentity({
          repoRoot,
          path: generatedSourceScriptPath(repoRoot, id),
        });
        const localModScript = await optionalFileIdentity({
          repoRoot,
          path: localModScriptPath(repoRoot, id),
        });
        const deployedModScript = deploy.targetDir
          ? await optionalFileIdentity({
              repoRoot,
              path: deployedModScriptPath(deploy.targetDir, id),
              exposeAs: "absolute",
            })
          : undefined;
        // Materialization CONTENT proof (rivers-era correctness boundary):
        // the request/config/envelope markers — including the native-river
        // markers — must be present in the local AND deployed map JS before
        // Civ launches, or the in-game proof could never bind to this run.
        const requiredMaterializationMarkers = runInGameRequiredMaterializationMarkers({
          requestId,
          configHash,
          envelopeHash,
        });
        const localModScriptContent = await optionalFileContentMarkerProof({
          repoRoot,
          path: localModScriptPath(repoRoot, id),
          markers: requiredMaterializationMarkers,
        });
        const deployedModScriptContent = deploy.targetDir
          ? await optionalFileContentMarkerProof({
              repoRoot,
              path: deployedModScriptPath(deploy.targetDir, id),
              exposeAs: "absolute",
              markers: requiredMaterializationMarkers,
            })
          : undefined;
        materialization = {
          ...materialization,
          ...(generatedSourceScript ? { generatedSourceScript } : {}),
          ...(localModScript ? { localModScript } : {}),
          ...(deployedModScript ? { deployedModScript } : {}),
          ...(localModScriptContent ? { localModScriptContent } : {}),
          ...(deployedModScriptContent ? { deployedModScriptContent } : {}),
        };
        runInGameOperations.update(requestId, { phase, materialization });
        const materializationScriptUnresolvedLinks = runInGameMaterializationScriptUnresolvedLinks({
          materialization,
          localModScript,
          deployedModScript,
          requiredMarkers: requiredMaterializationMarkers,
        });
        if (materializationScriptUnresolvedLinks.length > 0) {
          throw new StudioEngineError(
            500,
            "Generated Swooper map script is missing current materialization proof markers",
            {
              code: "map-script-materialization-proof-missing",
              unresolvedLinks: materializationScriptUnresolvedLinks,
              materialization,
            }
          );
        }

        // Fail fast if the freshly built bundle does not embed this request's
        // id. The in-game [mapgen-proof] line echoes the embedded id and the
        // proof waiter matches on it — a bundle without it (the turbo
        // cached/strict-env regression) would otherwise zombie in
        // "waiting-for-proof" until the log timeout while the game plays on.
        const localBundlePath = localModScriptPath(repoRoot, id);
        const localBundleText = await readFile(localBundlePath, "utf8").catch(() => "");
        if (!mapScriptEmbedsRequestId(localBundleText, requestId)) {
          throw new StudioEngineError(
            500,
            "Deployed map bundle does not embed the Run in Game request id; the in-game proof could never match.",
            {
              code: "run-request-id-not-materialized",
              requestId,
              mapScript: materialized.mapScript,
              localModScript: relative(repoRoot, localBundlePath),
              recoveryHint:
                "Rebuild map artifacts (gen:maps must see SWOOPER_STUDIO_RUN_ID; check the nx env input/cache for mod-swooper-maps:build), then retry the run.",
              materialization,
            }
          );
        }

        let processRestart;
        if (restartCivProcess) {
          phase = "restarting-civ";
          runInGameOperations.update(requestId, { phase, materialization });
          processRestart = await restartCiv7ProcessViaSteam();
          runInGameOperations.update(requestId, { phase, materialization, processRestart });
        }

        phase = "checking-civ7";
        runInGameOperations.update(requestId, { phase, materialization });
        await getCiv7PlayableStatus({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }).catch((err) => {
          throw new StudioEngineError(503, "Civ7 direct-control status is unavailable", {
            code: "direct-control-status-unavailable",
            cause: cloneForJson(err instanceof Civ7DirectControlError ? err.details : err),
            materialization,
          });
        });

        const launchMapScript = materialized.mapScript;
        const rowVisibility = await ensureCiv7SetupMapRowVisible(
          {
            file: launchMapScript,
            limit: 20,
            reloadIfMissing: requestedMode === "disposable" ? "exit-to-shell" : "none",
            waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
            pollIntervalMs: 1_000,
          },
          { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }
        );
        if (rowVisibility.refreshed) {
          phase = "reload-needed";
          runInGameOperations.update(requestId, { phase, materialization });
        }
        const rowProof = rowVisibility.final;
        if (rowProof.rows.length === 0) {
          throw new StudioEngineError(409, `Civ7 setup cannot see ${launchMapScript}`, {
            code: "setup-map-row-not-visible",
            reloadRequired: true,
            reloadBoundary:
              requestedMode === "disposable" ? "process-restart-required" : "setup-row-missing",
            reloadAttempted: rowVisibility.refreshed,
            mapScript: launchMapScript,
            materialization: { mode: requestedMode, path: materialized.path },
          });
        }

        phase = "preparing-setup";
        runInGameOperations.update(requestId, { phase, materialization });

        phase = "starting-game";
        runInGameOperations.update(requestId, { phase, materialization });
        const start = await runCiv7SinglePlayerFromSetup(
          {
            mapScript: launchMapScript,
            mapSize,
            seed,
            gameSeed: seed,
            ...(playerCount === undefined ? {} : { playerCount }),
            ...(setupConfig.savedConfig === undefined
              ? {}
              : { savedConfig: setupConfig.savedConfig }),
            options: setupConfig.gameOptions,
            playerOptions: setupConfig.playerOptions,
            fromRunningGame: "exit-to-shell",
            waitForTuner: true,
            waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
          },
          { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }
        ).catch(async (err: unknown) => {
          const mapgenFailure = await waitForCiv7MapgenLogFailure({
            readFreshLogText: () => readFreshLogText(scriptingLogPath, scriptingSnapshot),
            sleep,
            timeoutMs: SCRIPTING_LOG_FAILURE_GRACE_MS,
            pollIntervalMs: SCRIPTING_LOG_FAILURE_POLL_INTERVAL_MS,
            mapScript: launchMapScript,
          });
          if (mapgenFailure) {
            throw new StudioEngineError(500, mapgenFailure.message, {
              ...mapgenFailure,
              materialization,
              cause: cloneForJson(err instanceof Civ7DirectControlError ? err.details : err),
            });
          }
          throw unavailableEngineDependency(
            "Civ7 direct-control start is unavailable",
            "direct-control-start-unavailable",
            err,
            { materialization }
          );
        });

        phase = "waiting-for-proof";
        runInGameOperations.update(requestId, { phase, materialization });
        const logMarkerProof = await waitForFreshLogMarkers({
          logPath: scriptingLogPath,
          snapshot: scriptingSnapshot,
          markers: ["[mapgen-proof]", requestId, configHash, envelopeHash, "[mapgen-complete]"],
          timeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
          rejectPattern: /\b(?:TextEncoder|Uncaught|Exception|Error)\b/i,
        }).catch(async (err: unknown) => {
          const mapgenFailure = await waitForCiv7MapgenLogFailure({
            readFreshLogText: () => readFreshLogText(scriptingLogPath, scriptingSnapshot),
            sleep,
            timeoutMs: SCRIPTING_LOG_FAILURE_GRACE_MS,
            pollIntervalMs: SCRIPTING_LOG_FAILURE_POLL_INTERVAL_MS,
            mapScript: launchMapScript,
          });
          if (mapgenFailure) {
            throw new StudioEngineError(500, mapgenFailure.message, {
              ...mapgenFailure,
              materialization,
              cause: err instanceof Error ? err.message : String(err),
            });
          }
          throw unavailableEngineDependency(
            "Civ7 mapgen log proof is unavailable",
            "direct-control-proof-unavailable",
            err,
            { materialization }
          );
        });
        const freshLogText = await readFreshLogText(scriptingLogPath, scriptingSnapshot).catch(
          () => ""
        );
        const logProof = parseSwooperMapgenLogProof({
          text: freshLogText,
          logPath: logMarkerProof.logPath,
          observedAt: logMarkerProof.observedAt,
          requestId,
          configHash,
          envelopeHash,
          seed,
        });
        if (!logProof) {
          throw new StudioEngineError(
            500,
            "Swooper log proof payload did not match the Studio Run in Game request",
            {
              code: "swooper-log-proof-missing",
              requestId,
              configHash,
              envelopeHash,
              seed,
              markers: logMarkerProof.matched,
              materialization,
            }
          );
        }
        const liveRuntimeStatus = start.start.mapSummary
          ? buildLiveRuntimeStatusState({
              body: {
                ok: true,
                observedAt: new Date().toISOString(),
                status: { readiness: "running-game" },
                mapSummary: start.start.mapSummary,
              },
              observedAtFallback: new Date().toISOString(),
            })
          : undefined;
        const exactAuthorshipProof = buildRunInGameExactAuthorshipProof({
          requestId,
          request: requestStatus,
          sourceSnapshot: sourceSnapshotProof,
          materialization,
          sourceConfig: materialization.sourceConfig,
          generatedSourceScript: materialization.generatedSourceScript,
          localModScript: materialization.localModScript,
          deployedModScript: materialization.deployedModScript,
          rowProof,
          setupSnapshot: start.prepare.after.snapshot,
          startMapSummary: start.start.mapSummary,
          logProof,
          ...(liveRuntimeStatus
            ? {
                liveRuntimeSnapshot: {
                  ...(liveRuntimeStatus.snapshotId
                    ? { snapshotId: liveRuntimeStatus.snapshotId }
                    : {}),
                  ...(liveRuntimeStatus.snapshotHash
                    ? { snapshotHash: liveRuntimeStatus.snapshotHash }
                    : {}),
                  ...(liveRuntimeStatus.turn === undefined ? {} : { turn: liveRuntimeStatus.turn }),
                  ...(liveRuntimeStatus.gameHash === undefined
                    ? {}
                    : { gameHash: liveRuntimeStatus.gameHash }),
                },
              }
            : {}),
        });

        runInGameOperations.complete(
          requestId,
          {
            ok: true,
            requestId,
            materialization,
            deploy,
            ...(processRestart === undefined ? {} : { processRestart }),
            rowProof,
            rowVisibility,
            start,
            logMarkerProof,
            logProof,
            exactAuthorshipProof,
          },
          materialization,
          exactAuthorshipProof
        );
      } catch (err) {
        runInGameOperations.fail(requestId, phase, err, materialization);
      } finally {
        try {
          await materialized?.cleanup();
        } finally {
          await regenerateSwooperMapArtifacts(repoRoot);
        }
      }
    };
    const nextRun = studioOperationQueue.then(run, run);
    studioOperationQueue = nextRun.then(
      () => undefined,
      () => undefined
    );
    return { kind: "accepted", operation };
  }

  function runRunInGameStatusEngine(requestId: string): RunInGameOperationState {
    const status = runInGameOperations.get(requestId);
    if (!status) {
      throw new StudioEngineError(404, `Run in Game request not found: ${requestId}`, {
        code: "run-in-game-request-not-found",
      });
    }
    return status;
  }

  async function runSaveDeployEngine(body: unknown): Promise<SaveDeployEngineResult> {
    let parsedRequest: ReturnType<typeof parseMapConfigSaveRequest>;
    try {
      parsedRequest = parseMapConfigSaveRequest(
        body as Parameters<typeof parseMapConfigSaveRequest>[0]
      );
    } catch (err) {
      throw invalidEngineRequest(
        err instanceof Error ? err.message : "Invalid Save/Deploy request",
        "save-deploy-request-invalid"
      );
    }
    const activeRunInGame = runInGameOperations.findActive();
    if (activeRunInGame) {
      throw new StudioEngineError(
        409,
        "Run in Game is running; wait for it to finish before Save/Deploy.",
        {
          code: "run-in-game-operation-active",
          activeRequestId: activeRunInGame.requestId,
          activePhase: activeRunInGame.phase,
        }
      );
    }
    const activeSaveDeploy = saveDeployOperations.findActive();
    if (activeSaveDeploy && activeSaveDeploy.requestId !== parsedRequest.requestId) {
      throw new StudioEngineError(409, "Save/Deploy is already running.", {
        code: "save-deploy-operation-active",
        activeRequestId: activeSaveDeploy.requestId,
        activePhase: activeSaveDeploy.phase,
      });
    }
    if (activeSaveDeploy && activeSaveDeploy.requestId === parsedRequest.requestId) {
      return activeSaveDeploy;
    }
    assertRepoMapEnvelope(parsedRequest.envelope, parsedRequest.id);
    const configRoot = resolve(repoRoot, "mods/mod-swooper-maps/src/maps/configs");
    const target = parsedRequest.sourcePath
      ? resolve(repoRoot, parsedRequest.sourcePath)
      : resolve(configRoot, `${parsedRequest.id}.config.json`);
    if (!target.startsWith(`${configRoot}/`) || !target.endsWith(".config.json")) {
      throw invalidEngineRequest(
        "Map config writes must stay in mods/mod-swooper-maps/src/maps/configs",
        "map-config-path-outside-config-root",
        { sourcePath: parsedRequest.sourcePath }
      );
    }
    const path = relative(repoRoot, target);
    const requestId = parsedRequest.requestId ?? createCiv7ControlRequestId("studio-save-deploy");
    const operation = saveDeployOperations.create(requestId);
    const run = async () => {
      let phase: "saving" | "deploying" = "saving";
      let previous: string | null = null;
      try {
        saveDeployOperations.update(requestId, { phase, path });
        previous = await readFile(target, "utf8").catch((err: unknown) => {
          if (isNodeNotFound(err)) return null;
          throw unavailableEngineDependency(
            "Unable to read existing map config before Save/Deploy",
            "save-deploy-existing-config-unavailable",
            err,
            { path, sourcePath: parsedRequest.sourcePath }
          );
        });
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, `${JSON.stringify(parsedRequest.envelope, null, 2)}\n`);
        phase = "deploying";
        saveDeployOperations.update(requestId, { phase, path, saved: true });
        let deploy;
        deploy = await deploySwooperMaps(repoRoot);
        saveDeployOperations.complete(requestId, { path, saved: true, deployed: true, deploy });
      } catch (err) {
        const error = err instanceof Error ? err.message : "Deploy failed";
        let rollbackFailure: unknown;
        if (phase === "deploying") {
          try {
            await restoreRepoConfig(target, previous);
          } catch (restoreErr) {
            rollbackFailure = restoreErr;
          }
        }
        saveDeployOperations.fail(requestId, phase, error, {
          path,
          saved: false,
          deployed: false,
          details: {
            ...engineDetails(err),
            ...(rollbackFailure === undefined
              ? {}
              : { rollbackFailure: cloneForJson(rollbackFailure) }),
          },
        });
      }
    };
    const nextRun = studioOperationQueue.then(run, run);
    studioOperationQueue = nextRun.then(
      () => undefined,
      () => undefined
    );
    return operation;
  }

  function runSaveDeployStatusEngine(requestId: string): SaveDeployEngineResult {
    const status = saveDeployOperations.get(requestId);
    if (!status) {
      throw new StudioEngineError(404, `Save/Deploy request not found: ${requestId}`, {
        code: "save-deploy-request-not-found",
      });
    }
    return status;
  }

  function currentOperations(): StudioOperationsCurrent {
    const runInGameRecent = runInGameOperations.list();
    const saveDeployRecent = saveDeployOperations.list();
    return {
      ok: true,
      serverInstanceId,
      serverStartedAt,
      observedAt: new Date().toISOString(),
      runInGame: {
        active: runInGameRecent.find((operation) => operation.status === "running") ?? null,
        recent: runInGameRecent,
      },
      saveDeploy: {
        active: saveDeployRecent.find((operation) => operation.status === "running") ?? null,
        recent: saveDeployRecent,
      },
    };
  }

  return {
    serverInstanceId,
    serverStartedAt,
    repoRoot,
    runAutoplayEngine,
    runRunInGameStartEngine,
    runRunInGameStatusEngine,
    runSaveDeployEngine,
    runSaveDeployStatusEngine,
    currentOperations,
  };
}
