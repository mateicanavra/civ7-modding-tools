# Tasks — mapgen-studio-data-model

## 1. Contract type-hole fix
- [x] 1.1 `packages/studio-server/src/contract/runInGame.ts` — change
      `selectedConfig.id` from `z.string()` to `z.string().optional()` to match
      `parseRunInGameSetupRequest` (disposable runs omit `id`).
- [x] 1.2 `features/runInGame/api.ts` — remove the
      `as unknown as Parameters<typeof orpcClient.runInGame.start>[0]` cast; the
      assembled request now type-checks against the start input directly.
- [x] 1.3 Verify the engine still reads `selectedConfig.id` the same way
      (optional everywhere; no required-id assumption introduced).

## 2. Reads → oRPC-native TanStack Query
- [x] 2.1 Add saved-configs + setup-catalog `useQuery`s via
      `orpc.civ7.savedConfigs.queryOptions()` / `orpc.civ7.setupCatalog.queryOptions()`;
      derive the existing `{ status, directory, configurations, updatedAt, error }` /
      `{ status, catalog, updatedAt, error }` view shapes from query state.
- [x] 2.2 Remove the hand-rolled saved-configs/catalog load+retry+focus effect;
      retry-on-failure and refetch-on-focus are provided by the query client defaults.
- [x] 2.3 Keep the inlined `setupConfig` read inside the live-runtime poll loop
      (it feeds the per-tick suggestion pipeline); the live status/snapshot poll
      stays imperative verbatim (hard core).

## 3. Status polling → TanStack Query
- [x] 3.1 Run-in-game status `useQuery` keyed on the active request id (from
      `runStore`), `refetchInterval` reproducing `document.hidden ? 3000 : 1000`,
      stopping at terminal phase / non-running status.
- [x] 3.2 Save-deploy status `useQuery` keyed on the active request id, same
      adaptive cadence, stopping when not running.
- [x] 3.3 Imperative start/save mutations seed the operation state synchronously and
      write `runStore`; the poll's `initialData` keeps the seeded operation fresh for one
      interval so there is NO immediate mount fetch (it picks up from the seed). The
      404 → synthetic `uncertain` / `operation-status-missing` mapping is preserved in
      the `refresh*` callbacks the poll's `queryFn` invokes.
- [x] 3.4 Mount-time localStorage restore feeds the request id into `runStore` so the
      status `useQuery`s resume after a dev-server reload.

## 4. Persisted authoringStore
- [x] 4.1 Add `src/stores/authoringStore.ts` — Zustand `persist` store owning
      `worldSettings`, `recipeSettings`, `setupConfig`, `pipelineConfig`,
      `overridesDisabled`, `repoBackedPresetOverridesByRecipe`.
- [x] 4.2 Use the EXACT `STUDIO_AUTHORING_STATE_KEY` and the existing
      `parseStudioAuthoringState` / serialize logic from
      `features/studioState/persistence.ts` as the persist storage engine — the
      on-disk schema (`schemaVersion:1`, `savedAt`, normalizers, migrations) is
      byte-identical.
- [x] 4.3 Replace the `StudioShell` authoring `useState` + `saveStudioAuthoringState`
      effect with store selectors (value-or-updater setters; call sites unchanged).

## 5. Persisted runStore
- [x] 5.1 Add `src/stores/runStore.ts` — Zustand `persist` store owning the run/save
      correlation bridge (`runInGameSnapshot`, `lastRunInGameSource`,
      `lastSaveDeployConfig`, request-id keys) reusing the existing `RUN_IN_GAME_LAST_*`
      / `MAP_CONFIG_SAVE_LAST_REQUEST_KEY` strings + serializers verbatim.
- [x] 5.2 Replace the corresponding `StudioShell` `useState` + manual
      `localStorage.setItem` writes with store actions; the active request ids drive
      the status `useQuery`s.

## 6. Verify
- [x] 6.1 `bun run check` (tsc clean) + `tsc --noEmit` for `packages/studio-server`.
- [x] 6.2 `bun run build` (vite + worker-bundle check) + `bun run test` (all green).
- [x] 6.3 Dev-server runtime: saved-configs/catalog + status polls over `/rpc` via
      TanStack Query; cadence + terminal stop correct; localStorage round-trips the
      same authoring + run payloads across reload; no console errors; screenshot.
- [x] 6.4 `bun run openspec -- validate mapgen-studio-data-model --strict`.
