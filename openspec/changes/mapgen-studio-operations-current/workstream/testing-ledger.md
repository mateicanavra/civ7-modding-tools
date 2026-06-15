# D6 Testing Ledger - Operations Current

Status: draft
Date: 2026-06-14

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Runtime service | real D4 `StudioOperationRuntime` with fake retained operations | active, retained terminal, expired-known tombstone, physically pruned or never-known id, daemon-identity mismatch, disposed, and fresh-daemon states project correctly |
| Router/contract | package handler tests | `studio.operations.current` resolves runtime service and returns TypeBox-valid public DTOs |
| TTL/status agreement | runtime + status route tests | lifecycle matrix below has exact D3 tag/data/status and current daemon identity |
| Browser boot adoption | app shell/hook tests | boot reads current once and seeds display from daemon truth without request-id replay |
| Recovery bridge deletion | storage tests and negative searches | operation recovery keys/modules have no production read/write path |
| Protected storage owners | targeted store tests | authoring/view/theme/preset/non-operation UI localStorage behavior remains unchanged |
| D8/D9 handoff | scan and docs assertion | remaining active status polling is explicitly deletion-targeted and no current polling loop is added |
| Schema/error | contract tests | Standard Schema adapter exposes recoverable TypeBox `TSchema` origin; canonical operation DTOs are reused; static types are no broader than runtime validation; no new Zod/current raw error/status-code bridge appears |

## TTL / Status Matrix

| Lifecycle state | `operations.current` expectation | Direct status expectation |
| --- | --- | --- |
| Active operation | present in `active`; absent from terminal-only `recent` | active/in-progress public projection with current daemon identity |
| Retained terminal operation | absent from `active`; present in terminal-only `recent` | same terminal public projection with current daemon identity |
| Expired-known tombstone | omitted from `active` and `recent` | D3 `OperationExpired` data with current daemon identity |
| Physically pruned id | omitted from `active` and `recent` | D3 typed not-found data with current daemon identity |
| Never-known id | omitted from `active` and `recent` | D3 typed not-found data with current daemon identity |
| Daemon identity mismatch | scoped to current daemon only | D3 `DaemonIdentityMismatch` data with current daemon identity |

## Packet Acceptance Commands

```bash
bun install --frozen-lockfile
bun run build
bun run check
git status --short --branch
gt status
gt log --no-interactive
bun run openspec -- validate mapgen-studio-operations-current --strict
bun run openspec:validate
git diff --check
```

## Future Implementation Commands

```bash
bun run --cwd packages/studio-server test
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server build
bun run --cwd apps/mapgen-studio test -- test/server/operationsCurrent.test.ts test/studioEvents/operationAdoption.test.ts test/runInGame/clientState.test.ts test/studioState/persistence.test.ts test/presets/presetStore.test.ts
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio build
```

Implementation negative-search gates:

```bash
rg -n "setRunInGameRequestId|setSaveDeployRequestId|runInGameRequestId|saveDeployRequestId|runInGameSnapshot|lastRunInGameSource|setRunInGameSnapshot|setLastRunInGameSource|parseRunInGameClientSnapshot|parseRunInGameSourceSnapshot|RUN_IN_GAME_LAST|MAP_CONFIG_SAVE_LAST_REQUEST|sourceSnapshotStorage|readStoredRunInGameSourceSnapshot|localStorage recovery bridge|request-id bridge" apps/mapgen-studio packages/studio-server -g "*.{ts,tsx}"
rg -n "localStorage|sessionStorage|persist\\(|createJSONStorage|getItem\\(|setItem\\(" apps/mapgen-studio/src/app apps/mapgen-studio/src/stores apps/mapgen-studio/src/features/runInGame apps/mapgen-studio/src/features/mapConfigSave -g "*.{ts,tsx}"
rg -n "zod|z\\.object|Type\\.Unknown\\(\\)|details\\?: unknown|StudioEngineError|RunInGameHttpError|ORPCError" packages/studio-server/src/contract packages/studio-server/src/router apps/mapgen-studio/src/server -g "*.{ts,tsx}"
rg -n "currentOperations\\(|findActive\\(|createRunInGameOperationStore|createMapConfigSaveDeployOperationStore" apps/mapgen-studio/src/server packages/studio-server/src -g "*.{ts,tsx}"
```

Hits are classified as blocker, historical OpenSpec/test evidence, unrelated localStorage owner, pure snapshot/fingerprint relation helper, D4/D5 composition-only adapter, or D8/D9 deletion-targeted active status polling.

## Protected Storage Owner Gates

- `test/studioState/persistence.test.ts` covers `mapgen-studio.authoring-state.v1`.
- `test/presets/presetStore.test.ts` covers `mapgen-studio.scratchConfigs`.
- `git diff --exit-code -- apps/mapgen-studio/src/ui/hooks/useTheme.ts` proves D6 leaves `theme-preference` ownership untouched.
- Stale run/save operation recovery keys injected into browser storage during boot tests trigger exactly one `studio.operations.current` call and zero status replay calls.
