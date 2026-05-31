# Morphology Terrain Authorship Handoff

Date: 2026-05-31

Audience: next ERA/DRA taking on systematic Civ7 morphology, terrain relief,
hill/flatland, volcano, cliff, and engine elevation control.

Status: scout packet and objective companion. This is not implementation proof,
runtime proof, or an OpenSpec closure record.

## How To Use This Packet

Use this as the reference beside the framed objective for the next workstream.
It preserves the reasoning, repo entrypoints, source starter set, and proof
gates from the morphology terrain scout. Start here, then re-verify branch
state, source files, stats, and runtime behavior before changing code.

The next workstream should invoke:

- `framing-design` for every objective and peer-agent prompt.
- `civ7-systematic-workstream` for the systematic extraction/research/strategy
  loop. If this skill is not visible in the checkout, integrate or restack the
  committed skill slice first: `codex/systematic-evidence-workstream-skill` at
  `146cf5dfe`.
- `civ7-open-spec-workstream` for every behavior-changing slice.
- `civ7-architecture-authority` and `civ7-product-authority` before accepting
  new public controls, truth artifacts, or gameplay-facing outcomes.
- `civ7-operational-debugging` for Studio, FireTuner, and runtime proof.
- Fresh peer agents only. Prompt them as peers with framed context, not as
  instruction dumps.

## Frame

This is not a tuning-only problem. The current symptom is "the map feels flat,"
but the underlying question is whether the repo has complete, architecture-owned
control over the Civ7 morphology domain.

### Hard Core

The correct solution must make terrain morphology a systematic, measured,
Earth-like, architecture-aligned domain:

- extract every canonical terrain/morphology surface;
- distinguish direct authorship from engine-owned readback;
- predeclare expected Earth-like ranges before tuning;
- design per-surface operations/contracts in the owning truth stage;
- keep projection stages projection-only;
- prove local stats and actual runtime logs;
- close OpenSpec/Graphite records accurately.

### Selected In Scope

- Civ7 terrain classes: mountain, hill, flat, coast, ocean, navigable river.
- Official terrain-linked features and natural wonders.
- Morphology truth artifacts and operations.
- Map projection and engine readback surfaces.
- Terrain mutation by hydrology lakes/rivers.
- Engine-only or engine-derived surfaces, especially elevation and cliffs.
- Swooper Earthlike flatness: hills and rough land are nearly absent away from
  mountain skirts, broad continental interiors read too flat, and mountains are
  still coupled to legacy-feeling config/noise.

### Explicitly Exterior

- Manual output control that bypasses Foundation/Morphology causes.
- Projection-stage truth planning.
- Cosmetic random hill fill without physical drivers.
- Claims that cliffs/elevation are controlled unless runtime readback proves
  it.
- Runtime restart proof that does not use the current canonical FireTuner
  socket/API path.

### Reframe Triggers

Reframe the objective if any of these are proven:

- Civ7 exposes a stable setter for cliffs or elevation that the scout missed.
- Official resources add a distinct rough terrain type beyond `TERRAIN_HILL`.
- Runtime logs prove hills are being planned correctly but erased downstream.
- Earth-like expected ranges conflict sharply with Civ7 gameplay constraints,
  requiring a product/gameplay conversion model rather than direct scaling.

## Scout Findings

### Civ7 Authorship Surface

Canonical terrain constants in this stack are:

| Terrain | Meaning | Directly writable? | Notes |
| --- | --- | --- | --- |
| `TERRAIN_MOUNTAIN` | impassable mountain | Yes | Written through `TerrainBuilder.setTerrainType`; volcano stamping also sets this. |
| `TERRAIN_HILL` | rough/hilly land | Yes | This is the closest Civ7 authorable equivalent to "rough land"; there is no separate `TERRAIN_ROUGH`. |
| `TERRAIN_FLAT` | flat land | Yes | Current coast projection stamps land as flat before later mountain/hill projection. |
| `TERRAIN_COAST` | shallow water/lake surface | Yes | Used by coasts and lake projection. |
| `TERRAIN_OCEAN` | deep water | Yes | Used by coasts. |
| `TERRAIN_NAVIGABLE_RIVER` | river terrain | Engine/projected | Used by river modeling path; downstream of elevation. |

