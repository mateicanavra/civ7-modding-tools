# Phase Record

## Phase

- Project: MapGen Studio recipe DAG visualization
- Phase: `mapgen-recipe-dag-visualization`
- Owner: main Codex agent
- Branch/Graphite stack: detached `main` worktree, first Graphite slice pending
- Started: 2026-06-10
- Status: implementation in progress

## Objective

- Target movement: add a read-only selected-recipe artifact dependency DAG
  served by oRPC + Effect and rendered as a full-screen Studio tab.
- Non-goals: editable graph mutation, runtime trace overlays, generated-output
  hand edits, Civ7 runtime/control changes.
- Done condition: graph DTO, service, view, tests, validation, review
  disposition, downstream realignment, and clean Graphite closure.

## Authority

- Root/subtree `AGENTS.md`: root, `packages/mapgen-core/AGENTS.md`,
  `packages/mapgen-core/src/AGENTS.md`, `mods/mod-swooper-maps/AGENTS.md`,
  `mods/mod-swooper-maps/src/AGENTS.md`, `packages/civ7-control-orpc/AGENTS.md`.
- Product refs: direct user request for selected recipe DAG and full-screen
  Studio tab.
- Architecture refs:
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`,
  `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`,
  `docs/system/libs/mapgen/reference/PLAN-COMPILATION.md`,
  `docs/system/libs/mapgen/reference/RECIPE-SCHEMA.md`.
- Project refs: `openspec/config.yaml`,
  `openspec/specs/change-management/spec.md`,
  `openspec/specs/mapgen-normalization-workstreams/spec.md`.
- Excluded/stale inputs: generated `dist/`/`mod/` files; unmerged Studio
  redesign stack files not present on trunk.

## Current State

- Repo/Graphite state: new detached worktree at `main` `4feff5c63`; Graphite
  stack visible; slice branch pending first commit.
- Dirty files and owner: OpenSpec files in this change are owned by this phase.
- Current code evidence: MapGen authoring contracts expose stage/step artifact
  declarations; Studio has recipe catalog and Vite server middleware; control
  oRPC package demonstrates `effect-orpc` patterns.
- Generated outputs affected: none yet.
- Tests/guards affected: MapGen core authoring tests, Swooper recipe artifact
  guards, Studio tests/build, OpenSpec validation.

## Scope

- Write set: see `proposal.md`.
- Protected files: generated outputs, original checkout dirty files, Civ7
  runtime/control packages unless explicitly required for imports.
- Owners: MapGen authoring core, Swooper recipe source, Studio server, Studio
  presentation.
- Forbidden owners: generated outputs, direct-control runtime, adapter.
- Consumer impact: read-only author insight into selected recipe pipeline.
- Downstream assumptions: future editable graph work can reuse identity model
  but is not implemented here.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-recipe-dag-visualization/proposal.md`
- Tasks: `openspec/changes/mapgen-recipe-dag-visualization/tasks.md`
- Validation status: pending; local worktree dependency setup currently lacks
  `openspec` executable.

## Review

- Review lanes: architecture, API, frontend, adversarial.
- Blocking findings: none recorded yet.
- Accepted findings repaired: none.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

- Active agents: Turing, Dewey, Raman.
- Completed agents: Turing, Dewey, Raman.
- Assigned write sets: read-only evidence gathering.
- Latest evidence by agent:
  - Turing: derive DAG from authored `stages` arrays and explicit artifact
    contracts; no persisted DAG exists.
  - Dewey: use `effect-orpc` patterns from `@civ7/control-orpc`; trunk Studio
    uses direct oRPC/fetch calls, not TanStack Query.
  - Raman: full-screen tab belongs in `apps/mapgen-studio`; no app-local graph
    library is installed, so deterministic SVG/HTML is the lowest-boundary
    implementation.
- Open findings by agent: none blocking.
- Running/stale status: no active evidence agents.
- Integration owner: main Codex agent.

## Implementation

- Completed tasks: 1.1 OpenSpec proposal/design/workstream records.
- Remaining tasks: all source implementation and verification tasks.
- Stop conditions triggered: worktree dependency setup gap recorded, not yet a
  source-design blocker.

## Verification

- Commands run:
  - `git status --short --branch`
  - `git worktree list`
  - `gt log --no-interactive`
  - `git rev-parse main`
  - `git rev-parse origin/main`
  - `bun run openspec -- list` in the new worktree, failed because executable
    was unavailable.
- Results: worktree is isolated at trunk; original checkout dirty state is
  protected; OpenSpec executable setup must be restored before validation.
- Skipped gates and rationale: no code gates yet because implementation has not
  started.
- Evidence boundary: current evidence is code/doc inspection and does not prove
  runtime behavior.

## Realignment

- Downstream docs/specs/issues updated: pending after implementation facts.
- Tests/guards updated: pending.
- Deferrals/triage updated: none.
- Downstream realignment ledger: to be added before closure if assumptions
  changed.

## Next Action

- Exact next step: implement MapGen authoring DAG DTO/extractor.
- First files to inspect:
  - `packages/mapgen-core/src/authoring/index.ts`
  - `packages/mapgen-core/src/authoring/types.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Stop condition: extractor cannot access explicit artifact contracts without
  violating package/import boundaries.
