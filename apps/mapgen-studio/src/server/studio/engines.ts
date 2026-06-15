import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { promisify } from "node:util";
import {
  Civ7DirectControlError,
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
import type {
  RunInGameRequestStatus,
  StudioBoundedDiagnostics,
  StudioOperationRuntimePorts,
  StudioRuntimeFailure,
} from "@civ7/studio-server";
import {
  autoplayStartStopFailed,
  autoplayVerificationFailed,
  dependencyUnavailable,
  deployFailed,
  invalidRequest,
  isStudioRuntimeFailure,
  materializationFailed,
  operationBlocked,
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
import { parseRunInGameSetupRequest } from "../runInGame/requestValidation";

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

function saveDeployFailureForOperation(
  err: unknown,
  phase: "saving" | "deploying",
  details: Readonly<{
    path: string;
    sourcePath?: string;
    rollbackFailure?: unknown;
  }>
): StudioRuntimeFailure {
  if (isStudioRuntimeFailure(err) && details.rollbackFailure === undefined) {
    return err;
  }
  const reason =
    details.rollbackFailure !== undefined ? "rollback-failed" : phase === "saving" ? "save-failed" : "deploy-failed";
  const originalFailure = isStudioRuntimeFailure(err) ? err : undefined;
  return deployFailed({
    message: originalFailure?.message ?? (err instanceof Error ? err.message : "Deploy failed"),
    reason,
    diagnostics: boundedDiagnostics({
      ...failureDiagnostics(err),
      code: `save-deploy-${reason}`,
      path: details.path,
      sourcePath: details.sourcePath,
      failedAtPhase: phase,
      originalFailureTag: originalFailure?.tag,
      originalFailureReason: originalFailure?.reason,
      cause: originalFailure === undefined ? err : undefined,
      rollbackFailure: details.rollbackFailure,
    }),
    recoveryActions: [
      "copy-diagnostics",
      "retry-status",
      "retry-save-deploy",
      ...(phase === "deploying" ? ["inspect-deploy-output" as const] : []),
    ],
  });
}

async function restoreRepoConfig(target: string, previous: string | null): Promise<void> {
  if (previous === null) {
    await rm(target, { force: true });
    return;
  }
  await writeFile(target, previous);
}

type RunInGameInput = Parameters<StudioOperationRuntimePorts["materializeRunInGame"]>[0]["input"];
type RunInGameMaterialized = Awaited<ReturnType<StudioOperationRuntimePorts["materializeRunInGame"]>>;
type RunInGameDeployment = Awaited<ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>>;
type RunInGameStarted = Awaited<ReturnType<StudioOperationRuntimePorts["startGameForRunInGame"]>>;
type SaveDeployPrepared = Awaited<ReturnType<StudioOperationRuntimePorts["prepareSaveDeployStart"]>>;

type RunInGameLeafContext = Readonly<{
  id: string;
  seed: number;
  mapSize: string;
  playerCount?: number;
  restartCivProcess: boolean;
  setupConfig: ReturnType<typeof parseRunInGameSetupRequest>["setupConfig"];
  requestedMode: ReturnType<typeof parseRunInGameSetupRequest>["requestedMode"];
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

type SaveDeployLeafContext = SaveDeployPrepared & Readonly<{
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
    materializeRunInGame: async ({ requestId, input, prepared }) => {
      const context = makeRunInGameLeafContext({ requestId, input, prepared });
      let materialized: Awaited<ReturnType<typeof materializeRunInGameConfig>> | undefined;
      materialized = await materializeRunInGameConfig({
        repoRoot,
        id: context.id,
        sourcePath:
          context.requestedMode === "durable" && typeof input.selectedConfig?.sourcePath === "string"
            ? input.selectedConfig.sourcePath
            : undefined,
        envelope: context.envelope,
        mode: context.requestedMode,
      });
      const materialization = {
        mode: context.requestedMode,
        path: materialized.path,
        mapScript: materialized.mapScript,
        configHash: context.configHash,
        envelopeHash: context.envelopeHash,
        ...(await optionalFileIdentity({ repoRoot, path: materialized.path }).then((sourceConfig) =>
          sourceConfig ? { sourceConfig } : {}
        )),
      };
      context.materialization = materialization;
      runContexts.set(requestId, context);
      return {
        materialization,
        cleanup: async () => {
          runContexts.delete(requestId);
          await materialized?.cleanup();
        },
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
    checkCiv7ForRunInGame: async ({ requestId }) => {
      const context = requireRunContext(runContexts, requestId);
      await getCiv7PlayableStatus({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }).catch((err) => {
        throw unavailableEngineDependency(
          "Civ7 direct-control status is unavailable",
          "direct-control-status-unavailable",
          err,
          { materialization: context.materialization }
        );
      });
    },
    prepareSetupForRunInGame: async ({ requestId }) => {
      const context = requireRunContext(runContexts, requestId);
      const materialization = requireMaterialization(context, requestId);
      const launchMapScript = requireContextValue(
        context.launchMapScript ?? materialization.mapScript,
        "Run in Game map script",
        requestId
      );
      const rowVisibility = await ensureCiv7SetupMapRowVisible(
        {
          file: launchMapScript,
          limit: 20,
          reloadIfMissing: context.requestedMode === "disposable" ? "exit-to-shell" : "none",
          waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
          pollIntervalMs: 1_000,
        },
        { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }
      );
      const rowProof = rowVisibility.final;
      if (rowProof.rows.length === 0) {
        throw operationBlocked({
          message: `Civ7 setup cannot see ${launchMapScript}`,
          diagnostics: boundedDiagnostics({
            code: "setup-map-row-not-visible",
            reloadRequired: true,
            reloadBoundary:
              context.requestedMode === "disposable" ? "process-restart-required" : "setup-row-missing",
            reloadAttempted: rowVisibility.refreshed,
            mapScript: launchMapScript,
            materialization: { mode: context.requestedMode, path: materialization.path },
          }),
        });
      }
      context.rowProof = rowProof;
      context.rowVisibility = rowVisibility;
      return { rowProof, rowVisibility, reloadRequired: rowVisibility.refreshed };
    },
    startGameForRunInGame: async ({ requestId }) => {
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
      const launchMapScript = requireContextValue(
        context.launchMapScript ?? materialization.mapScript,
        "Run in Game map script",
        requestId
      );
      const start = await runCiv7SinglePlayerFromSetup(
        {
          mapScript: launchMapScript,
          mapSize: context.mapSize,
          seed: context.seed,
          gameSeed: context.seed,
          ...(context.playerCount === undefined ? {} : { playerCount: context.playerCount }),
          ...(context.setupConfig.savedConfig === undefined
            ? {}
            : { savedConfig: context.setupConfig.savedConfig }),
          options: context.setupConfig.gameOptions,
          playerOptions: context.setupConfig.playerOptions,
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
          throw proofFailed({
            message: mapgenFailure.message,
            reason: "start-game-failed",
            diagnostics: boundedDiagnostics({
              ...mapgenFailure,
              materialization,
              cause: cloneForJson(err instanceof Civ7DirectControlError ? err.details : err),
            }),
          });
        }
        throw unavailableEngineDependency(
          "Civ7 direct-control start is unavailable",
          "direct-control-start-unavailable",
          err,
          { materialization }
        );
      });
      context.started = { start };
      return context.started;
    },
    waitForRunInGameProof: async ({ requestId }) => {
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
        markers: ["[mapgen-proof]", requestId, context.configHash, context.envelopeHash, "[mapgen-complete]"],
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
      const freshLogText = await readFreshLogText(scriptingLogPath, scriptingSnapshot).catch(() => "");
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
      const started = context.started?.start as Awaited<ReturnType<typeof runCiv7SinglePlayerFromSetup>> | undefined;
      const liveRuntimeStatus = started?.start.mapSummary
        ? buildLiveRuntimeStatusState({
            body: {
              ok: true,
              observedAt: new Date().toISOString(),
              status: { readiness: "running-game" },
              mapSummary: started.start.mapSummary,
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
        rowProof: context.rowProof,
        setupSnapshot: started?.prepare.after.snapshot,
        startMapSummary: started?.start.mapSummary,
        logProof,
        ...(liveRuntimeStatus
          ? {
              liveRuntimeSnapshot: {
                ...(liveRuntimeStatus.snapshotId ? { snapshotId: liveRuntimeStatus.snapshotId } : {}),
                ...(liveRuntimeStatus.snapshotHash ? { snapshotHash: liveRuntimeStatus.snapshotHash } : {}),
                ...(liveRuntimeStatus.turn === undefined ? {} : { turn: liveRuntimeStatus.turn }),
                ...(liveRuntimeStatus.gameHash === undefined ? {} : { gameHash: liveRuntimeStatus.gameHash }),
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
          rowProof: context.rowProof,
          rowVisibility: context.rowVisibility,
          start: started,
          logMarkerProof,
          logProof,
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
      await writeFile(context.target, `${JSON.stringify(context.parsedRequest.envelope, null, 2)}\n`);
      return { path: context.path, saved: true };
    },
    deploySavedMapConfig: async ({ requestId }) => {
      const context = requireSaveContext(saveContexts, requestId);
      try {
        const deploy = await deploySwooperMaps(repoRoot);
        saveContexts.delete(requestId);
        return { path: context.path, saved: true, deployed: true, deploy };
      } catch (err) {
        let rollbackFailure: unknown;
        try {
          await restoreRepoConfig(context.target, context.previous);
        } catch (restoreErr) {
          rollbackFailure = restoreErr;
        } finally {
          saveContexts.delete(requestId);
        }
        throw saveDeployFailureForOperation(err, "deploying", {
          path: context.path ?? "",
          sourcePath: context.parsedRequest.sourcePath,
          rollbackFailure,
        });
      }
    },
    runAutoplay: async (input) => runAutoplayLeaf(input.action),
    normalizeSaveDeployFailure: ({ err, phase }) =>
      isStudioRuntimeFailure(err)
        ? err
        : saveDeployFailureForOperation(err, phase, {
            path: "",
          }),
    failureDiagnostics,
  };

  function makeRunInGameLeafContext(args: Readonly<{
    requestId: string;
    input: RunInGameInput;
    prepared: Parameters<StudioOperationRuntimePorts["materializeRunInGame"]>[0]["prepared"];
  }>): RunInGameLeafContext {
    let parsedRequest: ReturnType<typeof parseRunInGameSetupRequest>;
    try {
      parsedRequest = parseRunInGameSetupRequest(args.input);
    } catch (err) {
      throw invalidEngineRequest(
        err instanceof Error ? err.message : "Invalid Run in Game request",
        "run-in-game-request-invalid"
      );
    }
    const selected = args.input.selectedConfig ?? {};
    const { requestedMode, id, seed, mapSize, playerCount, restartCivProcess, setupConfig } = parsedRequest;
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
      ...(typeof selected.id === "string" ? { selectedConfigId: selected.id } : {}),
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

async function runAutoplayLeaf(action: "start" | "stop") {
  const opts = {
    timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
    waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
    pollIntervalMs: 1_000,
  };
  const result = await (action === "start" ? startCiv7Autoplay(opts) : stopCiv7Autoplay(opts)).catch(
    (err: unknown) => {
      throw autoplayStartStopFailed({
        message: `Civ7 autoplay ${action} failed`,
        reason: action === "start" ? "start-failed" : "stop-failed",
        diagnostics: boundedDiagnostics({
          code: `civ7-autoplay-${action}-failed`,
          action,
          ...failureDiagnostics(err),
          cause: err,
        }),
      });
    }
  );
  if (!result.verified) {
    throw autoplayVerificationFailed({
      message: `Civ7 autoplay ${action} verification failed`,
      diagnostics: boundedDiagnostics({
        code: "civ7-autoplay-verification-failed",
        action,
        autoplay: result.after.autoplay,
        game: result.after.game,
        gameContext: result.after.gameContext,
      }),
    });
  }
  return {
    ok: true,
    action,
    autoplay: result.after.autoplay,
    game: result.after.game,
    gameContext: result.after.gameContext,
    result,
  };
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
    throw invalidEngineRequest("Run in Game leaf context is missing", "run-in-game-leaf-context-missing", {
      requestId,
    });
  }
  return context;
}

function requireSaveContext(
  contexts: ReadonlyMap<string, SaveDeployLeafContext>,
  requestId: string
): SaveDeployLeafContext {
  const context = contexts.get(requestId);
  if (!context) {
    throw invalidEngineRequest("Save/Deploy leaf context is missing", "save-deploy-leaf-context-missing", {
      requestId,
    });
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
