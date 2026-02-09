# Scratch: Ecology Stage Split + Drift (2026-02-09)

Owner: `agent-codex` (spike worktree: `wt-agent-codex-spike-ecology-stage-split`)

Purpose: ongoing scratchpad for maximal drift analysis + remediation planning, with a focus on splitting the current truth `ecology` stage into multiple sensible stages that align with MapGen target architecture (engine-refactor-v1 posture).

## Working Agreements (from session)

- Ops are atomic; steps orchestrate ops together. If we want “grouped sequences” (score -> plan -> plot/apply), steps are the right boundary for grouping.
- “Wet feature placement” remains a real concept; the goal is to redesign it so it does not break target architecture.
- Rules are underutilized. Rules fit well for codified decisions / score inputs, and can be proxied via a single scoring op as the front door.
- Separation of scoring vs planning is justified when we want a planning op to see multiple score layers at once (to avoid circular dependencies and avoid baking cross-score heuristics into individual score computations).

## Breadcrumbs (where we looked)

### Repo state

- Base branch (stack tip): `codex/ecology-wet-placement-standalone` @ `db0c7ae97`
- Spike branch: `agent-codex-spike-ecology-stage-split`
- Worktree root: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-spike-ecology-stage-split`

### Canonical MapGen doc spine (target-architecture-first)

- Gateway: `docs/system/libs/mapgen/MAPGEN.md`
- LLM rules/index: `docs/system/libs/mapgen/llms/LLMS.md`
- Architecture (explanation): `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- Stage/step authoring contracts (reference): `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- Module shape policy: `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`

### Ecology alignment baseline (existing spike directory)

- Entry: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/README.md`
- Current state snapshot: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CURRENT.md`
- Drift inventory: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/DRIFT.md`
- Refactor target shape: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/REFRACTOR-TARGET-SHAPE.md`

### Current ecology stage (code reality)

- Stage: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - Steps (current order): `pedology`, `resource-basins`, `biomes`, `biome-edge-refine`, `features-plan`
- Stage: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
  - Steps: `plot-biomes`, `features-apply`, `plot-effects`
- Feature planning mega-step:
  - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
  - Implementation: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
- Shared compute substrate op we are not using today (but should):
  - `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/contract.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/strategies/default.ts`

## Target-Architecture Definitions (anchor quotes and paraphrases)

These definitions are *target authority* for vocabulary and boundaries; code is current reality.

### Stage

- Author-facing grouping + config surface; compiles stage config into per-step configs via `toInternal(...)`.
  - Anchor: `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`

### Step

- Orchestration unit: declares `requires/provides` tags + artifacts; binds op contracts; implements `run()` and optional shape-preserving `normalize()`.
  - Anchor: `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`

### Domain + ops + rules

- Domains own algorithmic ops and shared semantics; steps orchestrate, not algorithms.
- Module shape policy explicitly calls out: “steps orchestrate; domain ops do computation; strategies encode variants; rules define contracts/shared types.”
  - Anchors:
    - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
    - `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`

## Authoring + Compilation Semantics (load-bearing)

These mechanics explain why some “obvious” configurations are not viable (e.g. “optional ops”), and why stage splitting is the right move to remove compile multiplexors.

### Stages: `public` + `compile` vs internal surfaces

Anchor: `packages/mapgen-core/src/authoring/stage.ts`

- If a stage defines `public`, it must also define `compile`.
  - Surface schema becomes `{ knobs?, ...publicProps }`.
  - `compile({ env, knobs, config })` returns `{ [stepId]: rawStepConfig }`.
- If a stage does NOT define `public`:
  - Surface schema becomes `{ knobs?, <stepId>?: unknown }` for each step id.
  - Stage config keys that match step ids become the raw step configs directly (no mapping layer).

Implication for the ecology split:
- We can follow the Hydrology pattern (no `public`, no `compile`) and eliminate “stage as multiplexor” entirely, especially for feature planning.

### Step schemas automatically include op envelope keys

Anchor: `packages/mapgen-core/src/authoring/step/contract.ts`

- `defineStep({ ops: { foo: someOp }})` injects `foo` into the step schema as an op envelope schema.
- A step schema MUST NOT define a key that collides with an op key.

### Prefill semantics: declared ops cannot be “optional by omission”

Anchor: `packages/mapgen-core/src/compiler/normalize.ts` (`prefillOpDefaults`)

- During config compilation, every op envelope key in `contract.ops` is prefilled with `defaultConfig` when omitted by the author.
- Therefore:
  - “config key missing” cannot mean “op disabled” once the op is declared.
  - if a planner must sometimes yield no placements, that needs to be honest strategy behavior driven by inputs/constraints, not “missing envelope” or “optional ops”.

## Drift Findings (to be expanded; grouped)

### Stage boundary drift (truth ecology stage is overloaded)

Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts` compiles a single public `featuresPlan` object into a large internal config surface (vegetation substrate + multiple vegetation score ops + wetlands/reefs/ice + multiple wet placement ops).

