# Tasks — mapgen-studio-client-data

## 1. TanStack Query client
- [x] 1.1 Add `src/lib/query.ts` — `createQueryClient()` with sane defaults
      (short `staleTime`, single retry, refetch-on-focus).
- [x] 1.2 Wrap the app in `QueryClientProvider` in `main.tsx` with one
      module-root client instance (survives the dev-only StrictMode skip).

## 2. Migrate feature api.ts wrappers off manual fetch
- [x] 2.1 `features/civ7Setup/api.ts` — `setupConfig`, `savedConfigs`,
      `setupCatalog`, `autoplay` now call `orpcClient.*`; result envelopes
      (`{ ok, error, statusCode, observedAt }`) preserved; `ORPCError.status` →
      `statusCode`, `ORPCError.data.observedAt` → `observedAt`; autoplay 200-with-
      `ok:false` still surfaces as `{ ok:false }`.
- [x] 2.2 `features/runInGame/api.ts` — `start`/`status` via `orpcClient.runInGame.*`;
      request envelope (incl. the `assertNoRawControlFields`-scanned body) assembled
      verbatim; `ORPCError.status` → `statusCode` (404 restart detection),
      `ORPCError.data.details` → `details`.
- [x] 2.3 `features/mapConfigSave/api.ts` — `saveDeploy`/`status` via
      `orpcClient.mapConfigs.*`; running-status poll loop, error handling, and the
      localStorage key string preserved; `ORPCError.status` → `statusCode`.

## 3. Migrate the live-runtime poll transport (parity-critical)
- [x] 3.1 `App.tsx` poll `civ7.live.status` read → `orpcClient.civ7.live.status`
      with the status abort signal; the 500 outer-failure throw maps to the same
      catch path the legacy `!res.ok` branch hit.
- [x] 3.2 `App.tsx` poll `civ7.live.snapshot` read → `orpcClient.civ7.live.snapshot`
      with the snapshot abort signal; the 400 throw maps to the `{ ok:false, error }`
      envelope the legacy `res.ok ? … : …` produced.
- [x] 3.3 Keep `shouldCommitLiveRuntimeSnapshot` staleness gate,
      `nextLiveRuntimePollDelayMs` adaptive backoff, abort plumbing, and the inlined
      `fetchCiv7SetupConfig` (now oRPC) call sequence unchanged.
- [x] 3.4 Confirm ZERO `fetch(` remains in `App.tsx`.

## 4. Zustand viewStore
- [x] 4.1 Add `src/stores/viewStore.ts` — Zustand v5 store owning the view-only
      surface (canvas toggles, overlay selection, era mode, panel collapse,
      selected stage/step) with `useState`-compatible setters (value-or-updater).
- [x] 4.2 Replace the scattered `App.tsx` view `useState` with `useViewStore`
      selectors (single owner; no App mirror). Server data not mirrored into Zustand.
- [x] 4.3 Add `zustand@5.0.14` dependency.

## 5. Verify
- [x] 5.1 `bun run check` (tsc clean).
- [x] 5.2 `bun run build` (vite + worker-bundle check passes).
- [x] 5.3 Dev-server runtime: network shows only `POST /rpc/*` (zero `/api/*`);
      live poll cycles over oRPC at 200; status 404s handled cleanly; no console
      errors; screenshot renders the studio.
- [x] 5.4 `bun run openspec -- validate mapgen-studio-client-data --strict`.
