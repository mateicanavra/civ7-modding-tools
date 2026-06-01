import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFile } from "node:child_process";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const DEPLOY_TIMEOUT_MS = 120_000;
const MAX_DEPLOY_OUTPUT_CHARS = 8_000;
const FIRETUNER_AGENT = "DRA-map-config-generation";
const FIRETUNER_RESTART_COMMAND = "Network.restartGame()";
const DEFAULT_FIRETUNER_BRIDGE_LOG = join(
  homedir(),
  "Parallels Tunnel",
  "Sid Meier's Civilization VII Development Tools",
  "Comms",
  "civ7-firetuner-bridge.append-only.log",
);

let deployQueue = Promise.resolve();

function tail(value: string): string {
  return value.length > MAX_DEPLOY_OUTPUT_CHARS ? value.slice(-MAX_DEPLOY_OUTPUT_CHARS) : value;
}

async function deploySwooperMaps(repoRoot: string): Promise<{
  command: string;
  stdout: string;
  stderr: string;
}> {
  const command = "bun run --cwd mods/mod-swooper-maps deploy";
  const run = async () => {
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
  };
  const next = deployQueue.then(run, run);
  deployQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function requestCiv7Restart(): Promise<{
  requestId: string;
  agent: string;
  command: string;
  logPath: string;
}> {
  const logPath = process.env.CIV7_FIRETUNER_BRIDGE_LOG ?? DEFAULT_FIRETUNER_BRIDGE_LOG;
  const requestId = `studio-${Date.now().toString(36)}-${process.pid.toString(36)}`;
  await appendFile(
    logPath,
    `\nREQ ${requestId} AGENT=${FIRETUNER_AGENT} RUN ${FIRETUNER_RESTART_COMMAND}\n`
  );
  return {
    requestId,
    agent: FIRETUNER_AGENT,
    command: FIRETUNER_RESTART_COMMAND,
    logPath,
  };
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
            await mkdir(dirname(target), { recursive: true });
            await writeFile(target, `${JSON.stringify(body.envelope, null, 2)}\n`);
            const path = relative(repoRoot, target);
            let deploy;
            try {
              deploy = await deploySwooperMaps(repoRoot);
            } catch (err) {
              const error = err instanceof Error ? err.message : "Deploy failed";
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: false, saved: true, path, error }));
              return;
            }
            let restart;
            try {
              restart = await requestCiv7Restart();
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