Official and typed sources to inspect first:

- `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`
- `.civ7/outputs/resources/Base/modules/base-standard/maps/elevation-terrain-generator.js`
- `.civ7/outputs/resources/Base/modules/base-standard/maps/volcano-generator.js`
- `.civ7/outputs/resources/Base/modules/base-standard/maps/map-globals.js`
- `.civ7/outputs/resources/Base/modules/base-standard/maps/map-utilities.js`
- `packages/civ7-types/index.d.ts`
- `packages/mapgen-core/src/core/terrain-constants.ts`

Important API boundary from the scout: `GameplayMap` reads terrain, features,
water, mountain state, elevation, and cliff crossings. `TerrainBuilder` writes
terrain, biome, features, landmass ids, rainfall, and tags. The scout did not
find `setElevation` or `setCliff`; cliffs are read through
`GameplayMap.isCliffCrossing` and appear to be engine-derived after terrain and
elevation construction.

### Morphology Architecture

Canonical docs and policy entrypoints:

- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/ADR.md` for the accepted four-stage Morphology split.

Current standard-stage posture:

1. `morphology-coasts`
2. `morphology-routing`
3. `morphology-erosion`
4. `morphology-features`
5. downstream `map-morphology`, `map-elevation`, `map-rivers`, `map-ecology`,
   and placement.

Current Morphology ops export a rich set of truth operations, including
topography, belt drivers, coastline metrics, flow routing, geomorphic cycle,
landmask, landmasses, shelf mask, sea level, substrate, island chains,
foothills, ridges, and volcanoes.

Current artifact schemas include:

- `artifact:morphology.topography`
- `artifact:morphology.routing`
- `artifact:morphology.substrate`
- `artifact:morphology.coastlineMetrics`
- `artifact:morphology.landmasses`
- `artifact:morphology.volcanoes`
- `artifact:morphology.mountains`
- `artifact:morphology.beltDrivers`

The domain reference overview appears slightly stale against source reality:
`morphology.mountains` and `morphology.beltDrivers` are source artifacts and
should be treated as part of the corpus even if a doc list omits them.

### Projection And Engine Ownership

`map-morphology` is a projection stage, not a planning stage:

- `plotCoasts` stamps flat land, coast, and ocean from Morphology truth.
- `plotContinents` validates/fixes terrain and stamps continents.
- `plotMountains` reads `artifact:morphology.mountains` and stamps mountains
  and hills.
- `plotVolcanoes` reads the volcano plan and stamps mountain plus
  `FEATURE_VOLCANO`.

`map-elevation` then calls engine elevation construction and publishes readback.
Its comments explicitly warn that terrain restoration cannot repair engine-owned
cliff/elevation state. That makes cliffs an observed/proved surface, not a
Morphology truth output unless a future engine API changes the contract.

Hydrology also mutates terrain:

- lake projection stamps lake tiles as `TERRAIN_COAST`;
- river projection/modeling uses `TERRAIN_NAVIGABLE_RIVER` after elevation.

Any terrain proof must therefore compare planned Morphology truth, post
`map-morphology` projection, post hydrology terrain mutation, post
`buildElevation()` readback, and final runtime logs.

## Current Failure Shape

The scout found a likely root cause for the "flat middle" complaint:

- mountains have improved compared with earlier near-zero samples, but are still
  concentrated by ridge/volcano logic;
- hills are effectively missing;
- the current foothill planner requires adjacency to ridge skirts or strong
  near-boundary deformation;
- there is no separate operation for intra-plate hills, rolling uplands, old
  eroded highlands, craton relief, plateaus, basin rims, or escarpments.

Representative local scout stats on Swooper Earthlike:

| Sample | Mountain share of pre-lake land | Hill share of pre-lake land | Flat share of pre-lake land |
| --- | ---: | ---: | ---: |
| Seed `1018`, `106x66` | `6.53%` final | `0.037%` final | `88.8%` final |
| 8-seed `80x50` range | `1.97%` to `8.33%` final | `0%` to `2.19%` final | about `85%` to `94%` final |

Interpretation: do not spend the next workstream only lowering thresholds.
There is likely a missing Morphology operation/contract for non-foothill
hill/rough terrain, plus stale public config and projection/truth boundary noise
that can hide the issue.

## Physical Source Starter Set

Use these as starting points, not final expected ranges. The next workstream
must research and predeclare Civ7-scaled expected bands before implementation.

- Mountain area and definitions: Scientific Reports notes that global mountain
  area varies materially by definition, roughly from low-teens to about a third
  of land area, and emphasizes local relief and steep slopes as core properties:
  <https://www.nature.com/articles/s41598-021-84784-8>
- Active volcano scale: USGS reports about `1,350` potentially active volcanoes
  worldwide, excluding continuous ocean-floor spreading-center belts, with about
  `500` historical eruptions:
  <https://www.usgs.gov/faqs/how-many-active-volcanoes-are-there-earth>
- Elevation/topography data baseline: USGS SRTM coverage/data pages are a good
  starting point for global elevation and relief distributions:
  <https://www.usgs.gov/centers/eros/science/usgs-eros-archive-digital-elevation-srtm-coverage-maps>
- Land surface forms: USGS Hammond/MoRAP landform classes split flat plains,
  smooth/irregular plains, low hills, hills, breaks/foothills, low mountains,
  and high mountains/deep canyons using slope and local-relief bands:
  <https://www.usgs.gov/maps/terrestrial-ecosystems-land-surface-forms-conterminous-united-states>

The next team should also look for global sources for:

- share of plains, plateaus, hills, mountains, basins, and escarpments;
- global slope/local relief distributions;
- mountain belt width vs broader mountain-system footprint;
- volcanic arc and hotspot distribution relative to tectonic regimes;
- plateau/shield/craton upland morphology;
- game-scale conversion from real landform area to Civ7 terrain classes.

## Objective To Pass Forward

Use this as the starting framed objective, then let the next ERA refine it after
re-checking branch state and current code:

```text
Create a systematic Civ7 morphology/terrain authorship workstream using
`civ7-systematic-workstream`, `framing-design`,
`civ7-open-spec-workstream`, architecture/product authority, operational
debugging, and framed peer-agent review. The future state is full,
evidence-scoped control over Earthlike terrain morphology: terrain classes,
relief structure, volcanoes, engine elevation/cliff readback, and downstream
feature/resource implications are all explicitly owned, measured, and proved.

