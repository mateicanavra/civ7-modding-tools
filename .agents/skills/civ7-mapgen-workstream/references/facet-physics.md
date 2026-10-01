# Physics And Earth-Science Facet

Open this reference for behavioral requests such as realistic coasts, mountain
belts, rainfall, rivers, lakes, biomes, soils, or resource habitats.

The goal is not to reproduce Earth at full resolution. The goal is a coherent,
legible, strategically useful Civ7 world whose simplifications are explicit.

## Working Method

For every proposed change:

1. **Name the observed failure.** Use an artifact, metric, diagnostic layer, or
   correlated live readback rather than a screenshot alone.
2. **Name the physical process.** Explain the real causal mechanism the model
   approximates.
3. **Classify the current model.** Record what is `modeled`, `approximated`, and
   `absent` after reading the live operation/strategy source under
   `plugins/mod/map/swooper-physics/src/domain`.
4. **Locate the control point.** Decide whether to re-tune configuration,
   select an existing strategy, add a same-transition strategy, or add a new
   operation.
5. **Declare regimes and guards.** Fill the expectation ledger before editing.
   Use families such as wet/arid, active/passive margin, high/low relief,
   closed/open basin, tropical/polar, or continental/maritime.
6. **Check Civ7 legality and playability.** A physical target must remain
   placeable and strategically useful.
7. **Verify causal and projected outcomes separately.** Metrics and artifacts
   prove the portable model; Civ7 realization/readback proves only the exact
   live projection exercised.

## Model Layers

### Foundation: Tectonic Prior

Foundation should explain where continents, ocean basins, plate boundaries,
uplift, rifts, volcanoes, and inherited tectonic signals come from.

Useful physical questions:

- Does the model distinguish convergent, divergent, transform, and quiet
  boundaries?
- Does crust type influence subduction polarity or margin character?
- Does plate motion create coherent provenance that downstream terrain can
  consume?
- Are continent scale and fragmentation consequences of the forcing model, or
  post-hoc morphology tuning?

Typical approximations include planar/wrapped geometry, fitted plate motion,
discrete eras, and proxy forcing rather than a coupled mantle/plate solver.
Typical absent mechanisms include spherical geometry, explicit slab pull,
ridge push, and self-consistent plate creation/destruction.

Route continent topology and belt placement changes here. Do not use coastal
or biome parameters to compensate for a faulty tectonic prior.

### Morphology: Terrain Response

Morphology should turn tectonic provenance into topography, coastlines,
routing, erosion, deposition, islands, landforms, and shelf geometry.

The central checks are:

- uplift and belt width follow admitted provenance;
- erosion responds to slope, discharge, substrate/erodibility, and maturity;
- deposition and smoothing do not erase causal relief;
- sea level and land/water reconciliation stay coherent;
- shelf geometry distinguishes margin regimes instead of using one distance
  band everywhere;
- downstream projection does not overwrite the authoritative surface.

A stream-power-style incision model plus hillslope diffusion and routed
deposition is a useful tile-scale abstraction. Fixed cycles, graph-based slope,
and global sea level are approximations. Glacial erosion, isostatic rebound,
aeolian transport, flexure, and karst may be absent; confirm before promising
them.

### Hydrology And Climate

Hydrology is a coupled chain, not an isolated river-density knob:

```text
radiative forcing
  -> temperature and pressure
  -> atmospheric and ocean circulation
  -> evaporation and moisture transport
  -> precipitation and orographic response
  -> cryosphere/albedo and water budget
  -> drainage, discharge, lakes, and river hierarchy
  -> climate refinement and diagnostics
```

Investigate the whole causal path before changing a downstream threshold.

Key physical checks:

- latitude and elevation affect energy/temperature coherently;
- pressure and circulation create meaningful transport directions;
- ocean currents and continentality influence coastal/interior regimes;
- moisture is transported, precipitated, and, where modeled, depleted;
- windward enhancement and leeward drying follow wind/topography rather than
  grid direction alone;
- drainage is depression-aware and discharge is conserved;
- lake/closed-basin behavior and river hierarchy use terminal routing evidence;
- aridity and freeze indices are owned once and consumed downstream.

Common approximations include a circulation scaffold, geostrophic proxies,
fixed albedo passes, simplified potential evapotranspiration, and graph-based
orographic sampling. Candidate gaps to check in live source include seasonal
ITCZ/monsoons, deep-ocean circulation, moisture drawdown, glacial hydrology,
and fully coupled atmosphere-ocean feedback.

### Ecology And Pedology

Ecology should consume admitted climate, hydrology, relief, and substrate
evidence rather than recomputing them privately.

Check:

- biome classification follows temperature/moisture/aridity regimes;
- soils reflect relief, sediment, moisture, substrate, and any admitted
  tectonic history;
- features are planned from habitat evidence before materialization;
- occupancy and mutual-exclusion policies are explicit;
- transitions are soft enough to avoid blocky categorical bands;
- Civ7 feature/terrain legality is applied at the policy/projection boundary.

Coarse climate envelopes and score-based habitats are appropriate tile-scale
models. Altitudinal zonation, succession, nutrient cycles, fire, and lithologic
soil inheritance may be absent; treat those as model additions, not tuning.

### Placement And Resources

Placement is where physical plausibility, Civ7 legality, fairness, and gameplay
intent meet.

Use a staged reasoning shape:

```text
admitted physical habitat and map policy
  -> demand/intent
  -> candidate selection
  -> fairness and spacing reconciliation
  -> engine materialization
  -> exact live readback
```

Do not let materialization become the planning authority. Preserve explainable
evidence for why a start, wonder, discovery, or resource was selected or
rejected.

## Regime Families, Not One Earth Number

Literature values can orient a study, but they are research inputs, not product
policy. Translate them into named tile-scale regimes and cite the source in the
study sheet. Useful families include:

- active versus passive continental margins;
- perennial versus intermittent drainage;
- open versus endorheic basins;
- maritime versus continental climates;
- tropical, temperate, polar, and montane envelopes;
- wetland, reef, forest, steppe, desert, and ice habitat regimes;
- core versus frontier settlement regions.

Measure distributions, correlations, and contrasts. A global average can hide
that every local regime is wrong.

## Choosing The Implementation Shape

| Need | Shape |
| --- | --- |
| Same mechanism, wrong strength | Re-tune admitted config |
| Existing same-transition model should be selectable | Choose existing strategy |
| New model with identical input/output transition | Add semantic strategy and A/B study |
| New evidence vintage or later causal transition | Add operation and artifact/step wiring |
| Host projection is overwriting correct truth | Repair projection/realization, not physics |
| Browser colors or geometry are wrong while values match | Repair web projection/UI |

Before adding a strategy, confirm the candidate truly satisfies the same
operation contract. Before adding an operation, confirm its result is causal
product truth rather than diagnostic evidence.

## Behavioral Review Checklist

- The physical mechanism and simplification are named.
- Modeled/approximated/absent claims were re-derived from current source.
- The change sits at the earliest truthful causal locus.
- Expectations and collateral guards were declared before tuning.
- Multiple stable seeds and relevant map-size/regime cohorts were measured.
- Civ7 legality and player value were checked independently of realism.
- Diagnostic, generated, installed, and live claims carry separate proof.
- Any unresolved projection or correlation link remains visible.
