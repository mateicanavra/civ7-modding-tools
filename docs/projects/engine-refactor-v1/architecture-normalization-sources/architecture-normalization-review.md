# Source Material Notice

This document is preserved for provenance only. The active normalization
authority is `../architecture-normalization-packet.md`.

# MapGen Architecture Normalization Review

Status: `source-material-only`.
Branch: `codex/mapgen-architecture-normalization-review`.
Date: `2026-05-29`.

This is a review artifact, not architecture authority. It synthesizes the intended architecture from canonical docs and current code, assesses the standard recipe stages/phases against that target, and proposes a normalization plan.

## Review Team

- Main synthesis: authority model, stage assessment, normalization plan.
- Agent Gauss: authoritative docs and stale/conflicting doc gravity.
- Agent Locke: implementation shape and stage/phase assessment.
- Agent Pasteur: DX friction and hidden architecture mismatch.

## Authority Stack

Use the following order when deciding target architecture:

1. Canonical MapGen entrypoints and indices:
   - `docs/system/libs/mapgen/MAPGEN.md`
   - `docs/system/libs/mapgen/reference/REFERENCE.md`
   - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
   - `docs/system/libs/mapgen/policies/POLICIES.md`
2. Contract references:
   - `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`
   - `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
   - `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
   - `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
3. Accepted decisions and target specs:
   - `docs/system/ADR.md`
   - `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
   - `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
   - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
4. Current code as implementation evidence:
   - `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
   - `packages/mapgen-core/src/authoring/stage.ts`
   - `packages/mapgen-core/src/compiler/recipe-compile.ts`

Important caveat: some docs that look canonical are stale. `docs/system/libs/mapgen/architecture.md` is only a legacy router. `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` is canonical in intent but stale for Ecology because it lists a single `ecology` stage while the recipe now has seven split Ecology truth stages.

## Intended Architecture

The intended architecture is a recipe-owned, compile-first pipeline with explicit stage and step contracts:

- Domains own pure ops, strategies, rules, and shared semantics.
- Steps orchestrate runtime inputs, call domain ops, write buffers or adapter effects, and publish artifacts.
- Stages own the author-facing config surface: `knobs` plus optional public config, compiled by `stage.toInternal(...)` into per-step config.
- Recipes own ordering and enablement. There is no independent stage manifest.
- Config compilation owns strict validation, defaults, step normalization, and op envelope normalization before execution.
- Execution runs an already-compiled plan with explicit dependency gating and artifact access.
- Truth products and projection/materialization are separate. Truth stages publish domain artifacts; `map-*`/Gameplay stages project those artifacts into engine state and effect tags.
- Good DX is part of the architecture: entrypoints should route to live authority, config surfaces should be stage-scoped and strict, and a developer should not need to know generated dist artifacts or hidden sub-pipelines to understand what a stage does.

The target explicitly rejects the old architecture shape:

- no `morphology-pre/mid/post` as current stage authority,
- no global mega config object as runtime truth,
- no hidden enablement or silent skips,
- no adapter/engine generation as unmodeled authority for a surface that the pipeline claims to own,
- no split-brain docs where project scratch or old routers look more actionable than canonical docs.

## Current Standard Recipe

The actual standard recipe has 19 stages:

1. `foundation`
2. `morphology-coasts`
3. `morphology-routing`
4. `morphology-erosion`
5. `morphology-features`
6. `hydrology-climate-baseline`
7. `hydrology-hydrography`
8. `hydrology-climate-refine`
9. `ecology-pedology`
10. `ecology-biomes`
11. `ecology-features-score`
12. `ecology-ice`
13. `ecology-reefs`
14. `ecology-wetlands`
15. `ecology-vegetation`
16. `map-morphology`
17. `map-hydrology`
18. `map-ecology`
19. `placement`

`recipe.ts` is the ordering source of truth. `STANDARD-RECIPE.md` must be corrected to match it.

## Stage Assessment

