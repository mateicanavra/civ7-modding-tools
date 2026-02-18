---
audit_date: 2026-02-15
audit_type: orchestrator-startup-discipline-hardening
worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
docs_anchor:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
scratch_targets:
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/00-plan.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
  - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
---

## Plan

1. Encode worker startup requirements as a single contract in plan scratch.
2. Mirror enforcement in runtime scratch, decision log, and stack ledger.
3. Add explicit anti-pattern denylist and required pre-handoff verification gates.
4. Confirm governance language is append-only and path evidence is absolute.

## Evidence

```yaml
baseline_findings:
  - id: startup-path-drift-risk
    observation: worker kickoff prompts could omit absolute execution worktree paths
    consequence: output can land in wrong worktree and bypass intended branch ownership
  - id: architecture-anchor-inconsistency
    observation: docs-first anchoring existed but was not enforced as a startup gate in all orchestrator scratch surfaces
    consequence: workers can start coding before architecture/spec constraints are explicitly mapped
  - id: stage-boundary-regression-risk
    observation: anti-pattern list was not explicit about stage compile/runtime merges and schema translation shortcuts
    consequence: regressions can reintroduce hidden compile ownership and runtime defaulting in stage
  - id: handoff-verification-gap
    observation: required verification command set before handoff acceptance was not centralized
    consequence: inconsistent handoff quality and harder orchestrator rejection logic
```

## Edits

```yaml
doc_updates:
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/00-plan.md
    additions:
      - future_worker_startup_packet_with_absolute_path_reject_rules
      - docs_anchor_contract_with_required_docs_and_canonical_examples
      - anti_pattern_denylist
      - pre_handoff_verification_gates
      - orchestrator_oversight_checklist
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
    additions:
      - checkpoint_12_startup_discipline_lock
      - acceptance_rule_for_handoff_rejection
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
    additions:
      - M4-D-036_to_M4-D-040_governance_decisions
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
    additions:
      - WG-STARTUP_and_WG-HANDOFF_governance_gates
      - oversight_checklist_snapshot
```

## Verification

```yaml
verification_checks:
  required_tokens:
    - Future Worker Startup Discipline
    - WG-STARTUP
    - WG-HANDOFF
    - M4-D-036
    - M4-D-040
    - no_stage_compile_runtime_merging
    - no_manual_public_to_internal_schema_translation
    - no_runtime_defaulting_inside_stage
  expected_change_scope:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/**
    - no_production_code_paths
```

## Proposed target

- Orchestrator scratch docs reject unanchored or under-verified worker handoffs by default, using absolute path discipline and architecture-first startup evidence.

## Changes landed

- Added this hardening audit note and synchronized startup-discipline enforcement across plan, runtime scratch, decision log, and stack ledger docs.

## Open risks

- Worker templates outside this scratch pack may still require follow-up updates to match the new startup packet contract.

## Decision asks

- none
