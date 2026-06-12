import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { promisify } from "node:util";
import {
  Civ7DirectControlError,
  DEFAULT_CIV7_SCRIPTING_LOG,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  createCiv7ControlRequestId,
  getCiv7PlayableStatus,
  getCiv7SetupSnapshot,
  ensureCiv7SetupMapRowVisible,
  runCiv7SinglePlayerFromSetup,
  startCiv7Autoplay,
  stopCiv7Autoplay,
  logTextFromSnapshot,
  snapshotFile,
  waitForFreshLogMarkers,
} from "@civ7/direct-control";

import {
  RunInGameHttpError,
  createRunInGameOperationStore,
  type RunInGameOperationState,
} from "../runInGame/operationState";
import { waitForCiv7MapgenLogFailure } from "../runInGame/logFailure";
import {
  buildRunInGameExactAuthorshipProof,
  buildRunInGameSourceSnapshotProof,
  fileIdentity,
  parseDeployTargetDir,
  parseSwooperMapgenLogProof,
} from "../runInGame/proofIdentity";
import { parseRunInGameSetupRequest } from "../runInGame/requestValidation";
import {
  launchCiv7MacViaSteamWithRetries,
  shutdownCiv7MacProcess,
} from "../runInGame/macosProcessRestart";
import { buildSwooperMapsStudioDeployCommand } from "../mapConfigs/deploy";
import { createMapConfigSaveDeployOperationStore } from "../mapConfigs/operationState";
import { parseMapConfigSaveRequest } from "../mapConfigs/requestValidation";
import type { RunInGamePhase, RunInGameRequestStatus } from "../../features/runInGame/status";
import { buildLiveRuntimeStatusState } from "../../features/liveRuntime/model";

// ============================================================================
// Studio engines — the stateful server core (bun-server workstream, slice 2)
// ----------------------------------------------------------------------------
// Moved VERBATIM out of `vite.config.ts` module scope: the serialized operation
// queue, both operation stores (the dual-store 409 mutex), the server instance
// identity, and the five engine functions (autoplay, run-in-game start/status,
// save-deploy start/status). `createStudioEngines` owns ALL process-singleton
// server state — exactly one instance may exist per server process, shared by
// every transport (the `/rpc` oRPC mount and the legacy `/api/*` handlers), or
// the queue/mutex semantics diverge (architecture/10 §7).
//
// Each engine returns the SAME success body the legacy `/api` handler wrote, or
// THROWS:
//   - `RunInGameHttpError` (carries statusCode + details) — used as-is, also
//     for the autoplay/save-deploy 409 mutex + run-in-game/save-deploy 404.
//   - a plain `Error` — validation/save failures (mapped to 400 by the caller).
// The `/api` middleware adapts return/throw → `res`; the oRPC context adapts
// return/throw → value/ORPCError (./context.ts, `orpcError` mapping).
//
// IMPORT CONSTRAINT (load-bearing): this module is statically imported by
// `vite.config.ts`, so its import graph must stay node-evaluable — never
// import `effect-orpc` (TS-source package entry) or anything that does outside
// a bundled dist. `@civ7/direct-control` + local server modules only.
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
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

async function readFreshLogText(logPath: string, snapshot: Awaited<ReturnType<typeof snapshotFile>>): Promise<string> {
  const current = await snapshotFile(logPath);
  if (!current.exists) return "";
  const fullText = await readFile(logPath, "utf8");
  return logTextFromSnapshot({ fullText, snapshot, current }).text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    throw new Error("Civ7 process restart from Studio is currently supported on macOS only");
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
  });
  const launch = steamLaunch.attempts[steamLaunch.attempts.length - 1]?.launch;
  if (!launch) throw new Error("Civ7 Steam launch did not record an attempt");

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
    throw new Error(`Civ7 process restarted but setup shell was not ready within ${CIV7_PROCESS_RESTART_WAIT_TIMEOUT_MS}ms`);
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

async function deploySwooperMaps(repoRoot: string): Promise<{
  command: string;
  stdout: string;
  stderr: string;
}> {
  const deploy = buildSwooperMapsStudioDeployCommand();
  const { stdout, stderr } = await execFileAsync("bun", [...deploy.args], {
    cwd: repoRoot,
    timeout: DEPLOY_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    env: deploy.env,
  });
  return {
    command: deploy.command,
    stdout: tail(stdout),
    stderr: tail(stderr),
  };
}

