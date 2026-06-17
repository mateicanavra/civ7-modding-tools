# Pipeline Map — Technical-Arm Grounding

> Open when you need to make a TECHNICAL change to the recipe (add/split/recombine a stage, add an op or strategy, wire a new artifact) and you want the architecture map without re-discovering it. This is the structural cross-section: stages → steps → ops → strategies → artifacts, the truth/projection split, the data-flow contract, and the boundaries any change must respect. For copy-paste skeletons, go to `assets/recipe-scaffolds.md`. For the physics *inside* the ops, see `references/facet-physics.md`.

**Currency rule.** Everything below is re-derived from live source under `mods/mod-swooper-maps/src/`. Verify any stage/op/artifact claim against the live file cited, not against a doc. The `mapgen:*` cache skills are philosophy-only / outdated arch — never use them for stage order, file paths, or schemas. SDK/engine *architecture* authority is `civ7-architecture-authority`; this file maps the recipe-domain layer the mod authors.

---

## Where recipe-domain logic lives (and where it does NOT)

| Concern | Location | Owner |
|---|---|---|
| Domain algorithms (ops, strategies, rules) | `mods/mod-swooper-maps/src/domain/<domain>/` | the mod |
| Recipe (stages, steps, ordering, artifacts) | `mods/mod-swooper-maps/src/recipes/standard/` | the mod |
| Map configs / generated entrypoints / presets | `mods/mod-swooper-maps/src/maps/{configs,generated,presets}` | the mod |
| Diagnostics / viz (the harness) | `mods/mod-swooper-maps/src/dev/{diagnostics,viz}` | the mod |
| Authoring API + execution infra (`createRecipe`/`createStage`/`createStep`/`createOp`/`defineArtifact`, PipelineExecutor, write-once artifact runtime, TypeBox validation, trace/viz) | `@swooper/mapgen-core` = `packages/mapgen-core` | engine substrate (referenced, not changed for domain work) |
| SDK / Civ7 adapter contracts | `packages/sdk`, adapter | `civ7-architecture-authority` |

**The hard rule:** generation-logic (recipe-domain) changes land in `mods/mod-swooper-maps/src/{domain,recipes}`. ONLY engine-substrate changes touch `packages/mapgen-core`. The engine has zero Civ7 knowledge — Civ7 enters only at map entrypoints and the `map-*` projection / `placement` stages via adapter calls.

---

## Vocabulary (current, from live source)

- **domain** — a named collection of pure-algorithm ops for one concern-family; `defineDomain`/`createDomain`. No recipe awareness. Seven domains: `foundation, morphology, hydrology, ecology, placement, resources, narrative`.
- **op** — op-per-concern unit. `defineOp({ kind, id, input, output, strategies })` in `contract.ts`. Each op is its own directory `ops/<op-id>/{contract.ts, index.ts, types.ts, strategies/, rules?/}`. No cross-op reach-ins. Op id is `<domain>/<op-name>` kebab-case.
- **strategy** — a named variant inside an op's `strategies` record. Key `default` is mandatory. The op envelope is `{ strategy: "<id>", config: {...} }` (TypeBox discriminated union built by `defineOp`). Most ops are single-strategy; multi-strategy ops live mostly in hydrology + ecology (see strategy table below).
- **rule** — pure function in an op's `rules/`, shared across that op's strategies (e.g. `computeWindsEarthlike`).
- **step** — executable contract boundary. `defineStep({ id, phase, requires, provides, artifacts:{requires,provides}, ops, schema })` + `createStep(contract, { artifacts, normalize?, run })`. `run(context, config, ops, deps)`; publish/read artifacts via `deps.artifacts.<name>.publish/read`.
- **stage** — recipe-level authoring + ownership surface. `createStage({ id, knobsSchema, steps, public?, compile? })`. Owns its authoring surface, knobs, and step composition — NOT global ordering, truth authority, or compute.
- **recipe** — global stage/step order. `createRecipe({ id, namespace, tagDefinitions, stages, compileOpsById })`. Standard recipe id `mod-swooper-maps/standard`. Ordering is enforced by `contract-manifest.ts`, not by key order in `recipe.ts`.
- **artifact** — named, typed, write-once cross-stage data. `defineArtifact({ name, id, schema })`; id `artifact:<domain>.<name>` or `artifact:map.<name>`. Also dependency-tag prefixes `field:<name>` and `effect:<name>`.
- **knob** — stage-level semantic authoring shortcut, applied via `normalize()`/`compile()`.

---

## The standard recipe — 17 ordered stages (VERIFY against `recipe.ts`)

