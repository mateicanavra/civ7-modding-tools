# Agent D — Testing + Guardrails

## Ownership
- M4-005 strict core gates + structural test rewrite planning.

## Plan
1. Convert required gates (G1-G2) into concrete test/lint issue units.
2. Define structural scans and architecture lock tests.
3. Draft CI required-status rollout and acceptance criteria.

## Working Notes
- pending

## Proposed target
- Guardrail/test plan that makes no-shim policy mechanically enforceable.

## Changes landed
- Scratchpad initialized.

## Open risks
- CI run-time expansion may require sequencing adjustments.

## Decision asks
- none

### 2026-02-14 — M4-005 Decision-Complete Plan (Strict No-Shim)

#### Baseline evidence (executed in this worktree)
```yaml
evidence:
  ci_workflow:
    path: .github/workflows/ci.yml
    current_steps:
      - bun run build
      - bun run lint
      - bun run test:ci
    missing_for_strict_core:
      - bun run lint:adapter-boundary
      - REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
      - bun run check
  command_runs:
    - command: bun run lint:adapter-boundary
      result: pass
      notes:
        - allowlisted_file: packages/mapgen-core/test/setup.ts
    - command: REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
      result: fail
      failure_groups:
        - strict_profile_debt_in_foundation_morphology_ecology
        - hydrology_and_narrative_stage_root_mismatch_vs_current_layout
```

#### Immediate strict core CI rollout details (S05)
1. Add a dedicated required CI job `architecture-strict-core` in `.github/workflows/ci.yml` (parallel to existing `ci`, not optional).
2. Keep no-shim policy strict by using `DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full` only; do not introduce a permissive fallback profile.
3. Make the job hard-fail on any adapter-boundary violation, any domain-guardrail violation, or any type-check drift.
4. Update branch protection so both `ci` and `architecture-strict-core` are required for merge.
5. Land strict-core debt burn-down in the same slice chain before flipping required status green.

```yaml
rollout:
  workflow_path: .github/workflows/ci.yml
  required_jobs:
    - ci
    - architecture-strict-core
  job_commands:
    - gate: G1
      command: bun run lint
      script_source: package.json#scripts.lint
    - gate: G1
      command: bun run lint:adapter-boundary
      script_source: scripts/lint/lint-adapter-boundary.sh
    - gate: G1
      command: REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
      script_source: scripts/lint/lint-domain-refactor-guardrails.sh
      policy: no_shim_strict
    - gate: G1
      command: bun run check
      script_source: package.json#scripts.check
  hard_fail_conditions:
    - adapter_boundary_violation
    - domain_guardrail_violation
    - typecheck_or_contract_check_failure
```

#### Structural architecture test suite plan (S06)
1. Add deterministic structural tests for op-calls-op, dual-path contracts, shim surfaces, and topology lock.
2. Keep scans source-scoped (domain + stages + maps + pipeline tests), excluding docs to reduce false positives.
3. Wire these tests into a single architecture test command used by CI and local verification.

```yaml
architecture_suite:
  root: mods/mod-swooper-maps/test
  planned_tests:
    - id: no_op_calls_op
      path: mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts
      purpose: forbid_step_or_stage_code_calling_domain_ops_directly
      gate: G2
      command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts
    - id: no_dual_contract_paths
      path: mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts
      purpose: forbid_legacy_plus_target_contract_surfaces_in_parallel
      gate: G2
      command: bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-dual-contract-paths.test.ts
    - id: no_shim_surfaces
      path: mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts
      purpose: block_shim_shadow_compare_dual_tokens_in_runtime_sources
      gate: G2
      command: bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-shim-surfaces.test.ts
    - id: foundation_topology_lock
      path: mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts
      purpose: lock_final_foundation_stage_topology_and_forbid_legacy_foundation_stage_alias
      gate: G2
      command: bun run --cwd mods/mod-swooper-maps test -- test/pipeline/foundation-topology-lock.test.ts
  existing_tests_to_reuse:
    - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts
    - mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts
    - mods/mod-swooper-maps/test/standard-recipe.test.ts
  integration_hook:
    proposed_script: package.json#scripts.test:architecture-cutover
```

