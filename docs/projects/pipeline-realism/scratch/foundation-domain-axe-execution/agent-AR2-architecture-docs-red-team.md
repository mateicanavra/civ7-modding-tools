# Agent AR2 — Architecture + Docs Red-Team Review

## Charter
- Run an independent conformance review across implementation + planning docs.
- Identify spec drift, docs drift, and wording/structure that can reintroduce architecture thrash.

## Startup Attestation
```yaml
agent: AR2
worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
branch_expected: codex/prr-m4-s06d-foundation-scratch-audit-ledger
absolute_paths_only: true
docs_read_required:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
hard_invariants:
  - architecture_over_backward_compatibility
  - no_legacy_bridges_in_final_state
  - no_stage_runtime_merge_defaulting_or_schema_translation
  - step_orchestrates_ops
```

## Scope and hotspots
```yaml
implementation_paths:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/**
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/**
planning_paths:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-001-planning-contract-freeze.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-002-foundation-ops-boundaries.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-004-lane-split-downstream-rewire.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-005-guardrails-test-rewrite.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md
required_output:
  ranked_findings:
    - severity: P0|P1|P2
    - evidence_path
    - doc_or_code_change_required
    - proposed_text_or_structure_fix
```

## Review method
1. Compare implementation posture to spec invariants.
2. Compare milestone/issues to actual landed state and gate sequencing.
3. Flag doc language that permits ambiguous/inverted architecture behavior.
4. Provide concrete text-level updates needed.

## Findings log (append-only)
- Pending.

## Proposed target
- Converged implementation+docs posture with explicit, parseable updates that prevent future ambiguity.

## Findings landed
- Pending.

## Open risks
- Planning docs may lag latest architecture simplifications without a dedicated sync pass.

## Decision asks
- none

## Docs sync updates (2026-02-15 AR2)
- `docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md` now clarifies that the runtime still runs the single `foundation` stage and the 3-stage target IDs remain gated to `S04` (stage-split) and `S07` (lane cut) slices, preventing a premature claim that the split already exists (aligns with ANCHOR-F002).
- `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md` emphasizes that the 3-stage plan is preparatory for `S04`, not yet wired into the recipe, so M4 governance knows which slice will deliver the stage split.
- `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-004-lane-split-downstream-rewire.md` reiterates that the lane split is pending `S07` and downstream wiring remains on `artifact:foundation.*`, aligning F003’s rationale that the hard cut is a future gate and should not be claimed as done now.
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` now exposes the actual Foundation ops catalog (mesh/tectonics/projection), reanchors the history/tectonics artifacts to `compute-tectonic-history-rollups`/`compute-tectonics-current`, mentions the `compute-tectonic-history` stub file that throws for migrations, and no longer lists it as an active export, satisfying both F004 and the F005 rationale trap that the legacy op stays disabled until tests/consumers migrate.

## Cleanup note
- Removed the duplicated milestone summary paragraph and fixed the accidental list-heading formatting in the reference doc so the delta stays clean.
## Docs-first attestation
```yaml
timestamp: 2026-02-15T05:17:23Z
reader: AR2
read_docs:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
notes: docs read in order before any implementation or AR1 analysis.
```
## Findings log (2026-02-15 AR2)
1. [P1] `LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md` still promises a locked 3-stage split (`foundation-substrate-kinematics`, `foundation-tectonics-history`, `foundation-projection`), yet the standard recipe and stage folder listing only expose the original `foundation` stage. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md` (deliverables list) and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages` (folder contents) plus `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/recipe.ts`. Proposed text change: add a call-out in the issue that the 3-stage migration has not yet landed (recipe still exposes `foundation`), or postpone the stage-name checklist until the split is actually implemented so planners do not gate on a non-existent alias. Disposition: Fix now (planners cannot execute a cutover that references stages that do not exist).
2. [P1] `LOCAL-TBD-PR-M4-004-lane-split-downstream-rewire.md` requires moving all map-facing projection outputs to `artifact:map.*`, but the `LandmassPlates` consumer still reads `foundationArtifacts.crustTiles`, `foundationArtifacts.tectonicHistoryTiles`, and `foundationArtifacts.tectonicProvenanceTiles`, and the `projection` step publishes those same foundation artifacts. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-004-lane-split-downstream-rewire.md` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts`. Proposed fix: rewire the consumer to read the future `artifact:map.foundation*` outputs (and/or publish those artifacts in a Gameplay stage) so the hard lane cut described in the deliverables actually exists. Disposition: Fix now (the lane split has not taken place, leaving downstream heritage consumers tied to the legacy lane).
3. [P1] `SPEC-DOMAIN-MODELING-GUIDELINES.md` makes explicitly that tile/map projection artifacts belong under `artifact:map.*` and physics steps must never publish map-facing layers, yet `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts` still publishes all plates/crust/tiles/tectonic rollups as `foundationArtifacts.*`. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md` (see “Projection artifact: Gameplay-owned… under artifact:map.*”) and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`. Proposed fix: migrate the projection outputs into the gameplay lane (publish `artifact:map.foundation*` in a dedicated stage or guard that step) so the physics layer stays truth-only. Disposition: Fix now (current code violates the core boundary enforced by the spec and the milestone).
4. [P1] `LOCAL-TBD-PR-M4-002-foundation-ops-boundaries.md` calls for expunging the legacy `compute-tectonic-history` mega-op, yet morphology tests such as `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts` still import and call `computeTectonicHistory.run` (the op now throws a migration hint). Evidence: doc path and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/morphology/m11-crust-baseline-consumption.test.ts`. Proposed fix: update the test suite (and any other call sites) to run the new decomposed op chain (`computeEraPlateMembership`, `computeSegmentEvents`, etc.) so the guardrail against op-calls-op holds. Disposition: Fix now (the emit-now-to-throw op breaks tests and violates the documented boundary).
5. [P2] `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` still documents `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history`, including `FoundationTectonicHistorySchema`, even though `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/index.ts` no longer exports that op. Evidence: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (lines circa 220-260) and the absence of `compute-tectonic-history` in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/index.ts`. Proposed text change: remove the outdated `compute-tectonic-history` references from the reference doc or mark them as historical and point readers to the new decomposed ops and the `tectonics` step contract. Disposition: Fix now (reference docs must reflect the actual contract surface exposed by the repo).

## Proposed target
- A verified 3-stage Foundation pipeline (`foundation-substrate-kinematics`, `foundation-tectonics-history`, `foundation-projection`) with map-facing projection outputs publishing under `artifact:map.foundation*`, downstream consumers rewired, legacy op imports/tests removed, and documentation aligned to that surface.

## Findings landed
- Stage split requirements still refer to non-existent stages.
- Lane split/lane ownership still bound to `artifact:foundation.*` consumers.
- SPEC-defined projection boundary is violated by the current `projection` step.
- Guardrail tests still import the legacy `computeTectonicHistory` mega-op.
- Domain reference doc lists `compute-tectonic-history` even though it is gone.

## Open risks
- Until the lane cut and stage split are actually implemented, the milestone’s locked posture (no dual paths, no manual projection bridge) cannot be declared complete; downstream work may stretch additional slices and the spec boundary remains open.
- Tests that call `computeTectonicHistory` will continue to fail once the op is hardened unless they are rewritten alongside the lane split.

## Decision asks
- None.
