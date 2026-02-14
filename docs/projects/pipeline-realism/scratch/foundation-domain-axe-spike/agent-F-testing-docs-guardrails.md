# Agent F — Testing, Docs, and Guardrails

## Axis Ownership
Define enforcement strategy for no-shim/no-legacy cutover using:
- tests,
- lint/guardrails,
- docs updates and canonical references.

## Deliverables
1. Gap inventory in current tests/guardrails for boundary correctness.
2. Proposed test matrix for structural and contract integrity.
3. Proposed docs and lint/guardrail updates to lock architecture.

## Working Notes (append-only)
- 

## Proposed target model
- 

## Breaking-change inventory
- 

## Open risks
- 

## Decision asks for orchestrator
- 

### 2026-02-14 — Agent F guardrail audit (research-only)

#### 1) Audit of current test / validation / lint guardrails (boundary + contract integrity)
- CI currently executes `build`, `lint`, and `test:ci`, but does **not** run `bun run check`, `lint:domain-refactor-guardrails`, or `lint:adapter-boundary` explicitly as required jobs. This means key architecture guardrails are not guaranteed by CI. [evidence: `.github/workflows/ci.yml:50`, `.github/workflows/ci.yml:53`, `.github/workflows/ci.yml:56`, `package.json:9`, `package.json:38`, `package.json:39`]
- `check` includes `lint:domain-refactor-guardrails` + `lint:mapgen-docs`, but still omits `lint:adapter-boundary`; additionally CI never calls `check`. [evidence: `package.json:9`, `package.json:38`, `.github/workflows/ci.yml:53`]
- Domain guardrails default to `boundary` profile, and boundary mode only checks two ops-level patterns (`adapter/context` crossing + `artifact|effect:map` in ops). Stage/contract strict checks are gated behind opt-in `full` profile. [evidence: `scripts/lint/lint-domain-refactor-guardrails.sh:24`, `scripts/lint/lint-domain-refactor-guardrails.sh:236`, `scripts/lint/lint-domain-refactor-guardrails.sh:238`, `scripts/lint/lint-domain-refactor-guardrails.sh:189`, `scripts/lint/lint-domain-refactor-guardrails.sh:336`]
- The stricter anti-shim checks already exist in `full` mode (`domain deep-imports`, `domain tag/artifact shims`, `domain artifacts modules`), but are not mandatory today. [evidence: `scripts/lint/lint-domain-refactor-guardrails.sh:343`, `scripts/lint/lint-domain-refactor-guardrails.sh:348`, `scripts/lint/lint-domain-refactor-guardrails.sh:350`]
- Adapter-boundary lint exists and has allowlist debt, but is not wired into CI and not part of `check`; therefore adapter boundary regressions can pass CI if ESLint does not catch them. [evidence: `scripts/lint/lint-adapter-boundary.sh:24`, `scripts/lint/lint-adapter-boundary.sh:29`, `package.json:9`, `package.json:38`, `.github/workflows/ci.yml:53`]
- Pre-commit hook currently only publishes the resources submodule; it does not enforce architecture checks pre-commit. [evidence: `scripts/git-hooks/pre-commit:4`, `scripts/git-hooks/pre-commit:6`]
- ESLint already enforces meaningful structural boundaries (restricted deep imports, step/runtime restrictions, contract import rules), and **this does run in CI** via `bun run lint`. [evidence: `eslint.config.js:68`, `eslint.config.js:92`, `eslint.config.js:176`, `.github/workflows/ci.yml:53`]
- Existing test guardrails are strong but uneven:
  - `no-shadow-paths` bans dual/shadow/compare surfaces in standard pipeline files. [evidence: `mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:21`, `mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:33`, `mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:50`]
  - foundation contract guard bans multiple legacy surfaces and legacy kinematics symbols. [evidence: `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:69`, `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:81`, `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:97`]
  - map-stamping guard enforces hard physics-vs-map boundary on contracts and adapter calls. [evidence: `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts:24`, `mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts:80`]
  - determinism suite runs canonical foundation gates over repeated runs. [evidence: `mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts:61`, `mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts:69`, `mods/mod-swooper-maps/test/support/foundation-invariants.ts:868`]
