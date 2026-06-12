import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";

import { STUDIO_DAEMON_DEFAULT_PORT } from "./daemon";

// ============================================================================
// Dev-live runner — `bun run dev` (bun-server workstream, daemon slice)
// ----------------------------------------------------------------------------
// Spawns the studio daemon (backend), waits for `/healthz`, then spawns the
// Vite frontend, whose `server.proxy` forwards `/rpc` + `/api` to the daemon
// (target via STUDIO_DEV_RPC_TARGET). Either child exiting stops the other —
// one Ctrl-C tears the whole topology down (gt-stack-inspect blueprint).
// ============================================================================

export type DevLiveArgs = Readonly<{
  host: string;
  frontendPort: number;
  backendPort: number;
  readinessTimeoutMs: number;
  printPlan: boolean;
}>;

export type DevLiveCommand = Readonly<{
  command: string;
  args: readonly string[];
  cwd: string;
  env?: Readonly<Record<string, string>>;
}>;

export type DevLivePlan = Readonly<{
  backendUrl: string;
  frontendUrl: string;
  rpcProxyTarget: string;
  daemon: DevLiveCommand;
  vite: DevLiveCommand;
}>;

type RunningChild = { name: string; process: ChildProcess };

const appRoot = fileURLToPath(new URL("../../..", import.meta.url));
const bunExecutable = process.env.BUN_EXECUTABLE ?? process.execPath ?? "bun";

export function parseDevLiveArgs(argv: readonly string[]): DevLiveArgs {
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
    backendPort: readNumber("backend-port") ?? STUDIO_DAEMON_DEFAULT_PORT,
    readinessTimeoutMs: readNumber("readiness-timeout-ms") ?? 30_000,
    printPlan: options.get("print-plan") === true,
  };
}

export function makeDevLivePlan(args: DevLiveArgs): DevLivePlan {
  const backendUrl = `http://${args.host}:${args.backendPort}`;
  return {
    backendUrl,
    frontendUrl: `http://${args.host}:${args.frontendPort}/`,
    rpcProxyTarget: backendUrl,
    daemon: {
      command: bunExecutable,
      args: [
        "src/server/daemon/daemon.ts",
        "--host",
        args.host,
        "--port",
        String(args.backendPort),
      ],
      cwd: appRoot,
    },
    vite: {
      command: bunExecutable,
      args: ["run", "dev:frontend"],
      cwd: appRoot,
      env: { STUDIO_DEV_RPC_TARGET: backendUrl },
    },
  };
}

function startChild(name: string, command: DevLiveCommand): RunningChild {
  const child = spawn(command.command, [...command.args], {
    cwd: command.cwd,
    stdio: "inherit",
    env: { ...process.env, ...(command.env ?? {}) },
  });
  return { name, process: child };
}

async function waitForDaemonReadiness(
  backendUrl: string,
  timeoutMs: number,
  daemon: RunningChild,
): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt <= timeoutMs) {
    if (daemon.process.exitCode !== null) {
      throw new Error(`daemon exited before readiness (code ${daemon.process.exitCode})`);
    }
    try {
      const res = await fetch(`${backendUrl}/healthz`);
      if (res.ok) return;
    } catch {
      // Daemon is still booting.
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 250));
  }
  throw new Error(`daemon did not become ready within ${timeoutMs}ms (${backendUrl}/healthz)`);
}

function waitForFirstExit(children: readonly RunningChild[]): Promise<RunningChild> {
  return new Promise((resolveExit) => {
    for (const child of children) {
      child.process.once("exit", () => resolveExit(child));
    }
  });
}

export async function runDevLive(args: DevLiveArgs): Promise<void> {
  const plan = makeDevLivePlan(args);
  if (args.printPlan) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return;
  }

  const running: RunningChild[] = [];
  let shuttingDown = false;
  const stopAll = (signal: NodeJS.Signals = "SIGTERM") => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const child of [...running].reverse()) {
      if (child.process.exitCode === null) child.process.kill(signal);
    }
  };
  process.once("SIGINT", () => stopAll("SIGINT"));
  process.once("SIGTERM", () => stopAll("SIGTERM"));

  try {
    const daemon = startChild("daemon", plan.daemon);
    running.push(daemon);
    await waitForDaemonReadiness(plan.backendUrl, args.readinessTimeoutMs, daemon);
    process.stdout.write(`mapgen-studio daemon ready at ${plan.backendUrl}\n`);

    const vite = startChild("vite", plan.vite);
    running.push(vite);
    process.stdout.write(
      `mapgen-studio frontend at ${plan.frontendUrl} (proxying /rpc + /api to ${plan.rpcProxyTarget})\n`,
    );

    const exited = await waitForFirstExit(running);
    process.stdout.write(`${exited.name} exited; stopping dev-live.\n`);
  } finally {
    stopAll();
  }
}

if ((import.meta as { main?: boolean }).main) {
  runDevLive(parseDevLiveArgs(process.argv.slice(2))).catch((err: unknown) => {
    process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
}
