# M2-ecology-architecture-alignment: Compute Substrate + Atomic Feature Ops (Behavior-Preserving)

**Goal:** Refactor the Ecology domain to align with the target MapGen architecture (ops/modules, steps/stages, rules, compiler-owned op binding) with **maximal modularity** while preserving behavior/output.  
**Status:** Planned  
**Owner:** pipeline-realism  

<!-- Path roots -->
$MOD = mods/mod-swooper-maps
$CORE = packages/mapgen-core
$VIZ = packages/mapgen-viz
$ADAPTER = packages/civ7-adapter
$SPIKE = docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment

## Summary

This milestone is the behavior-preserving architecture alignment of Ecology:
- **Atomic per-feature ops**: no multi-feature “mega-ops” for planning or placement.
- **Compute substrate model**: shared compute ops produce reusable layers; plan ops consume them to emit discrete intents/placements.
- **Steps orchestrate** (and own side effects), **ops do not orchestrate**.
- **Rules posture**: behavior policy lives in `rules/**` imported by ops; steps never import rules.
- **Maximal modularity**: we pursue the ideal modular structure and recover performance later via substrate reuse/caching.

Paper trail (canonical spike + feasibility package):
- `../../engine-refactor-v1/resources/spike/ecology-arch-alignment/README.md`
- `../../engine-refactor-v1/resources/spike/ecology-arch-alignment/FEASIBILITY.md` (verdict + locked caveats)
- `../../engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACT-MATRIX.md` (steps ↔ ops ↔ artifacts ↔ viz ↔ RNG)
- `../../engine-refactor-v1/resources/spike/ecology-arch-alignment/DECISIONS/README.md` (locked decisions)
- Implementation handoff (runbook): `../resources/runbooks/HANDOFF-M2-ECOLOGY-IMPLEMENTATION.md`

This milestone is **refactor-only**:
- no algorithm changes
- no tuning
- no new gameplay outcomes

## Locked Directives (Non-Negotiable)

These resolve ambiguity; do not open new decision packets for them.

- **Atomic per-feature ops** (no multi-feature mega-ops).
- **Compute substrate model**: compute ops produce reusable layers; plan ops consume them.
- **Maximal modularity**: design the maximal ideal; handle performance later via substrate/caching.
- **Rules posture**: policies live in `rules/**` imported by ops; steps never import rules.
- **Shared libs posture**: generic helpers belong in shared core MapGen SDK libs; search there first.
- **Narsil posture**: do not reindex; use native tools when indexing is incomplete.
- **Docs posture**: prioritize canonical specs/policies/guidelines; ADRs older than ~10 days are non-authoritative.

## Objectives

1. Eliminate step-level bypasses of the architecture:
   - `features-plan` must not import `@mapgen/domain/ecology/ops` implementations.
   - op envelope defaults + normalize must be compiler-owned via `contract.ops`.
2. Split all multi-feature ecology feature planners into atomic per-feature ops.
3. Introduce shared compute substrate ops for reuse across per-feature plan ops.
4. Preserve truth vs projection:
   - `ecology` stage remains truth-only.
   - `map-ecology` remains gameplay/materialization.
5. Preserve compatibility surfaces (ids, viz keys, determinism labels) and prove parity.

## Scope

### In Scope

- Ecology domain + standard recipe wiring changes required to reach the locked target architecture:
  - split multi-feature feature planners into atomic per-feature plan ops
  - introduce shared compute substrate ops for reuse
  - `features-plan` compile/binding seam (curated public schema + compile translation + injected ops only)
- Guardrails and gates that make “no behavior change” enforceable:
  - import bans
  - deterministic dump/diff harness usage
  - stable `dataTypeKey` inventory + diff gate
- Additive contract clarification that does not change outputs:
  - `plot-effects` effect tag addition per decision packet (mod-owned, unverified acceptable)
