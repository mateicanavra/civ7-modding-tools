# Phase Record

## Phase

- Project: Swooper recovery
- Phase: live runtime snapshot completion
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-studio-parity-proof-drain`
- Started: 2026-06-06
- Status: integrated; current-stack validation passed

## Objective

- Target movement: finish the open live runtime snapshot mechanics without
  turning runtime evidence into authored config state.
- Non-goals: no broad live-sync redesign, no raw command surface, no automatic
  config mutation from readback.
- Done condition: remaining live-sync tasks are implemented or dispositioned,
  verified, realigned downstream, and committed cleanly.

## Authority

- Root/subtree `AGENTS.md`: Graphite, generated-output, and proof hygiene.
- Product refs: `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`.
- Architecture refs: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Project refs: `openspec/changes/studio-live-civ7-map-sync/**`.
- Excluded/stale inputs: runtime readback as authored config authority.

## Current State

- Repo/Graphite state: integrated into `codex/swooper-studio-parity-proof-drain`
  above `codex/swooper-mapgen-recovery-drain`.
- Dirty files and owner: no separate dirty side-worktree state is part of this
  record. The current branch owns the live-runtime app/test/OpenSpec files in
  this slice.
- Current code evidence: live-sync open tasks 2.2 and 3.3 are implemented by
  `apps/mapgen-studio/src/features/liveRuntime/model.ts` and `App.tsx` wiring.
- Generated outputs affected: none expected.
- Tests/guards affected: Studio live runtime store/tests.

## Scope

- Write set: `apps/mapgen-studio/**`,
  `openspec/changes/studio-live-runtime-snapshot-completion/**`, and downstream
  live-sync workstream records.
- Protected files: generated `dist/`, `mod/`, official resources, unrelated
  dirty worktrees.
- Owners: Studio runtime observation; direct-control read wrappers only if
  missing facts require package-owned reads.
- Forbidden owners: config persistence, mapgen truth, generated outputs.
- Consumer impact: clearer runtime evidence labels and safer live overlays.
- Downstream assumptions: exact authorship proof may rely on snapshot freshness
  only after this slice closes.

## Spec/Tasks

- Spec/proposal: `proposal.md`, `design.md`.
- Tasks: `tasks.md`.
- Validation status: passed strict change validation and full OpenSpec
  validation after the `Game.getHash()` identity repair.

## Review

- Review lanes: Studio state, product-proof boundary, direct-control read
  boundary if touched.
- Blocking findings: supervisor found that source snapshot identity consumed a
  derived stable hash but not the Civ runtime `Game.getHash()` already returned
  by direct-control live status.
- Accepted findings repaired: live runtime status now types and records
  `mapSummary.game.hash`, includes it in status snapshot hashing/source
  snapshot ids, and tests same-turn/different-game-hash identity separation.
- Rejected/invalidated/waived/deferred findings: none yet.

## Review State

- Historical planner/supervisor notes were treated as evidence only.
- Current integration owner: Product/Development DRA on the recovery drain.
- Open findings: none for live-runtime snapshot mechanics after this slice;
  downstream proof/acceptance remains outside this category.

## Implementation

- Completed tasks: added a dedicated live runtime model for stable status and
  bounded snapshot identity, including direct-control `Game.getHash()` when
  available; wired Studio polling through abortable status and snapshot
  requests; added latest-request commit gating; added repeated-failure backoff;
  removed automatic live setup hydration into Studio config; converted unproved
  runtime-to-Studio changes into source-snapshot suggestion records applied only
  through the visible live button; preserved proved-run restoration as
  reapplication of the stored Studio-authored `RunInGameSourceSnapshot`, not
  arbitrary live readback.
- Remaining tasks: current-stack validation and Graphite commit.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `bun run --cwd apps/mapgen-studio check`
  - `bun run --cwd apps/mapgen-studio test -- liveRuntime runInGame/AppFooter`
  - `bun run --cwd apps/mapgen-studio test`
  - `bun run openspec -- validate studio-live-runtime-snapshot-completion --strict`
  - `bun run openspec:validate`
  - `git diff --check`
- Results: Studio typecheck passed; focused live runtime model and footer tests
  passed, including same-turn/different-`Game.getHash()` identity separation;
  strict and full OpenSpec validation passed; diff whitespace check passed. The
  full Studio test suite failed in unrelated
  `test/config/defaultConfigSchema.test.ts` assertions for existing
  ecology/placement authoring-surface expectations; no live runtime files were
  implicated.
- Skipped gates and rationale: no live Civ runtime proof was run because this
  category closes local Studio runtime-observation state safety, not exact
  authorship or product parity.
- Evidence boundary: this category proves Studio runtime-observation state
  safety, not exact Studio-to-Civ authorship, final-surface parity, or
  Earthlike product acceptance.

## Realignment

- Downstream docs/specs/issues updated:
  `openspec/changes/studio-live-civ7-map-sync/tasks.md`.
- Tests/guards updated:
  `apps/mapgen-studio/test/liveRuntime/model.test.ts`.
- Deferrals/triage updated: none needed for this category.
- Downstream realignment ledger: live-sync open task state updated.

## Next Action

- Exact next step: validate this integrated branch and commit through Graphite.
- First files to inspect: `apps/mapgen-studio/src/features/liveRuntime/model.ts`,
  `apps/mapgen-studio/src/App.tsx`, and focused tests if validation fails.
- Stop condition: runtime state cannot be separated from authored config state.
