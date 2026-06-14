import { fileURLToPath } from "node:url";
import { createServer, type ViteDevServer } from "vite";

import { createStudioServer, STUDIO_SERVER_DEFAULT_PORT } from "./studioServer";

// ============================================================================
// Studio dev server — `bun run dev`
// ----------------------------------------------------------------------------
// Runs the studio server (backend) and Vite frontend in one Bun dev process.
// Bun watch restarts this entrypoint for backend/source changes; Vite owns
// frontend HMR and proxies `/rpc` to the Studio server via STUDIO_DEV_RPC_TARGET.
// ============================================================================

export type StudioDevArgs = Readonly<{
  host: string;
  frontendPort: number;
  backendPort: number;
  readinessTimeoutMs: number;
  printPlan: boolean;
}>;

export type StudioDevPlan = Readonly<{
  backendUrl: string;
  frontendUrl: string;
  rpcProxyTarget: string;
  watchEntrypoint: string;
  studioServer: Readonly<{
    host: string;
    port: number;
  }>;
  vite: Readonly<{
    configFile: string;
    env: Readonly<Record<string, string>>;
  }>;
}>;

const appRoot = fileURLToPath(new URL("../..", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const viteConfigFile = fileURLToPath(new URL("../../vite.config.ts", import.meta.url));

export function parseStudioDevArgs(argv: readonly string[]): StudioDevArgs {
  const options = new Map<string, string | true>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg || !arg.startsWith("--")) throw new Error(`Unexpected positional argument: ${arg}`);
    const key = arg.slice(2);
    if (key === "print-plan") {
      options.set(key, true);
      continue;
    }
    const value = argv[index + 1];
    if (!value || typeof value !== "string" || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    options.set(key, value);
    index += 1;
  }
  const readNumber = (key: string): number | undefined => {
    const value = options.get(key);
    return typeof value === "string" ? Number(value) : undefined;
  };
  const host = options.get("host");
  return {
    host: typeof host === "string" ? host : "127.0.0.1",
    frontendPort: readNumber("port") ?? 5173,
    backendPort: readNumber("backend-port") ?? STUDIO_SERVER_DEFAULT_PORT,
    readinessTimeoutMs: readNumber("readiness-timeout-ms") ?? 30_000,
    printPlan: options.get("print-plan") === true,
  };
}

export function makeStudioDevPlan(args: StudioDevArgs): StudioDevPlan {
  const backendUrl = `http://${args.host}:${args.backendPort}`;
  return {
    backendUrl,
    frontendUrl: `http://${args.host}:${args.frontendPort}/`,
    rpcProxyTarget: backendUrl,
    watchEntrypoint: "src/server/dev.ts",
    studioServer: {
      host: args.host,
      port: args.backendPort,
    },
    vite: {
      configFile: viteConfigFile,
      env: { STUDIO_DEV_RPC_TARGET: backendUrl },
    },
  };
}

async function waitForStudioServerReadiness(
  backendUrl: string,
  timeoutMs: number,
): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt <= timeoutMs) {
    try {
      const res = await fetch(`${backendUrl}/healthz`);
      if (res.ok) return;
    } catch {
      // Studio server is still booting.
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 250));
  }
  throw new Error(
    `Studio server did not become ready within ${timeoutMs}ms (${backendUrl}/healthz)`,
  );
}

async function startVite(plan: StudioDevPlan, args: StudioDevArgs): Promise<ViteDevServer> {
  Object.assign(process.env, plan.vite.env);
  const vite = await createServer({
    root: appRoot,
    configFile: plan.vite.configFile,
    server: {
      host: args.host,
      port: args.frontendPort,
      strictPort: true,
    },
  });
  await vite.listen();
  return vite;
}

export async function runStudioDev(args: StudioDevArgs): Promise<void> {
  const plan = makeStudioDevPlan(args);
  if (args.printPlan) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return;
  }

  let shuttingDown = false;
  const studioServer = await createStudioServer({
    host: plan.studioServer.host,
    port: plan.studioServer.port,
    repoRoot,
  });
  const server = studioServer.start();
  let vite: ViteDevServer | undefined;

  const stopAll = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    await vite?.close();
    await studioServer.dispose();
    server.stop(true);
  };
  const exitAfterShutdown = (code: number) => {
    void stopAll().finally(() => process.exit(code));
  };
  process.once("SIGINT", () => exitAfterShutdown(130));
  process.once("SIGTERM", () => exitAfterShutdown(143));

  try {
    await waitForStudioServerReadiness(plan.backendUrl, args.readinessTimeoutMs);
    process.stdout.write(`mapgen-studio server ready at ${plan.backendUrl}\n`);

    vite = await startVite(plan, args);
    process.stdout.write(
      `mapgen-studio frontend at ${plan.frontendUrl} (proxying /rpc to ${plan.rpcProxyTarget})\n`,
    );

    await new Promise<never>(() => {});
  } finally {
    await stopAll();
  }
}

if ((import.meta as { main?: boolean }).main) {
  runStudioDev(parseStudioDevArgs(process.argv.slice(2))).catch((err: unknown) => {
    process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
}
