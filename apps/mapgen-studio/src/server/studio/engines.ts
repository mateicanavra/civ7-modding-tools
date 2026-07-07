import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { promisify } from "node:util";
import {
  Civ7DirectControlError,
  closeCiv7Displays,
  DEFAULT_CIV7_SCRIPTING_LOG,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  getCiv7PlayableStatus,
  logTextFromSnapshot,
  snapshotFile,
  waitForFreshLogMarkers,
} from "@civ7/direct-control";
import { deployMod, resolveModsDir } from "@civ7/plugin-mods";
import type {
  RunInGameRequestStatus,
  StudioBoundedDiagnostics,
  StudioOperationRuntimePorts,
  StudioRuntimeFailure,
} from "@civ7/studio-server";
import {
  dependencyUnavailable,
  invalidRequest,
  isStudioRuntimeFailure,
  materializationFailed,
  proofFailed,
} from "@civ7/studio-server";
import { buildLiveRuntimeStatusState } from "../../features/liveRuntime/model";
import { buildSwooperMapsStudioDeployPlan } from "../mapConfigs/deploy";
import { parseMapConfigSaveRequest } from "../mapConfigs/requestValidation";
import { waitForCiv7MapgenLogFailure } from "../runInGame/logFailure";
import {
  launchCiv7MacViaSteamWithRetries,
  shutdownCiv7MacProcess,
} from "../runInGame/macosProcessRestart";
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
import type { RunInGameDetailedProofLog } from "../runInGame/proofTypes";
import { assertNoRawControlFields } from "../runInGame/requestValidation";

// ============================================================================
// Studio operation leaf ports — app-side filesystem/deploy/direct-control atoms
// ----------------------------------------------------------------------------
// D4 moves lifecycle truth into `@civ7/studio-server`'s Effect runtime. This
// file deliberately does not own operation ids, admission, queues, registries,
// status/current projections, event publication, or runtime disposal. It only
// implements leaf work the package cannot own: repository writes, mod deploys,
// Civ7 direct-control calls, and proof gathering.
// ============================================================================

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;
const SCRIPTING_LOG_FAILURE_GRACE_MS = 5_000;
const SCRIPTING_LOG_FAILURE_POLL_INTERVAL_MS = 250;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;
const CIV7_STEAM_APP_ID = "1295660";
const CIV7_PROCESS_PATTERN = "CivilizationVII.app/Contents/MacOS/CivilizationVII";
const CIV7_PROCESS_GRACEFUL_QUIT_TIMEOUT_MS = 45_000;
const CIV7_PROCESS_FORCE_QUIT_TIMEOUT_MS = 30_000;
const CIV7_PROCESS_FORCE_KILL_TIMEOUT_MS = 15_000;
const CIV7_PROCESS_RESTART_POLL_INTERVAL_MS = 2_000;
const CIV7_PROCESS_EXIT_STABLE_POLLS = 2;
const CIV7_PROCESS_LAUNCH_COMMAND_TIMEOUT_MS = 10_000;
const CIV7_PROCESS_LAUNCH_START_TIMEOUT_MS = 20_000;
const CIV7_PROCESS_LAUNCH_ATTEMPTS = 6;
const CIV7_PROCESS_LAUNCH_RETRY_DELAY_MS = 5_000;
const CIV7_PROCESS_LAUNCH_SHELL_TIMEOUT_MS = 180_000;
const CIV7_PROCESS_INTRO_DISMISS_INTERVAL_MS = 4_000;
const CIV7_PROCESS_INTRO_DISMISS_CATEGORIES = ["Cinematic"] as const;

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
): StudioRuntimeFailure {
  return invalidRequest({
    message,
    diagnostics: boundedDiagnostics({
      code,
      ...details,
    }),
  });
}