#### Mapping to gates G1/G2/G5
```yaml
gate_mapping:
  G1:
    objective: strict_core_ci
    checks:
      - bun run lint
      - bun run lint:adapter-boundary
      - REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
      - bun run check
  G2:
    objective: structural_architecture_enforcement
    checks:
      - no_op_calls_op
      - no_dual_contract_paths
      - no_shim_surfaces
      - foundation_topology_lock
  G5:
    objective: no_legacy_left
    checks:
      - bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-shadow-paths.test.ts
      - bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-shim-surfaces.test.ts
      - bun run --cwd mods/mod-swooper-maps test -- test/pipeline/foundation-topology-lock.test.ts
      - bun run test:ci
```

#### Issue-ready acceptance criteria and verification commands

##### S05 — `LOCAL-TBD-PR-M4-005A-ci-strict-core-gates`
Acceptance criteria:
- [ ] `architecture-strict-core` job exists in `.github/workflows/ci.yml` and is required by branch protection.
- [ ] Job executes all G1 commands exactly as listed, including `DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full`.
- [ ] No-shim policy is explicit: no temporary bridge allowlist expansions, no fallback to `boundary` profile in required CI.
- [ ] Current strict-profile debt is reduced to zero so the required job is green without suppression.

Verification commands:
- `bun run lint`
- `bun run lint:adapter-boundary`
- `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`
- `bun run check`

##### S06 — `LOCAL-TBD-PR-M4-005B-structural-architecture-scans`
Acceptance criteria:
- [ ] Four structural tests exist and are wired into CI: `no-op-calls-op`, `no-dual-contract-paths`, `no-shim-surfaces`, `foundation-topology-lock`.
- [ ] Topology lock enforces final 3-stage foundation model (`foundation-substrate-kinematics`, `foundation-tectonics-history`, `foundation-projection`) and rejects legacy `foundation` stage alias.
- [ ] Dual-path scan rejects any contract/state that carries both legacy and target semantic paths for the same dependency.
- [ ] Shim scan extends existing no-shadow coverage and fails on reintroduced shim/shadow/compare/dual surfaces in runtime sources.

Verification commands:
- `bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-dual-contract-paths.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-shim-surfaces.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/foundation-topology-lock.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-shadow-paths.test.ts`
- `bun run test:ci`

## 2026-02-15 Execution update (post-S03 restack)
```yaml
branch_status:
  S05_branch: codex/prr-m4-s05-ci-strict-core-gates
  S05_commit: 5b066753a
  S06_branch: codex/prr-m4-s06-test-rewrite-architecture-scans
  S06_commit: 6cee8de01
  topology: S03 -> S05 -> S06

pre_ig1_gate_run:
  G0_build: pass
  G0_lint: pass
  G1_adapter_boundary: pass
  G1_full_domain_guardrails: fail
  G1_check: pass
  G2_no_op_calls_op: pass
  G2_no_dual_contract_paths: pass
  G2_no_shim_surfaces: pass
  G2_foundation_topology_lock: pass

failure_detail:
  gate: G1_full_domain_guardrails
  cause: preexisting_ecology_canonical_module_debt
  representative_findings:
    - missing_types_ts_in_compute_feature_substrate
    - missing_types_ts_in_compute_vegetation_substrate
    - missing_rules_index_ts_in_plan_wet_placement_ops
    - missing_types_ts_in_multiple_vegetation_score_ops
  source_log: .tmp/m4-gates/G1_full_guardrails.log
```

## Proposed target
- M4-005 enforces strict no-shim posture via required CI (G1) and deterministic structural architecture scans (G2), then closes with no-legacy verification (G5).

## Changes landed
- Added decision-complete M4-005 planning for strict-core CI rollout and structural architecture test suite.
- Added YAML evidence blocks for current CI/scripts state, planned tests, and gate mapping.
- Added issue-ready acceptance criteria and verification command sets for S05 and S06.

## Open risks
- The strict `full` guardrail profile currently fails on existing debt and stage-root mismatches; S05 must include debt burn-down before required-status flip.
- Topology lock can become flaky during stage-split branches unless it asserts final-state IDs only and forbids transitional aliases.
- Token scans can overmatch if scope expands beyond runtime source/test roots.

