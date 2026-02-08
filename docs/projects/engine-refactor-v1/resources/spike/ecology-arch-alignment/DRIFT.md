# DRIFT: Ecology vs Target Architecture (Evidence-Backed)

## Objective

Produce a drift matrix between the target architecture invariants and the current ecology implementation.

## Where To Start (Pointers)

Target architecture anchors:
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

Current ecology code anchors:
- `mods/mod-swooper-maps/src/domain/ecology/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/**`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`

## Drift Matrix (Evidence-Backed)

### 1) Ops vs Steps separation

- **Invariant:** Ops are algorithm units; steps orchestrate and bind ops; orchestration must not live in ops.
  - Sources: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- **Current reality:** Ecology ops appear pure (no adapter/artifact store), and orchestration is step-owned.
  - Evidence: no `@civ7/adapter`, `deps.artifacts`, or `context.adapter` usage under `mods/mod-swooper-maps/src/domain/ecology/ops/**`.
- **Drift:** `features-plan` step imports domain ops directly for optional placement ops (`planVegetatedFeaturePlacements`, `planWetFeaturePlacements`), bypassing contract-injected ops.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts` imports `@mapgen/domain/ecology/ops`.
- **Why it matters:** Compiler-owned op binding/defaulting/normalization is undermined; contract mismatch risk.
- **Refactor shape note:** Move this wiring behind compiler-owned binding/normalization, but account for `contract.ops` prefill semantics:
  - Declaring an op under `contract.ops` will prefill its `defaultConfig` (so “presence” is not a safe optionality signal).
  - Feasibility-stage default: model `vegetatedFeaturePlacements` / `wetFeaturePlacements` as step-owned orchestration config and translate into internal per-feature op envelopes (see `DECISIONS/DECISION-features-plan-advanced-planners.md`).

### 2) Stage compile boundary (config compilation)

- **Invariant:** Stages compile public config into per-step config; compilation is strict and owns normalization.
  - Sources: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`, `packages/mapgen-core/src/compiler/recipe-compile.ts`
- **Current reality:** Ecology and map-ecology stages implement `createStage` with strict public schemas and explicit compile mapping.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`, `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`.
- **Drift:** Because optional placement ops are not declared in the step contract, their envelopes are not compiler-prefilled/validated by the usual `prefillOpDefaults`/`normalizeOpsTopLevel` path.
  - Evidence: `packages/mapgen-core/src/compiler/normalize.ts` only processes declared `contract.ops`; contrast with `features-plan` config fields and implementation calls.
- **Why it matters:** “No behavior change refactor” becomes harder because config/normalize semantics are partly manual.
- **Refactor shape note:** Put all runtime op envelopes behind `contract.ops`, but only after we lock an explicit “disabled/fallback” strategy or compile-time translation for optional toggles so prefill does not change behavior (see `FEASIBILITY.md`).

### 3) Truth vs projection boundary

- **Invariant:** Truth stages produce engine-agnostic artifacts; projection stages apply to engine/adapter and provide effect tags.
  - Sources: `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`, `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- **Current reality:** Ecology truth steps do not call adapter; map-ecology steps call adapter to set biomes/features and to add plot effects.
  - Evidence: adapter calls in `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/**`; none in `.../stages/ecology/**`.
- **Drift:** `plot-effects` applies adapter writes but does not provide an effect tag.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts` provides none, while `.../index.ts` calls `context.adapter.addPlotEffect`.
- **Why it matters:** Downstream gating cannot express “plot effects applied,” and the step’s side-effects are less legible in the plan.
- **Refactor shape note:** Decide whether plot effects should be a first-class “effect guarantee” (add tag) or explicitly remain best-effort/no-gate.

### 4) Schemas/validation posture

- **Invariant:** Strict schema validation; avoid best-effort defaults in steps.
  - Sources: `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`, compiler code in `packages/mapgen-core/src/compiler/*`.
- **Current reality:** Steps have schemas (even if empty objects) and compilation is strict.
  - Evidence: `createStep` requires explicit schema (`packages/mapgen-core/src/authoring/step/create.ts`).
- **Drift:** Ecology truth artifact schemas in `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/artifacts.ts` use many `Type.Any()` placeholders.
  - Evidence: `BiomeClassificationArtifactSchema`, `PedologyArtifactSchema`.
- **Why it matters:** Contract docs say schemas are strict; in practice runtime validation happens in custom validators. This is acceptable as an implementation detail but increases drift risk.
- **Refactor shape note:** Keep runtime validation as the functional gate for now (behavior-preserving), but document in drift matrix and decide later where to tighten schemas.

### 5) Dependency gating (requires/provides)

- **Invariant:** Dependencies should be explicit and validated by the executor; steps must not reimplement gating.
  - Sources: `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`, `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
- **Current reality:** Ecology truth steps primarily use artifact requires/provides; map-ecology steps provide `field:*` tags and `effect:*` tags.
  - Evidence: step contracts under `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/**/contract.ts` and `.../map-ecology/steps/**/contract.ts`.
- **Drift:** None obvious in ecology truth steps.
- **Edge:** in-place mutation of `artifact:ecology.biomeClassification` by `biome-edge-refine` means the artifact’s value depends on ordering even though no tag expresses the refinement boundary.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts`.
- **Why it matters:** If any future step wants to “require refined biomes,” we currently have no explicit gate.
- **Refactor shape note:** Either treat `biome-edge-refine` as the definitive publisher (republish refined artifact) or introduce explicit modeling (separate artifact/effect) if needed.

### 6) Viz emission posture (keys stability)

- **Invariant:** Viz keys (`dataTypeKey`, `spaceId`, kind/role/variant) are part of the observability contract.
  - Source: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- **Current reality:** Ecology emits a stable set of keys under `ecology.*` and `map.ecology.*`.
  - Evidence: `rg -n dataTypeKey ...` (see `_scratch/agent-deckgl.md`).
- **Drift:** None, but this is a hard compatibility surface to protect during refactor.

## Open Questions

- Do we want to model `biome-edge-refine` as an explicit boundary (republish refined artifact), or accept in-place mutation as a publish-once buffer handle pattern?
- Should plot effects be a first-class effect tag in `mods/mod-swooper-maps/src/recipes/standard/tags.ts`?

## Suggested Refactor Shapes (Conceptual Only)

- Eliminate direct domain imports from steps (all ops via contract.ops injection).
- Decide and document artifact mutability posture.
- Preserve viz keys and step ids as compatibility surfaces.
