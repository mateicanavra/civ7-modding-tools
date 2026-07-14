import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { promisify } from "node:util";
import {
  Civ7DirectControlError,
  DEFAULT_CIV7_SCRIPTING_LOG,
  logTextFromSnapshot,
  snapshotFile,
  waitForFreshLogMarkers,
} from "@civ7/direct-control";
import { deployMod, resolveModsDir } from "@civ7/plugin-mods";
import {
  readStudioRunGenerationManifest,
  STUDIO_RUN_MAP_ROW_ID,
  STUDIO_RUN_MAP_SCRIPT_PATH,
  STUDIO_RUN_MOD_ID,
} from "@civ7/studio-run-workspace";
import type {
  RunInGameRequestStatus,
  StudioBoundedDiagnostics,
  StudioOperationRuntimePorts,
  StudioRuntimeFailure,
} from "@civ7/studio-server";
import {
  dependencyUnavailable,
  deployFailed,
  invalidRequest,
  isStudioRuntimeFailure,
  materializationFailed,
  verificationFailed,
} from "@civ7/studio-server";
import { admitSwooperCatalogConfig, readCatalogSourceIndex } from "mod-swooper-maps/maps/catalog";
import { validateStandardMapConfigSnapshot } from "mod-swooper-maps/maps/configs/canonical";
import { buildSwooperMapsStudioDeployPlan } from "../mapConfigs/deploy";
import { parseMapConfigSaveRequest } from "../mapConfigs/requestValidation";
import {
  buildRunInGameExactAuthorshipEvidence,
  runInGameMaterializationScriptUnresolvedLinks,
} from "../runInGame/authorshipEvidence";
import type { RunInGameDetailedEvidenceLog } from "../runInGame/evidenceTypes";
import {
  fileContentMarkerEvidence,
  fileIdentity,
  mapScriptEmbedsRequestId,
  runInGameRequiredMaterializationMarkers,
} from "../runInGame/fileEvidence";
import { waitForCiv7MapgenLogFailure } from "../runInGame/logFailure";
import {
  liveRuntimeStatusFromObservation,
  observeRunInGameRuntimeThroughStudioRpc,
} from "../runInGame/runtimeObservation";
import { parseSwooperMapgenLogEvidence } from "../runInGame/swooperLogEvidence";

// ============================================================================
// Studio operation leaf ports — app-side filesystem/deploy/direct-control atoms
// ----------------------------------------------------------------------------
// D4 moves lifecycle truth into `@civ7/studio-server`'s Effect runtime. This
// file deliberately does not own operation ids, admission, queues, registries,
// status/current projections, event publication, or runtime disposal. It only
// implements leaf work the package cannot own: repository writes, mod deploys,
// Civ7 direct-control calls, and evidence gathering.
// ============================================================================

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const RUN_MANIFEST_GENERATION_TIMEOUT_MS = 120_000;
const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;
const SCRIPTING_LOG_FAILURE_GRACE_MS = 5_000;
const SCRIPTING_LOG_FAILURE_POLL_INTERVAL_MS = 250;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;

