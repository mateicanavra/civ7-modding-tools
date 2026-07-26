# Pipeline Map — Technical-Arm Grounding

> Open when you need to make a TECHNICAL change to the recipe (add/split/recombine a stage, add an op or strategy, wire a new artifact) and you want the architecture map without re-discovering it. This is the structural cross-section: stages → steps → ops → strategies → artifacts, the truth/projection split, the data-flow contract, and the boundaries any change must respect. For copy-paste skeletons, go to `assets/recipe-scaffolds.md`. For the physics *inside* the ops, see `references/facet-physics.md`.

**Currency rule.** Everything below is re-derived from live source under `mods/mod-swooper-maps/src/`. Verify any stage/op/artifact claim against the live file cited, not against a doc. The `mapgen:*` cache skills are philosophy-only / outdated arch — never use them for stage order, file paths, or schemas. SDK/engine *architecture* authority is `civ7-architecture-authority`; this file maps the recipe-domain layer the mod authors.

---

## Where recipe-domain logic lives (and where it does NOT)

| Concern | Location | Owner |
|---|---|---|
| Domain algorithms and immutable causal artifacts | `mods/mod-swooper-maps/src/domain/<domain>/` | the mod |
| Recipe (stages, steps, ordering, authoring projection) | `mods/mod-swooper-maps/src/recipes/standard/` | the mod |
| Map configs / generated entrypoints / presets | `mods/mod-swooper-maps/src/maps/{configs,generated,presets}` | the mod |
| Diagnostics / viz (the harness) | `mods/mod-swooper-maps/scripts/diagnostics` | the mod |
| Authoring API + execution infra (`createRecipe`/`createStage`/`createStep`/`createOp`/`defineArtifact`, PipelineExecutor, write-once artifact runtime, TypeBox validation, trace/viz) | `@swooper/mapgen-core` = `packages/mapgen-core` | engine substrate (referenced, not changed for domain work) |
| SDK / Civ7 adapter contracts | `packages/sdk`, adapter | `civ7-architecture-authority` |

**The hard rule:** generation-logic (recipe-domain) changes land in `mods/mod-swooper-maps/src/{domain,recipes}`. ONLY engine-substrate changes touch `packages/mapgen-core`. The engine has zero Civ7 knowledge — Civ7 enters only at map entrypoints and the `map-*` projection / `placement` stages via adapter calls.

---

## Vocabulary (current, from live source)

- **domain** — a named collection of pure-algorithm ops for one concern-family; `defineDomain`/`createDomain`. No recipe awareness. Seven domains: `foundation, morphology, hydrology, ecology, placement, resources, narrative`.
- **op** — op-per-concern unit. `defineOp({ kind, id, input, output, strategies })` in `contract.ts`. Each op is its own directory `ops/<op-id>/{contract.ts, index.ts, types.ts, strategies/, rules?/}`. No cross-op reach-ins. Op id is `<domain>/<op-name>` kebab-case.
- **strategy** — a semantically named variant inside an op's `strategies` record. A sole strategy is inferred as the default; a multi-strategy op declares `defaultStrategy` explicitly. The op envelope is `{ strategy: "<id>", config: {...} }` (TypeBox discriminated union built by `defineOp`). Most ops are single-strategy; multi-strategy ops live in hydrology + ecology (see strategy table below).
- **rule** — pure function in an op's `rules/`, shared across that op's strategies (e.g. `computeWindsEarthlike`).
- **step** — executable contract boundary. `defineStep({ id, requires, provides, artifacts:{requires,provides}, ops, schema })` selects consumed artifact contracts and complete provider modules; `createStep(contract, { normalize?, run, viz?, metrics? })` binds behavior plus optional post-run observation facets. Recipe composition assigns the exact `stageId`; steps do not author a duplicate phase. `run(context, config, ops, deps)` publishes and reads through `deps.artifacts.<name>`, whose runtimes derive from the contract's provider modules.
- **stage** — recipe-level authoring + ownership surface. `createStage({ id, steps, knobsSchema?, public?, compile? })`. Owns step composition and only the authoring surfaces that carry real semantic value. Empty knobs/public schemas and compilers that manufacture empty step objects are not authoring surfaces.
- **recipe** — global stage/step order. `createRecipe({ id, namespace, tagDefinitions, stages, compileOpsById })`. Standard recipe id `mod-swooper-maps/standard`. Ordering is enforced by `contract-manifest.ts`, not by key order in `recipe.ts`.
- **artifact** — named, typed, write-once causal data owned by the domain that defines the immutable product. One artifact module owns its `defineArtifact({ name, id, schema })` contract and its contract-bound `defineArtifactValidator`; `defineArtifactCatalog` derives runtime modules and consumer handles from that domain registry. Engine observation and metrics/viz/trace evidence remain those capabilities rather than becoming causal artifacts.
- **knob** — an optional stage-wide semantic authoring control, applied through compilation only when it adds real authoring value.

