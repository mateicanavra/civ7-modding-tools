# SPIKE: Ecology Stage Split (Truth Ecology) + Maximal Drift Plan

Status: in progress (research-only; no production refactors in this branch)

This spike extends the existing ecology architecture-alignment packet by focusing on **stage boundaries** for the truth portion of ecology (currently a single overloaded `ecology` stage), and on how we should structure **score -> plan -> plot/apply** sequences without violating the target MapGen architecture (engine-refactor-v1 posture).

Companion scratchpad (breadcrumbs + raw notes):
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/SCRATCH-ecology-stage-split-2026-02-09.md`

## 1) Objective

1. Re-anchor in ecology as it exists today (code reality) and in the MapGen target architecture (docs authority).
2. Produce a **maximal** drift analysis for ecology (especially around stage/step/op/rule boundaries and compilation seams).
3. Propose a clean **stage split** for the current ecology gameplay stage(s) that matches boundary meaning and supports future growth.
4. Produce an execution plan (sliceable into worktrees/Graphite branches) to address every identified issue.

## 2) Assumptions and Unknowns

Assumptions (explicit):
- We are operating target-architecture-first; MapGen explanation/reference/policies docs are the vocabulary authority.
- Ops are atomic; steps orchestrate ops together (including grouped “score -> plan -> plot/apply” sequences).
- “Wet feature placement” stays as a concept; we are fixing its architecture, not removing it.
- Rules are a good fit for codified decisions and scoring inputs, and can be proxied via “scoring ops” as front doors.

Unknowns (to resolve during investigation):
- What the “score layers artifact” shape should be (explicit keys vs packed/binary representation) so planners can consume multi-layer visibility without cross-score heuristics.
- How aggressive we want to be in removing probability/density knobs while keeping maps “feeling alive” (deterministic ranking with seeded tie-breakers is allowed; chance percentages are not).

## 3) What We Learned (target model recap)

We will only make contract claims anchored to doc/code paths and named symbols.

Key target boundaries (anchors):
- Stages are author-facing config compilation boundaries: `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`.
- Steps orchestrate: they bind ops via contracts, declare tags/artifacts, and implement `run()` (+ optional shape-preserving `normalize()`): `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`.
- Domains own algorithmic ops; steps are not where heavy compute should live; rules are for shared contracts/types and codified decisions: `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`, `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`.

## 4) Maximal Drift Inventory (stage split lens)

This section will be populated with concrete breadcrumbs to code paths/symbols and mapped back to the target-doc constraints.

### 4.1 Stage topology overload (current truth `ecology` stage is doing too much)

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts` contains *both* environmental truth modeling (pedology/resource basins/biomes) and all feature-intent planning.
- The `featuresPlan` public config is compiled into a wide internal surface (vegetation substrate + multiple vegetation scoring ops + wetlands/reefs/ice + multiple wet placement ops), including a Studio sentinel forwarding hack.

This overload leads to:
- unclear config surface (knobs vs derived values vs deep overrides),
- hard-to-read step ordering (implicit coupling),
- architectural pressure to put orchestration inside ops (anti-pattern).

### 4.2 Feature planning mega-step (mixed responsibilities)

Evidence:
- `features-plan` step contract binds many ops and also introduces disabled-by-default wet placement ops:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
- `features-plan` implementation performs:
  - vegetation scoring (multiple score ops),
  - vegetation plan/picking,
  - wetlands plan,
  - multiple wet placement planners with collision field updates,
  - and then merges/publishes multiple intents:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

Why this is drift:
- Steps should orchestrate, but “mega-steps” make it hard to keep “compute substrate vs plan” seams explicit and make rule reuse a first-class unit.

### 4.2 Score vs plan coupling (circular dependency pressure)

Working claim: if planning needs global visibility across multiple per-tile score layers (to avoid circular dependencies and avoid baking cross-score heuristics into score computations), we should formalize:
- “score layers” as an explicit artifact (or structured output) produced by a scoring step/op, and
- a planning op that consumes that single aggregated view to make placement decisions.

### 4.3 Underutilized rules for scoring/policy

Working claim: “rules” are a natural unit for codified decisions and score inputs. A scoring op can proxy multiple rules and emit a layered score object, instead of scattering scoring logic across multiple ops/steps or mixing it into planners.