Symptoms:
- Stage compile function is doing UI/typegen sentinel forwarding across many keys (smells like “stage as UI adapter” rather than “stage as config compilation boundary”).
- The mega-step `features-plan` mixes scoring, planning, and cross-feature merging in one `run()` method.

Why this is target-architecture drift:
- A stage’s primary job is a coherent author surface + compilation boundary, not an internal multiplexor for unrelated subpipelines.
- A single step can orchestrate multiple ops, but a mega-step becomes an architectural sink that prevents clean “compute substrate vs plan” seams and rule reuse.

### Disabled strategy (anti-pattern) for wet placements

Evidence:
- Public stage config models `wetFeaturePlacements` as `strategy: "disabled" | "default"`: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`.
- Step contract injects atomic wet placement ops with `defaultStrategy: "disabled"`: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`.

Why this is drift:
- “Disabled strategy” is a legacy toggle/hack; recipe composition should express what runs, and honest algorithmic inputs should decide what places.
- Also, it creates odd configuration coupling: one public key fans out to multiple per-feature planners.

### Bug: wet placements variable typo (current code does not typecheck)

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts` defines `const wetPlacements = ...` but later spreads `...wetPlacements` into wetlands placements.

Impact:
- This will fail typecheck/build; regardless of the longer refactor, it’s a correctness issue that must be fixed in the eventual execution plan.

### No-output-fudging drift (probabilities/multipliers/jitter/chance)

Non-negotiable constraint from session: no chance percentages, multipliers, bonuses, or “output fudging”.

Concrete violations (evidence):
- Wet placement ops use `multiplier` + `chances` (0..100) and RNG gating (`rollPercent`):
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-placement-marsh/contract.ts`
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-placement-marsh/strategies/default.ts`
  - Similar patterns in:
    - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-wet-placement-{tundra-bog,mangrove,oasis,watering-hole}/**`
- Ice planner contains probabilistic knobs (explicit “probabilistic edge”, `jitterC`, `densityScale` multiplier):
  - `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/contract.ts`
- Plot effects config includes `coverageChance`:
  - `mods/mod-swooper-maps/src/domain/ecology/ops/plan-plot-effects/**`

Plan implication:
- Re-express these planners as deterministic score -> plan pipelines (rank/select with constraints), not probability gates.

### Op/step boundary drift (grouping ops inside ops)

Hypothesis: any ops that call other ops (or behave like orchestrators) violate atomic-op posture and should be split into atomic ops with orchestration in steps.

### Rule underuse

Hypothesis: scoring logic scattered across steps/ops could become a scoring op that runs multiple rules to produce score layers, improving modularity and enabling “plan with global visibility” without circular dependencies.

### Underused compute substrate op (duplicate logic in steps)

Evidence:
- `ecology.ops.computeFeatureSubstrate` exists and is explicitly shaped as reusable compute substrate masks (navigableRiverMask / nearRiverMask / isolatedRiverMask / coastalLandMask).
  - `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/contract.ts`