function tail(value: string): string {
  return value.length > MAX_DEPLOY_OUTPUT_CHARS ? value.slice(-MAX_DEPLOY_OUTPUT_CHARS) : value;
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
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
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

// Deploy = the Nx build graph + the @civ7/plugin-mods deploy API (the
// rivers-era canonical shape; the old parsed-stdout deploy command is gone).
// Run evidence builds thread the selected launch envelope into the generated map
// script so post-deploy evidence can be tied back to one resolved source.
async function deploySwooperMaps(
  repoRoot: string,
  launchConfig: Readonly<{ id: string; path: string }>
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
  const plan = buildSwooperMapsStudioDeployPlan({ launchConfig });
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

async function generateSwooperRunMod(
  options: Readonly<{
    repoRoot: string;
    manifestPath: string;
    signal?: AbortSignal;
  }>
): Promise<{
  runArtifactId: string;
  generatedModRoot: string;
  mapRowId: string;
  mapScriptPath: string;
  fileCount: number;
  digest: string;
}> {
  await execFileAsync(
    "bun",
    ["nx", "run", "mod-swooper-maps:gen:run-manifest", "--", options.manifestPath],
    {
      cwd: options.repoRoot,
      timeout: RUN_MANIFEST_GENERATION_TIMEOUT_MS,
      maxBuffer: 16 * 1024 * 1024,
      signal: options.signal,
    }
  );
  const manifest = await readStudioRunGenerationManifest(options.manifestPath);
  const generatedModRoot = resolve(
    dirname(options.manifestPath),
    manifest.payload.workspace.generatedModRoot
  );
  const tree = await digestFileTree(generatedModRoot);
  return {
    runArtifactId: manifest.payload.runArtifactId,
    generatedModRoot,
    mapRowId: STUDIO_RUN_MAP_ROW_ID,
    mapScriptPath: STUDIO_RUN_MAP_SCRIPT_PATH,
    fileCount: tree.fileCount,
    digest: tree.digest,
  };
}

async function deployGeneratedSwooperRunMod(
  options: Readonly<{
    generatedModRoot: string;
  }>
): Promise<{
  targetDir: string;
  modsDir: string;
  filesCopied: number;
}> {
  const modsDir = resolveModsDir().modsDir;
  const deployed = deployMod({
    inputDir: options.generatedModRoot,
    modId: STUDIO_RUN_MOD_ID,
    modsDir,
  });
  return {
    targetDir: deployed.targetDir,
    modsDir: deployed.modsDir,
    filesCopied: deployed.filesCopied,
  };
}

async function snapshotDeployedMod(
  options: Readonly<{
    requestId: string;
    deployedModId: string;
    targetRoot: string;
    signal: AbortSignal;
  }>
): Promise<NonNullable<RunInGameDeployment["deployedSnapshot"]>> {
  throwIfRunDeployAborted(options.signal);
  const files = await listFiles(options.targetRoot);
  const snapshotFiles = await Promise.all(
    files.map(async (file) => {
      throwIfRunDeployAborted(options.signal);
      const relativePath = relative(options.targetRoot, file).replaceAll("\\", "/");
      const bytes = await readFile(file);
      const fileStat = await stat(file);
      return {
        path: relativePath,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        sizeBytes: fileStat.size,
        bytes,
      };
    })
  );
  throwIfRunDeployAborted(options.signal);
  const digest = createHash("sha256");
  for (const file of snapshotFiles) {
    digest.update(file.path, "utf8");
    digest.update("\0");
    digest.update(file.bytes);
    digest.update("\0");
  }
  return {
    requestId: options.requestId,
    deployedModId: options.deployedModId,
    targetRoot: options.targetRoot,
    observedAt: new Date().toISOString(),
    fileCount: snapshotFiles.length,
    digest: digest.digest("hex"),
    files: snapshotFiles.map(({ bytes: _bytes, ...file }) => file),
  };
}

function throwIfRunDeployAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw signal.reason instanceof Error
      ? signal.reason
      : new Error("Run in Game deployment was cancelled.");
  }
}

async function digestFileTree(root: string): Promise<{ fileCount: number; digest: string }> {
  const files = await listFiles(root);
  const hash = createHash("sha256");
  for (const file of files) {
    const relativePath = relative(root, file).replaceAll("\\", "/");
    hash.update(relativePath, "utf8");
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }
  return { fileCount: files.length, digest: hash.digest("hex") };
}

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = resolve(root, entry.name);
      if (entry.isDirectory()) return listFiles(absolute);
      return entry.isFile() ? [absolute] : [];
    })
  );
  return files.flat().sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
}

async function optionalFileIdentity(args: {
  repoRoot: string;
  path: string;
  exposeAs?: "relative-to-repo" | "absolute";
}) {
  return await fileIdentity(args).catch(() => undefined);
}

async function optionalFileContentMarkerEvidence(
  args: Parameters<typeof fileContentMarkerEvidence>[0]
) {
  return await fileContentMarkerEvidence(args).catch(() => undefined);
}

function generatedSourceScriptPath(generatedModRoot: string, runArtifactId: string): string {
  return resolve(generatedModRoot, ".source/maps", `${runArtifactId}.ts`);
}

function localModScriptPath(generatedModRoot: string, runArtifactId: string): string {
  void runArtifactId;
  return resolve(generatedModRoot, STUDIO_RUN_MAP_SCRIPT_PATH);
}

function deployedModScriptPath(targetDir: string, runArtifactId: string): string {
  void runArtifactId;
  return resolve(targetDir, STUDIO_RUN_MAP_SCRIPT_PATH);
}

function isNodeNotFound(err: unknown): boolean {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
}