| Area | Assessment | Evidence | What it means |
| --- | --- | --- | --- |
| Foundation | Cleanest reference implementation. | `foundation/index.ts` is one stage with explicit steps and knobs; Foundation docs describe mesh truth and tile projection. | Treat Foundation as the main end-to-end pattern for step contracts, artifact publication, ops, and authoring DX. |
| Morphology truth | Mostly aligned. | ADR-006 accepts `morphology-coasts/routing/erosion/features`; `MORPHOLOGY.md` matches current code; old `morphology-pre/mid/post` is explicitly superseded. | Close to target. Remaining work is mostly stale docs/tooling references and verifying no old ids remain outside archives. |
| `map-morphology` | Mostly aligned projection stage. | It consumes Morphology truth, stamps engine state, and guards no-water drift. | Good example of truth-to-engine projection. Keep improving effect naming and projection artifacts, but it follows the model. |
| Hydrology climate/hydrography | Mostly aligned. | Split stages publish climate, wind, hydrography, and diagnostics artifacts via explicit contracts. | The truth side follows the target better than the projection side. |
| `map-hydrology` lakes | Transitional. | `lakes.ts` delegates lake creation to `adapter.generateLakes(...)`; mismatch is telemetry, not a fail-hard contract. | This conflicts with the stronger mod doc claim that lake plan vs engine water mask mismatch is fail-hard. Decide whether lakes are engine-owned projection telemetry or pipeline-owned deterministic plan, then document and implement one path. |
| Ecology truth | Architecturally in motion. | Code has seven split stages, but `ECOLOGY.md` and `STANDARD-RECIPE.md` still describe a single `ecology` truth stage. Split wrappers import steps from `../ecology/steps`, preserving the old stage as source-layout gravity. | The recipe shape has moved toward target, but docs and file layout still teach the old shape. Normalize before using Ecology as a reference pattern. |
| `map-ecology` | Mostly aligned projection stage. | It consumes Ecology truth artifacts and publishes engine-facing fields/effects. | Projection posture is reasonable, but stale Ecology docs make the boundary harder to learn. |
| Placement | Not clean target-state. | Stage has three visible steps, but final `placement` step delegates a long hidden sequence in `apply.ts`; discoveries/resources use official generators as runtime authority. | Placement has target pieces, but it is not normalized. It needs visible sub-step boundaries or explicit documentation that the final step is a compatibility/materialization wrapper with off-ramp. |
| Gameplay / domain naming | Transitional. | Docs say Placement and Narrative are legacy names absorbed by Gameplay; code still exports `placement` and `narrative` domains and registers `placementDomain`. | DX split-brain. Either finish the Gameplay absorption or document the current names as accepted operational layer names. |
| Core SDK purity | Divergent. | `packages/mapgen-core/AGENTS.md` says no direct Civ7 imports; `packages/mapgen-core/src/authoring/maps/index.ts` imports Civ7 adapter and reads Civ globals. | The `authoring/maps` entrypoint should move out of pure core or be explicitly marked Civ7-bound. |
| Studio recipe exports | DX mismatch. | Docs say the standard recipe publishes `STANDARD_RECIPE_CONFIG_SCHEMA` and `STANDARD_RECIPE_CONFIG`; source recipe exports stages/types/ops and default recipe, while constants are generated into `dist`. | Developers have to know generated artifacts and custom tsup alias behavior. Move the contract into source or make generation a first-class documented source contract. |
| Routers / entrypoints | Poor DX. | `packages/mapgen-core/AGENTS.md` points to legacy `architecture.md` and missing `design.md`/`climate.md`; mod routers repeat the legacy architecture link. | Fix these first. They are high-leverage because they shape every future agent's initial reading path. |

## Answer To The Core Questions

Yes, some stages/phases implement the intended architecture the right way end-to-end:

- Foundation is the clearest clean reference.
- Morphology is close enough to serve as a pattern for truth/projection split, especially with ADR-006 and `MORPHOLOGY.md` as authority.
- `map-morphology` is a solid projection/materialization example.

Some areas roughly follow the architecture but need normalization:

- Hydrology truth stages are mostly aligned, but `map-hydrology` lakes are transitional.
- Ecology implementation has moved toward the architecture, but docs and source layout still preserve the old single-stage mental model.
- `map-ecology` is likely fine after Ecology docs/layout are normalized.

Some areas need real refactoring or explicit target correction:

- Placement is a hidden sub-pipeline behind one broad step and still delegates discoveries/resources to official engine generators.
- Core SDK has a Civ7-bound `authoring/maps` public surface despite pure-core claims.
- Studio recipe config exports are generated/source-split in a way that violates the intended DX.
- The doc routers are actively misleading and should be fixed before new architecture work.

## Normalization Plan

### Slice 1: Fix authority routing and stale canonical docs

Goal: remove the highest-risk doc gravity before more implementation work.