- Documentation updates required to keep canonical references accurate:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`

### Out of Scope

- Algorithm changes / tuning (threshold changes, new heuristics, new features).
- Step/stage topology changes (no new ecology steps or new stages; ids remain stable).
- Performance optimization beyond keeping the system usable (perf work is explicitly deferred to substrate/caching iteration later).
- Adapter-owned verification for `plotEffectsApplied` (we add a mod-owned tag; adapter verification can be a later milestone if needed).

## Acceptance Criteria

### Tier 1 (Must Pass)

**Behavior preservation / parity:**
- [ ] Baseline gates pass (build order + ecology tests):
  - `bun run --cwd packages/civ7-adapter build`
  - `bun run --cwd packages/mapgen-viz build`
  - `bun run --cwd packages/mapgen-core build`
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- [ ] Deterministic parity run exists and is green:
  - a fixed-seed dump can be re-run before/after refactor and `diag:diff` shows no diffs for ecology-owned layers.

**Architecture alignment:**
- [ ] No step runtime code imports `@mapgen/domain/ecology/ops` implementations.
- [ ] No step runtime code imports `rules/**`.
- [ ] `features-plan` advanced planners (`vegetatedFeaturePlacements`, `wetFeaturePlacements`) are modeled per the locked decision:
  - public config keys preserved
  - compile-time translation to internal per-feature op envelopes
  - compiler prefill defaults cannot accidentally turn features “always on”

**Atomic per-feature ops (no mega-ops):**
- [ ] The following multi-feature ops are removed from the runtime path (or replaced by atomic per-feature ops with equivalent behavior):
  - `ecology/features/plan-vegetation` (multi-feature choice)
  - `ecology/features/vegetated-placement`
  - `ecology/features/wet-placement`
  - `ecology/features/aquatic-placement`
  - `ecology/features/vegetation-embellishments`
  - `ecology/features/reef-embellishments`

**Compatibility surfaces preserved:**
- [ ] Stage ids and step ids preserved:
  - `ecology`: `pedology`, `resource-basins`, `biomes`, `biome-edge-refine`, `features-plan`
  - `map-ecology`: `plot-biomes`, `features-apply`, `plot-effects`
- [ ] Artifact ids preserved:
  - `artifact:ecology.soils`, `artifact:ecology.resourceBasins`, `artifact:ecology.biomeClassification`, `artifact:ecology.featureIntents`
- [ ] `artifact:ecology.biomeClassification` mutability posture preserved (publish-once mutable handle refined in-place).
- [ ] DeckGL/Studio viz keys preserved (`dataTypeKey`, `spaceId`, kinds) for ecology and map-ecology emissions.

**Explicit adapter-write boundary:**
- [ ] `plot-effects` provides a mod-owned effect tag `effect:engine.plotEffectsApplied` (unverified is acceptable) per locked decision.

### Tier 2 (Strongly Expected)

- [ ] Guardrails exist to prevent regressions:
  - import bans (steps → domain ops implementations, steps → rules)
  - “op binding must be declared in `contract.ops`” checks (or tests that make bypasses obvious)
- [ ] The ecology op contract test suite (`$MOD/test/ecology/op-contracts.test.ts`) is updated to cover the new atomic ops and compute substrate surfaces.
- [ ] Canonical reference docs are updated to match the new ops catalog:
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`

## Compatibility Surfaces (Must Not Break)

These are the “no behavior change” surfaces we treat as contracts:

- **Ids:** stage ids, step ids, artifact ids.
- **Determinism labels:** `deriveStepSeed(..., "ecology:planFeatureIntents")`, `deriveStepSeed(..., "ecology:planPlotEffects")`, and any `createLabelRng` label strings inside ops.
  - See: `$CORE/src/lib/rng/label.ts`
- **Viz identity:** `dataTypeKey`, `spaceId`, and the layer taxonomy described in:
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- **Config entrypoints:** existing preset/config keys for ecology stages must continue to work (or be migrated with explicit, gated cutover).

## Gates

The milestone must explicitly gate intermediate states so we never “think it’s behavior-preserving” without proof.

### Gate G0: Baseline build + tests (must always be green)

```bash
bun run --cwd packages/civ7-adapter build
bun run --cwd packages/mapgen-viz build
bun run --cwd packages/mapgen-core build
bun --cwd mods/mod-swooper-maps test test/ecology
```

Expected:
- build succeeds in each workspace
- ecology tests are green

### Gate G1: No step deep-imports of domain ops implementations

```bash
rg -n "from \"@mapgen/domain/ecology/ops\"" \
  mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps \
  mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps
```

Expected:
- zero matches

### Gate G2: No step imports of rules

```bash
rg -n "rules/" \
  mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps \
  mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps
```

Expected:
- zero matches

### Gate G3: Deterministic dump + diff harness (parity)

Use existing diagnostics tooling (do not commit large outputs):

```bash
bun --cwd mods/mod-swooper-maps run diag:dump -- 106 66 1337 --label ecology-parity
# re-run after changes, then:
bun --cwd mods/mod-swooper-maps run diag:diff -- <baselineRunDir> <candidateRunDir>
```

Expected:
- no diffs for ecology-owned layers and viz keys (unless the milestone explicitly includes a migration table + updated baseline).

### Gate G4: Viz key inventory is stable

We require an explicit, diffable inventory of ecology `dataTypeKey`s.

Implementation posture:
- capture a baseline `dataTypeKey` inventory from `diag:list` output
- diff the inventories before/after refactor

This gate is owned by `LOCAL-TBD-PR-M2-001` and must be runnable in CI (or at least as a deterministic local check).

## Upstream Compatibility (Pipeline-Realism Stack Tip)

We must not mis-specify Ecology inputs due to Foundation/Morphology drift.

Grounded comparison (committed diffs):
- Ecology plan base: `15ea01ba01a56a85a4fecd384dd7860eea0582e2`
- Pipeline-realism tip (at time of writing): `agent-GOBI-PRR-s124-viz-mountains-regression-guard` (`910d122210be4799f211816eff68e0460f763f9f`)

Observed delta:
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology/artifacts.ts` adds fields to the *beltDrivers* schema (collision/subduction potentials + age proxies).
- Ecology depends on `artifact:morphology.topography` (not belt drivers), so this delta does not change Ecology’s required inputs.

Prework prompt:
- Re-run the compatibility diff against the then-current stack tip immediately before execution begins.

## Issues (Canonical Checklist)

These issues are the canonical milestone checklist.

```yaml
issues:
  - id: LOCAL-TBD-PR-M2-001
    title: "Preflight: parity baselines + viz-key inventory gate"
    status: planned
  - id: LOCAL-TBD-PR-M2-002
    title: "Contract freeze: compatibility ledger + enforcement tests"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-001]
  - id: LOCAL-TBD-PR-M2-003
    title: "Guardrails: ban step deep-imports (ops impls, rules)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-002]
  - id: LOCAL-TBD-PR-M2-004
    title: "Compiler-owned op binding: curated public schema + compile translation (features-plan seam)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-002]
  - id: LOCAL-TBD-PR-M2-005
    title: "Compute substrate scaffolding: ecology feature substrate ops (shared layers)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-004]
  - id: LOCAL-TBD-PR-M2-006
    title: "Biomes modularization: compute layers -> classify/assemble (artifact shape preserved)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-002]
  - id: LOCAL-TBD-PR-M2-007
    title: "Vegetation: split multi-feature planners into atomic per-feature ops (behavior-preserving)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-004, LOCAL-TBD-PR-M2-005]
  - id: LOCAL-TBD-PR-M2-008
    title: "Wet features: split wet-placement mega-op into atomic per-feature ops (ordering + RNG preserved)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-004, LOCAL-TBD-PR-M2-005]
  - id: LOCAL-TBD-PR-M2-009
    title: "Aquatic features: split aquatic-placement mega-op into atomic per-feature ops"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-005]
  - id: LOCAL-TBD-PR-M2-010
    title: "Embellishments: split multi-feature embellishment ops into atomic per-feature ops"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-005]
  - id: LOCAL-TBD-PR-M2-011
    title: "features-plan cutover: remove direct op imports; orchestrate atomic ops; preserve outputs + viz"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-007, LOCAL-TBD-PR-M2-008]
  - id: LOCAL-TBD-PR-M2-012
    title: "BiomeClassification mutability: codify publish-once mutable handle posture + gates"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-002]
  - id: LOCAL-TBD-PR-M2-013
    title: "plot-effects: add explicit effect tag (effect:engine.plotEffectsApplied)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-002]
  - id: LOCAL-TBD-PR-M2-014
    title: "DeckGL/Studio compatibility: enforce stable ecology dataTypeKeys + spaceIds"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-001]
  - id: LOCAL-TBD-PR-M2-015
    title: "Cleanup: delete legacy mega-op runtime paths + remove transitional shims (no legacy left)"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-011]
  - id: LOCAL-TBD-PR-M2-016
    title: "Docs: update ECOLOGY reference + workflow pointers to match new ops catalog"
    status: planned
    blocked_by: [LOCAL-TBD-PR-M2-015]
```

## Sequencing & Parallelization Plan (Prepare -> Cutover -> Cleanup)

```yaml
steps:
  - slice: 1
    mode: sequential
    units: [LOCAL-TBD-PR-M2-001]
    description: Establish parity baselines and a stable viz-key inventory gate.
  - slice: 2
    mode: sequential
    after: [1]
    units: [LOCAL-TBD-PR-M2-002, LOCAL-TBD-PR-M2-003, LOCAL-TBD-PR-M2-004]
    description: Freeze compatibility surfaces, add guardrails, and lock compiler-owned op binding/translation.
  - slice: 3
    mode: parallel
    after: [2]
    units: [LOCAL-TBD-PR-M2-005, LOCAL-TBD-PR-M2-006]
    description: Build compute substrate scaffolding and modularize biomes computation.
  - slice: 4
    mode: parallel
    after: [3]
    units: [LOCAL-TBD-PR-M2-007, LOCAL-TBD-PR-M2-008, LOCAL-TBD-PR-M2-009, LOCAL-TBD-PR-M2-010]
    description: Split mega-ops into atomic per-feature ops across vegetation/wet/aquatic/embellishments.
  - slice: 5
    mode: sequential
    after: [4]
    units: [LOCAL-TBD-PR-M2-011, LOCAL-TBD-PR-M2-012, LOCAL-TBD-PR-M2-013, LOCAL-TBD-PR-M2-014]
    description: Cut over features-plan + gameplay boundaries, codify mutability and effect tags, enforce viz invariants.
  - slice: 6
    mode: sequential
    after: [5]
    units: [LOCAL-TBD-PR-M2-015, LOCAL-TBD-PR-M2-016]
    description: Remove transitional shims and update canonical reference docs.
```

## Issue Docs

This milestone doc is now an index. Full issue detail lives in the local issue docs:

- `LOCAL-TBD-PR-M2-001`: [Preflight: parity baselines + viz-key inventory gate](../issues/LOCAL-TBD-PR-M2-001-preflight-parity-baselines-viz-key-inventory-gate.md)
- `LOCAL-TBD-PR-M2-002`: [Contract freeze: compatibility ledger + enforcement tests](../issues/LOCAL-TBD-PR-M2-002-contract-freeze-compatibility-ledger-enforcement-tests.md)
- `LOCAL-TBD-PR-M2-003`: [Guardrails: ban step deep-imports (ops impls, rules)](../issues/LOCAL-TBD-PR-M2-003-guardrails-ban-step-deep-imports-ops-impls-rules.md)
- `LOCAL-TBD-PR-M2-004`: [Compiler-owned op binding: curated public schema + compile translation (features-plan seam)](../issues/LOCAL-TBD-PR-M2-004-compiler-owned-op-binding-curated-public-schema-compile-translation-features-plan-seam.md)
- `LOCAL-TBD-PR-M2-005`: [Compute substrate scaffolding: ecology feature substrate ops (shared layers)](../issues/LOCAL-TBD-PR-M2-005-compute-substrate-scaffolding-ecology-feature-substrate-ops-shared-layers.md)
- `LOCAL-TBD-PR-M2-006`: [Biomes modularization: compute layers -> classify/assemble (artifact shape preserved)](../issues/LOCAL-TBD-PR-M2-006-biomes-modularization-compute-layers-classify-assemble-artifact-shape-preserved.md)
- `LOCAL-TBD-PR-M2-007`: [Vegetation: split multi-feature planners into atomic per-feature ops (behavior-preserving)](../issues/LOCAL-TBD-PR-M2-007-vegetation-split-multi-feature-planners-into-atomic-per-feature-ops-behavior-preserving.md)
- `LOCAL-TBD-PR-M2-008`: [Wet features: split wet-placement mega-op into atomic per-feature ops (ordering + RNG preserved)](../issues/LOCAL-TBD-PR-M2-008-wet-features-split-wet-placement-mega-op-into-atomic-per-feature-ops-ordering-rng-preserved.md)
- `LOCAL-TBD-PR-M2-009`: [Aquatic features: split aquatic-placement mega-op into atomic per-feature ops](../issues/LOCAL-TBD-PR-M2-009-aquatic-features-split-aquatic-placement-mega-op-into-atomic-per-feature-ops.md)
- `LOCAL-TBD-PR-M2-010`: [Embellishments: split multi-feature embellishment ops into atomic per-feature ops](../issues/LOCAL-TBD-PR-M2-010-embellishments-split-multi-feature-embellishment-ops-into-atomic-per-feature-ops.md)
- `LOCAL-TBD-PR-M2-011`: [features-plan cutover: remove direct op imports; orchestrate atomic ops; preserve outputs + viz](../issues/LOCAL-TBD-PR-M2-011-features-plan-cutover-remove-direct-op-imports-orchestrate-atomic-ops-preserve-outputs-viz.md)
- `LOCAL-TBD-PR-M2-012`: [BiomeClassification mutability: codify publish-once mutable handle posture + gates](../issues/LOCAL-TBD-PR-M2-012-biomeclassification-mutability-codify-publish-once-mutable-handle-posture-gates.md)
- `LOCAL-TBD-PR-M2-013`: [plot-effects: add explicit effect tag (effect:engine.plotEffectsApplied)](../issues/LOCAL-TBD-PR-M2-013-plot-effects-add-explicit-effect-tag-effect-engine-ploteffectsapplied.md)
- `LOCAL-TBD-PR-M2-014`: [DeckGL/Studio compatibility: enforce stable ecology dataTypeKeys + spaceIds](../issues/LOCAL-TBD-PR-M2-014-deckgl-studio-compatibility-enforce-stable-ecology-datatypekeys-spaceids.md)
- `LOCAL-TBD-PR-M2-015`: [Cleanup: delete legacy mega-op runtime paths + remove transitional shims (no legacy left)](../issues/LOCAL-TBD-PR-M2-015-cleanup-delete-legacy-mega-op-runtime-paths-remove-transitional-shims-no-legacy-left.md)
- `LOCAL-TBD-PR-M2-016`: [Docs: update ECOLOGY reference + workflow pointers to match new ops catalog](../issues/LOCAL-TBD-PR-M2-016-docs-update-ecology-reference-workflow-pointers-to-match-new-ops-catalog.md)


## Coverage Table (Spike/Decisions -> Issues)

| Source | Owner issue(s) |
|---|---|
| `$SPIKE/FEASIBILITY.md` | `LOCAL-TBD-PR-M2-001..016` |
| `DECISION-features-plan-advanced-planners` | `LOCAL-TBD-PR-M2-004`, `LOCAL-TBD-PR-M2-011` |
| `DECISION-step-topology` | `LOCAL-TBD-PR-M2-004` (topology stable; modularize via ops) |
| `DECISION-biomeclassification-mutability` | `LOCAL-TBD-PR-M2-012` |
| `DECISION-plot-effects-effect-tag` | `LOCAL-TBD-PR-M2-013` |
| `DECISION-map-ecology-split` | `LOCAL-TBD-PR-M2-013` (keep topology; tag boundary) |

## Suggested Graphite Stacks (How We Land It Reviewably)

**Stack A — Gates + guardrails (must land first)**
- `LOCAL-TBD-PR-M2-001` → `002` → `003` → `014`

**Stack B — Compiler binding seam**
- `LOCAL-TBD-PR-M2-004`

**Stack C — Substrate + biomes modularization**
- `LOCAL-TBD-PR-M2-005` → `006`

**Stack D — Feature planners (atomic ops) + features-plan cutover**
- `LOCAL-TBD-PR-M2-007` → `008` → `011`

**Stack E — Secondary planners (aquatic + embellishments)**
- `LOCAL-TBD-PR-M2-009` → `010`

**Stack F — Gameplay boundary + cleanup + docs**
- `LOCAL-TBD-PR-M2-012` → `013` → `015` → `016`

## Risks

- **RNG drift due to refactor ordering:** `createLabelRng` is per-label LCG; order within each label matters.
  - Mitigation: preserve label strings and the per-label call ordering; enforce parity dumps.
- **Compiler prefill footgun turns optional planners on:** declaring ops in `contract.ops` causes defaults to exist.
  - Mitigation: `StepOpUse.defaultStrategy = "disabled"` for internal per-feature ops.
- **Viz regressions due to key churn:** Studio grouping depends on `dataTypeKey`/`spaceId`.
  - Mitigation: explicit viz inventory gate.

## Open Questions (Minimized; Convert To Prework If Needed)

None required beyond the embedded prework prompts.
