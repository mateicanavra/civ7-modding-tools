import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  Civ7DirectControlError,
  DEFAULT_CIV7_SCRIPTING_LOG,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  createCiv7ControlRequestId,
  getCiv7AppUiSnapshot,
  getCiv7AutoplayStatus,
  getCiv7CitySummary,
  getCiv7GameInfoRows,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7PlayableStatus,
  getCiv7SetupSnapshot,
  getCiv7PlayerSummary,
  getCiv7UnitSummary,
  ensureCiv7SetupMapRowVisible,
  listCiv7SavedGameConfigurations,
  runCiv7SinglePlayerFromSetup,
  startCiv7Autoplay,
  stopCiv7Autoplay,
  logTextFromSnapshot,
  snapshotFile,
  waitForFreshLogMarkers,
} from "@civ7/direct-control";
import { deployMod, resolveModsDir } from "@civ7/plugin-mods";
import { loadCiv7SetupCatalog } from "./src/server/civ7Resources/catalog";
import {
  RunInGameHttpError,
  createRunInGameOperationStore,
  type RunInGameOperationState,
} from "./src/server/runInGame/operationState";
import { waitForCiv7MapgenLogFailure } from "./src/server/runInGame/logFailure";
import {
  buildRunInGameExactAuthorshipProof,
  buildRunInGameSourceSnapshotProof,
  fileIdentity,
  parseSwooperMapgenLogProof,
} from "./src/server/runInGame/proofIdentity";
import { parseRunInGameSetupRequest } from "./src/server/runInGame/requestValidation";
import {
  launchCiv7MacViaSteamWithRetries,
  shutdownCiv7MacProcess,
} from "./src/server/runInGame/macosProcessRestart";
import { buildSwooperMapsStudioDeployPlan } from "./src/server/mapConfigs/deploy";
import { createMapConfigSaveDeployOperationStore } from "./src/server/mapConfigs/operationState";
import { parseMapConfigSaveRequest } from "./src/server/mapConfigs/requestValidation";
import type { RunInGamePhase, RunInGameRequestStatus } from "./src/features/runInGame/status";
import { buildLiveRuntimeStatusState } from "./src/features/liveRuntime/model";
import { handleStudioCiv7ControlOrpcRequest } from "./src/server/civ7ControlOrpc";
import {
  createStudioRpcHandler,
  orpcError,
  type StudioServerContext,
} from "@civ7/studio-server";

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
const STUDIO_SERVER_STARTED_AT = new Date().toISOString();
const STUDIO_SERVER_INSTANCE_ID = createCiv7ControlRequestId("studio-server");

let studioOperationQueue = Promise.resolve();
const runInGameOperations = createRunInGameOperationStore({
  serverInstanceId: STUDIO_SERVER_INSTANCE_ID,
  serverStartedAt: STUDIO_SERVER_STARTED_AT,
  ttlMs: RUN_IN_GAME_OPERATION_TTL_MS,
});
const saveDeployOperations = createMapConfigSaveDeployOperationStore({
  ttlMs: RUN_IN_GAME_OPERATION_TTL_MS,
});

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