First isolate repo/Graphite/worktree state and diagnose the current failure
before changing code. Treat the seed case as Swooper Earthlike flatness:
mountains may now exist, but hills/rough land remain near-zero and broad
continental interiors still read too flat. Use history/hotspot review, current
stats, logs, and Narsil where available to separate root cause from config noise.

Extract the complete canonical morphology corpus: Civ7 terrain types;
terrain-linked official features/natural wonders; engine APIs and readback
surfaces; Morphology truth artifacts; map projection stages; hydrology lake/river
terrain mutation; and engine-only surfaces such as cliffs/elevation after
`buildElevation()`. Record which surfaces are directly authorable, indirectly
influenced, engine-owned/readback-only, or out of scope.

Predeclare Earthlike expected ranges before tuning. Research physical/ecological
landform expectations for mountains, hills/foothills, rolling uplands,
plateaus/shields, plains, coasts/shelves, lakes/rivers, volcanoes,
cliffs/local relief, and flat-lowland basins. Translate those into Civ7-scaled
expected bands: impassable ridge mountains must be narrower than real
mountain-system area; hills/rough terrain must cover the broader
eroded/uplifted landform footprint; cliffs must be proven by engine readback
rather than claimed as Morphology truth.

Design architecture-aligned operations and slices. Keep one causal strategy
rooted in Foundation tectonic history/eras, crust/provenance, belt drivers,
erosion, substrate, and hydrology. Remove manual output-control cruft, stale
legacy knobs, noise-only fill, and projection-stage truth planning. Add or
reshape dedicated Morphology ops where needed, especially for non-foothill
hills/rolling uplands/plateaus/escarpments, while preserving map stages as
projection/readback only.