- Foundation artifact validators are robust and wired into step artifact publication (`validate:` hooks), but there is limited direct unit-level coverage of validator functions themselves (coverage is mostly integration-driven). [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mantlePotential.ts:11`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:38`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:34`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:31`]
- `docs/system/TESTING.md` is execution-oriented and does not document architecture-cutover guardrail commands or required no-shim checks. [evidence: `docs/system/TESTING.md:7`, `docs/system/TESTING.md:11`, `docs/system/TESTING.md:51`]

#### 2) Charter alignment and policy anchors (no-shim / no-dual-path)
- Target policy is explicit: single-path posture and zero-legacy cutover requirement (no shims / no dual paths). [evidence: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:192`]
- ADR policy also states pure-target architecture excludes compatibility shims/parity guarantees. [evidence: `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md:25`, `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md:26`]
- Foundation SPEC contains a migration note that allows temporary bridges with explicit deletion targets; this is a policy tension vs the stricter no-shim posture and needs orchestrator resolution. [evidence: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md:241`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:193`]
- A/B/C findings indicate likely large structural movement (sentinel dual-path compile branch, op-calls-op, stage split pressure), so enforcement must be topology-resilient and not tied to one file layout only. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:42`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:34`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:77`]

#### 3) Proposed structural audit test scenarios required by spike charter
1. Foundation stage topology lock test (`test/pipeline/foundation-topology.contract-guard.test.ts`)
- Assert canonical foundation step graph (or canonical staged variant after split) is exact: no extra legacy steps, no renamed dual aliases. [evidence basis: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:539`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771`]
- Failure signal: any step id added/removed/aliased without explicit target-model update.

2. No-dual-requires contract scan (`test/pipeline/no-dual-contract-paths.test.ts`)
- Parse all step contracts under standard recipe; fail when a step requires both legacy+target representations for the same semantic (denylist pair registry).
- Failure signal: dual dependency shape exists in one step contract (compat path).

3. No-shim symbol sweep expanded to domain + stage + map config (`test/pipeline/no-shim-surfaces.test.ts`)
- Extend current no-shadow scan beyond `src/recipes/standard` to include `src/domain/foundation`, `src/maps`, and relevant shared runtime folders.
- Include banned list union from existing guardrails (`dual/shadow/compare`, known removed surfaces).
- Failure signal: any shim/dual marker reappears.
- Baseline anchor: current scope is recipe-standard only. [evidence: `mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:33`, `mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:50`]

4. Foundation step boundary scan for adapter/engine access (`test/pipeline/foundation-step-boundary-guard.test.ts`)
- Static scan foundation steps to fail on `context.adapter` usage or direct engine-only readbacks in physics lane.
- Rationale: current domain lint boundary checks target ops root, not step runtime in boundary mode. [evidence: `scripts/lint/lint-domain-refactor-guardrails.sh:237`, `scripts/lint/lint-domain-refactor-guardrails.sh:238`]

5. Full validator unit matrix (`test/foundation/validation-artifacts.contract.test.ts`)
- Unit-test each validator function with one valid payload and focused invalid payload per critical field/length invariant.
- Failure signal: schema/shape regressions escape integration tests.
- Baseline anchor: validator functions are extensive and mostly integration-covered today. [evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:31`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:338`, `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:570`]

6. Legacy surface absence manifest test (`test/pipeline/foundation-legacy-absence.test.ts`)
- Maintain explicit denylist of removed file/module paths + removed symbol imports; fail if reintroduced.
- Failure signal: deleted legacy path/surface returns.

