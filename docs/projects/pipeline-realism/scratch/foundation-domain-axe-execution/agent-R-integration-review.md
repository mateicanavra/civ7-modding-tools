# Agent R — Integration Review

## Ownership
- Review orchestrator-integrated M4 milestone + issue pack for completeness, consistency, and missing coverage.

## Scope
- docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
- docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-*.md
- docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/*.md

## Findings
- [SEV-1] Done-definition is not fully satisfied: Tier-2 requires viz/tracing identity changes to be explicit and verified, but the issue pack has no owning issue with executable viz/tracing gates. M4-003 captures break inventory only; Agent E migration/validation checks are not integrated into milestone/issue acceptance.
```yaml
evidence_paths:
  - path: docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md:72
    why: Tier-2 explicitly requires viz/tracing identity changes to be explicit and verified
  - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md:34
    why: issue acceptance stops at trace/viz implications inventory
  - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md:36
    why: testing section has no viz/tracing diagnostics commands
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-E-viz-tracing.md:128
    why: migration checks are defined in scratch but not propagated
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-E-viz-tracing.md:158
    why: validation command matrix exists but is not wired into issue-level gates
```

- [SEV-1] M4-006 acceptance requires explicit earth-like fit checks and docs/comments/schema parity, but its verification block does not include earth-like measurable tests and does not scan canonical `docs/system` surfaces. This leaves acceptance criteria under-enforced.
```yaml
evidence_paths:
  - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md:30
    why: acceptance requires explicit earth-like fit checks
  - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md:35
    why: verification lists only broad test/check/rg commands, no earth-like intent checks
  - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md:36
    why: docs scan excludes docs/system canonical mapgen docs
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md:131
    why: explicit earth-like measurable checks are already defined
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md:198
    why: explicit earth-like test commands are available but not adopted
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md:162
    why: canonical docs/system files to update are identified but missing from issue verification scope
```

- [SEV-2] Slice/gate ownership inconsistency: M4-005 acceptance includes `S09`, but milestone + stack ledger assign `S09`/`G5` to M4-006. This creates ambiguous ownership for final guardrail closure.
```yaml
evidence_paths:
  - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-005-guardrails-test-rewrite.md:31
    why: M4-005 acceptance claims sequencing across S05/S06/S09
  - path: docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md:168
    why: milestone gate map assigns S09 -> G5
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md:60
    why: M4-005 is mapped to slices S05/S06 only
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md:67
    why: S09 is mapped under M4-006 with G4/G5
```

- [SEV-2] M4-001 deliverable requires decision-log coverage of locked posture choices across implementation slices, but the central decision log remains incomplete (`Rolling decisions: pending`) and does not reflect the detailed locked decisions captured in agent A-F scratch docs.
```yaml
evidence_paths:
  - path: docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-001-planning-contract-freeze.md:25
    why: requires decision log entries for locked posture choices used by implementation slices
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md:18
    why: rolling decisions section is still pending
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-B-stage-topology.md:28
    why: locked decisions exist outside central decision log
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-C-lane-and-downstream.md:28
    why: decision lock exists outside central decision log
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-E-viz-tracing.md:28
    why: implementation decisions exist outside central decision log
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md:28
    why: locked decisions exist outside central decision log
```

- [SEV-3] Scratch status is stale: `master-scratch` still reports `agent_F_docs_config: in_progress`, but Agent F has already posted decision-complete notes. This can mislead integration readiness checks.
```yaml
evidence_paths:
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md:71
    why: status still marks Agent F as in progress
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md:26
    why: decision-complete update is present
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-F-docs-config.md:221
    why: changes landed section indicates completion-level detail
```

## Proposed target
- Identify concrete missing pieces or confirm no major gaps.

## Changes landed
- Added integration review findings with severity tags and YAML evidence path blocks.

## Open risks
- If unresolved, Tier-2 outcomes (viz/tracing verification and docs/schema parity) can pass planning review textually but fail late during cutover verification.

## Decision asks
- none

## Orchestrator Follow-up — 2026-02-14
```yaml
resolution_status:
  sev1_viz_tracing_ownership_gap: resolved
  sev1_m4_006_earthlike_docs_parity_under_enforced: resolved
  sev2_s09_ownership_inconsistency: resolved
  sev2_decision_log_incomplete: resolved
  sev3_master_scratch_stale_status: resolved
updated_artifacts:
  - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  - docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md
  - docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-005-guardrails-test-rewrite.md
  - docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
  - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/master-scratch.md
```