Implement as OpenSpec/Graphite slices with explicit write sets, review gates,
and downstream realignment. Extend stats to compare planned and final terrain
shares, hill/mountain component structure, local relief, slope/neighbor relief,
shore-distance elevation profiles, engine elevation/cliff readback, volcano
distribution by tectonic regime, and flatland/plains budgets across stable seed
matrices.

Prove locally with tests and stats, then prove runtime through the current
canonical Studio/FireTuner restart path, recording exact branch, commit, restart
command/API path, request id, log bounds, parsed terrain/elevation/cliff/readback
payloads, and remaining proof boundaries. Close only with reviewed specs,
repaired P1/P2 findings, accurate task/phase records, Graphite commit/submit
boundaries separated, and a clean worktree.
```

## Recommended Workstream Shape

### Phase 0: State And Stack Isolation

- Create a new worktree and Graphite stack above the correct base.
- Verify whether `codex/firetuner-socket-studio-restart` or its successor has
  advanced. Scout boundary observed `bb39b3cf7 fix: submit Studio restarts
  through FireTuner socket`.
- Integrate/restack restart work before any final runtime proof.
- Record current branch, stack, status, and uncommitted/unpushed state.

### Phase 1: Root Cause Diagnosis

- Review recent file/commit hotspots for Morphology, `map-morphology`,
  world-balance stats, config authority, and terrain projection.
- Reproduce current local terrain stats across a stable seed matrix.
- Parse runtime logs if available, but treat restart success as pipeline proof,
  not balance proof.
- Use Narsil for targeted symbol and reference queries, but remember it indexes
  the primary worktree branch. During the scout, broad hybrid queries timed out;
  fall back to `rg` and targeted code-intel calls.

### Phase 2: Canonical Corpus Extraction

- Extract all official terrain, biome, feature, natural wonder, and engine API
  constraints.
- Extract all Morphology truth artifacts, ops, stage schemas, public config
  keys, and map projection steps.
- Produce a direct/indirect/engine-owned/out-of-scope control matrix.

### Phase 3: Earth-like Expected Ranges

- Research each landform group separately.
- Predeclare expected bands before code changes.
- Convert physical ranges to Civ7 semantics: impassable mountains are narrower
  than real mountain regions; hills/rough terrain carry broader relief; flatland
  is not a synonym for all non-mountain interior land.

### Phase 4: Architecture-Aligned Strategy

- Design dedicated operations/contracts per landform group.
- Favor Foundation tectonic eras, crust/provenance, belt drivers, erosion,
  substrate, routing, and hydrology as causal inputs.
- Remove stale knobs and manual outcome controls after proof they are not needed.
- Keep projection stages from accepting truth-planning config.

### Phase 5: Implementation Slices

Likely OpenSpec/Graphite slices:

1. Terrain/morphology corpus and control matrix.
2. Expected-range artifact and stats gate expansion.
3. Hills/rough-land operation contract.
4. Volcano/mountain/cliff/elevation readback proof.
5. Config cleanup and public surface simplification.
6. Runtime proof slice through FireTuner socket/API restart.

Adjust this split after corpus extraction; do not let the phase list outrun the
evidence.

### Phase 6: Proof And Closure

- Run focused unit tests for new operations.
- Run multi-seed world-balance terrain stats.
- Run map projection/readback tests for terrain drift.
- Run Studio/FireTuner restart with `AGENT=<agent-name>` in bridge commands.
- Record exact branch, commit, command/API path, request id, and log bounds.
- Have fresh agents review specs, implementation, stats, runtime proof, and
  closure records before claiming completion.

## Proof Gates The Next ERA Must Not Skip

- Planned and final terrain shares must both be measured.
- Hills must have their own gate; they cannot be inferred from mountains.
- Engine readback must prove cliffs/elevation; source-level intent is not
  enough.
- Volcanoes must be separated from mountain belts so they cannot mask weak
  ridge planning.
- Hydrology terrain mutation must be included in final terrain accounting.
- Expected bands must be declared before tuning.
- OpenSpec task records must distinguish local commit-clean state from Graphite
  submit/PR delivery.
- Final runtime proof must use the current canonical FireTuner socket/API path,
  not stale restart commands or manual bypasses.
