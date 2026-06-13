# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S3.3 `live-game-watch`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/live-game-watch` stacked on `main`
- Started: 2026-06-13
- Status: implementation verified; Graphite closure pending

## Objective

- Target movement: live Civ7 status freshness moves from a browser
  `setTimeout` loop to daemon `live-game` events over the existing EventHub,
  with snapshot reads remaining request/response.
- Non-goals: new event route/transport, operation poll reintroduction,
  localStorage recovery, event-stream snapshot payloads, broad legacy Zod
  migration.
- Done condition: daemon watcher publishes only on live-game key changes,
  client applies pushed state without status polling, strict OpenSpec validates,
  focused package/app gates pass, watcher findings are dispositioned, and
  Graphite closes cleanly.

## Authority

- Root `AGENTS.md`: exact staging, Graphite process, no dirty closure.
- Product refs: `docs/projects/studio-runtime-simplification/PLAN.md` WS-3
  S3.3 and DP-3/DP-4.
- Upstream refs: S3.1 EventHub and event watch; S3.2 operation push and
  identity/poll deletion.
- User refs: "for now" is not a cheap exit; TypeBox is required for this new
  event contract.
- Watcher refs: S3.3 watcher `019ec1b3-1ab3-7910-8466-6c20bae12f4a`.
- Excluded/stale inputs: client live status polling as fallback, new Zod event
  schemas, alternate live-game transport.

## Current State

- Repo/Graphite state: `codex/live-game-watch` at `main`
  `b063f51b061b9247508f0be6f68fe91e2f01f64f`; worktree clean at phase entry.
- Dirty files and owner: S3.3 OpenSpec/code/test/package metadata files owned
  by this slice.
- Current code evidence: package runtime owns the daemon live-game watcher and
  TypeBox event state; app consumes pushed live-game state and no client live
  status polling/backoff symbols remain.
- Generated outputs affected: none expected.
- Tests/guards affected: package event/watcher tests, app live runtime model
  tests, app event adoption tests, focused checks.

## Scope

- Write set: `openspec/changes/mapgen-studio-live-game-watch/**`,
  `packages/studio-server/src/contract/studio.ts`,
  `packages/studio-server/src/liveGame/**`,
  `packages/studio-server/src/handler.ts`,
  `packages/studio-server/src/router/index.ts`,
  `packages/studio-server/src/index.ts`,
  `apps/mapgen-studio/src/server/daemon/daemon.ts`,
  `apps/mapgen-studio/src/app/hooks/useStudioEvents.ts`,
  `apps/mapgen-studio/src/app/StudioShell.tsx`,
  `apps/mapgen-studio/src/features/liveRuntime/model.ts`, focused tests.
- Protected files: generated outputs, unrelated operation state, unrelated
  status contracts, localStorage recovery surfaces, non-daemon package hosts
  unless guarded by explicit watcher enablement.
- Owners: package runtime owns shared-session live status reads; EventHub owns
  publication; client event hook owns event dispatch; `StudioShell` owns
  request/response snapshot/setup follow-up.
- Forbidden owners: browser status cadence, second transport, new Zod event
  schemas, fallback polling without deletion target.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-live-game-watch/`.
- Tasks: `tasks.md`.
- Validation status: `bun run openspec -- validate mapgen-studio-live-game-watch --strict`
  passed before implementation.

## Review

- Review lanes: watcher lane `019ec1b3-1ab3-7910-8466-6c20bae12f4a`.
- Blocking findings: none after repair.
- Accepted findings repaired: `S3.3-W1` through `S3.3-W4`.
- Rejected/invalidated/waived/deferred findings: none yet.

## Agent Fleet State

- Active agents: none after watcher completion.
- Completed agents: watcher `019ec1b3-1ab3-7910-8466-6c20bae12f4a`.
- Assigned write sets: watcher is read-only.
- Latest evidence by agent: watcher reported browser-owned live status/backoff,
  inert live-game client events, setup/suggestion coupling to the old poll, and
  snapshot read coupling to the old poll.
- Open findings by agent: none after accepted-repaired dispositions.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: OpenSpec frame, watcher disposition, package watcher,
  TypeBox live-game event state, client event application, client poll deletion,
  focused tests, app/package checks, negative search proofs.
- Remaining tasks: Graphite closure.
- Stop conditions triggered: none.

## Verification

- Commands run:
- `bun run openspec -- validate mapgen-studio-live-game-watch --strict`
- `bun run openspec:validate`
- `bun run --cwd packages/studio-server check`
- `bun run --cwd packages/studio-server build`
- `bun run --cwd packages/studio-server test -- test/liveGameWatcher.test.ts test/handler.test.ts`
- `bun run --cwd apps/mapgen-studio test -- test/liveRuntime/model.test.ts test/studioEvents/operationAdoption.test.ts`
- `bun run --cwd apps/mapgen-studio check`
- `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts`
- `rg "nextLiveRuntimePollDelayMs|liveStatusFailureCountRef|setTimeout\\(poll|civ7\\.live\\.status\\(\\{\\}|liveControlPort\\.readiness\\.current\\(" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/src packages/studio-server/test -g '*.{ts,tsx}'`
- `git diff --check`
- `bun run openspec -- validate mapgen-studio-live-game-watch --strict`
- Results: listed checks passed; repo-wide OpenSpec validation reported 146
  passed and 0 failed; negative search returned no matches; package build
  regenerated ignored `packages/studio-server/dist` for app subpath type
  availability.
- Gate disposition: green; Graphite closure pending.
- Evidence boundary: live Civ7 click-through is expected only if local runtime
  conditions permit; focused tests and negative searches are required either
  way.

## Realignment

- Downstream docs/specs/issues updated: S3.3 OpenSpec, phase record, and
  review ledger.
- Tests/guards updated: package watcher quiet/loud test; client live-game
  adoption test; live-runtime model poll-delay pin deleted while turn/hash and
  snapshot commit gates remain.
- Deferrals/triage updated: S4.1 still owns final game-door invariant and
  schema-tech closeout.
- Downstream realignment ledger: S4.1 still owns final game-door invariant and
  schema-tech closeout; S3.3 closes only the live-game event publisher/client
  poll deletion boundary.

## Next Action

- Exact next step: exact-stage S3.3 files, commit via Graphite, submit/merge,
  then proceed to S4.1 `game-door-invariant`.
- Stop condition: do not keep or reintroduce browser live status polling as a
  backup path.