- `features-plan` step reimplements navigable river masks and adjacency masks ad hoc.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`

Why this matters:
- Compute substrate is the endorsed pattern (see morphology), and it’s a clean way to avoid cross-feature circularities while keeping plan ops atomic.

## Proposed Stage Split (recommended)

Goal: replace the single truth stage `ecology` with multiple smaller truth stages, mirroring Hydrology/Morphology patterns (multiple domain stages with crisp config meaning), while keeping projection stage `map-ecology` intact.

### Proposed truth stages (in recipe order)

1. `ecology-pedology`
- Steps: `pedology`, `resource-basins`
- Outputs: `artifact:ecology.soils`, `artifact:ecology.resourceBasins`
- Meaning: “soil + basin substrate” (ecology truth products that are upstream inputs to later ecology steps and placement).

2. `ecology-biomes`
- Steps: `biomes` (integrate edge refinement here; remove `biome-edge-refine` step/op)
- Outputs: `artifact:ecology.biomeClassification` (refined)
- Meaning: “biosphere classification truth surface” (the canonical ecology truth lookup used by all planners).

3. `ecology-features`
- Steps (target posture, not current):
  - shared compute substrate step: `compute-feature-substrate` (calls `ecology.ops.computeFeatureSubstrate`)
  - per-family planning steps (symmetric posture):
    - `plan-vegetation`
    - `plan-wetlands` (includes atomic wet placement planners orchestrated here)
    - `plan-reefs`
    - `plan-ice`
- Outputs: `artifact:ecology.featureIntents.*`
- Meaning: “feature intent truth” (all discrete placement intents; no engine writes).

### Why these boundaries are “sensible”

- They match the meaning of “stage = config compilation boundary + mental grouping”, not “stage = grab bag of unrelated subpipelines.”
- They align with existing recipe posture: Hydrology and Morphology already use multiple stages for the same domain.
- They eliminate the current `featuresPlan` compile multiplexor (including Studio sentinel forwarding across many internal keys) by giving each stage/step a smaller, direct schema surface.

### Alternative (if we want even crisper author surfaces)

- Split `ecology-features` into separate feature-family stages (`ecology-vegetation`, `ecology-wetlands`, `ecology-reefs`, `ecology-ice`).
- Tradeoff: more stages, but the per-stage config surfaces become very clean and may map better to presets.
- Risk: cross-feature planning needs an explicit shared score-layers artifact if planners should see each other’s scores.

## Tightened Stage + Step Spec (recommended)

This is the “tightened” version: explicit stage ids, step ids, artifact seams, and which ops are bound at each step. This is what we’ll hand to `dev-loop-parallel`.

### Stage surface posture

Use internal stage surfaces (no `public`, no `compile`) for the new truth stages:
- avoids compile multiplexors
- matches Hydrology’s pattern
- removes Studio sentinel forwarding hacks

Anchor: `packages/mapgen-core/src/authoring/stage.ts`

### Proposed truth stages

1. Stage: `ecology-pedology`
- Steps:
  - `pedology` (existing)
  - `resource-basins` (existing)
- Artifacts out: `artifact:ecology.soils`, `artifact:ecology.resourceBasins`

2. Stage: `ecology-biomes`
- Steps:
  - `biomes` (existing contract, but integrate edge refinement into classification)
- Artifacts out: `artifact:ecology.biomeClassification` (final refined)
- Viz: move `ecology.biome.biomeIndex` emission into this step (currently owned by `biome-edge-refine`).

3. Stage: `ecology-features`
- Steps (proposed ids):
  - `compute-feature-substrate`
  - `plan-vegetation`
  - `plan-wetlands`
  - `plan-reefs`
  - `plan-ice`
- Artifacts out:
  - existing: `artifact:ecology.featureIntents.{vegetation,wetlands,reefs,ice}`
  - new (recommended): `artifact:ecology.featureSubstrate`
  - optional future seam: `artifact:ecology.scoreLayers` (only if we need cross-layer visibility)

### New artifacts (recommended)

1. `artifact:ecology.featureSubstrate`
- Purpose: explicit, reusable compute substrate masks for multiple planners.
- Shape: mirrors `ecology.ops.computeFeatureSubstrate` output.
- Anchor: `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/contract.ts`

2. `artifact:ecology.scoreLayers` (OPTIONAL)
- Purpose: single “layers object” planners can consume to avoid circular dependencies and avoid baking cross-score heuristics into scores.
- Trigger: introduce only when we actually need cross-layer visibility (otherwise keep score+plan orchestration inside each `plan-<family>` step).
- Initial posture: explicit keys for *all* families, not “vegetation only” and not packed/binary.

### Required planner posture changes (non-negotiables)

- Delete “disabled strategy” everywhere; do not replace it with “optional ops”.
  - Prefill semantics make omission meaningless once ops are declared: `packages/mapgen-core/src/compiler/normalize.ts`.
- Replace probability/density/jitter/chance knobs with deterministic rank/select under constraints:
  - wet placement planners (`plan-wet-placement-*`)
  - reefs (`plan-reefs`)
  - ice (`plan-ice`)
  - plot effects (`plan-plot-effects`) if it still relies on `coverageChance`

## Arrangement Options (matrix)

This is the quick decision table for “where do scores live, where does planning live, where does viz live”.
Full prose version is in the spike doc (`5.2 Layout Matrix`).

Option A: per-family `plan-<family>` step orchestrates score ops + plan op
- Pros: minimal pipeline nodes; symmetric; easy to evolve
- Cons: no explicit cross-family score seam unless we add one later

Option B: `score-features` step publishes unified `artifact:ecology.scoreLayers`, then per-family plan steps consume
- Pros: explicit seam; prevents circular dependencies; best for “global visibility” planning
- Cons: adds an artifact and a step; must define scoreLayers schema

Option C: per-family score steps + per-family plan steps
- Pros: maximal modularity and observability
- Cons: many nodes/artifacts

Option D: plan ops compute scores internally via rules (no score ops/steps)
- Pros: smallest op surface
- Cons: weak observability of scores unless op outputs debug payloads

Option E: split into separate truth stages `ecology-features-score` + `ecology-features-plan`
- Pros: stage-level config boundaries become crisp for presets/knobs
- Cons: more stage modules; artifact seams mandatory

Option F: global multi-family plan op (single decision maker)
- Pros: explicit cross-family conflict resolution in truth
- Cons: challenges “atomic per-feature ops” unless resolver is treated as its own atomic concern

## Remediation Slices (dev-loop-parallel inputs)

Placeholder: we will enumerate one slice per “fixable unit” (stage split, op extraction, rule refactor, config compilation boundary, artifact boundaries, tag/id/registry alignment).

Each slice will include:
- Branch/worktree: `agent-?-...`
- Scope: what changes
- Acceptance criteria: observable, testable
- Verification: build/typecheck/tests/viz trace expectations

### Slice 1: Stage topology split (truth ecology -> multiple stages)

- Scope:
  - Replace `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts` with multiple stage modules.
  - Update `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` stage list order.
  - Keep step ids stable where possible (to preserve viz/test baselines).
- Acceptance:
  - Recipe compiles; stage config schemas remain strict and do not introduce derived-value knobs.
  - No behavior changes intended; parity fixtures continue to pass after mechanical moves.
- Verification:
  - `bun --cwd packages/mapgen-core run build`
  - `bun --cwd mods/mod-swooper-maps run typecheck`
  - `bun run test:ci` (or package-local ecology tests)

### Slice 2: De-mega-step `features-plan` (split into per-family steps; keep ops atomic)

- Scope:
  - Replace the single `features-plan` step with multiple steps (vegetation/wetlands/reefs/ice).
  - Introduce an optional shared compute-substrate step using `ecology.ops.computeFeatureSubstrate`.
- Acceptance:
  - All intent artifacts are still published with identical semantics.
  - No direct domain imports from steps to reach ops outside `contract.ops` injection.
- Verification:
  - Existing import guardrails tests (ecology) still pass.
  - Viz keys remain stable (`ecology.featureIntents.featureType` etc).

### Slice 3: Remove “disabled strategy” posture for wet placements (keep wet placement concept)

- Scope:
  - Delete `strategy: "disabled"` from wet placement planners and from stage public schema.
  - Model wet placement planners as always-on with honest constraints, or move enable/disable to recipe composition (not config).
- Acceptance:
  - No “optional ops” concept; steps decide orchestration, ops remain atomic.
  - Wet placement still works; it does not require a fan-out config key (`wetFeaturePlacements`) that controls multiple planners.

### Slice 4: Integrate biome edge refinement into biome classification

- Scope:
  - Remove `biome-edge-refine` as a standalone step/op; integrate into `classifyBiomes` pipeline.
- Acceptance:
  - The refined `biomeIndex` is available immediately from biome classification.
  - No output fudging or post-hoc projection tricks.

### Slice 5: Update guardrails + tests for new stage topology

Evidence:
- Guardrails currently scan only:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps`
  - `mods/mod-swooper-maps/test/ecology/ecology-step-import-guardrails.test.ts`

