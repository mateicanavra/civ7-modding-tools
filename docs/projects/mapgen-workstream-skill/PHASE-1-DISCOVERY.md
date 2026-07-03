# Phase 1 — Discovery Report (Map-Generation Workstream Skill)

> Produced by the Phase 1 deep multi-agent discovery workflow (6 parallel investigators against **live source** → synthesis → adversarial completeness critic). Grounds Phase 2 skill authoring. Companion to [FRAMING.md](FRAMING.md).

> **Critic verdict:** CONFIDENT — every load-bearing claim I spot-checked (branch=codex/studio-effect-error-boundaries, 17-stage recipe, narrative=0 ops, 9 verify modes, coastClassification 4 fields, Studio port 5174 + runtimeMode, all 12 cited Grit checks, map-policy 2026-01-24, morphology-pre/mid/post deleted) verified against live source. The report's corrections already neutralize the worst drift (stale branch). Remaining gaps are authoring-detail, not blocking; Phase 2 can proceed with the targeted followups folded in.


---

# Phase 1 Discovery Report — Map-Generation Workstream Skill

> Grounding: `docs/projects/mapgen-workstream-skill/FRAMING.md` (REVIEWED frame). This report confirms/corrects its assumptions and produces the grounded map of (a) the recipe domain pipeline, (b) the harness, and (c) the exact reference targets for Phase 2 skill authoring. All claims are evidence-backed against live source. `mapgen:*` cache-plugin skills are treated as philosophy-only / outdated-arch throughout and are NEVER cited as current architecture.

---

## 1. Recipe / Domain Pipeline Shape (Technical Arm)

### 1.1 Top-level mod geography
Recipe/domain logic is authored entirely in the mod, confirmed against live source. The authoritative tree is `mods/mod-swooper-maps/src/{domain,recipes,maps,dev}` (FRAMING omits `dev`; the full set includes it):
- `src/domain/{foundation,morphology,hydrology,ecology,placement,resources,narrative}` — pure-algorithm ops per domain.
- `src/recipes/standard` — the recipe that composes domains into a pipeline.
- `src/maps/{configs,generated,presets}` — map config envelopes, generated Civ7 entrypoints, legacy preset aliases.
- `src/dev/{diagnostics,viz}` — diagnostics/viz tooling (the harness; §2).
- `src/recipes/studio-contracts` — type-checked Studio RecipeDag mapping.

The engine/core substrate is `@swooper/mapgen-core` (`packages/mapgen-core`); the SDK is `packages/sdk`. The mod-vs-engine boundary is hard: the engine provides the authoring API (`createRecipe`/`createStage`/`createStep`/`createDomain`/`createOp`/`defineArtifact`/`defineOp`/`defineStep`/`defineDomain`) plus execution infrastructure (PipelineExecutor, StepRegistry, write-once artifact runtime, TypeBox schema validation, trace/viz). The mod authors all domain algorithms, artifact schemas/ids, stage orchestration, config schemas, and game-facing entrypoints. The engine has zero Civ7 knowledge — that enters only via the SDK at map entrypoints and projection (`map-*`) / placement stages through adapter calls. (Evidence: `packages/mapgen-core/src/authoring/{recipe.ts:304-456,stage.ts:137-210,op/contract.ts,contracts.ts}`.)

### 1.2 Current vocabulary (confirmed from live source)
- **domain** — named collection of pure-algorithm ops; `defineDomain({id, ops})`; no recipe awareness.
- **op (operation)** — atomic algorithm unit; `defineOp({kind, id, input, output, strategies})`; **op-per-concern** — each op is its own `ops/<op-id>/` directory with `contract.ts`, `strategies/` (≥`default`), usually `rules/` and `types.ts`. No cross-op reach-ins.
- **strategy** — named variant of an op's algorithm with its own config schema (e.g. `baseline`/`refine` for precipitation; `default`/`latitude` for atmospheric circulation; `vector-advection` for moisture transport).
- **rule** — pure function in an op's `rules/` shared across strategies (e.g. `computeWindsEarthlike`, `upwindBarrierDistance`).
- **step** — executable contract boundary in a recipe; `defineStep({id, phase, requires, provides, artifacts:{requires,provides}, ops, schema})` + `createStep(contract, {artifacts, normalize?, run})`. `run(context, config, ops, deps)`.
- **stage** — recipe-level authoring/ownership surface; `createStage({id, knobsSchema, steps, public?, compile?})`. Owns authoring surface + knobs + step composition; NOT global ordering, truth authority, or compute.
- **recipe** — global stage/step order; `createRecipe({id, namespace, tagDefinitions, stages, compileOpsById})`. The standard recipe id is `mod-swooper-maps/standard`.
- **artifact** — named, typed, write-once cross-stage data; `defineArtifact({name, id, schema})`; id pattern `artifact:<domain>.<name>` or `artifact:map.<name>`. Published via `deps.artifacts.<name>.publish(ctx, value)`, read via `.read(ctx)`.
- **knob** — stage-level semantic authoring shortcut, applied via `normalize()`/`compile()`.
- **field: / effect:** — dependency-tag prefixes for per-tile fields and side-effects (less common than `artifact:` in current source).
- **truth stage** vs **projection stage (`map-*`)** — truth stages compute/publish deterministic physics artifacts (must not touch adapter); `map-*` stages consume truth and write Civ7 engine terrain/features (must not own truth).
- **flat default stage config** — the D1-normalized surface `{ knobs?, [stepId]?: stepConfig }`; preferred unless a genuine `public+compile` semantic transform is needed.
- **canonical map config envelope** / **generated entrypoint** / **preset** — `.config.json` wrapper → `gen:maps` → `src/maps/generated/*.ts` (`createMap`) ; presets are legacy TS aliases.

### 1.3 The canonical 17-stage standard recipe (VERIFIED live)
`mods/mod-swooper-maps/src/recipes/standard/recipe.ts:34-52` assembles via `orderStandardStages()` (ordering enforced by `contract-manifest.ts`):
`foundation → morphology-coasts → morphology-routing → morphology-erosion → morphology-features → hydrology-climate-baseline → hydrology-hydrography → hydrology-climate-refine → ecology-pedology → ecology-biomes → map-morphology → map-hydrology → map-elevation → map-rivers → ecology-features → map-ecology → placement`.

Note the interleaving: ecology truth (pedology/biomes) is computed before the `map-*` projection block, then `ecology-features` runs after `map-rivers` (features need projected rivers), and `map-ecology` projects features last before `placement`.

### 1.4 Ops inventory per domain (from `ops/contracts.ts` registries)
- **foundation** — 17 ops (mesh, mantle potential, mantle forcing, crust, crust evolution, plate graph, plate motion, tectonic segments, era plate membership, segment events, hotspot events, era tectonic fields, tectonic history rollups, tectonics current, tracer advection, tectonic provenance, plates tensors).
- **morphology** — 15 ops (base topography, belt drivers, coastline metrics, flow routing, geomorphic cycle, landmask, landmasses, sea level, shelf mask, substrate, island chains, foothills, ridges, rough lands, volcanoes).
- **hydrology** — 19 ops (radiative forcing, thermal state, atmospheric circulation, ocean surface currents, ocean geometry, ocean thermal state, evaporation sources, transport moisture, precipitation, cryosphere state, albedo feedback, land water budget, climate diagnostics, drainage routing, accumulate discharge, project river network, river network metrics, plan lakes, select navigable river terrain).
- **ecology** — 36 ops (biome classify, pedology classify/aggregate, resource plan basins, score balance, refine biome edges, feature/vegetation substrate, 5 vegetation + 5 wetland + 4 reef score ops, ice score, 3 plot-effects score ops, plan plot effects, plan floodplains/wetlands/reefs/ice/vegetation, features apply). Most granular domain.
- **placement** — 4 ops (plan discoveries, plan natural wonders, plan starts, plan wonders).
- **resources** — 8 ops (adjust resource support, derive habitat fields, plan aquatic/cultivated/geological/terrestrial resources, plan resource groups, select resource sites).
- **narrative** — **0 ops** (VERIFIED: `domain/narrative/ops/contracts.ts` is `export const contracts = {} as const`). The stage slot does not appear in the live recipe; `src/domain/narrative/` retains corridors/orogeny/overlays/tagging utility subtrees but no ops.