### 4.4 Disabled strategy toggle for wet placements (anti-pattern)

Evidence:
- Stage public config models `wetFeaturePlacements` as `strategy: "disabled" | "default"`:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
- Step contract injects per-feature wet placement planners with `defaultStrategy: "disabled"`:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`

This is a legacy/optional toggle concept. With atomic ops and step-owned orchestration, we should remove “disabled strategy” as a first-class concept and instead:
- express recipe composition explicitly (what runs), and
- rely on honest algorithmic inputs (thresholds, masks, and constraints) to yield zero placements when appropriate.

### 4.5 Underused compute substrate op (duplicate logic in steps)

Evidence:
- `ecology.ops.computeFeatureSubstrate` exists as a reusable compute substrate op returning navigable/adjacency masks:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/contract.ts`
- `features-plan` step reimplements navigable river masks and adjacency masks ad hoc:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

### 4.6 No-output-fudging violations (chances/multipliers/density/jitter)

Non-negotiable constraints from session:
- No chance percentages.
- No multipliers/bonuses that “fudge outputs”.
- No “probabilistic edge” heuristics.

Concrete violations (evidence):
- Wet placement ops use `multiplier` + per-feature `chances` (0..100) with RNG gating (`rollPercent`):
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-placement-marsh/contract.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-placement-marsh/strategies/default.ts`
  - and the sibling `plan-wet-placement-*` ops.
- Ice planner includes probabilistic knobs (`jitterC`, “probabilistic edge”, `densityScale`):
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts`
- Plot effects config includes `coverageChance`:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/**`

Implication:
- These must become deterministic score -> plan pipelines (rank/select with spacing and constraints), with seeded tie-breaking if needed for variety.

## 5) Potential Stage Split Shapes (conceptual; no implementation yet)

We are choosing boundaries based on meaning and compilation seams. Two main shapes seem plausible:

### Shape A (recommended): Split truth `ecology` into multiple truth stages (hydrology/morphology pattern)

Key point: keep the truth-vs-projection posture, but stop treating “truth ecology” as one monolithic stage. Instead, mirror Hydrology/Morphology by using multiple smaller truth stages with crisp config surfaces.

Proposed truth-stage decomposition (names illustrative; align to conventions like `hydrology-climate-refine`, `morphology-erosion`):
- `ecology-pedology`:
  - steps: `pedology`, `resource-basins`
  - artifacts: `artifact:ecology.soils`, `artifact:ecology.resourceBasins`
- `ecology-biomes`:
  - steps: `biomes` (and integrate edge refinement into classification; remove separate refine op/step)
  - artifacts: `artifact:ecology.biomeClassification`
- `ecology-features`:
  - steps: explicitly segmented “score -> plan -> publish” per group (vegetation, wetlands, reefs, ice), with step-owned orchestration of atomic ops
  - artifacts: `artifact:ecology.featureIntents.*`

Pros:
- Config surfaces map cleanly to conceptual levers.
- Execution ordering is readable and tag seams are explicit.
- Easy to extend with new feature families without turning one stage into a “kitchen sink”.
- Lets us collapse the current `featuresPlan` compile multiplexor and use per-step schemas directly (hydrology pattern).

Cons:
- More stage modules and compilation surfaces (more files).
- Requires careful artifact seams if planners want cross-feature visibility (see score-layer artifact note below).

Score-layer posture inside `ecology-features`:
- If we want planners to see multiple score layers without circular dependencies, introduce a scoring step that outputs a single structured “score layers” artifact, and have each planner consume it (read-only) while still producing only its own intent list (keeps “atomic per-feature planning ops” intact).

Concrete “sensible boundary” inside `ecology-features` (recommended):
- `compute-feature-substrate` (step): calls `ecology.ops.computeFeatureSubstrate` and publishes a small, reusable mask artifact (or keeps it step-local if we’re not ready to surface a new artifact yet).
- Vegetation:
  - `score-vegetation` (step/op): one scoring op that proxies multiple vegetation scoring rules and emits layered `Float32Array`s (forest/rainforest/taiga/etc).
  - `plan-vegetation` (step/op): consumes the aggregated vegetation score layers (and optionally other feature-family layers) and produces `artifact:ecology.featureIntents.vegetation`.
- Wetlands:
  - `plan-wetlands` (step): consumes substrate masks + inputs, calls `ecology.ops.planWetlands` plus atomic wet-placement ops (marsh/bog/mangrove/oasis/watering hole) in a step-owned sequence so ops never call each other.
  - Remove “disabled strategy” by making these planners honest and always runnable (placements can naturally be empty).
- Marine/cryosphere:
  - `plan-reefs` (step/op) -> `artifact:ecology.featureIntents.reefs`
  - `plan-ice` (step/op) -> `artifact:ecology.featureIntents.ice`

Rule posture (as per session guidance):
- Use rules for codified decisions and scoring inputs (especially where “a scoring op runs many rules and returns layered results”).
- If a component is likely to host many future algorithms/strategies, keep it as a standalone op rather than overloading rules.

### Shape A.1 (tightened): Concrete stage + step contract spec (recommended)

This is the tightened “what exactly exists” proposal: stage ids, step ids, artifact seams, and op bindings. It is designed to be directly sliceable into `dev-loop-parallel` worktrees.

#### Standard recipe stage order (proposed)

Anchor (current ordering): `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`

Replace the single truth stage `ecology` with:
- `ecology-pedology`
- `ecology-biomes`
- `ecology-features`

So the relevant slice becomes:
`hydrology-climate-refine` -> `ecology-pedology` -> `ecology-biomes` -> `ecology-features` -> `map-morphology` -> `map-hydrology` -> `map-ecology` -> `placement`

#### Stage surface posture (critical)

Use *internal* stage surfaces (no `public`, no `compile`) to avoid multiplexors:
- This matches Hydrology’s pattern.
- It also removes the need for “Studio sentinel forwarding” through stage compile.

Mechanic anchors:
- Stage surfaces: `packages/mapgen-core/src/authoring/stage.ts`
- Op envelope prefill: `packages/mapgen-core/src/compiler/normalize.ts` (`prefillOpDefaults`)

#### `ecology-pedology` (truth)

Stage id: `ecology-pedology`

Steps (ids and existing contracts):
- `pedology`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/pedology/contract.ts`
  - Requires artifacts: `artifact:morphology.topography`, `artifact:hydrology.climateField`
  - Provides artifacts: `artifact:ecology.soils`
  - Ops: `ecology.ops.classifyPedology`
- `resource-basins`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/resource-basins/contract.ts`
  - Requires artifacts: `artifact:ecology.soils`, `artifact:morphology.topography`, `artifact:hydrology.climateField`
  - Provides artifacts: `artifact:ecology.resourceBasins`
  - Ops: `ecology.ops.planResourceBasins` + `ecology.ops.scoreResourceBasins`

#### `ecology-biomes` (truth)

Stage id: `ecology-biomes`

Steps:
- `biomes`
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/contract.ts`
  - Requires artifacts: `artifact:hydrology.climateField`, `artifact:hydrology.cryosphere`, `artifact:morphology.topography`, `artifact:hydrology.hydrography`
  - Provides artifacts: `artifact:ecology.biomeClassification`
  - Ops: `ecology.ops.classifyBiomes`
  - Required change: integrate edge refinement into classification so `biomeIndex` is final here (remove `refineBiomeEdges` op and remove `biome-edge-refine` step).
  - Viz: move `ecology.biome.biomeIndex` emission into this step to preserve the viz surface currently owned by `biome-edge-refine`.

#### `ecology-features` (truth)

Stage id: `ecology-features`

Artifacts (owned by the domain-level artifact registry):
- Existing intent artifacts:
  - `artifact:ecology.featureIntents.vegetation`
  - `artifact:ecology.featureIntents.wetlands`
  - `artifact:ecology.featureIntents.reefs`
  - `artifact:ecology.featureIntents.ice`
  - Source: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`

New truth artifacts (recommended to make seams explicit):
- `artifact:ecology.featureSubstrate`
  - payload mirrors `ecology.ops.computeFeatureSubstrate` output (masks) for reuse by multiple planners.
- `artifact:ecology.scoreLayers` (or split per family, see note below)
  - holds layered per-tile scores so planners can consume a single “layers object” and escape circular dependencies.

Steps (tightened; ids are proposed):
- `compute-feature-substrate`
  - Requires artifacts: `artifact:hydrology.hydrography`, `artifact:morphology.topography`
  - Provides artifacts: `artifact:ecology.featureSubstrate`
  - Ops: `ecology.ops.computeFeatureSubstrate`
- `score-vegetation`
  - Requires artifacts: `artifact:ecology.biomeClassification`, `artifact:ecology.soils`, `artifact:ecology.featureSubstrate` (for navigable river masks), `artifact:morphology.topography`
  - Provides artifacts: `artifact:ecology.scoreLayers` (vegetation layers at minimum)
  - Ops: new `ecology/features/score-vegetation` op (front door), implemented by running multiple scoring rules and emitting layered `Float32Array`s.
  - Replacement for today’s “multiple score ops + picking inside step”.
- `plan-vegetation`
  - Requires artifacts: `artifact:ecology.scoreLayers`, `artifact:ecology.featureSubstrate`, `artifact:morphology.topography`
  - Provides artifacts: `artifact:ecology.featureIntents.vegetation`
  - Ops: new `ecology/features/plan-vegetation` op that takes a single layers object (global visibility) and produces placements deterministically (rank/select with constraints).
- `plan-wetlands`
  - Requires artifacts: `artifact:ecology.biomeClassification`, `artifact:ecology.soils`, `artifact:morphology.topography`, `artifact:ecology.featureSubstrate`
  - Provides artifacts: `artifact:ecology.featureIntents.wetlands`
  - Ops: existing `ecology.ops.planWetlands` plus wet placement ops orchestrated by the step.
  - Required changes:
    - remove “disabled strategy” and remove chance/multiplier configs from wet placement ops.
    - re-express as deterministic score -> plan (rank/select) planners that can return empty placements honestly.
    - use `artifact:ecology.featureSubstrate` masks rather than step-local ad hoc mask computation.
- `plan-reefs`
  - Requires artifacts: `artifact:ecology.biomeClassification` (temperature), `artifact:morphology.topography` (landMask)
  - Provides artifacts: `artifact:ecology.featureIntents.reefs`
  - Ops: `ecology.ops.planReefs` (but must remove density/chance posture; become deterministic rank/select).
- `plan-ice`
  - Requires artifacts: `artifact:ecology.biomeClassification` (temperature), `artifact:morphology.topography` (landMask/elevation)
  - Provides artifacts: `artifact:ecology.featureIntents.ice`
  - Ops: `ecology.ops.planIce` (remove jitter/probabilistic edge/densityScale; deterministic selection).
- `feature-intents-viz`
  - Requires artifacts: all `artifact:ecology.featureIntents.*`
  - Provides: none
  - Purpose: preserve/centralize the existing viz key `ecology.featureIntents.featureType` currently emitted inside the old `features-plan` mega-step.

Note on `artifact:ecology.scoreLayers` shape:
- Option 1 (recommended to start): explicit object keys for the known vegetation layers plus any wetlands “suitability” layers we need; easiest to validate and easiest to consume.
- Option 2: packed/binary representation (faster, smaller), but harder to validate and harder to evolve.

#### `map-ecology` (projection)

No stage split required for correctness today; it is already small and semantically crisp:
- `plot-biomes`
- `features-apply`
- `plot-effects`

However, the refactor must preserve:
- effect/field tag semantics on `plot-biomes` and `features-apply`,
- and should introduce an explicit effect tag for `plot-effects` (currently missing).

### Shape B: Keep one truth `ecology` stage but split `features-plan` into many steps

Example: a single stage whose steps are grouped by feature family, and each family has an internal step trio:
- `score-<family>` (possibly via rules)
- `plan-<family>` (consumes score layers)
- `apply-<family>` (plots to engine/projection)

Pros:
- Fewer stage compilation surfaces.
- Still respects the “steps orchestrate; ops are atomic” rule.

Cons:
- Stage config surface may become too broad and encourage derived/overlapping knobs.
- Harder to justify the stage boundary meaningfully (it becomes “everything in ecology gameplay” again).

## 6) Minimal Experiment (optional)

If we need a fast validation step before planning the full refactor:
- Produce a trace/viz run that emits score-layer artifacts for one feature family (vegetation), then feed the aggregated layers to a planning op.
- Validate that this breaks circular dependencies cleanly and keeps responsibilities legible.

## 7) Risks and Open Questions

- Stage split may ripple through recipe ordering and tag gating; we need to make sure tags remain the source of truth (no implicit coupling).
- “Wet feature placement” may currently be modeled as an output-fudging or derived-config concept; if so, we need to rebuild it as a clean score/plan/apply pipeline with honest inputs.
- Rules vs ops: if a future space likely needs many different strategy algorithms, it should be a standalone op rather than overloading rules.

## 8) Next Steps (within this spike)

- Enumerate the exact current ecology stage/step layout and contracts (breadcrumbs to code).
- Do a hydrology comparison pass: “hydrology pattern” vs “ecology violation” vs “required change”.
- Finalize the recommended stage split shape and produce the sliceable remediation plan.

## 9) Execution Plan (Slices; dev-loop-parallel friendly)

This is the comprehensive “do the work later” plan, decomposed into slices that can live on separate Graphite branches/worktrees.

Slice ordering (dependencies):
1. Topology first (stage split + step split skeleton).
2. Then artifacts/seams (substrate + score layers).
3. Then planner redesign (remove chance/multiplier/jitter/density).
4. Then projections/tags, presets, and docs.

Slices (detail lives in the scratchpad):
- Slice 1: Stage topology split (`ecology` -> `ecology-pedology` + `ecology-biomes` + `ecology-features`)
- Slice 2: Replace `features-plan` mega-step with per-family steps (+ optional `feature-intents-viz` step)
- Slice 3: Remove “disabled strategy” posture for wet placements (no optional ops; honest inputs)
- Slice 4: Integrate biome edge refinement into biome classification (no separate op/step)
- Slice 5: Update guardrails + tests for new step directory topology
- Slice 6: Add explicit `artifact:ecology.featureSubstrate` + `compute-feature-substrate` step
- Slice 7: Add `artifact:ecology.scoreLayers` + `ecology/features/score-vegetation` op + `score-vegetation` step
- Slice 8: Add `ecology/features/plan-vegetation` op + `plan-vegetation` step (global visibility; deterministic)
- Slice 9: Redesign all `plan-wet-placement-*` ops to deterministic rank/select; remove chances/multipliers/disabled
- Slice 10: Redesign reefs/ice planners to deterministic; remove density/jitter/probabilistic edges
- Slice 11: Redesign plot effects to deterministic + add explicit effect tag for `plot-effects`
- Slice 12: Migrate presets/configs to new stage ids (no legacy shim)
- Slice 13: Update canonical docs/catalogs to reflect the new stage topology (preserve existing viz keys)

Scratchpad pointer:
- `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/_scratch/SCRATCH-ecology-stage-split-2026-02-09.md`

## Appendix: Hydrology Comparison (pattern vs violation vs required change)

Hydrology is our “clean reference” pattern for stages/steps/ops/config boundaries.

### Pattern: multiple small stages with crisp meaning + knobs

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/index.ts`

Hydrology stages:
- are small and semantically scoped (baseline climate vs hydrography vs refinement),
- put stage-meaning in `knobsSchema` documentation,
- and avoid “public config multiplexors” that translate one key into many internal keys.

### Pattern: step owns orchestration; ops stay atomic; normalize is step-local

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.contract.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/rivers.ts`

Hydrology `rivers` step:
- binds multiple atomic ops via `contract.ops`,
- uses `normalize(config, ctx)` for knob-based deterministic transforms,
- publishes a single artifact (`hydrography`) and emits viz from that truth.

### Ecology violation: overloaded truth stage + mega-step + compile-time multiplexing

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

Ecology today:
- has one truth stage that includes multiple distinct subsystems,
- uses a wide `featuresPlan` config surface compiled into many internal keys (including Studio sentinel forwarding),
- and has a `features-plan` mega-step that mixes scoring, planning, and cross-feature merging.

### Required change (to match Hydrology pattern)

- Split truth `ecology` into multiple truth stages with crisp meaning (`ecology-pedology`, `ecology-biomes`, `ecology-features`).
- Replace `features-plan` with per-family steps and (where needed) explicit “score layers” artifacts so planners can see other layers without creating circular dependencies.
- Move shared masks into explicit compute substrate (use `ecology.ops.computeFeatureSubstrate`), rather than reimplementing substrate logic inside feature planners.
