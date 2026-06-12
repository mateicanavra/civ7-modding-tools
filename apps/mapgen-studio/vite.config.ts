import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
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
  listCiv7SavedGameConfigurations,
} from "@civ7/direct-control";
import { loadCiv7SetupCatalog } from "./src/server/civ7Resources/catalog";
import { RunInGameHttpError } from "./src/server/runInGame/operationState";
import { createStudioEngines, type RunInGameStartEngineBody } from "./src/server/studio/engines";
import { createStudioServerContext } from "./src/server/studio/context";
import { handleStudioCiv7ControlOrpcRequest } from "./src/server/civ7ControlOrpc";
import { STUDIO_RECIPE_DAG_ORPC_PATH } from "./src/shared/recipeDagOrpc";
import { nodeRequestToWebRequest, writeWebResponse } from "./src/server/http/nodeWebBridge";
import { createStudioRpcHandler } from "@civ7/studio-server";

// ===========================================================================
// Studio server surface (P5a coexistence state)
// ---------------------------------------------------------------------------
// The stateful engines (serialized queue, run-in-game + save/deploy operation
// stores, instance identity) live in ./src/server/studio/engines.ts —
// `createStudioEngines` below is the ONE instance for this process, shared by
// the legacy `/api/*` handlers AND the `/rpc` oRPC mount (no state divergence,
// architecture/10 §7). The bun-server workstream's daemon slice moves this
// whole surface into a standalone Bun process and reduces this config to
// frontend-only proxying.
//
// Import constraint: everything imported here is evaluated by NODE at config
// load — no effect-orpc in the static graph (see engines.ts header). The
// recipe-DAG mount stays on per-request `ssrLoadModule` for exactly that
// reason.
// ===========================================================================

const STUDIO_REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const studioEngines = createStudioEngines({ repoRoot: STUDIO_REPO_ROOT });

async function readJsonBody<T>(req: AsyncIterable<Uint8Array>): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T;
}

function writeJson(res: { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "repo-backed-map-configs",
      configureServer(server) {
        server.middlewares.use(handleStudioCiv7ControlOrpcRequest);
        // Recipe-DAG oRPC mount. The handler module MUST load through Vite's
        // SSR pipeline: its effect-orpc router layer imports `effect-orpc`,
        // whose package entry is TypeScript SOURCE — Node cannot type-strip
        // under node_modules, so a static import here breaks config evaluation
        // (@civ7/studio-server avoids this only by bundling effect-orpc into
        // its dist). `ssrLoadModule` is called PER REQUEST — Vite's documented
        // SSR pattern: unchanged graphs are cheap cache hits, and edits to the
        // server module are picked up on the next request (the previous
        // forever-memoized promise served the first load until restart). The
        // path pre-check keeps the SSR loader off every other request.
        server.middlewares.use((req, res, next) => {
          const path = (req as { originalUrl?: string }).originalUrl ?? req.url ?? "/";
          if (!path.startsWith(STUDIO_RECIPE_DAG_ORPC_PATH)) return next();
          server.ssrLoadModule("/src/server/recipeDag/orpc.ts").then(
            (module) =>
              void (module as typeof import("./src/server/recipeDag/orpc"))
                .handleStudioRecipeDagOrpcRequest(req, res, next),
            next,
          );
        });
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
            // Shared engine (also drives the `/rpc` mount) — single source of truth.
            const result = await studioEngines.runAutoplayEngine(body.action);
            writeJson(res, 200, result);
          } catch (err) {
            if (err instanceof RunInGameHttpError) {
              writeJson(res, err.statusCode, {
                ok: false,
                error: err.message,
                ...(err.details === undefined ? {} : { details: err.details }),
              });
              return;
            }
            const error = err instanceof Error ? err.message : "Civ7 autoplay request failed";
            writeJson(res, 500, { ok: false, error });
          }
        });
        server.middlewares.use("/api/studio/server-info", async (req, res, next) => {
          if (req.method !== "GET") return next();
          writeJson(res, 200, {
            ok: true,
            serverInstanceId: studioEngines.serverInstanceId,
            startedAt: studioEngines.serverStartedAt,
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
            const catalog = await loadCiv7SetupCatalog({ repoRoot: STUDIO_REPO_ROOT });
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
          try {
            writeJson(res, 200, studioEngines.runRunInGameStatusEngine(requestId));
          } catch {
            // Parity: 404 echoes serverInstanceId/serverStartedAt for restart detection.
            writeJson(res, 404, {
              ok: false,
              error: `Run in Game request not found: ${requestId}`,
              serverInstanceId: studioEngines.serverInstanceId,
              serverStartedAt: studioEngines.serverStartedAt,
            });
          }
        });
        server.middlewares.use("/api/civ7/run-in-game", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const body = await readJsonBody<RunInGameStartEngineBody>(req);
            // Shared engine (also drives the `/rpc` mount). Both the accepted and
            // duplicate-request results return 202 with the operation snapshot.
            const result = await studioEngines.runRunInGameStartEngine(body);
            writeJson(res, 202, result.operation);
          } catch (err) {
            const error = err instanceof Error ? err.message : "Run in Game failed";
            const statusCode = err instanceof RunInGameHttpError ? err.statusCode : 500;
            const details = err instanceof RunInGameHttpError ? err.details : undefined;
            writeJson(res, statusCode, {
              ok: false,
              error,
              ...(details === undefined ? {} : { details }),
            });
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
          try {
            // Shared engine. Parity: 404 here does NOT echo serverInstanceId.
            writeJson(res, 200, studioEngines.runSaveDeployStatusEngine(requestId));
          } catch {
            writeJson(res, 404, { ok: false, error: `Save/Deploy request not found: ${requestId}` });
          }
        });
        server.middlewares.use("/api/map-configs", async (req, res, next) => {
          if (req.method !== "POST") return next();
          try {
            const body = await readJsonBody<unknown>(req);
            // Shared engine (also drives the `/rpc` mount). Idempotent-active reuse +
            // 409 dual mutex + write-then-deploy + rollback live in the engine.
            const operation = await studioEngines.runSaveDeployEngine(body);
            writeJson(res, 202, operation);
          } catch (err) {
            if (err instanceof RunInGameHttpError) {
              writeJson(res, err.statusCode, {
                ok: false,
                error: err.message,
                ...(err.details === undefined ? {} : { details: err.details }),
              });
              return;
            }
            const error = err instanceof Error ? err.message : "Save failed";
            writeJson(res, 400, { ok: false, error });
          }
        });

        // -------------------------------------------------------------------
        // oRPC RPCHandler mount (slice ServerOrpc). EVERYTHING talks oRPC: this
        // mounts `@civ7/studio-server`'s effect-orpc router at `/rpc` INSIDE the
        // existing Vite dev middleware — alongside the legacy `/api/*` handlers,
        // which stay alive this run (coexistence; cutover is the bun-server
        // workstream's daemon slice). Both transports share the SAME engines +
        // stores (no state divergence).
        // -------------------------------------------------------------------
        const studioRpc = createStudioRpcHandler(
          createStudioServerContext({ engines: studioEngines, hostCommand: command }),
        );
        server.middlewares.use("/rpc", async (req, res, next) => {
          const request = await nodeRequestToWebRequest(req);
          const { matched, response } = await studioRpc.handle(request, { prefix: "/rpc" });
          if (!matched || !response) {
            next();
            return;
          }
          await writeWebResponse(res, response);
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
      "@": fileURLToPath(new URL("./src", import.meta.url)),
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
