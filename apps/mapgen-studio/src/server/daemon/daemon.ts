import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { createStudioRpcHandler } from "@civ7/studio-server";

import { STUDIO_CIV7_CONTROL_ORPC_PATH } from "../../shared/civ7ControlOrpc";
import { STUDIO_RECIPE_DAG_ORPC_PATH } from "../../shared/recipeDagOrpc";
import { createStudioCiv7ControlRpcHandler } from "../civ7ControlOrpc";
import { createStudioRecipeDagRpcHandler } from "../recipeDag/orpc";
import { createStudioServerContext } from "../studio/context";
import { createStudioEngines } from "../studio/engines";

// ============================================================================
// Studio daemon — the standalone Bun server owning the studio server surface
// (bun-server workstream, daemon slice; topology per the gt-stack-inspect
// blueprint: Bun.serve fetch router + dev-live runner + Vite proxy).
// ----------------------------------------------------------------------------
// This process owns EVERY `/rpc` + `/api` byte and ALL server state (the one
// `createStudioEngines` instance — queue, operation stores, instance
// identity). Vite is frontend-only and proxies here. Running under Bun also
// dissolves the effect-orpc TS-source constraint: the recipe-DAG handler is a
// plain static import (no `ssrLoadModule`).
//
// The server surface is oRPC ONLY (user directive 2026-06-12: no legacy, no
// fallbacks): `/rpc` (studio-server), `/api/civ7/rpc` (control), and
// `/api/recipe-dag/rpc` (recipe DAG). The 16 hand-rolled legacy `/api/*` REST
// handlers from the Vite middleware era are RETIRED — any other `/api` path
// is a 404.
//
// Executed with `bun src/server/daemon/daemon.ts` (never under node). The
// fetch composition (`createStudioDaemonFetch`) is pure and unit-tested under
// vitest; only `main()` touches `Bun.serve`.
// ============================================================================

declare const Bun: {
  serve(options: {
    hostname: string;
    port: number;
    idleTimeout?: number;
    fetch(request: Request): Response | Promise<Response>;
  }): { hostname: string; port: number; stop(force?: boolean): void };
};

export type StudioDaemonArgs = Readonly<{
  host: string;
  port: number;
  repoRoot: string;
  assetsRoot?: string;
}>;

export const STUDIO_DAEMON_DEFAULT_PORT = 5174;

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export function parseStudioDaemonArgs(
  argv: readonly string[],
  defaults: Readonly<{ repoRoot: string }>,
): StudioDaemonArgs {
  const options = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg || !arg.startsWith("--")) throw new Error(`Unexpected positional argument: ${arg}`);
    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    options.set(key, value);
    index += 1;
  }
  const assetsRoot = options.get("assets-root");
  return {
    host: options.get("host") ?? "127.0.0.1",
    port: Number(options.get("port") ?? STUDIO_DAEMON_DEFAULT_PORT),
    repoRoot: resolve(options.get("repo-root") ?? defaults.repoRoot),
    ...(assetsRoot ? { assetsRoot: resolve(assetsRoot) } : {}),
  };
}

/**
 * Static SPA serving (the production story's opening): only active when
 * `--assets-root` points at a built `dist`. Path-jailed to the assets root
 * with an index.html fallback for client routes (blueprint pattern).
 */
function staticResponse(assetsRoot: string, pathname: string): Response {
  if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
  const requested = pathname === "/" ? "/index.html" : pathname;
  const normalized = normalize(decodeURIComponent(requested)).replace(/^(\.\.(\/|\\|$))+/, "");
  const candidate = resolve(join(assetsRoot, normalized));
  const rootWithSep = assetsRoot.endsWith(sep) ? assetsRoot : `${assetsRoot}${sep}`;
  const filePath = candidate.startsWith(rootWithSep) ? candidate : join(assetsRoot, "index.html");
  const fallbackPath = join(assetsRoot, "index.html");
  const requestedExt = extname(filePath);
  if ((!existsSync(filePath) || !statSync(filePath).isFile()) && requestedExt) {
    return new Response(`Asset not found: ${pathname}`, { status: 404 });
  }
  const finalPath = existsSync(filePath) && statSync(filePath).isFile() ? filePath : fallbackPath;

  if (!existsSync(finalPath)) {
    return new Response("Studio assets not found. Run `bun run build` first.", { status: 503 });
  }
  return new Response(readFileSync(finalPath), {
    headers: {
      "content-type": mimeTypes[extname(finalPath)] ?? "application/octet-stream",
    },
  });
}

