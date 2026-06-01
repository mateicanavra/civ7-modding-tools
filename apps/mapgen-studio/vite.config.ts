import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  CIV7_RESTART_COMMAND,
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
  getCiv7PlayerSummary,
  getCiv7UnitSummary,
  ensureCiv7SetupMapRowVisible,
  runCiv7SinglePlayerFromSetup,
  restartCiv7GameAndBegin,
  snapshotFile,
  waitForFreshLogMarkers,
  type FreshLogMarkerProof,
} from "@civ7/direct-control";

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;
const DIRECT_CONTROL_AGENT = "DRA-map-config-generation";
const RUN_IN_GAME_OPERATION_TTL_MS = 30 * 60_000;
const STUDIO_SERVER_STARTED_AT = new Date().toISOString();
const STUDIO_SERVER_INSTANCE_ID = createCiv7ControlRequestId("studio-server");

let saveDeployRestartQueue = Promise.resolve();

type RunInGamePhase =
  | "idle"
  | "materializing"
  | "deploying"
  | "checking-civ7"
  | "reload-needed"
  | "preparing-setup"
  | "starting-game"
  | "waiting-for-proof"
  | "complete"
  | "blocked"
  | "failed"
  | "uncertain";

type RunInGameStatusKind = "idle" | "running" | "complete" | "blocked" | "failed" | "uncertain";

type RunInGameOperationState = {
  ok: boolean;
  requestId: string;
  phase: RunInGamePhase;
  status: RunInGameStatusKind;
  startedAt: string;
  updatedAt: string;
  serverInstanceId: string;
  serverStartedAt: string;
  completedPhases: RunInGamePhase[];
  materialization?: {
    mode?: string;
    path?: string;
    mapScript?: string;
    configHash?: string;
    envelopeHash?: string;
  };
  error?: string;
  details?: Record<string, unknown>;
  result?: unknown;
  recoveryActions: string[];
};

const runInGameOperations = new Map<string, RunInGameOperationState>();

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

type ScriptingLogProof = FreshLogMarkerProof;

class RunInGameHttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}

async function deploySwooperMaps(repoRoot: string): Promise<{
  command: string;
  stdout: string;
  stderr: string;
}> {
  const command = "bun run --cwd mods/mod-swooper-maps deploy";
  const { stdout, stderr } = await execFileAsync(
    "bun",
    ["run", "--cwd", "mods/mod-swooper-maps", "deploy"],
    {
      cwd: repoRoot,
      timeout: DEPLOY_TIMEOUT_MS,
      maxBuffer: 16 * 1024 * 1024,
      env: process.env,
    }
  );
  return {
    command,
    stdout: tail(stdout),
    stderr: tail(stderr),
  };
}

async function deploySwooperMapsForRun(repoRoot: string, requestId: string): Promise<{
  command: string;
  stdout: string;
  stderr: string;
}> {
  const command = "SWOOPER_STUDIO_RUN_ID=<request> bun run --cwd mods/mod-swooper-maps deploy";
  const { stdout, stderr } = await execFileAsync(
    "bun",
    ["run", "--cwd", "mods/mod-swooper-maps", "deploy"],
    {
      cwd: repoRoot,
      timeout: DEPLOY_TIMEOUT_MS,
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, SWOOPER_STUDIO_RUN_ID: requestId },
    }
  );
  return {
    command,
    stdout: tail(stdout),
    stderr: tail(stderr),
  };
}

async function regenerateSwooperMapArtifacts(repoRoot: string): Promise<void> {
  await execFileAsync("bun", ["run", "--cwd", "mods/mod-swooper-maps", "gen:maps"], {
    cwd: repoRoot,
    timeout: DEPLOY_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
  });
}

const SWOOPER_MAP_GENERATION_MARKERS = [
  "Creating Context -  MapGeneration",
  "[SWOOPER_MOD] [recipe:standard] [50/50] ok mod-swooper-maps.standard.placement.placement",
  "Destroying Context -  MapGeneration",
] as const;

