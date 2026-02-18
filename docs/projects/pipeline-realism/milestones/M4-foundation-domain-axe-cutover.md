# M4-foundation-domain-axe-cutover: Foundation Domain Axe (Boundaries, Stages, and Lane Cutover)

**Goal:** Execute a no-legacy, decision-complete Foundation architecture cutover with locked 3-stage topology, op boundary decomposition, phased hard lane split, strict guardrails, and config/docs parity.
**Status:** In Progress
**Owner:** pipeline-realism

<!-- Path roots -->
$MOD = mods/mod-swooper-maps
$CORE = packages/mapgen-core
$PROJECT = docs/projects/pipeline-realism
$SPIKE = $PROJECT/resources/research/SPIKE-foundation-domain-axe-2026-02-14.md
$SCRATCH = $PROJECT/scratch/foundation-domain-axe-execution

## Summary

This milestone converts the Foundation spike into implementation-ready slices and issue contracts, then executes the architectural cutover with no compatibility bridges in the end state.

Current stack tip already reflects the architecture-first cutover posture:
1. Standard recipe stage topology is split and locked (see `bun run test:architecture-cutover`).
2. Foundation stage is knobs-only and compile-surface sentinel/dual paths are removed.
3. Strict core guardrails + structural scans are active in CI.

What remains for the “second leg” is primarily the lane split + downstream rewires plus the final tuning/docs parity sweep:
- Hard-cut map-facing projection ownership to `artifact:map.*` with full consumer rewires (M4-004).
- Config redesign + preset retuning + docs/schema parity + legacy token purge (M4-006).

Locked posture:
1. Standard stage topology is mandatory and locked by tests.
2. Lane split is phased by slice, but final state has zero dual paths.
3. Dead/inert knobs are removed now.
4. Guardrails become strict early.
5. Structure lands before preset retuning.

## Anchor Pass Update (2026-02-15)

```yaml
anchor_pass_2026_02_15:
  finding_clusters:
    - id: ANCHOR-F001
      status: resolved
      summary: test suites rewired off disabled compute-tectonic-history mega-op
    - id: ANCHOR-F002
      status: resolved
      summary: issue docs + tests now reflect the locked Standard stage topology (landed; enforced by architecture cutover scans)
    - id: ANCHOR-F003
      status: accepted_for_S07
      summary: lane split remains explicitly gated to S07 to avoid out-of-order churn
    - id: ANCHOR-F004
      status: resolved
      summary: foundation domain reference updated to current ops catalog
    - id: ANCHOR-F005
      status: kept_temporarily
      summary: disabled legacy op stub retained as migration guard; delete after consumer migration stabilizes
  verification:
    - bun run --cwd mods/mod-swooper-maps check
    - bun run --cwd mods/mod-swooper-maps lint
    - REFRACTOR_DOMAINS=\"foundation\" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails
    - bun run --cwd mods/mod-swooper-maps test -- test/foundation/contract-guard.test.ts test/foundation/no-op-calls-op-tectonics.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/tile-projection-materials.test.ts test/m11-config-knobs-and-presets.test.ts test/standard-recipe.test.ts test/standard-compile-errors.test.ts
```

Canonical reference:
- Spike decision source: `$SPIKE`
- Scratch orchestration source: `$SCRATCH/master-scratch.md`

## Locked Directives (Non-Negotiable)

1. No compatibility shims/bridges in final merged state.
2. Steps orchestrate; ops do not orchestrate peer ops.
3. Stage compile is single-path (no sentinel fallback branches).
4. Map-facing projection leaves Foundation by lane-cutover slice.
5. Config surfaces must be truthful: no dead/inert fields.
6. Docs/comments/schema descriptions must match final contracts.

## Objectives

1. Deliver decision-complete M4 issue pack from spike findings.
2. Remove core Foundation boundary violations (op sizing, op-calls-op, step leaks).
3. Apply locked 3-stage topology and compile-surface cleanup.
4. Hard-cut projection lane ownership to `artifact:map.*` with full downstream rewires.
5. Enforce architecture with strict CI gates and structural scans.
6. Retune map configs by intent (including earth-like) and finalize docs parity.