async function deploySwooperMapsForRun(repoRoot: string, requestId: string): Promise<{
  command: string;
  stdout: string;
  stderr: string;
  targetDir?: string;
}> {
  const deploy = buildSwooperMapsStudioDeployCommand({ requestId });
  const { stdout, stderr } = await execFileAsync("bun", [...deploy.args], {
    cwd: repoRoot,
    timeout: DEPLOY_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    env: deploy.env,
  });
  const targetDir = parseDeployTargetDir(stdout);
  return {
    command: deploy.command,
    stdout: tail(stdout),
    stderr: tail(stderr),
    ...(targetDir ? { targetDir } : {}),
  };
}

async function optionalFileIdentity(args: {
  repoRoot: string;
  path: string;
  exposeAs?: "relative-to-repo" | "absolute";
}) {
  return await fileIdentity(args).catch(() => undefined);
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
    throw new Error("Map config envelope must be a JSON object");
  }
  const record = envelope as Record<string, unknown>;
  if (record.id !== id) throw new Error("Map config envelope id must match the requested id");
  if (typeof record.name !== "string" || record.name.trim().length === 0) {
    throw new Error("Map config name must be non-empty");
  }
  if (typeof record.description !== "string" || record.description.trim().length === 0) {
    throw new Error("Map config description must be non-empty");
  }
  if (record.recipe !== "standard") throw new Error('Map config recipe must be "standard"');
  if (!Number.isInteger(record.sortIndex))
    throw new Error("Map config sortIndex must be an integer");
  if (!record.config || typeof record.config !== "object" || Array.isArray(record.config)) {
    throw new Error("Map config payload must be a JSON object");
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
    throw new Error("Map config writes must stay in mods/mod-swooper-maps/src/maps/configs");
  }
  const path = relative(args.repoRoot, target);
  const previous = await readFile(target, "utf8").catch((err: unknown) => {
    if (isNodeNotFound(err)) return null;
    throw err;
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
  return JSON.parse(JSON.stringify(value));
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
}

export function createStudioEngines(options: Readonly<{ repoRoot: string }>): StudioEngines {
  const { repoRoot } = options;
  const serverStartedAt = new Date().toISOString();
  const serverInstanceId = createCiv7ControlRequestId("studio-server");

  let studioOperationQueue = Promise.resolve();
  const runInGameOperations = createRunInGameOperationStore({
    serverInstanceId,
    serverStartedAt,
    ttlMs: RUN_IN_GAME_OPERATION_TTL_MS,
  });
  const saveDeployOperations = createMapConfigSaveDeployOperationStore({
    ttlMs: RUN_IN_GAME_OPERATION_TTL_MS,
  });

  async function runAutoplayEngine(action: "start" | "stop"): Promise<AutoplayEngineResult> {
    const activeRunInGame = runInGameOperations.findActive();
    if (activeRunInGame) {
      throw new RunInGameHttpError(
        409,
        "Run in Game is running; wait for it to finish before changing autoplay.",
        {
          code: "run-in-game-operation-active",
          activeRequestId: activeRunInGame.requestId,
          activePhase: activeRunInGame.phase,
        },
      );
    }
    const activeSaveDeploy = saveDeployOperations.findActive();
    if (activeSaveDeploy) {
      throw new RunInGameHttpError(
        409,
        "Save/Deploy is running; wait for it to finish before changing autoplay.",
        {
          code: "save-deploy-operation-active",
          activeRequestId: activeSaveDeploy.requestId,
          activePhase: activeSaveDeploy.phase,
        },
      );
    }
    const opts = {
      timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
      waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
      pollIntervalMs: 1_000,
    };
    const result =
      action === "start"
        ? await startCiv7Autoplay(opts)
        : await stopCiv7Autoplay(opts);
    return {
      ok: result.verified,
      action,
      autoplay: result.after.autoplay,
      game: result.after.game,
      gameContext: result.after.gameContext,
      result,
    };
  }

  async function runRunInGameStartEngine(
    body: RunInGameStartEngineBody,
  ): Promise<RunInGameStartResult> {
    let parsedRequest: ReturnType<typeof parseRunInGameSetupRequest>;
    try {
      parsedRequest = parseRunInGameSetupRequest(body);
    } catch (err) {
      throw new RunInGameHttpError(
        400,
        err instanceof Error ? err.message : "Invalid Run in Game request",
        { code: "run-in-game-request-invalid" },
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
      throw new RunInGameHttpError(
        409,
        "Another Run in Game request is already running; wait for it to finish before launching a different config.",
        {
          code: "run-in-game-operation-active",
          activeRequestId: activeOperation.requestId,
          activePhase: activeOperation.phase,
        },
      );
    }
    const activeSaveDeploy = saveDeployOperations.findActive();
    if (activeSaveDeploy) {
      throw new RunInGameHttpError(
        409,
        "Save/Deploy is running; wait for it to finish before Run in Game.",
        {
          code: "save-deploy-operation-active",
          activeRequestId: activeSaveDeploy.requestId,
          activePhase: activeSaveDeploy.phase,
        },
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
            (sourceConfig) => (sourceConfig ? { sourceConfig } : {}),
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
        materialization = {
          ...materialization,
          ...(generatedSourceScript ? { generatedSourceScript } : {}),
          ...(localModScript ? { localModScript } : {}),
          ...(deployedModScript ? { deployedModScript } : {}),
        };
        runInGameOperations.update(requestId, { phase, materialization });

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
          throw new RunInGameHttpError(503, "Civ7 direct-control status is unavailable", {
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
          { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS },
        );
        if (rowVisibility.refreshed) {
          phase = "reload-needed";
          runInGameOperations.update(requestId, { phase, materialization });
        }
        const rowProof = rowVisibility.final;
        if (rowProof.rows.length === 0) {
          throw new RunInGameHttpError(409, `Civ7 setup cannot see ${launchMapScript}`, {
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
            ...(setupConfig.savedConfig === undefined ? {} : { savedConfig: setupConfig.savedConfig }),
            options: setupConfig.gameOptions,
            playerOptions: setupConfig.playerOptions,
            fromRunningGame: "exit-to-shell",
            waitForTuner: true,
            waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
          },
          { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS },
        ).catch(async (err: unknown) => {
          const mapgenFailure = await waitForCiv7MapgenLogFailure({
            readFreshLogText: () => readFreshLogText(scriptingLogPath, scriptingSnapshot),
            sleep,
            timeoutMs: SCRIPTING_LOG_FAILURE_GRACE_MS,
            pollIntervalMs: SCRIPTING_LOG_FAILURE_POLL_INTERVAL_MS,
            mapScript: launchMapScript,
          });
          if (mapgenFailure) {
            throw new RunInGameHttpError(500, mapgenFailure.message, {
              ...mapgenFailure,
              materialization,
              cause: cloneForJson(err instanceof Civ7DirectControlError ? err.details : err),
            });
          }
          throw err;
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
            throw new RunInGameHttpError(500, mapgenFailure.message, {
              ...mapgenFailure,
              materialization,
              cause: err instanceof Error ? err.message : String(err),
            });
          }
          throw err;
        });
        const freshLogText = await readFreshLogText(scriptingLogPath, scriptingSnapshot).catch(
          () => "",
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
          throw new RunInGameHttpError(
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
            },
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
          exactAuthorshipProof,
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
      () => undefined,
    );
    return { kind: "accepted", operation };
  }

  function runRunInGameStatusEngine(requestId: string): RunInGameOperationState {
    const status = runInGameOperations.get(requestId);
    if (!status) {
      throw new RunInGameHttpError(404, `Run in Game request not found: ${requestId}`, {
        code: "run-in-game-request-not-found",
      });
    }
    return status;
  }

  async function runSaveDeployEngine(body: unknown): Promise<SaveDeployEngineResult> {
    const parsedRequest = parseMapConfigSaveRequest(body as Parameters<typeof parseMapConfigSaveRequest>[0]);
    const activeRunInGame = runInGameOperations.findActive();
    if (activeRunInGame) {
      throw new RunInGameHttpError(
        409,
        "Run in Game is running; wait for it to finish before Save/Deploy.",
        {
          code: "run-in-game-operation-active",
          activeRequestId: activeRunInGame.requestId,
          activePhase: activeRunInGame.phase,
        },
      );
    }
    const activeSaveDeploy = saveDeployOperations.findActive();
    if (activeSaveDeploy && activeSaveDeploy.requestId !== parsedRequest.requestId) {
      throw new RunInGameHttpError(409, "Save/Deploy is already running.", {
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
      throw new Error("Map config writes must stay in mods/mod-swooper-maps/src/maps/configs");
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
          throw err;
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
        if (phase === "deploying") {
          await restoreRepoConfig(target, previous);
        }
        saveDeployOperations.fail(requestId, phase, error, {
          path,
          saved: false,
          deployed: false,
        });
      }
    };
    const nextRun = studioOperationQueue.then(run, run);
    studioOperationQueue = nextRun.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  function runSaveDeployStatusEngine(requestId: string): SaveDeployEngineResult {
    const status = saveDeployOperations.get(requestId);
    if (!status) {
      throw new RunInGameHttpError(404, `Save/Deploy request not found: ${requestId}`, {
        code: "save-deploy-request-not-found",
      });
    }
    return status;
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
  };
}
