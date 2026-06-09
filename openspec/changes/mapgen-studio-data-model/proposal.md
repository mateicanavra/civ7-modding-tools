## Why

The prior slice (`mapgen-studio-client-data`) stood up the TanStack Query client
(`src/lib/query.ts`) and the oRPC-native query utils (`orpc` in `src/lib/orpc.ts`),
but the query layer is **provisioned and unused** — every server read in
`StudioShell` is still an imperative `orpcClient.<ns>.<proc>(...)` call wired into a
hand-rolled `useEffect` load/poll loop. The data model from
`architecture/10-target-architecture.md` §2–§3 is therefore only half-realised.

This change completes it on three fronts:

1. **Realise the oRPC-native query model.** Migrate the read surface to
   `orpc.<ns>.<proc>.queryOptions()` into `useQuery`: saved configs, the setup
   catalog, and the run-in-game + save-deploy status polling. The live-runtime
   status/snapshot poll legitimately STAYS imperative (its request-key staleness +
   adaptive backoff do not map onto `useQuery`); the inlined `setupConfig` read
   stays inside that poll loop because it feeds the same per-tick suggestion
   pipeline. Query results are never mirrored into Zustand.

2. **Close the highest-stakes type hole.** The contract
   `packages/studio-server/src/contract/runInGame.ts` declares `selectedConfig.id`
   as `z.string()` REQUIRED, but the caller and engine treat it as optional
   (disposable runs send `selectedConfig` without an `id`). The mismatch is masked
   by an `as unknown as Parameters<…>` cast in `src/features/runInGame/api.ts` that
   discards input type safety on the `assertNoRawControlFields`-protected path. Make
   `id` optional to match `parseRunInGameSetupRequest`, then drop the cast.