## Decision asks
- none

### 2026-02-15 — /compact context-bridge ack + S05/S06 slice plan

#### Compact context bridge
- Stack C execution context is active on `codex/prr-m4-s05-ci-strict-core-gates` with clean worktree state.
- Current CI runs `build/lint/test:ci` but does not provide a dedicated strict-core architecture gate job.
- Strict full-profile guardrails currently contain stale stage-root expectations that can hard-fail required-domain runs.
- Structural architecture scans for no-op-calls-op, dual paths, shim/shadow surfaces, and topology lock are not yet wired as one explicit architecture-cutover suite.

#### Assumptions
- S05 must land required strict-core CI enforcement using explicit commands (no implicit `check` expansion ambiguity).
- No permissive fallback profile is acceptable for required domain-refactor guardrail execution (`DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full` only for strict-core gate path).
- S06 should add deterministic structural tests that run in repo CI without introducing transitional shim allowances.
- Branch-protection toggles are managed outside-repo; workflow job naming and command wiring in-repo are the enforceable contract here.

#### Slice plan
1. S05 (`codex/prr-m4-s05-ci-strict-core-gates`):
   - add strict core CI job (`architecture-strict-core`) with required command set,
   - enforce explicit strict profile invocation,
   - remove/close permissive fallback behavior in guardrail execution path where it conflicts with required strict gate semantics,
   - run S05 gate commands and record exact outputs.
2. S06 (`codex/prr-m4-s06-test-rewrite-architecture-scans`) stacked on S05:
   - add/upgrade structural tests for no-op-calls-op, no dual paths, no shim/shadow surfaces, topology lock,
   - wire architecture scans into package scripts and CI path,
   - run structural suite commands and record exact outputs.

#### Verification plan
- S05 gates:
  - `bun run lint`
  - `bun run lint:adapter-boundary`
  - `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`
  - `bun run check`
- S06 architecture scans:
  - `bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts`
  - `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-dual-contract-paths.test.ts`
  - `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-shim-surfaces.test.ts`
  - `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/foundation-topology-lock.test.ts`
  - `bun run test:ci`

```yaml
evidence_paths:
  planning_context:
    - docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M4-005-guardrails-test-rewrite.md
    - docs/projects/pipeline-realism/milestones/M4-foundation-domain-axe-cutover.md
  s05_targets:
    - .github/workflows/ci.yml
    - package.json
    - scripts/lint/lint-domain-refactor-guardrails.sh
  s06_targets:
    - mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts
    - mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts
    - mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts
    - mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts
    - mods/mod-swooper-maps/package.json
  command_output_log:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/agent-D-testing-guardrails.md
```

## Proposed target
- Execute S05/S06 as strict no-shim enforcement slices: hard CI strict-core gate plus deterministic architecture scans wired into repeatable commands.

## Changes landed
- Added 2026-02-15 compact context bridge, assumptions, slice plan, verification plan, and evidence-path map for S05/S06 execution.

## Open risks
- If topology-lock expectation is ahead of currently landed stage topology, scan scope may need a narrow lock to current canonical IDs in this stack layer.
- Strict full-profile domain guardrails may surface unrelated pre-existing debt that must be remediated or explicitly handed off with evidence.

## Decision asks
- none

### 2026-02-15 — S05 execution evidence (post-implementation)

```yaml
s05_command_runs:
  - command: bun run lint
    exit_code: 0
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s05/01-bun-run-lint.log
  - command: bun run lint:adapter-boundary
    exit_code: 0
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s05/02-bun-run-lint-adapter-boundary.log
  - command: REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full DOMAIN_REFACTOR_GUARDRAILS_REQUIRE_FULL=1 bun run lint:domain-refactor-guardrails
    exit_code: 1
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s05/03-bun-run-lint-domain-refactor-guardrails-full.log
    failure_summary:
      violation_groups: 20
      notable_groups:
        - runtime_config_merges_foundation
        - runtime_config_merges_morphology
        - hydrology_step_id_configs_in_maps
        - ecology_jsdoc_and_module_shape_guardrails
  - command: REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full DOMAIN_REFACTOR_GUARDRAILS_REQUIRE_FULL=1 bun run check
    exit_code: 1
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s05/04-bun-run-check-strict-env.log
    failure_reason: check_fails_because_lint-domain-refactor-guardrails_fails_under_strict_full_profile
```

