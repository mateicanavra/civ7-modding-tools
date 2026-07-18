# Facet 1 — Earth-Science / Physics

> Open when a request is **behavioral** — "improve rivers", "the rain shadows look blocky", "make coastlines feel like real continental margins", "biomes are wrong for this latitude" — or any change judged by whether the map is *physically grounded*. This is the deepest, net-new facet: no other skill owns physical-realism reasoning end-to-end. It grounds the **behavioral arm** of the loop (`SKILL.md`, steps 3–5). Pair with `references/facet-verification.md` (how you *prove* a behavioral change held) and `references/pipeline-map.md` (where the stages/artifacts live).

---

## Facet charter

You are an Earth-science / physics agent obsessed with how the planet actually works — radiative balance and atmospheric cells, ocean gyres and Ekman transport, plate kinematics and continental margins, the stream-power law and the Whittaker climate envelope. Your job is **not** to reproduce Earth. It is to bring *physical realism in service of beautiful, civilization-appropriate maps* (FRAMING philosophy: the team serves the map, the map serves the player). At Civ tile scale, real processes get stylized — your distinctive contribution is to know **which simplification is load-bearing and which is cosmetic**, to ground every candidate model in a real physical process, and to **pre-declare a stylization ledger** wherever the tile scale forces a visible departure from Earth (see `assets/earthlike-expectation-ledger.md`).

Three disciplines define the facet:

1. **Read the model as physics.** Every domain op encodes a genuine Earth-science abstraction. Read `mods/mod-swooper-maps/src/domain/<domain>/ops/<op>/{contract.ts,rules,strategies}` as the *physical model*, not as code. Live source is the read-truth — never the `mapgen:*` cache skills (philosophy-only / outdated arch; they cite a stale `packages/mapgen-core/src/foundation/plates.ts` that does not exist).
2. **Hold the three buckets.** For any behavioral change, state explicitly what is **MODELED** (a real process is simulated), **APPROXIMATED** (a process is present but stylized/proxied), and **ABSENT** (a real process is not represented at all). The buckets are how you avoid "improving" a model in a direction the pipeline cannot currently express, and how you locate the right op to touch.
3. **Translate constants to regime families, not scalars.** Earth anchors (below) become tile-scale *regime families* (wet / arid / mountain / closed-basin / archipelago), never single global numbers. The subsystem contract is `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`; actual Standard regimes belong to the recipe's `metrics/studies/STUDIES.md` bank.

Background-only physics reading (philosophy, NOT canonical architecture): `docs/system/libs/mapgen/research/SPIKE-earth-physics-systems-modeling.md` and `SPIKE-synthesis-earth-physics-systems-swooper-engine.md`. Domain *philosophy* (not arch): `mapgen:{foundation,morphology,hydrology,ecology}` — label them "philosophy-only / outdated arch" whenever cited.

---

## How a behavioral change reaches the model (the strategy mechanism)

Behavioral realism is tuned or swapped at the **op / strategy** layer. An op (`defineOp`) declares a `strategies` record; the key `default` is mandatory; multi-strategy ops add named variants, each with its own config schema. The runtime envelope is `{ strategy: "<id>", config: {...} }` (a TypeBox discriminated union). You change behavior three ways, in increasing depth:

1. **Re-tune** — keep the strategy, change `config` values in the map config or stage `compile()`. Cheapest; most behavioral asks start here.
2. **Swap strategy** — select a different existing key (e.g. precipitation `refine` instead of `default`/vector; atmospheric circulation `latitude` instead of `default`/geostrophic-proxy). Selection happens in exactly one of three places — see below.
3. **Add a strategy** — author a new physical model as a new strategy key on the op, leaving the old one intact. The full add-a-strategy recipe (contract + `strategies/<id>.ts` + `createOp` binding + activation) is in `assets/recipe-scaffolds.md`. This is the preferred shape for a genuinely new physical model: it is reversible and A/B-testable against the incumbent.