Order authority is `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts` (`standardStageContractManifest`, enforced by `orderStandardStages()`). `recipe.ts` assembles via `orderStandardStages({...})`; its key order is irrelevant — the manifest reorders deterministically. `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md` was in sync at last check but is **down-ranked**: it can lag the engine-refactor-v1 normalization work — re-read `contract-manifest.ts` before trusting it.

```
TRUTH STAGES (compute + publish artifacts; MUST NOT touch the adapter)
  1  foundation                    mantle/plates/tectonics
  2  morphology-coasts             landmass plates, rugged coasts
  3  morphology-routing            flow routing
  4  morphology-erosion            geomorphic cycle (stream-power + diffusion)
  5  morphology-features           islands, mountains, volcanoes, landmasses
  6  hydrology-climate-baseline    radiative/thermal/circulation/precip baseline
  7  hydrology-hydrography         rivers, lakes
  8  hydrology-climate-refine      precip refine (river-corridor / low-basin)
  9  ecology-pedology              pedology classify + resource basins
  10 ecology-biomes                Whittaker/Holdridge biome classify

PROJECTION + PLANNER STAGES (consume truth, write engine terrain via adapter)
  11 map-morphology                plot coasts/continents/mountains/volcanoes
  12 map-hydrology                 project lakes
  13 map-elevation                 build elevation
  14 map-rivers                    plot rivers (authored terrain materialization)
  15 ecology-features              score + plan floodplains/ice/reefs/wetlands/vegetation/plot-effects
  16 map-ecology                   plot biomes, apply features, plot effects
  17 placement                     starts, wonders, resources, discoveries
```

Read the interleave carefully: ecology *truth* (pedology, biomes) is computed at 9–10 *before* the `map-*` block; then `ecology-features` (15) runs *after* `map-rivers` because feature planning needs projected rivers; `map-ecology` (16) projects those features last before `placement` (17). `ecology-features` is a truth-consumer/planner — it has no `map-*` prefix and is NOT a pure projection stage even though it sits among them.

**narrative is absent.** The `narrative` domain has **0 ops** (`domain/narrative/ops/contracts.ts` is `export const contracts = {} as const`) and no live recipe stage slot. Subtrees (corridors/orogeny/overlays/tagging) persist as utilities; any claim of active narrative ops is wrong.

**Residual non-stage dirs:** `stages/ecology/` and `stages/morphology/` exist but are NOT registered stages — they are shared artifact-helper directories (`artifacts.ts`, validation), have no `index.ts` stage registration, and are not passed to `orderStandardStages`. The normalization packet directs dissolving the `ecology` hub; treat both as implementation-internal residue, not stages.

---

## The seven domains and their op counts

Each domain registers its op contracts in `domain/<domain>/ops/contracts.ts` and implementations in `ops/index.ts` (typed `satisfies DomainOpImplementationsForContracts<typeof contracts>` — the two must stay in lockstep). Counts verified from the live registries:

| Domain | Ops | Character |
|---|---|---|
| `foundation` | 17 | mesh, mantle potential/forcing, crust + evolution, plate graph/motion, tectonic segments, era membership, segment/hotspot events, era tectonic fields, history rollups, tectonics current, tracer advection, provenance, plate tensors |
| `morphology` | 15 | base topography, belt drivers, coastline metrics, flow routing, geomorphic cycle, landmask, landmasses, sea level, shelf mask, substrate, island chains, foothills, ridges, rough lands, volcanoes |
| `hydrology` | 19 | radiative forcing → thermal → circulation → ocean currents/geometry/thermal → evaporation → moisture transport → precipitation → cryosphere → albedo → land-water budget → climate diagnostics → drainage routing → discharge → river network project/metrics → plan lakes → navigable river select |
| `ecology` | 33 | biome classify, pedology classify/aggregate, resource basins, score balance, edge refine, feature/vegetation substrate, 5 vegetation + 5 wetland + 4 reef score ops, ice score, 3 plot-effects score ops, plan plot-effects, plan floodplains/wetlands/reefs/ice/vegetation, features apply. The most granular domain. |
| `placement` | 4 | plan discoveries, plan natural wonders, plan starts, plan wonders |
| `resources` | 8 | adjust resource support, derive habitat fields, plan aquatic/cultivated/geological/terrestrial resources, plan resource groups, select resource sites |
| `narrative` | 0 | no ops, no stage (see above) |

> Op counts = the number of `ops/<op-id>/` directories registered in that domain's `ops/contracts.ts`. To confirm, list `mods/mod-swooper-maps/src/domain/<domain>/ops/`.

---

