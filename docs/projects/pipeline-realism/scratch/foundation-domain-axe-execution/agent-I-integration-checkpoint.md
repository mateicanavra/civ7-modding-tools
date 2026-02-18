# Agent I — Integration Checkpoint Specialist

## Ownership
- Own the mandatory pre-`S04` integration checkpoint (`IG-1`): ecology merge readiness, overlap/conflict audit, threshold policy application, and post-merge stabilization packet.

## Plan
1. Prepare merge-readiness packet before `IG-1`:
   - slice status (`S02/S03/S05/S06`), gate outcomes, unresolved risks.
2. Build overlap/conflict inventory for ecology + foundation execution surfaces.
3. Execute and document checkpoint flow with orchestrator + user:
   - ecology merge first,
   - apply PR-threshold policy (`>=45`) for lower-stack collapse,
   - re-anchor + sync,
   - run `GI-1` gates.
4. Produce reconciliation note with explicit decisions and residual risks.

## Working Notes
- 2026-02-15 kickoff: initialized as integration specialist for `IG-1`.

## Evidence map
```yaml
checkpoint_sources:
  milestone:
    - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  stack_ledger:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
  decision_log:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/decision-log.md
  merge_timing_review:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-T-ecology-merge-timing-review.md
```

## Proposed target
- `IG-1` is decision-complete and execution-safe: merged base validated, policy applied, user sign-off recorded, `S04` unblocked.

## Changes landed
- Integration specialist scratch initialized with ownership, plan, and source map.

## Open risks
- Ecology and foundation may introduce non-trivial conflicts in shared recipe/config/diagnostics surfaces.

## Decision asks
- none

## 2026-02-15 — Foundation decomposed tectonics op-local-rules enforcement (architecture guardrail closeout)

### Decision + evidence attestation
```yaml
decision_attestation:
  date: 2026-02-15
  scope: foundation decomposed tectonics ops (S03/S05 guardrail overlap)
  decision:
    summary: "Adopt strict op-local-rules ownership for decomposed tectonics ops."
    policy:
      shared_tectonics_allowed_only_for:
        - types/schemas
        - constants
        - shared primitives
      op_rules_must_own_real_implementation: true
      forbid_reexport_shims_from_shared_tectonics_inside_op_rules: true
      strategy_imports_must_be_local:
        allowed:
          - "@swooper/mapgen-core/authoring"
          - "../contract.js"
          - "../rules/*"
        forbidden_examples:
          - "../../../lib/require.js"
          - "../../../lib/tectonics/*"
          - "compute-tectonic-history/lib/*"

  implementation_evidence:
    localized_rule_implementations:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/rules/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/rules/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/rules/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/rules/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/rules/index.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/rules/index.ts
    strategy_rewires:
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/strategies/default.ts
      - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/strategies/default.ts
    guardrail_updates:
      - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
      - scripts/lint/lint-domain-refactor-guardrails.sh

  verification:
    - command: bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps check
      result: pass
    - command: cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full REFRACTOR_DOMAINS=foundation ./scripts/lint/lint-domain-refactor-guardrails.sh
      result: pass
    - command: bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts
      result: pass (26 passed, 0 failed)
```

## Proposed target
- Decomposed foundation tectonics strategies import only local op modules (`../rules/*` + `../contract.js`) and never deep-import shared tectonics or legacy mega-op internals.
- Decomposed op rule modules contain owned implementation logic rather than forwarding shared tectonics helpers by re-export shim.
- Guardrails fail immediately on regressions in strategy import boundaries and op-rule re-export shims.

## Changes landed
- Replaced shim-only rule files for hotspot events, segment events, and tracer advection with op-local implementations.
- Rewired `compute-era-plate-membership` strategy to local rules and added local `require*` wrappers in its rules surface.
- Converted remaining pass-through exports in `compute-era-tectonic-fields` and `compute-tectonic-provenance` rules into explicit local wrappers.
- Extended contract/lint guardrails with:
  - strategy-local import enforcement for decomposed tectonics ops
  - explicit ban on `lib/tectonics` re-export shims inside decomposed op rules.

