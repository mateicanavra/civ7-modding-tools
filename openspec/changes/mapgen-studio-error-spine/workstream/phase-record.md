# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S1.2 `error-spine`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/error-spine` stacked on `main`
- Started: 2026-06-13
- Status: open

## Objective

- Target movement: replace ad-hoc engine exception mapping with a sealed,
  exhaustive typed failure spine.
- Non-goals: S2.1 operation recovery, localStorage bridge deletion, UI rewrite,
  or transport remounting.
- Done condition: no known Studio engine failure path maps to an anonymous
  fallback 500, and Run in Game + Save&Deploy status misses both echo daemon
  identity.

## Authority

- Root `AGENTS.md` and workflow docs.
- Runtime simplification plan S1.2.
- S1.1 `runtime-one-mount` and S1.1a `dev-watch-deploy-isolation` merged
  context.
- Studio server contract error definitions and current app engine adapter.

## Current State

- Repo/Graphite state: fresh clean clone at `origin/main` merge commit
  `e4419c42`, branch `codex/error-spine`, Graphite parent `main`.
- Dirty files and owner: S1.2 OpenSpec scaffold only.
- Current code evidence: `createStudioServerContext` has a partial
  status-code mapper with fallback 500; Save&Deploy status 404 lacks the daemon
  identity echo that Run in Game status 404 carries.
- Protected files: S1.1a branch/worktree, original dirty `main` checkout,
  generated outputs.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-error-spine/`.
- Tasks: `tasks.md`.
- Validation status: strict OpenSpec validation passed.

## Review

- Review lanes: watcher active.
- Blocking findings: none for implementation start; P2 closure blockers are
  accepted below.
- Accepted/repaired findings: WATCH-1 and WATCH-2 accepted, not repaired yet.
- Rejected/invalidated/waived/deferred findings: none yet.

## Agent Fleet State

- Active agents: none.
- Completed agents: watcher lane `019ebf9c-c221-7fc2-b34a-a844f496b7c8`.
- Assigned write sets: watcher has no implementation write set.
- Open findings by agent: WATCH-1 OpenSpec semantic conflict with the older
  `mapgen-studio-server-orpc` no-echo Save&Deploy 404 scenario; WATCH-2 stale
  package contract/context residues encoding the same asymmetry.
- Running/stale status: watcher closed.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: OpenSpec scaffold, strict validation, and watcher kickoff.
- Remaining tasks: repair accepted watcher findings, implementation, gates,
  live-proof disposition, Graphite closure.
- Stop conditions triggered: none.

## Verification

- Commands run: `bun run openspec -- validate mapgen-studio-error-spine --strict`.
- Results: passed.
- Skipped gates and rationale: none.
- Evidence boundary: planning scaffold only.

## Next Action

- Exact next step: wait for watcher framing pass, then implement the sealed
  failure union.
- First files to inspect: `apps/mapgen-studio/src/server/studio/context.ts`,
  `apps/mapgen-studio/src/server/studio/engines.ts`,
  `packages/studio-server/src/contract/errors.ts`, and adjacent engine tests.
- Stop condition: contract changes imply a client-visible compatibility break
  not covered by the runtime simplification plan.