function unavailableEngineDependency(
  message: string,
  code: string,
  err?: unknown,
  details: Record<string, unknown> = {}
): StudioRuntimeFailure {
  const directControlCode = err instanceof Civ7DirectControlError ? err.code : undefined;
  const cause = err instanceof Civ7DirectControlError ? err.details : err;
  return dependencyUnavailable({
    message,
    dependency: "direct-control",
    ...(directControlCode === undefined ? {} : { directControlCode }),
    causeSummary: diagnosticString(cause),
    diagnostics: boundedDiagnostics({
      code,
      ...details,
      ...(directControlCode === undefined ? {} : { directControlCode }),
    }),
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
  shellReadiness?: {
    readiness: string;
    playable: boolean;
    elapsedMs: number;
    polls: number;
    errors: readonly string[];
  };
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
  const shellReadiness = await waitForCiv7ShellReadiness({
    timeoutMs: CIV7_PROCESS_LAUNCH_SHELL_TIMEOUT_MS,
    pollIntervalMs: CIV7_PROCESS_RESTART_POLL_INTERVAL_MS,
  }).catch((err: unknown) => {
    throw unavailableEngineDependency(
      "Civ7 did not reach shell after restart",
      "civ7-shell-readiness-unavailable",
      err,
      { launchAttempts: steamLaunch.attempts }
    );
  });

  return {
    command: `${shutdown.quit.command} && ${steamLaunch.command}`,
    quit: shutdown.quit,
    ...(shutdown.kill === undefined ? {} : { kill: shutdown.kill }),
    ...(shutdown.forceKill === undefined ? {} : { forceKill: shutdown.forceKill }),
    shutdown,
    launch,
    launchAttempts: steamLaunch.attempts,
    shellReadiness,
  };
}

async function waitForCiv7ShellReadiness(options: {
  timeoutMs: number;
  pollIntervalMs: number;
}): Promise<{
  readiness: string;
  playable: boolean;
  elapsedMs: number;
  polls: number;
  errors: readonly string[];
}> {
  const startedAt = Date.now();
  let polls = 0;
  let last: Awaited<ReturnType<typeof getCiv7PlayableStatus>> | undefined;
  let lastIntroDismissAttemptAt = 0;
  const introDismissals: Civ7IntroDisplayDismissalAttempt[] = [];
  while (Date.now() - startedAt <= options.timeoutMs) {
    polls += 1;
    try {
      const status = await getCiv7PlayableStatus({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS });
      last = status;
      const inGame = directControlProbeValue(status.appUi.snapshot.ui.inGame);
      const inShell = directControlProbeValue(status.appUi.snapshot.ui.inShell);
      if (inShell === true) {
        return {
          readiness: status.readiness,
          playable: status.playable,
          elapsedMs: Date.now() - startedAt,
          polls,
          errors: status.errors,
        };
      }
      const elapsedMs = Date.now() - startedAt;
      if (
        inGame !== true &&
        elapsedMs - lastIntroDismissAttemptAt >= CIV7_PROCESS_INTRO_DISMISS_INTERVAL_MS
      ) {
        lastIntroDismissAttemptAt = elapsedMs;
        introDismissals.push(await attemptCiv7IntroDisplayDismissal({ elapsedMs, poll: polls }));
      }
    } catch {
      // Keep polling through the Civ7 intro/cinematic and tuner reconnect window.
    }
    await sleep(options.pollIntervalMs);
  }
  throw unavailableEngineDependency(
    "Timed out waiting for Civ7 shell after restart",
    "civ7-shell-readiness-timeout",
    undefined,
    {
      elapsedMs: Date.now() - startedAt,
      polls,
      lastReadiness: last?.readiness,
      lastErrors: last?.errors,
      lastInGame: directControlProbeValue(last?.appUi.snapshot.ui.inGame),
      lastInShell: directControlProbeValue(last?.appUi.snapshot.ui.inShell),
      lastInLoading: directControlProbeValue(last?.appUi.snapshot.ui.inLoading),
      introDismissals,
    }
  );
}

type Civ7IntroDisplayDismissalAttempt = Readonly<
  | {
      elapsedMs: number;
      poll: number;
      categories: readonly string[];
      closedTotal: number;
      closed: Awaited<ReturnType<typeof closeCiv7Displays>>["closed"];
      remainingActive: Awaited<ReturnType<typeof closeCiv7Displays>>["remainingActive"];
      remainingSuspended: Awaited<ReturnType<typeof closeCiv7Displays>>["remainingSuspended"];
    }
  | {
      elapsedMs: number;
      poll: number;
      categories: readonly string[];
      error: string;
    }
>;

async function attemptCiv7IntroDisplayDismissal(args: {
  elapsedMs: number;
  poll: number;
}): Promise<Civ7IntroDisplayDismissalAttempt> {
  try {
    const result = await closeCiv7Displays({
      categories: CIV7_PROCESS_INTRO_DISMISS_CATEGORIES,
    });
    return {
      elapsedMs: args.elapsedMs,
      poll: args.poll,
      categories: CIV7_PROCESS_INTRO_DISMISS_CATEGORIES,
      closedTotal: result.closedTotal,
      closed: result.closed,
      remainingActive: result.remainingActive,
      remainingSuspended: result.remainingSuspended,
    };
  } catch (err) {
    return {
      elapsedMs: args.elapsedMs,
      poll: args.poll,
      categories: CIV7_PROCESS_INTRO_DISMISS_CATEGORIES,
      error: diagnosticString(err) ?? "Unknown display-queue close failure",
    };
  }
}

function directControlProbeValue<T>(
  probe: { ok: true; value: T } | { ok: false } | undefined
): T | undefined {
  return probe?.ok === true ? probe.value : undefined;
}

// Deploy = the Nx build graph + the @civ7/plugin-mods deploy API (the
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
  registerCleanup?(cleanup: () => Promise<void>): void;
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
  const cleanup = async () => {
    if (args.mode !== "disposable") return;
    await restoreRepoConfig(target, previous);
    await regenerateSwooperMapArtifacts(args.repoRoot);
  };
  args.registerCleanup?.(cleanup);
  return {
    path,
    mapScript: mapScriptForConfigId(args.id),
    cleanup,
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

function diagnosticString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  const cloned = cloneForJson(value);
  return typeof cloned === "string" ? cloned : JSON.stringify(cloned);
}

function boundedDiagnostics(details: Record<string, unknown>): StudioBoundedDiagnostics {
  const out: Record<string, string | number | boolean | null | string[]> = {};
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      out[key] = value;
    } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      out[key] = [...value];
    } else {
      const stringValue = diagnosticString(value);
      if (stringValue !== undefined) out[key] = stringValue;
    }
  }
  return out;
}