/**
 * The app-side Swooper port owns catalog membership, immutable snapshotting, and
 * Standard semantics. Studio-server snapshots editor input and orchestrates both.
 */
export function createSwooperRunInGameCanonicalConfigAdmission(
  repoRoot: string
): NonNullable<StudioOperationRuntimePorts["runInGameCanonicalConfigAdmission"]> {
  const configRoot = resolve(repoRoot, "mods/mod-swooper-maps/src/maps/configs");

  return {
    resolveCatalogSource: async (sourcePath: string) => {
      const entries = await readdir(configRoot, { withFileTypes: true });
      const knownConfigPaths = new Set(
        entries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".config.json"))
          .map((entry) => relative(repoRoot, resolve(configRoot, entry.name)).replaceAll("\\", "/"))
      );
      const indexedSourcePaths = readCatalogSourceIndex({ knownConfigPaths });
      if (!indexedSourcePaths.includes(sourcePath)) return undefined;

      const sourceText = await readFile(resolve(repoRoot, sourcePath), "utf8");
      const sourceValue: unknown = JSON.parse(sourceText);
      try {
        return admitSwooperCatalogConfig({
          sourcePath,
          canonicalConfig: sourceValue,
        }).canonicalConfig;
      } catch (err) {
        throw invalidEngineRequest(
          err instanceof Error ? err.message : "Catalog config could not be admitted",
          "map-config-catalog-source-invalid",
          { sourcePath }
        );
      }
    },
    admit: async (canonicalConfig) => validateRepoMapConfigSnapshot(canonicalConfig),
  };
}