## Scope

### In Scope
- Foundation stage/step/op/contract restructuring and split.
- Morphology downstream rewires required by lane split.
- CI, lint, and structural architecture tests for no-legacy guarantees.
- Config model cleanup + grouped author knobs + preset retuning.
- Docs sync: milestone, issue docs, spec docs, schema descriptions, inline comments.

### Out of Scope
- New gameplay features unrelated to Foundation boundary cutover.
- Non-required algorithmic innovation outside locked architecture/tuning work.
- Temporary compatibility aliases.

## Acceptance Criteria

### Tier 1 (Must Pass)
- [ ] M4 milestone doc and local issue pack are decision-complete and dependency-linked.
- [ ] Foundation op/step/stage contracts match locked boundaries and 3-stage topology.
- [ ] Lane split to `artifact:map.*` is complete with no dual publish.
- [ ] Strict core guardrails are active and required in CI.
- [ ] No legacy/shadow/dual paths remain in affected surfaces.

### Tier 2 (Strongly Expected)
- [ ] Presets/defaults are retuned and validated by map intent.
- [ ] Viz/tracing identity changes are explicit and verified.
- [ ] Docs/comments/schema descriptions reflect final cutover state.

## Workflow Sequence (Milestone Discipline)

1. Draft M4 milestone from spike outputs.
2. Harden parent issues to decision-complete.
3. Break out local issue docs.
4. Sweep unresolved prework prompts into findings.
5. Lock milestone as index; issue docs as implementation source.

## Issues (Canonical Checklist)

```yaml
issues:
  - id: LOCAL-TBD-PR-M4-001
    title: planning + contract freeze
    status: landed
    blocked_by: []
  - id: LOCAL-TBD-PR-M4-002
    title: foundation ops boundaries
    status: landed
    blocked_by: [LOCAL-TBD-PR-M4-001]
  - id: LOCAL-TBD-PR-M4-003
    title: stage topology + compile surface
    status: landed
    blocked_by: [LOCAL-TBD-PR-M4-002]
  - id: LOCAL-TBD-PR-M4-004
    title: lane split + downstream rewire
    status: planned
    blocked_by: [LOCAL-TBD-PR-M4-003, LOCAL-TBD-PR-M4-005]
  - id: LOCAL-TBD-PR-M4-005
    title: guardrails + test rewrite
    status: landed
    blocked_by: [LOCAL-TBD-PR-M4-001]
  - id: LOCAL-TBD-PR-M4-007
    title: earthlike studio typegen + preset schema fix
    status: landed
    blocked_by: []
  - id: LOCAL-TBD-PR-M4-006
    title: config redesign + preset retuning + docs cleanup
    status: planned
    blocked_by: [LOCAL-TBD-PR-M4-004, LOCAL-TBD-PR-M4-005]
```

- [ ] [`LOCAL-TBD-PR-M4-001`](../issues/LOCAL-TBD-PR-M4-001-planning-contract-freeze.md) Planning + Contract Freeze
- [ ] [`LOCAL-TBD-PR-M4-002`](../issues/LOCAL-TBD-PR-M4-002-foundation-ops-boundaries.md) Foundation Ops Boundaries
- [ ] [`LOCAL-TBD-PR-M4-003`](../issues/LOCAL-TBD-PR-M4-003-stage-topology-compile-surface.md) Stage Topology + Compile Surface
- [ ] [`LOCAL-TBD-PR-M4-004`](../issues/LOCAL-TBD-PR-M4-004-lane-split-downstream-rewire.md) Lane Split + Downstream Rewire
- [ ] [`LOCAL-TBD-PR-M4-005`](../issues/LOCAL-TBD-PR-M4-005-guardrails-test-rewrite.md) Guardrails + Test Rewrite
- [ ] [`LOCAL-TBD-PR-M4-006`](../issues/LOCAL-TBD-PR-M4-006-config-redesign-preset-retuning-docs-cleanup.md) Config Redesign + Preset Retuning + Docs Cleanup
- [ ] [`LOCAL-TBD-PR-M4-007`](../issues/LOCAL-TBD-PR-M4-007-earthlike-studio-typegen-fix.md) Earthlike Studio Typegen + Preset Schema Fix

