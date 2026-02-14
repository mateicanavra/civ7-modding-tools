# Agent T — Ecology Merge Timing Review

## Ownership
- Decide whether ecology stack should be merged into the M4 execution stack now or integrated later.

## Plan
1. Inspect current stack topology and branch divergence.
2. Measure likely file overlap/conflict surfaces between ecology stack and planned M4 execution surfaces.
3. Recommend merge timing with clear rationale and risk controls.

## Working Notes
- pending

## Proposed target
- Provide a decision-ready recommendation: merge-now vs parallel-then-merge-later.

## Changes landed
- Scratchpad initialized.

## Open risks
- none yet

## Decision asks
- none

## Stack observations
- The Graphite stack graph shows the ecology chain from `codex/prr-epp-s0-plan-bootstrap` up through `codex/prr-epp-s5-placement-randomness-zero`, with every upstream slice (drift observability, deterministic physics, lakes, resources, placement) already in review-ready PRs; `gt log` puts `s5` at the tip, so merging now absorbs the full deterministic ecology surface into the M4 base.

## Conflict overlap
- Comparing `main` against `codex/prr-epp-s2-ecology-physics-cutover` and against `codex/agent-ORCH-foundation-domain-axe-execution` surfaces shows only two overlapping files (`mods/mod-swooper-maps/test/ecology/earthlike-balance-smoke.test.ts` and `mods/mod-swooper-maps/test/support/standard-config.ts`), meaning ecology changes currently touch ecology/recipe/test domains while the foundation branch is focused on foundation/morphology/recipe/guardrail docs and ops (per the M4 milestone and stack ledger). The test overlap is low risk and constrained to `mods/mod-swooper-maps` smoke fixtures, so direct code conflict is limited.
- The planned M4 slices (foundation boundaries, lane split, guardrail rewrites, config/docs cleanup) still live in parallel directories; merging now lets the foundation docs reference deterministic ecology behavior before the lane cutover finishes, rather than letting them drift.

## Recommendation
- Merge the ecology stack into the Foundation M4 execution branch now.
- Rationale: low file-level conflict, deterministic ecology behavior is already baked through `s5`, and early merge lets the foundation doc/guardrail surfaces (which rely on the new recipe/topology contracts) align with the running code rather than chasing a future rebase. Delaying would only defer inevitable rebase work once the foundation branch hits `LOCAL-TBD-PR-M4-004`/`-M4-005` lock gates and may require reapplying stage topology expectations.

## Risks (severity)
- High: New deterministic ecology behavior might expose regressions once the foundation guardrail suite (lint:domain-refactor-guardrails, CI/test:ci, `mods/mod-swooper-maps` tests) runs on the merged base; mitigation is to run the listed verification commands immediately after rebasing.
- Medium: Foundation documentation and issue packs are still stabilizing; merging now means we must confirm the doc references (topology, lane split, stage names) match the combined code, but these docs are intentionally referencing the same artifacts listed in the milestone and stack ledger so the merge actually clarifies them.
- Low: There’s a small chance `mods/mod-swooper-maps` test fixtures need retuning after the merge; the diff overlap already highlights the two files to inspect.

## Merge triggers (preconditions)
1. `codex/prr-epp-s5-placement-randomness-zero` (tip of the ecology stack) remains green and is marked “Ready to merge as stack” (PR #1260–1262 history shows readiness).
2. Foundation M4 branch has at least the planning docs + guardrail slices in place (per the milestone and stack ledger) so the merged ecology change has a target to latch onto; hitting `LOCAL-TBD-PR-M4-001`/`-M4-005` gating commits satisfies this.
3. The verification suite (`bun run build`, `bun run lint`, `bun run test:ci`, `bun run lint:domain-refactor-guardrails`, plus the `mods/mod-swooper-maps` smoke tests) passes on the rebased foundation branch.

## Playbook
1. `gt checkout codex/prr-epp-s5-placement-randomness-zero` and rebase it onto `codex/agent-ORCH-foundation-domain-axe-execution`. This brings the latest deterministic ecology slice directly into the foundation worktree.
2. Run the mandated verification commands from the M4 milestone (`bun run build`, `bun run lint`, `bun run test:ci`, `bun run lint:domain-refactor-guardrails`, plus the `mods/mod-swooper-maps` smoke tests) to detect any cross-domain regressions.
3. Update the foundation issue/stack docs (e.g., `stack-ledger.md`, `master-scratch.md`, `decision-log.md`) with the merge note so downstream slices know ecology is now part of the base.
4. Submit/push the rebased ecology branch as part of the M4 stack (db53c57b9 already records the docs hardening, so the next commit can record the merge and retarget any remaining guardrail work).

## Evidence
evidence_paths:
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/00-plan.md
  - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md

## Proposed target
- Ecology stack merged into the `codex/agent-ORCH-foundation-domain-axe-execution` base so that M4 guardrails and docs reference the same deterministic ecology/topology contracts.

## Changes landed
- Decision review recorded, low-overlap surface confirmed, and merge playbook drafted within the scratchpad.

## Open risks
- Foundation slices may continue to evolve (e.g., new lane-split rewires) so we must watch for additional stage-level renames after the merge and adjust the documentation.

## Decision asks
- none
