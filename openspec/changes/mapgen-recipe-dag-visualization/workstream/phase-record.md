# Phase Record

## Phase

- Project: MapGen Studio recipe DAG visualization
- Phase: `mapgen-recipe-dag-visualization`
- Owner: main Codex agent
- Branch/Graphite stack: `codex/mapgen-dag-ui-layout` stacked on
  `codex/mapgen-recipe-dag-visualization`
- Started: 2026-06-10
- Status: follow-on layout/chrome implementation verified; Graphite commit
  pending

## Objective

- Target movement: add a read-only selected-recipe artifact dependency DAG
  served by oRPC + Effect and rendered as a full-screen Studio tab, then refine
  the Studio chrome and dependency layout for dense recipe readability.
- Non-goals: editable graph mutation, runtime trace overlays, generated-output
  hand edits, Civ7 runtime/control changes.
- Done condition: graph DTO, service, view, compact chrome, dependency-ranked
  layout, tests, validation, review disposition, downstream realignment, and
  clean Graphite closure.

## Authority

- Root/subtree `AGENTS.md`: root, `packages/mapgen-core/AGENTS.md`,
  `packages/mapgen-core/src/AGENTS.md`, `mods/mod-swooper-maps/AGENTS.md`,
  `mods/mod-swooper-maps/src/AGENTS.md`, `packages/civ7-control-orpc/AGENTS.md`.
- Product refs: direct user request for selected recipe DAG, full-screen Studio
  tab, minimized transparent chrome, centered stats, clearer step language,
  better lane contrast, and easier dependency scanning without losing smooth
  trackpad panning.
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

- Repo/Graphite state: isolated worktree on
  `codex/mapgen-dag-ui-layout`; Graphite sees it as a follow-on slice above the
  base DAG branch.
- Dirty files and owner: follow-on UI/layout/source test/OpenSpec files are
  owned by this phase until committed.
- Current code evidence: MapGen authoring contracts expose stage/step artifact
  declarations; Studio has recipe catalog and Vite server middleware; control
  oRPC package demonstrates `effect-orpc` patterns.
- Generated outputs affected: none yet.
- Tests/guards affected: Studio recipe DAG tests/check/build, OpenSpec
  validation, browser inspection, diff check.

## Scope

- Write set: see `proposal.md`.
- Protected files: generated outputs, original checkout dirty files, Civ7
  runtime/control packages unless explicitly required for imports.
- Owners: MapGen authoring core, Swooper recipe source, Studio server, Studio
  presentation.
- Forbidden owners: generated outputs, direct-control runtime, adapter.
- Consumer impact: read-only author insight into selected recipe pipeline with
  clearer dependency routes, separated stats, compact chrome, and preserved
  native scroll/pan feel.
- Downstream assumptions: future editable graph work can reuse identity model
  but is not implemented here.

## Spec/Tasks

- Spec/proposal: `openspec/changes/mapgen-recipe-dag-visualization/proposal.md`
- Tasks: `openspec/changes/mapgen-recipe-dag-visualization/tasks.md`
- Validation status: focused layout tests passed; full Studio/OpenSpec
  validation pending after docs and browser inspection.

## Review

- Review lanes: architecture, API, frontend, adversarial.
- Blocking findings: none recorded yet.
- Accepted findings repaired: none.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

- Active agents: none.
- Completed agents: Turing, Dewey, Raman, Pasteur, Curie, Dirac.
- Assigned write sets: read-only evidence gathering.
- Latest evidence by agent:
  - Turing: derive DAG from authored `stages` arrays and explicit artifact
    contracts; no persisted DAG exists.
  - Dewey: use `effect-orpc` patterns from `@civ7/control-orpc`; trunk Studio
    uses direct oRPC/fetch calls, not TanStack Query.
  - Raman: full-screen tab belongs in `apps/mapgen-studio`; no app-local graph
    library is installed, so deterministic SVG/HTML is the lowest-boundary
    implementation.
  - Pasteur: choose a custom dependency-ranked layout now; React Flow remains a
    future editable-canvas candidate but does not solve layout by itself.
  - Curie: compact transparent header, right toolbox, centered stats, clearer
    step copy, and lane color adjustments are the focused UI write set.
  - Dirac: update the existing OpenSpec change and verify with focused Studio,
    OpenSpec, browser, diff, and Graphite gates.
- Open findings by agent: none blocking.
- Running/stale status: no active evidence agents.
- Integration owner: main Codex agent.

## Implementation

- Completed tasks: base DAG implementation is committed on the downstack slice;
  follow-on layout module, chrome refactor, centered stats, focused tests,
  Studio check/build, OpenSpec validation, browser inspection, global OpenSpec
  validation, and diff check are complete.
- Remaining tasks: Graphite commit and clean closure.
- Stop conditions triggered: none for this follow-on slice.

## Verification

- Commands run:
  - `bun test apps/mapgen-studio/test/recipeDag/layout.test.ts apps/mapgen-studio/test/recipeDag/RecipeDagView.test.tsx`
  - `bun test apps/mapgen-studio/test/recipeDag/layout.test.ts apps/mapgen-studio/test/recipeDag/RecipeDagView.test.tsx apps/mapgen-studio/test/recipeDag/orpc.test.ts`
  - `bun run --cwd apps/mapgen-studio check`
  - `bun run --cwd apps/mapgen-studio build`
  - `bun run openspec -- validate mapgen-recipe-dag-visualization --strict`
  - `bun run openspec -- validate --changes --strict`
  - `git diff --check`
  - Chrome/Playwright browser inspection against `http://127.0.0.1:5173/`
- Results: focused DAG tests passed; Studio typecheck passed; Studio production
  build passed with the existing Vite chunk-size warning; worker bundle check
  passed; the OpenSpec change and all active OpenSpec changes validate; diff
  check passed; browser inspection confirmed a 40px header reserve, visible
  right toolbox, centered stats, dependency-rank labels, phase lanes, clearer
  step text, and native horizontal/vertical scroll offsets.
- Skipped gates and rationale: full product runtime proof is not required for a
  read-only Studio layout slice.
- Evidence boundary: browser proof covers local dev render/scroll behavior, not
  a pushed PR or in-game runtime.

## Realignment

- Downstream docs/specs/issues updated: OpenSpec design/spec/task/workstream
  records updated for the layout/readability slice.
- Tests/guards updated: focused `RecipeDagView` assertions updated and
  `recipeDag/layout.test.ts` added for the dependency-ranked layout module.
- Deferrals/triage updated: none.
- Downstream realignment ledger: to be added before closure if assumptions
  changed.

## Next Action

- Exact next step: commit `codex/mapgen-dag-ui-layout`.
- First files to inspect if a gate fails:
  - `apps/mapgen-studio/src/features/recipeDag/layout.ts`
  - `apps/mapgen-studio/src/features/recipeDag/RecipeDagView.tsx`
  - `apps/mapgen-studio/src/ui/components/AppHeader.tsx`
- Stop condition: final validation exposes a contract change beyond visual
  layout/readability.
