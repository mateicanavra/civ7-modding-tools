# Scratch: Ecology Stage Split + Drift (2026-02-09)

Owner: `agent-codex` (spike worktree: `wt-agent-codex-spike-ecology-stage-split`)

Purpose: ongoing scratchpad for maximal drift analysis + remediation planning, with a focus on splitting the current ecology gameplay stage into multiple sensible stages that align with MapGen target architecture (engine-refactor-v1 posture).

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
  - vegetation pipeline: `score-vegetation` -> `plan-vegetation`
  - wetlands pipeline: `score-wetlands` (optional) -> `plan-wetlands` (includes atomic wet placement planners orchestrated here)
  - marine/cryosphere: `plan-reefs`, `plan-ice`
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
