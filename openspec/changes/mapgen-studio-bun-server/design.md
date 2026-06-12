# Design — Standalone Bun daemon for the Studio server surface

## Current state (verified 2026-06-12)

- `vite.config.ts` (1,420 lines) carries: ~950 lines of engine code at
  module scope (queue, two operation stores, instance identity, autoplay /
  run-in-game / save-deploy engines), 16 legacy REST handlers, and three
  oRPC mounts (`/rpc` studio-server, `/api/civ7/rpc` control,
  `/api/recipe-dag/rpc` recipe-DAG via per-request `ssrLoadModule`).
- The client is already 100% oRPC: zero manual `/api/*` fetches in app
  source. The only `/api` strings client-side are the two oRPC path
  constants. (P2 client-data slice did the cutover of reads.)
- `@civ7/studio-server`'s handler is already the A4-lite fetch shape
  (`Request`/`Response`); the recipe-DAG handler likewise
  (`createStudioRecipeDagRpcHandler`). Only the control mount still uses
  the node adapter (`@orpc/server/node`).
- Production (`railway.json`/Caddy) serves static `dist` only — no server.

## Topology decision

Blueprint: `tools/gt-stack-inspect` on
`codex/gt-stack-inspect-dev-live-topology` (read-only prior art) — a Bun
daemon (`Bun.serve({ fetch })` over a fetch-adapter RPC handler + static
assets + `/healthz`), a `dev-live` runner spawning daemon then Vite, and a
Vite proxy for the RPC prefix. The studio adopts the same shape:

```
bun run dev
  └─ src/server/daemon/devLive.ts        (runner)
       ├─ spawns: bun src/server/daemon/daemon.ts --port 5174   (backend)
       │    Bun.serve fetch router:
       │      /healthz                → runtime health (json)
       │      /rpc/*                  → createStudioRpcHandler (studio-server)
       │      /api/civ7/rpc/*         → control-oRPC fetch handler
       │      /api/recipe-dag/rpc/*   → recipe-DAG fetch handler (static import)
       │      /api/*                  → legacy REST compat (same engines)
       │      static dist (optional, --assets-root; prod story)
       └─ spawns: vite --port 5173                              (frontend)
            server.proxy: /rpc → 5174, /api → 5174
```

- Ports: Vite keeps 5173 (`strictPort`); daemon defaults to 5174.
  `STUDIO_DEV_RPC_TARGET` overrides the proxy target so `vite` alone still
  works against an already-running daemon.
- The daemon resolves `repoRoot` from its own module location by default
  (`--repo-root` overrides), mirroring the engines' previous
  `vite.config.ts`-relative resolution.
- `Bun.serve` is typed via a minimal local `declare const Bun` (blueprint
  pattern) — no new dependency; the module is executed only under Bun.

## Engine extraction (slice 2 — no topology change)

`createStudioEngines({ repoRoot })` in `src/server/studio/engines.ts` owns
all process-singleton state and returns the five engine functions plus
identity. Moved **verbatim** from `vite.config.ts`; the only edits are the
factory closure and `repoRoot` parameterization (previously recomputed per
call via `fileURLToPath(new URL("../..", import.meta.url))`).

`createStudioServerContext({ engines, hostCommand })` in
`src/server/studio/context.ts` is the moved `createStudioServerContextForApp`
— the `RunInGameHttpError → ORPCError` mapping that preserves the
non-uniform status codes (arch/10 §1 parity invariants).

Module constraint (load-bearing): `engines.ts` imports
`@civ7/direct-control` + local server modules only — **never
`effect-orpc`** — so the interim static import into `vite.config.ts` stays
node-evaluable. `@civ7/studio-server` is safe (tsup bundles effect-orpc
into its dist); app-src effect-orpc consumers (the recipe-DAG router) stay
out of the config graph until the daemon slice removes the need entirely.

Slice 2 leaves Vite hosting everything — the config consumes the extracted
module at module scope, identical behavior, all transports still share one
engine instance per process.

## Control-oRPC fetch adapter (slice 3)

`civ7ControlOrpc.ts` re-shapes to mirror `recipeDag/orpc.ts`: canonical
`createStudioCiv7ControlRpcHandler` on `RPCHandler` from
`@orpc/server/fetch` (prefix `STUDIO_CIV7_CONTROL_ORPC_PATH`), plus the
Connect shim over `server/http/nodeWebBridge` for the Vite mount this
slice. Context construction (`directControl` facade + `endpointDefaults`)
unchanged. Path contract unchanged.

## Daemon + cutover (slice 4)

