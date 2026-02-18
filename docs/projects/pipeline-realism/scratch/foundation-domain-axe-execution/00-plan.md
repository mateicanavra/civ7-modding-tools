# 00 Plan — M4 Foundation Domain Axe Cutover

## Charter
Execute the M4 planning-phase deliverables into implementation-ready artifacts:
- hardened milestone,
- local issue pack,
- stack ledger with Graphite slices and gates,
- prework sweep outcomes,
- orchestrator + agent scratchpads.

## Locked Decisions
1. 3-stage topology is fixed:
   - `foundation-substrate-kinematics`
   - `foundation-tectonics-history`
   - `foundation-projection`
2. Lane split is phased, but final state allows no bridges/shims.
3. Dead/inert config and strategy knobs are removed now.
4. Structure-first execution, then dedicated tuning slice.
5. Immediate strict core guardrails (CI/lint/test) posture.

## Required Sequence
1. Draft M4 milestone from spike outcomes.
2. Harden milestone into decision-complete parent issues.
3. Break milestone into local issue docs.
4. Sweep unresolved prework prompts into findings/explicit decisions.
5. Lock milestone as source-of-truth index and issue docs as execution units.

## Output Paths
```yaml
artifacts:
  milestone_doc: docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  issues_root: docs/projects/pipeline-realism/issues
  scratch_root: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution
  stack_ledger: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  decision_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
```

## Validation Gates
```yaml
gates:
  G0:
    - bun run build
    - bun run lint
    - bun run test:ci
  G1:
    - bun run lint
    - bun run lint:adapter-boundary
    - REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - bun run check
  G2:
    - no-op-calls-op scan
    - no-dual-contract-path scan
    - no-shim-surface scan
    - topology-lock scan
  G3:
    - downstream compile success after lane rewires
  G4:
    - deterministic seed suite + intent-fit checks for presets
  G5:
    - no legacy/shadow paths
    - docs/comments/schema parity
    - bun run test:ci
```

## Working Rules
1. All scratch files are append-only.
2. Path-heavy evidence must be represented in YAML blocks.
3. Each scratch file ends with required sections:
   - `Proposed target`
   - `Changes landed`
   - `Open risks`
   - `Decision asks`

## Worker Architecture Anchor Protocol (Mandatory)
1. Before any worker edits code, the worker must read and cite:
   - `docs/system/mods/swooper-maps/architecture.md`
   - `docs/system/libs/mapgen/architecture.md`
   - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
2. Before any worker edits code, the worker must inspect at least one in-repo canonical example and cite file path(s) in scratch.
3. Worker handoffs must include a `docs_anchor` YAML block with:
   - `docs_read`
   - `canonical_examples`
   - `architecture_constraints_applied`
4. If a worker cannot map the requested change to documented architecture constraints, it must stop and raise a decision ask instead of editing.
5. Orchestrator cannot accept worker output without explicit architecture-anchor evidence in scratch.

## Proposed target
- M4 milestone + issue pack is decision-complete and implementation-ready.

## Changes landed
- This execution charter has been initialized in the execution worktree.

## Open risks
- New top-of-stack branches may appear during planning artifact generation.

## Decision asks
- none

## Execution Run Plan — 2026-02-15

### Objective
Historical record: execute M4 end-to-end using the hardened milestone/issue pack, with a mandatory integration checkpoint (`IG-1`) before downstream execution.

> Re-anchor (2026-02-16): ecology is already integrated; IG-1 is complete; the next major “second leg” slice is S07 (lane split + downstream rewires). Any references to “S04” in this document are historical and should not be treated as an upcoming branch.

### Locked run decisions
1. Run `S02/S03` and `S05/S06` in parallel before the integration checkpoint.
2. Enforce a hard integration gate (`IG-1`) before starting downstream lane-cut execution.
3. At `IG-1`, confirm ecology integration is present; if stack PR count is `>= 45`, apply the collapse policy and re-anchor with Graphite.
4. Reuse role-aligned agents where useful with explicit context bridging and compacted handoff.

### Immediate startup sequence
```yaml
startup_sequence:
  - append_kickoff_to_master_scratch_decision_log_stack_ledger
  - ensure_agent_scratch_docs_initialized_and_append_only
  - launch_parallel_precheckpoint_work:
      - S02: codex/prr-m4-s02-contract-freeze-dead-knobs
      - S03: codex/prr-m4-s03-tectonics-op-decomposition
      - S05: codex/prr-m4-s05-ci-strict-core-gates
      - S06: codex/prr-m4-s06-test-rewrite-architecture-scans
  - hard_stop_for_IG1_before_lane_cut_execution
```

