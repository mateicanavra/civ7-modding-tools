# Studio server cutover — standalone Bun daemon owns the server surface

## Why

Today the Studio has no server process of its own: every server-side surface
(the `@civ7/studio-server` `/rpc` mount, the control-oRPC mount at
`/api/civ7/rpc`, the recipe-DAG mount at `/api/recipe-dag/rpc`, and 16
hand-rolled legacy `/api/*` REST handlers) runs as Vite dev middleware, with
the stateful engines (serialized operation queue, run-in-game + save/deploy
operation stores, server instance identity) living at module scope inside
`vite.config.ts`. Production is a static SPA with no server at all, so the
dev semantics are the only semantics — and they are welded to the dev
bundler. This was the planned P5a coexistence state; the P5b cutover
(00-GOAL "Remaining (SUPERVISED)", FRAME §4.7 deferral, user go granted
2026-06-11) moves the server surface onto a standalone Bun daemon and makes
Vite frontend-only.

Bun also dissolves a real defect class: `effect-orpc` ships TypeScript
source as its package entry, which Node cannot load outside Vite's SSR
pipeline — forcing the recipe-DAG mount through per-request `ssrLoadModule`
(see `mapgen-studio-dag-tab` design addendum). Bun loads TS natively; the
daemon imports the same fetch handler statically.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md`
  (§1 server target + parity invariants, §7 do-not-break registry)
- `docs/projects/mapgen-studio-redesign/00-GOAL.md` (P5b entry — supervised,
  go granted)
- `packages/studio-server/src/{index,handler}.ts` (A4-lite host seam:
  fetch-adapter `createStudioRpcHandler`)
- `openspec/changes/mapgen-studio-dag-tab/design.md` addendum (mount
  constraints + research evidence: fetch handlers are the canonical
  artifacts, Vite hosting was a dev-era necessity)
- `tools/gt-stack-inspect` on `codex/gt-stack-inspect-dev-live-topology`
  (prior-art daemon + dev-live runner + Vite `/rpc` proxy topology;
  read-only reference — `codex/*` branches are never touched)

## What Changes

- **Engines move out of `vite.config.ts`** into
  `apps/mapgen-studio/src/server/studio/engines.ts`: a
  `createStudioEngines({ repoRoot })` factory owning the serialized
  operation queue, both operation stores, the server instance identity, and
  the five engine functions (autoplay, run-in-game start/status,
  save-deploy start/status) — moved verbatim, behavior-parity hard core.
  The `StudioServerContext` builder moves alongside as
  `createStudioServerContext`. (This slice changes no topology: Vite still
  hosts everything, now via the extracted module.)
- **Control-oRPC mount converts to the fetch adapter**
  (`@orpc/server/fetch`), mirroring the recipe-DAG mount's shape: canonical
  fetch handler + thin Connect shim over the shared
  `server/http/nodeWebBridge`. Path contract `/api/civ7/rpc` unchanged.
- **Standalone Bun daemon** (`src/server/daemon/daemon.ts`): `Bun.serve`
  hosting a fetch router that owns `/healthz`, `/rpc` (studio-server),
  `/api/civ7/rpc` (control-oRPC), `/api/recipe-dag/rpc` (statically
  imported — the `ssrLoadModule` constraint evaporates under Bun), the
  legacy `/api/*` REST surface as a compat layer over the same engines, and
  optional static `dist` serving (the production story's opening, not wired
  to deploy in this change).
- **Vite becomes frontend-only**: the `configureServer` plugin and all
  server-side imports leave `vite.config.ts`; `server.proxy` forwards
  `/rpc` and `/api` to the daemon. Dev topology: `bun run dev` runs a
  dev-live runner that spawns the daemon (port 5174), waits for `/healthz`,
  then spawns Vite (port 5173).
- **Legacy `/api/*` REST handlers: RETIRED** (user directive 2026-06-12: "no
  legacy allowed... no support, forward only"). The daemon serves the three
  oRPC mounts only; any other `/api` path is a 404. The single external
  consumer (`scripts/civ7-direct-control/verify-final-surface-parity.ts`)
  moves to the oRPC `runInGame.status` endpoint in the same slice. The
  retired-path inventory lives in `design.md`.

## Non-Goals
- No Railway/Caddy production deploy changes (the daemon's static serving
  makes them possible later; wiring them is out of scope).
- No contract changes to `@civ7/studio-server`, `@civ7/control-orpc`, or
  the recipe-DAG router; no client-visible transport changes.
- No re-implementation of engine logic — the engine bodies move verbatim.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/vite.config.ts` (shrinks to
  frontend-only), `apps/mapgen-studio/src/server/studio/*` (new: engines,
  context), `apps/mapgen-studio/src/server/daemon/*` (new: daemon, dev-live
  runner), `apps/mapgen-studio/src/server/civ7ControlOrpc.ts` (fetch
  adapter), `apps/mapgen-studio/package.json` (dev scripts),
  `apps/mapgen-studio/test/server/*` (new pins),
  `scripts/civ7-direct-control/verify-final-surface-parity.ts` (oRPC
  transport)
