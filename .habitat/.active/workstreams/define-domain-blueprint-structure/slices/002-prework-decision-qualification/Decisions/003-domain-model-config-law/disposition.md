# Domain Model Config Law Disposition

Status: reviewed and accepted for execution-plan hardening

Prepared at: 2026-07-04

## Frame

This pass revisits the config-law corpus after destination rails were defined.
It does not authorize source edits by itself. It produces the deterministic
row ledger that the later execution plan consumes.

Accepted owner classes:

- operation contracts own operation input, output, strategy, and default
  schemas;
- recipe stages own authoring surfaces, `knobsSchema`, public schemas,
  public-to-internal compile behavior, projection authoring, and stage-local
  helpers;
- domain `model/schemas` owns reusable semantic schema primitives, not full
  operation envelopes or stage authoring surfaces;
- domain `model/policy` owns reusable semantic constants, lookup tables,
  defaults, resolver functions, and multiplier policy;
- artifact files own artifact payload shape and validation support;
- official Civilization 7 vocabulary is not domain-owned by default:
  type-only runtime declarations belong to `@civ7/types`, pure official map
  policy facts belong to `@civ7/map-policy`, and runtime/global access belongs
  to the adapter boundary;
- root/per-domain `config.ts` files are transitional facades or stale
  aggregates, not owners.

## Coverage Reconciliation

| Source set | Coverage owner | Status |
| --- | --- | --- |
| Durable corpus rows: root/per-domain facades, shared knobs/multipliers, operation-local config files, primitive leads, resource lead, stage helper rows | Steward synthesis from all lanes | covered |
| Public Stage Surface Table rows | Facade and stage authoring lane | covered |
| Domain Primitive And Operation Overlap rows | Primitive hunter plus operation/policy lanes | covered |
| Facade And Import Pressure rows | Facade lane plus policy lane | covered |
| New primitive candidates discovered during second pass | Primitive hunter | covered |
| Former outside-scope resource expectation row | closed in `resource-policy-data-contract.domino.md` | covered as `closed` |

No canonical row is omitted. Group rows below are expanded where the action or
proof differs by owner.

## Row Disposition Table