Verbatim outputs are captured in the referenced `output_log` files above.

### 2026-02-15 — S06 execution evidence (restacked run)

```yaml
s06_command_runs:
  - command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts
    exit_code: 1
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s06/01-no-op-calls-op-tectonics.log
    failure_summary:
      finding: foundation_op_runtime_imports_sibling_ops
      hits:
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts imports ../compute-tectonic-segments/index.js
        - mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts imports ../compute-plate-motion/index.js
  - command: bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-dual-contract-paths.test.ts
    exit_code: 0
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s06/02-no-dual-contract-paths.log
  - command: bun run --cwd mods/mod-swooper-maps test -- test/pipeline/no-shim-surfaces.test.ts
    exit_code: 0
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s06/03-no-shim-surfaces.log
  - command: bun run --cwd mods/mod-swooper-maps test -- test/pipeline/foundation-topology-lock.test.ts
    exit_code: 0
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s06/04-foundation-topology-lock.log
  - command: bun run test:architecture-cutover
    exit_code: 1
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s06/05-test-architecture-cutover.log
    failure_reason: no-op-calls-op_guard_fails_on_existing_foundation_op_to_op_runtime_imports
  - command: bun run test:ci
    exit_code: 1
    output_log: docs/projects/pipeline-realism/scratch/foundation-domain-axe-execution/evidence/agent-D/s06/06-bun-run-test-ci.log
    failure_reason: includes_new_no-op-calls-op_guard_which_detects_existing_runtime_op_to_op_calls

s06_status:
  infrastructure_and_scans_added: true
  debt_cleanup_included_in_s06: false
  known_blocker_surface:
    - foundation/compute-tectonic-history_runtime_imports_of_other_ops
```

S06 result posture: structural architecture scan infrastructure is landed and wired; remaining failures are pre-existing debt now surfaced by the new no-op-calls-op gate.

### 2026-02-15 — Execution hotspot remediation (strict step-orchestrates hardening)

#### Findings
- Legacy aggregate op surface remained exposed in Foundation domain ops registries (`contracts.ts` + `ops/index.ts`) even after tectonics orchestration moved to step runtime.
- Existing guardrails passed without catching this regression class, so reintroduction risk stayed non-zero.

```yaml
architecture_findings:
  - id: FND-ARCH-001
    severity: high
    rule: strict-step-orchestrates
    violation:
      summary: "Legacy aggregate tectonic-history op remained publicly wired in Foundation domain ops surfaces."
      files:
        - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts
        - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/index.ts
    remediation:
      - "Removed computeTectonicHistory from foundation ops contracts registry."
      - "Removed computeTectonicHistory implementation wiring/export from foundation ops index surface."
      - "Added test guard in contract-guard suite to forbid re-exposure."
      - "Added lint guard in domain-refactor script for foundation contracts/index surfaces."
```

```yaml
verification_runs:
  - command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts
    exit_code: 0
    result: pass
    notes:
      - "All foundation guardrail tests passed with new no-legacy-op-surface assertion."
  - command: REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    exit_code: 0
    result: pass
    notes:
      - "Foundation full-profile guardrail scan passed with added legacy-op-surface lint check."
  - command: bun run --cwd mods/mod-swooper-maps check
    exit_code: 0
    result: pass
    notes:
      - "Typecheck passed after removing legacy aggregate op from foundation domain ops registries."
```

## Proposed target
- Foundation tectonics remains single-path: step owns orchestration, focused ops remain callable, aggregate legacy op is not publicly exposed through domain surfaces.
- Guardrails explicitly block reintroduction of legacy aggregate op surface in both tests and lint scans.

## Changes landed
- Updated `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts` to remove `computeTectonicHistory` registry exposure.
- Updated `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/index.ts` to remove `computeTectonicHistory` implementation/export wiring.
- Updated `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` with explicit no-legacy-surface assertions.
- Updated `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/lint/lint-domain-refactor-guardrails.sh` with a foundation-specific legacy aggregate-op scan.