## Sequencing & Parallelization Plan

### Stacks Overview

```yaml
stacks:
  - stack: A
    slices:
      - S00: codex/prr-m4-s00-plan-scratch-pack
      - S01: codex/prr-m4-s01-harden-milestone-breakout-issues
    issues:
      - LOCAL-TBD-PR-M4-001
  - stack: B
    slices:
      - S02: codex/prr-m4-s02-contract-freeze-dead-knobs
      - S03: codex/prr-m4-s03-tectonics-op-decomposition
      - S06a: codex/prr-m4-s06a-foundation-knobs-surface
    issues:
      - LOCAL-TBD-PR-M4-002
      - LOCAL-TBD-PR-M4-003
  - stack: C
    slices:
      - S05: codex/prr-m4-s05-ci-strict-core-gates
      - S06: codex/prr-m4-s06-test-rewrite-architecture-scans
    issues:
      - LOCAL-TBD-PR-M4-005
  - stack: D
    slices:
      - S07: codex/prr-m4-s07-lane-split-map-artifacts-rewire
    issues:
      - LOCAL-TBD-PR-M4-004
  - stack: E
    slices:
      - S08: codex/prr-m4-s08-config-redesign-preset-retune
      - S09: codex/prr-m4-s09-docs-comments-schema-legacy-purge
    issues:
      - LOCAL-TBD-PR-M4-006
```

### Gate Mapping

```yaml
gates_by_slice:
  S00_S01: [planning_artifacts_complete]
  S02_S04: [G0]
  S05_S06: [G1, G2]
  S07: [G3]
  S08: [G4]
  S09: [G5]
```

### Tier-2 Ownership Mapping

```yaml
tier2_ownership:
  viz_tracing_identity_explicit_and_verified:
    owner_issue: LOCAL-TBD-PR-M4-003
    enforced_by:
      - stage_split_manifest_churn_checks
      - semantic_viz_key_stability_checks
      - focused_viz_and_tracing_tests
  presets_retuned_and_docs_schema_parity:
    owner_issue: LOCAL-TBD-PR-M4-006
    enforced_by:
      - earthlike_intent_measurable_checks
      - docs_system_and_project_legacy_token_scans
      - schema_and_preset_validation_tests
```

### Verification Commands

- `bun run build`
- `bun run lint`
- `bun run test:ci`
- `bun run lint:adapter-boundary`
- `REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full bun run lint:domain-refactor-guardrails`
- `bun run check`
- `bun run --cwd packages/mapgen-viz build`
- `bun run --cwd apps/mapgen-studio build`
- `bun run --cwd mods/mod-swooper-maps test test/pipeline/viz-emissions.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/morphology/tracing-observability-smoke.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/morphology/earthlike-coasts-smoke.test.ts`
- `bun run --cwd mods/mod-swooper-maps test test/ecology/earthlike-balance-smoke.test.ts`
- `bun run lint:mapgen-docs`

## Prework Sweep Status

```yaml
prework_status:
  unresolved_prompts: 0
  posture: all_planning_unknowns_must_be_converted_to_findings_or_explicit_decisions_before_S02
  tracker: $SCRATCH/master-scratch.md
```

## Risks

1. Stage-id/full-step-id churn can break diagnostics and snapshots unexpectedly.
2. Lane split can widen blast radius across morphology/visualization/tracing.
3. Strict guardrails may fail large pre-existing surfaces and slow early slices.
4. Preset retuning can accidentally become algorithm churn without strict scope controls.

## Notes

- This milestone is the canonical source for M4 sequencing and dependencies.
- Issue docs are canonical for implementation detail and acceptance checks.

## Full-stack review traceability
- Full-stack review ledger: `docs/projects/pipeline-realism/reviews/REVIEW-M4-full-stack-chain.md`
- Carried loop plan: `docs/projects/pipeline-realism/scratch/dev-loop-review/M4-full-stack-review-loop-plan.md`
