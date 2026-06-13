# Phase Record

## Phase

- Project: Studio runtime simplification
- Phase: S1.2 `error-spine`
- Owner: Codex DRA implementation lane
- Branch/Graphite stack: `codex/error-spine` stacked on `main`
- Started: 2026-06-13
- Status: closed; merged via Graphite PR #1680

## Objective

- Target movement: replace ad-hoc engine exception mapping with a sealed,
  exhaustive typed failure spine.
- Non-goals: S2.1 operation recovery, localStorage bridge deletion, UI rewrite,
  or transport remounting.
- Done condition: no known Studio engine failure path maps to an anonymous 500,
  and Run in Game + Save&Deploy status misses both echo daemon
  identity.

## Authority

- Root `AGENTS.md` and workflow docs.
- Runtime simplification plan S1.2.
- S1.1 `runtime-one-mount` and S1.1a `dev-watch-deploy-isolation` merged
  context.
- Studio server contract error definitions and current app engine adapter.

## Current State

- Repo/Graphite state: started from `origin/main` merge commit `e4419c42`;
  merged through PR #1680 at `ec1a88250`.
- Dirty files and owner: none at S1.2 merge.
- Initial code evidence: `createStudioServerContext` mapped only a subset of
  engine failures to declared oRPC errors; Save&Deploy status 404 lacked the
  daemon identity echo that Run in Game status 404 carries.
- Current code evidence: `StudioEngineError` owns the typed engine failure
  bridge, `createStudioServerContext` maps the sealed failure-kind union through
  namespace-specific oRPC codes, raw `Civ7DirectControlError` becomes namespace
  unavailable, and Save&Deploy status 404 echoes `serverInstanceId` /
  `serverStartedAt` with structured details.
- Protected files: S1.1a branch/worktree, original dirty `main` checkout,
  generated outputs.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-studio-error-spine/`.
- Tasks: `tasks.md`.
- Validation status: strict OpenSpec validation passed.

## Review

- Review lanes: watcher lanes complete.
- Blocking findings: none known after final closure watcher recheck.
- Accepted/repaired findings: WATCH-1, WATCH-2, WATCH-3, USER-1, and USER-2 are
  repaired.
- Rejected/invalidated/waived/deferred findings: none yet.

## Agent Fleet State

- Active agents: none.
- Completed agents: watcher lane `019ebf9c-c221-7fc2-b34a-a844f496b7c8`;
  closure watcher `019ebfbb-8bdd-7d50-a9d4-4504fdbd84e4`.
- Assigned write sets: watcher has no implementation write set.
- Open findings by agent: none.
- Running/stale status: watcher lanes complete.
- Integration owner: Codex DRA implementation lane.

## Implementation

- Completed tasks: OpenSpec scaffold, watcher kickoff, sealed failure union,
  Studio-owned engine error bridge, exhaustive namespace mapping, Save&Deploy
  404 identity echo, recovery-action preservation, TypeBox/Standard Schema
  error data, downstream spec/contract realignment, and focused gates.
- Remaining tasks: none.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run openspec -- validate mapgen-studio-error-spine --strict`
  - `bun run openspec:validate`
  - `bun x turbo run check --filter=mapgen-studio`
  - `bun run --cwd apps/mapgen-studio test -- test/mapConfigSave/operationState.test.ts test/mapConfigSave/status.test.ts test/server/engineErrorSpine.test.ts test/runInGame/operationState.test.ts test/server/oneMount.test.ts`
  - `bun x turbo run check test --filter=@civ7/studio-server`
  - `bun x turbo run check test --filter=@civ7/control-orpc --filter=@civ7/direct-control`
  - closure watcher focused residue scan: no matches for status-identity
    residue, retired bridge symbol, shortcut terms, or blocking ledger rows
- Results: all passed.
- Live-proof disposition: S1.2 changes error classification, contract typing,
  and status-miss payloads. It does not alter successful Play or Save&Deploy
  operation execution, daemon watch mounts, or deploy graph isolation; S1.1a's
  one-mount/dev-watch proof remains the live execution guard. The S1.2 proof is
  package/app tests over start/status failure behavior, identity echo, and the
  sealed failure mapper.
- Evidence boundary: local gates prove the new error spine and contract
  behavior; they do not claim a fresh in-game successful deploy smoke for this
  slice.

## Closure

- Graphite: PR #1680 merged; branch drained from the active program path.
- Handoff: S2.1 `operations-current` starts from merged `origin/main`.