---

## The standard recipe — 22 ordered stages (VERIFY against `contract-manifest.ts`)

Order authority is `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` (`standardStageContractManifest`, enforced by `orderStandardStages()`). `recipe.ts` assembles via `orderStandardStages({...})`; its key order is irrelevant — the manifest reorders deterministically. `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` was in sync at last check but is **down-ranked**: it can lag the engine-refactor-v1 normalization work — re-read `contract-manifest.ts` before trusting it.

The names below are stable runtime stage IDs. Physical source roots use semantic
family nesting and do not need to mirror those hyphenated identities.

```
PHYSICS / TRUTH STAGES (compute + publish artifacts; MUST NOT touch the adapter)
  1  foundation-mantle             mesh, mantle potential, mantle forcing
  2  foundation-lithosphere        crust, plate graph
  3  foundation-tectonics          plate motion, tectonics
  4  foundation-orogeny            crust evolution
  5  foundation-projection         tile-space foundation fields + plate topology (not engine projection)
  6  morphology-coasts             landmass plates, rugged coasts
  7  morphology-routing            flow routing
  8  morphology-erosion            geomorphic cycle (stream-power + diffusion)
  9  morphology-features           islands, mountains, volcanoes, landmasses
  10 morphology-shelf              post-island coastline metrics + continental shelf
  11 hydrology-climate-baseline    radiative/thermal/circulation/precip baseline
  12 hydrology-hydrography         rivers, lakes
  13 hydrology-climate-refine      precip refine (river-corridor / low-basin)
  14 ecology-pedology              pedology classify + aggregate
  15 ecology-biomes                Whittaker/Holdridge biome classify

MAP-PROJECTION STAGES (consume truth, materialize/read back through the adapter)
  16 map-morphology                plot coasts/continents/mountains/volcanoes
  17 map-hydrology                 project final rainfall, then lakes
  18 map-elevation                 build elevation
  19 map-rivers                    plot rivers (authored terrain materialization)

PLANNER (adapter-free; publishes Ecology intent artifacts)
  20 ecology-features              score + plan floodplains/ice/reefs/wetlands/vegetation/plot-effects

MAP PROJECTION
  21 map-ecology                   plot biomes, apply features, plot effects

CIV7 PLANNER + MATERIALIZER
  22 placement                     derive/plan/assign/place starts, wonders, resources, discoveries
```

Read the braid carefully: physical truth runs through `ecology-biomes` (15), but
the pipeline then projects morphology/hydrology at 16–19 before the adapter-free
`ecology-features` planner (20), whose scoring consumes projected river/coast
evidence. `map-ecology` (21) materializes those plans, and `placement` (22)
combines product planning with Civ7 writes/readback. `foundation-projection` (5)
projects Foundation evidence onto the recipe's tile space; it does **not** call
the Civ7 adapter. `morphology-shelf` (10) runs after island injection so the
published shelf includes island coastlines before Hydrology starts.

**narrative is absent.** The `narrative` domain has **0 ops** (`domain/narrative/ops/contracts.ts` is `export const contracts = {} as const`) and no live recipe stage slot. Subtrees (corridors/orogeny/overlays/tagging) persist as utilities; any claim of active narrative ops is wrong.

**Stage-family containers:** `stages/foundation/`, `stages/morphology/`,
`stages/hydrology/`, `stages/ecology/`, and `stages/map/` are not registered
runtime stages. They contain semantically nested physical stage roots and, only
where warranted, family-shared authoring or visualization surfaces. None has
its own stage `index.ts` or manifest slot. Immutable causal artifacts remain in
their owning domain catalogs. Do not count these containers as stages or
collapse their registered runtime stages into one.

---

## The seven domains and their op counts

Each domain registers its op contracts in `domain/<domain>/ops/contracts.ts` and implementations in `ops/index.ts` (typed `satisfies DomainOpImplementationsForContracts<typeof contracts>` — the two must stay in lockstep). Counts verified from the live registries:

