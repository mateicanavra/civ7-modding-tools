# Downstream Realignment Ledger

## Phase

- Project: resource distribution recovery
- Phase: planning and diagnosis
- Owner: Codex workstream owner
- Census run: 2026-05-31

## Pre/Post Census

- Affected project specs/reviews: engine-refactor normalization packet,
  OpenSpec resource distribution slices to be created
- Affected issue/milestone artifacts: none identified yet
- Affected canonical docs: none in planning slice
- Affected tests/guards/scripts: world-balance stats, placement tests,
  OpenSpec validation
- Affected generated-output assumptions: generated mod output must be
  regenerated only after implementation slices
- Affected phase records / Next Packets:
  `openspec/changes/resource-distribution-planning/workstream/phase-record.md`

## Disposition

| Item | Impact | Disposition | Patch/No-Patch Evidence | Owner | Trigger |
|---|---|---|---|---|---|
| World-balance stats | Need per-resource planned/placed/rejected counts | deferred | downstream `resource-distribution-stats-gates` slice | Workstream owner | root-cause findings integrated |
| Resource stage architecture | Need dedicated resource stage or proven blocker | deferred | downstream `resource-stage-architecture` slice | Workstream owner | direct user correction |
| Resource corpus | Need 55-resource facts and age overrides in repo-owned form | deferred | downstream `resource-corpus-contract` slice | Workstream owner | corpus accepted |
| Runtime restart/log proof | Needed after local stats pass | deferred | downstream `resource-distribution-runtime-proof` slice | Workstream owner | deployable implementation |
| Lotus visibility | Must not be counted as resource proof | no patch needed in planning | proposal records lotus as feature | Workstream owner | verification matrix |

## Required Closure Statement

- Downstream assumptions that changed: resource correctness requires
  per-resource diversity and eligibility evidence, not aggregate placement
  counts; resources may deserve a dedicated stage.
- Artifacts patched: planning OpenSpec change and phase record.
- No-patch rationale: no production code changes belong in planning slice.
- Blocked/deferred items: all behavior fixes deferred to named downstream
  slices.
- Exact next downstream action: open the root-cause diagnostic and resource
  stage architecture slices.
