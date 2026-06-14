import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { createStudioEventHub, createStudioRpcHandler } from "@civ7/studio-server";

import { createStudioServerContext } from "./studio/context";
import { createStudioEngines } from "./studio/engines";

// ============================================================================
// Studio server — the standalone Bun server owning the studio server surface
// (bun-server workstream; runtime-one-mount slice collapsed the surface to ONE
// oRPC mount).
// ----------------------------------------------------------------------------
// This process owns EVERY `/rpc` byte and ALL server state (the one
// `createStudioEngines` instance — queue, operation stores, instance
// identity). Vite is frontend-only and proxies `/rpc` here.
//
// The server surface is ONE oRPC mount (runtime-simplification DP-1): `/rpc`
// hosts the unified `@civ7/studio-server` contract — the studio surface,
// `civ7.*` (including the absorbed control namespaces), and `recipeDag.*` —
// behind one RPCHandler over one ManagedRuntime. The former satellite mounts
// (`/api/civ7/rpc`, `/api/recipe-dag/rpc`) and the 16 hand-rolled legacy
// `/api/*` REST handlers are RETIRED — every non-`/rpc` API path is a 404.
//
// Executed with `bun src/server/studioServer.ts` (never under node). The
// fetch composition (`createStudioServerFetch`) is pure and unit-tested under
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

export type StudioServerArgs = Readonly<{
  host: string;
  port: number;
  repoRoot: string;
  assetsRoot?: string;
}>;

export const STUDIO_SERVER_DEFAULT_PORT = 5174;

const mimeTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export function parseStudioServerArgs(
  argv: readonly string[],
  defaults: Readonly<{ repoRoot: string }>,
): StudioServerArgs {
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
    port: Number(options.get("port") ?? STUDIO_SERVER_DEFAULT_PORT),
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

export interface StudioServerDeps {
  studioRpc: {
    handle(
      request: Request,
      options?: { prefix?: `/${string}` },
    ): Promise<{ matched: boolean; response?: Response }>;
  };
  health():
    | ({ ok: boolean } & Record<string, unknown>)
    | Promise<{ ok: boolean } & Record<string, unknown>>;
  assetsRoot?: string;
}

/** Pure fetch router over the injected handler — unit-testable without Bun.serve. */
export function createStudioServerFetch(
  deps: StudioServerDeps,
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

    // Retired surfaces (no fallbacks): the legacy REST endpoints AND the
    // former satellite mounts (`/api/civ7/rpc`, `/api/recipe-dag/rpc`) all
    // fall through here — every non-`/rpc` API path is a 404.
    if (deps.assetsRoot && !pathname.startsWith("/api/")) {
      return staticResponse(deps.assetsRoot, pathname);
    }

    return new Response("Not Found", { status: 404 });
  };
}

export async function createStudioServer(args: StudioServerArgs) {
  const eventHub = createStudioEventHub();
  const engines = createStudioEngines({ repoRoot: args.repoRoot, eventHub });
  const context = createStudioServerContext({ engines, eventHub, hostCommand: "studio-server" });
  // The ONE handler over the ONE runtime. Session sharing is structural now:
  // the handler resolves the shared tuner connection from its runtime and
  // threads it into every control procedure's endpointDefaults — every
  // polling read multiplexes over that socket instead of opening its own
  // (the churn that wedged the game).
  const studioRpc = createStudioRpcHandler(context, { liveGameWatch: {} });
  const deps: StudioServerDeps = {
    studioRpc,
    health: async () => ({
      ok: true,
      serverInstanceId: engines.serverInstanceId,
      startedAt: engines.serverStartedAt,
      repoRoot: args.repoRoot,
      assetsRoot: args.assetsRoot ?? null,
      runtimeMode: "studio-server-effect-orpc",
      // Wedge observability: consecutive response-timeouts on the shared
      // socket + backoff gate state (tuner-session workstream).
      tuner: await studioRpc.tuner.health(),
    }),
    ...(args.assetsRoot ? { assetsRoot: args.assetsRoot } : {}),
  };
  const fetch = createStudioServerFetch(deps);

  return {
    engines,
    /** Closes the studio runtime scope — graceful FIN to the game — and event bus. */
    dispose: async () => {
      await studioRpc.dispose();
      await eventHub.shutdown();
    },
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
  // src/server/studioServer.ts → apps/mapgen-studio → repo root.
  return fileURLToPath(new URL("../../../..", import.meta.url));
}

if ((import.meta as { main?: boolean }).main) {
  const args = parseStudioServerArgs(process.argv.slice(2), { repoRoot: defaultRepoRoot() });
  const studioServer = await createStudioServer(args);
  const server = studioServer.start();
  // Shutdown = dispose the runtime scope FIRST (graceful FIN on the shared
  // tuner socket — the whole point of scoped release), then stop serving.
  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    try {
      await studioServer.dispose();
    } finally {
      server.stop(true);
      process.exit(0);
    }
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
  process.stdout.write(
    `mapgen-studio server listening on http://${server.hostname}:${server.port} (repoRoot ${args.repoRoot})\n`,
  );
}