| Domain | Ops | Character |
|---|---|---|
| `foundation` | 17 | mesh, mantle potential/forcing, crust + evolution, plate graph/motion, tectonic segments, era membership, segment/hotspot events, era tectonic fields, history rollups, tectonics current, tracer advection, provenance, plate tensors |
| `morphology` | 15 | base topography, belt drivers, coastline metrics, flow routing, geomorphic cycle, landmask, landmasses, sea level, shelf mask, substrate, island chains, foothills, ridges, rough lands, volcanoes |
| `hydrology` | 19 | radiative forcing → thermal → circulation → ocean currents/geometry/thermal → evaporation → moisture transport → precipitation → cryosphere → albedo → land-water budget → climate diagnostics → drainage routing → discharge → river network project/metrics → plan lakes → navigable river select |
| `ecology` | 32 | biome classify, pedology classify/aggregate, edge refine, feature/vegetation substrate, 5 vegetation + 5 wetland + 4 reef score ops, ice score, 4 plot-effects score ops, plan plot-effects, plan floodplains/wetlands/reefs/ice/vegetation, features apply. The most granular domain. |
| `placement` | 4 | plan discoveries, plan natural wonders, plan starts, plan wonders |
| `resources` | 8 | adjust resource support, derive habitat fields, plan aquatic/cultivated/geological/terrestrial resources, plan resource groups, select resource sites |
| `narrative` | 0 | no ops, no stage (see above) |

> Op counts = the number of `ops/<op-id>/` directories registered in that domain's `ops/contracts.ts`. To confirm, list `mods/mod-swooper-maps/src/domain/<domain>/ops/`.

---

## Op-per-concern layout (the unit you'll most often touch)

A single op is a directory. Using `morphology/compute-landmask` as the reference shape:

```
domain/morphology/
  index.ts                  defineDomain (contract-only) — current step-contract owner surface
  ops.ts                    createDomain (runtime) — current recipe runtime owner surface
  ops/
    contracts.ts            registry: { computeLandmask: MyContract, ... }  (contract-only)
    index.ts                registry: { computeLandmask: myOp, ... } satisfies DomainOpImplementationsForContracts
    compute-landmask/
      contract.ts           defineOp({ kind, id, input, output, strategies })  — the schema/type surface
      index.ts              createOp(contract, { strategies })                 — binds implementations
      strategies/
        tectonic-relief.ts  createStrategy(contract, "tectonic-relief", { run, normalize? })
        index.ts            re-exports the strategy(ies)
      rules/                pure helpers shared across this op's strategies (optional)
      types.ts              OpTypeBagOf<Contract> — typed input/output/envelope bag
```

Two current import faces of a domain are routed through the transitional
`@mapgen/domain/*` alias: the contract root used by step contracts and the
`/ops` runtime root used by `recipe.ts`. These exact roots are compatibility
surfaces, not a pattern to extend: do not add alias mappings or deep imports.
Package-ownership Slice 7 replaces them with real mod-owned dependency surfaces.

Visualization is owned by the step's optional `createStep(contract, { viz })`
facet. Here `<stage-root>` means the stage's semantic physical path, such as
`morphology/shelf`, `hydrology/climate/baseline`, or direct `placement`. A helper
private to one step lives at `stages/<stage-root>/steps/<step>/viz.ts`; helpers
shared by multiple owner-stage steps (or consumed outside the stage) live at
`stages/<stage-root>/viz.ts`. These
files are implementation placement, not a second authoring surface. See
`docs/system/libs/mapgen/reference/VISUALIZATION.md`; direct `context.viz`
emission in live steps is compatibility code, not the scaffold for new work.
For `morphology-shelf`, the owning surface is
`stages/morphology/shelf/steps/compute-shelf`; a helper shared beyond that step
would promote to `stages/morphology/shelf/viz.ts`, not the residual
`stages/morphology/` family container.

**Registration points** when you add code (full skeletons in `assets/recipe-scaffolds.md`):
- New **op** → create the `ops/<op-id>/` directory; add the contract to `ops/contracts.ts` and the impl to `ops/index.ts`.
- New **step** → add the step contract to `standardStageContractManifest` (sets order) and the runtime step to the stage's `orderStandardStageSteps({...})`.
- New **stage** → add to `standardStageContractManifest` (position = pipeline order), add to `orderStandardStages({...})` in `recipe.ts`; if it brings a new domain, add that domain to `collectCompileOps(...)`.
- New **artifact** → add one `domain/<owner>/artifacts/<name>.artifact.ts` module containing the contract and its contract-bound validator; register that module once in the domain's `artifacts/index.ts` with `defineArtifactCatalog`; consumer contracts select derived `artifacts` handles, while producer contracts select `artifactModules`. `createStep` binds behavior only and derives publication runtimes from the producer contract.

---

## Strategy selection

The op envelope `{ strategy, config }` selects the algorithm. There are three control points; runtime dispatch is `runtimeStrategies[cfg.strategy].run(input, cfg.config)` in `packages/mapgen-core/src/authoring/op/create.ts`:

