# Design — mapgen-studio-client-data

## Context

The server slice exposed `/rpc` and the typed client (`src/lib/orpc.ts`) but the
React app still spoke `fetch('/api/*')`. This slice flips the client onto oRPC and
introduces the client data-layer architecture (TanStack Query client + the first
Zustand store), without changing any observable behavior.

## Key decision: "move transport, not logic"

The three `features/*/api.ts` wrappers were thin `fetch` shims with bespoke
result envelopes (`{ ok, error, statusCode, observedAt, details }`) that `App.tsx`
depends on. Rather than rewrite the call sites into `useQuery`/`useMutation` (a
large, parity-risky churn over a 2,522-line component), we kept the wrapper
signatures and swapped ONLY their transport: `fetch(...)` → `orpcClient.<ns>.<proc>(...)`.

This makes parity hold by construction:

- **Success** returns the typed contract output; the wrapper projects it to the
  same fields the caller already consumed.
- **Failure** throws an `ORPCError` whose `status` is the legacy HTTP code and whose
  `data` carries the legacy extra body fields. A single `orpcFailure`/`runInGameFailure`/
  `saveDeployFailure` helper translates `ORPCError → { error, statusCode, observedAt|details }`,
  reproducing the old `res.ok`/`body.error` discrimination.

The non-uniform status registry (setup-config 503, save/deploy 400, run-in-game
404 with server-id echo) is preserved because the router already pins those onto
`ORPCError.status`/`.data`; the client just reads them back.

## Key decision: the live-runtime poll is migrated, not deferred

The plan allowed leaving the poll on `fetch` if oRPC could not preserve its
semantics. It can, exactly:

- `civ7.live.status` returns **200** even on partial failure (per-field embedded
  `{ error }` via `allSettled`) and throws an `ORPCError` (500) ONLY on an outer
  defect. That throw is rethrown as an `Error` carrying the message — the SAME path
  the legacy `!res.ok` branch produced — so the adaptive-backoff failure accounting
  is untouched.
- `civ7.live.snapshot` returns the 200 grid body or throws an `ORPCError` (400).
  The catch builds `{ ok:false, error }`, the SAME shape the legacy
  `res.ok ? body : { ok:false, error }` produced, which `buildLiveRuntimeSnapshotState`
  already handles.
- The request-key staleness gate (`shouldCommitLiveRuntimeSnapshot`), the adaptive
  backoff (`nextLiveRuntimePollDelayMs`), the per-read abort controllers, and the
  inlined setup-config read all stay verbatim — only the network call changed.

Runtime verification confirmed the poll cycles `live/status → setupConfig →
live/snapshot` over `/rpc` at 200 with the same cadence and no snapshot tearing.

## Key decision: viewStore now, authoring/run stores with decomposition

`viewStore` owns browser-only view state — no server coupling, no persistence
contract — so it is the safest first Zustand store and becomes the single owner
(App keeps no `useState` mirror). The setters accept value-or-updater so the
migration is a drop-in for existing `setX((prev) => …)` call sites.

The persisted `authoringStore`/`runStore` (architecture §3) are DEFERRED to the
component-decomposition slice. Their localStorage schema is hard-core parity
("copy it, don't fix it", §6); moving it into Zustand `persist` is safer done
alongside the component split than bundled into the transport swap. The reference
persistence modules are untouched here. This is within the protective belt
(slice ordering within a phase is negotiable; the hard core — zero manual fetch,
parity, no query→Zustand mirroring — is fully met).

## The crisp rule

Server-owned state flows through TanStack Query (via oRPC); browser-only state
lives in Zustand. Query results are NEVER mirrored into Zustand. `viewStore` holds
only view selections; the live/setup/catalog reads stay in the query/poll layer.

## Risk / parity notes

- The only intentional micro-divergence: `saveRepoBackedConfig`'s initial-POST
  error path previously echoed `body?.path` from a 4xx body; the oRPC error `data`
  does not carry it, so that failure now omits `path` (the engine attaches `path`
  only to the in-progress status, which the poll loop still surfaces). Documented
  inline.
- `buildLiveRuntimeSnapshotQuery` (the old URL query builder) is now unused by the
  app; it remains exported from `features/liveRuntime/model.ts` for tests.