### Integration gate (`IG-1`) contract
```yaml
integration_gate:
  id: IG-1
  blocks_until:
    - S02_green
    - S03_green
    - S05_green
    - S06_green
  required_actions:
    - confirm_ecology_integration_present
    - evaluate_pr_count_threshold_45
    - collapse_lower_stack_if_threshold_met
    - gt_sync_and_reanchor
    - run_GI1_verification_suite
    - record_user_signoff_in_scratch
```

### Run-completion target
- Deliver `S02..S09` with all milestone/issue acceptance gates satisfied and no legacy/shim surfaces remaining.

## Execution Run Plan - 2026-02-15 Hotspot Correction Loop

```yaml
objective: remediate architecture risks in highest-churn M4 implementation files
constraints:
  - no rebase
  - no shim/dual-path outcomes
  - agents must use absolute worktree paths
  - agents must anchor in domain modeling + architecture docs first
sequence:
  - launch file-owned workers
  - require append-only scratch updates per worker
  - integrate + patch conflicts
  - run focused then full verification gates
```

## 2026-02-15 — Future Worker Startup Discipline (Mandatory)

### Worker startup packet (absolute paths only)
```yaml
worker_startup_packet:
  required_paths:
    repo_root: $REPO_ROOT
    execution_worktree: $WORKTREES_ROOT/wt-<execution-worktree>
    scratch_root: $EXECUTION_WORKTREE/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution
  reject_conditions:
    - any_relative_path_in_worker_prompt_or_handoff
    - execution_worktree_path_mismatch
    - missing_docs_anchor_block
```

### Architecture/spec anchor before edits
```yaml
docs_anchor_contract:
  required_docs:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
  required_canonical_example:
    minimum_examples: 1
    example_sources:
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/authoring/stage.ts
      - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps
  worker_must_record:
    - docs_read
    - canonical_examples
    - architecture_constraints_applied
```

### Anti-pattern checklist (hard denylist)
```yaml
anti_patterns_forbidden:
  - no_stage_compile_runtime_merging
  - no_manual_public_to_internal_schema_translation
  - no_runtime_defaulting_inside_stage
  - no_peer_op_orchestration_inside_op_runtime
  - no_unanchored_changes_without_docs_first_packet
```

### Required verification gates before handoff
```yaml
handoff_verification_gates:
  required_commands:
    - bun run --cwd mods/mod-swooper-maps check
    - bun run --cwd mods/mod-swooper-maps lint
    - REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - bun run --cwd mods/mod-swooper-maps test -- test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/m11-tectonic-events.test.ts test/m11-config-knobs-and-presets.test.ts test/standard-recipe.test.ts
  handoff_rejected_if_missing:
    - command_log
    - nonzero_exit_resolution_note
    - changed_file_inventory_with_absolute_paths
```

### Orchestrator oversight checklist
```yaml
oversight_checklist:
  - startup_packet_has_absolute_worktree_paths
  - docs_anchor_yaml_present_and_complete
  - anti_pattern_checklist_marked_pass
  - verification_gates_logged_with_exit_codes
  - decision_log_updated_for_new_policy_or_exceptions
  - stack_ledger_gate_state_updated_before_handoff_acceptance
enforcement:
  reject_worker_handoff_on_first_missing_item: true
  escalation_path: append_decision_ask_in_scratch_and_stop
```

## Proposed target
- Future worker launches are architecture-anchored, path-locked, and gate-verified before any handoff is accepted.

## Changes landed
- Added mandatory startup packet, anti-pattern denylist, verification gates, and orchestrator oversight checklist for all future workers.

## Open risks
- Guardrail command scope may need expansion when non-foundation slices become active again.

## Decision asks
- none

## 2026-02-15 Anchoring Team Plan Activation (AR1/AR2/RP1)

- Objective: run an anchoring red-team pass before integration using exactly three fresh threads (`AR1`, `AR2`, `RP1`) with architecture-first enforcement.
- Policy: freeze new feature work until red-team triage is complete and `P0/P1` actions are resolved.

