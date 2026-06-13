## Design

This slice gives the studio its own oRPC server without changing behavior. The
contracts already exist (A1); this is A2/A3/A4-lite: Effect services, the
effect-orpc router with non-uniform error mapping, and a host handler mounted at
`/rpc`. The standalone Bun server topology + production `/api` parity fix +
removing the old `/api` middleware are explicitly DEFERRED (FRAME §4.7).

## Why a host-context seam (not fully self-owned services)

The stateful surface — autoplay (#8), run-in-game (#13/#14), save/deploy
(#15/#16) — shares ONE serialized operation queue and ONE pair of operation stores
(the dual-store 409 mutex: autoplay refuses while run-in-game OR save/deploy is
active, and vice-versa). This run keeps the legacy `/api/*` handlers ALIVE
alongside `/rpc` (coexistence). If the oRPC router instantiated its own stores,
`/api` and `/rpc` would hold divergent state and the cross-mutex parity would
break.

Therefore the engine bodies are lifted VERBATIM out of `vite.config.ts` into
shared functions over the existing module-level singletons. BOTH transports call
the same functions:

- the `/api` middleware adapts return/throw → `res` (its exact `{ ok:false, error,
  details }` body + status),
- the oRPC `StudioServerContext` adapts return/throw → value / `ORPCError`
  (`@civ7/studio-server`'s `orpcError` helper maps the engine's
  Studio engine error status + details onto the transport).

The read surface needs no shared state, so it is implemented inside the package
from `@civ7/direct-control` directly via the `Civ7TunerClient` Effect service.

## Parity registry (do-not-break) and how each is preserved

1. **Non-uniform status codes.** Per-procedure `orpcError(status, …)`:
   gameInfo/live.* → 400, setupConfig → 503, status/mapSummary/savedConfigs/
   setupCatalog → 500. Verified live via `/rpc`.
2. **`civ7.live.status` 200-with-embedded-`{error}`.** Four reads under
   `Effect.either` (the `Promise.allSettled` analogue); a rejected read becomes
   `{ error: String(reason) }` for that field; only an outer defect → transport
   error.
3. **run-in-game engine.** The full 9-phase state machine, fingerprint
   dedup→202, sha256 proof identity, log-marker/log-failure proof, `finally`
   cleanup + `gen:maps` regen — moved verbatim into one engine function.
4. **`assertNoRawControlFields`.** Runs inside `parseRunInGameSetupRequest` in the
   engine; rejects `command|script|javascript|rawJs|rawCommand` keys → 400.
   Verified through `/rpc`.
5. **Serialized queue + dual mutex.** The shared `studioOperationQueue` and the
   two operation stores are the single instances both transports use.
6. **404 server-id echo.** run-in-game and map-config status 404s echo
   `serverInstanceId`/`serverStartedAt` on the oRPC `data` payload. The original
   map-config one-sided identity rule was superseded by S1.2's error-spine parity
   requirement.

## effect-orpc isolation + packaging

`effect-orpc` (v0.2.2) is imported ONLY in `router/index.ts` (research/01 §6) so a
future swap to the inline adapter touches nothing else. It ships its public entry
as raw TypeScript via `exports` (no JS build wired in), which Node refuses to
type-strip under `node_modules`; the package therefore BUNDLES `effect-orpc` into
its `dist` (tsup `noExternal`) so any Node runtime consumer (the Vite dev config)
loads a self-contained module.

## Contract refinement

The A1 contract modelled `civ7.gameInfo.rows` and `civ7.live.gameInfo.tables[*]`
as bare row arrays, but the `/api` handlers assign the WHOLE
`Civ7GameInfoRowsResult` object there. Refined to the opaque result record to
match current behavior (the deep payload is internal per `shared.ts`).

## Deferred

- Standalone Bun server process; Vite dev proxy `/api`→Bun; prod Caddy
  `reverse_proxy`; removing the old `/api` middleware; switching client call sites.
