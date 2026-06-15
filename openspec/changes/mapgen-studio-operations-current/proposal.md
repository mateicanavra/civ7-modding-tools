# MapGen Studio Operations Current

## Why

D4 makes operation lifecycle daemon-owned. D5 moves Play, Save/Deploy, and Autoplay mutation pipelines into package-owned Effect workflows. D6 makes that runtime truth the only boot-recovery and current-operation read model exposed to the Studio app.

The browser must not rediscover operation state by replaying persisted request ids, source snapshots, or localStorage recovery keys into status endpoints. `studio.operations.current` is the read projection over daemon-owned operation truth: active operations, retained terminal operations, daemon identity, and expiry behavior. A fresh daemon truthfully reports no operations.

## Authority

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`
- `openspec/changes/mapgen-studio-contract-typebox-spine/`
- `openspec/changes/mapgen-studio-error-spine/`
- `openspec/changes/mapgen-studio-engine-runtime-services/`
- `openspec/changes/mapgen-studio-pipeline-effect-services/`
- Current evidence:
  - `packages/studio-server/src/contract/studio.ts`
  - `packages/studio-server/src/router/index.ts`
  - `apps/mapgen-studio/src/server/studio/engines.ts`
  - `apps/mapgen-studio/src/server/studio/context.ts`
  - `apps/mapgen-studio/src/app/StudioShell.tsx`
  - `apps/mapgen-studio/src/app/operationAdoption.ts`
  - `apps/mapgen-studio/src/stores/runStore.ts`
  - `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`

## What Changes

- Repair the existing `mapgen-studio-operations-current` change into D6 frame-standard shape.
- Specify `studio.operations.current` as an Effect-managed read projection over D4 `StudioOperationRuntime`, not app-local operation-store enumeration.
- Specify shell boot adoption as a client read of daemon current truth, followed by existing active-operation status polling and D8/D9-owned event-hook hello adoption until D8/D9 event/push packets replace those residual reads.
- Delete browser-owned operation recovery:
  - Run in Game request-id recovery;
  - Run in Game snapshot recovery;
  - last Run in Game source recovery;
  - Save/Deploy request-id recovery;
  - any production `sourceSnapshotStorage.ts` operation recovery storage module.
- Preserve unrelated localStorage owners: authoring, view, theme, presets, and non-operation UI preferences.
- Preserve snapshot/fingerprint relation helpers as pure proof/UI logic only. They cannot be cross-reload operation recovery channels.
- Require TypeBox/Standard Schema origin for the `operations.current` request/response DTOs.
- Require D3 typed not-found/error data for status misses and D4 daemon identity on current/status agreement.

## Non-Goals

- No durable operation history across daemon restarts.
- No browser localStorage operation recovery bridge.
- No event transport, SSE, EventHub, or push conversion; D8/D9 own that.
- No D10 live-game watcher lifetime migration.
- No mutation workflow orchestration; D5 owns workflow pipelines.
- No app-owned registry, TTL, current projection, request fingerprint, or status miss truth.
- No rewrite of unrelated localStorage owners.

## Future Implementation Write Set

- `packages/studio-server/src/contract/**`
- `packages/studio-server/src/router/**`
- `packages/studio-server/src/services/**`
- `packages/studio-server/src/context.ts`
- `apps/mapgen-studio/src/server/studio/context.ts`
- `apps/mapgen-studio/src/app/StudioShell.tsx`
- `apps/mapgen-studio/src/app/operationAdoption.ts`
- `apps/mapgen-studio/src/stores/runStore.ts`
- `apps/mapgen-studio/src/features/runInGame/**`
- `apps/mapgen-studio/src/features/mapConfigSave/**`
- `apps/mapgen-studio/test/**`
- `packages/studio-server/test/**`

Protected paths:

- Generated outputs and built bundles.
- `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts` and D8/D9 event/push implementation surfaces, except explicit deletion-target notes that identify existing active status polling handoff.
- Unrelated localStorage state owners: authoring, view, theme, preset, layout, and non-operation UI state.
- D5 workflow internals except current projection consumption.

## Verification Gates

### Packet Acceptance Gates

- `bun install --frozen-lockfile`
- Current packet-authoring base: `bun run build` and `bun run check`
- `git status --short --branch`
- `gt status`
- `gt log --no-interactive`
- `bun run openspec -- validate mapgen-studio-operations-current --strict`
- `bun run openspec:validate`
- `git diff --check`
- Operation-current, browser recovery deletion, TypeBox/schema, testing/parity, hardening/prework, and black-ice reviews have no unresolved P1/P2 findings.

### Future Implementation Closure Gates

- Package/app gates:
  - `bun run --cwd packages/studio-server test`
  - `bun run --cwd packages/studio-server check`
  - `bun run --cwd packages/studio-server build`
  - `bun run --cwd apps/mapgen-studio test -- test/server/operationsCurrent.test.ts test/studioEvents/operationAdoption.test.ts test/runInGame/clientState.test.ts test/studioState/persistence.test.ts test/presets/presetStore.test.ts`
  - `bun run --cwd apps/mapgen-studio check`
  - `bun run --cwd apps/mapgen-studio build`
- `studio.operations.current` returns D4 daemon identity, observed timestamp, active operation projections, terminal-only retained recent projections, and expiry-consistent empty truth after pruning.
- Fresh daemon reports no operations and no browser recovery path is attempted.
- Current/status tests cover active, retained terminal, expired-known tombstone, physically pruned or never-known id, and daemon-identity-mismatched id states. Expired-known ids return D3 `OperationExpired` with current daemon identity until D4 physically prunes them; physically pruned or never-known ids return D3 typed not-found with current daemon identity.
- Shell boot adoption reads daemon current and does not replay localStorage operation request ids into status calls; the existing D8/D9-owned event-hook hello read remains classified as protected residual behavior.
- Protected storage owners remain green: authoring state key `mapgen-studio.authoring-state.v1`, preset key `mapgen-studio.scratchConfigs`, theme key `theme-preference`, and non-operation UI storage owners.
- Negative searches:
  - no `runInGameRequestId`, `saveDeployRequestId`, `runInGameSnapshot`, `lastRunInGameSource`, `setRunInGameSnapshot`, `setLastRunInGameSource`, `RUN_IN_GAME_LAST`, `MAP_CONFIG_SAVE_LAST_REQUEST`, `sourceSnapshotStorage`, `readStoredRunInGameSourceSnapshot`, or operation recovery localStorage bridge remains as production recovery code;
  - any retained `parseRunInGameClientSnapshot` or `parseRunInGameSourceSnapshot` helper is pure relation/proof logic with no storage read/write path;
  - D6 write-set files have no unclassified operation-recovery `localStorage`, `sessionStorage`, `persist(`, `createJSONStorage`, `getItem(`, or `setItem(` usage;
  - no browser code constructs operation current from request-id replay;
  - no app server code owns D4 registry/current/TTL truth;
  - no new Zod schema is introduced for `operations.current`;
  - no public DTO exposes app-store private state or `details?: unknown` as operation truth.
