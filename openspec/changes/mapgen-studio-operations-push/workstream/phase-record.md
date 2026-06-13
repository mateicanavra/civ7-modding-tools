# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S3.2 `operations-push`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/operations-push` stacked on `main`
- Started: 2026-06-13
- Status: implementation complete; Graphite closeout pending

## Objective

- Target movement: operation registries publish status transitions through the
  S3.1 EventHub, the client applies operation events, and operation polling
  plus daemon `serverInfo` identity polling are deleted.
- Non-goals: live-game watcher/poll deletion, alternate transports, browser
  localStorage recovery, broad status contract removal without proof.
- Done condition: pushed operation transitions update client state, operation
  polling/watchdog deletion proofs are green, strict OpenSpec validates, and
  Graphite branch closes cleanly.

## Authority

- Root/subtree `AGENTS.md`: exact staging, Graphite process, no dirty closure.
- Product refs: `docs/projects/studio-runtime-simplification/PLAN.md` WS-3
  S3.2.
- Upstream refs: S3.1 EventHub and event watch; S2.1
  `studio.operations.current`.
- Watcher refs: S3.2 watcher `019ec130-bde5-7133-be61-282814556152`.
- Excluded/stale inputs: operation polling as a fallback, `serverInfo`
  watchdog as client identity authority, hidden Save&Deploy status loop.

## Current State

- Repo/Graphite state: `codex/operations-push` is a single Graphite branch on
  `main` at S3.1 closeout.
- Dirty files and owner: S3.2 source/docs/tests only.
- Current code evidence: operation registries publish through the injected
  EventHub; client event hook applies `operation` events; operation polling,
  hidden Save&Deploy status polling, and client `serverInfo` identity polling
  are deleted.
- Generated outputs affected: none expected for source edits; ignored outputs
  may be regenerated only by verification gates.
- Tests/guards affected: operation store tests, event hook/adoption tests,
  handler tests if polling-only status pins are deleted.

## Scope

- Write set: `openspec/changes/mapgen-studio-operations-push/**`,
  `apps/mapgen-studio/src/server/studio/engines.ts`,
  operation stores under `apps/mapgen-studio/src/server/{runInGame,mapConfigs}`,
  `apps/mapgen-studio/src/server/daemon/daemon.ts`, client event/adoption
  hooks/helpers, `StudioShell`, focused app/server tests.
- Protected files: live-game polling owners, generated outputs, unrelated
  localStorage owners, unrelated status contracts.
- Owners: daemon/store owns transition publication; client event hook owns
  pushed operation application; hello/current owns reconnect adoption.
- Forbidden owners: alternate SSE routes, operation-specific second stream,
  Zod for new event contracts, orphaned "for now" fallback polling without a
  closeout target.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-operations-push/`.
- Tasks: `tasks.md`.
- Validation status: `bun run openspec -- validate mapgen-studio-operations-push --strict`
  passed before implementation and after closeout record updates.

## Review

- Review lanes: watcher lane `019ec130-bde5-7133-be61-282814556152`.
- Blocking findings: none after repair.
- Accepted findings repaired: `S3.2-W1` through `S3.2-W6`.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

- Active agents: none after watcher completion.
- Completed agents: watcher `019ec130-bde5-7133-be61-282814556152`.
- Assigned write sets: watcher was read-only.
- Latest evidence by agent: subagent notification findings.
- Open findings by agent: none after accepted-repaired dispositions.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: OpenSpec frame, watcher disposition, operation publisher
  injection, client operation event application, operation poll deletion,
  hidden Save&Deploy status loop deletion, `serverInfo` watchdog deletion,
  focused tests, app/package checks, negative search proofs.
- Remaining tasks: Graphite submit/merge/drain and post-submit cleanup.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run openspec -- validate mapgen-studio-operations-push --strict`
- `bun run --cwd apps/mapgen-studio test -- test/runInGame/operationState.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/mapConfigSave/operationState.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd apps/mapgen-studio test -- test/runInGame/operationState.test.ts test/mapConfigSave/operationState.test.ts test/studioEvents/operationAdoption.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts`
- `bun run --cwd packages/studio-server test -- test/handler.test.ts`
- `bun run --cwd packages/studio-server check`
- `rg "useOperationStatusPolls|useDaemonInstanceWatchdog|fetchMapConfigSaveDeployStatus|operation-status-missing|status-poll" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/test -n`
- `rg "studio\\.serverInfo|serverInfo" apps/mapgen-studio/src -n`
- `git diff --check`
- `bun run openspec -- validate mapgen-studio-operations-push --strict`
- Results: listed tests/checks passed; negative searches returned no matches
  for deleted client poll/watchdog paths.
- Gate disposition: green before Graphite submit.
- Evidence boundary: live Civ7 proof not expected for S3.2 unless package/app
  tests reveal a daemon restart risk; S1.1 one-mount guarantees remain part of
  selected regression gates.

## Realignment

- Downstream docs/specs/issues updated: S3.2 OpenSpec and review ledger.
- Tests/guards updated: store transition callback tests and operation event
  application tests.
- Deferrals/triage updated: S3.3 still owns live-game event publishing and
  live-game poll deletion.
- Downstream realignment ledger: S3.3 still owns live-game event publishing and
  live-game poll deletion; S4.1 owns final runtime invariant cleanup. S3.2
  leaves status procedures available as explicit API/manual diagnostic
  contracts, not as background freshness or identity authority.

## Next Action

- Exact next step: rerun strict OpenSpec validation after record updates, then
  commit/submit through Graphite.
- Stop condition: do not touch live-game polling in S3.2.