### 1.5 Artifact / data-flow cross-section (the data contract between stages)
- **foundation** publishes `artifact:foundation.{mesh,crust,plateGraph,tectonicHistory,...}`.
- **morphology** reads foundation, publishes `artifact:morphology.topography` (elevation+seaLevel+landMask+bathymetry — canonical terrain truth), `.routing`, `.coastlineMetrics` (coastalLand, coastalWater, shelfMask, distanceToCoast), `.mountains`, `.volcanoes`, `.beltDrivers`, `.landmasses`. (`stages/morphology/artifacts.ts:302-343`.)
- **hydrology** reads morphology, publishes `artifact:climateField`, `artifact:hydrology.{climateSeasonality,climateIndices,cryosphere,hydrography,lakePlan,riverNetworkMetrics,climateDiagnostics}`.
- **ecology** reads hydrology + morphology + pedology, publishes `artifact:ecology.{biomeClassification,soils,resourceBasins,scoreLayers,plotEffectPlan}`, `featureIntents.{vegetation,wetlands,floodplains,reefs,ice}`, `occupancy.{base,floodplains,ice,reefs,wetlands,vegetation}`.
- **map-\*** projection stages consume truth and write engine terrain via adapter; may publish diagnostic artifacts e.g. `artifact:map.morphology.coastClassification` (baseWaterClass, sourceCoastMask, waterClass, policyCoastMask). Cross-stage map-level artifacts are in `recipes/standard/map-artifacts.ts` (`artifact:map.projectionMeta`, etc.).

### 1.6 Map configs / Studio contracts
Config files are `.config.json` envelopes (`{$schema, id, name, description, recipe:"standard", sortIndex, latitudeBounds?, config:RecipeConfig}`); the `config` object directly addresses stage ids as keys. `bun run gen:maps` produces `src/maps/generated/*.ts` (`createMap`). `src/recipes/studio-contracts/index.ts` exports `swooperStudioRecipeDagSources` mapping the contract-manifest to the Studio RecipeDag schema (Studio consumes source contracts, not generated outputs).

---

## 2. The Harness (invokable verification + visualization surfaces)

Five independently invokable components. Concrete invocation paths verified.

### 2.1 Diagnostics suite — `mods/mod-swooper-maps/src/dev/diagnostics/`
- **`run-standard-dump.ts`** (`bun run diag:dump`): runs the full standard recipe through MockAdapter with `createTraceDumpSink` + `createVizDumper`. Writes `dist/visualization/<label>/<runId>/{manifest.json,trace.jsonl,data/*.bin}`; prints `{"runId","outputDir"}` to stdout. Has a `viz:runtime-deps` prerequisite.
- **`analyze-dump.ts`** (`diag:analyze`): land-coherence metrics (landmass summary, mountain/hill counts, landmask Hamming evolution).
- **`diff-layers.ts`** (`diag:diff`): per-layer Hamming/maxAbsDiff between two runs, filtered by `--prefix`/`--dataTypeKey`. **Primary generation-vs-display separator.**
- **`list-layers.ts`/`extract-trace.ts`** (`diag:list`/`diag:trace`).
- **`extract-earth-metrics.ts`** — `computeEarthMetrics(landMask, lakeMask?, riverClass?, riverNetworkBenchmarkSummary?, biomeIndex?)` → `{landShare, lakeShare, riverClassShare, biomeDiversity, dominantBiome, hydrology.riverNetworkSummary}`. The Earth-like benchmark metric primitive.
- **`placement-metrics.ts`** — E1–E4 placement expectation metrics (`verify --mode placement-metrics`).
- **`live-parity.ts`** — `runLocalFinalSurfaceSnapshot`, `buildFinalSurfaceParityProof`, `FinalSurfaceParityProof` types; **`surface-delta-context.ts`** classifies feature/resource/terrain deltas (`evidenceClass`).

### 2.2 Viz subsystem — `mods/mod-swooper-maps/src/dev/viz/`
- **`standard-run.ts`** (`bun run viz:standard`, default 48×30 seed 1337, swooper-earthlike config): quick viz dump.
- **`dump.ts`** — `createVizDumper` (`dumpGrid`/`dumpPoints`/`dumpSegments`/`dumpGridFields`) + `createTraceDumpSink`. Emission type `viz.layer.dump.v1` carries dataTypeKey/variantKey/stepId/phase/spaceId/bounds/field-stats. `runId` from `deriveRunId(plan)`.

### 2.3 Mapjet Studio — `apps/mapgen-studio/`
React+Vite SPA + Bun daemon. Launch: `nx run mapgen-studio:dev` (root). Daemon `apps/mapgen-studio/src/server/daemon/daemon.ts` on `STUDIO_DAEMON_DEFAULT_PORT = 5174` (override `STUDIO_DAEMON_PORT`; `STUDIO_DEV_PORT` for isolated dev). Single oRPC mount at `/rpc` (one-mount simplification; legacy REST retired), Effect `ManagedRuntime`, `runtimeMode: "studio-daemon-effect-orpc"` (VERIFIED). Health `/healthz`. Effect migration confirmed (effect 3.21.3, effect-orpc 0.3.0). Prereq target `mod-swooper-maps:build:studio-recipes` must run first. Studio renders viz dump binaries as deck.gl hexagonal tiles via the daemon's oRPC.

### 2.4 Earth-like benchmark — `docs/projects/pipeline-realism/` + `extract-earth-metrics.ts`
Project-scoped: M1 (Foundation maximal cutover), M2 (downstream ecology alignment), resource packets, runbooks. **There is no single "run the benchmark" top-level script** — the agent composes `diag:dump` → `computeEarthMetrics`/`analyze-dump` and compares to Earth targets in the pipeline-realism docs. Benchmarks are regime-family based (wet/arid/mountain/closed/archipelago), not single scalars. The executed-benchmark pattern (pre-declared expectation ledger + amended-with-evidence) is best demonstrated in `docs/projects/placement-realignment/expectations.md`.

### 2.5 Live Civ7 game — `scripts/live/`, `@civ7/direct-control`
Procedure: cold-boot Steam → Civ7 with `EnableTuner 1`; tuner port **4318**; `civ7 game health --json`; build/deploy mod; `runCiv7SinglePlayerFromSetup` (mapScript `{swooper-maps}/maps/<name>.js`, mapSize, seed, gameSeed, playerCount, options, waitForTuner); wait for `[mapgen-complete]` + `"seed":<N>` in Scripting.log. Parity: `verify --mode final-surface-parity --request-id <id>` fetches the exact-authorship proof from Studio `/rpc/runInGame/status`, runs `runLocalFinalSurfaceSnapshot`, calls `getCiv7FullMapGrid`+`getCiv7NativeRiverObjects`, emits `FinalSurfaceParityProof` with `unresolvedLinks`. Logs: `~/Library/Application Support/Civilization VII/Logs/`. Deployed mod: `~/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/`. Memory note: live screenshot capture requires clearing the age-intro overlay; MockAdapter-valid maps can still SIGSEGV the live engine without standard write/prep ops.

### 2.6 Verify dispatcher + build/deploy
`mods/mod-swooper-maps/scripts/verify.ts` (`nx run mod-swooper-maps:verify -- --mode <mode>`). The **9 registered modes (VERIFIED)**: `placement-catalogs` (default), `placement-metrics`, `studio-run-in-game-live`, `final-surface-parity`, `resource-delta-feasibility`, `feature-delta-feasibility`, `terrain-edge-live-context`, `placement-live-legality-agreement`, `placement-live-required-for-age`. Local modes are headless; live modes need a running tuner. Build: `nx run mod-swooper-maps:build` (tsup) → `mods/mod-swooper-maps/mod/` (not hand-editable). Deploy: `bun run --cwd mods/mod-swooper-maps deploy`. `gen:maps` → registered map configs.

### 2.7 Generation-vs-display bug discrimination (a core verification skill)
- A **viz/display bug** (wrong color scale, missing/mislabeled layer) lives in `apps/mapgen-studio/src/` or `createVizDumper`/`dump.ts`; underlying dump data is correct.
- A **generation bug** (wrong coastline, missing rivers, resource misplacement) lives in `src/{domain,recipes}`.
- Primary discriminators: `diff-layers.ts` (local-vs-local binary diff) and `FinalSurfaceParityProof.unresolvedLinks` (local-vs-live). If local and live grids match and only Studio is wrong → generation is correct. `surface-delta-context.ts` `evidenceClass` labels (`local-only-ecology-feature`, `natural-wonder-offset-*`, `local-assigned-live-empty`) support root-cause triage.

---

## 3. Behavioral Arm & Physics Grounding (Facet 1)

The pipeline encodes genuine Earth-science abstractions per domain. Facet 1 (net-new) must carry these mental models AND know what is modeled vs approximated vs absent. All grounding is from live `src/domain/*` ops.

