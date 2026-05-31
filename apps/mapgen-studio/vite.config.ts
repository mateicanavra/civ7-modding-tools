import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  CIV7_RESTART_COMMAND,
  DEFAULT_CIV7_SCRIPTING_LOG,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  createCiv7ControlRequestId,
  getCiv7GameInfoRows,
  getCiv7MapSummary,
  getCiv7PlayableStatus,
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

let saveDeployRestartQueue = Promise.resolve();

function tail(value: string): string {
  return value.length > MAX_DEPLOY_OUTPUT_CHARS ? value.slice(-MAX_DEPLOY_OUTPUT_CHARS) : value;
}

type ScriptingLogProof = FreshLogMarkerProof;

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
    }
  );
  return {
    command,
    stdout: tail(stdout),
    stderr: tail(stderr),
  };
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

function writeJson(res: { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
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
  },
}));
