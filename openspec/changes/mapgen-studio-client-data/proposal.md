## Why

The prior slice (`mapgen-studio-server-orpc`) stood up the studio's own
effect-orpc server at `/rpc` and added the typed oRPC client (`src/lib/orpc.ts`)
but did NOT switch any call sites — the React client still reached the backend
through hand-rolled `fetch` of `/api/*` (the `src/features/*/api.ts` wrappers and
the live-runtime poll inside `App.tsx`). This violates the core directive
(FRAME §4.7): EVERYTHING talks oRPC; NEVER hand-roll `fetch`. This change completes
the client half — after it, the studio performs ZERO manual fetch of `/api`.

It also lands the client data-layer architecture from
`architecture/10-target-architecture.md` §2–§3: a single TanStack Query client
and the first Zustand store (`viewStore`) that owns browser-only view state, so
later decomposition slices build on real state/server-data boundaries.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§4.7 — everything talks oRPC;
  the live-runtime poll's staleness/backoff is hard core)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md`
  (§2 client data layer, §3 stores + crisp rule, §7 do-not-break registry)
- `docs/projects/mapgen-studio-redesign/architecture/12-control-seam.md`
  (live reads stay direct-control-backed behind a thin seam for now)
- `packages/studio-server/src/contract/*` (the contract the client consumes)

## What Changes

- Add `apps/mapgen-studio/src/lib/query.ts` — a `QueryClient` factory with sane
  defaults (short `staleTime`, single retry, refetch-on-focus) — and wrap the app
  in `QueryClientProvider` in `main.tsx`.
- Migrate every hand-rolled `/api/*` `fetch` to the typed oRPC client
  (`src/lib/orpc.ts`): the three `src/features/*/api.ts` wrappers (civ7Setup,
  runInGame, mapConfigSave) move their TRANSPORT from `fetch` to `orpcClient.*`
  while preserving their exact result envelopes; the live-runtime poll's two reads
  (`civ7.live.status`, `civ7.live.snapshot`) plus the inlined `civ7.setupConfig`
  read route through the oRPC client too. After this change there is ZERO manual
  fetch of `/api` anywhere in the client.
- Preserve the live-runtime poll parity EXACTLY: the request-key staleness gate
  (`shouldCommitLiveRuntimeSnapshot`), adaptive backoff (`nextLiveRuntimePollDelayMs`),
  abort plumbing, and the 200-with-embedded-`{error}` handling are unchanged — only
  the transport call is swapped. `live.status`'s outer-failure throw maps to the
  same catch path the legacy `!res.ok` branch hit; `live.snapshot`'s 400 maps to the
  same `{ ok:false, error }` envelope the legacy `res.ok ? … : …` produced.
- Preserve the non-uniform error semantics on the client: `ORPCError.status`
  reproduces the legacy `statusCode` (used for run-in-game status 404 restart
  detection) and `ORPCError.data` carries `details`/`observedAt`/server-id echo.
- Introduce `viewStore` (Zustand v5) as the single owner of browser-only view
  state (canvas toggles, overlay selection, era mode, panel collapse, selected
  stage/step) and replace the scattered `App.tsx` `useState` for that surface with
  store selectors — App holds no mirror. Server data is NEVER mirrored into Zustand.
- Add `zustand@5.0.14` as an app dependency.

## Requires

- `mapgen-studio-server-orpc` (the prior slice; this stacks on it — the `/rpc`
  mount and `src/lib/orpc.ts` client come from there)

## Enables Parallel Work

- Component decomposition (P3) builds on `viewStore` and the query/mutation
  call-site shapes landed here; the authoring/run persisted Zustand stores move
  alongside that decomposition (see Deferred).

## Affected Owners

- `apps/mapgen-studio/src/lib/query.ts` (new)
- `apps/mapgen-studio/src/stores/viewStore.ts` (new)
- `apps/mapgen-studio/src/main.tsx` (QueryClientProvider)
- `apps/mapgen-studio/src/App.tsx` (poll transport → oRPC; view state → store)
- `apps/mapgen-studio/src/features/{civ7Setup,runInGame,mapConfigSave}/api.ts`
  (transport → oRPC; result envelopes preserved)
- `apps/mapgen-studio/package.json` (zustand)

## Forbidden Owners

- No removal of the legacy `/api/*` middleware (coexistence this run).
- No new FireTuner reads; live reads stay direct-control-backed via the studio
  contract.
- No mirroring of TanStack Query results into Zustand (the crisp rule, §3).
- No change to the localStorage persistence schema (authoring/run persistence is
  the reference impl — copy, don't fix; §6).
- No `mods/**` changes.

## Stop Conditions

- The live-runtime poll's request-key staleness or adaptive backoff cannot be
  preserved through the oRPC client — in that case leave that poll on `fetch` and
  note it; do not risk parity.
- Any non-uniform status code or error-`data` field (run-in-game 404 server-id
  echo, save/deploy `details`, setup-config `observedAt`) is lost across the client
  boundary.

## Consumer Impact

The studio behaves identically; all client→server traffic now flows over the typed
oRPC `/rpc` surface (verified: no `/api/*` requests at runtime). View state has a
single Zustand owner.

## Deferred

- The persisted `authoringStore` and `runStore` (§3) — moving the localStorage-
  backed authoring/run state into Zustand `persist` is done alongside component
  decomposition (P3) to avoid disturbing the parity-critical persistence schema in
  the same slice that swaps transport. The reference persistence
  (`features/studioState/persistence.ts`, `features/runInGame/sourceSnapshotStorage.ts`)
  is unchanged here.

## Verification Gates

- `bun run check` in `apps/mapgen-studio` (tsc clean).
- `bun run build` in `apps/mapgen-studio` (vite build + worker-bundle check).
- Runtime: dev server with `/rpc` mount; network shows ONLY `POST /rpc/*` calls
  (zero `/api/*`); the live poll cycles `live/status → setupConfig → live/snapshot`
  through oRPC at 200; run-in-game/map-config status 404s on a fresh server are
  handled without a retry storm; no console errors; screenshot renders the studio.
- OpenSpec strict validation.
