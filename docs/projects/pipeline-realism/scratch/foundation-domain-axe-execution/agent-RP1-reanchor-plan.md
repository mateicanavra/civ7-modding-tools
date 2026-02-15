# Agent RP1 — Re-Anchor Plan (Integration and Beyond)

## Charter
- Produce a revised orchestrator execution plan from current committed state through integration checkpoint `IG-1` and remaining slices.
- Remove implementer ambiguity: explicit dependencies, gates, ownership, and risk controls.

## Startup Attestation
```yaml
agent: RP1
worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
branch_expected: codex/prr-m4-s06d-foundation-scratch-audit-ledger
absolute_paths_only: true
docs_read_required:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
inputs_required:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
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
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
    status: reviewed
    notes:
      - domain modeling is explicit about ops/strategies/rules/steps and the truth vs projection lane split.
      - effects/artifacts are step-owned; canonicalization belongs to compile-normalize hooks.
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
    status: reviewed
    notes:
      - the mod runtime relies on explicit recipe/step selection, with no headless adapter and FireTuner driven iteration.
      - legacy sections describe entry scripts that still depend on engine adapters and serve as historical context.
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
    status: reviewed_reference
    notes:
      - document routes us to canonical mapgen architecture references (DOMAINS, explanation docs) for deeper domain modeling context.
```

## Current state snapshot
- S02 (codex/prr-m4-s02-contract-freeze-dead-knobs), S03 (codex/prr-m4-s03-tectonics-op-decomposition), S05 (codex/prr-m4-s05-ci-strict-core-gates), and S06 (codex/prr-m4-s06-test-rewrite-architecture-scans) are committed with verification passes recorded in /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md; S04 remains pending IG-1 gating.
- IG-1 entry readiness is flagged as ready except for the G1 full-domain guardrails blocker stemming from external ecology guardrail debt, and ecology_merge_status plus reanchor_status remain pending per /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md.
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md carries the decision register through M4-D-044 with no outstanding decision asks, satisfying the "no unresolved implementer decisions" mandate for this plan.

## IG-1 entry criteria
- S02 commit 9b65ae462 and S03 commit 8a596087a (agent_A_core_spine) must remain present and verified.
- S05 commit 5b066753a and S06 commit 6cee8de01 (agent_D_testing_guardrails) ensure guardrail/test scaffolding is published.
- The ecology merge proof, guarding artifacts, and grade from the ecological owner must be logged into /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md.
- Gate G0 (build/lint/check) and G2 (no-op-calls-op, no-shim, topology) are green; G1 needs the external ecology guardrail debt cleared before entry.
- Pre-IG1 PR threshold check (/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/check-pr-threshold.sh --min 45) and stack reanchor verification (/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/reanchor-stack.sh --verify) must both finish with success messages captured in the checkpoint packet.

## IG-1 actions and exit criteria
- Actions: run /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/verify-ecology-merge.sh, coordinate with ecology guardrail owners to document remediation evidence, refresh the IG-1 checkpoint packet, and capture verification logs (builder, lint, guardrail, structural).
- Exit: ecology_merge_status, reanchor_status, and IG1_entry_readiness fields in /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md flip to pass; verification_matrix entries are recorded as pass; team releases S04 for post-IG1 execution.

## Post-IG1 slice sequence
- S04 (codex/prr-m4-s04-stage-split-compile-cutover) executes immediately after IG-1 gates, re-laying stage topology/compile surfaces and delivering foundation stage restructure.
- S07 (codex/prr-m4-s07-lane-split-map-artifacts-rewire) follows once S04 confirms artifact:map.* lane ownership and G3 is satisfied.
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
- S04 → orchestrator + agent_B_stage_topology coordination → pending IG-1 release.
- S07 → agent_C_lane_downstream → gated on S04 + G3 after map artifact lane split.
- S08/S09 → agent_E_viz_tracing + agent_F_docs_config → goose-swept after S07 with G4/G5.
- Orchestrator thread RP1 ensures gating, dependency map alignment, and decision log coverage before handing off to successor thread.

## Risk register
- External ecology guardrail debt still trips G1 (per /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md); control: run /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/verify-ecology-merge.sh, escalate to ecology owners, and update verification_matrix.
- Ecology merge artifacts or sign-off lag delays IG-1 and S04 start; control: coordinate merge scripts, capture logs in /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md, and postpone S04 until ecology_merge_status=pass.
- Post-IG1 lane split/resync risks persist if guardrail scans or reanchor actions slip after S04; control: require dedicated structural scans (per G3) and reanchor plan checklists before unlocking S07.

## Immediate next 3 orchestrator actions
1. Run /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/verify-ecology-merge.sh to confirm ecology artifacts plus guardrail fixes are merged.
2. Run /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/check-pr-threshold.sh --min 45 to document PR readiness per IG-1 policy.
3. Run /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/reanchor-stack.sh --verify to re-sync slices post-IG1 before unblocking S04.

## Proposed target
- Canonical RP1 re-anchor execution plan that guides IG-1 entry, S04+ downstream slices, ownership handoff, and risk controls with no unresolved implementer decisions.

## Changes landed
- Recorded the RP1 re-anchor plan, refreshed the plan log, and anchored the work to the mandated architecture docs and decision log (M4-D-032 through M4-D-044).

## Open risks
- IG-1 remains blocked by external ecology guardrail debt; success depends on timely ecology merge/guardrail remediation plus the /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md record.
- Post-IG1 lane split and config/docs slices inherit risk if guardrail scans or reanchor actions slip; mitigated by structural scans (G3) and orchestrator enforcement of the gate matrix.

## Decision asks
- none (all architecture & gating choices captured in /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md).