async function requestCiv7Restart(options?: { verify?: boolean }): Promise<{
  requestId: string;
  agent: string;
  command: string;
  transport: "direct";
  host: string;
  port: number;
  state: unknown;
  output: ReadonlyArray<string>;
  beginOutput?: ReadonlyArray<string>;
  finalLoadingState?: string | null;
  tunerReady?: boolean;
  scriptingLog?: ScriptingLogProof;
}> {
  const requestId = createCiv7ControlRequestId("studio-socket");
  const scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
  const scriptingSnapshot = options?.verify
    ? await snapshotFile(scriptingLogPath)
    : undefined;
  const response = await restartCiv7GameAndBegin({
    waitForTuner: true,
    timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
    waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
  });

  const scriptingLog =
    options?.verify && scriptingSnapshot
      ? await waitForFreshLogMarkers({
          logPath: scriptingLogPath,
          snapshot: scriptingSnapshot,
          markers: SWOOPER_MAP_GENERATION_MARKERS,
          timeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
          rejectPattern: /\b(?:TextEncoder|Uncaught|Exception|Error)\b/i,
        })
      : undefined;

  return {
    requestId,
    agent: DIRECT_CONTROL_AGENT,
    command: CIV7_RESTART_COMMAND,
    transport: "direct",
    host: response.restart.host,
    port: response.restart.port,
    state: response.restart.state,
    output: response.restart.output,
    beginOutput: response.begin?.output,
    finalLoadingState: response.finalAppUi.snapshot.ui.loadingStateName,
    tunerReady: response.tunerHealth?.ready,
    scriptingLog,
  };
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

function assertNoRawControlFields(value: unknown): void {
  if (!value || typeof value !== "object") return;
  const stack = [value as Record<string, unknown>];
  while (stack.length) {
    const next = stack.pop()!;
    for (const [key, child] of Object.entries(next)) {
      if (/^(?:command|script|javascript|rawJs|rawCommand)$/i.test(key)) {
        throw new Error("Run in Game request must not include raw control commands");
      }
      if (child && typeof child === "object" && !Array.isArray(child)) {
        stack.push(child as Record<string, unknown>);
      }
    }
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

function writeJson(res: { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function nowIso(): string {
  return new Date().toISOString();
}

function statusForPhase(phase: RunInGamePhase): RunInGameStatusKind {
  if (phase === "idle") return "idle";
  if (phase === "complete") return "complete";
  if (phase === "blocked") return "blocked";
  if (phase === "failed") return "failed";
  if (phase === "uncertain") return "uncertain";
  return "running";
}

function recoveryActionsFor(state: Pick<RunInGameOperationState, "phase" | "status" | "details">): string[] {
  const actions = ["copy-diagnostics"];
  if (state.status === "running" || state.status === "blocked" || state.status === "failed" || state.status === "uncertain") {
    actions.push("retry-status");
  }
  if (state.status === "failed" || state.status === "blocked" || state.status === "uncertain") {
    actions.push("retry-run");
  }
  if (state.details?.reloadRequired === true || state.phase === "reload-needed") {
    actions.push("exit-to-shell-and-continue");
  }
  return [...new Set(actions)];
}

function pruneRunInGameOperations(): void {
  const cutoff = Date.now() - RUN_IN_GAME_OPERATION_TTL_MS;
  for (const [requestId, state] of runInGameOperations) {
    if (Date.parse(state.updatedAt) < cutoff) runInGameOperations.delete(requestId);
  }
}

function createRunInGameOperation(requestId: string): RunInGameOperationState {
  pruneRunInGameOperations();
  const startedAt = nowIso();
  const state: RunInGameOperationState = {
    ok: true,
    requestId,
    phase: "materializing",
    status: "running",
    startedAt,
    updatedAt: startedAt,
    serverInstanceId: STUDIO_SERVER_INSTANCE_ID,
    serverStartedAt: STUDIO_SERVER_STARTED_AT,
    completedPhases: [],
    recoveryActions: ["copy-diagnostics", "retry-status"],
  };
  runInGameOperations.set(requestId, state);
  return state;
}

function updateRunInGameOperation(
  requestId: string,
  patch: Partial<Omit<RunInGameOperationState, "requestId" | "startedAt" | "serverInstanceId" | "serverStartedAt">>,
): RunInGameOperationState {
  const current = runInGameOperations.get(requestId);
  if (!current) throw new Error(`Unknown Run in Game request id: ${requestId}`);
  const phase = patch.phase ?? current.phase;
  const completedPhases = [...current.completedPhases];
  if (phase !== current.phase && current.status === "running" && !completedPhases.includes(current.phase)) {
    completedPhases.push(current.phase);
  }
  const status = patch.status ?? statusForPhase(phase);
  const next: RunInGameOperationState = {
    ...current,
    ...patch,
    phase,
    status,
    completedPhases: patch.completedPhases ? [...patch.completedPhases] : completedPhases,
    updatedAt: nowIso(),
    recoveryActions: patch.recoveryActions ?? recoveryActionsFor({
      phase,
      status,
      details: patch.details ?? current.details,
    }),
  };
  runInGameOperations.set(requestId, next);
  return next;
}

function completeRunInGameOperation(
  requestId: string,
  result: unknown,
  materialization?: RunInGameOperationState["materialization"],
): RunInGameOperationState {
  return updateRunInGameOperation(requestId, {
    ok: true,
    phase: "complete",
    status: "complete",
    result,
    materialization,
    recoveryActions: ["copy-diagnostics"],
  });
}

function failRunInGameOperation(
  requestId: string,
  phase: RunInGamePhase,
  err: unknown,
  materialization?: RunInGameOperationState["materialization"],
): RunInGameOperationState {
  const current = runInGameOperations.get(requestId);
  const details = runInGameFailureDetails(err, phase, current, materialization);
  const status = details.failureClass === "blocked"
    ? "blocked"
    : details.failureClass === "uncertain"
      ? "uncertain"
      : "failed";
  return updateRunInGameOperation(requestId, {
    ok: false,
    phase: status,
    status,
    error: err instanceof Error ? err.message : String(err),
    details,
    materialization,
  });
}

function runInGameFailureDetails(
  err: unknown,
  phase: RunInGamePhase,
  state?: RunInGameOperationState,
  materialization?: RunInGameOperationState["materialization"],
): Record<string, unknown> {
  const directControlCode = err instanceof Civ7DirectControlError ? err.code : undefined;
  const httpDetails = err instanceof RunInGameHttpError && isRecord(err.details)
    ? err.details
    : {};
  const failureClass = classifyRunInGameFailure(err, phase);
  return {
    ...httpDetails,
    failureClass,
    phase,
    completedPhases: state?.completedPhases ?? [],
    materialization: materialization ?? httpDetails.materialization,
    directControlCode,
    code: directControlCode ?? httpDetails.code,
    cause: err instanceof Civ7DirectControlError ? cloneForJson(err.details) : undefined,
  };
}

function classifyRunInGameFailure(err: unknown, phase: RunInGamePhase): "blocked" | "failed" | "uncertain" {
  if (err instanceof RunInGameHttpError && err.statusCode === 409) return "blocked";
  const code = err instanceof Civ7DirectControlError ? err.code : undefined;
  if (
    (phase === "starting-game" || phase === "waiting-for-proof") &&
    (code === "response-timeout" || code === "socket-closed" || code === "connection-timeout" || code === "all-hosts-unavailable")
  ) {
    return "uncertain";
  }
  return "failed";
}

function cloneForJson(value: unknown): unknown {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function restoreRepoConfig(target: string, previous: string | null): Promise<void> {
  if (previous === null) {
    await rm(target, { force: true });
    return;
  }
  await writeFile(target, previous);
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: "repo-backed-map-configs",
      configureServer(server) {
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
        server.middlewares.use("/api/civ7/run-in-game/status", async (req, res, next) => {
          if (req.method !== "GET") return next();
          const url = new URL(req.url ?? "", "http://localhost");
          const requestId = url.searchParams.get("requestId");
          if (!requestId) {
            writeJson(res, 400, { ok: false, error: "Missing requestId" });
            return;
          }
          pruneRunInGameOperations();
          const status = runInGameOperations.get(requestId);
          if (!status) {
            writeJson(res, 404, {
              ok: false,
              error: `Run in Game request not found: ${requestId}`,
              serverInstanceId: STUDIO_SERVER_INSTANCE_ID,
              serverStartedAt: STUDIO_SERVER_STARTED_AT,
            });
            return;
          }
          writeJson(res, 200, status);
        });
        server.middlewares.use("/api/civ7/run-in-game", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const body = await readJsonBody<{
              recipeId?: unknown;
              seed?: unknown;
              mapSize?: unknown;
              playerCount?: unknown;
              resources?: unknown;
              materialization?: { mode?: unknown };
              config?: unknown;
              selectedConfig?: {
                id?: unknown;
                label?: unknown;
                description?: unknown;
                sourcePath?: unknown;
                sortIndex?: unknown;
                latitudeBounds?: unknown;
              };
            }>(req);
            assertNoRawControlFields(body);
            if (body.recipeId !== "mod-swooper-maps/standard") {
              throw new Error("Run in Game currently supports only mod-swooper-maps/standard");
            }
            if (!body.config || typeof body.config !== "object" || Array.isArray(body.config)) {
              throw new Error("Run in Game requires a sanitized config object");
            }
            const selected = body.selectedConfig ?? {};
            const requestedMode = body.materialization?.mode === "durable" ? "durable" : "disposable";
            const id = requestedMode === "disposable"
              ? "studio-current"
              : typeof selected.id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selected.id)
                ? selected.id
                : "studio-current";
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error("Run in Game map config id must be kebab-case");
            const seed = Number(body.seed);
            if (!Number.isInteger(seed)) throw new Error("Run in Game seed must be an integer");
            const mapSize = typeof body.mapSize === "string" ? body.mapSize : "MAPSIZE_STANDARD";
            if (!/^MAPSIZE_[A-Z0-9_]+$/.test(mapSize)) throw new Error("Run in Game mapSize must be a Civ7 MAPSIZE_* value");
            const playerCount = body.playerCount === undefined ? undefined : Number(body.playerCount);
            if (playerCount !== undefined && (!Number.isInteger(playerCount) || playerCount < 1 || playerCount > 64)) {
              throw new Error("Run in Game playerCount must be an integer between 1 and 64");
            }
            const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
            const configHash = stableHash(body.config);
            const envelope = makeRepoMapEnvelope({
              id,
              name: typeof selected.label === "string" ? selected.label : id,
              description: typeof selected.description === "string" ? selected.description : undefined,
              sortIndex: typeof selected.sortIndex === "number" ? selected.sortIndex : requestedMode === "disposable" ? 9999 : 900,
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
            const requestId = createCiv7ControlRequestId("studio-run-in-game");
            const operation = createRunInGameOperation(requestId);
            const run = async () => {
              let materialized: Awaited<ReturnType<typeof materializeRunInGameConfig>> | undefined;
              let materialization: RunInGameOperationState["materialization"] = {
                mode: requestedMode,
                configHash,
                envelopeHash,
              };
              let phase: RunInGamePhase = "materializing";
              try {
                updateRunInGameOperation(requestId, { phase });
                materialized = await materializeRunInGameConfig({
                  repoRoot,
                  id,
                  sourcePath: requestedMode === "durable" && typeof selected.sourcePath === "string" ? selected.sourcePath : undefined,
                  envelope,
                  mode: requestedMode,
                });
                materialization = {
                  mode: requestedMode,
                  path: materialized.path,
                  mapScript: materialized.mapScript,
                  configHash,
                  envelopeHash,
                };
                updateRunInGameOperation(requestId, { materialization });

                const scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
                const scriptingSnapshot = await snapshotFile(scriptingLogPath);

                phase = "deploying";
                updateRunInGameOperation(requestId, { phase, materialization });
                let deploy;
                deploy = await deploySwooperMapsForRun(repoRoot, requestId);

                phase = "checking-civ7";
                updateRunInGameOperation(requestId, { phase, materialization });
                await getCiv7PlayableStatus({ timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS }).catch((err) => {
                  throw new RunInGameHttpError(503, "Civ7 direct-control status is unavailable", {
                    code: "direct-control-status-unavailable",
                    cause: cloneForJson(err instanceof Civ7DirectControlError ? err.details : err),
                    materialization,
                  });
                });

                const rowVisibility = await ensureCiv7SetupMapRowVisible(
                  {
                    file: materialized.mapScript,
                    limit: 20,
                    reloadIfMissing: requestedMode === "disposable" ? "exit-to-shell" : "none",
                    waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                    pollIntervalMs: 1_000,
                  },
                  { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS },
                  { approved: true, reason: "Studio Run in Game setup row reload", disposableSession: true },
                );
                if (rowVisibility.refreshed) {
                  phase = "reload-needed";
                  updateRunInGameOperation(requestId, { phase, materialization });
                }
                const rowProof = rowVisibility.final;
                if (rowProof.rows.length === 0) {
                  throw new RunInGameHttpError(409, `Civ7 setup cannot see ${materialized.mapScript}`, {
                    code: "setup-map-row-not-visible",
                    reloadRequired: true,
                    reloadBoundary: requestedMode === "disposable" ? "process-restart-required" : "setup-row-missing",
                    reloadAttempted: rowVisibility.refreshed,
                    mapScript: materialized.mapScript,
                    materialization: {
                      mode: requestedMode,
                      path: materialized.path,
                    },
                  });
                }

                phase = "preparing-setup";
                updateRunInGameOperation(requestId, { phase, materialization });

                phase = "starting-game";
                updateRunInGameOperation(requestId, { phase, materialization });
                const start = await runCiv7SinglePlayerFromSetup(
                  {
                    mapScript: materialized.mapScript,
                    mapSize,
                    seed,
                    ...(playerCount === undefined ? {} : { playerCount }),
                    fromRunningGame: "exit-to-shell",
                    waitForTuner: true,
                    waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                  },
                  { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS },
                  { approved: true, reason: "Studio Run in Game", disposableSession: true },
                );

                phase = "waiting-for-proof";
                updateRunInGameOperation(requestId, { phase, materialization });
                const logProof = await waitForFreshLogMarkers({
                  logPath: scriptingLogPath,
                  snapshot: scriptingSnapshot,
                  markers: ["[mapgen-proof]", requestId, configHash, envelopeHash],
                  timeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                  rejectPattern: /\b(?:TextEncoder|Uncaught|Exception|Error)\b/i,
                });

                completeRunInGameOperation(requestId, {
                  ok: true,
                  requestId,
                  materialization,
                  deploy,
                  rowProof,
                  rowVisibility,
                  start,
                  logProof,
                }, materialization);
              } catch (err) {
                failRunInGameOperation(requestId, phase, err, materialization);
              } finally {
                try {
                  await materialized?.cleanup();
                } finally {
                  await regenerateSwooperMapArtifacts(repoRoot);
                }
              }
            };
            const nextRun = saveDeployRestartQueue.then(run, run);
            saveDeployRestartQueue = nextRun.then(
              () => undefined,
              () => undefined
            );
            writeJson(res, 202, operation);
          } catch (err) {
            const error = err instanceof Error ? err.message : "Run in Game failed";
            const statusCode = err instanceof RunInGameHttpError ? err.statusCode : 500;
            const details = err instanceof RunInGameHttpError ? err.details : undefined;
            writeJson(res, statusCode, { ok: false, error, ...(details === undefined ? {} : { details }) });
          }
        });
        server.middlewares.use("/api/map-configs", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const body = JSON.parse(Buffer.concat(chunks).toString("utf-8")) as {
              id?: unknown;
              sourcePath?: unknown;
              envelope?: unknown;
              verifyRestart?: unknown;
            };
            if (typeof body.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.id)) {
              throw new Error("Map config id must be kebab-case");
            }
            assertRepoMapEnvelope(body.envelope, body.id);
            const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
            const configRoot = resolve(repoRoot, "mods/mod-swooper-maps/src/maps/configs");
            const target = body.sourcePath
              ? resolve(repoRoot, String(body.sourcePath))
              : resolve(configRoot, `${body.id}.config.json`);
            if (!target.startsWith(`${configRoot}/`) || !target.endsWith(".config.json")) {
              throw new Error(
                "Map config writes must stay in mods/mod-swooper-maps/src/maps/configs"
              );
            }
            const path = relative(repoRoot, target);
            const run = async () => {
              const previous = await readFile(target, "utf8").catch((err: unknown) => {
                if (isNodeNotFound(err)) return null;
                throw err;
              });
              await mkdir(dirname(target), { recursive: true });
              await writeFile(target, `${JSON.stringify(body.envelope, null, 2)}\n`);
              let deploy;
              try {
                deploy = await deploySwooperMaps(repoRoot);
              } catch (err) {
                await restoreRepoConfig(target, previous);
                const error = err instanceof Error ? err.message : "Deploy failed";
                writeJson(res, 500, { ok: false, saved: false, path, error });
                return;
              }
              let restart;
              try {
                restart = await requestCiv7Restart({ verify: body.verifyRestart === true });
              } catch (err) {
                const error = err instanceof Error ? err.message : "Civ7 restart request failed";
                writeJson(res, 500, { ok: false, saved: true, deployed: true, path, deploy, error });
                return;
              }
              writeJson(res, 200, { ok: true, path, deploy, restart });
            };
            const nextRun = saveDeployRestartQueue.then(run, run);
            saveDeployRestartQueue = nextRun.then(
              () => undefined,
              () => undefined
            );
            await nextRun;
          } catch (err) {
            const error = err instanceof Error ? err.message : "Save failed";
            writeJson(res, 400, { ok: false, error });
          }
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
        "**/mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      ],
    },
  },
}));