## Open risks
- Direct file-level imports of `compute-tectonic-history/index.ts` in older non-guardrail tests still exist and can fail if those suites are run without migration to decomposed ops/step orchestration.
- Full multi-domain guardrail profile may still fail on unrelated pre-existing debt outside the foundation scope.

## Decision asks
- none

### 2026-02-15 — m11 tectonic segments/history test rewrite (decomposed chain)

```yaml
rewrite_scope:
  target_test:
    path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts
    objective:
      - remove_direct_computeTectonicHistory_run_usage
      - assert_through_decomposed_tectonics_op_chain
  architecture_alignment:
    source_pattern: computeTectonicHistory.run(...)
    replacement_chain:
      - computeEraPlateMembership.run
      - computePlateMotion.run
      - computeTectonicSegments.run
      - computeSegmentEvents.run
      - computeHotspotEvents.run
      - computeEraTectonicFields.run
      - computeTectonicHistoryRollups.run
    preserved_intent:
      - deterministic_history_rollup_behavior
      - invalid_eraCount_contract_rejection
  assertion_update:
    invalid_eraCount_error:
      old: "[Foundation] compute-tectonic-history expects eraCount within 5..8."
      new: "[Foundation] compute-era-plate-membership expects eraCount within 5..8."

verification_runs:
  - command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-tectonic-segments-history.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts
    exit_code: 0
    result: pass
    summary:
      files: 4
      tests: 22
      passed: 22
      failed: 0
```

## Proposed target
- Foundation history tests assert through the decomposed tectonics contract path only, with no direct dependency on the deprecated aggregate tectonic-history op runtime.

## Changes landed
- Rewrote `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/test/foundation/m11-tectonic-segments-history.test.ts` to remove `computeTectonicHistory.run` and use decomposed ops helper flow for history assertions.
- Updated the invalid era-count expectation to contract behavior from `compute-era-plate-membership`.
- Executed and verified related foundation tests and guardrails in one run (22/22 passing).

## Open risks
- The rewritten helper intentionally mirrors tectonics-step decomposition logic inside test code; future sequencing changes in step runtime may require synchronized helper updates to avoid drift.

## Decision asks
- none

### 2026-02-15 — Foundation ops thin-wrapper audit (post strategy extraction)

```yaml
audit_scope:
  focus: foundation_decomposed_tectonics_chain_ops
  files_audited:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/index.ts

findings:
  - id: FND-THIN-WRAPPER-001
    severity: medium
    summary: "Decomposed chain ops still used inline default run blocks in op index files after logic extraction to shared lib modules."
    impact: "Index files mixed op registration and strategy behavior, increasing wrapper drift risk and reducing strategy-module clarity."
    fix: "Extracted explicit strategies/default.ts + strategies/index.ts modules and rewired op index files to strategy imports only."

verification_evidence:
  strategy_modules_created:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-plate-membership/strategies/default.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-segment-events/strategies/default.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-hotspot-events/strategies/default.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-era-tectonic-fields/strategies/default.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history-rollups/strategies/default.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonics-current/strategies/default.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tracer-advection/strategies/default.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-provenance/strategies/default.ts
  architecture_checks:
    - check: no_inline_run_in_chain_op_indexes
      command: rg -n "run:\\s*\\(" <chain op index files>
      result: pass
      note: "No inline run implementations remain in audited decomposed-chain op index files."
    - check: explicit_strategy_wiring_in_chain_op_indexes
      command: rg -n "defaultStrategy|from \"./strategies/index.js\"" <chain op index files>
      result: pass
    - check: no_step_or_stage_imports_of_op_strategies_rules
      command: rg -n "ops/.*/(strategies|rules)/|\\./strategies/|\\./rules/" mods/mod-swooper-maps/src/recipes/standard/stages/foundation
      result: pass

command_runs:
  - command: bun run --cwd mods/mod-swooper-maps check
    exit_code: 0
    result: pass
  - command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts
    exit_code: 0
    result: pass
    summary:
      files: 4
      tests: 22
      passed: 22
      failed: 0
  - command: REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    exit_code: 0
    result: pass
```