**Where a strategy is selected** (the three control points — verified in `packages/mapgen-core/src/authoring/op/create.ts` runtime dispatch `runtimeStrategies[cfg.strategy].run(...)`):
- **(a)** a public stage's `compile()` hard-codes the literal, e.g. hydrology-climate-refine sets `computePrecipitation: { strategy: "refine", config: ... }`;
- **(b)** a step contract's `StepOpUse.defaultStrategy` changes the schema default (what you get when the envelope is omitted), e.g. `climateRefine.contract.ts` declares `defaultStrategy: "refine"`;
- **(c)** the op envelope authored directly in an internal (non-public) stage's step config in the map `.config.json`.

For a public stage with `compile()`, the config JSON never carries a `strategy` field — `compile()` injects it. Only internal stages let an author set `strategy` directly. **Always confirm which control point governs the op you intend to change before editing** — editing config that `compile()` overwrites is a classic dead-edit.

---

## FOUNDATION — mantle dynamics & plate tectonics

`src/domain/foundation/ops/*` — 17 ops. The deep "why" beneath every landform. Reads nothing upstream; publishes `artifact:foundation.{mesh,crust,plateGraph,tectonicHistory,...}` that morphology consumes.

The physical chain: a **mesh** (flat/periodic, not a sphere) → **mantle potential** (`compute-mantle-potential`: Gaussian-plume up/down-welling sources, Poisson-disk placed) → **mantle forcing** (`compute-mantle-forcing`: gradient of the potential → a velocity field) → **crust** + **crust-evolution** (oceanic vs continental lithosphere, aging) → **plate graph** (`compute-plate-graph`) → **plate motion** (`compute-plate-motion`: a rigid-body solver fitting per-plate translation + 2-D rotation `plateOmega` by least-squares to the mantle velocity field) → **tectonic segments** (`compute-tectonic-segments`: boundary regime per segment `0=none, 1=convergent, 2=divergent, 3=transform` from relative normal/tangential velocities, with subduction `polarity -1/+1/0` — oceanic subducts under continental) → **segment/hotspot events** → an **era loop** (`compute-era-plate-membership`, `compute-era-tectonic-fields`) advancing membership over time → **tracer advection** (`compute-tracer-advection`, Lagrangian) → **tectonic provenance** (`compute-tectonic-provenance`: per-tile inherited tectonic history — the bridge into morphology's belt drivers).

- **MODELED:** Gaussian-plume mantle convection sources; rigid-body plate kinematics (translation + angular velocity); boundary classification (convergent/divergent/transform) with subduction polarity by crust type; an era loop with provenance inheritance via Lagrangian tracers; the **passive vs active margin** distinction (a continental edge facing a divergent/quiet boundary vs a convergent/subducting one — the load-bearing input to shelf width and coastline character downstream).
- **APPROXIMATED:** Plate motion is fit to a static mantle field, not a self-consistent force balance; "events" stand in for discrete tectonic episodes; the mesh is flat/periodic, so polar convergence of meridians and true great-circle distances are absent.
- **ABSENT:** Viscous mantle–plate coupling; slab-pull / ridge-push as *separate* mechanisms; true spherical geometry; self-consistent plate creation/destruction (plates do not actually nucleate at ridges or vanish at trenches).

**Behavioral levers:** mantle source placement/strength → number, size, and arrangement of continents and the location of orogenic belts. Provenance → where morphology can grow mountains/rifts/volcanoes. A "more Pangaea-like" or "more fragmented" world is a foundation-mantle ask, not a morphology ask. Foundation ops are **single-strategy (`default` only)** today — a new tectonic model is an *add-a-strategy* on the relevant op (e.g. an alternative mantle-potential or plate-motion strategy), or new config on the existing one.

---

## MORPHOLOGY — landforms & erosion

`src/domain/morphology/ops/*` — 15 ops. Turns tectonic provenance into terrain. Publishes the canonical terrain truth `artifact:morphology.topography` (elevation + seaLevel + landMask + bathymetry), plus `.routing`, `.coastlineMetrics` (coastalLand, coastalWater, **shelfMask**, distanceToCoast), `.mountains`, `.volcanoes`, `.beltDrivers`, `.landmasses`.

The physical chain: **belt drivers** (`compute-belt-drivers`: maps `FoundationTectonicProvenanceTiles` → mountain / rift / volcano *belt seeds* with uplift intensity, width, decay sigma — config-light, "derived fields are physics outputs") → **base topography** (`compute-base-topography`) + substrate → **geomorphic cycle** (`compute-geomorphic-cycle`: the erosion engine, below) → **sea level** (`compute-sea-level`) + **shelf mask** (`compute-shelf-mask`) defining ocean/coastal geometry → **coastline metrics** (`compute-coastline-metrics`) → discrete landform planners (`plan-foothills`, `plan-ridges`, `plan-rough-lands`, `plan-volcanoes`, `plan-island-chains`).

**The erosion model (`compute-geomorphic-cycle/rules/index.ts`) is a Stream Power Incision Model.** Verified in source: per land tile, `streamPower = clamp(discharge · slope, 0, 1)`; `erosion = erosionRate · erodibility[i] · streamPower`; plus Laplacian **hillslope diffusion** (`diffusionDelta = (neighborAvg − elev) · diffusionRate`) and **sediment deposition** routed downslope (`settles = baseSediment · depositionRate · (1 − streamPower)`). All three rates carry an `ageScale` for **young / mature / old** world-age scaling. This is the SPIM family `E = K·A^m·S^n` in discharge·slope form (the discharge term is the drainage-area proxy `A^m`; slope is `S^n` with the exponents folded into the clamped product).

- **MODELED:** Stream-power fluvial incision; hillslope diffusion; sediment transport/deposition with conservation; world-age maturity; tectonic-belt-driven uplift; shelf-mask-based continental-shelf geometry; coastline metrics (distance-to-coast, coastal land/water).
- **APPROXIMATED:** Erosion runs a fixed number of cycles (not to steady state); slope and discharge are hex-graph proxies; sea level is a global scalar threshold; the SPIM exponents are baked into the clamped `discharge·slope` product rather than exposed as free `m`/`n`.
- **ABSENT:** Glacial (U-valley) erosion; isostatic rebound; lithospheric flexure; aeolian (wind) erosion; chemical/karst weathering.

**Behavioral levers:** `erodibilityK`, erosion/diffusion/deposition rates, and world-age `ageScale` tune how sharp vs worn the terrain reads. Shelf-mask + sea-level config govern how broad and shallow the **continental shelves** are — the physical substrate for the coast-projection work (see worked example below and `references/worked-examples.md`). Coast character that should differ between **passive and active margins** is a foundation-provenance → morphology-shelf chain, not a single coast op.

---

## HYDROLOGY — the coupled climate–water–ocean system (deepest domain)

`src/domain/hydrology/ops/*` — 19 ops. The longest physical chain and the most multi-strategy ops — most behavioral climate/river asks land here. The recipe runs it as **hydrology-climate-baseline → hydrology-hydrography → hydrology-climate-refine** (climate is computed, drainage/rivers solved, then climate refined). Publishes routing/refinement vintage `artifact:hydrology.baselineClimateField`, final consumer vintage `artifact:climateField`, and `artifact:hydrology.{climateSeasonality,climateIndices,cryosphere,hydrography,lakePlan,riverNetworkMetrics,climateDiagnostics}`.

The physical chain (op by op):

1. **Radiative forcing** (`compute-radiative-forcing`): insolation as a power-law of `|latitude|` — the energy input.
2. **Thermal state** (`compute-thermal-state`): `surfaceTemperatureC ≈ base + insolation·scale + elevation·lapse − land-cooling` — outputs the `surfaceTemperatureC` field every downstream temperature consumer reads.
3. **Ocean geometry** (`compute-ocean-geometry`) → **ocean surface currents** (`compute-ocean-surface-currents`): wind stress + hemisphere-aware **Ekman transport** + basin **gyres** + coastal boundary currents + a divergence-free **Helmholtz projection**. Strategies: **`default` = wind-gyre-projection (earthlike)**, **`latitude` = legacy zonal model** (the `latitude` key binds the older `...DefaultStrategySchema`; the file name does not match the key — the key is what dispatches).
4. **Ocean thermal state** (`compute-ocean-thermal-state`): SST advected/diffused along currents; sea-ice.
5. **Evaporation sources** (`compute-evaporation-sources`): where moisture enters the atmosphere.
6. **Atmospheric circulation** (`compute-atmospheric-circulation`): `computeWindsEarthlike` builds a **3-cell Hadley / Ferrel / Polar** zonal scaffold + a **geostrophic-proxy** wind from `∇pressure` (verified: `wind = (zonalBase, meridionalBase) + geo·geostrophicStrength`) + optional seasonal modulation. Strategies: **`default` = geostrophic-proxy**, **`latitude` = legacy latitude-band model**.
7. **Moisture transport** (`transport-moisture`): advects humidity along the wind field. Strategies: **`default` = vector-advection** (follows the full U/V wind vector), **`cardinal` = legacy cardinal-only** walk.
8. **Precipitation** (`compute-precipitation`): `humidity^exp · scale + coastal gradient − orographic rain shadow` (rain shadow via a **cardinal upwind-barrier walk**). Strategies: **`default` = vector** (consumes full wind U/V for uplift + convergence proxies), **`basic` = baseline**, **`refine` = adds river-corridor + low-basin bonuses** (the production climate-refine pass uses `refine`).
9. **Cryosphere** (`compute-cryosphere-state`): outputs `freezeIndex` (ramped between `freezeIndexStartC`/`freezeIndexFullC`) and permafrost thresholds from `surfaceTemperatureC`.
10. **Albedo feedback** (`apply-albedo-feedback`): iterative ice/temperature feedback (fixed-iteration, not to convergence).
11. **Land water budget** (`compute-land-water-budget`): simplified **PET** proxy and `aridityIndex` = PET/(PET + precip + 1)-style ratio (advisory).
12. **Climate diagnostics** (`compute-climate-diagnostics`): `rainShadowIndex`, `continentalityIndex` (distance-to-water), `convergenceIndex` — the per-tile climate *index* fields.
13. **Hydrography** (`compute-drainage-routing` → `accumulate-discharge` → `project-river-network` → `compute-river-network-metrics` → `plan-lakes` → `select-navigable-river-terrain`): drainage solved on the terrain, discharge accumulated, a river network projected, lakes planned, and the Civ-visible navigable subset selected. **`riverClass` (u8: 0=none, 1=minor, ≥2=major/projectable)** is the gate — only `≥2` is eligible to become `TERRAIN_NAVIGABLE_RIVER` at projection (`select-navigable-river-terrain`).

**The climate index outputs you reason against** (where each lives — do not re-derive locally): `surfaceTemperatureC` ← thermal-state; `pet` + `aridityIndex` ← land-water-budget; `freezeIndex` ← cryosphere; `rainShadowIndex` / `continentalityIndex` / `convergenceIndex` ← climate-diagnostics; `effectiveMoisture` + `aridityIndex` are **consumed** by ecology `classify-biomes` as advisory indices (its contract explicitly says "do not re-derive from rainfall/humidity locally").

- **MODELED:** Latitudinal insolation; lapse-rate + land-cooling temperature; 3-cell circulation scaffold; geostrophic wind from pressure gradient; wind-driven ocean gyres with Ekman transport and a divergence-free current field; SST advection + sea-ice; vector moisture advection; humidity-driven precipitation with a coastal gradient; orographic rain shadow; cryosphere/permafrost; PET-based aridity; river-corridor/low-basin precip bonuses (`refine`).
- **APPROXIMATED:** Winds are a geostrophic *proxy* (no momentum equation); rain shadow is a **cardinal upwind barrier walk** (blocky, direction-quantized); albedo feedback is a **fixed-iteration** pass, not iterated to convergence; PET is a temperature-driven proxy, not Penman-Monteith; "seasonality" is a modulation, not a true seasonal cycle.
- **ABSENT:** Navier–Stokes atmosphere/ocean; ITCZ seasonal migration; monsoon mechanism; thermohaline / deep-overturning circulation; ENSO; greenhouse forcing beyond a fixed bias; **moisture depletion en route** (humidity is advected but not drawn down by the precipitation it produces); SST→atmosphere back-coupling.

**Behavioral levers:** this is where most river/climate asks resolve. "Rivers too sparse/dense" → discharge accumulation + `riverClass` thresholds in hydrography + `refine` river-corridor bonuses. "Rain shadows blocky/wrong direction" → the cardinal upwind-barrier walk in `compute-precipitation` (this is the flagged orographic gap, below — the right shape is *add a vector-orographic strategy*, not re-tune the cardinal one). "Deserts in the wrong place" → atmospheric-circulation + moisture-transport strategy choice + aridity. "Continental interiors not dry/cold enough" → `continentalityIndex` config + land-cooling.

---

## ECOLOGY — biomes, pedology, features

`src/domain/ecology/ops/*` — 33 ops (the most granular domain). Reads hydrology climate indices + morphology relief + its own pedology; publishes `artifact:ecology.{biomeClassification,soils,resourceBasins,scoreLayers,plotEffectPlan}` and `featureIntents.{vegetation,wetlands,floodplains,reefs,ice}`.

- **Biome classification** (`classify-biomes`): a **Whittaker / Holdridge** envelope — a temperature zone {polar, cold, temperate, tropical} × moisture zone {arid, semiArid, subhumid, humid, perhumid} lookup, with an **aridity-index downshift** (`aridityShiftForIndex`) and a soft tropical/temperate transition band. It consumes hydrology's `effectiveMoisture` + `aridityIndex` as advisory inputs (does not recompute them).
- **Pedology** (`ecology/pedology/classify` → `ecology/pedology/aggregate`; dirs: `pedology-classify/`, `pedology-aggregate/`): soil fertility from rainfall/humidity/relief/sediment-depth/bedrock-age. **Strategies: `default`, `coastal-shelf`, `orogeny-boosted`** — the multi-strategy point in ecology. `orogeny-boosted` weights tectonic relief into fertility; `coastal-shelf` weights shelf proximity. Soils feed `resource-plan-basins` (the soils → resource-basins bridge).
- **Feature planners** score candidates against climate/hydrology fields: vegetation (forest, rainforest, taiga, savanna-woodland, sagebrush-steppe), wetlands (marsh, mangrove, oasis, tundra-bog, watering-hole), reefs (reef, atoll, cold-reef, lotus), ice (`features-plan-ice`, strategies **`default`, `continentality`**), and floodplains. `features-apply` materializes intents.

- **MODELED:** Whittaker/Holdridge temperature × moisture biome envelope; aridity downshift; soft biome transition bands; multi-factor soil fertility; climate-scored vegetation/wetland/reef/ice/floodplain feature placement; soils → resource-basin derivation.
- **APPROXIMATED:** Biomes are a coarse 4×5 lookup (not a continuous climate space); features are scored heuristics, not ecological succession; pedology proxies bedrock age rather than tracking lithology through tectonic history.
- **ABSENT:** Altitudinal / montane biome zonation (no temperature-by-elevation biome banding); permafrost → hydrology feedback; soil carbon/nutrient cycles; ecological succession; fire–climate coupling; crust-type lithological inheritance in pedology (the `orogeny-boosted` strategy is the *closest existing* hook).

**Behavioral levers:** biome temperature/moisture thresholds + aridity shift in `classify-biomes` config; pedology strategy choice (`orogeny-boosted` / `coastal-shelf`) for "soils feel wrong near mountains/coasts"; feature-planner scoring for "too much/little forest, reefs in the wrong water". A "montane forests above a treeline" ask is **ABSENT** — it needs new biome zonation, not a re-tune (state this in the stylization ledger rather than forcing it into the 4×5 lookup).

---

## Earth anchors & the eight flagged realism gaps

**Earth anchors** (translate to *regime families*, never single global scalars): HydroRIVERS (8.5M reaches / 35.9M km), GRWL (2.1M km of wide rivers), HydroLAKES (~1.8% of land is lake), non-perennial river share **51–60%**, endorheic (closed) basins ~**1/5** of land; **passive vs active continental-margin** shelf-width contrast (passive margins → broad shallow shelves; active/subducting margins → narrow steep ones). Encode admitted expectations as `MetricTarget`s, bind them in named Standard `*.study.ts` modules, document the protocol beside the module, and run `nx run mod-swooper-maps:metrics:report` (see `references/facet-verification.md`).

**The eight realism gaps Facet 1 must know** (evidence-backed; each is a candidate behavioral workstream and a known ABSENT/APPROXIMATED bucket):

1. **Orographic uplift enhancement absent** — only cardinal rain-shadow *subtraction* exists; windward uplift precipitation is not added, and the rain shadow is direction-quantized. (`docs/projects/mapgen-orographic-precipitation/spike-feasibility.md`.) Fix shape: add a vector-orographic strategy to `compute-precipitation`.
2. **Moisture not depleted by precipitation en route** — humidity advects without drawdown, so leeward drying is understated.
3. **No thermohaline / deep-water ocean circulation** — currents are wind-driven surface only.
4. **No glacial erosion** — morphology has no U-valley / cirque carving.
5. **No explicit ITCZ migration or monsoon mechanism** — tropical rainfall is static, not seasonally migrating.
6. **Albedo feedback is a fixed-iteration pass** — ice-albedo does not iterate to a self-consistent equilibrium.
7. **Pedology ignores crust / tectonic lithology** — soil fertility proxies bedrock age, not actual crust type from foundation provenance.
8. **No montane / altitudinal biome zonation** — biomes are temperature × moisture only; elevation does not band vegetation.

For any of these, the move is the same: confirm the bucket from live source, decide re-tune vs swap vs add-a-strategy, and **pre-declare the regime-family expectations** before touching code.

---

## Coupling to the other arm (do not reason in isolation)

A behavioral change almost always has a structural locus the technical arm must find — the arms are coupled (FRAMING hard core 4). Two worked illustrations (full detail in `references/worked-examples.md`):

- **Coasts-by-erosion / coast projection** (behavioral) chose a margin-aware shelf model grounded in **passive-vs-active-margin physics** — but the load-bearing fix was *structural*: adapter terrain maintenance in `map-morphology`/`map-rivers`/`placement` was silently demoting coast→ocean, so the model had to be re-asserted at each adapter boundary (`artifact:map.morphology.coastClassification.waterClass` as authoritative). Good physics, defeated downstream until the structural locus was found.
- **Orographic precipitation** is simultaneously a behavioral deficiency (blocky, directionally wrong rain shadows) and a structural change (it touches the `compute-precipitation` contract + strategies). You cannot reason about the fix from physics alone.

Always: ground the model in a real process → locate the op (and whether `compile()`/`defaultStrategy`/config governs it) → decide re-tune / swap / add-strategy → pre-declare regime-family expectations → hand the structural shape to the technical arm → prove behaviorally **and** in-game (`references/facet-verification.md`; in-game is the closure test).

---

## Quick reference — multi-strategy physics ops (verified keys)

> Structural detail (selection control points, runtime dispatch) lives in `references/pipeline-map.md`; this table adds the physics gloss.

| Op | Strategy keys (live) | What the non-default model does |
|---|---|---|
| `hydrology/compute-atmospheric-circulation` | `default` (geostrophic-proxy), `latitude` | `latitude` = legacy latitude-band winds (no ∇pressure geostrophic term) |
| `hydrology/compute-ocean-surface-currents` | `default` (wind-gyre-projection / earthlike), `latitude` | `latitude` = legacy zonal current model |
| `hydrology/transport-moisture` | `default` (vector-advection), `cardinal` | `cardinal` = legacy cardinal-only humidity walk |
| `hydrology/compute-precipitation` | `default` (vector), `basic` (baseline), `refine` | `refine` = baseline + river-corridor + low-basin bonuses (production climate-refine) |
| `ecology/pedology/classify` | `default`, `coastal-shelf`, `orogeny-boosted` | weight shelf proximity / tectonic relief into soil fertility |
| `ecology/features-plan-ice` | `default`, `continentality` | `continentality` = continental-interior-aware ice scoring |

All **foundation** ops and **most morphology** ops are single-strategy (`default` only): a new physical model there is an *add-a-strategy* (`assets/recipe-scaffolds.md`) or new config, never a swap. Every key above is the **runtime dispatch key**; strategy file names do not always match keys (e.g. atmospheric `default` is implemented in `geostrophic-proxy.ts`) — the key is authoritative.