| Row | Path/symbol | Current role | Final action | Exact owner/destination | Explicit non-owner | Required proof | Evidence strength | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D01 | `mods/mod-swooper-maps/src/domain/config.ts` | root config barrel | delete | none after facade retirement | domain config authority | source plus generated/public import zero | verified | only re-exports morphology and placement config |
| D02 | `domain/foundation/config.ts` | foundation facade over shared knobs/policy | reroute | rows K01-K03 for stage-local knobs; row P01 for `foundation/model/policy/plate-activity.ts` and `foundation/model/policy/crust-character.ts` | per-domain config | all imports moved, then zero-import proof | verified | not an owner |
| D03 | `domain/hydrology/config.ts` | hydrology facade over knobs/policy | reroute | rows K04a-K04d for stage-local knobs; rows P02-P03 for hydrology policy and map-rivers projection policy | per-domain config | imports and test import rerouted, then zero-import proof | verified | split navigable river projection from hydrology truth |
| D04 | `domain/morphology/config.ts` | morphology facade over knobs/policy | reroute | rows K05a-K05d for stage-local knobs; rows P04a-P04d for exact morphology policy files | per-domain config | imports moved and existing facade rule retired/updated | verified | existing rule is transitional |
| D05 | `domain/placement/config.ts` / `PlacementConfigSchema` | stale aggregate op config schema | delete | `placement` stage public surface plus operation contracts | placement domain config | source/generated import zero | verified | source usage is definition only |
| K01 | `foundation/shared/knobs.ts` / `FoundationPlateCountKnobSchema` | shared plate-count stage knob | recompose | `foundation-lithosphere` and `foundation-mantle` stage authoring surfaces | operation contracts; foundation config facade | stage-local schema/import proof | corroborated | duplicate/localize rather than invent cross-stage authoring owner |
| K02 | `foundation/shared/knobs.ts` / plate activity knob | tectonics stage knob | reroute | `recipes/standard/stages/foundation-tectonics` stage-local authoring | domain policy; operation contract | stage import proof | verified | resolver policy is separate |
| K03 | `foundation/shared/knobs.ts` / continental knobs | orogeny stage knobs | reroute | `recipes/standard/stages/foundation-orogeny` stage-local authoring | domain policy; operation contract | stage import proof | verified | coupled authoring surface stays with stage |
| P01 | `foundation/shared/knob-multipliers.ts` | plate/crust authoring resolvers | move | `foundation/model/policy/plate-activity.ts`; `foundation/model/policy/crust-character.ts` | model schemas; config facade | symbol-level reroute proof | corroborated | reusable semantic policy, not schema |
| K04a | `hydrology/shared/knobs.ts` / `HydrologyDrynessKnobSchema`, `HydrologyTemperatureKnobSchema` | shared climate authoring presets | recompose | duplicate/localize in `hydrology-climate-baseline/index.ts` and `hydrology-climate-refine/index.ts` `knobsSchema` surfaces | hydrology config facade; operation contracts; model schemas | both stage imports prove local ownership | corroborated | shared only because the facade hides two stage owners |
| K04b | `hydrology/shared/knobs.ts` / `HydrologySeasonalityKnobSchema`, `HydrologyOceanCouplingKnobSchema` | baseline climate authoring presets | reroute | `recipes/standard/stages/hydrology-climate-baseline/index.ts` `knobsSchema` | hydrology config facade; operation contracts; model schemas | stage import proof | verified | baseline-only authoring |
| K04c | `hydrology/shared/knobs.ts` / `HydrologyCryosphereKnobSchema` | refine climate authoring preset | reroute | `recipes/standard/stages/hydrology-climate-refine/index.ts` `knobsSchema` | hydrology config facade; operation contracts; model schemas | stage import proof | verified | refine-only authoring |
| K04d | `hydrology/shared/knobs.ts` / `HydrologyRiverDensityKnobSchema`, `HydrologyLakeinessKnobSchema` | hydrography authoring presets | reroute | `recipes/standard/stages/hydrology-hydrography/index.ts` `knobsSchema` | hydrology config facade; operation contracts; model schemas | stage import proof | verified | Hydrology truth authoring, not map-rivers projection |
| P02 | `hydrology/shared/knob-multipliers.ts` except navigable projection | hydrology climate/hydrography policy tables | move | `hydrology/model/policy/climate-knob-policy.ts`; `hydrology/model/policy/hydrography-knob-policy.ts` | model schemas; config facade | symbol-level reroute proof | corroborated | dryness/temp/seasonality/ocean/lake/river-density policy |
| P03 | `HYDROLOGY_NAVIGABLE_RIVER_PROJECTION_POLICY` | Civ-visible river projection policy | move | `recipes/standard/stages/map-rivers/riverProjectionPolicy.ts` | hydrology model policy; hydrology config facade | Narsil/reference proof and stage reroute | verified | projection policy, not Hydrology truth policy |
| K05a | `morphology/shared/knobs.ts` / `MorphologySeaLevelKnobSchema`, `MorphologyCoastRuggednessKnobSchema` | coasts stage authoring presets | reroute | `recipes/standard/stages/morphology-coasts/index.ts` `knobsSchema` | morphology config facade; operation contracts; model schemas | stage import proof | verified | coasts-only authoring |
| K05b | `morphology/shared/knobs.ts` / `MorphologyErosionKnobSchema` | erosion stage authoring preset | reroute | `recipes/standard/stages/morphology-erosion/index.ts` `knobsSchema` | morphology config facade; operation contracts; model schemas | stage import proof | verified | erosion-only authoring |
| K05c | `morphology/shared/knobs.ts` / `MorphologyShelfWidthKnobSchema` | shelf stage authoring preset | reroute | `recipes/standard/stages/morphology-shelf/index.ts` `knobsSchema` | morphology config facade; operation contracts; model schemas | stage import proof | verified | shelf-only authoring |
| K05d | `morphology/shared/knobs.ts` / `MorphologyVolcanismKnobSchema`, `MorphologyOrogenyKnobSchema` | features stage authoring presets | reroute | `recipes/standard/stages/morphology-features/index.ts` `knobsSchema` | morphology config facade; operation contracts; model schemas | stage import proof | verified | landform feature authoring |
| P04a | `morphology/shared/knob-multipliers.ts` / sea-level and coast ruggedness tables | coasts transform policy | move | `morphology/model/policy/coast-knob-policy.ts` | model schemas; config facade | symbol-level reroute proof | corroborated | deterministic morphology policy consumed by coasts steps |
| P04b | `morphology/shared/knob-multipliers.ts` / erosion table | erosion transform policy | move | `morphology/model/policy/erosion-knob-policy.ts` | model schemas; config facade | symbol-level reroute proof | corroborated | deterministic morphology policy consumed by erosion step |
| P04c | `morphology/shared/knob-multipliers.ts` / shelf-width table | shelf transform policy | move | `morphology/model/policy/shelf-knob-policy.ts` | model schemas; config facade | symbol-level reroute proof | corroborated | deterministic morphology policy consumed by shelf step |
| P04d | `morphology/shared/knob-multipliers.ts` / volcanism and orogeny tables | landform transform policy | move | `morphology/model/policy/landform-knob-policy.ts` | model schemas; config facade | symbol-level reroute proof | corroborated | deterministic morphology policy consumed by feature steps |
| O01 | `foundation/ops/compute-crust-evolution/config.ts` / `CrustEvolutionConfigSchema` | operation strategy schema | inline | `foundation/ops/compute-crust-evolution/contract.ts` | stage authoring; model schemas; config facade | import refs and type/check proof | verified | no official-vocabulary content |
| O02 | `morphology/ops/compute-base-topography/config.ts` / `ReliefConfigSchema` | operation strategy schema borrowed by stage public surface | inline | `morphology/ops/compute-base-topography/contract.ts` | stage authoring; model schemas | stage public `relief` recomposition proof | verified | prerequisite-coupled to stage cleanup |
| O03 | `compute-coastline-metrics/config.ts` / coastline config schemas | operation envelope with nested coast fragments | recompose | operation envelope in `compute-coastline-metrics/contract.ts`; stage public shape remains stage-owned | generic shared config; model schemas by name | op import proof plus stage public reroute | verified | bay/fjord/plateBias are not accepted primitives |
| O04 | `compute-geomorphic-cycle/config.ts` / `GeomorphologyConfigSchema`, `WorldAgeSchema` | operation strategy fragments | inline | `compute-geomorphic-cycle/contract.ts` | stage public authoring; model schemas by enum name | local reference proof | verified | `WorldAgeSchema` is operation-local posture |
| O05 | `compute-sculpt-continental-margin/config.ts` / `SculptContinentalMarginConfigSchema` | operation strategy schema borrowed by stage public surface | inline | `compute-sculpt-continental-margin/contract.ts` | stage authoring; model schemas | stage `continentalMargin` recomposition proof | verified | physics ratios, not Civ7 ids |
| O06 | `compute-sea-level/config.ts` / `HypsometryConfigSchema` | operation strategy schema borrowed by stage public surface | inline | `compute-sea-level/contract.ts` | stage authoring; model schemas by concept name | stage `waterCoverage` recomposition proof | verified | hypsometry config is not primitive by itself |
| O07 | `plan-island-chains/config.ts` / `IslandsConfigSchema`, `IslandChainsConfigSchema` | operation envelope borrowed by stage public surface | recompose | `plan-island-chains/contract.ts`; stage-local `islandChains` public shape | generic config; model schemas by name | stage public reroute and contract proof | verified | screen terrain literals against Civ7 rail if promoted later |
| O08 | `plan-volcanoes/config.ts` / `VolcanoesConfigSchema` | operation strategy schema borrowed by stage public surface | inline | `plan-volcanoes/contract.ts` | stage authoring; model schemas | stage `volcanoes` recomposition proof | verified | procedural tuning, not official feature ids |
| O09 | `morphology/ops/mountains-shared/config.ts` / `MountainsConfigSchema` | shared operation-family strategy schema | recompose | `plan-ridges/contract.ts`, `plan-foothills/contract.ts`, `plan-rough-lands/contract.ts` | `ops/mountains-shared/config.ts`; model schemas wholesale | all three contracts stop importing shared config | verified | no shared config bucket remains |
| O10 | `mountains-shared/config.ts` / `assertSameMountainFamilySelection` | stage-boundary invariant colocated with shared config | inline | `recipes/standard/stages/morphology-features/steps/mountains.ts` local helper | operation contract; model schemas | consumer proof and `morphology/ops.ts` export reroute | verified | single consumer is the mountains stage step; stage invariant, not op contract material |
| S01 | `ecology/shared/placement-schema.ts` / `FeaturePlacementSchema` | repeated ecology feature placement record | move | `ecology/model/schemas/feature-placement.schema.ts` | operation-local contracts; official feature vocabulary | import proof; no official `FEATURE_*` tightening in this schema | verified | whole object is the primitive; `x/y/weight` alone are generic |
| S02 | repeated `BiomeSymbolSchema` in `ecology/ops/plot-effects-score-{burned,sand,jungle}/contract.ts`, matching `ecology/types.ts` `BiomeSymbol`/`BIOME_SYMBOL_ORDER` | internal ecology biome symbol enum | move | `ecology/model/schemas/biome-symbol.schema.ts` | `@civ7/map-policy` official globals; `BiomeEngineBindingsSchema` | prove literals match `BiomeSymbol` and `BIOME_SYMBOL_ORDER`; prove scorer contracts import only internal symbols | corroborated | internal-vocabulary candidate accepted after classifier trace proof, not `BIOME_*` mapping |
| S03 | `HydrologyWindFieldSchema` from `hydrology/ops/shared/wind-field.ts` | wind/current field artifact support schema | move | `recipes/standard/stages/hydrology-climate-baseline/artifacts/wind-field.schema.ts`, consumed by `wind-field.artifact.ts`, `climate-field.artifact.ts`, and `climate-seasonality.artifact.ts` | hydrology model schemas; config facade | artifact importer proof | corroborated | artifact payload support, not generic schema primitive |
| S04 | foundation tectonic scalar fields | artifact payload fields consumed downstream | keep | foundation artifact files | domain config; generic model schema | artifact contract proof | verified | downstream consumption does not promote fields |
| S05 | `BiomeEngineBindingsSchema` from `domain/ecology/biome-bindings.ts` | internal biome symbols to official `BIOME_*` engine globals | recompose | official biome-global vocabulary in `packages/civ7-map-policy/src/biome-globals.ts`; TypeBox binding schema/helper in `recipes/standard/stages/map-ecology/biome-bindings.ts`; adapter remains runtime lookup boundary | ecology model schemas; ecology domain config | map-policy export proof, stage import proof, adapter boundary proof | verified | official-vocabulary rail applies directly |
| S06 | resource expected count ranges | resource expectation/data-contract shape plus official resource refs | closed | `resources/model/schemas/expected-count-range.schema.ts` for the reusable expected-count range primitive; operation contracts compose it; `earthlike-expectations.artifact.ts` keeps strict corpus validation; official resource facts stay with `@civ7/map-policy` / `@civ7/types` | cloned operation-local `ExpectedCountRangeSchema`; generic loose artifact range validation | clone-zero scan, Habitat schema/contract/artifact rules, resource artifact behavior test | verified | closed by Slice 001 cleanup execution; see `resource-policy-data-contract.domino.md` |
| S07 | hydrology snow/ice temperature thresholds | similar strategy parameters | keep | owning hydrology operation contracts | hydrology model/policy until synchronization is proven | shared-invariant proof before extraction | corroborated | repetition alone is not law |
| S08 | ecology wet/reef scorer thresholds | family-local scoring/admission params | keep | owning ecology scorer/planner operation contracts | ecology model/policy | operation contract proof | verified | operation-local tuning |
| ST01 | `foundation-lithosphere/index.ts` | stage public and plate-count knob authoring | keep | `foundation-lithosphere` stage | domain config | compile/knob proof | verified | real authoring surface |
| ST02 | `foundation-mantle/index.ts` | stage public and plate-count knob authoring | keep | `foundation-mantle` stage | domain config | compile proof | verified | hides derived `cellCount` |
| ST03 | `foundation-tectonics/index.ts` | stage public fan-out and knob authoring | keep | `foundation-tectonics` stage | domain config | compile fan-out proof | verified | `plateMotion` feeds two steps |
| ST04 | `foundation-orogeny/index.ts` | knobs-only crust-character authoring | keep | `foundation-orogeny` stage | domain config | knob consumer proof | verified | no public schema row |
| ST05 | `foundation-projection/index.ts` | static projection stage | recompose | stage remains; delete empty public/knob wrapper declarations if stage pattern permits absent empty surfaces | domain model | stage-shape proof | verified | static projection remains |
| ST06 | `morphology-routing/index.ts` | static routing stage | recompose | stage remains; delete empty public/knob wrapper declarations if stage pattern permits absent empty surfaces | domain model | stage-shape proof | verified | static routing remains |
| ST07 | `morphology-shelf/index.ts` | shelf authoring surface | recompose | `morphology-shelf` stage-local public/knob shape | domain config | import reroute and compile proof | verified | keep behavior |
| ST08 | `morphology-erosion/index.ts` | erosion authoring surface | recompose | `morphology-erosion` stage-local public/knob shape | domain config | import reroute and compile proof | verified | keep behavior |
| ST09 | `morphology-coasts/index.ts` | grouped coast authoring surface | keep | `morphology-coasts` stage | domain config | compile grouping proof | verified | real UX grouping |
| ST10 | `morphology-features/index.ts` and `mountain-ranges-public-config.ts` | landform authoring surface and mountain resolver | keep | `morphology-features` stage-local files | domain config; operation contracts | resolver proof | verified | policy-bearing stage authoring |
| ST11 | `hydrology-climate-baseline/index.ts` and `hydrology-public-config.ts` slice | climate baseline authoring | keep | `hydrology-climate-baseline` stage-local files | domain config | compile/helper proof | verified | seasonal/ocean UX |
| ST12 | `hydrology-climate-refine/index.ts` and `hydrology-public-config.ts` slice | climate refine authoring | keep | `hydrology-climate-refine` stage-local files | domain config | compile proof | verified | strategy selection |
| ST13 | `hydrology-hydrography/index.ts` and `hydrology-public-config.ts` slice | river/lake authoring | keep | `hydrology-hydrography` stage-local files | map projection stage | compile proof | verified | Hydrology truth, not Civ projection |
| ST14 | `ecology-pedology/index.ts` and `ecology-public-config.ts` slice | ecology pedology profile authoring | keep | `ecology-pedology` stage-local files | domain config | profile compile proof | verified | real UX profiles |
| ST15 | `ecology-biomes/index.ts` and `ecology-public-config.ts` slice | biome classification authoring | keep | `ecology-biomes` stage-local files | domain config | compile proof | verified | helper is authoring metadata |
| ST16 | `ecology-features/index.ts` and `ecology-public-config.ts` slice | feature planning authoring | keep | `ecology-features` stage-local files | domain config | selector/profile proof | verified | strong UX surface |
| MP01 | `map-projection-public-config.ts` / `MapMorphologyKnobsSchema`, `MapMorphologyPublicSchema` | shared helper for static morphology projection authoring | recompose | `map-morphology/index.ts`; delete empty schema exports if stage pattern permits absent empty surfaces | shared map projection helper; domain model | import-zero proof for helper exports and stage-shape proof | verified | no shared `map-projection-public-config.ts` ownership remains for these exports |
| MP02 | `map-projection-public-config.ts` / `MapHydrologyKnobsSchema`, `MapHydrologyPublicSchema` | shared helper for lake projection/readback authoring | inline | `map-hydrology/index.ts`; delete empty wrapper declarations only if the stage pattern permits absent empty surfaces | shared map projection helper; hydrology domain model | readback compile proof and import-zero proof for helper exports | verified | projection-policy-bearing stage surface; no support file is needed for empty schemas |
| MP03 | `map-projection-public-config.ts` / `MapElevationKnobsSchema`, `MapElevationPublicSchema` | shared helper for static elevation projection authoring | recompose | `map-elevation/index.ts`; delete empty schema exports if stage pattern permits absent empty surfaces | shared map projection helper; domain model | import-zero proof for helper exports and stage-shape proof | verified | static projection remains |
| MP04 | `map-projection-public-config.ts` / `MapRiversPublicSchema` | shared helper for navigable river projection authoring | inline | `map-rivers/index.ts`, paired with row P03 projection policy in `map-rivers/riverProjectionPolicy.ts`; delete empty wrapper declaration only if the stage pattern permits absent empty surfaces | shared map projection helper; hydrology config/model | projection proof and import-zero proof for helper export | verified | composes stage-local projection policy |
| MP05 | `map-projection-public-config.ts` / `MapEcologyKnobsSchema`, `MapEcologyPublicSchema` | shared helper for engine biome binding projection | recompose | `map-ecology/biome-bindings.ts` for the public binding schema/helper; `map-ecology/index.ts` for any empty knob/public wrapper allowed by stage shape; use `packages/civ7-map-policy/src/biome-globals.ts` from row S05 | shared map projection helper; ecology domain model | map-policy/stage proof and import-zero proof for helper exports | verified | domain no longer owns official binding vocabulary |
| ST17 | `map-morphology/index.ts` | static projection stage | recompose | row MP01 destination | domain model | stage-shape proof | verified | static projection remains |
| ST18 | `map-hydrology/index.ts` | lake projection/readback stage | keep | row MP02 destination | hydrology domain model | readback compile proof | verified | projection-policy-bearing |
| ST19 | `map-elevation/index.ts` | static elevation projection stage | recompose | row MP03 destination | domain model | stage-shape proof | verified | static projection remains |
| ST20 | `map-rivers/index.ts` | navigable river projection stage | keep | row MP04 destination | hydrology config/model | projection proof | verified | composes stage-local projection policy |
| ST21 | `map-ecology/index.ts` | engine biome binding projection stage | recompose | row MP05 destination | ecology domain model | map-policy/stage proof | verified | domain no longer owns official binding vocabulary |
| ST22 | `placement/index.ts` and `placement-public-config.ts` | placement authoring surface | keep | `placement` stage-local files | `placement/config.ts` | compile/source usage proof | verified | replaces stale aggregate config |

