# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S2.1 `operations-current`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/operations-current` stacked on `main`
- Started: 2026-06-13
- Status: closed; merged and drained through Graphite

## Objective

- Target movement: move operation recovery ownership from browser localStorage
  request-id replay to daemon-owned `studio.operations.current`.
- Non-goals: operation durability across daemon restarts; SSE/EventHub or push;
  deletion of unrelated localStorage owners; successful operation execution
  changes.
- Done condition: boot adoption reads daemon truth; operation recovery
  localStorage bridge is deleted; fresh daemon/TTL/status-miss/current behavior
  is pinned.

## Authority

- Root/subtree `AGENTS.md`: root repo router and Graphite process docs.
- Product refs: `docs/projects/studio-runtime-simplification/PLAN.md` WS-2 S2.1.
- Architecture refs: S1.1 one `/rpc` surface; S1.2 typed status-miss identity
  errors; app runtime owns presentation, daemon engines own ephemeral truth.
- Project refs: `openspec/changes/mapgen-studio-runtime-one-mount/`,
  `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/`,
  `openspec/changes/mapgen-studio-error-spine/`.
- Excluded/stale inputs: stale habitat branch; original dirty checkout;
  legacy localStorage parity comments before S2.1.

## Current State

- Repo/Graphite state: `codex/operations-current` merged via PR #1682 into
  `main` at `5c9b356a9cddcd1476610825bc285bfb8d0eedd1`, then pruned from the
  local Graphite stack.
- Dirty files and owner: none for S2.1 after merge/drain.
- Current code evidence: daemon stores expose pruned newest-first `list()`;
  `StudioEngines.currentOperations()` returns daemon identity plus active/recent
  Run in Game and Save&Deploy operations; the unified oRPC contract exposes
  `studio.operations.current` using TypeBox/Standard Schema; client boot adopts
  daemon current truth instead of replaying persisted request ids.
- Generated outputs affected: workspace builds produced ignored `dist/` and
  mod map outputs only; no generated artifacts are in the dirty set.
- Tests/guards affected: operation store tests, handler/one-mount tests,
  client state/store tests, StudioShell boot adoption coverage if available.

## Scope

- Write set: `openspec/changes/mapgen-studio-operations-current/**`,
  `packages/studio-server/src/contract/**`,
  `packages/studio-server/src/{context,router,index}.ts`,
  `apps/mapgen-studio/src/server/**/operationState.ts`,
  `apps/mapgen-studio/src/server/studio/{engines,context}.ts`,
  `apps/mapgen-studio/src/stores/runStore.ts`,
  `apps/mapgen-studio/src/app/StudioShell.tsx`,
  focused tests under `apps/mapgen-studio/test/**` and
  `packages/studio-server/test/**`.
- Protected files: generated outputs, unrelated localStorage state owners,
  WS-3 event/push surfaces beyond explicit deletion-target comments.
- Owners: Studio daemon engines/registries for ephemeral truth; Studio app for
  rendering/adopting daemon truth.
- Forbidden owners: browser localStorage as operation recovery source; generated
  artifacts; new durability database/file ledger.
- Consumer impact: internal Studio app only; public SDK/CLI/mod behavior unchanged.
- Downstream assumptions: S3.1/S3.2 can subscribe/re-adopt from
  `operations.current`; watchdog remains until S3.2.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-operations-current/`.
- Tasks: `tasks.md`.
- Validation status: strict OpenSpec validation passed.

## Review

- Review lanes: S2.1 read-only watcher `019ebfd0-fde2-7f51-99de-7f540c3eff2a`.
- Blocking findings: none known yet.
- Accepted findings repaired: none.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

- Active agents: none.
- Completed agents: watcher `019ebfd0-fde2-7f51-99de-7f540c3eff2a`.
- Assigned write sets: watcher is read-only.
- Latest evidence by agent: watcher returned `DONT_NOTIFY`; write set matched
  expected S2.1 surfaces and no pre-implementation P1/P2 violation was found.
- Open findings by agent: none.
- Running/stale status: watcher complete.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: S2.1 OpenSpec scaffold; daemon current enumeration and
  `studio.operations.current`; TypeBox/Standard Schema current output; client
  boot adoption; operation recovery localStorage bridge deletion; focused tests
  and stale-bridge scan.
- Remaining tasks: none for S2.1; continue WS-3.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run openspec -- validate mapgen-studio-operations-current --strict`
  - `bun x turbo run check --filter=@civ7/studio-server`
  - `bun x turbo run build --filter=@civ7/studio-server`
  - `bun run --cwd packages/studio-server test -- test/handler.test.ts`
  - `bun run --cwd apps/mapgen-studio test -- test/runInGame/operationState.test.ts test/mapConfigSave/operationState.test.ts`
  - `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts`
  - `bun run --cwd apps/mapgen-studio test -- test/runInGame/clientState.test.ts`
  - `bun x turbo run build --filter=@swooper/mapgen-core`
  - `bun x turbo run build --filter=@civ7/plugin-mods --filter=mod-swooper-maps`
  - stale bridge scan: `rg -n "setRunInGameRequestId|setSaveDeployRequestId|runInGameRequestId|saveDeployRequestId|RUN_IN_GAME_LAST|MAP_CONFIG_SAVE_LAST_REQUEST|sourceSnapshotStorage|readStoredRunInGameSourceSnapshot|fan-out|localStorage recovery bridge|request-id bridge|for now|best-effort|zod" ...`
- Results: OpenSpec strict validation passed; studio-server check/build passed;
  studio-server handler tests passed; app operation store tests passed; app
  one-mount current procedure test passed after building workspace exports; app
  run-in-game client-state relation tests passed.
- Gate disposition: `bun run --cwd apps/mapgen-studio check` first failed on
  missing built workspace package exports
  (`mod-swooper-maps/*`, `@civ7/plugin-mods`). After building those workspace
  dependencies, the check remained active for a long run without S2.1
  diagnostics and was stopped to avoid leaving a hanging process. Treat focused
  app tests plus package `tsc` as the slice evidence boundary.
- Evidence boundary: no live Civ7 operation execution in S2.1; this slice
  changes boot recovery ownership, not Play/Save&Deploy execution paths.

## Realignment

- Downstream docs/specs/issues updated: S2.1 OpenSpec proposal/design/spec/tasks
  and this phase record.
- Tests/guards updated: operation store list/TTL tests, studio-server handler
  current assertion, one-mount current assertion, client-state relation test
  rerun.
- Deferrals/triage updated: status polling and daemon watchdog deliberately
  remain with deletion targets in WS-3 S3.2/S3.3.
- Downstream realignment ledger: stale bridge scan leaves only intended
  OpenSpec/plan references, polling variable names, and unrelated existing
  localStorage owners.

## Next Action

- Exact next step: open WS-3 S3.0 `stream-spike`.
- First files to inspect if revisiting: `packages/studio-server/src/contract/studio.ts`,
  `packages/studio-server/src/router/index.ts`, `apps/mapgen-studio/src/server/studio/engines.ts`,
  `apps/mapgen-studio/src/app/StudioShell.tsx`, `apps/mapgen-studio/src/stores/runStore.ts`.
- Stop condition: any requested operation durability across daemon restarts or
  event-push semantics belongs to WS-3/S4, not S2.1.
