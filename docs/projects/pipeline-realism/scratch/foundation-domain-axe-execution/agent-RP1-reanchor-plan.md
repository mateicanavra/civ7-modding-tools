# Agent RP1 — Re-Anchor Plan (Integration and Beyond)

## Charter
- Produce a revised orchestrator execution plan from current committed state through integration checkpoint `IG-1` and remaining slices.
- Remove implementer ambiguity: explicit dependencies, gates, ownership, and risk controls.

## Startup Attestation
```yaml
agent: RP1
worktree: $WORKTREES_ROOT/wt-<integration-worktree>
branch_expected: codex/prr-m4-s06d-foundation-scratch-audit-ledger
absolute_paths_only: true
docs_read_required:
  - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - docs/system/mods/swooper-maps/architecture.md
  - docs/system/libs/mapgen/architecture.md
inputs_required:
  - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
```

## Required output schema
```yaml
reanchor_plan_output:
  - current_state_snapshot
  - ig1_entry_criteria
  - ig1_actions_and_exit_criteria
  - post_ig1_slice_sequence
  - ownership_map
  - gate_matrix
  - risk_register
  - immediate_next_3_actions_for_orchestrator
```

## Plan log (append-only)
- Pending.
- 2026-02-15: Logged RP1 re-anchor plan covering current-state, IG-1 requirements, dependency/gate matrices, ownership, risks, and orchestrator next steps anchored to the mandated architecture docs.

## Docs-first attestation
```yaml
timestamp: 2026-02-15T14:30:00Z
docs:
  - path: docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
    status: reviewed
    notes:
      - domain modeling is explicit about ops/strategies/rules/steps and the truth vs projection lane split.
      - effects/artifacts are step-owned; canonicalization belongs to compile-normalize hooks.
  - path: docs/system/mods/swooper-maps/architecture.md
    status: reviewed
    notes:
      - the mod runtime relies on explicit recipe/step selection, with no headless adapter and FireTuner driven iteration.
      - legacy sections describe entry scripts that still depend on engine adapters and serve as historical context.
  - path: docs/system/libs/mapgen/architecture.md
    status: reviewed_reference
    notes:
      - document routes us to canonical mapgen architecture references (DOMAINS, explanation docs) for deeper domain modeling context.
```

## Current state snapshot
- S02/S03/S05/S06 (and follow-ups S06a–S06e) are committed and integrated on the current stack tip.
- Ecology is already integrated; IG-1 is complete; downstream execution should be forward-only (lane split + config/preset/docs parity).

## IG-1 entry criteria
- S02 commit 9b65ae462 and S03 commit 8a596087a (agent_A_core_spine) must remain present and verified.
- S05 commit 5b066753a and S06 commit 6cee8de01 (agent_D_testing_guardrails) ensure guardrail/test scaffolding is published.
- The ecology merge proof, guarding artifacts, and GI-1 verification logs are logged in `docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md`.
- Gate G0 (build/lint/check) and G2 (no-op-calls-op, no-shim, topology) are green; full-domain guardrails are treated as required (no “expected debt” posture for the next leg).
- Pre-IG1 PR threshold check and re-anchor verification are recorded via concrete commands (no repo-local scripts): `gt log | rg "PR #" | wc -l`, `gt sync --no-restack`, `gt log short`.

## IG-1 actions and exit criteria
- Actions: capture IG-1 evidence (stack snapshot + verification command logs) in the checkpoint packet and ledger.
- Exit: ecology merge + re-anchor are recorded as `pass` and GI-1 verification commands are recorded as `pass`; downstream execution proceeds without reopening the integration gate.

## Post-IG1 slice sequence
- S07 (codex/prr-m4-s07-lane-split-map-artifacts-rewire) is the next major execution slice: hard-cut `artifact:foundation.*` → `artifact:map.*` with complete consumer rewires (no dual publish).
- S08 (codex/prr-m4-s08-config-redesign-preset-retune) and S09 (codex/prr-m4-s09-docs-comments-schema-legacy-purge) run in sequence after S07, with G4 and G5 gating per the milestone map.