export interface StudioDaemonDeps {
  studioRpc: {
    handle(
      request: Request,
      options?: { prefix?: `/${string}` },
    ): Promise<{ matched: boolean; response?: Response }>;
  };
  controlRpc: { handle(request: Request): Promise<{ matched: boolean; response?: Response }> };
  recipeDagRpc: { handle(request: Request): Promise<{ matched: boolean; response?: Response }> };
  health():
    | ({ ok: boolean } & Record<string, unknown>)
    | Promise<{ ok: boolean } & Record<string, unknown>>;
  assetsRoot?: string;
}

/** Pure fetch router over injected handlers — unit-testable without Bun.serve. */
export function createStudioDaemonFetch(
  deps: StudioDaemonDeps,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/healthz") {
      const health = await deps.health();
      return Response.json(health, { status: health.ok ? 200 : 503 });
    }

    if (pathname.startsWith("/rpc")) {
      const { matched, response } = await deps.studioRpc.handle(request, { prefix: "/rpc" });
      if (matched && response) return response;
      return new Response("Not Found", { status: 404 });
    }

    if (pathname.startsWith(STUDIO_CIV7_CONTROL_ORPC_PATH)) {
      const { matched, response } = await deps.controlRpc.handle(request);
      if (matched && response) return response;
      return new Response("Not Found", { status: 404 });
    }

    if (pathname.startsWith(STUDIO_RECIPE_DAG_ORPC_PATH)) {
      const { matched, response } = await deps.recipeDagRpc.handle(request);
      if (matched && response) return response;
      return new Response("Not Found", { status: 404 });
    }

    // Retired legacy REST surface (no fallbacks): any other /api path is 404.
    if (pathname.startsWith("/api/")) {
      return new Response("Not Found", { status: 404 });
    }

    if (deps.assetsRoot) {
      return staticResponse(deps.assetsRoot, pathname);
    }

    return new Response("Not Found", { status: 404 });
  };
}

export async function createStudioDaemon(args: StudioDaemonArgs) {
  const engines = createStudioEngines({ repoRoot: args.repoRoot });
  const context = createStudioServerContext({ engines, hostCommand: "daemon" });
  const studioRpc = createStudioRpcHandler(context);
  // The ONE shared tuner connection (Effect-scoped in the studio runtime;
  // resolving it builds the runtime layer). The control mount reuses it via
  // endpointDefaults — every polling read multiplexes over this socket
  // instead of opening its own (the churn that wedged the game).
  const tunerSession = await studioRpc.tuner.session();
  const deps: StudioDaemonDeps = {
    studioRpc,
    controlRpc: createStudioCiv7ControlRpcHandler({ session: tunerSession }),
    recipeDagRpc: createStudioRecipeDagRpcHandler(),
    health: async () => ({
      ok: true,
      serverInstanceId: engines.serverInstanceId,
      startedAt: engines.serverStartedAt,
      repoRoot: args.repoRoot,
      assetsRoot: args.assetsRoot ?? null,
      runtimeMode: "studio-daemon-effect-orpc",
      // Wedge observability: consecutive response-timeouts on the shared
      // socket + backoff gate state (tuner-session workstream).
      tuner: await studioRpc.tuner.health(),
    }),
    ...(args.assetsRoot ? { assetsRoot: args.assetsRoot } : {}),
  };
  const fetch = createStudioDaemonFetch(deps);

  return {
    engines,
    /** Closes the studio runtime scope — graceful FIN to the game. */
    dispose: () => studioRpc.dispose(),
    start() {
      const server = Bun.serve({
        hostname: args.host,
        port: args.port,
        // Run-in-game launches block their HTTP request for long stretches;
        // never idle-close them.
        idleTimeout: 0,
        fetch,
      });
      return server;
    },
  };
}

function defaultRepoRoot(): string {
  // src/server/daemon/daemon.ts → apps/mapgen-studio → repo root.
  return fileURLToPath(new URL("../../../../..", import.meta.url));
}

if ((import.meta as { main?: boolean }).main) {
  const args = parseStudioDaemonArgs(process.argv.slice(2), { repoRoot: defaultRepoRoot() });
  const daemon = await createStudioDaemon(args);
  const server = daemon.start();
  // Shutdown = dispose the runtime scope FIRST (graceful FIN on the shared
  // tuner socket — the whole point of scoped release), then stop serving.
  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      await daemon.dispose();
    } finally {
      server.stop(true);
      process.exit(0);
    }
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
  process.stdout.write(
    `mapgen-studio daemon listening on http://${server.hostname}:${server.port} (repoRoot ${args.repoRoot})\n`,
  );
}