Acceptance:
- Guardrails scan the new truth-stage step directories:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-pedology/steps`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-biomes/steps`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features/steps`
  - plus the projection directory `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps`
- Update step-level integration tests that import old paths (example hotspots):
  - `mods/mod-swooper-maps/test/ecology/features-plan-apply.test.ts`
  - `mods/mod-swooper-maps/test/ecology/biome-edge-refine-mutability.test.ts` (will be deleted/rewritten when refine is integrated)
  - `mods/mod-swooper-maps/test/ecology/wet-atomic-ops.test.ts` (planner redesign removes chances/disabled)

### Slice 6: Add explicit feature substrate artifact + step

- Scope:
  - Add `artifact:ecology.featureSubstrate` to `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts`.
  - Create step `compute-feature-substrate` that calls `ecology.ops.computeFeatureSubstrate` and publishes the artifact.
  - Replace ad hoc mask computation in feature planners with reads from this artifact.
- Acceptance:
  - No step imports any `rules/` modules (guardrails).
  - Multiple planners can consume masks without recomputation and without cross-feature coupling.

### Slice 7: Introduce “score layers” artifact + vegetation score front door op

- Scope (OPTIONAL; only if we need cross-layer visibility):
  - Add `artifact:ecology.scoreLayers` to the ecology artifact registry.
  - Create a scoring front door that covers *all* feature families (not just vegetation):
    - either one op `ecology/features/score-features` that runs many rules and emits layers, or
    - one `score-<family>` op per family, but still published as one unified artifact.
  - Add a `score-features` step that publishes the artifact.
- Acceptance:
  - “Rules are codified decisions/inputs” posture is enforced: scoring logic lives in rules proxied via a scoring op.
  - Score layers are consumed as a single structured object to avoid circular dependencies.

### Slice 8: Vegetation planning op (global visibility, deterministic selection)

- Scope:
  - Create/harden op `ecology/features/plan-vegetation` so it can consume `artifact:ecology.scoreLayers` when present, but does not require it when we keep score+plan orchestration inside the step.
  - Create step `plan-vegetation` that publishes `artifact:ecology.featureIntents.vegetation` and emits vegetation intent viz.
- Acceptance:
  - No scoring heuristics are baked into planning; planning consumes layers and does any cross-layer composition explicitly.
  - Determinism: selection is deterministic for a given env seed and inputs (seeded tie-breakers allowed).

### Slice 9: Wet placement ops redesign (remove chance/multiplier/disabled)

- Scope:
  - For all `plan-wet-placement-*` ops:
    - remove `disabled` strategy
    - remove `multiplier` and `chances` (0..100) config
    - remove `rollPercent` RNG gating
    - redesign as deterministic rank/select under constraints (spacing, thresholds, masks)
  - Update `plan-wetlands` step to orchestrate these atomic ops via step-owned sequencing (no op calls other ops).
- Acceptance:
  - Wet feature placement remains a first-class concept, but no longer depends on “disabled strategy” or probability knobs.
  - Step orchestration is the only grouping boundary; ops remain atomic.

### Slice 10: Reefs + ice planners redesign (remove density/jitter/probabilistic edges)

- Scope:
  - `ecology/features/plan-reefs`: remove density-as-probability posture; switch to deterministic selection under constraints.
  - `ecology/features/plan-ice`: remove `jitterC`, “probabilistic edge”, `densityScale` multipliers; switch to deterministic selection under constraints.
- Acceptance:
  - No probability knobs remain; results remain deterministic and legible.

### Slice 11: Plot effects redesign + effect tag

- Scope:
  - Remove `coverageChance`/probability posture from `ecology.ops.planPlotEffects` config.
  - Add an explicit effect tag in `plot-effects` step contract and tag registry so projection side-effects are gateable.
    - Contract: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
- Acceptance:
  - Plot effects are deterministic and tagged.

### Slice 12: Preset/config migration to new stage ids

- Scope:
  - Update all presets/configs that currently configure `ecology` to configure the new stages:
    - `mods/mod-swooper-maps/src/maps/configs/*.config.*`
    - `mods/mod-swooper-maps/src/presets/**`
  - Update any Studio/preset schemas if they assume the old stage id.
- Acceptance:
  - Standard recipe config schema defaults still materialize.
  - No legacy shim stage remains.

### Slice 13: Docs + catalogs updates

- Scope:
  - Update domain reference docs that currently state truth stage is `ecology`:
    - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
- Update any viz catalogs if new artifacts/steps introduce new dataTypeKeys (but preserve existing keys).

### Viz placement adjustment (explicit)

- Do not add a viz-only step.
- Emit viz where the work happens:
  - per-family intent viz inside `plan-<family>` steps
  - aggregated intent viz key `ecology.featureIntents.featureType` moves to `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts` because that step already reads all intent artifacts and aggregates them via `ecology.ops.applyFeatures`.
- Acceptance:
  - Canonical doc spine remains target-architecture-first and matches the new recipe topology.
