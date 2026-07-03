# Domino 001 Red Inventory

Status: active slice packet

This inventory is slice-local. It lists current paths and symbols expected to
go red when the selected scope set is activated. Shared criteria live in
`../../decision-book/`.

## State Labels

| State | Meaning |
| --- | --- |
| `Ready` | Domino 001 owns the later move or deletion. |
| `Ready with owner law` | Domino 001 owns the later burn-down and the exact destination is governed by a shared owner boundary. |
| `Owner-law pending` | The current row has a named owner-law domino that must define the destination before movement. |

Before any source-moving implementation starts, each `Ready` or
`Ready with owner law` row must be expanded to symbol/definition preservation:
`Preserved`, `Intentional loss`, or `Unresolved loss`. `Unresolved loss` blocks
implementation. `Intentional loss` requires consumer proof and authority
rationale.

## Root Contract Deletion

| Current path | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/ecology/contract.ts` | `Ready` | Duplicate authority deletion | Delete after import proof. |
| `mods/mod-swooper-maps/src/domain/foundation/contract.ts` | `Ready` | Duplicate authority deletion | Delete after import proof. |
| `mods/mod-swooper-maps/src/domain/hydrology/contract.ts` | `Ready` | Duplicate authority deletion | Delete after import proof. |
| `mods/mod-swooper-maps/src/domain/morphology/contract.ts` | `Ready` | Duplicate authority deletion | Delete after import proof. |
| `mods/mod-swooper-maps/src/domain/placement/contract.ts` | `Ready` | Duplicate authority deletion | Delete after import proof. |
| `mods/mod-swooper-maps/src/domain/resources/contract.ts` | `Ready` | Duplicate authority deletion | Delete after import proof. |

## Root Index Export Displacement

| Current path or export | State | Exact destination or action |
| --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/ecology/index.ts` exports from root helper files | `Ready` | Remove from root `index.ts`; move symbols according to ecology rows below. |
| `mods/mod-swooper-maps/src/domain/hydrology/index.ts` exports river helper surfaces | `Ready` | Remove from root `index.ts`; move symbols into hydrology model policy rows below. |
| `mods/mod-swooper-maps/src/domain/resources/index.ts` exports legacy `lib/` and model policy surfaces | `Ready` | Remove from root `index.ts`; public access is owned by a later public-surface law. |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` public exports | `Owner-law pending` | Gameplay/narrative owner-law domino selects the public surface. |

## Ecology Rows

| Current path or symbol | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/ecology/types.ts`: `BiomeSymbol`, `BIOME_SYMBOL_ORDER`, `BIOME_SYMBOL_TO_INDEX`, `biomeSymbolFromIndex` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/ecology/model/policy/biome-classification.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/types.ts`: official feature key ordering and feature placement key derivation | `Ready with owner law` | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/feature-placement.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/types.ts`: `PlotEffectKey` | `Ready with owner law` | Civ7 runtime adapter ownership | `packages/civ7-adapter/src/types.ts`; plot-effect typing routes to adapter ownership. |
| `mods/mod-swooper-maps/src/domain/ecology/feature-engine-legality.ts`: official feature terrain/biome legality derivation | `Ready with owner law` | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/feature-legality.ts`; ecology keeps internal-biome compatibility translation in `mods/mod-swooper-maps/src/domain/ecology/model/policy/feature-engine-legality.ts`. |
| `mods/mod-swooper-maps/src/domain/ecology/biome-bindings.ts` | `Ready with owner law` | Stage/projection ownership | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/biome-bindings.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/shared/placement-schema.ts` | `Ready` | Artifact contract extraction | `mods/mod-swooper-maps/src/domain/ecology/artifacts/contract/feature-intent-placement.contract.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared/index.ts`: `validateGridSize` | `Ready with owner law` | Core mechanics extraction | `packages/mapgen-core/src/lib/grid/validation.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared/index.ts`: `rampUp01`, `rampDown01`, `window01` | `Ready with owner law` | Core mechanics extraction | `packages/mapgen-core/src/lib/math/range.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared/index.ts`: `PhysicalCandidate`, confidence/stress conversion, candidate comparison/selection | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/ecology/model/policy/physical-candidate-selection.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/layers/classify.ts` | `Ready` | Operation-local implementation move | `mods/mod-swooper-maps/src/domain/ecology/ops/classify-biomes/rules/classify.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/policies/wetland-substrate-masks.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/policy/wetland-substrate-masks.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/compute-feature-substrate/policies/index.ts` | `Ready` | Duplicate authority deletion | Delete after imports point at `policy/wetland-substrate-masks.ts`. |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policies/admit-ice-intent.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policy/admit-ice-intent.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-ice/policies/index.ts` | `Ready` | Duplicate authority deletion | Delete after imports point at `policy/admit-ice-intent.ts`. |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policies/admit-reef-intent.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policy/admit-reef-intent.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-reefs/policies/index.ts` | `Ready` | Duplicate authority deletion | Delete after imports point at `policy/admit-reef-intent.ts`. |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policies/admit-vegetation-intent.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policy/admit-vegetation-intent.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-vegetation/policies/index.ts` | `Ready` | Duplicate authority deletion | Delete after imports point at `policy/admit-vegetation-intent.ts`. |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policies/admit-wetland-intent.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policy/admit-wetland-intent.ts` |
| `mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-wetlands/policies/index.ts` | `Ready` | Duplicate authority deletion | Delete after imports point at `policy/admit-wetland-intent.ts`. |

## Foundation Rows

| Current path or symbol | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/foundation/constants.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/foundation/model/policy/boundary-type.ts` |
| `mods/mod-swooper-maps/src/domain/foundation/shared/knobs.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must name each config object destination. |
| `mods/mod-swooper-maps/src/domain/foundation/shared/knob-multipliers.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must name each config object destination. |
| `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` | `Ready` | Operation-local implementation move | `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/rules/project-plates.ts` |