- `src/server/daemon/daemon.ts`: arg parsing (`--host`, `--port`,
  `--repo-root`, `--assets-root`), one `createStudioEngines` instance, the
  three fetch handlers, the legacy compat router, `/healthz`, optional
  static serving with SPA fallback. The fetch composition is exported as a
  pure `createStudioDaemonFetch(deps)` so route dispatch is unit-testable
  under vitest without `Bun.serve`.
- `src/server/studio/legacyHttp.ts`: the 16 REST handlers re-expressed as
  fetch handlers over the same engines — **byte-equal response bodies and
  status codes**, including the parity pins: run-in-game status 404 echoes
  `serverInstanceId`/`serverStartedAt`; save-deploy status 404 does not;
  autoplay/save-deploy/run-in-game non-uniform codes; `live/status` returns
  200 with per-field embedded `{error}`.
- `vite.config.ts`: the `configureServer` plugin and every server-side
  import are deleted; `server.proxy` forwards `/rpc` and `/api` to the
  daemon. The config no longer drags `@civ7/direct-control` or any engine
  code — config restarts become cheap and safe (the silent-restart-failure
  trap documented in the dag-tab addendum loses its teeth).
- `package.json`: `dev` → dev-live runner; `dev:frontend` → `vite`;
  `dev:server` → daemon. `build`/`test`/`check` unchanged.
- `studio.serverInfo.viteCommand` (contract: `z.string()`) is supplied by
  the host: the daemon passes `"daemon"`. Verified no client branches on
  the value (display/identity only); `serverInstanceId`/`startedAt` restart
  detection is unaffected (identity now lives in the daemon process —
  correct: it owns the operation stores the client reconciles against).

## Legacy retirement list (checkpoint artifact — NOT auto-run)

The compat surface below is pending an explicit user checkpoint before
deletion. Consumer evidence (repo-wide sweep 2026-06-12): the studio client
calls none of these (oRPC-only since P2); the single live consumer is
`scripts/civ7-direct-control/verify-final-surface-parity.ts` (hits
`GET /api/civ7/run-in-game/status`); `packages/civ7-direct-control/README.md`
documents three of them as examples.

| # | Legacy path | oRPC equivalent (`/rpc`) |
| --- | --- | --- |
| 1 | `GET /api/civ7/status` | `civ7.status` |
| 2 | `GET /api/civ7/map-summary` | `civ7.mapSummary` |
| 3 | `GET /api/civ7/gameinfo` | `civ7.gameInfo` |
| 4 | `GET /api/civ7/live/status` | `civ7.live.status` |
| 5 | `GET /api/civ7/live/snapshot` | `civ7.live.snapshot` |
| 6 | `GET /api/civ7/live/entities` | `civ7.live.entities` |
| 7 | `GET /api/civ7/live/gameinfo` | `civ7.live.gameInfo` |
| 8 | `POST /api/civ7/autoplay` | `civ7.autoplay` |
| 9 | `GET /api/studio/server-info` | `studio.serverInfo` |
| 10 | `GET /api/civ7/setup-config` | `civ7.setupConfig` |
| 11 | `GET /api/civ7/saved-configs` | `civ7.savedConfigs` |
| 12 | `GET /api/civ7/setup-catalog` | `civ7.setupCatalog` |
| 13 | `GET /api/civ7/run-in-game/status` | `runInGame.status` (+ parity script) |
| 14 | `POST /api/civ7/run-in-game` | `runInGame.start` |
| 15 | `GET /api/map-configs/status` | `mapConfigs.status` |
| 16 | `POST /api/map-configs` | `mapConfigs.saveDeploy` |

Retirement slice (post-checkpoint): delete `legacyHttp.ts` + its daemon
mount + tests; update or retire the parity script's status poll.

## Testing

- Existing pins unchanged: `test/recipeDag/orpc.test.ts` (node transport
  via the Connect shim), operation-state suites, watch-ignore pins.
- New: daemon route-dispatch tests over `createStudioDaemonFetch` with
  injected handlers (prefix routing, healthz, 404 fall-through, static
  fallback); control fetch-adapter transport test (mirror of the recipe-DAG
  one); legacy compat parity pins (404-echo asymmetry, non-uniform status
  codes, `live/status` embedded-error 200); dev-live plan test
  (`makeDevLivePlan` pure function: commands, ports, proxy env).
- Live smoke (fresh processes, both run modes): `bun run dev` →
  generation run completes; pipeline view loads the DAG through the proxy;
  control readiness poll works; curl pins on `/healthz`, a legacy path, and
  `studio.serverInfo`.