3. **Land the persisted `authoringStore` + `runStore`.** Move the authoring and run
   state out of `StudioShell` `useState` + manual persistence effects into Zustand
   `persist` stores (architecture/10 §3, deferred from the client-data slice). The
   existing localStorage persistence is the reference impl (hard-core parity, §6):
   it is ported VERBATIM into `persist` — same keys, same serializers, same schema.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/FRAME.md` (§4.7 everything talks oRPC;
  live-runtime poll staleness/backoff + localStorage schema are hard core)
- `docs/projects/mapgen-studio-redesign/architecture/10-target-architecture.md`
  (§2 client data layer, §3 stores + crisp rule, §6 persistence reference impl,
  §7 do-not-break registry)
- `packages/studio-server/src/contract/runInGame.ts` (the type hole)
- `apps/mapgen-studio/src/features/studioState/persistence.ts` (the reference impl)

## What Changes

- **Reads → TanStack Query.** Add an `orpc`-derived `useQuery` for
  `civ7.savedConfigs` and `civ7.setupCatalog`, replacing the hand-rolled load/retry/
  focus-refetch effect; derive the existing `{ status, directory, configurations,
  updatedAt, error }` / `{ status, catalog, updatedAt, error }` view shapes from the
  query state so `setupControlOptions` and every downstream consumer is unchanged.
  The retry-on-failure + refetch-on-focus behaviour is reproduced by the query
  client defaults already provided.
- **Status polling → TanStack Query.** The run-in-game and save-deploy status polls
  become `useQuery`s keyed on the active request id (sourced from `runStore`), with
  an adaptive `refetchInterval` reproducing the existing `document.hidden ? 3000 :
  1000` cadence and STOPPING at terminal phase / non-running status. The imperative
  start/save mutations keep their existing transport but seed the query cache
  (`queryClient.setQueryData`) and write `runStore` so the poll picks up without a
  round-trip. The 404 → synthetic-`uncertain` and `operation-status-missing`
  failure mapping is preserved verbatim.
- **Contract fix.** `runInGame.ts` `selectedConfig.id` becomes `z.string().optional()`;
  the `as unknown as Parameters<typeof orpcClient.runInGame.start>[0]` cast in
  `features/runInGame/api.ts` is removed, restoring full input type checking on the
  `assertNoRawControlFields`-protected start path.
- **`authoringStore` (persist).** New Zustand `persist` store owning
  `worldSettings`, `recipeSettings`, `setupConfig`, `pipelineConfig`,
  `overridesDisabled`, `repoBackedPresetOverridesByRecipe`. It uses the EXACT
  `STUDIO_AUTHORING_STATE_KEY` and the existing parse/serialize functions from
  `features/studioState/persistence.ts` as its storage engine, so the on-disk schema
  (`schemaVersion:1`, `savedAt`, normalizers, migrations) is byte-identical. The
  `StudioShell` `useState` + `saveStudioAuthoringState` effect are replaced by store
  selectors.
- **`runStore` (persist).** New Zustand `persist` store owning the run/save request
  correlation bridge (`runInGameSnapshot`, `lastRunInGameSource`,
  `lastSaveDeployConfig`, and the localStorage request-id keys), reusing the existing
  `RUN_IN_GAME_LAST_*` / `MAP_CONFIG_SAVE_LAST_REQUEST_KEY` strings and serializers
  verbatim. `StudioShell` reads the active request ids from the store to drive the
  status `useQuery`s.

## Requires

- `mapgen-studio-client-data` (the prior slice — the `orpc` query utils, the
  `QueryClient`, and the `viewStore` come from there; this stacks on it via the
  `design/craft-a11y` tip)

## Affected Owners

- `packages/studio-server/src/contract/runInGame.ts` (`selectedConfig.id` optional)
- `apps/mapgen-studio/src/features/runInGame/api.ts` (drop the cast)
- `apps/mapgen-studio/src/stores/authoringStore.ts` (new)
- `apps/mapgen-studio/src/stores/runStore.ts` (new)
- `apps/mapgen-studio/src/app/StudioShell.tsx` (reads → useQuery; state → stores)
- `apps/mapgen-studio/src/app/hooks/*` (new query hooks if extracted)

## Forbidden Owners

- No change to the localStorage persistence SCHEMA, keys, serializers, or migrations
  (the reference impl is copied, not fixed; §6).
- No migration of the live-runtime status/snapshot poll to `useQuery` (its
  request-key staleness + adaptive backoff are hard core; it stays imperative).
- No mirroring of TanStack Query results into Zustand (the crisp rule, §3).
- No removal of the legacy `/api/*` middleware; no new FireTuner reads.
- No `mods/**` changes.

## Stop Conditions

- The run-in-game / save-deploy status `useQuery` cannot reproduce the start→poll
  handoff (seed + cadence + terminal stop + 404 mapping) without behavior drift — in
  that case leave that poll imperative and note it.
- The persisted stores cannot reproduce the exact localStorage schema/keys/round-trip.
- Any non-uniform status code or error-`data` field is lost across the boundary.

## Consumer Impact

The studio behaves identically: same persisted localStorage payloads, same status
poll cadence and 404 restart detection, same run-in-game security boundary. The
read surface now flows through oRPC-native TanStack Query, and authoring/run state
has single persisted Zustand owners. The `runInGame.start` input is now fully type
checked (no `as unknown` cast).

## Verification Gates

- `bun run check` in `apps/mapgen-studio` (tsc clean) and `tsc --noEmit` for
  `packages/studio-server` (the contract changed).
- `bun run build` + `bun run test` in `apps/mapgen-studio` (all green).
- Runtime: dev server; saved-configs/catalog load over `/rpc` via TanStack Query;
  run-in-game and save-deploy status poll over `/rpc` at the right cadence and stop
  at terminal phase; localStorage round-trips the same authoring + run payloads
  across reload; no console errors; screenshot renders the studio.
- `bun run openspec -- validate mapgen-studio-data-model --strict`.