## Open risks
- Shared tectonics modules still exist for non-decomposed/legacy callers; follow-up cleanup may be needed to reduce duplicate logic once broader migration completes.
- The checkpoint file now includes both prior shared-module direction and this stricter local-rules decision; this section should be treated as the superseding boundary policy for decomposed ops.

## Decision asks
- none

## Context bridge
- IG-1 was the hard stop between parallel S02/S03/S05/S06 work and downstream execution. As of the current stack tip, ecology is already integrated and IG-1 is complete; the remaining work is forward-only (lane split + config/preset/docs parity).

### Assumptions
- The stack remains Graphite-managed and can be validated via `gt log short` + focused verification commands.
- GI-1 verification is defined as an explicit command matrix (no hidden scripts).

### Verification matrix
```yaml
verification_matrix:
  ecology_merge:
    command: gt log short
    success_criteria: ecology_is_integrated && stack_is_consistent
  pr_threshold:
    command: gt log | rg "PR #" | wc -l
    success_criteria: pr_count_is_recorded_and_policy_applied_if_needed
  reanchor:
    command: gt sync --no-restack && gt log short
    success_criteria: stack_tip_matches_expected && no_unexpected_restacks
  gi1_gate:
    command: bun run test:architecture-cutover && bun run --cwd mods/mod-swooper-maps build:studio-recipes
    success_criteria: exit_code == 0 && studio_typegen_does_not_crash
```

### Evidence paths
```yaml
evidence_paths:
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-I-integration-checkpoint.md
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/ig-1-checkpoint-packet-template.md
  - path: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/stack-ledger.md
```

## 2026-02-15 IG-1 entry refresh (post-restack)
```yaml
slice_commit_snapshot:
  S02:
    branch: codex/prr-m4-s02-contract-freeze-dead-knobs
    commit: 9b65ae462
    state: committed
  S03:
    branch: codex/prr-m4-s03-tectonics-op-decomposition
    commit: 8a596087a
    state: committed
  S05:
    branch: codex/prr-m4-s05-ci-strict-core-gates
    commit: 5b066753a
    state: committed
  S06:
    branch: codex/prr-m4-s06-test-rewrite-architecture-scans
    commit: 6cee8de01
    state: committed

pre_ig1_gate_summary:
  G0_build: pass
  G0_lint: pass
  G1_adapter_boundary: pass
  G1_full_domain_guardrails: fail_external_ecology_debt
  G1_check: pass
  G2_no_op_calls_op: pass
  G2_no_dual_contract_paths: pass
  G2_no_shim_surfaces: pass
  G2_foundation_topology_lock: pass

checkpoint_readiness:
  at_integration_point: true
  S04_unblocked: false
  required_next_actions:
    - merge_ecology_stack
    - evaluate_pr_count_threshold_and_collapse_if_gte_45
    - reanchor_execution_stack
    - run_GI_1_matrix_on_integrated_base
```

## Proposed target
- `IG-1` is decision-complete and execution-safe: merged base validated, policy applied, user sign-off recorded, and `S04` unblocked.

## Changes landed
- Added IG-1 entry packet refresh with current S02/S03/S05/S06 commit snapshot.
- Recorded pre-IG1 gate matrix results from aligned stack state.
- Confirmed orchestrator is at the mandatory integration checkpoint before `S04`.

## Open risks
- Full-profile domain guardrails remain red due pre-existing ecology canonical-module debt until ecology merge/remediation is applied.
- Shared recipe/diagnostics files may conflict during ecology merge and require a dedicated conflict-fix slice before `S04`.

## Decision asks
- none

## 2026-02-15 — Foundation hotspot boundary audit/remediation (architecture watcher)

### Required docs (read before code edits)
```yaml
required_docs_read_pre_edit:
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
    anchors:
      - "Steps call ops; ops never call steps."
      - "Strategies/rules are op-internal; steps select through op config envelopes only."
      - "Compile-first posture: normalization/defaulting belongs to normalize surfaces, not runtime cast/merge hacks."
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
    anchors:
      - "Swooper mod architecture doc is the mod router/context surface."
      - "Canonical MapGen architecture docs are under docs/system/libs/mapgen/* replacements."
  - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
    anchors:
      - "Legacy router only; canonical replacements are explanation/reference docs."
      - "Boundary decisions should follow explanation/ARCHITECTURE.md and explanation/DOMAIN-MODELING.md."
```