```yaml
anchoring_pass_activation:
  timestamp_local: 2026-02-15
  orchestrator_worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
  orchestrator_branch: codex/prr-m4-s06d-foundation-scratch-audit-ledger
  stack_snapshot:
    - codex/prr-m4-s06d-foundation-scratch-audit-ledger
    - codex/prr-m4-s06c-foundation-guardrails-hardening
    - codex/prr-m4-s06b-foundation-tectonics-local-rules
    - codex/prr-m4-s06a-foundation-knobs-surface
    - codex/prr-m4-s06-test-rewrite-architecture-scans
    - codex/prr-m4-s05-ci-strict-core-gates
    - codex/prr-m4-s03-tectonics-op-decomposition
    - codex/prr-m4-s02-contract-freeze-dead-knobs
  active_thread_cap: 3
  startup_packet_required_docs:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
  hard_invariants:
    - no_stage_runtime_merge_or_defaulting
    - no_manual_public_to_internal_schema_translation
    - compile_is_not_runtime_normalization
    - step_orchestrates_ops_no_op_calls_op
    - strategies_internal_to_ops_with_op_local_rules
    - no_shared_lib_rule_shim_pattern
    - no_duplicate_core_math_helpers
    - architecture_over_backward_compatibility_no_legacy_bridges
```

### Anchoring deliverables
```yaml
anchoring_deliverables:
  required_new_docs:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-AR1-architecture-red-team.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-AR2-architecture-docs-red-team.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-RP1-reanchor-plan.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/orchestrator-anchor-triage.md
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/HANDOFF-successor-orchestrator-m4-foundation.md
  milestone_sync_required: true
  issue_pack_sync_required: true
```

## 2026-02-15 User-locked Scratch Plan (Anchoring Team Plan — Foundation Red-Team + Re-Anchor + Successor Handoff)

### Summary
We will run a controlled anchoring pass with exactly 3 fresh agents:
1. `AR1` architecture red-team reviewer,
2. `AR2` architecture+docs red-team reviewer,
3. `RP1` re-anchor planning agent for integration-and-beyond.

The outcome is:
- a ranked findings pack from two independent reviewers,
- an immediate fix list to execute before integration,
- a revised orchestrator plan from current state through `IG-1` and post-`S04`,
- a successor handoff document that puts the next orchestrator directly in-role,
- milestone + issue docs updated to match the new reality.

### 1. Immediate Orchestrator Cleanup (first execution steps)
1. Close all legacy/stale agent threads; treat `agent not found` as already closed.
2. Keep max 3 active threads for this anchoring pass (well under 6-thread cap).
3. Snapshot stack state and preserve as baseline for review packet:
   - current branch,
   - `gt ls --stack`,
   - clean list of committed slices vs pending work.
4. Freeze new feature work until the red-team findings are triaged.

### 2. Scratchpad Structure for This Anchoring Pass
1. Use existing scratch root:
   `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/`
2. Add dedicated anchoring docs:
   - `agent-AR1-architecture-red-team.md`
   - `agent-AR2-architecture-docs-red-team.md`
   - `agent-RP1-reanchor-plan.md`
   - `orchestrator-anchor-triage.md`
   - `HANDOFF-successor-orchestrator-m4-foundation.md`
3. Keep append-only contract with required footer on each:
   - `Proposed target`
   - `Changes landed` (or `Findings landed` for review-only pass)
   - `Open risks`
   - `Decision asks`

### 3. Mandatory Startup Packet for Every New Agent
1. Absolute paths only (worktree + file references).
2. Required docs-first read with attestation evidence:
   - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
   - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md`
   - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md`
3. Hard invariants to enforce:
   - no stage runtime merge/defaulting,
   - no manual public->internal schema translation,
   - compile is not runtime normalization,
   - step orchestrates ops; no op-calls-op,
   - strategies internal to ops and powered by op-local rules,
   - no shared-lib rule shim pattern,
   - no duplicated core math helpers where core utility exists,
   - architecture over backward compatibility; no legacy bridge paths in final state.
4. Graphite/worktree process:
   - agent isolation via dedicated worktree/branch,
   - no global restacks,
   - no rebase for stack realignment where `gt move` is intended.