function failureDiagnostics(err: unknown): StudioBoundedDiagnostics | undefined {
  return isStudioRuntimeFailure(err) ? err.diagnostics : undefined;
}

async function restoreRepoConfig(target: string, previous: string | null): Promise<void> {
  if (previous === null) {
    await rm(target, { force: true });
    return;
  }
  await writeFile(target, previous);
}

type RunInGameInput = Parameters<StudioOperationRuntimePorts["materializeRunInGame"]>[0]["input"];
type RunInGameMaterialized = Awaited<
  ReturnType<StudioOperationRuntimePorts["materializeRunInGame"]>
>;
type RunInGameDeployment = Awaited<ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>>;
type RunInGameStarted = Readonly<{ start?: unknown }>;
type SaveDeployPrepared = Awaited<
  ReturnType<StudioOperationRuntimePorts["prepareSaveDeployStart"]>
>;

type RunInGameLeafContext = Readonly<{
  id: string;
  seed: number;
  mapSize: string;
  playerCount?: number;
  restartCivProcess: boolean;
  setupConfig: NonNullable<RunInGameRequestStatus["setupConfig"]>;
  requestedMode: "durable" | "disposable";
  configHash: string;
  envelopeHash: string;
  envelope: Record<string, unknown>;
  sourceSnapshotProof?: ReturnType<typeof buildRunInGameSourceSnapshotProof>;
  requestStatus: RunInGameRequestStatus;
}> & {
  materialization?: NonNullable<RunInGameMaterialized["materialization"]>;
  scriptingLogPath?: string;
  scriptingSnapshot?: Awaited<ReturnType<typeof snapshotFile>>;
  deployment?: RunInGameDeployment;
  launchMapScript?: string;
  rowProof?: unknown;
  rowVisibility?: unknown;
  started?: RunInGameStarted;
};