## Hydrology Rows

| Current path or symbol | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/hydrology/river-class.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/hydrology/model/policy/river-class.ts` |
| `mods/mod-swooper-maps/src/domain/hydrology/river-network-metrics.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/hydrology/model/policy/river-network-metrics.ts` |
| `mods/mod-swooper-maps/src/domain/hydrology/shared/knobs.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must name each config object destination. |
| `mods/mod-swooper-maps/src/domain/hydrology/shared/knob-multipliers.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must name each config object destination. |
| `HYDROLOGY_NAVIGABLE_RIVER_PROJECTION_POLICY` | `Ready with owner law` | Stage/projection ownership | `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/config.ts` |
| unused hydrology projection/refinement defaults in `mods/mod-swooper-maps/src/domain/hydrology/shared/knob-multipliers.ts` | `Ready` | Duplicate authority deletion | Delete after import proof. |
| `mods/mod-swooper-maps/src/domain/hydrology/ops/shared/wind-field.ts` | `Ready` | Artifact contract extraction | `mods/mod-swooper-maps/src/domain/hydrology/artifacts/contract/wind-field.contract.ts` |

## Morphology Rows

| Current path or symbol | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/morphology/shared/knobs.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must name each config object destination. |
| `mods/mod-swooper-maps/src/domain/morphology/shared/knob-multipliers.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must name each config object destination. |
| `mods/mod-swooper-maps/src/domain/morphology/ops.ts` config schema exports and `DEFAULT_ELEVATION_SCALE` | `Owner-law pending` | Operation-family decomposition | Morphology ops binding cleanup domino must split each export into an operation contract, model config file, or model policy file before root `ops.ts` enforcement. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-geomorphic-cycle/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/morphology/ops/compute-geomorphic-cycle/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sculpt-continental-margin/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sculpt-continental-margin/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/plan-island-chains/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/morphology/ops/plan-island-chains/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/plan-volcanoes/config.ts` | `Ready` | Operation contract consolidation | Inline config contract into `mods/mod-swooper-maps/src/domain/morphology/ops/plan-volcanoes/contract.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts` | `Ready` | Operation-local implementation move | `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/rules/derive-from-history.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/config.ts`: `MountainsConfigSchema`, `MountainsConfig` | `Ready` | Domain model config decomposition | `mods/mod-swooper-maps/src/domain/morphology/model/config/mountains.config.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/config.ts`: `assertSameMountainFamilySelection` and stable stringify helpers | `Ready with owner law` | Stage/projection ownership | `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/mountain-ranges-public-config.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/resolveBoundaryRegime.ts` and `resolveBoundaryStrength.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/morphology/model/policy/boundary-regime.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/computeOrogenyPotential.ts` and `computeFracturePotential.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/morphology/model/policy/orogenic-potential.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/computeMountainScore.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/morphology/model/policy/mountain-score.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/computeHillScore.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/morphology/model/policy/hill-score.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/resolveDriverStrength.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/morphology/model/policy/driver-strength.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/normalizeMountainFractal.ts` and `encodeNormalizedToU8.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/morphology/model/policy/terrain-score-encoding.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/computeDistanceToMask.ts` | `Ready with owner law` | Core mechanics extraction | `packages/mapgen-core/src/lib/grid/distance/mask.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/isStrictLocalMaximumHex.ts` | `Ready with owner law` | Core mechanics extraction | `packages/mapgen-core/src/lib/grid/local-extrema.ts` |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/util.ts` | `Ready with owner law` | Core mechanics extraction | Delete local file; replace clamp imports with `packages/mapgen-core/src/lib/math/clamp.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/types.ts` | `Ready` | Domain model config decomposition | Delete local file; imports use `MountainsConfig` from `mods/mod-swooper-maps/src/domain/morphology/model/config/mountains.config.ts`. |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules.ts` and `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/index.ts` | `Ready` | Operation-family decomposition | Delete after imports point at exact policy/core destinations. |

## Resources Rows

| Current path or symbol | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/resources/ops/derive-habitat-fields/note-to-agent.md` | `Ready` | Duplicate authority deletion | Delete. |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-aquatic-resources/signals.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/resources/ops/plan-aquatic-resources/policy/resource-signals.ts` |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/signals.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/policy/resource-signals.ts` |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/signals.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/policy/resource-signals.ts` |
| `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/signals.ts` | `Ready` | Operation-local policy move | `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/policy/resource-signals.ts` |
| `mods/mod-swooper-maps/src/domain/resources/lib/corpus/official-base-standard.ts` | `Ready with owner law` | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/resource-corpus.ts` |
| `mods/mod-swooper-maps/src/domain/resources/lib/corpus/types.ts` | `Ready with owner law` | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/resource-corpus.ts` |
| `mods/mod-swooper-maps/src/domain/resources/lib/corpus/index.ts` | `Ready with owner law` | Official Civ7 policy/resource ownership | Delete after `packages/civ7-map-policy/src/index.ts` exports the accepted resource corpus surface. |
| `mods/mod-swooper-maps/src/domain/resources/lib/corpus/runtime-ids.ts` | `Ready with owner law` | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/resource-runtime-ids.ts`; keep the proof against generated policy tables with the map-policy owner. |
| `mods/mod-swooper-maps/src/domain/resources/lib/earthlike-expectations/official-earthlike.ts` | `Ready` | Domain model data move | `mods/mod-swooper-maps/src/domain/resources/model/data/resource-planning-expectations/earthlike-resource-planning-expectations.ts` |
| `mods/mod-swooper-maps/src/domain/resources/lib/earthlike-expectations/types.ts` | `Ready` | Domain model data move | `mods/mod-swooper-maps/src/domain/resources/model/data/resource-planning-expectations/types.ts` |
| `mods/mod-swooper-maps/src/domain/resources/lib/earthlike-expectations/index.ts` | `Ready` | Duplicate authority deletion | Delete after consumers import `mods/mod-swooper-maps/src/domain/resources/model/data/resource-planning-expectations/earthlike-resource-planning-expectations.ts` and `mods/mod-swooper-maps/src/domain/resources/model/data/resource-planning-expectations/types.ts` directly. |
| `mods/mod-swooper-maps/src/domain/resources/policy/habitat-eligibility.ts` | `Ready` | Domain model policy promotion | `mods/mod-swooper-maps/src/domain/resources/model/policy/habitat-eligibility.ts` |
| `mods/mod-swooper-maps/src/domain/resources/policy/initial-map-authoring.ts` | `Owner-law pending` | Operation-family decomposition | Resources initial-map authoring policy split domino must separate domain policy from runtime adapter behavior. |
| `mods/mod-swooper-maps/src/domain/resources/policy/resource-legality.ts` | `Ready with owner law` | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/resource-legality.ts` |
| `mods/mod-swooper-maps/src/domain/resources/artifacts/contract/note-to-dra-revised.md` | `Ready` | Duplicate authority deletion | Delete after confirming the artifact contract inventory supersedes the note. |

## Root Config Rows

| Current path | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/config.ts` | `Owner-law pending` | Root aggregate disposition | Domain package public/import-surface domino must decide deletion or replacement. |
| `mods/mod-swooper-maps/src/domain/foundation/config.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must finish `foundation/shared/*` destinations before this barrel can be deleted. |
| `mods/mod-swooper-maps/src/domain/hydrology/config.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must finish `hydrology/shared/*` destinations before this barrel can be deleted. |
| `mods/mod-swooper-maps/src/domain/morphology/config.ts` | `Owner-law pending` | Domain model config decomposition | Domain config object decomposition domino must finish `morphology/shared/*` destinations before this barrel can be deleted. |
| `mods/mod-swooper-maps/src/domain/placement/config.ts` | `Owner-law pending` | Placement model disposition | Placement model config domino must decide whether `PlacementConfigSchema` belongs in `placement/model/config/placement.config.ts` or a stage owner. |

## Model Config Requirement Decision Rows

The planned domain-root TOML requires `model/`. The model scope currently names
`model/config/` as an optional slot while the config-law decision remains open.
Before implementation, current domain roots need exact config-object destinations
for real config material, a selected required-slot law with named files, or a
selected optional-slot treatment for domains without domain-authored config.

| Candidate path | State | Blocking owner-law domino |
| --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/ecology/model/config/` | `Owner-law pending` | Ecology model config requirement domino must name a real config object or select optional-slot treatment before implementation. |
| `mods/mod-swooper-maps/src/domain/foundation/model/config/` | `Owner-law pending` | Domain config object decomposition domino must name foundation config object files before implementation. |
| `mods/mod-swooper-maps/src/domain/hydrology/model/config/` | `Owner-law pending` | Domain config object decomposition domino must name hydrology config object files before implementation. |
| `mods/mod-swooper-maps/src/domain/morphology/model/config/` | `Owner-law pending` | Domain config object decomposition domino must name morphology config object files before implementation. |
| `mods/mod-swooper-maps/src/domain/placement/model/config/` | `Owner-law pending` | Placement model config domino must name the placement config object destination before implementation. |
| `mods/mod-swooper-maps/src/domain/resources/model/config/` | `Owner-law pending` | Resources model config requirement domino must name a real config object or select optional-slot treatment before implementation. |

## Foundation Root Library Rows

These root `lib/` rows are red under the domain scope. A foundation model/core
owner law must classify the symbols before execution.

| Current path | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/foundation/lib/crust/buoyancy.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/normalize.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/require.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/constants.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/events.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/fields.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/index.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/internal-contract.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/membership.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/provenance.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/rollups.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/schemas.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |
| `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts` | `Owner-law pending` | Foundation model/core disposition | Foundation model/core extraction domino must classify this symbol owner. |

## Placement And Narrative Rows

| Current path or class | State | Move class | Exact destination or action |
| --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/narrative/**` | `Owner-law pending` | Gameplay/narrative liveness and owner-law | Preserve source while the prework pass classifies live symbols, deletion rows, and later Gameplay/story-artifact destinations. |

## Expansion Evidence

The legacy glob rows were expanded from current source with:

```text
find mods/mod-swooper-maps/src/domain -maxdepth 5 \( -path '*/policies' -o -path '*/policy' -o -name 'config.ts' -o -name 'signals.ts' \) -print | sort
```