## Proposed target
- Foundation decomposed tectonics ops keep behavior in explicit strategy modules, while op `index.ts` files remain registration-only.
- Foundation stage/step surfaces remain orchestration boundaries without strategy/rule deep imports.

## Changes landed
- Added explicit strategy modules (`strategies/default.ts`, `strategies/index.ts`) for eight decomposed tectonics chain ops.
- Rewrote the corresponding op `index.ts` files to import and register `defaultStrategy` only.
- Verified no stage/step anti-patterns were introduced and all targeted checks/tests pass.

## Open risks
- `compute-plate-motion` and `compute-tectonic-segments` still keep substantial inline algorithm bodies in `index.ts`; this is intentional (not thin-wrapper), but if full canonical module-shape parity is required later, they can be migrated to strategy modules in a dedicated slice.

## Decision asks
- none

### 2026-02-15 — Foundation helper de-dup regression cleanup (execution worktree)

```yaml
helper_dedup_scope:
  worktree: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails
  branch: codex/prr-m4-s06-test-rewrite-architecture-scans
  objective:
    - remove_locally_recreated_math_helpers_from_decomposed_tectonics_modules
    - route_usage_through_canonical_math_or_shared_utils_only

remediation:
  canonicalization:
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts
      changes:
        - clampByte now delegates to @swooper/mapgen-core/lib/math clampU8 (with legacy edge-case handling preserved)
        - clamp01 now delegates to @swooper/mapgen-core/lib/math clamp01 (with finite guard preserved)
        - clampInt8 now delegates to @swooper/mapgen-core/lib/math clampInt (with legacy edge-case handling preserved)
        - removed local addClampedByte helper
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/rollups.ts
      changes:
        - replaced addClampedByte accumulation calls with clampByte(sum + value) saturation
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts
      changes:
        - removed locally recreated clampByte/clampInt8/normalizeToInt8 helper bodies
        - imported canonical shared helpers from ./shared.js
        - replaced residual hypot2 helper use with Math.hypot
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/shared.ts
      changes:
        - removed addClampedByte re-export

  guardrails:
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/lint/lint-domain-refactor-guardrails.sh
      changes:
        - added foundation rule blocking redefinition of clampByte/addClampedByte/clamp01/clampInt8/normalizeToInt8 inside decomposed tectonics strategy/history-lib modules

verification_runs:
  - command: bun run --cwd mods/mod-swooper-maps check
    exit_code: 0
    result: pass
  - command: REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    exit_code: 0
    result: pass
  - command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts
    exit_code: 0
    result: pass
    summary:
      files: 4
      tests: 24
      passed: 24
      failed: 0
  - command: rg helper redefinition probe across decomposed strategies/history-lib modules
    exit_code: 0
    result: pass
    output: unexpected_helper_definitions=false
```

## Proposed target
- Foundation decomposed tectonics paths consume canonical helper utilities without reauthoring math helpers in strategy/history-lib modules.
- Shared helper behavior remains stable while duplicate local helper bodies are removed.

## Changes landed
- Eliminated duplicate helper bodies from decomposed tectonics history kernels and removed redundant `addClampedByte` helper usage.
- Routed helper logic through canonical `@swooper/mapgen-core` math utilities via foundation shared utilities.
- Added a foundation guardrail lint rule to block reintroduction of these helper redefinitions in decomposed strategy/history-lib modules.

## Open risks
- Other legacy foundation ops outside the decomposed tectonics strategy/history-lib scope still contain older local clamp helpers and were intentionally left untouched in this ownership slice.

## Decision asks
- none

### 2026-02-15 — Foundation hotspot helper dedup second pass

