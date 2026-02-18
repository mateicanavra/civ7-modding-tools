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