async function deploySwooperMapsForRun(repoRoot: string, requestId: string): Promise<{
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
    Boolean(err) &&
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

async function readJsonBody<T>(req: AsyncIterable<Uint8Array>): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T;
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

/**
 * Adapt a Vite/Connect Node request (`IncomingMessage`) to a Web `Request` for the
 * oRPC fetch-adapter `RPCHandler`. The `/rpc` middleware runs before Vite consumes
 * the body, so we buffer it here (oRPC reads the Web `Request` body itself). GET/
 * HEAD carry no body. Host/proto come from headers (dev server is local).
 */
async function nodeRequestToWebRequest(req: import("node:http").IncomingMessage): Promise<Request> {
  const method = req.method ?? "GET";
  const host = (req.headers.host as string | undefined) ?? "localhost";
  // Connect's path-mounted middleware (`use("/rpc", …)`) STRIPS the mount prefix
  // from `req.url`, but the oRPC handler matches against the full `/rpc/...` path
  // (its `prefix`). Use `originalUrl` (the un-rewritten path) so the prefix matches.
  const path = (req as { originalUrl?: string }).originalUrl ?? req.url ?? "/";
  const url = `http://${host}${path}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else headers.set(key, value);
  }
  let body: Buffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    body = Buffer.concat(chunks);
  }
  return new Request(url, {
    method,
    headers,
    ...(body && body.length > 0 ? { body, duplex: "half" } : {}),
  } as RequestInit & { duplex?: "half" });
}

function writeJson(res: { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
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

// ===========================================================================
// Shared studio engines (single source of truth for BOTH transports)
// ---------------------------------------------------------------------------
// The stateful surface (autoplay, run-in-game, save/deploy) shares ONE serialized
// queue (`studioOperationQueue`) and ONE pair of operation stores (the dual-store
// 409 mutex). To keep the legacy `/api/*` handlers AND the new `/rpc` mount alive
// without diverging that state (architecture/10 §7), the engine bodies are lifted
// VERBATIM out of the middleware into these functions. Each returns the SAME
// success body the `/api` handler wrote, or THROWS:
//   - `RunInGameHttpError` (carries statusCode + details) — used as-is, also for
//     the autoplay/save-deploy 409 mutex + run-in-game/save-deploy 404.
//   - a plain `Error` — validation/save failures (mapped to 400 by the caller).
// The `/api` middleware adapts return/throw → `res` (its exact `{ ok:false, error,
// details }` body + status); the oRPC context adapts return/throw → value/ORPCError
// (./src/lib mapping via the studio-server `orpcError` helper).
// ===========================================================================

async function runAutoplayEngine(action: "start" | "stop"): Promise<{
  ok: boolean;
  action: "start" | "stop";
  autoplay: unknown;
  game: unknown;
  gameContext: unknown;
  result: unknown;
}> {
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
  const options = {
    timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
    waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
    pollIntervalMs: 1_000,
  };
  const result =
    action === "start"
      ? await startCiv7Autoplay(options)
      : await stopCiv7Autoplay(options);
  return {
    ok: result.verified,
    action,
    autoplay: result.after.autoplay,
    game: result.after.game,
    gameContext: result.after.gameContext,
    result,
  };
}

type RunInGameStartResult =
  | { kind: "accepted"; operation: RunInGameOperationState }
  | { kind: "duplicate"; operation: RunInGameOperationState };

async function runRunInGameStartEngine(body: {
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
}): Promise<RunInGameStartResult> {
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
  const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
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

type SaveDeployEngineResult = ReturnType<typeof saveDeployOperations.create>;

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
  const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
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

/**
 * Build the `StudioServerContext` the oRPC router consumes — the SAME engines +
 * stores the legacy `/api/*` handlers use (shared state, no divergence). Engine
 * `RunInGameHttpError`s are converted to `ORPCError` with the legacy status +
 * `details`/`observedAt` payload so the non-uniform codes survive the oRPC boundary.
 */
function createStudioServerContextForApp(viteCommand: string): StudioServerContext {
  const toOrpc = (err: unknown, fallbackStatus: number, fallbackMessage: string) => {
    if (err instanceof RunInGameHttpError) {
      return orpcError(
        err.statusCode,
        err.message,
        err.details === undefined ? undefined : { details: err.details },
      );
    }
    return orpcError(fallbackStatus, err instanceof Error ? err.message : fallbackMessage);
  };
  return {
    serverInstanceId: STUDIO_SERVER_INSTANCE_ID,
    serverStartedAt: STUDIO_SERVER_STARTED_AT,
    viteCommand,
    loadSetupCatalog: async () => {
      const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
      // `Civ7SetupCatalog` is deeply `readonly`; the contract's zod-derived catalog
      // type is structurally identical but mutable. Cross the boundary by value
      // (JSON serialization erases readonly); cast to satisfy the seam type.
      return loadCiv7SetupCatalog({ repoRoot }) as unknown as Awaited<
        ReturnType<StudioServerContext["loadSetupCatalog"]>
      >;
    },
    autoplay: async (input) => {
      try {
        return (await runAutoplayEngine(input.action)) as Awaited<
          ReturnType<StudioServerContext["autoplay"]>
        >;
      } catch (err) {
        throw toOrpc(err, 500, "Civ7 autoplay request failed");
      }
    },
    runInGameStart: async (input) => {
      try {
        const result = await runRunInGameStartEngine(input);
        return result.operation as Awaited<ReturnType<StudioServerContext["runInGameStart"]>>;
      } catch (err) {
        throw toOrpc(err, 500, "Run in Game failed");
      }
    },
    runInGameStatus: async (input) => {
      try {
        return runRunInGameStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["runInGameStatus"]>
        >;
      } catch (err) {
        if (err instanceof RunInGameHttpError && err.statusCode === 404) {
          // Parity: run-in-game status 404 echoes serverInstanceId/serverStartedAt.
          throw orpcError(404, err.message, {
            serverInstanceId: STUDIO_SERVER_INSTANCE_ID,
            serverStartedAt: STUDIO_SERVER_STARTED_AT,
          });
        }
        throw toOrpc(err, 500, "Run in Game status failed");
      }
    },
    mapConfigSaveDeploy: async (input) => {
      try {
        return (await runSaveDeployEngine(input)) as Awaited<
          ReturnType<StudioServerContext["mapConfigSaveDeploy"]>
        >;
      } catch (err) {
        // Parity: save/deploy validation failures map to 400 (not 500).
        throw toOrpc(err, 400, "Save failed");
      }
    },
    mapConfigStatus: async (input) => {
      try {
        return runSaveDeployStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["mapConfigStatus"]>
        >;
      } catch (err) {
        // Parity: save/deploy status 404 does NOT echo serverInstanceId.
        throw toOrpc(err, 500, "Save/Deploy status failed");
      }
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: "repo-backed-map-configs",
      configureServer(server) {
        let recipeDagOrpcMiddlewarePromise:
          | Promise<typeof import("./src/server/recipeDag/orpc").handleStudioRecipeDagOrpcRequest>
          | null = null;
        const loadRecipeDagOrpcMiddleware = () => {
          recipeDagOrpcMiddlewarePromise ??= server
            .ssrLoadModule("/src/server/recipeDag/orpc.ts")
            .then((module) => module.handleStudioRecipeDagOrpcRequest);
          return recipeDagOrpcMiddlewarePromise;
        };

        server.middlewares.use(handleStudioCiv7ControlOrpcRequest);
        server.middlewares.use((req, res, next) => {
          void loadRecipeDagOrpcMiddleware().then(
            (middleware) => {
              void middleware(req, res, next);
            },
            next,
          );
        });
        server.middlewares.use("/api/civ7/status", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const status = await getCiv7PlayableStatus({
              timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
            });
            writeJson(res, 200, { ok: status.playable, status });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 status request failed";
            writeJson(res, 500, { ok: false, error });
          }
        });
        server.middlewares.use("/api/civ7/map-summary", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const summary = await getCiv7MapSummary({
              timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
              includeAreaRegionCounts: true,
            });
            writeJson(res, 200, { ok: true, summary });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 map summary request failed";
            writeJson(res, 500, { ok: false, error });
          }
        });
        server.middlewares.use("/api/civ7/gameinfo", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const url = new URL(req.url ?? "", "http://localhost");
            const table = url.searchParams.get("table");
            if (!table) throw new Error("Missing table query parameter");
            const limit = Number(url.searchParams.get("limit") ?? "100");
            const rows = await getCiv7GameInfoRows({
              table,
              limit,
            }, {
              timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
            });
            writeJson(res, 200, { ok: true, rows });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 GameInfo request failed";
            writeJson(res, 400, { ok: false, error });
          }
        });
        server.middlewares.use("/api/civ7/live/status", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const [status, appUi, mapSummary, autoplay] = await Promise.allSettled([
              getCiv7PlayableStatus({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }),
              getCiv7AppUiSnapshot({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }),
              getCiv7MapSummary({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS, includeAreaRegionCounts: false }),
              getCiv7AutoplayStatus({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }),
            ]);
            const playableStatus = status.status === "fulfilled" ? status.value : undefined;
            writeJson(res, 200, {
              ok: Boolean(playableStatus && playableStatus.readiness !== "unavailable"),
              playable: playableStatus?.playable ?? false,
              observedAt: new Date().toISOString(),
              status: playableStatus ?? { error: String(status.reason) },
              appUi: appUi.status === "fulfilled" ? appUi.value : { error: String(appUi.reason) },
              mapSummary: mapSummary.status === "fulfilled" ? mapSummary.value : { error: String(mapSummary.reason) },
              autoplay: autoplay.status === "fulfilled" ? autoplay.value : { error: String(autoplay.reason) },
            });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 live status request failed";
            writeJson(res, 500, { ok: false, error });
          }
        });
        server.middlewares.use("/api/civ7/live/snapshot", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const url = new URL(req.url ?? "", "http://localhost");
            const bounds = {
              x: Number(url.searchParams.get("x") ?? "0"),
              y: Number(url.searchParams.get("y") ?? "0"),
              width: Number(url.searchParams.get("width") ?? "24"),
              height: Number(url.searchParams.get("height") ?? "18"),
            };
            const fields = (url.searchParams.get("fields") ?? "terrain,biome,feature,resource,visibility,owner")
              .split(",")
              .map((field) => field.trim())
              .filter(Boolean) as Parameters<typeof getCiv7MapGrid>[0]["fields"];
            const playerIdParam = url.searchParams.get("playerId");
            const maxPlots = Math.min(512, Math.max(1, Number(url.searchParams.get("maxPlots") ?? "512")));
            const grid = await getCiv7MapGrid({
              bounds,
              fields,
              maxPlots,
              ...(playerIdParam === null ? {} : { playerId: Number(playerIdParam) }),
            }, {
              timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
            });
            writeJson(res, 200, { ok: true, observedAt: new Date().toISOString(), grid });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 live snapshot request failed";
            writeJson(res, 400, { ok: false, error });
          }
        });
        server.middlewares.use("/api/civ7/live/entities", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const url = new URL(req.url ?? "", "http://localhost");
            const playerIdParam = url.searchParams.get("playerId");
            const maxItems = Math.min(128, Math.max(1, Number(url.searchParams.get("maxItems") ?? "128")));
            const playerId = playerIdParam === null ? undefined : Number(playerIdParam);
            const [players, units, cities] = await Promise.all([
              getCiv7PlayerSummary({ ...(playerId === undefined ? {} : { playerIds: [playerId] }), maxItems }, { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }),
              getCiv7UnitSummary({ ...(playerId === undefined ? {} : { playerId }), maxItems }, { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }),
              getCiv7CitySummary({ ...(playerId === undefined ? {} : { playerId }), maxItems }, { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }),
            ]);
            writeJson(res, 200, { ok: true, observedAt: new Date().toISOString(), players, units, cities });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 live entities request failed";
            writeJson(res, 400, { ok: false, error });
          }
        });
        server.middlewares.use("/api/civ7/live/gameinfo", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const url = new URL(req.url ?? "", "http://localhost");
            const tables = (url.searchParams.get("tables") ?? "Terrains,Biomes,Features,Resources,Maps,MapSizes")
              .split(",")
              .map((table) => table.trim())
              .filter(Boolean)
              .slice(0, 8);
            const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? "100")));
            const rows = await Promise.all(
              tables.map(async (table) => [table, await getCiv7GameInfoRows({ table, limit }, { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS })] as const),
            );
            writeJson(res, 200, { ok: true, observedAt: new Date().toISOString(), tables: Object.fromEntries(rows) });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 live GameInfo request failed";
            writeJson(res, 400, { ok: false, error });
          }
        });
        server.middlewares.use("/api/civ7/autoplay", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const body = await readJsonBody<{ action?: unknown }>(req);
            if (body.action !== "start" && body.action !== "stop") {
              writeJson(res, 400, { ok: false, error: 'Autoplay action must be "start" or "stop"' });
              return;
            }
            // Shared engine (also drives the `/rpc` mount) — single source of truth.
            const result = await runAutoplayEngine(body.action);
            writeJson(res, 200, result);
          } catch (err) {
            if (err instanceof RunInGameHttpError) {
              writeJson(res, err.statusCode, {
                ok: false,
                error: err.message,
                ...(err.details === undefined ? {} : { details: err.details }),
              });
              return;
            }
            const error = err instanceof Error ? err.message : "Civ7 autoplay request failed";
            writeJson(res, 500, { ok: false, error });
          }
        });
        server.middlewares.use("/api/studio/server-info", async (req, res, next) => {
          if (req.method !== "GET") return next();
          writeJson(res, 200, {
            ok: true,
            serverInstanceId: STUDIO_SERVER_INSTANCE_ID,
            startedAt: STUDIO_SERVER_STARTED_AT,
            runInGameApiVersion: 2,
            viteCommand: command,
          });
        });
        server.middlewares.use("/api/civ7/setup-config", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const snapshot = await getCiv7SetupSnapshot({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS });
            writeJson(res, 200, {
              ok: true,
              observedAt: new Date().toISOString(),
              setup: snapshot.snapshot,
              state: snapshot.state,
              host: snapshot.host,
              port: snapshot.port,
            });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 setup config unavailable";
            writeJson(res, 503, { ok: false, error, observedAt: new Date().toISOString() });
          }
        });
        server.middlewares.use("/api/civ7/saved-configs", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const result = await listCiv7SavedGameConfigurations();
            writeJson(res, 200, {
              ok: true,
              observedAt: new Date().toISOString(),
              ...result,
            });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 saved configurations unavailable";
            writeJson(res, 500, { ok: false, error, observedAt: new Date().toISOString() });
          }
        });
        server.middlewares.use("/api/civ7/setup-catalog", async (req, res, next) => {
          if (req.method !== "GET") return next();
          try {
            const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
            const catalog = await loadCiv7SetupCatalog({ repoRoot });
            writeJson(res, 200, { ok: true, catalog });
          } catch (err) {
            const error = err instanceof Error ? err.message : "Civ7 setup catalog unavailable";
            writeJson(res, 500, { ok: false, error, observedAt: new Date().toISOString() });
          }
        });
        server.middlewares.use("/api/civ7/run-in-game/status", async (req, res, next) => {
          if (req.method !== "GET") return next();
          const url = new URL(req.url ?? "", "http://localhost");
          const requestId = url.searchParams.get("requestId");
          if (!requestId) {
            writeJson(res, 400, { ok: false, error: "Missing requestId" });
            return;
          }
          try {
            writeJson(res, 200, runRunInGameStatusEngine(requestId));
          } catch {
            // Parity: 404 echoes serverInstanceId/serverStartedAt for restart detection.
            writeJson(res, 404, {
              ok: false,
              error: `Run in Game request not found: ${requestId}`,
              serverInstanceId: STUDIO_SERVER_INSTANCE_ID,
              serverStartedAt: STUDIO_SERVER_STARTED_AT,
            });
          }
        });
        server.middlewares.use("/api/civ7/run-in-game", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const body = await readJsonBody<Parameters<typeof runRunInGameStartEngine>[0]>(req);
            // Shared engine (also drives the `/rpc` mount). Both the accepted and
            // duplicate-request results return 202 with the operation snapshot.
            const result = await runRunInGameStartEngine(body);
            writeJson(res, 202, result.operation);
          } catch (err) {
            const error = err instanceof Error ? err.message : "Run in Game failed";
            const statusCode = err instanceof RunInGameHttpError ? err.statusCode : 500;
            const details = err instanceof RunInGameHttpError ? err.details : undefined;
            writeJson(res, statusCode, {
              ok: false,
              error,
              ...(details === undefined ? {} : { details }),
            });
          }
        });
        server.middlewares.use("/api/map-configs/status", async (req, res, next) => {
          if (req.method !== "GET") return next();
          const url = new URL(req.url ?? "", "http://localhost");
          const requestId = url.searchParams.get("requestId");
          if (!requestId) {
            writeJson(res, 400, { ok: false, error: "Missing requestId" });
            return;
          }
          try {
            // Shared engine. Parity: 404 here does NOT echo serverInstanceId.
            writeJson(res, 200, runSaveDeployStatusEngine(requestId));
          } catch {
            writeJson(res, 404, { ok: false, error: `Save/Deploy request not found: ${requestId}` });
          }
        });
        server.middlewares.use("/api/map-configs", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
            // Shared engine (also drives the `/rpc` mount). Idempotent-active reuse +
            // 409 dual mutex + write-then-deploy + rollback live in the engine.
            const operation = await runSaveDeployEngine(body);
            writeJson(res, 202, operation);
          } catch (err) {
            if (err instanceof RunInGameHttpError) {
              writeJson(res, err.statusCode, {
                ok: false,
                error: err.message,
                ...(err.details === undefined ? {} : { details: err.details }),
              });
              return;
            }
            const error = err instanceof Error ? err.message : "Save failed";
            writeJson(res, 400, { ok: false, error });
          }
        });

        // -------------------------------------------------------------------
        // oRPC RPCHandler mount (slice ServerOrpc). EVERYTHING talks oRPC: this
        // mounts `@civ7/studio-server`'s effect-orpc router at `/rpc` INSIDE the
        // existing Vite dev middleware — alongside the legacy `/api/*` handlers,
        // which stay alive this run (coexistence; cutover is a later supervised
        // step). Both transports share the SAME engines + stores above (no state
        // divergence). The standalone Bun server is DEFERRED (FRAME §4.7).
        // -------------------------------------------------------------------
        const studioRpc = createStudioRpcHandler(createStudioServerContextForApp(command));
        server.middlewares.use("/rpc", async (req, res, next) => {
          const request = await nodeRequestToWebRequest(req);
          const { matched, response } = await studioRpc.handle(request, { prefix: "/rpc" });
          if (!matched || !response) {
            next();
            return;
          }
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
        });
      },
    },
  ],
  resolve: {
    alias: {
      // deck.gl -> loaders.gl includes a Node-only helper that imports `child_process`.
      // In the browser, this path is never executed, but Rollup warns because the
      // `child_process` "browser external" stub has no exports. Alias to a tiny
      // browser shim so builds stay clean (and failures are explicit if it ever runs).
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      child_process: fileURLToPath(new URL("./src/shims/child_process.ts", import.meta.url)),
      ...(command === "serve"
        ? {
            "@swooper/mapgen-viz": fileURLToPath(
              new URL("../../packages/mapgen-viz/src/index.ts", import.meta.url)
            ),
          }
        : {}),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: [
        "**/mods/mod-swooper-maps/dist/**",
        "**/mods/mod-swooper-maps/mod/**",
        "**/mods/mod-swooper-maps/src/maps/generated/**",
        "**/mods/mod-swooper-maps/src/maps/configs/*.config.json",
        "**/packages/*/dist/**",
        "**/packages/*/types/**",
      ],
    },
  },
}));
