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
  snapshotFile,
  waitForFreshLogMarkers,
} from "@civ7/direct-control";
import { loadCiv7SetupCatalog } from "./src/server/civ7Resources/catalog";
import {
  RunInGameHttpError,
  createRunInGameOperationStore,
  type RunInGameOperationState,
} from "./src/server/runInGame/operationState";
import { parseRunInGameSetupRequest } from "./src/server/runInGame/requestValidation";
import { buildSwooperMapsStudioDeployCommand } from "./src/server/mapConfigs/deploy";
import { createMapConfigSaveDeployOperationStore } from "./src/server/mapConfigs/operationState";
import { parseMapConfigSaveRequest } from "./src/server/mapConfigs/requestValidation";
import type { RunInGamePhase, RunInGameRequestStatus } from "./src/features/runInGame/status";

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;
const RUN_IN_GAME_OPERATION_TTL_MS = 30 * 60_000;
const CIV7_STEAM_APP_ID = "1295660";
const CIV7_PROCESS_RESTART_WAIT_TIMEOUT_MS = 180_000;
const CIV7_PROCESS_RESTART_POLL_INTERVAL_MS = 2_000;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function restartCiv7ProcessViaSteam(): Promise<{
  command: string;
  quit: { command: string; stdout: string; stderr: string };
  kill?: { command: string; stdout: string; stderr: string };
  launch: { command: string; stdout: string; stderr: string };
  setupPhase?: string;
}> {
  if (process.platform !== "darwin") {
    throw new Error("Civ7 process restart from Studio is currently supported on macOS only");
  }

  const quitCommand = "osascript -e 'tell application id \"com.2k.civ7\" to quit'";
  const quitResult = await execFileAsync("osascript", ["-e", 'tell application id "com.2k.civ7" to quit'], {
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
  }).catch((err: unknown) => {
    if (err && typeof err === "object" && "stdout" in err && "stderr" in err) {
      return { stdout: String((err as { stdout?: unknown }).stdout ?? ""), stderr: String((err as { stderr?: unknown }).stderr ?? "") };
    }
    throw err;
  });

  await sleep(5_000);

  let killResult: { command: string; stdout: string; stderr: string } | undefined;
  const stillRunning = await execFileAsync("pgrep", ["-f", "CivilizationVII.app/Contents/MacOS/CivilizationVII"], {
    timeout: 5_000,
    maxBuffer: 1024 * 1024,
  }).then(
    () => true,
    () => false,
  );
  if (stillRunning) {
    const killCommand = "pkill -f CivilizationVII.app/Contents/MacOS/CivilizationVII";
    const { stdout, stderr } = await execFileAsync("pkill", ["-f", "CivilizationVII.app/Contents/MacOS/CivilizationVII"], {
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
    });
    killResult = { command: killCommand, stdout: tail(stdout), stderr: tail(stderr) };
    await sleep(3_000);
  }

  const launchCommand = `open steam://rungameid/${CIV7_STEAM_APP_ID}`;
  const launch = await execFileAsync("open", [`steam://rungameid/${CIV7_STEAM_APP_ID}`], {
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
  });

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
    command: `${quitCommand} && ${launchCommand}`,
    quit: { command: quitCommand, stdout: tail(quitResult.stdout), stderr: tail(quitResult.stderr) },
    ...(killResult === undefined ? {} : { kill: killResult }),
    launch: { command: launchCommand, stdout: tail(launch.stdout), stderr: tail(launch.stderr) },
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
}> {
  const deploy = buildSwooperMapsStudioDeployCommand({ requestId });
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
        server.middlewares.use("/api/civ7/autoplay", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const body = await readJsonBody<{ action?: unknown }>(req);
            if (body.action !== "start" && body.action !== "stop") {
              writeJson(res, 400, { ok: false, error: 'Autoplay action must be "start" or "stop"' });
              return;
            }
            const activeRunInGame = runInGameOperations.findActive();
            if (activeRunInGame) {
              writeJson(res, 409, {
                ok: false,
                error: "Run in Game is running; wait for it to finish before changing autoplay.",
                details: {
                  code: "run-in-game-operation-active",
                  activeRequestId: activeRunInGame.requestId,
                  activePhase: activeRunInGame.phase,
                },
              });
              return;
            }
            const activeSaveDeploy = saveDeployOperations.findActive();
            if (activeSaveDeploy) {
              writeJson(res, 409, {
                ok: false,
                error: "Save/Deploy is running; wait for it to finish before changing autoplay.",
                details: {
                  code: "save-deploy-operation-active",
                  activeRequestId: activeSaveDeploy.requestId,
                  activePhase: activeSaveDeploy.phase,
                },
              });
              return;
            }
            const approval = {
              approved: true as const,
              reason: `Studio autoplay ${body.action}`,
              disposableSession: true,
            };
            const options = {
              timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
              waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
              pollIntervalMs: 1_000,
            };
            const result = body.action === "start"
              ? await startCiv7Autoplay(options, approval)
              : await stopCiv7Autoplay(options, approval);
            writeJson(res, 200, {
              ok: result.verified,
              action: body.action,
              autoplay: result.after.autoplay,
              game: result.after.game,
              gameContext: result.after.gameContext,
              result,
            });
          } catch (err) {
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
              recovery?: { restartCivProcess?: unknown };
              setupConfig?: unknown;
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
            const parsedRequest = parseRunInGameSetupRequest(body);
            const selected = body.selectedConfig ?? {};
            const { requestedMode, id, seed, mapSize, playerCount, restartCivProcess, setupConfig } = parsedRequest;
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
            const activeOperation = runInGameOperations.findActive();
            if (activeOperation) {
              writeJson(res, 202, {
                ...activeOperation,
                details: {
                  ...activeOperation.details,
                  duplicateRequest: true,
                  code: "run-in-game-operation-active",
                  activeRequestId: activeOperation.requestId,
                },
              });
              return;
            }
            const activeSaveDeploy = saveDeployOperations.findActive();
            if (activeSaveDeploy) {
              writeJson(res, 409, {
                ok: false,
                error: "Save/Deploy is running; wait for it to finish before Run in Game.",
                details: {
                  code: "save-deploy-operation-active",
                  activeRequestId: activeSaveDeploy.requestId,
                  activePhase: activeSaveDeploy.phase,
                },
              });
              return;
            }
            const requestId = createCiv7ControlRequestId("studio-run-in-game");
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
                runInGameOperations.update(requestId, { materialization });

                const scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
                const scriptingSnapshot = await snapshotFile(scriptingLogPath);

                phase = "deploying";
                runInGameOperations.update(requestId, { phase, materialization });
                let deploy;
                deploy = await deploySwooperMapsForRun(repoRoot, requestId);

                let processRestart;
                if (restartCivProcess) {
                  phase = "restarting-civ";
                  runInGameOperations.update(requestId, { phase, materialization });
                  processRestart = await restartCiv7ProcessViaSteam();
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
                  { approved: true, reason: "Studio Run in Game setup row reload", disposableSession: true },
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
                    reloadBoundary: requestedMode === "disposable" ? "process-restart-required" : "setup-row-missing",
                    reloadAttempted: rowVisibility.refreshed,
                    mapScript: launchMapScript,
                    materialization: {
                      mode: requestedMode,
                      path: materialized.path,
                    },
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
                    ...(playerCount === undefined ? {} : { playerCount }),
                    ...(setupConfig.savedConfig === undefined ? {} : { savedConfig: setupConfig.savedConfig }),
                    options: setupConfig.gameOptions,
                    playerOptions: setupConfig.playerOptions,
                    fromRunningGame: "exit-to-shell",
                    waitForTuner: true,
                    waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                  },
                  { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS },
                  { approved: true, reason: "Studio Run in Game", disposableSession: true },
                );

                phase = "waiting-for-proof";
                runInGameOperations.update(requestId, { phase, materialization });
                const logProof = await waitForFreshLogMarkers({
                  logPath: scriptingLogPath,
                  snapshot: scriptingSnapshot,
                  markers: ["[mapgen-proof]", requestId, configHash, envelopeHash],
                  timeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                  rejectPattern: /\b(?:TextEncoder|Uncaught|Exception|Error)\b/i,
                });

                runInGameOperations.complete(requestId, {
                  ok: true,
                  requestId,
                  materialization,
                  deploy,
                  ...(processRestart === undefined ? {} : { processRestart }),
                  rowProof,
                  rowVisibility,
                  start,
                  logProof,
                }, materialization);
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
            writeJson(res, 202, operation);
          } catch (err) {
            const error = err instanceof Error ? err.message : "Run in Game failed";
            const statusCode = err instanceof RunInGameHttpError ? err.statusCode : 500;
            const details = err instanceof RunInGameHttpError ? err.details : undefined;
            writeJson(res, statusCode, { ok: false, error, ...(details === undefined ? {} : { details }) });
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
          const status = saveDeployOperations.get(requestId);
          if (!status) {
            writeJson(res, 404, { ok: false, error: `Save/Deploy request not found: ${requestId}` });
            return;
          }
          writeJson(res, 200, status);
        });
        server.middlewares.use("/api/map-configs", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
            const parsedRequest = parseMapConfigSaveRequest(body);
            const activeRunInGame = runInGameOperations.findActive();
            if (activeRunInGame) {
              writeJson(res, 409, {
                ok: false,
                error: "Run in Game is running; wait for it to finish before Save/Deploy.",
                details: {
                  code: "run-in-game-operation-active",
                  activeRequestId: activeRunInGame.requestId,
                  activePhase: activeRunInGame.phase,
                },
              });
              return;
            }
            const activeSaveDeploy = saveDeployOperations.findActive();
            if (activeSaveDeploy && activeSaveDeploy.requestId !== parsedRequest.requestId) {
              writeJson(res, 409, {
                ok: false,
                error: "Save/Deploy is already running.",
                details: {
                  code: "save-deploy-operation-active",
                  activeRequestId: activeSaveDeploy.requestId,
                  activePhase: activeSaveDeploy.phase,
                },
              });
              return;
            }
            if (activeSaveDeploy && activeSaveDeploy.requestId === parsedRequest.requestId) {
              writeJson(res, 202, activeSaveDeploy);
              return;
            }
            assertRepoMapEnvelope(parsedRequest.envelope, parsedRequest.id);
            const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
            const configRoot = resolve(repoRoot, "mods/mod-swooper-maps/src/maps/configs");
            const target = parsedRequest.sourcePath
              ? resolve(repoRoot, parsedRequest.sourcePath)
              : resolve(configRoot, `${parsedRequest.id}.config.json`);
            if (!target.startsWith(`${configRoot}/`) || !target.endsWith(".config.json")) {
              throw new Error(
                "Map config writes must stay in mods/mod-swooper-maps/src/maps/configs"
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
              () => undefined
            );
            writeJson(res, 202, operation);
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
        "**/mods/mod-swooper-maps/src/maps/configs/*.config.json",
        "**/packages/*/dist/**",
        "**/packages/*/types/**",
      ],
    },
  },
}));