7. Artifact/effect namespace freeze + uniqueness (`test/pipeline/foundation-tag-freeze.test.ts`)
- Snapshot canonical `foundation.*` truth artifacts and map effects, fail on reintroduction of deprecated aliases or duplicate-semantic tag pairs.
- Failure signal: namespace drift or compatibility alias added.
- Baseline anchors: existing tag/effect definitions and contract guards. [evidence: `mods/mod-swooper-maps/src/recipes/standard/tags.ts:28`, `mods/mod-swooper-maps/src/recipes/standard/tags.ts:111`, `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:113`]

8. Structural no-op-calls-op guard for decomposed tectonics (`test/foundation/no-op-calls-op-tectonics.test.ts`)
- Add focused static/AST check on target decomposed ops to ensure op modules do not execute peer op `run(...)`.
- Failure signal: composition logic leaks back into ops.
- Baseline anchor: current violation already observed in `compute-tectonic-history`. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:34`]

#### 4) Proposed docs + lint/guardrail updates to lock target architecture
- `docs/system/TESTING.md`: add an "Architecture Cutover Guardrails" section with mandatory commands and expected CI required checks (not just how to run tests). [evidence: `docs/system/TESTING.md:7`, `docs/system/TESTING.md:51`]
- Add canonical cutover guardrail doc under project scope (recommended): `docs/projects/pipeline-realism/resources/spec/no-shim-cutover-guardrails.md` with:
  - banned surface classes,
  - denylist ownership,
  - required CI job wiring,
  - policy precedence (ADR vs migration notes).
- `scripts/lint/lint-domain-refactor-guardrails.sh`: add a dedicated `cutover` profile (or promote `full` for CI) that includes no-shim and deep-import checks by default for all relevant domains.
- Add new lint script (`scripts/lint/lint-no-shim-cutover.sh`) for direct, deterministic scanning of banned terms/symbols/paths across source roots used by A/B/C changes.
- ESLint hardening: add restricted patterns for relative deep-imports into domain internals from step files (current restrictions are alias-centric and can be bypassed by relative paths). [evidence: `eslint.config.js:73`, `eslint.config.js:123`, `eslint.config.js:185`]

#### 5) Explicit CI definition for enforcing no-shim / no-dual-path
Proposed required CI job: `architecture-cutover-guardrails` (must pass before merge).
- Step 1: `bun run lint` (retain existing ESLint contract/import boundaries). [evidence baseline: `.github/workflows/ci.yml:53`, `eslint.config.js:68`]
- Step 2: `bun run lint:adapter-boundary` (make adapter boundary mandatory in CI). [evidence baseline: `package.json:38`, `scripts/lint/lint-adapter-boundary.sh:46`]
- Step 3: `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`.
- Step 4: run no-shim/no-dual-path tests (existing + new):
  - `no-shadow-paths`, `foundation contract guard`, `map-stamping guard`, topology lock, dual-contract scan, legacy-absence manifest.
- Step 5: `bun run check` or equivalent architecture doc lint gate so docs and guardrails stay synchronized. [evidence baseline: `package.json:9`]
- Enforcement semantics:
  - Any hit in no-shim/dual-path scans is a hard fail.
  - No allowlist bypass without explicit orchestrator-approved deletion ticket.
  - Branch protection marks this CI job as required.

## Proposed target model
- Single-path cutover enforcement model:
  - `policy`: no compatibility shim / no dual-path / no shadow surfaces in runtime contracts or source.
  - `implementation`: combined static lint + structural tests + required CI gate.
  - `governance`: denylist changes require explicit orchestrator decision + deletion date.
- Make CI the source of truth for cutover compliance by requiring:
  1. `lint:adapter-boundary`,
  2. domain guardrails in strict mode (`full` or new `cutover`),
  3. no-shim/no-dual-path test suite,
  4. docs guardrail checks.
- Keep guardrails topology-agnostic so A/B/C structural changes remain enforceable after stage/ops reorganization. [evidence: `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:42`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:34`, `docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:77`]