### 4. Agent Charters (decision-complete)
1. `AR1` (Architecture Red-Team):
   - Goal: rip boundary modeling apart and find structural/code-organization smells.
   - Focus: stage/step/op/strategy/rules boundaries; hidden orchestration; contract leakage; cross-boundary imports; runtime normalization in wrong layer.
   - Output: ranked findings `P0/P1/P2`, each with file path evidence and explicit “Fix now vs Keep (with rationale)”.
2. `AR2` (Architecture + Docs Red-Team):
   - Goal: check whether implementation and docs are actually aligned.
   - Focus: spec conformance gaps, docs drift, confusing patterns that invite future thrash, milestone/issue wording drift.
   - Output: ranked findings + exact doc changes needed in milestone/issue/scratch docs.
3. `RP1` (Re-Anchor Planner):
   - Goal: rebuild plan from current committed state through integration and beyond.
   - Focus: `IG-1` readiness, updated slice map, dependencies, verification gates, risk controls, ownership sequencing.
   - Output: revised execution plan artifact with no implementer decisions left open.

### 5. Review Workflow (orchestrator-managed)
1. Run `AR1` and `AR2` independently first (no cross-pollination until first findings complete).
2. Consolidate into `orchestrator-anchor-triage.md`:
   - deduplicate findings,
   - resolve conflicts,
   - assign severity and fix owner,
   - declare explicit keep/remove decisions.
3. Fix policy:
   - `P0/P1`: mandatory before integration checkpoint.
   - `P2`: fix now if low-risk/high-signal; otherwise explicitly backlog with rationale.
4. After fix pass, run `AR1` quick re-check on changed hotspots only.
5. Only then accept `RP1` re-anchored plan as canonical forward plan.

### 6. Successor Handoff Document Requirements
1. Produce `HANDOFF-successor-orchestrator-m4-foundation.md` as a role-bootstrap document, not a full milestone rewrite.
2. Required sections:
   - mission + current milestone objective,
   - exact current stack and branch map,
   - what is already complete pre-integration,
   - unresolved risks and blocked items,
   - hard policies/invariants (explicit, non-negotiable),
   - agent-team operating model (scratchpads, evidence, 6-thread max),
   - worktree/Graphite operating protocol for parallel agents,
   - required gates before/after `IG-1`,
   - linkage to milestone doc + local issue docs as canonical planning artifacts.
3. Include “first 60-minute takeover checklist” so successor can execute immediately.

### 7. Milestone + Issue Doc Sync (after anchor triage)
1. Update milestone:
   - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md`
2. Update impacted local issue docs under:
   - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/issues/`
3. Required updates:
   - reflect actual completed slices,
   - add anchor-pass findings and remediation commitments,
   - adjust dependencies and gates for integration-and-beyond,
   - keep Linear-syncable frontmatter intact.

### 8. Verification Gates for Anchor Pass Completion
1. Structural:
   - no op-calls-op regressions,
   - no strategy import leakage,
   - no rule re-export shim regressions,
   - no stage compile/runtime merge regressions.
2. Project checks:
   - `bun run --cwd mods/mod-swooper-maps check`
   - `bun run --cwd mods/mod-swooper-maps lint`
   - `REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`
3. Focused test suite:
   - `test/foundation/contract-guard.test.ts`
   - `test/foundation/no-op-calls-op-tectonics.test.ts`
   - `test/foundation/m11-tectonic-events.test.ts`
   - `test/foundation/m11-tectonic-segments-history.test.ts`
   - `test/foundation/tile-projection-materials.test.ts`
   - `test/m11-config-knobs-and-presets.test.ts`
   - `test/standard-recipe.test.ts`
   - `test/standard-compile-errors.test.ts`

### 9. Public APIs / Interfaces / Types (for this anchoring phase)
1. No new API changes are introduced by the anchoring management pass itself.
2. Any fix accepted from red-team findings that changes stage/op contracts must include:
   - explicit contract delta entry,
   - downstream consumer impact note,
   - test coverage proving the new boundary is enforced.

### 10. Assumptions and Defaults
1. Base execution remains on the current M4 execution stack in this worktree.
2. Contract-breaking is allowed when architecture requires it; no legacy shims in final merged state.
3. Reviewer findings are not auto-accepted blindly; orchestrator triage records explicit keep/fix decisions.
4. Successor handoff doc is mandatory before moving past integration checkpoint prep.
5. Milestone doc + issue docs remain canonical planning artifacts; scratch docs remain operational logs.