function validateRepoMapConfigSnapshot(
  canonicalConfig: Parameters<typeof validateStandardMapConfigSnapshot>[0]
) {
  try {
    return validateStandardMapConfigSnapshot(canonicalConfig);
  } catch (err) {
    throw invalidEngineRequest(
      err instanceof Error ? err.message : "Map config could not be admitted",
      "map-config-envelope-invalid"
    );
  }
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

type RunInGameGeneratedMod = Awaited<
  ReturnType<StudioOperationRuntimePorts["generateRunInGameMod"]>
>;
type RunInGameDeployment = Awaited<ReturnType<StudioOperationRuntimePorts["deployRunInGame"]>>;
type RunInGameStarted = Readonly<{
  setup?: { setupSnapshot?: unknown };
  start?: { mapSummary?: unknown };
}>;
type SaveDeployPrepared = Awaited<
  ReturnType<StudioOperationRuntimePorts["prepareSaveDeployStart"]>
>;

type RunInGameLeafContext = Readonly<{
  seed: number;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
  sourceSnapshotEvidence?: RunInGameRequestStatus["sourceSnapshot"];
  requestStatus: RunInGameRequestStatus;
}> & {
  materialization?: RunInGameGeneratedMod["materialization"];
  scriptingLogPath?: string;
  scriptingSnapshot?: Awaited<ReturnType<typeof snapshotFile>>;
  deployment?: RunInGameDeployment;
  launchMapScript?: string;
  rowEvidence?: unknown;
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
  options: Readonly<{ repoRoot: string; selfRpcUrl?: () => string | undefined }>
): StudioOperationRuntimePorts {
  const { repoRoot } = options;
  const runContexts = new Map<string, RunInGameLeafContext>();
  const saveContexts = new Map<string, SaveDeployLeafContext>();

  return {
    runInGameWorkspaceRoot: resolve(repoRoot, ".mapgen-studio/run-in-game"),
    runInGameCanonicalConfigAdmission: createSwooperRunInGameCanonicalConfigAdmission(repoRoot),
    generateRunInGameMod: async ({ generationManifest, signal }) => {
      const manifest = await readStudioRunGenerationManifest(generationManifest.path);
      const generated = await generateSwooperRunMod({
        repoRoot,
        manifestPath: generationManifest.path,
        signal,
      });
      const materialization = {
        path: relative(repoRoot, generated.generatedModRoot),
        mapScript: `{${STUDIO_RUN_MOD_ID}}/${generated.mapScriptPath}`,
        canonicalConfigDigest: manifest.payload.launchSourceDigest.canonicalConfigDigest,
        launchEnvelopeDigest: manifest.payload.launchEnvelopeDigest,
        generationManifestDigest: generationManifest.generationManifestDigest,
        runArtifactId: generated.runArtifactId,
        generatedModRoot: generated.generatedModRoot,
        generatedModFileCount: generated.fileCount,
        generatedModDigest: generated.digest,
        mapRowId: generated.mapRowId,
      };
      return {
        materialization,
        cleanup: async () => {
          runContexts.delete(manifest.payload.requestId);
        },
      };
    },
    deployRunInGame: async ({ requestId, prepared, generatedMod, signal }) => {
      throwIfRunDeployAborted(signal);
      const context = makeRunInGameLeafContext({ requestId, prepared });
      const materialization = requireContextValue(
        generatedMod.materialization,
        "Run in Game generated mod materialization",
        requestId
      );
      context.materialization = materialization;
      runContexts.set(requestId, context);
      context.scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
      context.scriptingSnapshot = await snapshotFile(context.scriptingLogPath);
      const generatedModRoot = requireContextValue(
        materialization.generatedModRoot,
        "Run in Game generated mod root",
        requestId
      );
      const runArtifactId = requireContextValue(
        materialization.runArtifactId,
        "Run in Game run artifact id",
        requestId
      );
      const deploymentStartedAt = new Date().toISOString();
      throwIfRunDeployAborted(signal);
      const deploy = await deployGeneratedSwooperRunMod({ generatedModRoot });
      throwIfRunDeployAborted(signal);
      const deployedSnapshot = await snapshotDeployedMod({
        requestId,
        deployedModId: STUDIO_RUN_MOD_ID,
        targetRoot: deploy.targetDir,
        signal,
      });
      throwIfRunDeployAborted(signal);
      if (deployedSnapshot.digest !== materialization.generatedModDigest) {
        throw deployFailed({
          message: "Deployed Studio run mod snapshot does not match the generated mod",
          reason: "deploy-failed",
          diagnostics: boundedDiagnostics({
            code: "run-in-game-deployed-snapshot-digest-mismatch",
            requestId,
            deployedModId: STUDIO_RUN_MOD_ID,
            targetRoot: deploy.targetDir,
            generatedModDigest: materialization.generatedModDigest,
            deployedModDigest: deployedSnapshot.digest,
            generatedModFileCount: materialization.generatedModFileCount,
            deployedModFileCount: deployedSnapshot.fileCount,
          }),
          recoveryActions: [
            "copy-diagnostics",
            "retry-status",
            "retry-run",
            "inspect-deploy-output",
          ],
        });
      }
      const runDeployment: NonNullable<RunInGameDeployment["runDeployment"]> = {
        requestId,
        deployedModId: STUDIO_RUN_MOD_ID,
        generatedModRoot,
        generatedModDigest: materialization.generatedModDigest,
        targetRoot: deploy.targetDir,
        startedAt: deploymentStartedAt,
        completedAt: deployedSnapshot.observedAt,
        filesCopied: deploy.filesCopied,
      };
      const generatedSourceScript = await optionalFileIdentity({
        repoRoot,
        path: generatedSourceScriptPath(generatedModRoot, runArtifactId),
        exposeAs: "absolute",
      });
      throwIfRunDeployAborted(signal);
      const localModScript = await optionalFileIdentity({
        repoRoot,
        path: localModScriptPath(generatedModRoot, runArtifactId),
        exposeAs: "absolute",
      });
      throwIfRunDeployAborted(signal);
      const deployedModScript = await optionalFileIdentity({
        repoRoot,
        path: deployedModScriptPath(deploy.targetDir, runArtifactId),
        exposeAs: "absolute",
      });
      throwIfRunDeployAborted(signal);
      const requiredMaterializationMarkers = runInGameRequiredMaterializationMarkers({
        requestId,
        canonicalConfigDigest: context.canonicalConfigDigest,
        launchEnvelopeDigest: context.launchEnvelopeDigest,
      });
      const localModScriptContent = await optionalFileContentMarkerEvidence({
        repoRoot,
        path: localModScriptPath(generatedModRoot, runArtifactId),
        exposeAs: "absolute",
        markers: requiredMaterializationMarkers,
      });
      throwIfRunDeployAborted(signal);
      const deployedModScriptContent = await optionalFileContentMarkerEvidence({
        repoRoot,
        path: deployedModScriptPath(deploy.targetDir, runArtifactId),
        exposeAs: "absolute",
        markers: requiredMaterializationMarkers,
      });
      throwIfRunDeployAborted(signal);
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
          message:
            "Generated Swooper map script is missing current materialization evidence markers",
          diagnostics: boundedDiagnostics({
            code: "map-script-materialization-evidence-missing",
            unresolvedLinks: unresolved,
            materialization: context.materialization,
          }),
        });
      }

      const localBundlePath = localModScriptPath(generatedModRoot, runArtifactId);
      const localBundleText = await readFile(localBundlePath, "utf8").catch(() => "");
      if (!mapScriptEmbedsRequestId(localBundleText, requestId)) {
        throw materializationFailed({
          message:
            "Generated map bundle does not embed the Run in Game request id; the in-game evidence could never match.",
          diagnostics: boundedDiagnostics({
            code: "run-request-id-not-materialized",
            requestId,
            mapScript: materialization.mapScript,
            localModScript: localBundlePath,
            recoveryHint:
              "Regenerate the request-local Studio run mod from its generation manifest, then retry the run.",
            materialization: context.materialization,
          }),
        });
      }

      context.deployment = {
        materialization: context.materialization,
        deploy,
        runDeployment,
        deployedSnapshot,
      };
      context.launchMapScript = materialization.mapScript;
      return context.deployment;
    },
    waitForRunInGameLogEvidence: async ({ requestId, setup, started }) => {
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
      const logMarkerEvidence = await waitForFreshLogMarkers({
        logPath: scriptingLogPath,
        snapshot: scriptingSnapshot,
        markers: [
          "[mapgen-evidence]",
          requestId,
          context.canonicalConfigDigest,
          context.launchEnvelopeDigest,
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
          throw verificationFailed({
            message: mapgenFailure.message,
            reason: "log-evidence-missing",
            diagnostics: boundedDiagnostics({
              ...mapgenFailure,
              materialization,
              cause: err instanceof Error ? err.message : String(err),
            }),
          });
        }
        throw unavailableEngineDependency(
          "Civ7 mapgen log evidence is unavailable",
          "direct-control-evidence-unavailable",
          err,
          { materialization }
        );
      });
      const freshLogText = await readFreshLogText(scriptingLogPath, scriptingSnapshot).catch(
        () => ""
      );
      const logEvidence = parseSwooperMapgenLogEvidence({
        text: freshLogText,
        logPath: logMarkerEvidence.logPath,
        observedAt: logMarkerEvidence.observedAt,
        requestId,
        canonicalConfigDigest: context.canonicalConfigDigest,
        launchEnvelopeDigest: context.launchEnvelopeDigest,
        seed: context.seed,
      });
      if (!logEvidence) {
        throw verificationFailed({
          message: "Swooper log evidence payload did not match the Studio Run in Game request",
          reason: "log-evidence-missing",
          diagnostics: boundedDiagnostics({
            code: "swooper-log-evidence-missing",
            requestId,
            canonicalConfigDigest: context.canonicalConfigDigest,
            launchEnvelopeDigest: context.launchEnvelopeDigest,
            seed: context.seed,
            markers: logMarkerEvidence.matched,
            materialization,
          }),
        });
      }
      context.rowEvidence = setup.rowEvidence;
      context.rowVisibility = setup.rowVisibility;
      context.started = started;
      return {
        result: {
          ok: true,
          requestId,
          materialization,
          deploy: context.deployment?.deploy,
          rowEvidence: setup.rowEvidence,
          rowVisibility: setup.rowVisibility,
          start: started.start,
          logMarkerEvidence,
          logEvidence,
        },
        materialization,
        logMarkerEvidence,
        logEvidence,
      };
    },
    observeRunInGameRuntime: async ({ requestId, prepared, deployment, setup, log, signal }) => {
      const context = requireRunContext(runContexts, requestId);
      const observation = await observeRunInGameRuntimeThroughStudioRpc({
        requestId,
        prepared,
        deployment,
        setup,
        log,
        selfRpcUrl: options.selfRpcUrl?.(),
        signal,
      });
      context.rowEvidence = setup.rowEvidence;
      context.rowVisibility = setup.rowVisibility;
      return observation;
    },
    buildRunInGameEvidence: async ({ requestId, setup, started, log, observation }) => {
      const context = requireRunContext(runContexts, requestId);
      const materialization = requireMaterialization(context, requestId);
      const liveRuntimeStatus = liveRuntimeStatusFromObservation(observation.loadedGame.liveStatus);
      const exactAuthorshipEvidence = buildRunInGameExactAuthorshipEvidence({
        requestId,
        request: context.requestStatus,
        sourceSnapshot: context.sourceSnapshotEvidence,
        materialization,
        sourceConfig: materialization.sourceConfig,
        generatedSourceScript: materialization.generatedSourceScript,
        localModScript: materialization.localModScript,
        deployedModScript: materialization.deployedModScript,
        rowEvidence: setup.rowEvidence,
        setupSnapshot: started.setup?.setupSnapshot ?? setup.setupSnapshot,
        startMapSummary: started.start?.mapSummary,
        logEvidence: log.logEvidence as RunInGameDetailedEvidenceLog | undefined,
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
          rowEvidence: setup.rowEvidence,
          rowVisibility: setup.rowVisibility,
          start: started.start,
          logMarkerEvidence: log.logMarkerEvidence,
          logEvidence: log.logEvidence,
          exactAuthorshipEvidence,
        },
        materialization,
        exactAuthorshipEvidence,
      };
    },
    prepareSaveDeployStart: async ({ requestId, input }) => {
      const request = parseSaveDeployInput(input);
      const parsedRequest = {
        ...request,
        canonicalConfig: validateRepoMapConfigSnapshot(request.canonicalConfig),
      };
      const configRoot = resolve(repoRoot, "mods/mod-swooper-maps/src/maps/configs");
      const target = resolve(configRoot, `${parsedRequest.canonicalConfig.id}.config.json`);
      if (!target.startsWith(`${configRoot}/`) || !target.endsWith(".config.json")) {
        throw invalidEngineRequest(
          "Map config writes must stay in mods/mod-swooper-maps/src/maps/configs",
          "map-config-path-outside-config-root",
          { path: target }
        );
      }
      const path = relative(repoRoot, target);
      const previous = await readFile(target, "utf8").catch((err: unknown) => {
        if (isNodeNotFound(err)) return null;
        throw unavailableEngineDependency(
          "Unable to read existing map config before Save/Deploy",
          "save-deploy-existing-config-unavailable",
          err,
          { path }
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
        `${JSON.stringify(context.parsedRequest.canonicalConfig, null, 2)}\n`
      );
      return { path: context.path, saved: true };
    },
    deploySavedMapConfig: async ({ requestId }) => {
      const context = requireSaveContext(saveContexts, requestId);
      const path = requireContextValue(context.path, "Save/Deploy config path", requestId);
      const deploy = await deploySwooperMaps(repoRoot, {
        id: context.parsedRequest.canonicalConfig.id,
        path,
      });
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
      prepared: Parameters<StudioOperationRuntimePorts["deployRunInGame"]>[0]["prepared"];
    }>
  ): RunInGameLeafContext {
    const launchEnvelope = args.prepared.launchEnvelope;
    const seed = Number(launchEnvelope.recipeSettings.seed);
    const mapSize = launchEnvelope.worldSettings.mapSize;
    const playerCount = launchEnvelope.worldSettings.playerCount;
    const setupConfig = launchEnvelope.setupConfig;
    const canonicalConfigDigest = args.prepared.launchSourceDigest.canonicalConfigDigest;
    const launchEnvelopeDigest = args.prepared.launchEnvelopeDigest;
    const sourceSnapshotEvidence = args.prepared.request.sourceSnapshot;
    const requestStatus: RunInGameRequestStatus = {
      recipeId: launchEnvelope.recipeSettings.recipe,
      seed,
      mapSize,
      ...(playerCount === undefined ? {} : { playerCount }),
      setupConfig,
      ...(sourceSnapshotEvidence ? { sourceSnapshot: sourceSnapshotEvidence } : {}),
      launchSourceDigest: args.prepared.launchSourceDigest,
      launchEnvelopeDigest: args.prepared.launchEnvelopeDigest,
    };
    return {
      seed,
      canonicalConfigDigest,
      launchEnvelopeDigest,
      ...(sourceSnapshotEvidence ? { sourceSnapshotEvidence } : {}),
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
): NonNullable<RunInGameGeneratedMod["materialization"]> {
  return requireContextValue(context.materialization, "Run in Game materialization", requestId);
}

function requireContextValue<T>(value: T | undefined, label: string, requestId: string): T {
  if (value !== undefined) return value;
  throw invalidEngineRequest(`${label} is missing`, "run-in-game-leaf-context-incomplete", {
    requestId,
    label,
  });
}
