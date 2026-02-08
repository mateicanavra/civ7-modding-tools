# Agent A: Ops Catalog Hardening (Compute vs Plan, Atomic Per Feature)

## Objective

Produce a **spec-ready** target Ecology ops catalog and a mapping from current → target ops that enforces:
- **atomic per-feature ops** (no multi-feature mega-ops)
- **compute substrate vs plan ops** separation
- **rules-first policy**: behavior policy lives in `rules/**` imported by ops
- **core libs first**: before inventing helpers, find existing helpers in shared MapGen core libs

This is plan hardening, not implementation.

## Deliverable (write here)

1. **Current op inventory** (grouped): compute vs plan, and which are multi-feature today.
2. **Target ops catalog**:
   - compute substrate ops
   - per-feature plan ops (atomic)
   - any projection/materialization ops explicitly excluded (gameplay stage)
3. **Mapping table**: current op id → target op(s) with notes.
4. **Policy/rules factoring**: list where rules exist today and where new rules modules should exist.
5. **Core libs candidates**: any generic helper needs you see; first point to existing helpers; if missing, propose where to add.

For each non-obvious claim: include a file pointer.

## Starting Pointers

Ecology op registry:
- `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`

Known multi-feature ops to split:
- `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/plan-aquatic-feature-placements/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetation-embellishments/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/plan-reef-embellishments/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/*` (multi-feature choice)

Rules examples (what “rules/**” looks like):
- `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/rules/*`
- `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/rules/*`

Core libs to search first (examples):
- `packages/mapgen-core/src/lib/**`
- `packages/mapgen-core/src/core/**` (re-exports)

## Constraints

- Do not reindex Narsil MCP.
- Avoid ADRs as primary references.
- Maximal modularity is desired; perf recovery is via substrate/caching later.

## Findings (Draft, Evidence-Backed)

### 1) Current op inventory (as exported)

Source of truth: `mods/mod-swooper-maps/src/domain/ecology/ops/contracts.ts`.

Compute ops:
- `ecology/pedology/classify`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-classify/contract.ts`
- `ecology/pedology/aggregate`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/pedology-aggregate/contract.ts`
- `ecology/biomes/classify`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/contract.ts`
- `ecology/biomes/refine-edge`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/refine-biome-edges/contract.ts`
- `ecology/resources/score-balance`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/resource-score-balance/contract.ts`

Plan ops (including known multi-feature “mega-ops”):
- `ecology/resources/plan-basins`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/resource-plan-basins/contract.ts`
- `ecology/features/plan-vegetation` (**multi-feature**)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/contract.ts`
- `ecology/features/vegetated-placement` (**multi-feature**)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/contract.ts`
- `ecology/features/plan-wetlands` (single feature: marsh)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/contract.ts`
- `ecology/features/wet-placement` (**multi-feature**)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/contract.ts`
- `ecology/features/plan-reefs` (single feature: reef)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/contract.ts`
- `ecology/features/aquatic-placement` (**multi-feature**, currently unused by standard recipe)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-aquatic-feature-placements/contract.ts`
- `ecology/features/plan-ice` (single feature: ice intents)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts`
- `ecology/features/ice-placement` (single feature: ice placements)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-ice-feature-placements/contract.ts`
- `ecology/features/reef-embellishments` (**multi-feature**, currently unused by standard recipe)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-reef-embellishments/contract.ts`
- `ecology/features/vegetation-embellishments` (**multi-feature**, currently unused by standard recipe)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetation-embellishments/contract.ts`
- `ecology/features/apply` (merges placements; not per-feature)
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-apply/contract.ts`
- `ecology/plot-effects/placement`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/contract.ts`

### 2) Rules posture (what exists today)

Examples of behavior policy already living in `rules/**`:
- biomes classifier rules:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/rules/*`
- vegetated placement rules:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/rules/*`
- wet placement rules:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-feature-placements/rules/*`

Directive: keep/extend this posture for the new atomic per-feature ops; do not move policy into steps.

### 3) Core libs first (helpers we should reuse)

Already used in ops:
- `clamp01`, `clampChance`, `createLabelRng`, `rollPercent`
  - from `@swooper/mapgen-core` / `$CORE/src/lib/**`
  - example usage:
    - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-vegetated-feature-placements/strategies/default.ts`

Plan directive:
- before inventing helpers (clamp variants, RNG helpers, adjacency scan helpers), search `$CORE/src/lib/**` and `$CORE/src/core/**`.

### 4) Target ops catalog (spec-ready shape)

High-level grouping (compute substrate vs plan):

Compute substrate ops (shared layers; reused across per-feature planners):
- `ecology/features/compute-feature-substrate` (new)
  - intended to produce masks like:
    - navigableRiverMask
    - nearRiverMask / isolatedRiverMask (wet features)
    - coastal adjacency helpers (wet/aquatic features)
  - NOTE: if a substrate layer is only used by one feature, it should stay in that feature’s module (avoid fake “shared”).

Plan ops (atomic per feature key):
- Vegetated:
  - `ecology/features/plan-forest`
  - `ecology/features/plan-rainforest`
  - `ecology/features/plan-taiga`
  - `ecology/features/plan-savanna-woodland`
  - `ecology/features/plan-sagebrush-steppe`
- Wet:
  - `ecology/features/plan-marsh`
  - `ecology/features/plan-tundra-bog`
  - `ecology/features/plan-mangrove`
  - `ecology/features/plan-oasis`
  - `ecology/features/plan-watering-hole`
- Aquatic:
  - `ecology/features/plan-reef`
  - `ecology/features/plan-cold-reef`
  - `ecology/features/plan-atoll`
  - `ecology/features/plan-lotus`
- Embellishments (if kept in ecology domain; otherwise migrate to narrative later):
  - one plan op per embellishment feature

Legacy mega-ops are removed from the runtime path after cutover, per locked directive.

### 5) Mapping table (current -> target)

- `ecology/features/plan-vegetation` -> `{compute substrate} + per-feature vegetated plan ops`
  - evidence: `features-plan-vegetation/strategies/*` chooses among multiple `FEATURE_*`
- `ecology/features/vegetated-placement` -> per-feature vegetated plan ops
  - keep RNG labels `features:plan:vegetated:${featureKey}` stable
  - evidence: `plan-vegetated-feature-placements/strategies/default.ts`
- `ecology/features/wet-placement` -> per-feature wet plan ops (marsh, bog, mangrove, oasis, watering hole)
  - preserve precedence + shared feature occupancy semantics
  - evidence: `plan-wet-feature-placements/strategies/default.ts`
- `ecology/features/aquatic-placement` -> per-feature aquatic plan ops (reef/cold-reef/atoll/lotus)
  - evidence: `plan-aquatic-feature-placements/contract.ts`
- `ecology/features/vegetation-embellishments` -> per-feature embellishment ops (or migrate)
  - evidence: `plan-vegetation-embellishments/contract.ts`
- `ecology/features/reef-embellishments` -> per-feature embellishment ops (or migrate)
  - evidence: `plan-reef-embellishments/contract.ts`

Non-split ops (already atomic enough or not feature-planning):
- `ecology/features/plan-reefs` (single feature), `ecology/features/plan-ice` (single feature), `ecology/features/ice-placement` (single feature)
- `ecology/features/apply` is a merger; can remain non-atomic for this milestone unless we choose to refactor it later.