### 3.1 Foundation — mantle dynamics & plate tectonics
Gaussian-plume mantle potential (Poisson-disk placed up/downwelling sources) → mantle forcing; rigid-body plate-motion solver (translation + 2-D rotation ω from least-squares fit to mantle velocity); tectonic-segment boundary classification (convergent/divergent/transform from relative normal/tangential velocities) with subduction polarity by crust type (oceanic subducts under continental); segment/hotspot events; era loop advancing plate membership; Lagrangian tracer advection → tectonic provenance. **Absent:** viscous coupling, slab-pull/ridge-push as separate mechanisms, true spherical geometry (flat/periodic mesh), self-consistent plate creation/destruction.

### 3.2 Morphology — landforms & erosion
Belt drivers map tectonic provenance → mountain/rift/volcano belts. `compute-geomorphic-cycle` implements the **Stream Power Incision Model** `E = K·A^m·S^n` + Laplacian hillslope diffusion + sediment transport/deposition, with young/mature/old world-age scaling. Shelf mask + sea-level define ocean/coastal geometry. **Absent:** glacial (U-valley) erosion, isostatic rebound, lithospheric flexure, aeolian erosion.

### 3.3 Hydrology — coupled climate-water-ocean system (the deepest domain)
Chain: radiative forcing (insolation power-law by |lat|) → thermal state (T = base + insolation·scale + elevation·lapse − land-cooling) → ocean geometry → ocean surface currents (wind stress + hemisphere-aware Ekman transport + basin gyres + coastal boundary currents + divergence-free Helmholtz projection) → ocean thermal state (SST advected/diffused, sea-ice) → evaporation sources → atmospheric circulation (`computeWindsEarthlike`: 3-cell Hadley/Ferrel/Polar scaffold + geostrophic-proxy wind from ∇pressure + optional seasonal modulation) → moisture transport (upwind vector-advection) → precipitation (humidity^exp·scale + coastal gradient − orographic rain shadow via cardinal upwind barrier walk; `refine` adds river-corridor/low-basin bonuses) → cryosphere → albedo feedback (iterative) → land-water budget (simplified PET, aridity = PET/(PET+precip+1)) → climate diagnostics (rainShadowIndex, continentalityIndex, convergenceIndex). **Absent:** Navier-Stokes, ITCZ migration, monsoon mechanism, thermohaline/deep overturning, ENSO, greenhouse forcing beyond fixed bias, moisture depletion during transport, SST→atmosphere coupling.

### 3.4 Ecology — biomes, pedology, features
`classify-biomes`: Whittaker/Holdridge 4×5 lookup (temperature zone {polar,cold,temperate,tropical} × moisture zone {arid,semiArid,subhumid,humid,perhumid}) with aridity-index downshift and a soft tropical/temperate transition band. Pedology derives soil fertility from rainfall/humidity/relief/sediment-depth/bedrock-age. Feature planners (wetlands/reefs/ice/vegetation/floodplains) score candidates against climate/hydrology fields. **Absent:** altitudinal/montane biome zonation, permafrost→hydrology feedback, soil carbon/nutrient cycles, succession, fire-climate coupling, crust-type lithological inheritance in pedology.

### 3.5 Earth anchors and the seven flagged physics gaps Facet 1 must know
Explicit Earth anchors in docs: HydroRIVERS (8.5M reaches / 35.9M km), GRWL (2.1M km wide rivers), HydroLAKES (~1.8% of land), non-perennial share 51–60%, endorheic ~1/5 of land; passive vs active continental-margin shelf-width contrast. **Improvement opportunities (evidence-backed):** (1) orographic uplift enhancement absent — only cardinal rain-shadow subtraction (`docs/projects/mapgen-orographic-precipitation/spike-feasibility.md`); (2) moisture not depleted by precipitation en route; (3) no thermohaline/deep-water ocean component; (4) no glacial erosion; (5) no explicit ITCZ/monsoon; (6) albedo feedback is a fixed-iteration pass; (7) pedology ignores crust/tectonic type; (8) no montane biome zonation. `riverClass` (0/1/≥2; only ≥2 projectable to `TERRAIN_NAVIGABLE_RIVER`) gates Civ projection.

Facet 1's distinctive contribution: translate Earth-science constants into tile-scale regime families (not single scalars), ground candidate models in physical processes, and pre-declare stylization ledgers where Civ tile scale forces visible simplification. The two research spikes (`docs/system/libs/mapgen/research/SPIKE-earth-physics-systems-modeling.md`, `SPIKE-synthesis-earth-physics-systems-swooper-engine.md`) are the closest existing physics grounding but are **philosophy-only / non-canonical**.

---

## 4. Skill Reference Graph

### 4.1 Purpose → owner → reference-or-extend (the routing table)
| Loop need | Owner skill | New skill action |
|---|---|---|
| Stage/step/domain placement, boundaries, drift, Grit/Biome compliance | `civ7-architecture-authority` (`references/ownership-boundaries.md`) | **Reference** (loop steps 4 & 8) |
| Official game-data authority, SDK/CLI consumer contracts, proof-boundary policy | `civ7-product-authority` (`references/source-map.md`) | **Reference base** for Facet 3 |
| Build/deploy/log/tuner/in-game proof discipline, proof-boundary taxonomy | `civ7-operational-debugging` (`references/{proof-boundaries,firetuner-runtime,operational-paths}.md`) | **Reference base** for Facet 2; **extend** with 3 overlays |
| Bounded, spec-driven closure (phase records, review ledger, realignment, Graphite) | `civ7-open-spec-workstream` | **Hand off** at step 10 |
| Corpus-wide evidence loop (12 gates) | `civ7-systematic-workstream` | **Hand off** at step 10 (corpus work) |
| Studio Civ7 oRPC/control-surface design | `civ7-orpc-control-architecture` | **Reference** (Studio-viz problem class only) |
| Drift watching for long multi-agent runs | `dra-structural-watcher` | Optional oversight reference |
| Branch topology at finalization | `graphite-stack-drain` | Reference at step 10 |
| Domain philosophy (tectonics/climate/rivers/biomes/placement concepts) | `mapgen:{foundation,morphology,hydrology,ecology,placement,narrative,config-tuning}` | **Philosophy-only — outdated arch; never cite paths/schemas/stage structure** |
| Frame / investigation / inquiry / system thinking | cognition `framing-design`, `investigation-design`, `inquiry-design`, `system-design`, `create-goal` | **Reference** (method, no arch burden) |

(9 repo-local skills VERIFIED present in `.agents/skills/`: architecture-authority, habitat-dra-workstream, open-spec-workstream, operational-debugging, orpc-control-architecture, product-authority, systematic-workstream, dra-structural-watcher, graphite-stack-drain. `civ7-habitat-dra-workstream` composes the same underlying skills and is not directly referenced by the new skill — awareness only.)

### 4.2 CONFIRMED facet novelty calibration
- **Facet 1 (Earth science / physics): NET-NEW.** No existing skill owns physical-realism reasoning end-to-end. The deepest authored content. Build from live `src/domain/*`; the two SPIKE docs and `mapgen:*` skills are philosophy-only background. **CONFIRMED.**
- **Facet 2 (Operational debugging / verification): BASE EXISTS — DELTA IS LARGER THAN FRAMING IMPLIES.** `civ7-operational-debugging` owns build/deploy/log/tuner/in-game proof comprehensively (reference, do not duplicate the proof-boundary taxonomy). Genuinely absent (must author): (a) Studio-viz verification (display-bug vs generation-bug discrimination; which Studio surface maps to which stage); (b) Earth-like benchmark-driven iteration process; (c) pipeline-internal diagnostics (`src/dev/{diagnostics,viz}` — distinct from Civ7 Logs). Reframe FRAMING's "largely exists" to "base exists + three map-gen overlays are net-new."
- **Facet 3 (Civ7 domain): PARTIALLY EXISTS.** `civ7-product-authority` (game-data authority, evidence tiers) + `civ7-operational-debugging` (FireTuner/logs/what-loaded) are bases. Net-new: design-intent reasoning (why Civ7 places things), forum/web research methodology, and Civ-appropriateness aesthetic judgment. Thinner than Facet 1 but non-trivial. **CONFIRMED.**

### 4.3 Loop → cognition-skill mapping
0 Intake/route → `inquiry-design` (only if ambiguous); 1 Frame → `framing-design`; 2 Investigation design → `investigation-design`; 3 Analysis → facet agents (arch-authority + operational-debugging + product-authority evidence); 4 Design → `system-design` + `civ7-architecture-authority`; 5 Alternative selection → `system-design` (leverage points); 6 Implementation → `src/{domain,recipes}` OR Studio; 7 In-game verification → operational-debugging base + map-gen extensions; 8 Architecture review → `civ7-architecture-authority`; 9 Refinement → loop 4–7; 10 Finalization → `civ7-open-spec-workstream` (bounded/spec) OR `civ7-systematic-workstream` (corpus-wide).