## Op-per-concern layout (the unit you'll most often touch)

A single op is a directory. Using `morphology/compute-landmask` as the reference shape:

```
domain/morphology/
  index.ts                  defineDomain (contract-only) — referenced by step contracts via @mapgen/domain/morphology
  ops.ts                    createDomain (runtime) — referenced by recipe.ts via @mapgen/domain/morphology/ops
  ops/
    contracts.ts            registry: { computeLandmask: MyContract, ... }  (contract-only)
    index.ts                registry: { computeLandmask: myOp, ... } satisfies DomainOpImplementationsForContracts
    compute-landmask/
      contract.ts           defineOp({ kind, id, input, output, strategies })  — the schema/type surface
      index.ts              createOp(contract, { strategies })                 — binds implementations
      strategies/
        default.ts          createStrategy(contract, "default", { run, normalize? })
        index.ts            re-exports the strategy(ies)
      rules/                pure helpers shared across this op's strategies (optional)
      types.ts              OpTypeBagOf<Contract> — typed input/output/envelope bag
```

Two import faces of a domain (path alias `@mapgen/domain/*` → `src/domain/*`):
- Step **contracts** import `@mapgen/domain/<domain>` (the `defineDomain` contract index) to reference op contracts.
- `recipe.ts` imports `@mapgen/domain/<domain>/ops` (the `createDomain` runtime) for `collectCompileOps`.

**Registration points** when you add code (full skeletons in `assets/recipe-scaffolds.md`):
- New **op** → create the `ops/<op-id>/` directory; add the contract to `ops/contracts.ts` and the impl to `ops/index.ts`.
- New **step** → add the step contract to `standardStageContractManifest` (sets order) and the runtime step to the stage's `orderStandardStageSteps({...})`.
- New **stage** → add to `standardStageContractManifest` (position = pipeline order), add to `orderStandardStages({...})` in `recipe.ts`; if it brings a new domain, add that domain to `collectCompileOps(...)`.
- New **artifact** → `defineArtifact` in the stage's `artifacts.ts`; declare it in the producing step's `artifacts.provides` and any consumer's `artifacts.requires`.

---

## Strategy selection (how config picks a non-`default` strategy)

The op envelope `{ strategy, config }` selects the algorithm. There are three control points; runtime dispatch is `runtimeStrategies[cfg.strategy].run(input, cfg.config)` in `packages/mapgen-core/src/authoring/op/create.ts`:

1. **Stage `compile()` literal (public stages)** — the primary production control point. `compile({ config })` hard-codes the strategy string, e.g. `computePrecipitation: { strategy: "refine", config: config.precipitationRefinement ?? {} }`. A `public` schema REQUIRES a `compile`; public config JSON never contains a `strategy` field — `compile()` injects it.
2. **`defaultStrategy` on a `StepOpUse`** — a step contract can declare `myOp: { contract, defaultStrategy: "refine" }`; this changes the schema default when the author omits the envelope. It does not forbid an explicit override.
3. **Direct step config (internal stages)** — for stages without `public`, the op envelope is authored directly as a step-config key: `{ "computeAtmosphericCirculation": { "strategy": "latitude", "config": {...} } }`.

Multi-strategy ops in live source (the rest are `default`-only):

| Op | Strategy keys (default → impl) |
|---|---|
| `hydrology/compute-atmospheric-circulation` | `default` (geostrophic-proxy), `latitude` |
| `hydrology/compute-precipitation` | `default` (vector), `basic` (baseline), `refine` |
| `hydrology/transport-moisture` | `default` (vector-advection), `cardinal` |
| `hydrology/compute-ocean-surface-currents` | `default` (wind-gyre / earthlike), `latitude` |
| `ecology/pedology/classify` | `default`, `coastal-shelf`, `orogeny-boosted` |
| `ecology/features-plan-ice` | `default`, `continentality` |

> The strategy KEY (`default`) is authoritative at runtime, not the filename. `compute-atmospheric-circulation` exports `defaultStrategy` from `geostrophic-proxy.ts`; `compute-precipitation` exports `defaultStrategy` from `vector.ts`. Use the key, not the filename, when authoring.

---

## Truth vs projection (the load-bearing split)

- **Truth stages** (1–10: `foundation` … `ecology-biomes`) compute deterministic physics and publish artifacts. They MUST NOT call the adapter. This is the layer where behavioral/physics changes live.
- **Projection stages** (`map-*`) consume truth artifacts and write Civ7 engine terrain/features through the adapter. They MUST NOT own truth. `placement` (17) is the Civ7-facing planner/writer. `ecology-features` (15) is a truth-consumer/planner that feeds `map-ecology` — projection-adjacent, not `map-*`.

