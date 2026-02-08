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

## Issue Details (Hardened)

### LOCAL-TBD-PR-M2-001: Preflight: parity baselines + viz-key inventory gate

Establish the deterministic parity posture that this milestone will use to prove “no behavior change.”

**Acceptance Criteria**
- [ ] Gate G0 is green (build+tests).
- [ ] A fixed-seed ecology dump can be produced via `diag:dump` and inspected via `diag:list`.
- [ ] A baseline ecology `dataTypeKey` inventory is produced as a deterministic artifact (small text/JSON) suitable for diffing.

**Scope boundaries**
- In scope: diagnostics harness plumbing needed to make a stable inventory + diff gate.
- Out of scope: changing any domain behavior.

**Verification**
- Run Gate G0.
- Run Gate G3.
- Run Gate G4.

**Implementation guidance**
- Complexity: medium (tooling + determinism).

```yaml
files:
  - path: $MOD/src/dev/diagnostics/list-layers.ts
    notes: Confirm it can emit a stable machine-readable inventory (or add a small helper).
  - path: $MOD/src/dev/diagnostics/diff-layers.ts
    notes: Ensure ecology-owned layers are included and diffs are readable.
  - path: $MOD/src/dev/diagnostics/run-standard-dump.ts
    notes: Confirm stable labeling and output paths.
  - path: $SPIKE/HARDENING.md
    notes: Keep this doc aligned; it is the parity guide.
```

**Paper trail**
- `$SPIKE/HARDENING.md`
- `$SPIKE/DECKGL-VIZ.md`

**Prework Prompt (Agent Brief)**
- Identify the minimal stable “viz key inventory” format we can diff in CI.
- Expected output: a file format choice + exact command(s) to generate it.

---

### LOCAL-TBD-PR-M2-002: Contract freeze: compatibility ledger + enforcement tests

Lock what we promise not to change, and make it mechanically checkable.

**Acceptance Criteria**
- [ ] A compatibility ledger exists (ids, viz keys, RNG labels) and is referenced by tests.
- [ ] At least one test fails loudly if:
  - step ids change
  - artifact ids change
  - ecology `dataTypeKey` emissions disappear/rename

**Scope boundaries**
- In scope: tests/fixtures that encode the compatibility surfaces.
- Out of scope: refactor work.