### 4.4 Closure handoff boundary (settle the FRAMING ambiguity)
Once implementation is verified locally + in-game, downstream realignment / Graphite commit / phase record / closure checklist are **owned** by the workstream skills — the new skill must NOT re-implement closure. Explicit trigger: **hand off to `civ7-open-spec-workstream` when the change is bounded and spec-driven; hand off to `civ7-systematic-workstream` when the work requires corpus coverage** (all resource placements, all biomes). Closure mechanics in practice: per-slice OpenSpec change + Graphite branch (`bun run openspec validate <id> --strict`); `workstream-record.md` with proof-gates labeled honestly by class; `closure-checklist.md`; `DEFERRALS.md`.

### 4.5 Boundary enforcement any recipe change must respect (awareness-level)
- **Biome** (`biome.json`): double quotes, semicolons, ES5 trailing commas, 100-char lines, LF, 2-space indent. `src/maps/generated/**` excluded; all recipe/domain source linted.
- **Nx boundaries** (`eslint.boundaries.config.mjs`, run `bun run nx run-many -t boundaries`): `kind:mod` may only import `kind:{sdk,engine,adapter,foundation,control}`.
- **Grit checks** (`.grit/patterns/habitat/checks/`, VERIFIED present): `recipe_domain_surface`, `domain_ops_boundary_imports`, `domain_ops_projection_effects`, `step_contract_domain_surface`, `sibling_stage_step_imports`, `runtime_run_validated`, `domain_ops_root_config`, `mapgen_core_runtime_civ7`, plus `domain_deep_import`, `placement_outcome_boundary`, `studio_recipe_artifacts`, `sdk_mapgen_entrypoint`, and others.
- **Normalized domain layout** (`ownership-boundaries.md`, accepted 2026-06-10): `ops/<op-id>/{contract.ts,index.ts,types.ts,strategies/}`, `ops/<op-id>/policy/`, domain `policy/`, `lib/`.

---

## 5. Civ7 Domain Capabilities (Facet 3)

Four data-access modalities + research posture.

### 5.1 Resource sync (CLI)
Official resources are a git submodule at `.civ7/outputs/resources/` (`mateicanavra/civ7-official-resources.git`, snapshot dated **2026-01-24**, VERIFIED present). Sync: `bun run resources:init` (init submodule) + `civ7 data unzip` (extract). Shortcut `bun run refresh:data` chains init+build+unzip (NOT `data:zip`, which needs the Steam install — `inputs.installDir` is commented out in `civ.config.jsonc`, so refresh:data works without the game). Lands at `.civ7/outputs/resources/Base/` and `/DLC/`. To bring policy tables current after a patch: `refresh:data` then `nx run @civ7/map-policy:verify -- --write`.

### 5.2 Game-data / XML parsing
Official XML at `.civ7/outputs/resources/Base/modules/base-standard/data/` (`resources.xml`, `resources-v2.xml`, `terrain.xml`, `leaders.xml`, `maps.xml`, `narrative-sifting.xml`, `discovery-stories.xml` — VERIFIED present). Official JS map scripts at `.../maps/` (`resource-generator.js`, `assign-starting-plots.js`, `discovery-generator.js`, `natural-wonder-generator.js`) are reference implementations of official placement logic. CLI graph tools `data:crawl`/`data:explore`/`data:render`/`data:slice` BFS from a seed identifier emitting graph.json/dot/SVG. `game:gameinfo` reads live `GameInfo.*` rows via tuner (4318). `game:local-data:inspect` inventories SQLite/saves/logs. **`@civ7/map-policy`** (`packages/civ7-map-policy/src/civ7-tables.gen.ts`, GENERATED, snapshot 2026-01-24) is the authoritative static policy snapshot: terrain/biome/feature indices, resource weights, hemisphere minimums, start biases, `MapResourceMinimumAmountModifier` rows.

### 5.3 How official data flows into the mod
Two channels: (a) static `@civ7/map-policy` tables (`CIV7_BROWSER_TABLES_V0`/`CIV7_POLICY_TABLES_V1`), and (b) runtime `GameInfo.*` via adapter. `domain/resources/policy/resource-legality.ts` reads `resourceValidPlacementRows` to build per-resource eligibility masks. `domain/resources/lib/corpus/official-base-standard.ts` fully encodes official resource rows. `domain/resources/lib/earthlike-expectations/official-earthlike.ts` encodes per-resource `[min,target,max]` count ranges grounded in physical geography — **the bridge where game-design intent meets physics reasoning** (habitat lane = physics fields ∩ official legality mask).

### 5.4 Design intent & research posture
Design intent surfaces: `leaders.xml` (StartBias rows), `resources.xml`/`resources-v2.xml` (class/weight/hemisphere/AdjacentToLand/LakeEligible), `terrain.xml` (biome/terrain/feature vocab), `maps.xml` (continent/mapsize), official JS scripts (actual algorithms). Best single reference for "what the game does at mapgen time": `docs/system/libs/mapgen/research/SPIKE-gameplay-mapgen-touchpoints.md` (research/discovery, not contract). Web research: tools `mcp__web-search__firecrawl_*` and skills `search:web-search`/`search:deep-search`. Authoritative community sources are tier-13 discovery material (CivFanatics forums incl. WildW's "Scripting Runtime Information", `ghost-ng/Civ7-Developer-Docs`, Chrispresso's Debug Console). Evidence hierarchy (`civ7-product-authority/references/source-map.md`): official resources tier 8, live source tier 9, community tier 13. **Posture:** exhaust official XML + `@civ7/map-policy` first, then `data:crawl`/`explore`, then firecrawl for gaps — labeling all community findings as discovery unless corroborated. Methodology precedent: `docs/projects/civ7-direct-control/workstream/discovery/public-corpus-report.md`.

---

## 6. Worked Examples (archetypes + the common loop)

### 6.1 TECHNICAL — Morphology 4-stage split (`docs/projects/morphology-4stage-split/`)
Split 3 morphology stages → 4 (`morphology-coasts/routing/erosion/features`), hard cutover, no aliases. **Already FULLY EXECUTED in live source** (VERIFIED: `morphology-coasts/steps/index.ts` exports `landmassPlates`+`ruggedCoasts`; `morphology-pre/mid/post` gone; `morphology/` is now only a shared artifacts export surface). 3 parallel agents: blast-radius inventory (22 downstream contract imports, 7 test files), Studio/viz coupling (dataTypeKey stable across split), decision packets. Verification proof class: schema-compile + test — **live game NOT required** because no generated terrain changed. Invariants enforced: artifact ids unchanged, op ids unchanged, viz dataTypeKey unchanged, publish-once handle locations preserved, no-water-drift assertion unchanged. Treat as a completed historical example.

### 6.2 BEHAVIORAL — Coasts by erosion / coast projection (`docs/projects/coasts-by-erosion/` + commit 621658f3c)
Removed Civ7 `expandCoasts`; stamp `TERRAIN_COAST` deterministically from Morphology shelf truth; then (latest commit) preserve that projection through downstream adapter maintenance. Four candidate models (distance-band / bathymetry / hybrid / margin-aware hybrid), chose Option D grounded in passive-vs-active-margin shelf physics. Second-order fix: adapter terrain maintenance in map-morphology/map-rivers/placement was silently demoting coast→ocean; fix treats `artifact:map.morphology.coastClassification.waterClass` as authoritative post-plotCoasts and reapplies it at each adapter boundary; `sourceCoastMask` exposed separately for diagnostics. 17 files changed. Proof class: test-level + Studio viz; live in-game is part of the broader placement milestone (E2.4). Lesson: drift happens after adapter maintenance, not at the stamp — fix at each boundary.

### 6.3 BEHAVIORAL (complex) — Placement realignment (`docs/projects/placement-realignment/`)
"Placement is screwed up." 7 parallel evidence agents → verdict table on 6 user impressions (confirmed/refuted with precise shape) + 7 root causes. Pre-declared Earth-like expectation ledger (E1 starts / E2 resources / E3 resource-start / E4 studio-live parity) BEFORE any tuning. Target arch: op/artifact model (plan→select→reconcile) with thin recipe materializers. 9 slices (S0–S8) + S9 live-compat hotfix, each OpenSpec change + Graphite branch. **Live verification 2026-06-11** (Huge 106×66, seed 1337, 10 players): attempt 1 FAILED at step 50 (`console.warn` not a function in live scripting runtime); after S9 fix, attempt 2 ran 53/53. Verdicts: E4.4 PASS 0.9863 mock-vs-live legality, E2.4 PASS (26 marine resources), live full-grid 321/321 deltas classified, 0 unexplained. The most complete end-to-end loop evidence in the repo. (`resource-distribution-policy` was absorbed into S0–S3 here.)