A common failure mode (see `references/worked-examples.md`, the coast-projection case): adapter terrain *maintenance* inside a `map-*` stage silently demotes a projected surface (coast→ocean) after the stamp. The fix reapplies the authoritative declared surface at each adapter boundary — drift happens after maintenance, not at the stamp.

---

## Artifact data-flow cross-section

The cross-stage contract is artifacts. The spine:

```
foundation ──▶ artifact:foundation.{mesh,crust,plateGraph,tectonicHistory,...}
   │
   ▼
morphology ──▶ artifact:morphology.topography   (elevation + seaLevel + landMask + bathymetry — canonical terrain truth)
               artifact:morphology.{routing, coastlineMetrics(coastalLand/coastalWater/shelfMask/distanceToCoast),
                                    mountains, volcanoes, beltDrivers, landmasses}
   │
   ▼
hydrology  ──▶ artifact:climateField
               artifact:hydrology.{climateSeasonality, climateIndices, cryosphere, hydrography,
                                   lakePlan, riverNetworkMetrics, climateDiagnostics}
   │
   ▼
ecology    ──▶ artifact:ecology.{biomeClassification, soils, resourceBasins, scoreLayers, plotEffectPlan}
               featureIntents.{vegetation,wetlands,floodplains,reefs,ice}
               occupancy.{base,floodplains,ice,reefs,wetlands,vegetation}
   │
   ▼
map-*      ──▶ writes engine terrain via adapter; may publish diagnostic artifact:map.* keys, e.g.
               artifact:map.morphology.coastClassification {baseWaterClass, sourceCoastMask, waterClass, policyCoastMask}
               artifact:map.projectionMeta   (cross-stage map-level artifacts in recipes/standard/map-artifacts.ts)
```

Artifacts are **write-once**: a producer `publish`es once; consumers `read`. To find who produces/consumes a given key, grep its `artifact:` id across `src/recipes/standard/stages/`. The `map.morphology.coastClassification.waterClass` key is treated as the authoritative post-`plotCoasts` coast/ocean projection and is reapplied after adapter maintenance in map-morphology/map-rivers/placement (commit `621658f3c`); `sourceCoastMask` is exposed separately for diagnostics.

---

## The mod ↔ engine boundary (what each side owns)

| `@swooper/mapgen-core` (engine substrate) owns | The mod (`mods/mod-swooper-maps`) authors |
|---|---|
| The authoring API (`defineOp/defineStep/defineArtifact/defineDomain`, `createOp/createStep/createStage/createRecipe/createDomain/implementArtifacts/collectCompileOps`) | All domain algorithms (ops, strategies, rules) |
| Execution infra: PipelineExecutor, StepRegistry, write-once artifact runtime, TypeBox schema validation, trace/viz | Artifact schemas + ids; stage orchestration; recipe ordering; config schemas |
| Strategy dispatch (`runtimeStrategies[cfg.strategy]`) | Game-facing entrypoints, map configs, presets |
| Zero Civ7 knowledge | Civ7 enters only at map entrypoints + `map-*`/`placement` adapter calls |

Falsifier awareness: if making a recipe-domain change *requires redefining* this boundary (not just referencing it), stop — the boundary was mis-drawn (FRAMING falsifier-b). In practice it is cleanly drawable and Grit/Nx-enforced.

---

## Boundary enforcement any change must respect (awareness-level)

These are enforced by tooling; respect them or CI/lint blocks the change. `civ7-architecture-authority` (`references/ownership-boundaries.md`) is the owner — reference it, don't restate it.

- **Nx boundaries** (`eslint.boundaries.config.mjs`; `bun run nx run-many -t boundaries`): `kind:mod` may only import `kind:{sdk,engine,adapter,foundation,control}`. No reaching into engine internals.
- **Grit checks** (`.grit/patterns/habitat/checks/`): notably `recipe_domain_surface`, `domain_ops_boundary_imports`, `domain_ops_projection_effects` (truth ops must not touch the adapter), `step_contract_domain_surface`, `sibling_stage_step_imports`, `runtime_run_validated`, `domain_ops_root_config`, `mapgen_core_runtime_civ7`, `domain_deep_import`, `placement_outcome_boundary`, `studio_recipe_artifacts`, `sdk_mapgen_entrypoint`.
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
- Which step produces/consumes an artifact → grep its `artifact:` id under `src/recipes/standard/stages/`.
- Authoring call shapes / import paths → `assets/recipe-scaffolds.md` (copy-paste, live-sourced).
