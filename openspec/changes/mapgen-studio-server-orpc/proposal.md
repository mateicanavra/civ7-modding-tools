## Why

The MapGen Studio redesign's core directive (FRAME §4.7) is that EVERYTHING talks
oRPC and nothing hand-rolls `fetch`. The studio's own oRPC contracts already exist
(`packages/studio-server/src/contract/*`, 16 endpoints) but had no implementation:
the live API was ~16 hand-rolled `/api/*` handlers inside
`apps/mapgen-studio/vite.config.ts`. This change stands up the studio's own
effect-orpc server implementing those contracts and mounts it at `/rpc` inside the
existing Vite dev middleware, while keeping the legacy `/api/*` handlers alive
(coexistence — cutover is a later supervised step).

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§4.7 — everything talks oRPC)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md`
  (§1 server, §2 client, §7 do-not-break registry)
- `docs/projects/mapgen-studio-redesign/research/01-orpc-effect-bun.md`
  (effect-orpc bridge: `implementEffect`, `RPCHandler`, isolation rule)
- `packages/studio-server/src/contract/*` (the committed 16-endpoint contract)

## What Changes

- Implement `@civ7/studio-server`'s effect-orpc router for all 16 contract
  procedures: read surface (status, mapSummary, gameInfo, live.*, setupConfig,
  savedConfigs, setupCatalog, serverInfo) via Effect services wrapping
  `@civ7/direct-control`; stateful surface (autoplay, runInGame.*, mapConfigs.*)
  via a host-injected `StudioServerContext` seam.
- Lift the `/api/*` handler BODIES VERBATIM. The run-in-game 9-phase engine,
  save/deploy write-then-deploy+rollback, autoplay mutex, fingerprint dedup,
  sha256 proof identity, serialized queue, dual-store 409 mutex, and
  `assertNoRawControlFields` security scan move into shared engine functions that
  BOTH `/api` and `/rpc` call, so state is shared and behavior is preserved by
  construction.
- Preserve the parity registry EXACTLY: non-uniform error status codes
  (gameInfo/live → 400, setupConfig → 503, most → 500, 404 on missing op);
  `civ7.live.status` 200-with-embedded-`{error}`; run-in-game status 404 echoes
  `serverInstanceId`/`serverStartedAt` while map-config status 404 does not.
- Mount an oRPC `RPCHandler` at `/rpc` inside the existing Vite dev middleware
  (no Bun process). Keep ALL legacy `/api/*` handlers alive (coexistence).
- Add `apps/mapgen-studio/src/lib/orpc.ts`: the typed oRPC client (RPCLink → `/rpc`)
  + `createTanstackQueryUtils`. Call sites are NOT switched (next slice).
- Wire `@civ7/studio-server` (and `@orpc/client`/`@orpc/contract`/`@orpc/tanstack-query`/
  `@tanstack/react-query`) as app dependencies.
- Refine two contract fields (`civ7.gameInfo.rows`, `civ7.live.gameInfo.tables`)
  to the opaque result record, matching the actual `/api` behavior (the A1
  contract modelled them as bare row arrays, which the handlers never returned).

## Requires

- `mapgen-studio-app-decomposition` (the prior slice; this stacks on it)

## Enables Parallel Work

- The next slice migrates the client call sites (`src/features/*` fetches) onto
  the oRPC client + TanStack Query utils added here.

## Affected Owners

- `packages/studio-server/**` (services, router, runtime, handler, errors, context)
- `apps/mapgen-studio/vite.config.ts` (shared engines + `/rpc` mount)
- `apps/mapgen-studio/src/lib/orpc.ts` (client)
- `apps/mapgen-studio/package.json`, `packages/studio-server/package.json`

## Forbidden Owners

- No standalone Bun server process (DEFERRED, FRAME §4.7).
- No removal of the existing `/api/*` middleware (coexistence this run).
- No new FireTuner reads; the live subset stays direct-control-backed.
- No `mods/**` changes.

## Stop Conditions

- Any hard-core parity behavior cannot be preserved (non-uniform status codes,
  live.status embedded-error, run-in-game engine, proof identity, security scan,
  serialized queue / dual mutex, 404 server-id echo asymmetry).

## Consumer Impact

The studio exposes a typed oRPC surface (`/rpc`) the React client can consume with
end-to-end type safety, with zero behavior change to the existing app.

## Verification Gates

- `bun run check` in `packages/studio-server` (tsc clean).
- `bun run check` + `bun run build` in `apps/mapgen-studio` (tsc + vite build +
  worker-bundle check).
- Runtime smoke through `/rpc`: serverInfo 200; non-uniform error codes; run-in-game
  404 echoes server identity; map-config 404 does not; `assertNoRawControlFields`
  rejects raw-control keys with 400; legacy `/api/*` still responds (shared state).
- OpenSpec strict validation.