### 6.4 VISUALIZATION — Studio runtime simplification (`docs/projects/studio-runtime-simplification/`)
Daemon state was distributed across 4 localStorage keys, 5 polling loops, a watchdog, 3 oRPC mounts. **A display/diagnostic architecture defect, not a generation defect** — the client compensated for the daemon not owning state. Frame: "daemon owns ephemeral truth and pushes it; client renders." 5 decision packets (one oRPC surface, in-memory ops state w/ TTL, one multiplexed eventIterator, hybrid Civ7 interface, sealed error spine); rejected adding a DB as a level-2 buffer vs level-6 server-owns-truth. D0–D12 landed on main (PR #1748). Proof class: display-correctness (operator click-through). **D10 live-game watcher proof gap remains open** as of 2026-06-16. The best verification-arm example.

### 6.5 The common loop pattern (extracted)
0 Intake/route → 1 Frame → 2 Investigation design (pre-declared stop conditions) → 3 Multi-agent parallel analysis (always BOTH blast-radius/structural AND behavioral/diagnostic agents) → 4 Design with ≥1 recorded rejected structural alternative → 5 **Pre-declare expectations before tuning** (gate) → 6 Implementation in slice sequence (OpenSpec change + Graphite branch per slice; one behavior change per slice; regenerate artifacts in-slice) → 7 Architecture review per slice (not deferred) → 8 In-game verification at milestone boundaries (expensive, not per-slice; record branch/commit/run/config/timestamps/payloads) → 9 Refinement (hotfix slices from live-only defects) → 10 Finalization (proof gates labeled honestly by class).

### 6.6 How the three request classes differ in practice
- **Technical** (morphology split): verification = schema-compile+test, architecture review dominates (invariant preservation); live not required if no terrain output changes; shorter/cheaper loop; investigation = blast radius.
- **Behavioral** (coasts/placement/rivers): requires pre-declared Earth-like benchmarks; multi-agent adversarial prosecution (earth-hydrology / pipeline-boundary / Civ-runtime / studio-UX / verification-closure prosecutors); **live in-game mandatory and milestone-scoped**; hotfix slices from live proof expected.
- **Visualization** (studio): the diagnostic skill is "generation was right; view was wrong"; verification = display-correctness; architecture review on ownership (who owns state); physics facet absent.
The arms are always coupled: the coast fix (behavioral) required locating the adapter-maintenance structural locus (technical); placement realignment (behavioral) required restoring the policy table generator + op/artifact ownership (technical).

---

## 7. Frame Reconciliation

### 7.1 CONFIRMED (frame correct against live source)
- Recipe/domain logic lives in `mods/mod-swooper-maps/src/{domain,recipes,maps}` — confirmed; add `dev` (diagnostics/viz) to the path set.
- `@swooper/mapgen-core` is engine substrate; mod-vs-engine boundary is clean and cleanly drawable (falsifier-b NOT triggered).
- op-per-concern pattern, current vocabulary (domain/op/strategy/rule/step/stage/recipe/artifact/knob), truth-vs-projection split — all confirmed.
- `mapgen:*` cache skills are architecturally outdated (e.g. `packages/mapgen-core/src/foundation/plates.ts` does not exist; foundation is mod-authored with a far deeper model).
- Facet 1 is net-new; Facets 2 & 3 partially overlap existing skills (composition strategy holds).
- Earth-like benchmark process is real and lives in/near `docs/projects/pipeline-realism/`.
- Closure should hand off to open-spec/systematic-workstream, not re-implement.
- Studio is Effect-migrated, one oRPC mount, daemon port 5174.
- The example requests are real archetypes (rivers→river-lake-recovery; split→morphology-4stage-split; discoveries→placement-realignment).

### 7.2 CORRECTIONS
- **Current branch is `codex/studio-effect-error-boundaries`, NOT `codex/latest-juicy-config`.** The git-status snapshot is stale. The `latest-juicy.config.json` + generated `latest-juicy.ts` ARE committed and present, and Studio is Effect-migrated, but FRAMING's "Mapjet Studio on branch `latest-juicy-config`" and the investigators' "current working branch is latest-juicy-config" are both inaccurate against the live checkout. Treat `latest-juicy-config` as a config that exists, not the current branch.
- **FRAMING loop step 6 / line 158 says generation-logic changes land in `packages/mapgen-core/`** — incorrect per FRAMING's own hard core (line 186). Generation-logic (recipe domain) changes land in `mods/mod-swooper-maps/src/{domain,recipes}`; only engine substrate changes go to `packages/mapgen-core`. Fix in Phase 2.
- **Facet 2 calibration: "largely exists" understates the delta.** Restate as "base exists (reference proof discipline) + three net-new overlays (Studio-viz verification, Earth-like benchmark process, pipeline diagnostics)."
- **Narrative domain has zero ops and no live recipe stage slot.** Any claim of active narrative ops is wrong. The `narrative` stage is not in the 17-stage recipe.
- **No single "run the benchmark" script exists** — the agent composes `diag:dump` + `computeEarthMetrics`. FRAMING implies a turnkey benchmark; it is a composed call chain. The executed-benchmark pattern is in placement-realignment, not pipeline-realism.
- **Studio multi-project framing may mislead:** `studio-runtime-simplification` is EXECUTED (one-mount, Effect, on main via PR #1748); `mapgen-studio-redesign` is a design audit. These are not pending migrations.
- **Live screenshot capture is constrained** by the age-intro overlay and requires specific cold-boot/watcher sequences; not a simple foreground+screenshot.

### 7.3 Frame falsifier status
None of the three falsifiers fired: (a) the skill, once authored, should let a team run without re-explanation (composition holds); (b) the recipe-domain / SDK-architecture line is cleanly drawable (boundary verified, enforced by Grit/Nx); (c) the verification gate is genuinely load-bearing (live attempt-1 failures and SIGSEGV risk confirm in-game verification cannot be skipped). Proceed to Phase 2.


---

## Appendix A — Frame Reconciliation (corrections to apply)

- Current checked-out branch is codex/studio-effect-error-boundaries, NOT codex/latest-juicy-config. The git-status snapshot in the task header is stale. latest-juicy.config.json + generated latest-juicy.ts are committed and present, but FRAMING's and the investigators' claim that latest-juicy-config is the current working branch is inaccurate against the live checkout. Treat latest-juicy-config as an existing config, not the current branch.
- FRAMING loop step 6 (line 158) says generation-logic changes land in packages/mapgen-core/ — this contradicts FRAMING's own hard core (line 186). Generation-logic (recipe domain) changes land in mods/mod-swooper-maps/src/{domain,recipes}; only engine substrate changes go to packages/mapgen-core. Must be corrected in Phase 2 authoring.
- Facet 2 calibration 'largely exists' understates the delta. Restate as: base exists in civ7-operational-debugging (reference proof discipline) PLUS three net-new authored overlays — Studio-viz verification (display-bug vs generation-bug), Earth-like benchmark-driven iteration process, and pipeline-internal diagnostics (src/dev/{diagnostics,viz}, distinct from Civ7 Logs).
- Narrative domain has zero ops (export const contracts = {} as const, VERIFIED) and no live stage slot in the 17-stage recipe. Any claim of active narrative ops is wrong against live source.
- There is no single turnkey 'run the benchmark' script. The agent composes diag:dump + computeEarthMetrics/analyze-dump and compares to Earth targets. The executed pre-declared-expectation benchmark pattern lives in docs/projects/placement-realignment/expectations.md, not in pipeline-realism (which holds the program/philosophy).
- Studio multi-project framing risks misleading: studio-runtime-simplification is EXECUTED (one-mount, Effect, on main via PR #1748) and mapgen-studio-redesign is a design audit — these are not pending migrations.
- Live screenshot capture is constrained by the Civ7 age-intro overlay and requires specific cold-boot/watcher (FireTuner) sequences; it is not a simple foreground+screenshot. MockAdapter-valid maps can still SIGSEGV the live engine without standard write/prep ops.
- src/recipes/standard/stages/ecology/ and src/recipes/standard/stages/morphology/ still exist as shared artifacts/config directories (not stages). The normalization packet directs dissolving the stale ecology hub; this is acceptable structural residue, not a recipe stage.

## Appendix B — Residual Risks (carry into Phase 2)

- Branch/state drift: investigators and FRAMING both keyed off 'latest-juicy-config' as the current branch, but the live checkout is codex/studio-effect-error-boundaries. Any agent reasoning about 'what is on the current branch' must re-check git branch, not trust the snapshot. Studio Effect error-boundary work may be in flux on this branch.
- Doc-vs-source drift flagged but not fully measured: docs/system/libs/mapgen/reference/STANDARD-RECIPE.md is noted in the normalization packet as needing reconciliation with the live 17-stage recipe. An agent that reads it as authoritative may get a stale stage list. Verify against recipe.ts.
- @civ7/map-policy snapshot is dated 2026-01-24; if the game has patched resource/terrain data since, static legality tables may be stale relative to live behavior. Resource-legality claims from the static tables should be cross-checked against game:gameinfo when a live game is available (flagged as refactor-plan D4).
- Open migration residue: src/recipes/standard/stages/{ecology,morphology}/ persist as shared artifact/config dirs (not stages); the normalization packet directs dissolving the ecology hub. Whether this is intended-permanent or pending is unresolved and could confuse a structural change.
- Several open lake/placement/orographic migration questions remain unverified for completeness: whether the D2 lake-truth migration is fully wired (placement off engineProjectionLakes), whether the orographic precipitation spike was ever implemented, and the status of the placement-realignment human follow-ups (DEF-008 studio layer QA, age-intro-overlay-blocked in-game visual pass). A behavioral agent touching these areas must re-verify current state.
- The studio-runtime-simplification D10 live-game watcher proof gap is open as of 2026-06-16; the verification facet should not present live-watcher reconnect/replay behavior as fully proven.
- Facet-agent multi-agent orchestration pattern is not owned by any existing skill; the new skill must either define the spawn/coordinate pattern or reference cognition:team-design. This is an authoring decision left open for Phase 2.
- Live in-game verification is operationally heavy and brittle (cold-boot Steam, tuner 4318, age-intro overlay blocking OS captures, live-only runtime gaps like console.warn-not-a-function, SIGSEGV on MockAdapter-valid maps). The skill must set realistic expectations that attempt-1 live failures and hotfix slices are normal, not exceptional.

## Appendix C — Adversarial Critic: Authoring Gaps

- Authoring API surface for a NEW op/strategy/stage is described conceptually but not as a copy-paste skeleton. To make a technical recipe change cold, an agent still needs the exact createOp/createStep/createStage call shapes, the strategies record structure (contract.ts defineOp({strategies:{...}}) + index.ts createOp(contract,{strategies})), and how a new strategy key is selected from config. The report points at reference files but assets/ does not include an op/step/stage scaffold template — only ledger/record/runbook templates. This is the single biggest gap for arm (a).
- Strategy-selection mechanism is unspecified: how config picks a non-default strategy (e.g. precipitation baseline vs refine vs vector; atmospheric-circulation geostrophic-proxy vs latitude) is never shown. An agent making a behavioral change that swaps or adds a strategy needs to know the strategy key lives in the op envelope schema (strategy+config union) and is set in stage/step config — the report names strategies but not the wiring to activate one. Gap for arm (b).
- Concrete in-game verification command sequence is narrated but not captured as a runnable, ordered checklist with the exact failure-recovery branch (attempt-1 console.warn/console.log class of live-only runtime gaps, SIGSEGV-without-standard-write/prep-ops, age-intro-overlay-blocks-capture). The blueprint lists a 'live-game milestone verification runbook' asset sourced from MILESTONE-PROOFS.md but does not enumerate the rejectPattern/log-marker set ([mapgen-complete], seed:<N>) as an explicit gate. Gap for arm (c).
- Studio-viz fix workflow (arm d) is well-diagnosed (diff-layers + unresolvedLinks discriminator) but the actual edit surface inside apps/mapgen-studio/src for a display bug is not mapped — which file owns color scales / layer registration / deck.gl layer construction vs createVizDumper. An agent fixing a Studio display bug still has to re-discover where in the SPA the viz layer rendering lives.
- Doc-vs-source drift in docs/system/libs/mapgen/reference/STANDARD-RECIPE.md is flagged as a residual risk but not measured. If Phase 2 cites that doc as a reference target an agent could ingest a stale stage list. The blueprint should either down-rank STANDARD-RECIPE.md or instruct verify-against-recipe.ts on every read.
- Multi-agent facet-orchestration pattern (loop step 3 always spawns BOTH structural and behavioral agents; behavioral work adds adversarial prosecutor lanes) is asserted as the canonical shape but the report leaves who-owns-the-spawn-pattern open (cognition:team-design vs author-it-in-the-skill). This is the one loop step with no owner; left unresolved it becomes Phase 2 improvisation.

## Appendix D — Cache-Skill Leakage Check

- NONE found as current-architecture claims. The report consistently labels mapgen:* as 'philosophy-only / outdated arch' and explicitly falsifies the stale packages/mapgen-core/src/foundation/plates.ts path. The currency banner is carried into the blueprint (<invariants>: never cite cache-skill paths) and the routing table.
- BORDERLINE (not leakage, but adjacent): the report adopts a 'default' strategy name for compute-atmospheric-circulation (vocabulary section: "default/latitude for atmospheric circulation"). Live source has strategy files geostrophic-proxy.ts and latitude.ts (NO default.ts); the contract describes 'latitude strategy' as the legacy model. Calling the non-latitude strategy 'default' is an investigator inference, not a live key. This is a generic naming-precision slip, not cache-skill contamination — but Phase 2 must use the real strategy keys (geostrophic-proxy, latitude) when authoring facet-physics.md, or it will mis-instruct an agent trying to select a strategy.
- Similar precision slip (not leakage): precipitation strategies are baseline/refine/VECTOR in live source; the report says 'baseline/refine' and omits vector.ts. Not cache-derived — just an incomplete enumeration.

## Appendix E — Targeted Followups (Phase 2 prework)

- Open mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/contract.ts and .../compute-precipitation/contract.ts to extract the EXACT strategy keys and how a strategy is selected, then correct facet-physics.md vocabulary: atmospheric circulation = {geostrophic-proxy, latitude} (not 'default/latitude'); precipitation = {baseline, refine, vector}. Document the strategy-selection mechanism (op envelope strategy field) as the canonical 'how to swap a strategy' recipe.
- Read one complete op triple (contract.ts + index.ts + strategies/default.ts or baseline.ts) and one complete step+stage pair end-to-end, then author an assets/ scaffold template for a new op, a new strategy, and a new step/stage — the missing copy-paste surface for the technical arm.
- Read mods/mod-swooper-maps/scripts/live/verify-studio-run-in-game-live.ts and verify-final-surface-parity.ts to capture the exact log-marker gate ([mapgen-complete], seed:<N>), rejectPattern, and request-id/proof-file flow; encode as a runnable live-verification checklist with the attempt-1 recovery branch.
- Grep apps/mapgen-studio/src for the deck.gl layer construction / dataTypeKey->color-scale mapping to identify the display-bug edit surface and add it to facet-verification.md (arm d).
- Decide and record the facet-orchestration owner: either reference cognition:team-design for the spawn/coordinate pattern or author it inline in SKILL.md loop step 3; do not leave it 'open for Phase 2'.
- Diff docs/system/libs/mapgen/reference/STANDARD-RECIPE.md against recipe.ts:30-52; if stale, either fix it in Phase 2 prework or down-rank it from the reference-targets list with a 'verify-against-recipe.ts' caveat.

## Appendix F — Unverified Claims (taken on investigator evidence)

- computeEarthMetrics signature and return shape {landShare,lakeShare,riverClassShare,biomeDiversity,dominantBiome,hydrology.riverNetworkSummary} — asserted from extract-earth-metrics.ts but not opened in my spot-check; taken on investigator evidence only.
- FinalSurfaceParityProof internal fields (unresolvedLinks, riverMetadataParity, lakeReadbackParity, floodplainActiveParity) and surface-delta-context evidenceClass label set (local-only-ecology-feature, natural-wonder-offset-*, local-assigned-live-empty) — cited from live-parity.ts/surface-delta-context.ts but not directly read here.
- Per-domain ops counts (foundation 17 / morphology 15 / hydrology 19 / ecology 36 / placement 4 / resources 8) — narrative=0 was directly verified; the non-zero counts are from investigator reads of ops/contracts.ts registries, not re-counted in this review.
- Tuner port 4318 and the runCiv7SinglePlayerFromSetup live-launch contract — consistent across investigators and the memory note but not independently re-verified against scripts/live in this pass.
- resources:init + civ7 data unzip sync chain and refresh:data working without the Steam install (installDir commented out in civ.config.jsonc) — plausible and internally consistent but not re-executed/verified here.
- studio-runtime-simplification D0-D12 on main via PR #1748 and D10 live-watcher proof gap still open as of 2026-06-16 — taken from project docs, not confirmed against git/PR state in this review.
- The precise SPIM exponent form E=K*A^m*S^n and Ekman/gyre/Helmholtz current model — asserted from rules/index.ts files the investigators read; I confirmed the op/strategy files EXIST but did not read the algorithm bodies to confirm the physics descriptions are faithful.

## Appendix G — Missing Areas

- assets/ op-step-stage scaffold templates (the report only specs ledger/record/runbook templates) — the technical arm has no skeleton to copy.
- Strategy-selection-from-config wiring documentation (the op envelope strategy+config union and where the strategy key is set) — needed for any add/swap-strategy behavioral change.
- Studio-viz edit-surface map (which apps/mapgen-studio/src files own layer rendering/color scales) for arm-(d) display-bug fixes.
- Explicit live-verification gate checklist with log markers/rejectPattern and the attempt-1 live-only-failure recovery branch.
- Owner for the multi-agent facet-orchestration / prosecutor-lane spawn pattern (team-design reference vs author-in-skill).
- A standing instruction to verify docs/system/libs/mapgen/reference/STANDARD-RECIPE.md against recipe.ts before citing (flagged drift, no mitigation).

## Appendix H — Per-Investigator Frame Corrections (raw)


**recipe/domain pipeline shape (technical arm)**
- FRAMING.md says recipe logic lives in src/{domain,recipes,maps,dev} — confirmed correct. Narrative domain has an empty ops contracts object; there are effectively no narrative ops currently, though the stage slot exists.
- FRAMING.md describes 'op-per-concern pattern' — confirmed. Each op has its own directory with contract.ts/strategies/rules/types. Ecology has 36 ops across its ops/ directory. This is the most granular domain.
- FRAMING.md mentions src/domain/resources as a live domain — confirmed, with 8 ops. Resources ops are the domain-level algorithms; placement ops (4 ops) handle the civ7-facing game placement layer.
- FRAMING.md correctly identifies that mapgen:* cache plugin skills are outdated. Confirmed: no `packages/mapgen-core/src/foundation/plates.ts` path exists; foundation is mod-authored in mods/mod-swooper-maps/src/domain/foundation/, not engine-core.
- FRAMING.md says presets live in src/maps/presets — confirmed, but clarification needed: presets are now thin TypeScript aliases pointing to the canonical .config.json files in src/maps/configs/. The primary authoring surface is configs/*.config.json; presets/*.ts are legacy-compatibility re-exports.
- FRAMING.md correctly identifies studio-contracts as a path — confirmed at src/recipes/studio-contracts/index.ts. It exports swooperStudioRecipeDagSources, typed against RecipeDagStageInput from @swooper/mapgen-core, consuming standardStageContractManifest.
- The normalization packet (architecture-normalization-packet.md, 2026-05-29) shows the ecology truth is normalized to ecology-pedology/ecology-biomes/ecology-features per D5 — and this is ALREADY the live state (confirmed in contract-manifest.ts). The old seven per-family wrapper stages are gone. Doc-vs-source: the normalization packet says 'stages/ecology/' hub should be dissolved, but src/recipes/standard/stages/ecology/ still exists as a shared artifacts/configs directory (not a stage). This is acceptable structural residue, not a bug.
- The coast-projection work referenced in recent commits (621658f3c) corresponds to artifact:map.morphology.coastClassification which has three fields: baseWaterClass (pre-policy), sourceCoastMask (pre-policy shelf mask), and waterClass (post-policy/authoritative). This artifact is the diagnostic boundary between Morphology truth and map-morphology projection.
- FRAMING.md cites docs/system/libs/mapgen/MAPGEN.md as a canonical reference — confirmed the file exists and routes to sub-docs. However, the normalization packet explicitly notes that docs/system/libs/mapgen/reference/STANDARD-RECIPE.md 'still needs reconciliation with the live standard recipe.' Flag this as a potential drift source for any agent that reads STANDARD-RECIPE.md.
- The narrative domain currently has zero ops (empty contracts record). Any skill or doc claiming narrative has active domain ops is wrong against live source.

**verification-harness**
- FRAMING.md states 'Mapjet Studio on branch latest-juicy-config' as if this is a separate branch. The live repo is currently ON codex/latest-juicy-config; the latest-juicy map config and its generated registration artifact (src/maps/generated/latest-juicy.ts) are committed and present. The branch name is the current working branch, not a distant state to reach.
- FRAMING.md does not specify that the earth-like benchmark has no single top-level 'run the benchmark' script — computeEarthMetrics must be composed with a diagnostic dump run; the project-realism docs describe the metric targets and milestones but the agent must wire the call chain manually.
- FRAMING.md says 'diagnostics and viz are partly local to the mod and feed Studio' — this is correct but understates the architectural split: the dump infrastructure (dump.ts) is the interface between the recipe trace events and both the diagnostics scripts (which read manifest+trace directly) and Studio (which reads the same manifest+binaries via the daemon's oRPC). The Studio does not have its own separate analytics pipeline.
- FRAMING.md references three studio projects (mapgen-studio, mapgen-studio-redesign, studio-runtime-simplification) as distinct. In live source: the redesign project (docs/projects/mapgen-studio-redesign/) is a design audit/migration effort; the runtime-simplification (docs/projects/studio-runtime-simplification/) has been executed — the daemon is already on the one-oRPC-mount architecture. The multi-project framing may mislead an agent into thinking these are pending migrations rather than completed work.
- FRAMING.md describes 'the two problem classes (generation-logic vs. Studio-visualization)' without noting the concrete diagnostic split: generation bugs show up in FinalSurfaceParityProof.unresolvedLinks (local-vs-live diffs) or in diag:dump binary diffs; viz bugs show up only in Studio display (the underlying dump data is correct). The diff-layers.ts tool is the clean separator.

**Earth-science / physics grounding for the BEHAVIORAL arm (Facet 1)**
- FRAMING.md says 'mapgen:* cache skills are architecturally outdated' — confirmed correct. The live op-per-concern structure (e.g. compute-atmospheric-circulation with geostrophic-proxy strategy, compute-ocean-surface-currents with Ekman/gyre physics) does NOT match what the cache skills describe. Any arch/path claim from those skills must be discarded.
- FRAMING.md describes Facet 1 as 'net-new' and the deepest new content — CONFIRMED. No existing skill owns the physical-realism reasoning chain from tectonics through climate to biomes. The research spikes (SPIKE-earth-physics-systems-modeling.md, SPIKE-synthesis.md) provide philosophy but are labeled non-canonical; they are the closest thing to domain physics grounding in the repo and should be treated as background reading, not authoritative architecture.
- FRAMING.md's example 'improve rivers' → river-lake-recovery is CONFIRMED accurate: the FRAME.md for that project contains explicit Earth benchmark anchors (HydroRIVERS, GRWL, non-perennial share) that directly feed Facet 1 reasoning about river physical plausibility.
- FRAMING.md's 'mapgen:foundation' skill reference for tectonics is stale — the live foundation is NOT the one in packages/mapgen-core/src/foundation/plates.ts (referenced in old skill). The live domain is in mods/mod-swooper-maps/src/domain/foundation/ops/ with a significantly deeper model (mantle potential, mantle forcing, plate motion solver, tectonic segments, era loop, tracer advection, provenance).
- The 'behavioral arm' description in FRAMING.md implies the physics agent reasons about algorithms and parameters. This is correct but understates the structural depth: the pipeline has genuinely physics-grounded implementations (Gaussian mantle plumes, rigid-body plate kinematics, SPIM erosion, 3-cell atmospheric circulation, Ekman transport, geostrophic winds, Whittaker biome lookup) that a Facet 1 agent must understand at the algorithmic level to reason about what is modeled vs approximated vs absent.
- The 'two arms held together' principle is well-illustrated by the orographic precipitation gap: the current cardinal-only upwind scan is both a structural limitation (touching the precipitation op contract and strategy) and a behavioral deficiency (rain shadows are blocky and directionally inaccurate). Facet 1 must understand both to reason about the fix correctly.
- FRAMING.md Phase 1 Seed asks to confirm 'the current recipe/operation/strategy/artifact vocabulary from live source' — the vocabulary is confirmed as: domain > ops (op-per-concern) > strategies (selectable per op) > rules (shared pure functions used by strategies) > contract (defines input/output schema) > artifact (cross-stage typed data product). The config hierarchy is: stage knobs (author-facing) > step config (expert) > op config (per-strategy schema defaults).

**skill-ecosystem-reference-graph**
- FRAMING.md says civ7-operational-debugging 'substantially covers Facet 2 (verification)' — confirmed, but the DELTA is larger than framing implies: the facet must explicitly add (a) Studio visualization verification surface (distinguishing display bug vs generation-logic bug), (b) Earth-like benchmark-driven iteration process (not in the skill at all), and (c) pipeline diagnostics emitted by mods/mod-swooper-maps/src/dev/{diagnostics,viz} (these are pipeline-internal diagnostics, not Civ7 Logs diagnostics). These three are genuinely absent from civ7-operational-debugging and must be authored in the facet.
- FRAMING.md says the Facet 2 facet is 'largely exists' — more accurate framing: 'base exists (reference it), three map-gen-specific overlays are net-new (author them)'. The framing underestimates the authored depth needed for Facet 2.
- FRAMING.md implies civ7-orpc-control-architecture is in the reference graph broadly — it is more narrowly scoped to the Studio-viz problem class only. For generation-logic changes, it is not needed. The reference graph diagram should scope this more precisely.
- FRAMING.md loop step 6 says 'generation-logic changes land in packages/mapgen-core/' — this is incorrect per the FRAMING.md's own hard core. Generation-logic (recipe domain) changes land in mods/mod-swooper-maps/src/{domain,recipes}. Only engine/substrate changes go into packages/mapgen-core/. This drift in the loop description (step 6) should be corrected in Phase 2 authoring.
- FRAMING.md identifies the closure handoff to civ7-open-spec-workstream / civ7-systematic-workstream but leaves the TRIGGER ambiguous — confirmed boundary: hand off to open-spec when the change is bounded/spec-driven; hand off to systematic when corpus-wide evidence is required. The new skill should make this trigger explicit rather than leaving it as 'or'.
- The civ7-habitat-dra-workstream skill exists in the repo but is not listed in .agents/skills/README.md's skill table — it is listed in the skills directory. The new skill does not need to directly reference it (it is Habitat-recovery-specific), but awareness that it exists and composes the same underlying skills is useful for avoiding duplication.

**Civ7 domain capabilities (Facet 3 — Civ7 domain agent)**
- FRAMING.md states Facet 3 'adds the research/intent dimension (forums, web, design-intent reasoning, Civ-appropriateness judgments) not owned elsewhere' — this is accurate but understates how much official game-data authority already exists in @civ7/map-policy and the domain/resources lib/corpus/ files. The facet's primary contribution is *integrating* the static official corpus, the live runtime access, and web/forum research into a coherent reasoning surface — not pioneering game-data access from scratch.
- FRAMING.md says 'civ7-product-authority owns official game-data authority' — confirm this is specifically about *what the repo promises* (product/SDK behavior), not about *reading raw game XML*. The civ7-product-authority skill governs evidence authority rules but does not itself read or parse game XML. The actual data access pipeline is: resources submodule → CLI data:zip/unzip → @civ7/map-policy verify → civ7-tables.gen.ts. Facet 3 must understand this pipeline directly.
- The resource sync pipeline has a dependency on the Steam game install being present (`inputs.installDir` in civ.config.jsonc). In the current repo, the installDir is commented out in civ.config.jsonc:3 — an agent attempting `data:zip` without configuring this will fail. The submodule (`resources:init`) and pre-existing archive already provide the synced data at `.civ7/outputs/resources/`. The refresh:data command bundles init+build+unzip but NOT zip, so it works without the game install.
- The @civ7/map-policy table snapshot is dated 2026-01-24 (packages/civ7-map-policy/src/civ7-tables.gen.ts:13). If the game has patched resource data since then, the static tables may be stale. An agent should check the submodule commit vs. current game version before relying on them for authority claims (vs. using them for planning heuristics). This is flagged as 'refactor-plan D4' in the codebase.
- FRAMING.md's Phase-1 questions include 'how does a future agent invoke each harness component' — for Facet 3, the concrete answer is: (a) offline XML inspection uses data:crawl/explore against .civ7/outputs/resources; (b) static policy uses @civ7/map-policy CIV7_BROWSER_TABLES_V0; (c) live runtime access uses game:gameinfo/game:inspect with Civ7 running on port 4318; (d) local forensics use game:local-data:inspect. These four modalities cover the full Facet 3 data access surface without ambiguity.

**Two-arms worked examples — end-to-end archetype workstreams for the skill loop**
- FRAMING.md says 'recipe domain logic is authored in mods/mod-swooper-maps/src/{domain,recipes,maps}' — this is correct and verified. The live stages live under src/recipes/standard/stages/ (not src/stages/); the domain ops live under src/domain/; dev tooling (diagnostics + viz) lives under src/dev/, which FRAMING.md omits from the path list. Full authoritative set: src/{domain,recipes,maps,dev}.
- FRAMING.md places 'morphology-4stage-split' as a technical-arm example. Confirmed: the split is already FULLY EXECUTED in live source (morphology-coasts/, morphology-routing/, morphology-erosion/, morphology-features/ exist; morphology-pre/mid/post are deleted). The project docs record the investigation and decision packets for the plan; the implementation is at commit 4e696d237 (PR #1044) and later refinement commits. The skill should treat this as a completed historical example, not an in-progress project.
- FRAMING.md identifies 'coasts-by-erosion' as a behavioral arm example. Accurate, but the most recent and richest coast-related evidence is in commit 621658f3c (coast projection preservation — 17 files changed) on the current branch, which is one step BEYOND what the project doc describes. The project doc covers the original expandCoasts removal and shelfMask introduction; the recent commit adds the projection-parity mechanism. The skill should reference BOTH layers: the scratchpad/REPORT.md for the design rationale, and the recent commit for the drift-preservation pattern.
- FRAMING.md lists 'mapgen-studio / studio-runtime-simplification' as visualization examples. The studio-runtime-simplification project (PLAN.md + RUNTIME-EFFECT-REFACTOR-FRAME.md) is the richer example of the visualization arm because it shows the full loop — analysis, decision packets, spine-first slice sequence, test relayering, live operator proof, and a retained open proof gap (D10). The mapgen-studio project (ROADMAP.md + architecture-assessment.md) is the earlier V0/V0.1 design phase; its loop did not reach finalization the same way. For the skill, studio-runtime-simplification is the better verification-arm example.
- FRAMING.md says 'the Earth-like benchmark process is real and lives in/near docs/projects/pipeline-realism/'. Confirmed: pipeline-realism/ is a real project with milestones (M1 foundation maximal cutover, M2 ecology architecture alignment), research packets, and runbooks. However, the Earth-like benchmark EXECUTION (pre-declared expectations + stats harness + live measurement) is more concretely demonstrated in docs/projects/placement-realignment/expectations.md and the evidence/ directory there. The skill should point at both: pipeline-realism for the Earth-like benchmark philosophy/program, and placement-realignment for the executed benchmark pattern including how expectations are pre-declared, amended with evidence, and linked to live proof.
- FRAMING.md frame's 'verification' description says 'diagnostics + benchmark + Studio + LIVE screenshots.' In practice, the live screenshots are blocked by the age-intro overlay (noted in placement workstream-record.md: 'in-game visual pass past the age-intro overlay') and require specific cold-boot sequences. The skill should note this operational constraint explicitly: live camera-targeted screenshot capture requires the age-intro overlay to clear, and the workaround is the watcher/FireTuner session approach documented in the memory file.
- FRAMING.md says 'the loop hands off to civ7-systematic-workstream / civ7-open-spec-workstream for finalization.' In practice, closure is implemented as: (a) per-slice closure via Graphite branch + OpenSpec change (bun run openspec validate), (b) workstream-record.md with proof-gates table labeled honestly by class, (c) closure-checklist.md listing remaining human-visual follow-ups, (d) DEFERRALS.md entries for known-but-unscheduled items. The skill should describe this specific mechanics.
- FRAMING.md identifies 'resource-distribution-policy' as a behavioral example project. The full project (PROJECT-resource-distribution-policy.md) shows that all 5 implementation steps are done (metrics harness, spacing-preserving fallback, Civ-policy test harness, lane planners into recipe, lane-aware blue-noise selection). This project was ABSORBED into the placement-realignment workstream — steps 1-5 are recorded as done in S0/S1/S2/S3 of placement-realignment. The skill should treat this as a sub-example absorbed into the larger placement archetype, not a standalone example.