1. **Stage `compile()` literal (public stages)** — the primary production control point. `compile({ config })` hard-codes the strategy string, e.g. `computePrecipitation: { strategy: "refine", config: config.precipitationRefinement ?? {} }`. A `public` schema REQUIRES a `compile`; public config JSON never contains a `strategy` field — `compile()` injects it.
2. **`defaultStrategy` on a `StepOpUse`** — a step contract can declare `myOp: { contract, defaultStrategy: "refine" }`; this changes the schema default when the author omits the envelope. It does not forbid an explicit override.
3. **Direct step config (internal stages)** — for stages without `public`, the op envelope is authored directly as a step-config key: `{ "computeAtmosphericCirculation": { "strategy": "latitude", "config": {...} } }`.

Multi-strategy ops in live source (every other op has one inferred semantic default):

| Op | Strategy keys (default → impl) |
|---|---|
| `hydrology/compute-atmospheric-circulation` | `geostrophic-proxy` (default), `latitude` |
| `hydrology/compute-precipitation` | `vector` (default), `baseline`, `refine` |
| `hydrology/transport-moisture` | `vector-advection` (default), `cardinal` |
| `hydrology/compute-ocean-surface-currents` | `wind-gyre-projection` (default), `latitude` |
| `ecology/pedology/classify` | `balanced` (default), `coastal-shelf`, `orogeny-boosted` |
| `ecology/resources/plan-basins` | `balanced` (default), `hydro-fluvial`, `mixed` |
| `ecology/features/plan-reefs` | `habitat` (default), `diagonal-stride` |

> The contract's resolved `defaultStrategy` is authoritative at runtime. Strategy keys,
> filenames, and exported implementation names retain the same semantic identity; none is
> renamed merely to `default`.

---

## Truth vs projection (the load-bearing split)

- **Physics/truth stages** (1–15: the five `foundation-*`, five
  `morphology-*` including `morphology-shelf`, three `hydrology-*`, then
  `ecology-pedology` and `ecology-biomes`) publish canonical domain artifacts
  and MUST NOT call the adapter. `foundation-projection` is tile-space physics,
  not an engine-facing `map-*` projection.
- **Planner stages** are deliberately distinct. `ecology-features` (20) is an
  adapter-free, projection-adjacent intent planner feeding `map-ecology`;
  `placement` (22) mixes domain planning with Civ7 materialization/readback.
  Neither owns physical truth.
- **Map-projection stages** (`map-*`: 16–19 and 21) consume authored evidence
  and write/read engine terrain, biomes, and features through the adapter. They
  MUST NOT become truth authorities.

A common failure mode (see `references/worked-examples.md`, the coast-projection case): adapter terrain *maintenance* inside a `map-*` stage silently demotes a projected surface (coast→ocean) after the stamp. The fix reapplies the authoritative declared surface at each adapter boundary — drift happens after maintenance, not at the stamp.

---

## Artifact data-flow cross-section

The cross-stage contract is artifacts. The spine:

```
foundation-* ──▶ artifact:foundation.{mesh,initialCrust,crust,plateGraph,tectonicHistory,
                                      plates,crustTiles,...}
   │
   ▼
morphology-* ──▶ artifact:morphology.topography   (elevation + seaLevel + landMask + bathymetry — canonical terrain truth)
                 artifact:morphology.{routing, carvedCoastline, shelf(post-island shelfMask/coast metrics),
                                      mountains, volcanoes, beltDrivers, landmasses}
   │
   ▼
hydrology  ──▶ artifact:hydrology.baselineClimateField  (routing + refinement vintage)
               artifact:hydrology.climateField          (final-refined consumer vintage)
               artifact:hydrology.{climateSeasonality, climateIndices, cryosphere, hydrography,
                                   lakePlan, riverNetwork}
   │
   ▼
ecology    ──▶ artifact:ecology.{biomeClassification, soils, scoreLayers, plotEffectPlan}
               featureIntents.{vegetation,wetlands,floodplains,reefs,ice}
               occupancy.{base,floodplains,ice,reefs,wetlands}
   │
   ▼
map-*      ──▶ writes and observes engine state through the Civ7 adapter
               metrics/viz/trace project evidence without becoming causal artifact stores
```

Immutable recipe setup and static projection policy own shared projection facts directly.
Engine state is observed at the adapter boundary rather than snapshotted into cross-stage artifacts.

