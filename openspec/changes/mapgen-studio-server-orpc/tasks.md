## 1. Effect Services + Runtime

- [x] 1.1 Add `Civ7TunerClient` Effect service wrapping `@civ7/direct-control`
  reads (status, mapSummary, gameInfo, appUi, autoplayStatus, setupSnapshot,
  savedConfigs, mapGrid, player/unit/city summaries) with verbatim call shapes.
- [x] 1.2 Add `StudioConfig` Effect tag carrying the host-supplied
  `StudioServerContext` (process singletons + catalog loader + engine fns).
- [x] 1.3 Add `makeStudioRuntime(context)` composing the service Layer into a
  `ManagedRuntime`.

## 2. Router + Error Mapping (parity registry)

- [x] 2.1 Implement all 16 procedures via `implementEffect(contract, runtime)`,
  isolating `effect-orpc` to `router/` (research/01 §6).
- [x] 2.2 Reproduce NON-UNIFORM error status codes via `orpcError(...)`
  (gameInfo/live → 400, setupConfig → 503, most → 500).
- [x] 2.3 Implement `civ7.live.status` as 200-with-embedded-`{error}` per field
  (`Effect.either` allSettled analogue).
- [x] 2.4 Port query-parse parity (snapshot clamps/csv, entities clamp, live
  gameInfo 8-table cap) against the typed input.

## 3. Shared Engines (verbatim lift, shared state)

- [x] 3.1 Lift autoplay, run-in-game start/status, save/deploy save/status bodies
  out of `vite.config.ts` into shared engine functions over the existing
  module-level stores + serialized queue.
- [x] 3.2 Route BOTH the legacy `/api/*` handlers AND the oRPC `StudioServerContext`
  through those engines (no state divergence; dual-store 409 mutex preserved).
- [x] 3.3 Preserve run-in-game status 404 `serverInstanceId`/`serverStartedAt`
  echo; S1.2 updates map-config status 404 to echo the same identity fields.
- [x] 3.4 Preserve `assertNoRawControlFields`, fingerprint dedup→202, sha256 proof
  identity, `finally` cleanup + `gen:maps` regen, write-then-deploy rollback.

## 4. Handler Mount + Client

- [x] 4.1 Add `createStudioRpcHandler(context)` → oRPC `RPCHandler` (fetch adapter).
- [x] 4.2 Mount `/rpc` inside the existing Vite dev middleware (Connect
  `originalUrl` prefix fix); keep ALL legacy `/api/*` handlers alive.
- [x] 4.3 Add `apps/mapgen-studio/src/lib/orpc.ts` (RPCLink → `/rpc`, client typed
  off the contract, `createTanstackQueryUtils`); do NOT switch call sites.
- [x] 4.4 Wire `@civ7/studio-server` + oRPC/TanStack deps into the app; add
  `@civ7/direct-control` to the package; bundle `effect-orpc` into the package dist
  (it ships raw TS that Node cannot type-strip under node_modules).

## 5. Contract Refinement + Validation

- [x] 5.1 Refine `civ7.gameInfo.rows` and `civ7.live.gameInfo.tables` to the opaque
  result record (the A1 contract did not match `/api` behavior).
- [x] 5.2 `bun run check` in `packages/studio-server` (tsc clean).
- [x] 5.3 `bun run check` + `bun run build` in `apps/mapgen-studio`.
- [x] 5.4 Runtime smoke through `/rpc` + legacy `/api` coexistence (status codes,
  status-miss identity echo, security scan, no console errors).
- [x] 5.5 Run `bun run openspec -- validate mapgen-studio-server-orpc --strict`.
