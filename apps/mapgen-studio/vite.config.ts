import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const RESTART_TIMEOUT_MS = 60_000;
const FIRETUNER_WAIT_TIMEOUT_MS = 45_000;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;
const FIRETUNER_AGENT = "DRA-map-config-generation";
const DEFAULT_FIRETUNER_BRIDGE_LOG = join(
  homedir(),
  "Parallels Tunnel",
  "Sid Meier's Civilization VII Development Tools",
  "Comms",
  "civ7-firetuner-bridge.append-only.log",
);

let saveDeployRestartQueue = Promise.resolve();

function tail(value: string): string {
  return value.length > MAX_DEPLOY_OUTPUT_CHARS ? value.slice(-MAX_DEPLOY_OUTPUT_CHARS) : value;
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
    }
  );
  return {
    command,
    stdout: tail(stdout),
    stderr: tail(stderr),
  };
}

async function requestCiv7Restart(repoRoot: string): Promise<{
  requestId: string;
  agent: string;
  command: string;
  logPath: string;
  response?: unknown;
}> {
  const logPath = process.env.CIV7_FIRETUNER_BRIDGE_LOG ?? DEFAULT_FIRETUNER_BRIDGE_LOG;
  const { stdout } = await execFileAsync(
    "bun",
    [
      "run",
      "--cwd",
      "packages/cli",
      "dev",
      "--",
      "game",
      "restart",
      "--agent",
      FIRETUNER_AGENT,
      "--bridge-log",
      logPath,
      "--request-id",
      `studio-${Date.now().toString(36)}-${process.pid.toString(36)}`,
      "--wait",
      "--timeout-ms",
      String(FIRETUNER_WAIT_TIMEOUT_MS),
      "--json",
    ],
    {
      cwd: repoRoot,
      timeout: RESTART_TIMEOUT_MS,
      maxBuffer: 4 * 1024 * 1024,
    }
  );
  const restart = JSON.parse(stdout.trim().split(/\r?\n/).at(-1) ?? "{}") as {
    ok?: boolean;
    request?: {
      requestId?: string;
      agent?: string;
      command?: string;
      logPath?: string;
    };
    response?: unknown;
    timedOut?: boolean;
  };
  if (!restart.ok) {
    throw new Error(restart.timedOut ? "Timed out waiting for FireTuner bridge response" : "FireTuner bridge blocked restart request");
  }
  return {
    requestId: restart.request?.requestId ?? "",
    agent: restart.request?.agent ?? FIRETUNER_AGENT,
    command: restart.request?.command ?? "Network.restartGame()",
    logPath: restart.request?.logPath ?? logPath,
    response: restart.response,
  };
}

function isNodeNotFound(err: unknown): boolean {
  return Boolean(err) && typeof err === "object" && "code" in err && (err as { code?: unknown }).code === "ENOENT";
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
  if (!Number.isInteger(record.sortIndex)) throw new Error("Map config sortIndex must be an integer");
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
                restart = await requestCiv7Restart(repoRoot);
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
