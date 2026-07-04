# Domain Model Config Law Results Corpus

Status: investigation corpus complete and reviewed

Prepared at: 2026-07-04

Inputs:

- `investigation-brief.md`
- `../../frame.md`
- `../../single-prework-decision-frame.md`
- `../../inventory.md`
- `../../../../decision-book/content-classes.md`
- `../../../../decision-book/owner-boundaries.md`
- `.habitat/scopes/domain/scopes/model/scopes/schemas/scope.md`
- `.habitat/scopes/domain/scopes/model/scopes/schemas/files/schema-primitive-ts.md`

## Executive Answer

This pass changes the next move in one concrete way: do not begin the
`Domain Model Config Law` prework by globally deleting public schemas or
removing every `config.ts`. The corpus shows that public stage surfaces are
real in the current recipe authoring model, and many `compile` paths carry
stage-owned UX, projection, fan-out, or profile semantics.

The better next move is row-level disposition by content class:

- keep stage authoring surfaces with stages unless they are proven empty or
  wrapper-only;
- classify operation/strategy config with operation contracts or operation
  families;
- promote only proven reusable semantic schemas into domain schema primitives;
- route reusable semantic policy constants to `model/policy`, not
  `model/schemas`;
- retire broad config facades only after their exports have direct owner paths
  and import pressure is rerouted.

The main simplifying answer is that there is still no evidence for a third
official config owner. Current surfaces collapse into stage authoring,
operation contracts, domain schema primitives, domain policy, and
facade residue.

## Tools And Agent Lanes

Fresh investigation agents ran independently after the reviewed brief:

- Agent A: public stage surface semantic analyst.
- Agent B: domain primitive and operation overlap analyst.
- Agent C: facade, import pressure, and metrics analyst.

Steward verification used local `rg`, source reads, Nx project metadata, KNIP
as available, and Narsil for symbol/reference corroboration. Narsil was useful
for symbol relationships and is tracking the primary repository; exact
worktree import pressure was verified with local source scans because this
worktree may contain changes not represented in the primary checkout index.

## Metrics Summary

| Claim | Value | Evidence |
| --- | ---: | --- |
| Domain `config.ts` files | 14 | `rg --files mods/mod-swooper-maps/src/domain \| rg '(^|/)config\.ts$'` |
| Shared knob / multiplier files | 6 | `rg --files mods/mod-swooper-maps/src/domain \| rg '/shared/(knobs|knob-multipliers)\.ts$'` |
| Stage `index.ts` files with `public:` | 21 | `rg -l '\bpublic:' mods/mod-swooper-maps/src/recipes/standard/stages -g 'index.ts'` |
| Stage `index.ts` files with `compile:` | 21 | `rg -l '\bcompile\s*:' mods/mod-swooper-maps/src/recipes/standard/stages -g 'index.ts'` |
| Stage `index.ts` files with `knobsSchema:` | 13 | `rg -l '\bknobsSchema\s*:' mods/mod-swooper-maps/src/recipes/standard/stages -g 'index.ts'` |
| Recursive public-config helpers | 5 | `rg --files mods/mod-swooper-maps/src/recipes/standard/stages \| rg -- '-public-config\.ts$'` |
| Root `domain/config.ts` source importers | 0 | local source import scan; file only re-exports `morphology/config.js` and `placement/config.js` |
| `PlacementConfigSchema` source uses | definition only | `rg -n 'PlacementConfigSchema\|PlacementConfig\b' mods/mod-swooper-maps/src mods/mod-swooper-maps/test` |

KNIP was run in export-analysis mode for `mod-swooper-maps`; it did not produce
focused deletion proof for this decision. Treat that as no deletion proof, not
liveness proof.

Nx confirms relevant existing Habitat enforcement surfaces are already present,
including:

- `prohibit_root_config_facade_imports_in_domain_ops`
- `prohibit_wrapper_only_advanced_config`
- `require_morphology_config_facade_exports`
- `prohibit_morphology_stage_config_bag_imports`
- `verify_standard_recipe_public_authoring_surface`

Those rules are evidence that this area is already partially ratcheted. They
are not themselves the final model law.

The 14 domain `config.ts` files split into these classes:

- 4 facade or aggregate surfaces: root `domain/config.ts`,
  `foundation/config.ts`, `hydrology/config.ts`, `morphology/config.ts`;