- Update `packages/mapgen-core/AGENTS.md`, `mods/mod-swooper-maps/AGENTS.md`, and `mods/mod-swooper-maps/src/AGENTS.md` to point directly at:
  - `docs/system/libs/mapgen/MAPGEN.md`
  - `docs/system/libs/mapgen/reference/REFERENCE.md`
  - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
  - `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
  - relevant domain reference pages.
- Fix or remove references to missing `design.md` and `climate.md`.
- Update `STANDARD-RECIPE.md` to the actual 19-stage order.
- Update `ECOLOGY.md` to describe the split Ecology stages and mark the old single `ecology` stage as superseded.
- Add a guardrail check: non-archive docs should not mention old current-stage ids like `morphology-pre/mid/post` except in explicit migration/history sections.

### Slice 2: Normalize Ecology source layout and docs

Goal: make Ecology as legible as the recipe already claims it is.

- Stop using `stages/ecology/steps` as the source home for split-stage steps unless it is explicitly renamed to a shared, non-stage directory.
- Prefer colocating each step under the actual stage that owns it:
  - `ecology-pedology/steps/*`
  - `ecology-biomes/steps/*`
  - `ecology-features-score/steps/*`
  - `ecology-ice/steps/*`
  - `ecology-reefs/steps/*`
  - `ecology-wetlands/steps/*`
  - `ecology-vegetation/steps/*`
- Keep shared artifacts/validators in a stage-neutral shared module with a name that does not imply a live `ecology` stage.
- Align `ECOLOGY.md`, Studio docs, and tests to the split-stage names.
- Add an inventory check that recipe stages and canonical standard-recipe docs agree.

### Slice 3: Decide and normalize Hydrology lakes

Goal: remove the contradiction between "pipeline truth" and engine lake generation authority.

Choose one target:

- Pipeline-owned lakes: publish a deterministic lake intent/plan artifact, make projection fail-hard on material drift, and use engine calls only as stamping/materialization.
- Engine-owned lakes: document lakes as engine projection telemetry, rename artifacts and docs so they do not imply deterministic lake truth, and remove fail-hard claims.

The current implementation is closer to engine-owned telemetry. The current mod architecture prose is closer to pipeline-owned truth. That contradiction should be resolved before refactoring code.

### Slice 4: Split or reframe Placement

Goal: make placement boundaries visible to recipe compilation and dependency validation.

- If Placement remains target-owned deterministic pipeline work:
  - split the final `placement` step into visible steps for wonders, floodplains, discoveries, resources, starts, fertility/advanced starts, and parity capture where those are independent contract boundaries;
  - model each concern with op contracts and explicit artifact/effect tags;
  - remove official generator authority or isolate it behind explicitly named compatibility projection steps.
- If official generators remain primary for discoveries/resources:
  - document those surfaces as engine-owned materialization, not deterministic plan truth;
  - mark deterministic resource/discovery plans as diagnostics/parity artifacts;
  - add an off-ramp or acceptance decision so future agents do not keep trying to make a contradictory target true.

### Slice 5: Fix package boundary and Studio config DX

Goal: make the public authoring surfaces match the architecture claims.

- Move Civ7-bound `createMap`/engine event glue out of `@swooper/mapgen-core` pure core, or split the public export into a clearly Civ7-bound package/entrypoint.
- Make standard recipe config schema/default exports source-visible, or document the generation path as the canonical source and add tests that prove generated exports match the source recipe.
- Reduce custom alias/dist knowledge needed for Studio recipe imports. The best DX is: import a source-owned recipe contract and run a documented build, not infer hidden generated files.

### Slice 6: Add convergence guardrails

Goal: keep the repo from drifting back to the bad architecture.

- Check `STANDARD-RECIPE.md` stage list against `STANDARD_STAGES`.
- Fail on non-archive docs that refer to old current stage ids unless allowlisted.
- Check router links for missing files.
- Check that stage ids in docs match recipe ids.
- Check no new adapter imports enter pure core surfaces.
- Check broad steps like Placement do not grow hidden concerns without an explicit finding/deferral.

## Recommended Next Action

Do Slice 1 first. It is the cheapest and highest-leverage cleanup because it stops future agents from entering through stale authority. Then run Slice 2 for Ecology, because Ecology is already structurally split in code but still teaches the old model in docs and layout. After that, Hydrology lakes and Placement need explicit architecture decisions before implementation, because they are real target/current contradictions rather than just stale references.

## Residual Gaps

This review is evidence-backed but not a full code migration. It does not:

- update canonical docs yet,
- refactor Ecology layout,
- resolve the Hydrology lakes authority decision,
- split Placement,
- move Civ7-bound map authoring out of core,
- or add the proposed convergence checks.

Those are the proposed normalization slices.