## Breaking-change inventory
- CI behavior change: PRs that currently pass may fail once adapter-boundary + strict domain guardrails become required.
- Lint behavior change: adding relative deep-import bans and no-shim scans will fail previously tolerated import/symbol patterns.
- Test behavior change: topology lock and legacy-absence manifest will intentionally fail on unapproved structure/surface drift.
- Process change: allowlist-based temporary compat paths become exceptional and tracked; silent compatibility shims become impossible.
- Docs policy change: `docs/system/TESTING.md` and project spec docs become normative for cutover enforcement, not optional guidance.

## Open risks
- False-positive risk from token-based no-shim scans if scope is too broad (especially comments/docs); mitigated by source-root scoping + AST where possible.
- CI duration risk from added structural checks; mitigated by separating fast static scans from heavier runtime tests.
- Policy conflict risk between strict no-shim posture and Foundation SPEC migration note about temporary bridges. [evidence: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md:241`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:193`]
- Governance risk if denylist updates lack ownership/expiry metadata; mitigated by requiring orchestrator-approved change records.

## Decision asks for orchestrator
- Decide policy precedence for this spike: should strict no-shim posture override Foundation SPEC migration-note allowance for temporary bridges? [evidence: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md:241`, `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md:25`]
- Approve CI hardening scope now vs phased:
  1. Immediate: wire `lint:adapter-boundary` + strict domain guardrails + existing no-shadow/contract tests.
  2. Follow-up: add new topology/dual-path/legacy-absence tests.
- Confirm whether to enforce `DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full` or introduce a dedicated `cutover` profile with identical strictness plus no-shim denies.
- Confirm denylist governance model (owner + deletion trigger + expiry) for any temporary exception, or decide zero exceptions.

### 2026-02-14 — Parseability Addendum (YAML)

```yaml
guardrail_audit:
  ci_wiring:
    finding: "CI runs build/lint/test but does not explicitly run check/domain-guardrails/adapter-boundary gates."
    evidence_paths:
      - .github/workflows/ci.yml:50
      - .github/workflows/ci.yml:53
      - .github/workflows/ci.yml:56
      - package.json:9
      - package.json:38
      - package.json:39
  check_script_scope:
    finding: "check includes domain-refactor-guardrails + mapgen-docs, excludes adapter-boundary; CI does not run check."
    evidence_paths:
      - package.json:9
      - package.json:38
      - .github/workflows/ci.yml:53
  domain_guardrails_profile:
    finding: "Default profile is boundary-only; strict anti-shim checks exist only in full profile."
    evidence_paths:
      - scripts/lint/lint-domain-refactor-guardrails.sh:24
      - scripts/lint/lint-domain-refactor-guardrails.sh:236
      - scripts/lint/lint-domain-refactor-guardrails.sh:238
      - scripts/lint/lint-domain-refactor-guardrails.sh:336
      - scripts/lint/lint-domain-refactor-guardrails.sh:343
      - scripts/lint/lint-domain-refactor-guardrails.sh:348
      - scripts/lint/lint-domain-refactor-guardrails.sh:350
  adapter_boundary_gate:
    finding: "Adapter boundary lint exists with allowlist debt and is not mandatory in CI."
    evidence_paths:
      - scripts/lint/lint-adapter-boundary.sh:24
      - scripts/lint/lint-adapter-boundary.sh:29
      - scripts/lint/lint-adapter-boundary.sh:46
      - package.json:38
      - .github/workflows/ci.yml:53
  pre_commit_enforcement:
    finding: "Pre-commit hook only syncs/publishes resources submodule, not architecture guardrails."
    evidence_paths:
      - scripts/git-hooks/pre-commit:4
      - scripts/git-hooks/pre-commit:6
  eslint_boundaries:
    finding: "ESLint enforces substantial import/contract/runtime boundaries and does run in CI lint step."
    evidence_paths:
      - eslint.config.js:68
      - eslint.config.js:92
      - eslint.config.js:176
      - .github/workflows/ci.yml:53
  tests_existing:
    finding: "No-shadow, foundation contract, map-stamping, determinism gates are present and active under mod tests."
    evidence_paths:
      - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:21
      - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:33
      - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:69
      - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:81
      - mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts:24
      - mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts:80
      - mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts:61
      - mods/mod-swooper-maps/test/support/foundation-invariants.ts:868
  validator_binding:
    finding: "Foundation step artifact validators are wired through validate hooks in step artifact implementations."
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mantlePotential.ts:11
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts:38
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts:34
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:31
  testing_doc_gap:
    finding: "Testing doc is execution-oriented and does not define architecture cutover guardrail policy."
    evidence_paths:
      - docs/system/TESTING.md:7
      - docs/system/TESTING.md:11
      - docs/system/TESTING.md:51

policy_anchors:
  no_shim_single_path:
    finding: "Target posture requires single-path and zero-legacy cutover (no shims / no dual paths)."
    evidence_paths:
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:192
  adr_pure_target:
    finding: "ADR disallows compatibility shims/parity constraints in pure-target architecture."
    evidence_paths:
      - docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md:25
      - docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md:26
  policy_tension:
    finding: "Foundation SPEC migration note allows temporary bridges; conflicts with stricter no-shim policy."
    evidence_paths:
      - docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md:241
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:193
  checkpoint_context_ABC:
    finding: "A/B/C report boundary violations and likely major topology/op restructuring."
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:42
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:34
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:77

structural_audit_scenarios:
  - id: foundation_topology_lock
    scope: "mods/mod-swooper-maps/test/pipeline/foundation-topology.contract-guard.test.ts"
    purpose: "Assert canonical foundation step graph (or approved split graph) with no legacy alias steps."
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:539
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts:771
  - id: no_dual_requires_contract_scan
    scope: "mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts"
    purpose: "Fail if a step contract requires dual legacy+target representations for same semantic guarantee."
    evidence_paths:
      - mods/mod-swooper-maps/test/pipeline/map-stamping.contract-guard.test.ts:24
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170
  - id: no_shim_symbol_sweep_expanded
    scope: "mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts"
    purpose: "Extend no-shadow/no-dual scanning to domain+stage+maps roots."
    evidence_paths:
      - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:33
      - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:50
  - id: foundation_step_boundary_scan
    scope: "mods/mod-swooper-maps/test/pipeline/foundation-step-boundary-guard.test.ts"
    purpose: "Fail on adapter/engine access in physics-lane foundation steps."
    evidence_paths:
      - scripts/lint/lint-domain-refactor-guardrails.sh:237
      - scripts/lint/lint-domain-refactor-guardrails.sh:238
  - id: validator_unit_matrix
    scope: "mods/mod-swooper-maps/test/foundation/validation-artifacts.contract.test.ts"
    purpose: "Direct unit coverage for validator functions (valid + focused invalid payloads)."
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:31
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:338
      - mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts:570
  - id: legacy_surface_absence_manifest
    scope: "mods/mod-swooper-maps/test/pipeline/foundation-legacy-absence.test.ts"
    purpose: "Assert deleted legacy modules/symbols do not reappear."
    evidence_paths:
      - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:81
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:192
  - id: namespace_freeze_uniqueness
    scope: "mods/mod-swooper-maps/test/pipeline/foundation-tag-freeze.test.ts"
    purpose: "Freeze canonical artifact/effect namespaces and fail on alias reintroduction."
    evidence_paths:
      - mods/mod-swooper-maps/src/recipes/standard/tags.ts:28
      - mods/mod-swooper-maps/src/recipes/standard/tags.ts:111
      - mods/mod-swooper-maps/test/foundation/contract-guard.test.ts:113
  - id: no_op_calls_op_tectonics
    scope: "mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts"
    purpose: "Prevent op-internal orchestration reintroduction after decomposition."
    evidence_paths:
      - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:34

docs_and_lint_updates:
  docs:
    - target: docs/system/TESTING.md
      update: "Add architecture cutover guardrails section with mandatory no-shim verification commands + required CI checks."
      evidence_paths:
        - docs/system/TESTING.md:7
        - docs/system/TESTING.md:51
    - target: docs/projects/pipeline-realism/resources/spec/no-shim-cutover-guardrails.md
      update: "Canonical denylist ownership, CI contract, and policy precedence notes."
      evidence_paths:
        - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:170
        - docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md:25
  lint:
    - target: scripts/lint/lint-domain-refactor-guardrails.sh
      update: "Promote strict mode in CI (full/cutover profile) across all active domains."
      evidence_paths:
        - scripts/lint/lint-domain-refactor-guardrails.sh:24
        - scripts/lint/lint-domain-refactor-guardrails.sh:336
    - target: scripts/lint/lint-no-shim-cutover.sh
      update: "Add deterministic no-shim/no-dual-path source scan."
      evidence_paths:
        - mods/mod-swooper-maps/test/pipeline/no-shadow-paths.test.ts:21
    - target: eslint.config.js
      update: "Add relative deep-import restrictions into domain internals from steps/contracts."
      evidence_paths:
        - eslint.config.js:73
        - eslint.config.js:123
        - eslint.config.js:185

ci_enforcement_plan:
  required_job: architecture-cutover-guardrails
  required_steps:
    - "bun run lint"
    - "bun run lint:adapter-boundary"
    - "REFRACTOR_DOMAINS=foundation,morphology,hydrology,ecology,placement,narrative DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails"
    - "run no-shim/no-dual-path structural tests (existing + new)"
    - "bun run check (or equivalent docs+guardrails gate)"
  branch_protection:
    required_status_check: true
    allowlist_policy: "No silent allowlists; exceptions require orchestrator-owned deletion target."
  baseline_evidence_paths:
    - .github/workflows/ci.yml:53
    - package.json:9
    - package.json:38
    - package.json:39
```

## Proposed target model
```yaml
summary:
  posture: "single-path, no-shim, no-dual-path cutover"
  enforcement_layers:
    - static_lint
    - structural_tests
    - required_ci_gate
  topology_resilience: "Guardrails must survive A/B/C stage+op restructuring without relaxing invariants."
  evidence_paths:
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-A-boundaries-structure.md:42
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-B-ops-strategies-rules.md:34
    - docs/projects/pipeline-realism/scratch/foundation-domain-axe-spike/agent-C-stage-topology.md:77
```

## Breaking-change inventory
```yaml
breaking_changes:
  - id: ci_gate_strictness
    impact: "Previously passing PRs may fail when adapter-boundary + strict domain guardrails become required."
  - id: lint_rule_hardening
    impact: "Relative deep imports and shim surfaces that are currently tolerated will fail lint/test."
  - id: topology_lock_tests
    impact: "Unapproved stage/step id drift will fail structural tests immediately."
  - id: allowlist_governance
    impact: "Temporary compat exceptions become explicit, owned, and time-bounded."
  - id: docs_normativity
    impact: "Testing docs shift from runbook-only to normative architecture enforcement contract."
```

## Open risks
```yaml
open_risks:
  - id: scan_false_positives
    mitigation: "Scope scans to source roots and prefer AST checks for ambiguous patterns."
  - id: ci_runtime_growth
    mitigation: "Split fast static checks from heavier runtime suites; keep required set lean."
  - id: policy_conflict_bridges_vs_no_shim
    mitigation: "Orchestrator policy precedence decision before enforcement lands."
    evidence_paths:
      - docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md:241
      - docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md:193
  - id: exception_governance_drift
    mitigation: "Require owner+expiry+deletion-trigger metadata for any exception."
```

## Decision asks for orchestrator
```yaml
decision_asks:
  - id: policy_precedence
    ask: "Does strict no-shim policy override temporary-bridge migration note for this spike?"
    evidence_paths:
      - docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md:241
      - docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md:25
  - id: ci_rollout_mode
    ask: "Immediate strict rollout vs phased rollout (existing gates first, then new structural tests)."
  - id: strict_profile_choice
    ask: "Use DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full in CI or create dedicated cutover profile."
  - id: exception_model
    ask: "Allow any temporary exceptions, or enforce zero-exception posture."
```
