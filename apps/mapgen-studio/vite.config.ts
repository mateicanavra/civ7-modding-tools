import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  FIRETUNER_RESTART_COMMAND,
  createFireTunerRequestId,
} from "../../packages/cli/src/utils/firetunerBridge";
import {
  DEFAULT_FIRETUNER_SOCKET_HOST,
  DEFAULT_FIRETUNER_SOCKET_PORT,
  DEFAULT_FIRETUNER_SOCKET_TIMEOUT_MS,
  FIRETUNER_APP_UI_STATE_NAME,
  runFireTunerSocketCommand,
} from "../../packages/cli/src/utils/firetunerSocket";

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;
const FIRETUNER_AGENT = "DRA-map-config-generation";
const DEFAULT_CIV7_SCRIPTING_LOG = join(
  homedir(),
  "Library",
  "Application Support",
  "Civilization VII",
  "Logs",
  "Scripting.log"
);

let saveDeployRestartQueue = Promise.resolve();

function tail(value: string): string {
  return value.length > MAX_DEPLOY_OUTPUT_CHARS ? value.slice(-MAX_DEPLOY_OUTPUT_CHARS) : value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ScriptingLogSnapshot = Readonly<{
  exists: boolean;
  size: number;
  mtimeMs: number;
}>;

type ScriptingLogProof = Readonly<{
  logPath: string;
  observedAt: string;
  startOffset: number;
  matched: ReadonlyArray<string>;
}>;

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

async function snapshotScriptingLog(logPath: string): Promise<ScriptingLogSnapshot> {
  const info = await stat(logPath).catch((err: unknown) => {
    if (isNodeNotFound(err)) return null;
    throw err;
  });
  return info
    ? { exists: true, size: info.size, mtimeMs: info.mtimeMs }
    : { exists: false, size: 0, mtimeMs: 0 };
}

function hasFreshMapGenerationProof(text: string): {
  ok: boolean;
  matched: string[];
  error?: string;
} {
  const markers = [
    "Creating Context -  MapGeneration",
    "[SWOOPER_MOD] [recipe:standard] [50/50] ok mod-swooper-maps.standard.placement.placement",
    "Destroying Context -  MapGeneration",
  ];
  const matched: string[] = [];
  let cursor = 0;
  for (const marker of markers) {
    const next = text.indexOf(marker, cursor);
    if (next < 0) return { ok: false, matched };
    matched.push(marker);
    cursor = next + marker.length;
  }
  const errorMatch = /\b(?:TextEncoder|Uncaught|Exception|Error)\b/i.exec(text);
  if (errorMatch) {
    return { ok: false, matched, error: `Scripting log contains ${errorMatch[0]}` };
  }
  return { ok: true, matched };
}

async function waitForFreshMapGeneration(args: {
  logPath: string;
  snapshot: ScriptingLogSnapshot;
  timeoutMs: number;
  pollIntervalMs?: number;
}): Promise<ScriptingLogProof> {
  const startedAt = Date.now();
  const pollIntervalMs = args.pollIntervalMs ?? 1_000;
  const startOffset = args.snapshot.size;
  let lastError: string | undefined;

  while (Date.now() - startedAt <= args.timeoutMs) {
    const current = await snapshotScriptingLog(args.logPath);
    if (current.exists && (current.size > startOffset || current.mtimeMs > args.snapshot.mtimeMs)) {
      const fullText = await readFile(args.logPath, "utf8");
      const newText = current.size >= startOffset ? fullText.slice(startOffset) : fullText;
      const proof = hasFreshMapGenerationProof(newText);
      if (proof.error) lastError = proof.error;
      if (proof.ok) {
        return {
          logPath: args.logPath,
          observedAt: new Date().toISOString(),
          startOffset,
          matched: proof.matched,
        };
      }
    }
    await sleep(pollIntervalMs);
  }

  throw new Error(
    lastError ?? "Timed out waiting for fresh Civ7 MapGeneration completion in Scripting.log"
  );
}

async function requestCiv7Restart(options?: { verify?: boolean }): Promise<{
  requestId: string;
  agent: string;
  command: string;
  transport: "firetuner-socket";
  host: string;
  port: number;
  state: unknown;
  output: ReadonlyArray<string>;
  scriptingLog?: ScriptingLogProof;
}> {
  const requestId = createFireTunerRequestId("studio-socket");
  const host = process.env.CIV7_FIRETUNER_HOST ?? DEFAULT_FIRETUNER_SOCKET_HOST;
  const port = fireTunerSocketPort();
  const scriptingLogPath = process.env.CIV7_SCRIPTING_LOG ?? DEFAULT_CIV7_SCRIPTING_LOG;
  const scriptingSnapshot = options?.verify
    ? await snapshotScriptingLog(scriptingLogPath)
    : undefined;
  const response = await runFireTunerSocketCommand({
    host,
    port,
    stateName: FIRETUNER_APP_UI_STATE_NAME,
    command: FIRETUNER_RESTART_COMMAND,
    timeoutMs: DEFAULT_FIRETUNER_SOCKET_TIMEOUT_MS,
  });

  if (response.output[0] !== "true") {
    throw new Error(
      `FireTuner socket restart returned: ${response.output.join("\n") || "<empty>"}`
    );
  }

  const scriptingLog =
    options?.verify && scriptingSnapshot
      ? await waitForFreshMapGeneration({
          logPath: scriptingLogPath,
          snapshot: scriptingSnapshot,
          timeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
        })
      : undefined;

  return {
    requestId,
    agent: FIRETUNER_AGENT,
    command: FIRETUNER_RESTART_COMMAND,
    transport: "firetuner-socket",
    host: response.host,
    port: response.port,
    state: response.state,
    output: response.output,
    scriptingLog,
  };
}

function fireTunerSocketPort(): number {
  if (!process.env.CIV7_FIRETUNER_PORT) return DEFAULT_FIRETUNER_SOCKET_PORT;
  const port = Number(process.env.CIV7_FIRETUNER_PORT);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(`Invalid CIV7_FIRETUNER_PORT: ${process.env.CIV7_FIRETUNER_PORT}`);
  }
  return port;
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
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: false, saved: false, path, error }));
                return;
              }
              let restart;
              try {
                restart = await requestCiv7Restart({ verify: body.verifyRestart === true });
              } catch (err) {
                const error = err instanceof Error ? err.message : "Civ7 restart request failed";
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({ ok: false, saved: true, deployed: true, path, deploy, error })
                );
                return;
              }
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, path, deploy, restart }));
            };
            const nextRun = saveDeployRestartQueue.then(run, run);
            saveDeployRestartQueue = nextRun.then(
              () => undefined,
              () => undefined
            );
            await nextRun;
          } catch (err) {
            const error = err instanceof Error ? err.message : "Save failed";
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error }));
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
