# D6 Prework Ledger - Operations Current

Status: draft
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed D0-D5 are accepted in the packet train.
- Read the existing `mapgen-studio-operations-current` change and identified it as stale S2.1 implementation closure, not D6 frame-standard packet authority.
- Traced current `operations.current` code references in package router/contract, app server engines/context, Studio shell, `apps/mapgen-studio/src/app/operationAdoption.ts`, event hook, run store, and tests.
- Reframed D6 around D4 `StudioOperationRuntime.current` instead of app-local engine enumeration.
- Classified browser recovery deletion separately from unrelated localStorage owners.

## Implementation-Shaping Prework Completed

### Runtime Projection Contract

| Projection surface | Owner | D6 requirement |
| --- | --- | --- |
| `StudioOperationRuntime.current` | `@civ7/studio-server` Effect service | returns daemon identity, observed timestamp, active operations, retained terminal operations, and TTL-pruned truth |
| `studio.operations.current` route | package router leaf | resolves runtime service and projects TypeBox DTOs; owns no registry or recovery logic |
| `apps/mapgen-studio/src/app/operationAdoption.ts` | Studio app adoption helper | shell boot adoption from daemon truth; no request-id replay |
| `apps/mapgen-studio/src/app/StudioShell.tsx` | Studio app shell | calls boot adoption and wires display state |
| `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` | D8/D9 event/push owner | protected from D6 edits except explicit deletion-target notes; hello-current read remains D8/D9-owned residual behavior |
| status polling | existing app active-operation loop | remains only for active operations until D8/D9 deletion |

### Browser Recovery Deletion Corpus

| Deleted recovery surface | Disposition |
| --- | --- |
| `runInGameRequestId` | no production localStorage read/write for recovery |
| `runInGameSnapshot` persisted recovery | no production localStorage read/write for recovery |
| `lastRunInGameSource` persisted recovery | no cross-reload operation recovery; session UI aid only when in memory |
| `setRunInGameSnapshot` / `setLastRunInGameSource` setters | in-memory session UI/proof state only; no storage adapter, `persist`, or localStorage path |
| `parseRunInGameClientSnapshot` / `parseRunInGameSourceSnapshot` | pure relation/proof helpers only; no storage read/write path |
| `saveDeployRequestId` | no production localStorage read/write for recovery |
| `sourceSnapshotStorage.ts` | deleted when it exists as recovery storage; no replacement recovery module |
| map-config save request-id key exports | deleted from production; residual hits are historical OpenSpec/test evidence only |

### Protected LocalStorage Owners

| Owner | Key / file evidence | Protection rule |
| --- | --- |
| authoring state | key `mapgen-studio.authoring-state.v1`; `apps/mapgen-studio/src/features/studioState/persistence.ts`; `test/studioState/persistence.test.ts` | no D6 write; test remains green |
| view state | `apps/mapgen-studio/src/stores/viewStore.ts` | no D6 write |
| theme preference | key `theme-preference`; `apps/mapgen-studio/src/ui/hooks/useTheme.ts` | untouched-file scan |
| presets | key `mapgen-studio.scratchConfigs`; `apps/mapgen-studio/src/features/presets/storage.ts`; `test/presets/presetStore.test.ts` | no D6 write; test remains green |
| layout / non-operation UI state | classified by storage-owner scan | untouched |

### Negative Search Set

```bash
rg -n "setRunInGameRequestId|setSaveDeployRequestId|runInGameRequestId|saveDeployRequestId|runInGameSnapshot|lastRunInGameSource|setRunInGameSnapshot|setLastRunInGameSource|parseRunInGameClientSnapshot|parseRunInGameSourceSnapshot|RUN_IN_GAME_LAST|MAP_CONFIG_SAVE_LAST_REQUEST|sourceSnapshotStorage|readStoredRunInGameSourceSnapshot|localStorage recovery bridge|request-id bridge" apps/mapgen-studio packages/studio-server -g "*.{ts,tsx}"
rg -n "localStorage|sessionStorage|persist\\(|createJSONStorage|getItem\\(|setItem\\(" apps/mapgen-studio/src/app apps/mapgen-studio/src/stores apps/mapgen-studio/src/features/runInGame apps/mapgen-studio/src/features/mapConfigSave -g "*.{ts,tsx}"
rg -n "zod|z\\.object|Type\\.Unknown\\(\\)|details\\?: unknown|StudioEngineError|RunInGameHttpError|ORPCError" packages/studio-server/src/contract packages/studio-server/src/router apps/mapgen-studio/src/server -g "*.{ts,tsx}"
rg -n "currentOperations\\(|findActive\\(|createRunInGameOperationStore|createMapConfigSaveDeployOperationStore" apps/mapgen-studio/src/server packages/studio-server/src -g "*.{ts,tsx}"
```

Hits are classified as blocker, historical OpenSpec/test evidence, unrelated localStorage owner, pure snapshot/fingerprint relation helper, D6 app adoption, or D8/D9 deletion-targeted active status polling.

## Implementation Prework Required Before Code Edits

1. Confirm selected implementation base contains D4 `StudioOperationRuntime.current` and D5 workflow transitions, not only packet docs.
2. Re-run the browser recovery deletion corpus scan on the selected implementation base.
3. Build fake retained-operation fixtures through the real D4 runtime before changing app adoption.
4. Identify and protect all unrelated localStorage owners before deleting operation recovery code; run authoring, preset, and theme guard checks.
5. Record D8/D9 handoff notes for remaining active-operation status polling.

## Peer-Agent Prework Lanes

- **Runtime projection scout:** verify D4 runtime current ownership and no app registry truth remains.
- **Browser recovery scout:** enumerate all operation recovery storage symbols and classify unrelated localStorage owners.
- **Testing oracle scout:** map current/adoption/deletion invariants to service, app, and negative tests.
- **Black-ice reviewer:** search for request-id replay, browser recovery path, bridge recovery, polling scope creep, and unowned localStorage deletion.

## Resolved Black-Ice Decisions

- A fresh daemon reports no operations; browser storage cannot make missing daemon truth uncertain or active.
- D6 current truth comes from D4 runtime, not app-local engine stores.
- D6 deletes operation recovery localStorage but leaves unrelated localStorage owners untouched.
- Active status polling and event-hook hello adoption remain only as D8/D9 deletion-targeted behavior; D6 does not add a new current polling loop.
- Snapshot/fingerprint helpers are pure relation/proof helpers only, not recovery storage.

## Remaining Human Decisions

None for packet acceptance. Implementation choices are bounded by this packet and selected-base code evidence.