type SaveDeployLeafContext = SaveDeployPrepared &
  Readonly<{
    parsedRequest: ReturnType<typeof parseMapConfigSaveRequest>;
    target: string;
    previous: string | null;
  }>;

export function createStudioOperationRuntimePorts(
  options: Readonly<{ repoRoot: string }>
): StudioOperationRuntimePorts {
  const { repoRoot } = options;
  const runContexts = new Map<string, RunInGameLeafContext>();
  const saveContexts = new Map<string, SaveDeployLeafContext>();

  return {
    runInGameWorkspaceRoot: resolve(repoRoot, ".mapgen-studio/run-in-game"),
    materializeRunInGame: async ({ requestId, input, prepared, registerCleanup }) => {
      const context = makeRunInGameLeafContext({ requestId, input, prepared });
      let materialized: Awaited<ReturnType<typeof materializeRunInGameConfig>> | undefined;
      let cleaned = false;
      const cleanupMaterialized = async (cleanup?: () => Promise<void>) => {
        cleaned = true;
        runContexts.delete(requestId);
        await cleanup?.();
      };
      materialized = await materializeRunInGameConfig({
        repoRoot,
        id: context.id,
        sourcePath:
          context.requestedMode === "durable" &&
          typeof input.selectedConfig?.sourcePath === "string"
            ? input.selectedConfig.sourcePath
            : undefined,
        envelope: context.envelope,
        mode: context.requestedMode,
        registerCleanup: (cleanup) => {
          registerCleanup(() => cleanupMaterialized(cleanup));
        },
      });
      const materialization = {
        mode: context.requestedMode,
        path: materialized.path,
        mapScript: materialized.mapScript,
        configHash: context.configHash,
        envelopeHash: context.envelopeHash,
        ...(await optionalFileIdentity({ repoRoot, path: materialized.path }).then(
          (sourceConfig) => (sourceConfig ? { sourceConfig } : {})
        )),
      };
      if (!cleaned) {
        context.materialization = materialization;
        runContexts.set(requestId, context);
      }
      return {
        materialization,
        cleanup: () => cleanupMaterialized(materialized?.cleanup),
      };
    },
    deployRunInGame: async ({ requestId }) => {
      const context = requireRunContext(runContexts, requestId);
      const materialization = requireMaterialization(context, requestId);
      context.scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
      context.scriptingSnapshot = await snapshotFile(context.scriptingLogPath);
      const deploy = await deploySwooperMapsForRun(repoRoot, requestId);
      const generatedSourceScript = await optionalFileIdentity({
        repoRoot,
        path: generatedSourceScriptPath(repoRoot, context.id),
      });
      const localModScript = await optionalFileIdentity({
        repoRoot,
        path: localModScriptPath(repoRoot, context.id),
      });
      const deployedModScript = deploy.targetDir
        ? await optionalFileIdentity({
            repoRoot,
            path: deployedModScriptPath(deploy.targetDir, context.id),
            exposeAs: "absolute",
          })
        : undefined;
      const requiredMaterializationMarkers = runInGameRequiredMaterializationMarkers({
        requestId,
        configHash: context.configHash,
        envelopeHash: context.envelopeHash,
      });
      const localModScriptContent = await optionalFileContentMarkerProof({
        repoRoot,
        path: localModScriptPath(repoRoot, context.id),
        markers: requiredMaterializationMarkers,
      });
      const deployedModScriptContent = deploy.targetDir
        ? await optionalFileContentMarkerProof({
            repoRoot,
            path: deployedModScriptPath(deploy.targetDir, context.id),
            exposeAs: "absolute",
            markers: requiredMaterializationMarkers,
          })
        : undefined;
      context.materialization = {
        ...materialization,
        ...(generatedSourceScript ? { generatedSourceScript } : {}),
        ...(localModScript ? { localModScript } : {}),
        ...(deployedModScript ? { deployedModScript } : {}),
        ...(localModScriptContent ? { localModScriptContent } : {}),
        ...(deployedModScriptContent ? { deployedModScriptContent } : {}),
      };
      const unresolved = runInGameMaterializationScriptUnresolvedLinks({
        materialization: context.materialization,
        localModScript,
        deployedModScript,
        requiredMarkers: requiredMaterializationMarkers,
      });
      if (unresolved.length > 0) {
        throw materializationFailed({
          message: "Generated Swooper map script is missing current materialization proof markers",
          diagnostics: boundedDiagnostics({
            code: "map-script-materialization-proof-missing",
            unresolvedLinks: unresolved,
            materialization: context.materialization,
          }),
        });
      }

      const localBundlePath = localModScriptPath(repoRoot, context.id);
      const localBundleText = await readFile(localBundlePath, "utf8").catch(() => "");
      if (!mapScriptEmbedsRequestId(localBundleText, requestId)) {
        throw materializationFailed({
          message:
            "Deployed map bundle does not embed the Run in Game request id; the in-game proof could never match.",
          diagnostics: boundedDiagnostics({
            code: "run-request-id-not-materialized",
            requestId,
            mapScript: materialization.mapScript,
            localModScript: relative(repoRoot, localBundlePath),
            recoveryHint:
              "Rebuild map artifacts (gen:maps must see SWOOPER_STUDIO_RUN_ID; check the nx env input/cache for mod-swooper-maps:build), then retry the run.",
            materialization: context.materialization,
          }),
        });
      }

      context.deployment = { materialization: context.materialization, deploy };
      context.launchMapScript = materialization.mapScript;
      return context.deployment;
    },
    restartCivForRunInGame: async () => ({ processRestart: await restartCiv7ProcessViaSteam() }),
    waitForRunInGameLogProof: async ({ requestId, setup, started }) => {
      const context = requireRunContext(runContexts, requestId);
      const materialization = requireMaterialization(context, requestId);
      const scriptingLogPath = requireContextValue(
        context.scriptingLogPath,
        "Run in Game scripting log path",
        requestId
      );
      const scriptingSnapshot = requireContextValue(
        context.scriptingSnapshot,
        "Run in Game scripting log snapshot",
        requestId
      );
      const launchMapScript = context.launchMapScript ?? materialization.mapScript;
      const logMarkerProof = await waitForFreshLogMarkers({
        logPath: scriptingLogPath,
        snapshot: scriptingSnapshot,
        markers: [
          "[mapgen-proof]",
          requestId,
          context.configHash,
          context.envelopeHash,
          "[mapgen-complete]",
        ],
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
          throw proofFailed({
            message: mapgenFailure.message,
            reason: "log-proof-missing",
            diagnostics: boundedDiagnostics({
              ...mapgenFailure,
              materialization,
              cause: err instanceof Error ? err.message : String(err),
            }),
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
        configHash: context.configHash,
        envelopeHash: context.envelopeHash,
        seed: context.seed,
      });
      if (!logProof) {
        throw proofFailed({
          message: "Swooper log proof payload did not match the Studio Run in Game request",
          reason: "log-proof-missing",
          diagnostics: boundedDiagnostics({
            code: "swooper-log-proof-missing",
            requestId,
            configHash: context.configHash,
            envelopeHash: context.envelopeHash,
            seed: context.seed,
            markers: logMarkerProof.matched,
            materialization,
          }),
        });
      }
      context.rowProof = setup.rowProof;
      context.rowVisibility = setup.rowVisibility;
      context.started = started;
      return {
        result: {
          ok: true,
          requestId,
          materialization,
          deploy: context.deployment?.deploy,
          rowProof: setup.rowProof,
          rowVisibility: setup.rowVisibility,
          start: started.start,
          logMarkerProof,
          logProof,
        },
        materialization,
        logMarkerProof,
        logProof,
      };
    },
    buildRunInGameProof: async ({ requestId, setup, started, log }) => {
      const context = requireRunContext(runContexts, requestId);
      const materialization = requireMaterialization(context, requestId);
      const startedResult = started.start as
        | {
            prepare?: { after?: { snapshot?: unknown } };
            start?: { mapSummary?: unknown };
          }
        | undefined;
      const liveRuntimeStatus = startedResult?.start?.mapSummary
        ? buildLiveRuntimeStatusState({
            body: {
              ok: true,
              observedAt: new Date().toISOString(),
              status: { readiness: "running-game" },
              mapSummary: startedResult.start.mapSummary,
            },
            observedAtFallback: new Date().toISOString(),
          })
        : undefined;
      const exactAuthorshipProof = buildRunInGameExactAuthorshipProof({
        requestId,
        request: context.requestStatus,
        sourceSnapshot: context.sourceSnapshotProof,
        materialization,
        sourceConfig: materialization.sourceConfig,
        generatedSourceScript: materialization.generatedSourceScript,
        localModScript: materialization.localModScript,
        deployedModScript: materialization.deployedModScript,
        rowProof: setup.rowProof,
        setupSnapshot: startedResult?.prepare?.after?.snapshot,
        startMapSummary: startedResult?.start?.mapSummary,
        logProof: log.logProof as RunInGameDetailedProofLog | undefined,
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
      return {
        result: {
          ok: true,
          requestId,
          materialization,
          deploy: context.deployment?.deploy,
          rowProof: setup.rowProof,
          rowVisibility: setup.rowVisibility,
          start: started.start,
          logMarkerProof: log.logMarkerProof,
          logProof: log.logProof,
          exactAuthorshipProof,
        },
        materialization,
        exactAuthorshipProof,
      };
    },
    prepareSaveDeployStart: async ({ requestId, input }) => {
      const parsedRequest = parseSaveDeployInput(input);
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
      const previous = await readFile(target, "utf8").catch((err: unknown) => {
        if (isNodeNotFound(err)) return null;
        throw unavailableEngineDependency(
          "Unable to read existing map config before Save/Deploy",
          "save-deploy-existing-config-unavailable",
          err,
          { path, sourcePath: parsedRequest.sourcePath }
        );
      });
      const prepared = {
        path,
        cleanup: async () => {
          saveContexts.delete(requestId);
        },
      };
      saveContexts.set(requestId, { ...prepared, parsedRequest, target, previous });
      return prepared;
    },
    saveMapConfig: async ({ requestId }) => {
      const context = requireSaveContext(saveContexts, requestId);
      await mkdir(dirname(context.target), { recursive: true });
      await writeFile(
        context.target,
        `${JSON.stringify(context.parsedRequest.envelope, null, 2)}\n`
      );
      return { path: context.path, saved: true };
    },
    deploySavedMapConfig: async ({ requestId }) => {
      const context = requireSaveContext(saveContexts, requestId);
      const deploy = await deploySwooperMaps(repoRoot);
      return { path: context.path, saved: true, deployed: true, deploy };
    },
    rollbackSaveDeploy: async ({ requestId }) => {
      const context = requireSaveContext(saveContexts, requestId);
      await restoreRepoConfig(context.target, context.previous);
      return {
        path: context.path,
        ...(context.previous === null ? { deleted: true } : { restored: true }),
      };
    },
    failureDiagnostics,
  };

  function makeRunInGameLeafContext(
    args: Readonly<{
      requestId: string;
      input: RunInGameInput;
      prepared: Parameters<StudioOperationRuntimePorts["materializeRunInGame"]>[0]["prepared"];
    }>
  ): RunInGameLeafContext {
    try {
      assertNoRawControlFields(args.input);
    } catch (err) {
      throw invalidEngineRequest(
        err instanceof Error ? err.message : "Invalid Run in Game request",
        "run-in-game-request-invalid"
      );
    }
    if (
      !args.input.config ||
      typeof args.input.config !== "object" ||
      Array.isArray(args.input.config)
    ) {
      throw invalidEngineRequest(
        "Run in Game requires a sanitized config object",
        "run-in-game-request-invalid"
      );
    }
    const selected = args.input.selectedConfig ?? {};
    const request = args.prepared.request;
    const requestedMode = request.materializationMode === "durable" ? "durable" : "disposable";
    const id = request.selectedConfigId ?? "studio-current";
    const seed = requirePreparedNumber(request.seed, "Run in Game seed", args.requestId);
    const mapSize = requirePreparedString(request.mapSize, "Run in Game mapSize", args.requestId);
    const playerCount = request.playerCount;
    const restartCivProcess = request.restartCivProcess === true;
    const setupConfig = request.setupConfig ?? { gameOptions: {}, playerOptions: [] };
    const configHash = stableHash(args.input.config);
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
      config: args.input.config,
    });
    assertRepoMapEnvelope(envelope, id);
    const envelopeHash = stableHash({
      id,
      recipe: "standard",
      latitudeBounds: selected.latitudeBounds ?? null,
      configHash,
    });
    const sourceSnapshotProof = buildRunInGameSourceSnapshotProof({
      requestId: args.requestId,
      sourceSnapshot: args.input.sourceSnapshot,
      configHash,
      envelopeHash,
    });
    const requestStatus: RunInGameRequestStatus = {
      ...args.prepared.request,
      recipeId: "mod-swooper-maps/standard",
      seed,
      mapSize,
      ...(playerCount === undefined ? {} : { playerCount }),
      ...(typeof args.input.resources === "string" ? { resources: args.input.resources } : {}),
      selectedConfigId: id,
      setupConfig,
      materializationMode: requestedMode,
      ...(restartCivProcess ? { restartCivProcess } : {}),
      ...(sourceSnapshotProof ? { sourceSnapshot: sourceSnapshotProof } : {}),
    };
    return {
      id,
      seed,
      mapSize,
      ...(playerCount === undefined ? {} : { playerCount }),
      restartCivProcess,
      setupConfig,
      requestedMode,
      configHash,
      envelopeHash,
      envelope,
      ...(sourceSnapshotProof ? { sourceSnapshotProof } : {}),
      requestStatus,
    };
  }
}

function parseSaveDeployInput(
  input: Parameters<StudioOperationRuntimePorts["prepareSaveDeployStart"]>[0]["input"]
) {
  try {
    return parseMapConfigSaveRequest(input as Parameters<typeof parseMapConfigSaveRequest>[0]);
  } catch (err) {
    throw invalidEngineRequest(
      err instanceof Error ? err.message : "Invalid Save/Deploy request",
      "save-deploy-request-invalid"
    );
  }
}

function requireRunContext(
  contexts: ReadonlyMap<string, RunInGameLeafContext>,
  requestId: string
): RunInGameLeafContext {
  const context = contexts.get(requestId);
  if (!context) {
    throw invalidEngineRequest(
      "Run in Game leaf context is missing",
      "run-in-game-leaf-context-missing",
      {
        requestId,
      }
    );
  }
  return context;
}

function requireSaveContext(
  contexts: ReadonlyMap<string, SaveDeployLeafContext>,
  requestId: string
): SaveDeployLeafContext {
  const context = contexts.get(requestId);
  if (!context) {
    throw invalidEngineRequest(
      "Save/Deploy leaf context is missing",
      "save-deploy-leaf-context-missing",
      {
        requestId,
      }
    );
  }
  return context;
}

function requireMaterialization(
  context: RunInGameLeafContext,
  requestId: string
): NonNullable<RunInGameMaterialized["materialization"]> {
  return requireContextValue(context.materialization, "Run in Game materialization", requestId);
}

function requireContextValue<T>(value: T | undefined, label: string, requestId: string): T {
  if (value !== undefined) return value;
  throw invalidEngineRequest(`${label} is missing`, "run-in-game-leaf-context-incomplete", {
    requestId,
    label,
  });
}

function requirePreparedNumber(value: unknown, label: string, requestId: string): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw invalidEngineRequest(`${label} is missing`, "run-in-game-prepared-request-incomplete", {
    requestId,
    label,
  });
}

function requirePreparedString(value: unknown, label: string, requestId: string): string {
  if (typeof value === "string" && value.length > 0) return value;
  throw invalidEngineRequest(`${label} is missing`, "run-in-game-prepared-request-incomplete", {
    requestId,
    label,
  });
}
