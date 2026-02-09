# SPIKE: Ecology Stage Split (Map Ecology Gameplay) + Maximal Drift Plan

Status: in progress (research-only; no production refactors in this branch)

This spike extends the existing ecology architecture-alignment packet by focusing on **stage boundaries** for the gameplay/projection portion of ecology, and on how we should structure **score -> plan -> plot/apply** sequences without violating the target MapGen architecture (engine-refactor-v1 posture).

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
- The precise current step ordering + contracts inside `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/`.
- Where “wetFeaturePlacements” exists today (data model, artifacts, config surface) and what depends on it.
- Which ecology ops currently mix scoring+planning+plotting responsibilities, if any.

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