## Derived View

| View | Rows | Why |
| --- | --- | --- |
| execution-ready after normal proof | D01-D05, K02-K03, K04b-K04d, K05a-K05d, P01-P04d, O01-O10, S01, S03-S05, S07-S08, ST01-ST22, MP01-MP05 | Each row has an accepted owner/destination and proof gate. Execution can be sliced by operation contracts, stage authoring, policy relocation, primitive extraction, and facade retirement. |
| prerequisite-coupled | D02-D04, K01, K04a, O02-O09, S02, ST07-ST13, ST17-ST21, MP01-MP05 | These rows are mechanical only when paired with the corresponding import reroute, public-stage recomposition, classifier trace, or package-boundary update. |
| closed cleanup domino | S06 | Resource expected count ranges are closed by the Slice 001 cleanup execution and recorded in `resource-policy-data-contract.domino.md`. |
| needs destination law | none | The official Civ7 vocabulary correction resolves the previously ambiguous `BiomeEngineBindingsSchema` class into map-policy plus stage projection ownership. |

## Execution-Plan Implications

The later execution plan can now treat the active config-law work as mostly
mechanical, but not as one flat rename:

- operation-local `config.ts` material is inlined or recomposed into operation
  `contract.ts` files;
- shared knob schemas are localized to their owning stages unless a separate
  primitive law is accepted;
