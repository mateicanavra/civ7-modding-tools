# Standard Recipe Authoring Surface Corpus Ledger

This ledger is generated from the live standard recipe stage objects, not from
hand-entered schema copies. The committed generator is:

```sh
bun run scripts/report-standard-authoring-surface.ts --format=summary
bun run scripts/report-standard-authoring-surface.ts --format=markdown
bun run scripts/report-standard-authoring-surface.ts --format=json
```

Run it from `mods/mod-swooper-maps/`. The `markdown` and `json` formats include
every author-facing schema row with path, owner, layer, type, default, range or
enum, description quality, exposure rationale, gameplay/map impact, coupled
siblings, compile target, strategy reachability, test/doc refs, and whether the
field can change compiled or runtime output. Op-envelope config rows are
strategy-specific (`strategies.<strategy>.config.*`) so multi-strategy ops do
not collapse different configs onto duplicate paths.

## Corpus Roots

| kind | owner | path |
| --- | --- | --- |
| recipe and stage order | standard recipe | `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` |
| stage creation and public/internal boundary | MapGen core authoring SDK | `packages/mapgen-core/src/authoring/stage.ts` |
| strict compile/normalize pipeline | MapGen compiler | `packages/mapgen-core/src/compiler/recipe-compile.ts` |
| op envelope schema | MapGen core op authoring | `packages/mapgen-core/src/authoring/op/envelope.ts` |
| recipe config schema derivation | MapGen core authoring | `packages/mapgen-core/src/authoring/recipe-config-schema.ts` |
| generated map artifacts | Swooper Maps scripts | `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts` |
| generated Studio recipe artifacts | Swooper Maps scripts | `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts` |
| generated schema/default/package artifacts | Swooper Maps dist recipes | `mods/mod-swooper-maps/dist/recipes/standard*.{json,js,d.ts}` and `standard-map-config*` |
| shipped map configs | Swooper Maps configs | `mods/mod-swooper-maps/src/maps/configs/*.config.json` |
| shipped realism presets | Swooper Maps presets | `mods/mod-swooper-maps/src/maps/presets/realism/*.config.ts` |
| Studio recipe catalog | MapGen Studio | `apps/mapgen-studio/src/recipes/catalog.ts` |
| Studio schema/default consumer | MapGen Studio | `apps/mapgen-studio/src/App.tsx` |
| Studio runtime consumer | MapGen Studio browser runner | `apps/mapgen-studio/src/browser-runner/recipeRuntime.ts`, `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts` |
| SDK runtime entrypoint | Civ7 SDK | `packages/sdk/src/mapgen/createMap.ts` |

## Stage Surface Summary

Captured on 2026-05-31 from the current Graphite branch using:
`bun run scripts/report-standard-authoring-surface.ts --format=summary`.

