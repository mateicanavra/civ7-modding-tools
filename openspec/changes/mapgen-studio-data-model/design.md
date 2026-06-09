# Design — mapgen-studio-data-model

## Context

The client-data slice provisioned `orpc` (TanStack Query utils) and a `QueryClient`
but left every read imperative. This slice realises the query model for the read
surface, fixes a contract type hole, and lands the two persisted Zustand stores that
were deferred. All three touch parity-critical surfaces (localStorage schema,
run-in-game security boundary, status-poll cadence), so the guiding rule is: MOVE /
translate logic, never rewrite it.

## Decisions

### D1 — Which reads migrate to `useQuery`, which stay imperative

| Read | Decision | Why |
| --- | --- | --- |
| `civ7.savedConfigs` | → `useQuery` | Pure read; retry + focus-refetch already covered by query defaults. Clean fit. |
| `civ7.setupCatalog` | → `useQuery` | Same. |
| run-in-game status poll | → `useQuery` (refetchInterval) | Keyed on active request id; adaptive cadence + terminal stop map onto `refetchInterval`/`enabled`. |
| save-deploy status poll | → `useQuery` (refetchInterval) | Same shape as run-in-game. |
| `civ7.setupConfig` (inlined in poll) | **stays imperative** | It runs inside the live poll tick and feeds `buildLiveRuntimeSuggestionRecords`; lifting it would break the per-tick coupling. Task permits this ("if helpful" — it is not). |
| live `status`/`snapshot` poll | **stays imperative (verbatim)** | Hard core: request-key staleness gate + adaptive backoff + abort plumbing do not map onto `useQuery`. §7 do-not-break. |

### D2 — Status poll start→poll handoff

The run-in-game/save-deploy operation state is BOTH set imperatively (on start/save)
and refreshed by a poll. To keep that without drift:

- The **active request id** lives in `runStore` (persisted). It is the `useQuery`
  input/key and the `enabled` gate (`skipToken` when absent).
- On start/save the mutation seeds the cache with the immediate response
  (`queryClient.setQueryData(orpc.runInGame.status.queryKey({ input }), seed)`) and
  sets the request id in `runStore`, so the UI shows the seeded operation instantly
  and the poll continues from it.
- `refetchInterval` returns `false` once the operation reaches a terminal phase
  (run-in-game: `isRunInGameTerminalPhase`) / non-running status (save-deploy),
  reproducing the existing `useEffect` early-return.
- The 404 / transport-failure branches in `fetchRunInGameStatus` /
  `fetchMapConfigSaveDeployStatus` already return `{ ok:false, statusCode }`; the
  `queryFn` translates those into the SAME synthetic `uncertain` /
  `operation-status-missing` operation the imperative `refreshRunInGameStatus`
  produced, so the do-not-break failure mapping is preserved.

If this handoff proves to introduce any cadence/terminal/404 drift in practice, the
fallback (Stop Condition) is to leave that specific poll imperative and document it —
parity wins over purity.

### D3 — Persisted stores reuse the reference persistence as the storage engine

The localStorage schema is the reference impl (§6: "copy it, don't fix it"). Rather
than reimplement (de)serialization inside the store, the `persist` middleware is
configured with a custom `storage` adapter that delegates to the EXISTING
`parseStudioAuthoringState` / `saveStudioAuthoringState`-equivalent serializers and
the EXACT `STUDIO_AUTHORING_STATE_KEY`. This guarantees byte-identical on-disk output
(`schemaVersion:1`, `savedAt`, normalizers, migrations) — the round-trip is the same
code path that exists today, only its trigger moves from a `useEffect` to the store's
own persist hook.

`runStore` similarly reuses `RUN_IN_GAME_LAST_*` / `MAP_CONFIG_SAVE_LAST_REQUEST_KEY`
and the snapshot/source serializers from `features/runInGame/*`.

### D4 — Contract `selectedConfig.id` optional

`parseRunInGameSetupRequest` (server) already tolerates an absent `id` (disposable
runs). The contract over-constrained it to required, forcing the caller to launder
the request through `as unknown as Parameters<…>`. Making `id` optional aligns the
contract with the validator and the engine, and lets the cast be dropped — restoring
end-to-end input type safety on the `assertNoRawControlFields`-protected path. The
engine reads `selectedConfig?.id` defensively, so no engine change is required.

## Risks / Mitigations

- **Status poll drift** — mitigated by seeding + `refetchInterval` mirroring the
  exact cadence and terminal predicates; covered by the AppFooter render tests and a
  manual runtime check. Stop Condition fallback if drift appears.
- **localStorage schema regression** — mitigated by reusing the existing serializers
  verbatim as the persist engine; covered by `test/studioState/persistence.test.ts`
  (unchanged) + a manual reload round-trip.
- **Query-result mirroring into Zustand** — explicitly forbidden; the stores hold
  only request ids + browser-authored state, never server payloads.

## Out of scope

- Live status/snapshot poll migration (stays imperative).
- Bun-server topology / production `/api` parity (later supervised slice).
- Any localStorage schema/key change.