**Verification**
- Run Gate G0.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $SPIKE/CONTRACT-MATRIX.md
    notes: Source of truth for what surfaces must remain stable.
  - path: $MOD/test/ecology/*.test.ts
    notes: Add/extend tests that enforce the ledger.
```

**Paper trail**
- `$SPIKE/CONTRACT-MATRIX.md`
- `$SPIKE/FEASIBILITY.md`

---

### LOCAL-TBD-PR-M2-003: Guardrails: ban step deep-imports (ops impls, rules)

Prevent regressions where steps bypass op binding/normalization or import behavior policy.

**Acceptance Criteria**
- [ ] Gate G1 and Gate G2 are enforced (CI or deterministic local check).
- [ ] `features-plan` no longer contains manual `normalize` calls to domain ops.

**Scope boundaries**
- In scope: guard scripts, lint rules, or tests.
- Out of scope: refactor work.

**Verification**
- Run Gate G1 and Gate G2.

**Implementation guidance**
- Prefer deterministic `rg`-based checks if lint integration is expensive.

```yaml
files:
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/index.ts
    notes: This is the known drift location.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts
    notes: Remove custom schema logic once internal op binding is compiler-owned.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (caveat: features-plan seam)

---

### LOCAL-TBD-PR-M2-004: Compiler-owned op binding: curated public schema + compile translation (features-plan seam)

Implement the locked modeling decision for advanced planners:
- public config keys remain stable
- stage.compile produces internal per-feature op envelopes
- step runtime calls only injected ops

**Acceptance Criteria**
- [ ] `vegetatedFeaturePlacements` / `wetFeaturePlacements` are step-owned public config keys.
- [ ] Internal per-feature op envelopes exist and default to **disabled**, using `defaultStrategy` override (`StepOpUse`).
- [ ] Stage `compile` translates legacy config keys into internal per-feature op envelopes.
- [ ] Compiler prefill cannot turn optional planners “always on.”

**Scope boundaries**
- In scope: stage public schema decoupling + compile translation scaffolding.
- Out of scope: implementing the new atomic ops (owned by later issues).

**Verification**
- Gate G0.
- A targeted test that compiles the stage config with advanced keys omitted and asserts the internal per-feature ops remain disabled.

**Implementation guidance**
- Key technique: use `StepOpUse` (`{ contract, defaultStrategy: "disabled" }`) so compiler prefill is safe.
  - See `$CORE/src/authoring/step/ops.ts` and `$CORE/src/authoring/step/contract.ts`.

```yaml
files:
  - path: $MOD/src/recipes/standard/stages/ecology/index.ts
    notes: Decouple stage public schema from the internal step schema; add compile translation.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts
    notes: Internal step contract: declare per-feature ops (disabled by default) and keep only orchestration keys public.
  - path: $SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md
    notes: Normative decision.
```

**Paper trail**
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`

---

### LOCAL-TBD-PR-M2-005: Compute substrate scaffolding: ecology feature substrate ops (shared layers)

Create compute ops that produce reusable, shared layers consumed by multiple per-feature plan ops.

**Acceptance Criteria**
- [ ] At least one shared compute substrate op exists for feature planning (river adjacency masks, coastal masks, etc).
- [ ] Substrate ops import `rules/**` for behavior policy and use core helpers (clamp, RNG, typed array utils).

**Scope boundaries**
- In scope: compute ops + rules modules.
- Out of scope: switching `features-plan` runtime to use them (that cutover happens in `LOCAL-TBD-PR-M2-011`).

**Verification**
- Gate G0.
- Unit tests for substrate ops (shape + determinism) if cheap; otherwise covered by parity gate.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops
    notes: Add new compute ops under a consistent compute-substrate naming scheme.
  - path: $CORE/src/lib
    notes: Search for generic helpers first (clamp, RNG, adjacency helpers).
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (locked directive: compute substrate model)
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-substrate/contract.ts` (reference substrate pattern)

---

### LOCAL-TBD-PR-M2-006: Biomes modularization: compute layers -> classify/assemble (artifact shape preserved)

Split the biome classifier into modular compute layers while preserving the published artifact.

**Acceptance Criteria**
- [ ] `artifact:ecology.biomeClassification` output is byte-identical to baseline.
- [ ] Viz keys emitted by `biomes` and `biome-edge-refine` are unchanged.

**Scope boundaries**
- In scope: refactor `ecology/biomes/classify` internals into compute-substrate ops.
- Out of scope: any changes to how biomes are chosen.

**Verification**
- Gate G0.
- Gate G3.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/classify-biomes/**
    notes: Split into compute layers and an assembler; keep strategy outputs identical.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/biomes/index.ts
    notes: Ensure step continues to publish the same artifact.
```

**Paper trail**
- `$SPIKE/DECKGL-VIZ.md` (biome `dataTypeKey` inventory)
- `$SPIKE/CONTRACTS.md` (artifact schema + validation pointers)

---

### LOCAL-TBD-PR-M2-007: Vegetation: split multi-feature planners into atomic per-feature ops (behavior-preserving)

Replace multi-feature vegetation planners with atomic per-feature plan ops:
- `FEATURE_FOREST`, `FEATURE_RAINFOREST`, `FEATURE_TAIGA`, `FEATURE_SAVANNA_WOODLAND`, `FEATURE_SAGEBRUSH_STEPPE`

**Acceptance Criteria**
- [ ] There is one plan op per vegetated feature key.
- [ ] Behavior matches baseline (parity diff is empty).
- [ ] RNG label strings and per-label call order are preserved.

**Scope boundaries**
- In scope: new per-feature plan ops + rules factoring.
- Out of scope: tuning rules.

**Verification**
- Gate G0.
- Gate G3.

**Implementation guidance**
- Complexity: high (RNG-sensitive; multi-feature split).
- Preserve RNG semantics: `createLabelRng` is per-label LCG; order within each label matters.
  - See `$CORE/src/lib/rng/label.ts`.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/features-plan-vegetation/**
    notes: This is currently multi-feature; it must be split.
  - path: $MOD/src/domain/ecology/ops/plan-vegetated-feature-placements/**
    notes: Advanced multi-feature placement op; replace with per-feature ops.
  - path: $MOD/src/domain/ecology/ops/plan-vegetated-feature-placements/rules/**
    notes: Reuse/extend rules; do not move policy into steps.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (atomic per-feature ops + compute substrate is locked)
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md` (config compatibility posture)

---

### LOCAL-TBD-PR-M2-008: Wet features: split wet-placement mega-op into atomic per-feature ops (ordering + RNG preserved)

Replace `ecology/features/wet-placement` with atomic per-feature ops:
- `FEATURE_MARSH`, `FEATURE_TUNDRA_BOG`, `FEATURE_MANGROVE`, `FEATURE_OASIS`, `FEATURE_WATERING_HOLE`

**Acceptance Criteria**
- [ ] One plan op per wet feature key.
- [ ] Step orchestration preserves precedence order across wet features.
- [ ] Parity diff is empty.

**Scope boundaries**
- In scope: new per-feature wet planners + any shared compute substrate they require (river adjacency masks, coastal checks), preserving precedence and RNG labeling.
- Out of scope: tuning chances/rules or introducing new wet feature keys.

**Verification**
- Gate G0.
- Gate G3.
- Advanced toggles scenario: when `wetFeaturePlacements` is omitted, extra wet feature planners must remain disabled by default.

**Implementation guidance**
- Complexity: high (ordering-sensitive; RNG-sensitive).
- Preserve precedence from the original mega-op by orchestrating per-feature ops in the same effective order.
  - Evidence (current precedence + label keys): `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/strategies/default.ts`

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/plan-wet-feature-placements/**
    notes: Multi-feature op to replace.
  - path: $MOD/src/domain/ecology/ops/plan-wet-feature-placements/rules/**
    notes: Keep policy in rules.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md` (hard seam: advanced planners + defaults)
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`
- `$SPIKE/CONTRACT-MATRIX.md`

---

### LOCAL-TBD-PR-M2-009: Aquatic features: split aquatic-placement mega-op into atomic per-feature ops

Split `ecology/features/aquatic-placement` into atomic per-feature ops:
- `FEATURE_REEF`, `FEATURE_COLD_REEF`, `FEATURE_ATOLL`, `FEATURE_LOTUS`

**Acceptance Criteria**
- [ ] One plan op per aquatic feature key.
- [ ] `op-contracts` tests cover the new ops.

**Scope boundaries**
- In scope: split the op into atomic per-feature planners + any shared compute substrate they require.
- Out of scope: changing which aquatic features are enabled in the standard recipe (this op is currently unused by the standard recipe; keep it that way unless explicitly adopted later).

**Verification**
- Gate G0.
- `$MOD/test/ecology/op-contracts.test.ts` includes normalization + a smoke run for each new atomic op.

**Implementation guidance**
- Complexity: medium.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/plan-aquatic-feature-placements/**
    notes: Multi-feature op to replace.
```

**Paper trail**
- `$SPIKE/CONTRACTS.md` (op inventory)

---

### LOCAL-TBD-PR-M2-010: Embellishments: split multi-feature embellishment ops into atomic per-feature ops

Split:
- `ecology/features/vegetation-embellishments`
- `ecology/features/reef-embellishments`

into atomic per-feature embellishment ops.

**Acceptance Criteria**
- [ ] One plan op per embellishment feature key.
- [ ] Rules/policy are in `rules/**` modules.

**Scope boundaries**
- In scope: split embellishment mega-ops into atomic per-feature ops, preserving behavior for any consumers that may be wired later.
- Out of scope: new embellishment behavior or tuning (this is architecture alignment only).

**Verification**
- Gate G0.
- `op-contracts` tests updated to include the new atomic embellishment ops.

**Implementation guidance**
- Complexity: medium-high (feature-key surface is broad).

**Prework Prompt (Agent Brief)**
- Identify the *actual* feature keys placed by each embellishment op today (the contracts accept `FEATURE_PLACEMENT_KEYS`, but implementations likely only place a subset).
- Expected output: a list of feature keys per op, plus file pointers, so the split set is exact and not speculative.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/plan-vegetation-embellishments/**
    notes: Multi-feature op to split.
  - path: $MOD/src/domain/ecology/ops/plan-reef-embellishments/**
    notes: Multi-feature op to split.
```

**Paper trail**
- `$SPIKE/CONTRACTS.md` (op inventory)

---

### LOCAL-TBD-PR-M2-011: features-plan cutover: remove direct op imports; orchestrate atomic ops; preserve outputs + viz

Perform the main cutover of `features-plan` to the new architecture:
- no direct op imports
- orchestration in the step
- atomic ops only
- outputs/viz unchanged

**Acceptance Criteria**
- [ ] Gate G1 + G2 are green.
- [ ] `artifact:ecology.featureIntents` matches baseline.
- [ ] `dataTypeKey: ecology.featureIntents.featureType` emission is unchanged.

**Scope boundaries**
- In scope: switch the runtime path to injected atomic ops only (no direct imports), preserve public config entrypoints via stage.compile translation.
- Out of scope: changing the set of feature intents produced.

**Verification**
- Gate G0.
- Gate G1 and Gate G2.
- Gate G3.
- Scenario: omit `vegetatedFeaturePlacements` and `wetFeaturePlacements` and assert the internal per-feature ops remain disabled (no new placements).

**Implementation guidance**
- Complexity: high (central wiring + parity sensitivity).

```yaml
files:
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/index.ts
    notes: Remove `ecologyOps` import; call injected ops; keep viz output stable.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts
    notes: Declare internal per-feature ops (disabled default) and remove manual schema bypasses.
  - path: $MOD/src/recipes/standard/stages/ecology/index.ts
    notes: Ensure stage.compile produces the internal config shape.
```

**Paper trail**
- `$SPIKE/FEASIBILITY.md`
- `$SPIKE/DECISIONS/DECISION-features-plan-advanced-planners.md`
- `$SPIKE/DECISIONS/DECISION-step-topology.md` (topology stable; modularize via ops)

---

### LOCAL-TBD-PR-M2-012: BiomeClassification mutability: codify publish-once mutable handle posture + gates

Make the current artifact mutability posture explicit and guarded.

**Acceptance Criteria**
- [ ] Documentation and tests explicitly assert that `biome-edge-refine` mutates `biomeIndex` in-place.
- [ ] Parity harness covers this ordering-sensitive mutation.

**Scope boundaries**
- In scope: documentation + tests that make the mutability posture explicit and protected.
- Out of scope: switching to immutable republish (explicitly deferred by decision packet).

**Verification**
- Gate G0.
- Gate G3 (biomeIndex layer remains identical).

```yaml
files:
  - path: $SPIKE/DECISIONS/DECISION-biomeclassification-mutability.md
    notes: Normative decision.
  - path: $MOD/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts
    notes: The in-place mutation location.
```

**Paper trail**
- `$SPIKE/DECISIONS/DECISION-biomeclassification-mutability.md`

---

### LOCAL-TBD-PR-M2-013: plot-effects: add explicit effect tag (effect:engine.plotEffectsApplied)

Implement the locked effect tagging decision.

**Acceptance Criteria**
- [ ] `plot-effects` contract provides `effect:engine.plotEffectsApplied`.
- [ ] The tag is registered/owned in `$MOD/src/recipes/standard/tags.ts`.

**Scope boundaries**
- In scope: add a mod-owned effect id and provide it from the step contract.
- Out of scope: adapter-owned verification (can be a later milestone if required).

**Verification**
- Gate G0.
- Ensure tag registry includes owner metadata and the step contract `provides` includes the new id.

**Implementation guidance**
- Complexity: low.

```yaml
files:
  - path: $MOD/src/recipes/standard/tags.ts
    notes: Add `M4_EFFECT_TAGS.engine.plotEffectsApplied` and owner metadata.
  - path: $MOD/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts
    notes: Provide the effect tag.
  - path: $SPIKE/DECISIONS/DECISION-plot-effects-effect-tag.md
    notes: Normative decision.
```

**Paper trail**
- `$SPIKE/DECISIONS/DECISION-plot-effects-effect-tag.md`

---

### LOCAL-TBD-PR-M2-014: DeckGL/Studio compatibility: enforce stable ecology dataTypeKeys + spaceIds

Make viz identity stable and enforceable.

**Acceptance Criteria**
- [ ] Gate G4 exists and is green.
- [ ] Any refactor that changes a `dataTypeKey` requires an explicit migration table + updated baseline.

**Scope boundaries**
- In scope: enforce stable viz identity for existing keys (including debug keys treated as compatibility surface for this milestone).
- Out of scope: introducing new viz taxonomies; additive keys are allowed but must not rename/remove existing keys.

**Verification**
- Gate G0.
- Gate G4 (inventory diff is empty).

**Implementation guidance**
- Complexity: medium (tooling + fixtures).

```yaml
files:
  - path: $SPIKE/DECKGL-VIZ.md
    notes: Source of truth for ecology viz keys.
  - path: docs/system/libs/mapgen/pipeline-visualization-deckgl.md
    notes: Canonical viz posture.
```

**Paper trail**
- `$SPIKE/DECKGL-VIZ.md`

---

### LOCAL-TBD-PR-M2-015: Cleanup: delete legacy mega-op runtime paths + remove transitional shims (no legacy left)

Remove legacy code paths after gates are green.

**Acceptance Criteria**
- [ ] No legacy mega-op remains in the runtime path.
- [ ] Transitional compile shims have explicit deletion targets and are removed by end of milestone.

**Scope boundaries**
- In scope: delete legacy implementations and transitional compile/binding shims once parity gates are green.
- Out of scope: any “keep forever” compatibility bridges (every bridge must have a deletion target inside this milestone).

**Verification**
- Gate G0.
- Gate G1/G2 (no step bypasses remain).
- Gate G3/G4 (parity + viz keys unchanged).

**Prework Prompt (Agent Brief)**
- Search for external usages of legacy mega-ops (outside standard recipe).
- Expected output: a yes/no list; if any exist, add a migration sub-issue before deleting.

```yaml
files:
  - path: $MOD/src/domain/ecology/ops/contracts.ts
    notes: Update op registry exports.
  - path: $MOD/test/ecology/op-contracts.test.ts
    notes: Update to the new op catalog.
```

**Paper trail**
- `$SPIKE/DRIFT.md` (removal targets correspond to recorded drift)

---

### LOCAL-TBD-PR-M2-016: Docs: update ECOLOGY reference + workflow pointers to match new ops catalog

Update canonical docs to match the refactor.

**Acceptance Criteria**
- [ ] `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` reflects the new ops catalog and the features-plan modeling posture.
- [ ] Spike docs remain project-scoped; any evergreen rules are promoted into canonical docs.

**Scope boundaries**
- In scope: update canonical reference docs and link to the spike/feasibility paper trail; remove stale references.
- Out of scope: rewriting explanation/spec docs beyond what is required to keep references correct.

**Verification**
- Manual doc sanity pass: links resolve; key contracts reflect reality.

```yaml
files:
  - path: docs/system/libs/mapgen/reference/domains/ECOLOGY.md
    notes: Canonical reference.
  - path: $SPIKE/README.md
    notes: Paper trail reference remains valid.
```

**Paper trail**
- `$SPIKE/DOCS-IMPACT.md`

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