| stage | layer | public | steps | surface keys | fields | raw envelope rows | desc missing/weak | numeric bounded |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| foundation | semantic-public-config | true | 10 | knobs, mesh, mantle-potential, mantle-forcing, crust, plate-graph, plate-motion, tectonics, crust-evolution, plate-topology | 84 | 72 | 34/27 | 52/54 |
| morphology-coasts | semantic-public-config | true | 2 | knobs, substrate, relief, waterCoverage, continents, coastlineShape, shelf | 73 | 0 | 7/41 | 38/59 |
| morphology-routing | semantic-public-config | true | 1 | knobs | 1 | 0 | 0/1 | 0/0 |
| morphology-erosion | semantic-public-config | true | 1 | knobs, geomorphicCycle | 15 | 0 | 4/10 | 4/6 |
| morphology-features | semantic-public-config | true | 4 | knobs, islandChains, mountainRanges, volcanoes | 74 | 0 | 3/50 | 66/67 |
| hydrology-climate-baseline | internal-step-config | false | 1 | knobs, climate-baseline | 102 | 93 | 10/61 | 80/80 |
| hydrology-hydrography | internal-step-config | false | 2 | knobs, rivers, lakes | 19 | 14 | 5/4 | 11/11 |
| hydrology-climate-refine | internal-step-config | false | 1 | knobs, climate-refine | 90 | 85 | 8/59 | 73/73 |
| ecology-pedology | internal-step-config | false | 2 | knobs, pedology, resource-basins | 44 | 41 | 42/2 | 29/29 |
| ecology-biomes | internal-step-config | false | 1 | knobs, biomes | 35 | 33 | 5/24 | 11/23 |
| ecology-features | internal-step-config | false | 6 | knobs, score-layers, plan-ice, plan-reefs, plan-wetlands, plan-vegetation, plan-plot-effects | 160 | 153 | 96/38 | 66/106 |
| map-morphology | internal-step-config | false | 4 | knobs, plot-coasts, plot-continents, plot-mountains, plot-volcanoes | 5 | 0 | 4/0 | 0/0 |
| map-hydrology | internal-step-config | false | 1 | knobs, lakes | 3 | 0 | 0/0 | 0/0 |
| map-elevation | internal-step-config | false | 1 | knobs, build-elevation | 2 | 0 | 2/0 | 0/0 |
| map-rivers | internal-step-config | false | 1 | knobs, plot-rivers | 5 | 0 | 0/0 | 2/2 |
| map-ecology | internal-step-config | false | 3 | knobs, plot-biomes, features-apply, plot-effects | 16 | 2 | 3/0 | 1/1 |
| placement | internal-step-config | false | 9 | knobs, derive-placement-inputs, plot-landmass-regions, place-natural-wonders, prepare-placement-surface, place-resources, assign-starts, place-discoveries, assign-advanced-starts, placement | 33 | 23 | 20/4 | 9/13 |

## Ledger Completeness Checks

- Stage rows: 17.
- Step rows: 50, including step phase, requires/provides tags, artifact
  requires/provides, schema row counts, and op envelopes.
- Studio focus path rows: 50, one for every standard step.
- Field rows: 761.
- Duplicate field paths after strategy-specific op flattening: 0.
- Array item schemas are traversed through `.items` rows, including authored
  arrays of object configs such as ecology resource basin resource entries.

## Initial Diagnosis

- Foundation is the clearest public-surface defect. It declares a
  `semantic-public-config` layer, but public keys such as `mesh` expose raw
  step/op envelopes like `computeMesh.strategy` and `computeMesh.config.*`.
- Morphology is structurally aligned with the desired public+compile model:
  public keys are semantic and no raw `{ strategy, config }` envelope is
  exposed. The remaining work is documentation quality, bounds/default review,
  naming, and profile/coupling cleanup.
- Hydrology, ecology, and placement are not currently public schemas. Their raw
  envelopes are default step-key authoring surfaces, not public leakage by
  themselves. Each domain still needs an acceptance decision for every exposed
  field: keep only gameplay/execution-meaningful, documented, bounded controls;
  collapse coupled controls into semantic knobs/profiles; move private strategy
  or runtime plumbing internal.
- Projection `map-*` stages expose small internal-as-public projection surfaces.
  These need owner-layer review, especially `map-hydrology.lakes.projectionReadback`
  and `map-ecology.features-apply.apply`.
- The generated schema/default and Studio consumer chain is centralized through
  the generator scripts, generated `dist/recipes/standard*` artifacts, and
  `configFocusPathWithinStage`; any cleanup that changes public fields must
  regenerate and prove those artifacts in the same behavior slice.

## Runtime And Consumer Reachability

| consumer | surface consumed | proof requirement |
| --- | --- | --- |
| shipped map configs | standard recipe config schema | Validate after each cleanup and migrate removed/renamed fields. |
| realism presets | standard recipe config schema | Validate after each cleanup and snapshot deterministic compile output where unchanged. |
| generated map artifacts | generated SDK map files and dist recipe artifacts | Regenerate only through scripts when source configs or schema/defaults change. |
| Studio catalog | generated schema/default/uiMeta artifacts | Prove only intended fields appear in schema/default/focus paths. |
| Studio browser runner | default config, schema, overrides, `recipe.compile` | Prove authoring overrides normalize and compile before runtime. |
| compiler/runtime | internal compiled stage/step/op config | Prove public input compiles deterministically before runtime. |
| Civ7 direct control | generated game behavior | Use only for behavior-changing slices or live authoring proof. |