Artifacts are **write-once**: a producer `publish`es once; consumers `read`. Every
`*.artifact.ts` module pairs one contract with the complete structural/semantic validator used
by publish and satisfaction checks. `defineArtifactValidator` owns structural schema validation;
an optional local validator adds only relational or domain invariants. Its owning domain
`artifacts/index.ts` calls
`defineArtifactCatalog`, then exports `catalog.modules` as `artifactModules` and
`catalog.artifacts` as `artifacts`; a producer contract selects the relevant module entries and
`createStep` derives the validated runtimes from that contract. This keeps registration, handles,
and admission under one authority.
To find who produces/consumes a given key, grep its `artifact:` id across
`src/domain/` and `src/recipes/standard/stages/`.

---

## The mod ↔ engine boundary (what each side owns)

| `@swooper/mapgen-core` (engine substrate) owns | The mod (`mods/mod-swooper-maps`) authors |
|---|---|
| The authoring API (`defineOp/defineStep/defineArtifact/defineArtifactCatalog/defineDomain`, `createOp/createStep/createStage/createRecipe/createDomain/collectCompileOps`) | All domain algorithms (ops, strategies, rules) |
| Execution infra: PipelineExecutor, StepRegistry, write-once artifact runtime, reusable TypeBox schema validation, trace/viz | Domain artifact schemas + ids + relational validators; stage orchestration; recipe ordering; real authoring schemas |
| Strategy dispatch (`runtimeStrategies[cfg.strategy]`) | Game-facing entrypoints, map configs, presets |
| Zero Civ7 knowledge | Civ7 enters only at map entrypoints + `map-*`/`placement` adapter calls |

Falsifier awareness: if making a recipe-domain change *requires redefining* this boundary (not just referencing it), stop — the boundary was mis-drawn (FRAMING falsifier-b). In practice it is cleanly drawable and Grit/Nx-enforced.

---

## Boundary enforcement any change must respect (awareness-level)

These are enforced by tooling; respect them or CI/lint blocks the change. `civ7-architecture-authority` (`references/ownership-boundaries.md`) is the owner — reference it, don't restate it.

- **Nx boundaries** (`eslint.boundaries.config.mjs`; `bun run nx run-many -t boundaries`): `kind:mod` may only import `kind:{sdk,engine,adapter,foundation,control}`. No reaching into engine internals.
- **Habitat-routed Grit checks** (registered `.habitat/**/rule.json` manifests
  with `runner.name: "grit"` and their `pattern.md` files): these protect the
  recipe/domain public surface, domain-operation adapter and projection
  boundaries, step and stage imports, runtime validation/config boundaries,
  MapGen-core runtime neutrality, placement outcomes, Studio recipe artifacts,
  and the SDK entrypoint. Run focused proof with
  `bun habitat check --rule <registered-rule-id>`; use the graph-owned Habitat
  check targets for owner or workspace scope. A future native fixture corpus
  would validate patterns separately, not replace this authority.
- **Biome** (`biome.json`): double quotes, semicolons, ES5 trailing commas, 100-char lines, LF, 2-space indent. `src/maps/generated/**` is excluded; all recipe/domain source is linted.
- **Normalized domain layout** (accepted 2026-06-10): `ops/<op-id>/{contract.ts,index.ts,types.ts,strategies/}`, optional `ops/<op-id>/{rules,policy}/`, domain-level `policy/`, `lib/`.

After any structural change: `nx run mod-swooper-maps:build` (tsup → `mod/`, not hand-editable) is the schema-compile gate; behavioral changes also need diagnostics + in-game verification (`assets/live-verification-runbook.md`).

---

## Map configs → generated entrypoints

Map configs are `.config.json` envelopes (`{ $schema, id, name, description, recipe:"standard", sortIndex, latitudeBounds?, config:RecipeConfig }`); the `config` object addresses stage ids as keys. `bun run gen:maps` produces `src/maps/generated/*.ts` (`createMap`). Presets are legacy TS aliases. `src/recipes/studio-contracts/index.ts` exports `swooperStudioRecipeDagSources` mapping the contract-manifest to the Studio RecipeDag schema (Studio consumes source contracts, not generated outputs).

---

## Verify-against-source checklist (do this before trusting any structural claim)

- Stage order → `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` (`standardStageContractManifest`). NOT `recipe.ts` key order, NOT `STANDARD-RECIPE.md`.
- Op inventory for a domain → `mods/mod-swooper-maps/src/domain/<domain>/ops/contracts.ts` + `ls .../ops/`.
- Strategy keys for an op → that op's `contract.ts` `strategies` record + `index.ts` `createOp` binding.
- Which step produces/consumes an artifact → grep its `artifact:` id under `src/domain/` and `src/recipes/standard/stages/`.
- Authoring call shapes / import paths → `assets/recipe-scaffolds.md` (copy-paste, live-sourced).