```yaml
second_pass_scope:
  objective:
    - remove_remaining_local_clamp_helper_reimplementations_in_foundation_hotspot_files
    - standardize_on_core_math_or_foundation_shared_tectonics_helpers
  targeted_hotspots:
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts
    - /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/lib/era-tectonics-kernels.ts

changes:
  canonical_import_replacements:
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-motion/index.ts
      updates:
        - removed local clampByte helper declaration
        - switched byte quantization to @swooper/mapgen-core/lib/math clampU8 with finite guard
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts
      updates:
        - removed local clampByte/clampInt8/clamp01/normalizeToInt8/hypot2 helper declarations
        - imported clamp01 from @swooper/mapgen-core/lib/math
        - imported clampByte + normalizeToInt8 from foundation shared tectonics helper module
        - replaced hypot2 call with Math.hypot
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts
      updates:
        - removed local clamp01 helper declaration
        - imported clamp01 from @swooper/mapgen-core/lib/math
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts
      updates:
        - removed local clampByte/clampInt8 helper declarations
        - imported clampByte + clampInt8 from foundation shared tectonics helper module

  guardrail_updates:
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/scripts/lint/lint-domain-refactor-guardrails.sh
      updates:
        - added hotspot-specific scan that fails if clampByte/addClampedByte/clamp01/clampInt8/normalizeToInt8 are redeclared in targeted hotspot op files

post_sweep_state:
  helper_declarations_remaining_in_targeted_files:
    - file: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts
      declaration_status: expected_canonical_foundation_shared_helper_surface
  helper_declarations_removed_from_other_targeted_hotspots: true

verification_runs:
  - command: bun run --cwd mods/mod-swooper-maps check
    exit_code: 0
    result: pass
  - command: REFRACTOR_DOMAINS="foundation" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    exit_code: 0
    result: pass
  - command: bun run --cwd mods/mod-swooper-maps test -- test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/contract-guard.test.ts
    exit_code: 0
    result: pass
    summary:
      files: 4
      tests: 24
      passed: 24
      failed: 0
```

## Proposed target
- Foundation hotspot ops avoid local clamp helper reimplementations and consume canonical core/shared helper utilities.
- `foundation/lib/tectonics/shared.ts` remains the only hotspot-level local adapter surface for byte/int8 normalization semantics.

## Changes landed
- Removed remaining local clamp helper declarations from `compute-plate-motion`, `compute-tectonic-segments`, `compute-plate-graph`, and `compute-plates-tensors/lib/project-plates`.
- Rewired those sites to `@swooper/mapgen-core/lib/math` and foundation shared tectonics helpers.
- Expanded foundation guardrails to detect future helper redeclarations in explicit hotspot files.

## Open risks
- Non-hotspot foundation files outside this targeted sweep may still contain legacy clamp helper declarations and were intentionally left out of this pass.

## Decision asks
- none

### 2026-02-15 — Docs-first gate attestation (group B tectonics ownership)

```yaml
docs_anchor:
  gate: mandatory_docs_first
  status: complete_before_code_edits
  docs_read:
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md
      line_span: "1-383"
      evidence_lines:
        - "24-27"
        - "73"
        - "136-139"
        - "283-287"
        - "312-315"
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/mods/swooper-maps/architecture.md
      line_span: "1-73"
      evidence_lines:
        - "15"
        - "19-20"
        - "56-64"
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/docs/system/libs/mapgen/architecture.md
      line_span: "1-22"
      evidence_lines:
        - "11-18"
  canonical_examples:
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/authoring/stage.ts
      evidence_lines:
        - "89-100"
        - "140-156"
    - path: /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-prr-m4-s05-guardrails/packages/mapgen-core/src/authoring/op/create.ts
      evidence_lines:
        - "27-30"
        - "80-95"
        - "106-115"
  architecture_constraints_applied:
    - steps_call_ops_ops_do_not_call_steps
    - strategies_internal_to_ops_with_stable_contracts
    - rules_internal_to_ops_not_step-callable
    - compile_first_no_runtime_canonicalization_drift
  anti_pattern_attestation:
    no_peer_op_orchestration_inside_op_runtime: true
    no_strategy_imports_from_shared_tectonics_for_group_b_ops: true
```

## Proposed target
- Group B tectonics ops move decomposed tectonics behavior into op-local `rules/` modules, and strategies consume only op-local rules to preserve strict op ownership.

## Changes landed
- Added docs-first + canonical-example architecture attestation for this ownership slice before source edits.

## Open risks
- none

## Decision asks
- none