- shared multiplier/resolver tables move to domain `model/policy` only when
  they encode reusable domain semantics;
- Civ-visible projection policy moves to the owning map stage, not Hydrology
  domain policy;
- official Civ7 vocabulary moves through exact `@civ7/map-policy`,
  adapter, or type boundaries before any stage/domain composition;
- shared stage helper files such as `map-projection-public-config.ts` are
  split back into owning stages; they do not become durable config owners;
- real domain schema primitive extraction is narrow: ecology feature placement
  and internal biome symbols are accepted, while broad strategy envelopes are
  rejected;
- root/per-domain `config.ts` facades retire only after import reroutes and
  public/generated export checks.
- resource expected-count ranges now have a reusable primitive owner under
  `resources/model/schemas`; operation contracts compose that primitive and
  artifact files retain stricter artifact-owned validation.

No broad public-schema deletion is authorized. Public authoring surfaces stay
with stages unless the stage-shape proof shows an empty/static or wrapper-only
surface that can be recomposed without losing behavior.

## Investigation Review Inputs

This disposition synthesized four fresh lane outputs:

- operation contract rows;
- primitive hunter;
- domain policy and boundary rows;
- facade and stage authoring rows.

The official Civ7 vocabulary owner rail was added during the investigation and
applied to active lanes before synthesis.

Final review found no unresolved destination-law blockers after repair. The
accepted repairs were: expanding grouped knob/policy rows into exact owner
rows, adding explicit `map-projection-public-config.ts` split rows, requiring
classifier trace proof for `BiomeSymbolSchema`, naming exact package/stage
destinations for official Civ7 biome binding vocabulary, and tightening the
last helper rows to exact stage files.