### Smell audit + remediation evidence
```yaml
smell_audit:
  schema_imports_translation_hacks_across_boundaries:
    status: fixed
    before:
      - decomposed foundation tectonics ops/contracts imported from compute-tectonic-history/lib/* and compute-tectonic-history/contract.js
    remediation:
      - added shared neutral module: mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/
      - rewired decomposed contracts/strategies to import only foundation/lib/tectonics/*
      - added contract guard test asserting no decomposed-op imports from compute-tectonic-history/(lib|contract)

  giant_helper_function_wrapped_by_ops_without_clear_boundary:
    status: mitigated
    before:
      - decomposed op strategies were thin wrappers over helper modules living inside legacy compute-tectonic-history op folder
    remediation:
      - moved helper implementations to foundation/lib/tectonics/*
      - converted compute-tectonic-history/lib/{constants,shared,internal-contract,events,fields,membership,rollups,tracing,provenance}.ts into re-export shims to shared module

  op_calls_op:
    status: pass
    evidence:
      - test/foundation/no-op-calls-op-tectonics.test.ts passed

  step_importing_rules_or_strategy_internals:
    status: pass
    evidence:
      - foundation tectonics step remains bound through contract ops surface; no strategy/rules deep imports introduced

  stage_compile_runtime_merge_defaulting:
    status: pass
    evidence:
      - foundation-scoped full guardrails passed including cast-merge/sentinel checks on stage index

  contracts_types_imported_from_wrong_boundaries:
    status: fixed
    remediation:
      - extracted tectonic schemas/types to foundation/lib/tectonics/schemas.ts
      - updated compute-tectonic-history/contract.ts to consume and re-export shared schemas/types
```

### Files changed (owned remediation set)
```yaml
changed_files:
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/index.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/schemas.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/constants.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/internal-contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/events.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/fields.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/membership.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/rollups.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/tracing.ts
  - mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/provenance.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/strategies/default.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/constants.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/shared.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/internal-contract.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/events.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/fields.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/membership.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/rollups.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/tracing.ts
  - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/provenance.ts
  - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts
  - scripts/lint/lint-domain-refactor-guardrails.sh
```

### Verification
```yaml
verification:
  - command: bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps check
    result: pass
  - command: bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts
    result: pass (14 passed, 0 failed)
  - command: bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test test/foundation/m11-tectonic-events.test.ts
    result: pass (3 passed, 0 failed)
  - command: bun --cwd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps test test/foundation/m11-tectonic-segments-history.test.ts
    result: pass (6 passed, 0 failed)
  - command: cd /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails && DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full REFRACTOR_DOMAINS=foundation ./scripts/lint/lint-domain-refactor-guardrails.sh
    result: pass
```

## Proposed target
- Decomposed tectonics ops depend only on a neutral foundation shared tectonics surface, never on legacy compute-tectonic-history internals.
- Shared tectonic schemas/types/helpers have one canonical home (`foundation/lib/tectonics`), with legacy-path shims only for compatibility.
- Guardrails fail fast if decomposed ops regress back to cross-op legacy internals.

## Changes landed
- Added canonical shared tectonics module under `foundation/lib/tectonics` and rewired decomposed tectonics op contracts/strategies to it.
- Extracted tectonic schemas/types into shared module and made `compute-tectonic-history/contract.ts` consume/re-export that shared source.
- Replaced legacy `compute-tectonic-history/lib/*` helper bodies with thin shims pointing to shared module.
- Added a new contract guard test + lint guardrail rule to block decomposed-op imports from `compute-tectonic-history/(lib|contract)`.

## Open risks
- Legacy consumers still importing through `compute-tectonic-history/lib/*` remain supported by shims; a later cleanup should remove shims once all callers are migrated.
- `compute-crust-evolution`, `compute-plates-tensors`, and `foundation/lib/require.ts` still intentionally reference `compute-tectonic-history/contract` exports; full contract decoupling is a follow-up concern outside this hotspot slice.

## Decision asks
- none
