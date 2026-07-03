# Source Constructibility

Status: lane artifact
Scope: source-only, non-mutating investigation for future Layer 2 product/architecture authority packet work.
Prepared: 2026-07-01

## Evidence Standard

This lane treats source as evidence of current constructibility and current contradictions. It does not infer intended architecture from implementation alone. Positive authority creation means the source contains a named, typed, executable, or validated construct that a future packet can cite as implemented support. Source-only means the construct exists in code but needs product/architecture ratification before becoming authority.

Skills used:
- `civ7-architecture-authority`
- `civ7-product-authority`
- `investigation-design`

Primary source scope inspected:
- `packages/mapgen-core/src/authoring/artifact/**`
- `packages/mapgen-core/src/core/types.ts`
- `packages/mapgen-core/src/**`
- `mods/mod-swooper-maps/src/**`
- `apps/mapgen-studio/src/browser-runner/**`
- `apps/mapgen-studio/src/recipes/**`
- `packages/mapgen-viz/src/**`
- `packages/sdk/src/**`
- `packages/civ7-adapter/src/**`

## Constructible Authority Surfaces

### Artifact Contracts And Runtime

Status: currently implemented; strong positive authority candidate.

Evidence:
- `packages/mapgen-core/src/authoring/artifact/contract.ts`: `ArtifactContract`, `defineArtifact`
- `packages/mapgen-core/src/authoring/artifact/runtime.ts`: `implementArtifacts`, `ArtifactMissingError`, `ArtifactDoublePublishError`, `ArtifactValidationError`
- `packages/mapgen-core/src/core/types.ts`: `ArtifactStore`, artifact tag constants

Constructible claim:
- Artifacts are first-class contracts with schema validation, naming rules, `artifact:` tag identity, write-once publication, read/try-read APIs, and runtime validation.

Caveat:
- Source explicitly marks buffer artifacts and non-canonical story overlays as temporary exceptions pending a distinct buffer/dependency model.

### Step Contracts

Status: currently implemented; strong positive authority candidate.

Evidence:
- `packages/mapgen-core/src/authoring/step/contract.ts`: `StepContract`, `defineStep`
- `packages/mapgen-core/src/authoring/types.ts`: `StepDeps`

Constructible claim:
- Steps have named contract identity, phase, schema, requires/provides tags, artifact dependencies, operation dependencies, and validation that prevents direct artifact ids being mixed into ordinary tag deps when artifact deps are declared through `artifacts`.

### Stage Authoring And Public Config Surface

Status: currently implemented; positive authority candidate with a contradiction/tension noted below.

Evidence:
- `packages/mapgen-core/src/authoring/stage.ts`: `createStage`, `buildInternalAsPublicSurfaceSchema`, `compileStagePublicConfig`, `toInternal`
- `packages/mapgen-core/src/authoring/types.ts`: `StageConfigInput`, `StageAuthoringModel`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`: `compileRecipeConfig`

Constructible claim:
- A stage can expose either an internal step-key config surface or an explicit semantic public surface. The internal default shape is flat: `{ knobs?, [stepId]?: stepConfig }`.
- Explicit public stages must provide a compile function that maps public config into internal `{ knobs, rawSteps }`.
- The compiler validates stage ids, unknown step ids, step configs, and op configs.

### Recipe Module, Stage Order, And Compilation

Status: currently implemented; strong positive authority candidate.

Evidence:
- `packages/mapgen-core/src/authoring/recipe.ts`: `createRecipe`, `compileConfig`, `compile`, `run`, `runAsync`
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`: `standardMapRecipe`
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`: `standardStageContractManifest`, `orderStandardStages`, `orderStandardStageSteps`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`: stale `ecology` stage guard and strict compile checks

Constructible claim:
- Recipe order is source-owned and executable. The standard recipe currently constructs ordered stages and steps through a manifest and compiles configs before execution.
- The compiler contains an explicit stale-stage guard for `ecology`, instructing callers to use `ecology-pedology`, `ecology-biomes`, and `ecology-features`.

### Dependency Tags, Effect Tags, And Satisfaction

Status: currently implemented; positive authority candidate.

