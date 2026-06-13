# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S3.1 `event-hub`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/event-hub` stacked on `main`
- Started: 2026-06-13
- Status: implementation verified; Graphite closure pending

## Objective

- Target movement: add the production event category, EventHub, watch
  procedure, and client subscription/re-adoption hook.
- Non-goals: operation event publishing, live-game watcher, poll/watchdog
  deletion, alternate transports.
- Done condition: subscribe receives hello, disconnect cleans up, client
  hello/reconnect re-adopts from `operations.current`, S3.0 proof fixture is
  promoted/deleted, and existing polling remains for S3.2.

## Authority

- Root/subtree `AGENTS.md`: exact staging, Graphite process, no dirty closure.
- Product refs: `docs/projects/studio-runtime-simplification/PLAN.md` WS-3 S3.1.
- Spike refs: `openspec/changes/mapgen-studio-stream-spike/workstream/findings.md`.
- Upstream refs: S1.1 one `/rpc` surface; S2.1 `operations.current`.
- Excluded/stale inputs: stale `streamedOptions` wording, S3.0 proof-only
  fixture as production code, operation-push deletion work before S3.2.

## Current State

- Repo/Graphite state: active `codex/event-hub` over `main` at
  `7a6906bf09f188c1449ce35675b047d946a0e92d`.
- Dirty files and owner: S3.1 implementation and OpenSpec records owned by
  this branch.
- Current code evidence: production `studio.events.watch` exists on the one
  `/rpc` surface; EventHub is daemon-owned and injected through
  `StudioServerContext`; client subscription uses `experimental_liveOptions`.
- Generated outputs affected: ignored package artifacts regenerated locally for
  gates (`packages/studio-server/dist`, `mods/mod-swooper-maps/dist`) and not
  staged.
- Tests/guards affected: package handler/event tests and app event hook tests.

## Scope

- Write set: `openspec/changes/mapgen-studio-event-hub/**`,
  `packages/studio-server/src/**`, focused package tests,
  `apps/mapgen-studio/src/lib/orpc.ts`, focused app event/adoption hook code
  and tests, context construction under `apps/mapgen-studio/src/server/**`.
- Protected files: generated outputs, operation poll deletion, live-game poll
  deletion, unrelated localStorage owners.
- Owners: package owns event contract/watch semantics; daemon/app context owns
  one concrete EventHub instance for future publishers.
- Forbidden owners: browser localStorage event recovery, alternate SSE route,
  Zod for new event contracts.
- Consumer impact: internal Studio app only.
- Downstream assumptions: S3.2 publishes operation events; S3.3 publishes
  live-game events; S4.1 cleans remaining runtime invariants.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-event-hub/`.
- Tasks: `tasks.md`.
- Validation status: `bun run openspec -- validate mapgen-studio-event-hub --strict`
  passed.

## Review

- Review lanes: S3.1 watcher lane `019ec0b9-a018-7c40-b9eb-cca19a890555`.
- Blocking findings: none.
- Accepted findings repaired: `S3.1-W1` retry plugin default/inert reconnect
  finding repaired by scoped event-watch retry context.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

- Active agents: none.
- Completed agents: watcher `019ec0b9-a018-7c40-b9eb-cca19a890555`.
- Assigned write sets: watcher is read-only.
- Latest evidence by agent: `NOTE-TO-DRA.md` and
  `workstream/dra-watcher-corrections.md`.
- Open findings by agent: none after `S3.1-W1` accepted-repaired disposition.
- Running/stale status: complete.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: frame, server EventHub, TypeBox event union,
  `studio.events.watch`, daemon context/runtime injection, client retry/live
  subscription, reusable operation adoption, S3.0 proof fixture deletion,
  watcher disposition, verification, downstream realignment.
- Remaining tasks: Graphite submit/merge/drain and final task closeout.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run openspec -- validate mapgen-studio-event-hub --strict`
  - `git diff --check`
  - `bun run --cwd packages/studio-server test -- test/handler.test.ts`
  - `bun run --cwd packages/studio-server check`
  - `bun run --cwd apps/mapgen-studio test -- test/studioEvents/operationAdoption.test.ts`
  - `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts`
  - `bun x turbo run check --filter=@civ7/studio-server`
  - `bun run --cwd apps/mapgen-studio check`
- Supporting generation for gates:
  - `bun run --cwd packages/studio-server build` produced JS but DTS hung;
    declaration output was restored with
    `bunx tsc -p packages/studio-server/tsconfig.json --noEmit false --declaration --emitDeclarationOnly --outDir packages/studio-server/dist --rootDir packages/studio-server/src`.
  - `bun run --cwd mods/mod-swooper-maps build:studio-recipes` restored
    ignored recipe declaration artifacts required by app typecheck.
- Results: all S3.1 gates listed above passed.
- Gate disposition: green.
- Evidence boundary: no live browser/Civ7 proof needed for S3.1; stream
  delivery and cleanup are covered at package handler level, and existing
  S3.0 Vite proxy stream guard remains on `main`.

## Realignment

- Downstream docs/specs/issues updated: S3.1 design/phase record clarifies
  S3.2 owns operation publishers and poll deletion; S3.3 owns live-game
  publishing and live-game poll deletion.
- Tests/guards updated: production package watch test replaces
  `packages/studio-server/test/streamSpike.test.ts`, which is deleted.
- Deferrals/triage updated: watchdog and operation status polls deliberately
  remain active until S3.2/S3.3.
- Downstream realignment ledger: S3.0 proof fixture disposition recorded here;
  S3.2 should publish operation events through the injected daemon EventHub and
  then delete operation polls; S3.3 should publish live-game events through the
  same EventHub and then delete live polling/watchdog residue.

## Next Action

- Exact next step: stage exact S3.1 paths, commit with Graphite, submit, merge,
  drain, then close final task 4.6.
- Stop condition: do not delete operation polls/watchdog in S3.1; that belongs
  to S3.2/S3.3.