## Dependency map
```yaml
dependency_map:
  IG-1:
    prereqs:
      - branches_committed: [codex/prr-m4-s02-contract-freeze-dead-knobs, codex/prr-m4-s03-tectonics-op-decomposition, codex/prr-m4-s05-ci-strict-core-gates, codex/prr-m4-s06-test-rewrite-architecture-scans]
      - ecology_guardrail_debt_resolved: true
      - checkpoint_packet: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md
  S04:
    branch: codex/prr-m4-s04-stage-split-compile-cutover
    requires:
      - IG-1.pass
      - lane_compile_surface_redesign_per_M4-D-033/M4-D-034
  S07:
    branch: codex/prr-m4-s07-lane-split-map-artifacts-rewire
    requires:
      - S04.complete
      - G3.pass
  S08:
    branch: codex/prr-m4-s08-config-redesign-preset-retune
    requires:
      - S07.complete
      - G4.pass
  S09:
    branch: codex/prr-m4-s09-docs-comments-schema-legacy-purge
    requires:
      - S08.complete
      - G5.pass
```

## Gate matrix
```yaml
gate_matrix:
  G0:
    focus: build/lint/check baselines (per stack ledger verification snapshot)
    status: pass
    owner: pipeline-realism orchestrator
  G1:
    focus: full-domain guardrails (core + ecology)
    status: blocked_by_external_ecology_guardrail_debt
    mitigation: finish ecology merge, capture guardrail tests, and document corrections in the checkpoint packet
  G2:
    focus: no-op-calls-op, no-dual paths, no-shims, topology lock
    status: pass
    owner: agent_D_testing_guardrails
  G3:
    focus: lane split + map artifact wiring
    status: pending_post_S04
  G4:
    focus: config redesign + preset retune + docs parity
    status: pending_post_S07
  G5:
    focus: docs/comments/schema legacy purge
    status: pending_post_S08
```

## Ownership sequencing
- Slice S02 → agent_A_core_spine → completed, ledger commit 9b65ae462 (contract freeze).
- Slice S03 → agent_A_core_spine → completed, ledger commit 8a596087a (tectonics decomposition).
- S05/S06 → agent_D_testing_guardrails → committed guardrail/test rewrite scaffolding.
- Stage topology + compile surface lock → landed (enforced by `test:architecture-cutover`).
- S07 → agent_C_lane_downstream → gated on G3 after map artifact lane split.
- S08/S09 → agent_E_viz_tracing + agent_F_docs_config → goose-swept after S07 with G4/G5.
- Orchestrator thread RP1 ensures gating, dependency map alignment, and decision log coverage before handing off to successor thread.

## Risk register
- Lane split is still the highest-risk “hard cut” remaining; control: treat `LOCAL-TBD-PR-M4-004` as the single source of truth and require a no-dual-publish verification suite before merging S07.
- Config/preset/docs parity can drift if executed piecemeal; control: keep structural changes (S07) separate from tuning/docs parity (S08/S09) and enforce `build:studio-recipes` + `test:architecture-cutover` on every slice.

## Immediate next 3 orchestrator actions
1. Ensure the PR-comments audit is dispositioned and any `fix_now` items are either landed or split into dedicated slices.
2. Re-anchor M4 milestone + local issue docs to the current stack reality (no stale IG-1/S04 language; explicit forward gates).
3. Start S07 planning: inventory all `artifact:foundation.*` consumers and define the no-dual-publish cutover verification suite.

## Proposed target
- Canonical RP1 re-anchor execution plan that guides IG-1 entry, S04+ downstream slices, ownership handoff, and risk controls with no unresolved implementer decisions.

## Changes landed
- Recorded the RP1 re-anchor plan, refreshed the plan log, and anchored the work to the mandated architecture docs and decision log (M4-D-032 through M4-D-044).

## Open risks
- Post-IG1 lane split and config/docs slices inherit risk if guardrail scans or reanchor actions slip; mitigated by structural scans (G3) and orchestrator enforcement of the gate matrix.

## Decision asks
- none (all architecture & gating choices captured in `docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md`).