Evidence:
- `packages/mapgen-core/src/engine/tags.ts`: `DependencyTagKind`, `DependencyTagDefinition`, `TagRegistry`, `isDependencyTagSatisfied`
- `mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts`: field/effect tag constants
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`: `EFFECT_OWNERS`, `STANDARD_TAG_DEFINITIONS`, placement output satisfiers
- `packages/mapgen-core/src/engine/PipelineExecutor.ts`: missing/provided tag validation

Constructible claim:
- The implemented dependency taxonomy is `artifact`, `field`, and `effect`. Execution checks required tags before steps and provided tags after steps.
- Some effect tags have declared owners and typed satisfaction functions.

### Domain Operation Contracts And Strategies

Status: currently implemented; positive authority candidate.

Evidence:
- `packages/mapgen-core/src/authoring/domain.ts`: `defineDomain`, `createDomain`
- `packages/mapgen-core/src/authoring/op/contract.ts`: `defineOp`
- `packages/mapgen-core/src/authoring/op/create.ts`: `createOp`
- `packages/mapgen-core/src/authoring/op/types.ts`: `DomainOpKind`
- `packages/mapgen-core/src/authoring/bindings.ts`: `createDomainOpsSurface`, `collectCompileOps`
- `mods/mod-swooper-maps/src/domain/*/contract.ts`
- `mods/mod-swooper-maps/src/domain/*/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/*/ops/index.ts`

Constructible claim:
- Domains and operations are constructible as typed contracts with strategy-backed implementations. The op taxonomy is `plan`, `compute`, `score`, and `select`; comments reserve adapter reads, engine writes, buffer mutation, and artifact publication for steps.

### Split Ecology And Map Ecology Projection

Status: partially implemented; positive authority for topology, contradiction for stale source layout.

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`: stages include `ecology-pedology`, `ecology-biomes`, `ecology-features`, and later `map-ecology`
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`: standard stage/step membership
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-projection-public-config.ts`: map projection public schemas/descriptions
- `packages/mapgen-core/src/compiler/recipe-compile.ts`: stale `ecology` stage rejection

Constructible claim:
- Recipe topology implements the split ecology truth stages and a separate `map-ecology` projection stage.

Caveat:
- Source still contains and imports shared `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/*` files as a stage-neutral artifact/config hub. This supports current execution but contradicts a strict reading of the target cleanup to dissolve stale `stages/ecology/` authority.

### Hydrology Lake Truth And Map-Hydrology Projection

Status: currently implemented; strong positive authority candidate.

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/artifacts.ts`: `hydrologyHydrographyArtifacts.lakePlan`
- `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-hydrography/steps/lakes.ts`: publishes `lakePlan`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/artifacts.ts`: `engineProjectionLakes`, `hydrologyLakesEngineTerrainSnapshot`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-hydrology/steps/lakes.ts`: reads `lakePlan`, calls adapter materialization, publishes projection/readback artifacts
- `packages/civ7-adapter/src/civ7-adapter.ts`: `stampLakes`, `readLakeProjection`, compatibility `generateLakes`
- `packages/civ7-adapter/src/types.ts`: `LakeProjectionResult`

Constructible claim:
- Hydrology owns lake intent through `artifact:hydrology.lakePlan`. `map-hydrology` materializes that intent and records engine projection/readback evidence.
- The adapter still exposes official `generateLakes`, but source use of `lakePlan` plus `stampLakes` supports the intended truth/projection split.

### Placement Product/Effect Contracts And Typed Reconciliation

Status: currently implemented; strong positive authority candidate.

Evidence:
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts.ts`: `placementArtifacts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/*.ts`: one-file artifact contracts
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/plan-resources/contract.ts`: first-class resource planning effect contract
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-resources/contract.ts`: thin stamping contract
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-resources/index.ts`: typed outcomes and mismatch rejection
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-discoveries/contract.ts`: official discovery generator sequencing
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-discoveries/index.ts`: `DISCOVERY_PLACEMENT_V1` typed outcome logging
- `packages/civ7-adapter/src/types.ts`: `ResourcePlacementIntent`, `ResourcePlacementOutcome`, `DiscoveryPlacementIntent`, `DiscoveryPlacementOutcome`, `NaturalWonderPlacementOutcome`
- `packages/civ7-adapter/src/civ7-adapter.ts`: `placeResourceIntent`, `placeDiscoveryIntent`, natural wonder placement/readback paths

Constructible claim:
- Placement has source-level product/effect contracts for plans, adjusted plans, starts, discoveries, natural wonders, outcomes, and engine state.
- Resource and discovery placement are not simple `placed === planned` checks; they are typed reconciliation surfaces with explicit rejection and mismatch evidence.

### Adapter Boundary

Status: currently implemented; positive authority with a dev-only exception noted below.

Evidence:
- `packages/civ7-adapter/src/civ7-adapter.ts`: Civ7 runtime/global interaction surface, lake materialization/readback, resource/discovery/natural wonder placement
- `packages/civ7-adapter/src/types.ts`: typed adapter contracts
- `packages/mapgen-core/src/core/types.ts`: comments reserve engine API access for adapter and keep MapGen-authored randomness on `Env.seed`

Constructible claim:
- The adapter is the main implemented boundary for Civ7 engine globals and official runtime behavior.

### Studio Runtime And Viz Surfaces

Status: currently implemented; source-only support surface, not source of generation truth.

Evidence:
- `apps/mapgen-studio/src/browser-runner/protocol.ts`: `BrowserRunStartRequest`, `BrowserRunEvent`
- `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`: `RecipeRuntimeModule`, `getRuntimeRecipe`
- `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`: compile, mock adapter, trace/viz execution path
- `apps/mapgen-studio/src/recipes/catalog.ts`: `StudioRecipeUiMeta`, `RecipeArtifacts`, `STUDIO_RECIPE_ARTIFACTS`
- `packages/mapgen-viz/src/index.ts`: `VizLayerKey`, `VizManifestV1`, `VizLayerEmissionV1`

Constructible claim:
- Studio can execute recipe modules in the browser against generated recipe artifacts and a mock adapter, and viz layers have stable identity/manifest contracts.

Caveat:
- Studio metadata explicitly presents UI/navigation and generated artifacts as consumer surfaces, not editable product policy.

### SDK Mapgen Runtime Subpath And Generated Map Entries

Status: currently implemented; source-only support surface.

Evidence:
- `packages/sdk/src/index.ts`: SDK root comments keep Civ7 map generation on opt-in `@mateicanavra/civ7-sdk/mapgen`
- `packages/sdk/src/mapgen/createMap.ts`: runtime-bound `createMap`, adapter/context construction, recipe compile/run inside Civ7 map loader
- `packages/sdk/src/core/Mod.ts`: XML/mod authoring support
- `mods/mod-swooper-maps/src/maps/configs/canonical.ts`: canonical map config envelope
- `mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts`: generated map entry using SDK mapgen subpath

Constructible claim:
- The SDK has a separate mod-authoring surface and an opt-in runtime mapgen subpath. Product map configs are source records; generated map entries are outputs.

## Contradictions And Implemented Drift

1. Stale ecology hub remains in source.
   - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/*` is still imported by split ecology stages and placement metrics/live parity helpers.
   - Interpretation: split ecology stage topology is implemented, but stale shared ecology source layout has not been fully dissolved.

2. Official resource corpus/policy currently lives inside the resources domain.
   - Evidence: `mods/mod-swooper-maps/src/domain/resources/lib/corpus/types.ts`, `official-base-standard.ts`, `mods/mod-swooper-maps/src/domain/resources/artifacts/contract/corpus.contract.ts`, `earthlike-expectations.contract.ts`
   - Internal source note: `mods/mod-swooper-maps/src/domain/resources/artifacts/contract/note-to-dra-revised.md` says this likely belongs in a shared Civ7 map-policy/types package, not a specific domain.
   - Interpretation: current source supports constructibility of a resource corpus artifact, but contradicts the desired ownership boundary if official Civ7 policy/types should be shared rather than domain-owned.

3. Core has a direct Civ7 global introspection helper.
   - Evidence: `packages/mapgen-core/src/dev/introspection.ts` reads `globalThis.GameplayMap`, `TerrainBuilder`, `FractalBuilder`, and `AreaBuilder` for verbose diagnostics.
   - Interpretation: this appears dev-only and not the main runtime boundary, but it contradicts a strict statement that core never touches Civ7 globals. A future packet should either bless this as a diagnostic exception or move it behind the adapter/dev tooling boundary.

4. Public-stage compile surfaces exist for projection/no-op stages.
   - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/map-projection-public-config.ts` and multiple stages using `public` plus `compile`.
   - Interpretation: source does not show persisted SDK-native `advanced` config, and the default internal stage shape is flat. The remaining question is whether empty/no-op public+compile projection surfaces are intentional semantic public surfaces or residual boilerplate.

5. Browser Studio runtime depends on generated artifacts.
   - Evidence: `apps/mapgen-studio/src/recipes/catalog.ts` references generated standard artifacts/configs.
   - Interpretation: this is acceptable as a consumer/proof surface if generated artifacts remain outputs, but it should not be promoted as source authority for recipe/product policy.

## Source-Only Claims Requiring Ratification

- Stage public config metadata can be synthesized from operation schemas and descriptions.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-public-config.ts`
  - Source-only because this is an implementation helper and may not define product authority on its own.

- Placement UI public config intentionally exposes no authored discovery knobs.
  - Evidence: `mods/mod-swooper-maps/src/recipes/standard/stages/placement-public-config.ts`
  - Source-only because product authority should decide whether official discovery behavior remains adapter-owned and knobless.

- Viz layer identity and manifest keys are stable consumer contracts.
  - Evidence: `packages/mapgen-viz/src/index.ts`
  - Source-only because viz is projection/diagnostic infrastructure, not generation truth.

- SDK `createMap` is a legitimate runtime helper only through the mapgen subpath.
  - Evidence: `packages/sdk/src/index.ts`, `packages/sdk/src/mapgen/createMap.ts`
  - Source-only because public SDK contract boundaries should be ratified by docs/API policy.

- Resource corpus artifactization is constructible but ownership is unsettled.
  - Evidence: resources corpus files and internal `note-to-dra-revised.md`
  - Source-only because source itself flags likely wrong ownership.

## Missing Source Areas From This Lane Scope

- `packages/civ7-map-policy/src/**`: referenced by placement discovery and Studio mock adapter paths, likely important for official table/policy ownership.
- `packages/civ7-types/src/**`: likely relevant to shared official type ownership if resource/discovery policy moves out of `domain/resources`.
- `packages/civ7-direct-control/src/**`: runtime control is explicitly out of scope but may matter for adapter/runtime boundary packets.
- Package tests and generated output: intentionally not read as authority, except generated map entries were sampled only as output evidence.
- Full docs corpus beyond targeted authority/product docs: this lane used docs only to identify contradictions, not to re-decide architecture.

## Layer 2 Packet Implications

Recommended positive authorities to construct:
- Artifact contracts/runtime as the contract basis for cross-step truth.
- Step contracts as the unit of declared dependency/effect behavior.
- Stage authoring model with flat default internal config and explicit semantic public config compile.
- Recipe manifest/order as source-owned execution topology.
- Tag registry/effect ownership as the enforcement model for cross-step readiness.
- Domain operation contracts as pure planning/computation surfaces, with steps retaining side effects.
- Hydrology `lakePlan` truth and `map-hydrology` projection/readback as a clean truth/projection example.
- Placement typed intent/outcome contracts as the model for resources/discoveries/natural wonders.
- Adapter as the Civ7 engine boundary, with a named decision for any dev-only global introspection exception.

Recommended contradictions to resolve before or inside Layer 2:
- Decide whether the remaining `stages/ecology/*` hub is allowed as shared implementation support or must be removed/renamed to avoid false authority.
- Move or explicitly bless official resource corpus/policy ownership; source currently points both to domain ownership and to shared policy/type ownership.
- Decide whether empty public+compile projection surfaces are intentional semantic public surfaces or should collapse to flat internal defaults.
- Decide how far Studio generated artifacts can participate in proof without being mistaken for source authority.