- 1 stale aggregate candidate: `placement/config.ts`;
- 8 operation-local config schema files;
- 1 operation-family shared config schema file: `morphology/ops/mountains-shared/config.ts`.

## Durable Row-Level Corpus

| Path/symbol | Current role | Content class | Candidate owner | Explicit non-owner | Evidence strength | Blocker/later-domino marker | Disposition lead |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/config.ts` | Root domain config barrel re-exporting morphology and placement config | Facade residue | None, unless a later public domain import surface explicitly needs it | Not domain model config authority | verified | Needs generated/public API check before delete | Likely delete or retire after import-surface proof |
| `mods/mod-swooper-maps/src/domain/foundation/config.ts` | Star-only facade for foundation shared knobs and multipliers | Facade with import pressure | Direct owner paths for shared knobs/policy, or an explicit public stage-authoring import surface | Not owner authority | corroborated | Import reroute required | Split contents by owner, then retire or narrow facade |
| `mods/mod-swooper-maps/src/domain/hydrology/config.ts` | Star-only facade for hydrology knobs and policy constants | Facade with import pressure | Direct owner paths for knobs/policy, or explicit public stage-authoring import surface | Not owner authority | corroborated | Import reroute required | Split contents by owner, then retire or narrow facade |
| `mods/mod-swooper-maps/src/domain/morphology/config.ts` | Star-only facade for morphology knobs and policy constants | Facade with existing Habitat rule | Direct owner paths, plus reconciliation with existing morphology facade rule | Not owner authority | corroborated | Existing `require_morphology_config_facade_exports` must be updated or retired later | Split contents by owner, then update enforcement |
| `mods/mod-swooper-maps/src/domain/placement/config.ts` / `PlacementConfigSchema` | Aggregate placement domain config schema from operation default configs | Stale domain-owned config facade candidate | None unless public API pressure is found | Not stage authoring; not operation contract owner | verified for no source usage; deletion not KNIP-proven | Public/generated API check needed | Likely delete or replace with stage-local public config surfaces |
| `mods/mod-swooper-maps/src/domain/foundation/shared/knobs.ts` / plate knobs | `FoundationPlateCountKnobSchema`, `FoundationPlateActivityKnobSchema` consumed by foundation stages | Stage authoring knob schema | Stage-authoring primitive or explicitly named domain authoring primitive | Not operation contract config | corroborated | Needs exact owner path before facade retirement | Reroute from `foundation/config.ts`; do not treat as operation config |
| `mods/mod-swooper-maps/src/domain/foundation/shared/knobs.ts` / continental knobs | `FoundationContinentalAbundanceKnobSchema`, `FoundationContinentalReliefKnobSchema` consumed by knobs-only `foundation-orogeny` | Stage authoring knob schema | Stage-authoring primitive or explicitly named domain schema primitive | Not generic model schema | verified/corroborated | Needs exact owner path; see `foundation-orogeny` row | Keep as stage authoring surface input, reroute out of facade |
| `mods/mod-swooper-maps/src/domain/foundation/shared/knob-multipliers.ts` | Resolver functions map continental/plate knobs into operation config effects | Stage transform policy helper | Foundation model policy or stage-local policy helper | Not `model/schemas` | corroborated | Needs policy-vs-stage-local decision | Move or keep as policy, but not via config facade authority |
| `mods/mod-swooper-maps/src/domain/hydrology/shared/knobs.ts` | Hydrology dryness, temperature, seasonality, ocean-coupling, cryosphere, river-density, and lakeiness knob schemas | Stage authoring knob schema | Stage-authoring primitive or explicitly named domain schema primitive | Not operation contract config | corroborated | Needs exact owner path before facade retirement | Reroute from `hydrology/config.ts`; do not promote wholesale to `model/schemas` |
| `mods/mod-swooper-maps/src/domain/hydrology/shared/knob-multipliers.ts` / climate and hydrography policy constants | Hydrology knob transforms and projection policy tables | Domain policy or stage-local policy | `model/policy` for hydrology-owned semantics; stage-local for projection-only semantics | Not `model/schemas` | corroborated | Several constants need per-symbol use proof | Split policy constants by semantic owner |
| `mods/mod-swooper-maps/src/domain/hydrology/shared/knob-multipliers.ts` / `HYDROLOGY_NAVIGABLE_RIVER_PROJECTION_POLICY` | Imported by `map-rivers/index.ts` and selected by stage-local `NavigableRiverDensityKnobSchema` | Semantic collision: hydrology policy table consumed by map projection stage | Hydrology domain policy, map-rivers projection policy, or shared projection contract | Not config facade | verified | Blocker for clean reroute | Decide whether navigable projection policy is hydrology-owned or map-rivers-owned before moving |
| `mods/mod-swooper-maps/src/domain/morphology/shared/knobs.ts` | Morphology sea-level, erosion, coast, shelf, volcanism, and orogeny knob schemas | Stage authoring knob schema | Stage-authoring primitive or explicitly named domain schema primitive | Not operation contract config | corroborated | Needs exact owner path before facade retirement | Reroute from `morphology/config.ts`; do not promote wholesale to `model/schemas` |
| `mods/mod-swooper-maps/src/domain/morphology/shared/knob-multipliers.ts` | Morphology knob transform constants | Domain policy or stage-local transform policy | `model/policy` for reusable morphology semantics | Not `model/schemas` | corroborated | Needs per-family owner names | Move policy constants away from config facade |
| `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/config.ts` / `CrustEvolutionConfigSchema` | Operation-local strategy config schema | Operation contract config | `compute-crust-evolution` operation contract | Not stage authoring or domain config facade | verified | None for config law unless repeated primitive emerges | Keep operation-local |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/config.ts` / `ReliefConfigSchema` | Operation-local strategy config schema | Operation contract config | `compute-base-topography` operation contract | Not stage authoring or domain config facade | verified | None for config law unless repeated primitive emerges | Keep operation-local |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-coastline-metrics/config.ts` / coastline config schemas | Operation-local coast metric config family | Operation contract config | `compute-coastline-metrics` operation contract | Not stage authoring or domain config facade | verified | None for config law unless shared coast primitive is proven | Keep operation-local |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-geomorphic-cycle/config.ts` / `GeomorphologyConfigSchema`, `WorldAgeSchema` | Operation-local geomorphic cycle config plus world-age enum | Operation contract config; possible enum primitive only if reused | `compute-geomorphic-cycle` operation contract by default | Not stage public surface | verified | `WorldAgeSchema` requires reuse proof before primitive promotion | Keep operation-local unless row-level sweep proves reusable world-age primitive |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sculpt-continental-margin/config.ts` / `SculptContinentalMarginConfigSchema` | Operation-local strategy config schema | Operation contract config | `compute-sculpt-continental-margin` operation contract | Not stage authoring or domain config facade | verified | None for config law unless repeated primitive emerges | Keep operation-local |
| `mods/mod-swooper-maps/src/domain/morphology/ops/compute-sea-level/config.ts` / `HypsometryConfigSchema` | Operation-local sea-level config schema | Operation contract config | `compute-sea-level` operation contract | Not stage authoring or domain config facade | verified | None for config law unless hypsometry primitive is proven | Keep operation-local |
| `mods/mod-swooper-maps/src/domain/morphology/ops/plan-island-chains/config.ts` / `IslandsConfigSchema`, `IslandChainsConfigSchema` | Operation-local island-chain config schema | Operation contract config | `plan-island-chains` operation contract | Not stage authoring or domain config facade | verified | None for config law unless island-chain primitive is proven | Keep operation-local |
| `mods/mod-swooper-maps/src/domain/morphology/ops/plan-volcanoes/config.ts` / `VolcanoesConfigSchema` | Operation-local volcano config schema | Operation contract config | `plan-volcanoes` operation contract | Not stage authoring or domain config facade | verified | None for config law unless volcanism primitive is proven | Keep operation-local |
| `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/config.ts` / `MountainsConfigSchema` | Shared config schema used by ridge, foothill, and rough-land ops | Operation-family contract material | Morphology operation-family contract; possible domain schema primitive only if law accepts the underlying semantic fragment | Not stage public surface | verified | Needs row decision: operation-family vs schema primitive | Keep as named shared op-family contract unless promoted by explicit law |
| `mods/mod-swooper-maps/src/domain/ecology/shared/placement-schema.ts` / `FeaturePlacementSchema` | Shared placement object schema reused across ecology plan/apply ops | Domain schema primitive candidate | Ecology model schema primitive | Not facade; not operation-local tuning | verified | Needs exact destination name/path | Strong candidate for model schema promotion |
| `mods/mod-swooper-maps/src/domain/ecology/biome-bindings.ts` / `BiomeEngineBindingsSchema` | Ecology binding schema consumed by map-ecology public config and `plot-biomes` step contract | Boundary candidate: domain primitive vs projection/stage contract | Ecology model primitive only if bindings are stable ecology vocabulary; otherwise map-ecology projection contract | Not automatic `model/schemas` just because a stage composes it | verified | Needs owner-boundary decision | Keep domain-owned for now; do not promote until projection-vs-domain boundary is settled |
| `mods/mod-swooper-maps/src/domain/hydrology/ops/shared/wind-field.ts` / `HydrologyWindFieldSchema` | Shared hydrology field schema reused by artifacts | Domain/artifact support primitive | Hydrology artifact contract support or model primitive | Not generic config | corroborated | Needs exact artifact-vs-model destination | Keep shared semantic schema, not root config |
| `mods/mod-swooper-maps/src/domain/foundation/artifacts/tectonic-era-fields.artifact.ts` and `tectonic-history.artifact.ts` / tectonic scalar fields | Artifact-owned fields such as `boundaryType`, `upliftPotential`, `riftPotential`, `shearStress`, `volcanism`, `fracture` reused by morphology consumers | Artifact contract / domain primitive support lead | Foundation artifact contracts first; possible model primitive support only after artifact row proof | Not config facade | corroborated | Outside generic config unless row-level sweep promotes a support primitive | Lead with artifact ownership, not config law |
| `mods/mod-swooper-maps/src/domain/resources/artifacts/earthlike-expectations.artifact.ts` / expected count ranges; `resources/ops/plan-*/contract.ts` local `ExpectedCountRangeSchema` | Repeated resource expectation shape across resource planning ops | Outside-scope lead for resource model policy/data contract | Resource policy/data contract if later resource slice accepts it | Not domain config law input unless explicitly pulled in | plausible/corroborated | Outside current config-law disposition unless resources row is selected | Record as evidence lead, not config-law blocker |
| Hydrology snow/ice temperature thresholds | Repeated terms in cryosphere and albedo operation contracts | Policy candidate or operation-local tuning | Hydrology policy only if synchronization is intended | Not config facade | corroborated | Semantic synchronization unclear | Keep operation-local unless policy row proves shared invariant |
| Ecology wet/reef scorer thresholds | Repeated threshold-like names across feature scorers | Operation-local tuning | Operation contracts | Not domain config | verified | None for config law | Keep operation-local |
| `BiomeSymbolSchema` repeated in plot-effect score contracts | Repeated biome symbol enum | Domain semantic policy candidate | Biome classifier/model contract if shared semantics are proven | Not config facade | plausible | Needs classifier trace | Investigate only if row-level sweep reaches biome scorer symbols |
| `recipes/standard/stages/**/*-public-config.ts` helpers | Stage-local authoring helpers | Stage authoring surface | Stage files/helpers | Not domain config | verified/corroborated | Some generated-from-op surfaces may simplify later | Keep with stages unless row proves wrapper-only deletion |
| `recipes/standard/stages/*/index.ts` `public` + `compile` | Recipe authoring API and public-to-internal composition | Stage authoring surface | Stage | Not domain model schemas | verified | Some empty/mirror public schemas may simplify | Selective cleanup only after per-stage proof |

## Public Stage Surface Table

| Stage/file | Public source | Compile role | Mirror/removable? | Policy/UX carried | Disposition lead |
| --- | --- | --- | --- | --- | --- |
| `foundation-lithosphere/index.ts` | Inline foundation op strategy schemas | Maps lithosphere and plate partition to op envelopes | plausible mirror-like | Minimal stage grouping | Candidate simplification, but keep stage composition |
| `foundation-mantle/index.ts` | Inline op schemas with `cellCount` omitted | Maps public groups to mesh/potential/forcing ops | no/selective | Prevents authoring `cellCount` | Stage UX transform remains |
| `foundation-tectonics/index.ts` | Inline op schemas | Fans `plateMotion` into plate-motion and tectonics steps | no | Shared public field is sole home for repeated op config | Stage composition remains |
| `foundation-orogeny/index.ts` | No public schema; `knobsSchema` only | No stage compile; knobs are consumed by the `crust-evolution` step | not a public-schema cleanup case | Coupled continental abundance/relief authoring knobs | Treat as stage authoring surface; classify foundation knob owner path before facade retirement |
| `foundation-projection/index.ts` | Empty inline schema | Static projection step | plausible | None | Empty public schema cleanup candidate |
| `morphology-routing/index.ts` | Empty inline schema | Static routing envelope | plausible | None | Empty public schema cleanup candidate |
| `morphology-shelf/index.ts` | `ShelfMaskConfigSchema` | Wraps `shelf` into `shelfMask` | plausible | Minimal stage label | Wrapper cleanup candidate |
| `morphology-erosion/index.ts` | `GeomorphicCycleConfigSchema` | Wraps into default op envelope | plausible | Minimal stage label | Wrapper cleanup candidate |
| `morphology-coasts/index.ts` | Multiple morphology op schemas | Renames/groups coast and landmass ops | selective | Stage grouping UX | Keep stage composition; classify inputs separately |
| `morphology-features/index.ts` | `MountainRangesPublicSchema` plus op schemas | Resolves public mountain controls into one `MountainsConfig` | no | Strong policy mapping | Do not remove; decide owner of mountain family contract |
| `hydrology-climate-baseline/index.ts` | Generated helper plus custom seasonal cycle | Maps public groups to baseline ops | no/selective | Seasonal UX and author descriptions | Keep stage authoring; inspect reusable seasonal primitive only if repeated |
| `hydrology-climate-refine/index.ts` | Generated helper from hydrology ops | Maps precipitation to refine strategy | selective | Strategy selection | Keep stage composition |
| `hydrology-hydrography/index.ts` | Generated helper from hydrology ops | Maps river/lake groups and default metrics op | selective | Author labels and stage grouping | Keep stage composition |
| `ecology-pedology/index.ts` | `EcologyPedologyPublicSchema` | Maps profile names to strategy ids | no | Profile UX | Keep stage helper or extract profile policy if proven reusable |
| `ecology-biomes/index.ts` | `EcologyBiomesPublicSchema` | Single default op envelope | selective | Generated authoring metadata | Simplify only if metadata generated elsewhere |
| `ecology-features/index.ts` | `EcologyFeaturesPublicSchema` | Expands scoring/planning groups and selectors | no | Strong selector/profile/feature UX | Do not remove blindly |
| `map-morphology/index.ts` | Empty public schema | Static projection step | plausible | None | Empty public schema cleanup candidate |
| `map-hydrology/index.ts` | Empty public schema | Static readback behavior | public yes, compile no | `projectionReadback` behavior | Public schema cleanup only; compile remains |
| `map-elevation/index.ts` | Empty public schema | Static build-elevation step | plausible | None | Empty public schema cleanup candidate |
| `map-rivers/index.ts` | Empty public schema plus knob surface | Resolves knob to navigable river projection policy | public yes, stage no | Strong policy via knob/compile | Do not treat as pure public-schema residue |
| `map-ecology/index.ts` | `BiomeEngineBindingsSchema` | Passes biome bindings to plot-biomes | no | Real projection binding UX | Domain schema composed by stage |
| `placement/index.ts` | `PlacementPublicSchema` | Maps product controls to placement steps | no | Strong placement UX; discoveries not authored | Keep stage authoring; retire stale domain placement config separately |

## Domain Primitive And Operation Overlap Table

| Concept / field group | Source paths | Current owner(s) | Candidate owner class | Why same/different | Disposition lead |
| --- | --- | --- | --- | --- | --- |
| Mountain-family terrain config | `domain/morphology/ops/mountains-shared/config.ts`; `plan-ridges/contract.ts`; `plan-foothills/contract.ts`; `plan-rough-lands/contract.ts` | Morphology op-family shared config | Operation-family contract material | Same schema is consumed by three ops and a guard enforces same family selection | Keep as shared op-family contract unless explicit schema-primitive law promotes an underlying fragment |
| Ecology feature placement shape | `domain/ecology/shared/placement-schema.ts`; feature plan/apply contracts | Ecology shared schema | Domain schema primitive | Same `{ x, y, feature, weight }` placement object crosses many ecology ops | Promote/classify as ecology model schema primitive candidate |
| Foundation tectonic scalar fields | Foundation artifact files and downstream morphology consumers | Foundation artifacts and consumers | Artifact contract or domain primitive support | Same semantic field family flows as artifact truth, not authoring config | Lead with artifact ownership |
| Hydrology wind field | `domain/hydrology/ops/shared/wind-field.ts`; hydrology climate artifacts | Hydrology shared op/artifact support | Artifact support primitive or domain primitive | Shared schema backs multiple artifacts | Keep semantic schema; classify owner outside generic config |
| Biome engine bindings | `domain/ecology/biome-bindings.ts`; map-ecology public and step contract | Ecology domain root | Boundary candidate: domain primitive or projection/stage contract | Stage composes an existing domain schema, but the surface is engine-facing projection binding | Keep domain-owned for now; decide projection-vs-domain owner before moving |
| Hydrology snow/ice thresholds | Cryosphere and albedo contracts | Hydrology operation strategies | Policy or operation-local | Same physical terms but different operation mechanisms | Decide synchronization intent before moving |
| Ecology wet/reef score thresholds | Wetland and reef scorer contracts | Ecology operation strategies | Operation-local tuning | Similar names with family-specific semantics | Keep operation-local |
| Resource expected count ranges | `resources/artifacts/earthlike-expectations.artifact.ts`; local `ExpectedCountRangeSchema` in resource plan contracts | Resource artifacts and ops | Outside-scope resource policy/data lead | Count ranges are product policy/evidence, not active config-law material | Do not use as config-law blocker unless resources row is selected |

## Facade And Import Pressure Table

| Surface/export/path | Import pressure | Facade? | Risk if removed now | Evidence |
| --- | --- | --- | --- | --- |
| `domain/config.ts` | 0 source importers found | Yes | Low for source, but generated/public API check still needed | Local import scan; file is two export-star lines |
| `domain/foundation/config.ts` | Foundation stages and steps import `@mapgen/domain/foundation/config.js` | Yes, star-only | Medium | Local import scan; exports shared knobs/multipliers |
| `domain/hydrology/config.ts` | Hydrology stages, steps, and map-rivers import `@mapgen/domain/hydrology/config.js` | Yes, star-only | Medium/high | Local import scan; includes projection policy usage |
| `domain/morphology/config.ts` | Morphology stages and steps import `@mapgen/domain/morphology/config.js` | Yes, star-only | Medium | Local import scan; existing morphology facade rule |
| `domain/placement/config.ts` | Only root config references found in source | No, contains real aggregate schema content | Low/medium; stale but deletion not KNIP-proven | `PlacementConfigSchema` source use scan |
| `foundation/shared/knobs.ts` | Imported through `foundation/config.ts`; consumed by foundation stage `knobsSchema` and step types | No | High without reroute | Stage authoring knob usage including knobs-only `foundation-orogeny` |
| `foundation/shared/knob-multipliers.ts` | Imported through `foundation/config.ts`; resolver functions used by foundation stage steps | No | High without reroute | Stage transform policy helper usage |
| `hydrology/shared/knobs.ts` | Imported through `hydrology/config.ts`; consumed by hydrology stage `knobsSchema` and step types | No | High without reroute | Stage authoring knob usage |
| `hydrology/shared/knob-multipliers.ts` | Imported through `hydrology/config.ts`; used by hydrology stages and `map-rivers` projection | No | High without semantic split | Includes concrete map-rivers collision for navigable projection policy |
| `morphology/shared/knobs.ts` | Imported through `morphology/config.ts`; consumed by morphology stage `knobsSchema` and step types | No | High without reroute | Stage authoring knob usage |
| `morphology/shared/knob-multipliers.ts` | Imported through `morphology/config.ts`; used by morphology stage steps | No | High without reroute | Stage transform/domain policy constants |
| Public-config helper files | Imported only by local stage indexes | No | High for policy/UX-bearing helpers | Source reads and Agent A semantic pass |

## Opportunity Lanes

### Lane 1: Facade Retirement And Import Reroute

Confidence: corroborated.

The root `domain/config.ts` is the cleanest likely deletion candidate, but the
safe execution path is not "delete all config files." The per-domain config
facades still carry stage import pressure and should be retired only after
their exports have owner paths. This lane is good mechanical work after the row
disposition table names where each knob, multiplier, and schema belongs.

### Lane 2: Domain Primitive Extraction

Confidence: corroborated for the leading candidates.

The strongest primitive/config-contract candidate found in this pass is
`FeaturePlacementSchema`. `HydrologyWindFieldSchema` and foundation tectonic
field support schemas are semantic-schema leads, but their first owner question
is artifact/support primitive versus domain model primitive.
`BiomeEngineBindingsSchema` is intentionally downgraded to a boundary
candidate: it may be stable ecology vocabulary, or it may be a map-ecology
projection contract.

### Lane 3: Operation-Family Contract Classification

Confidence: verified for `MountainsConfigSchema`.

`MountainsConfigSchema` already acts as an operation-family contract. It should
not be confused with public stage config just because the filename is
`config.ts`. The next decision is whether operation-family shared contracts are
accepted as operation-scope contracts or promoted into a domain model contract
location.

### Lane 4: Stage Public Surface Simplification

Confidence: plausible/selective.

Some public schemas are empty or wrapper-like, especially projection stages and
simple morphology wrappers. They may be easy cleanup later. But the corpus
shows many public surfaces carry UX, stage grouping, projection, fan-out, or
profile semantics, and several are strongly policy-bearing. Do not make public
schema removal a global first move.

### Lane 5: Policy Constant Relocation

Confidence: corroborated.

Shared multiplier/policy files contain reusable semantic policy used by stage
transforms. The target owner is likely `model/policy` or a stage-local policy
file, not `model/schemas`. This lane is probably mechanical once row-level
classification names exact owner paths.

## Blockers And Evidence Gaps

- Deletion confidence for `domain/config.ts` and `placement/config.ts` still
  needs generated/public package export checks. Current source has no direct
  importer, but this investigation did not authorize deletion.
- Per-domain config facades need import-reroute decisions before retirement.
  They are weak owner surfaces but active import surfaces.
- Operation-local `config.ts` files are not a global blocker. They are mostly
  operation contract config and should stay operation-local unless a row proves
  a reusable primitive or policy extraction.
- `MountainsConfigSchema` needs a direct law decision: operation-family shared
  contract stays under ops, or reusable operation-family schema fragments get a
  model/schemas destination.
- `FeaturePlacementSchema` needs an exact model primitive destination if
  promoted. `HydrologyWindFieldSchema` needs artifact-support versus model
  primitive classification. `BiomeEngineBindingsSchema` needs projection-stage
  versus ecology-domain ownership classification before any promotion.
- `HYDROLOGY_NAVIGABLE_RIVER_PROJECTION_POLICY` is a concrete blocker for
  hydrology config facade retirement: decide whether the policy belongs to
  hydrology domain policy, the map-rivers projection stage, or a shared
  projection contract.
- Some public schemas are likely easy cleanup, but each needs proof that its
  compile path is static/wrapper-only and does not carry user-facing policy.
- Narsil and local source scans must be used together while working in this
  worktree: Narsil is reliable for indexed symbol/history relationships, while
  local scans are authoritative for uncommitted worktree import pressure.

## Recommended Next Prework Action

Run the actual `Domain Model Config Law` disposition pass with this corpus as
the evidence base. The first row grouping should not be "all config files."
Use these containers instead:

1. Facade import surfaces.
2. Stage authoring surfaces.
3. Operation-local and operation-family contracts.
4. Domain schema primitives.
5. Domain policy constants.
6. Stale aggregate config surfaces.

The likely first deterministic move is to resolve facade surfaces and domain
primitive candidates, because that turns the noisy `config.ts` question into
named owner paths. Public schema cleanup should come after that, and only where
the stage surface is proven wrapper-only or empty.

## Agent Review Notes

The brief was reviewed by a fresh review set before execution. The corpus was
composed by the steward from the three fresh investigation lanes rather than
copied from a single agent. Agent disagreements and limitations are preserved:

- Agent A found public schemas are selectively removable at most.
- Agent B found real primitive candidates but rejected several repeated fields
  as operation-local or policy, not config.
- Agent C found the root config facade is likely residue, while per-domain
  config facades remain active import pressure.

A separate fresh review set then checked the steward corpus. Accepted findings
were repaired: `BiomeEngineBindingsSchema` was downgraded to an owner-boundary
candidate, shared knobs/multipliers were split by domain and role,
operation-local `config.ts` surfaces were added as explicit rows,
`foundation-orogeny` was added as a knobs-only stage surface, and broad
resource/foundation leads were made path-grounded or marked outside the active
config-law disposition.

No source implementation, source movement, enforcement change, or public-schema
removal is authorized by this corpus.
