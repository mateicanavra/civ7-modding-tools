---
title: "SPIKE: Wind + Currents realism plan (and downstream wiring)"
date: "2026-02-03"
owner: "agent-codex"
scope: "hydrology circulation + consumers (mapgen-studio visibility)"
status: "spike"
related:
  - "docs/projects/mapgen-studio/resources/SPIKE-wind-currents.md"
---

## Verdict
**Feasible with caveats.** The current wind/current fields are intentionally simplistic and many consumers quantize/snap the vector direction, so “massively more realistic” requires (a) upgrading producers, (b) upgrading consumers to actually use a real vector field, and (c) adding a small set of new upstream-derived ocean geometry helpers (basins/coast fields) to make currents non-trivial.

This can be staged behind new op strategies so we can iterate without destabilizing the existing recipe.

---

## 1) Current state (evidence-backed)

### Producers (why we get stripes)
- Wind is currently generated from latitude bands with per-row variance (V≈0, row-uniform vectors): `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/rules/index.ts#L26`.
- Currents are currently generated from latitude bands + water mask; wind inputs are validated but ignored (V=0): `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-surface-currents/rules/index.ts#L15` and `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-surface-currents/strategies/default.ts#L5`.

### Consumers (why even better wind won’t fully “matter” yet)
- Moisture transport snaps to a cardinal upwind direction based on the dominant wind component: `mods/mod-swooper-maps/src/domain/hydrology/ops/transport-moisture/rules/index.ts#L3`.
- Orographic shadow in precipitation scans “upwind” using that same cardinal offset posture: `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-precipitation/strategies/baseline.ts#L74`.

### Available upstream geometry (already in the pipeline)
We already have the most important missing input for ocean realism: **bathymetry**.
- Topography publishes `bathymetry` (ocean depth relative to sea level), alongside `elevation`, `seaLevel`, and `landMask`: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-pre/steps/landmassPlates.ts#L211`.

### Grid topology helpers exist (but are not used in these ops today)
Mapgen-core includes hex-neighborhood helpers with X-wrap:
- `forEachHexNeighborOddQ` uses column-parity offsets and wraps X: `packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts#L37`.

This is relevant because several current hydrology routines use square-grid adjacency and do not wrap, which will fight “realism” even if the physics is improved.

---

## 2) Modeling target (what “massively more realistic” means here)

The repo already contains a coherent “physics-first but still cheap” target posture:
- Hydrology modeling spike: winds + ocean coupling + moisture advection + precipitation as a causal spine (and explicitly cites NOAA references for circulation and currents): `docs/projects/engine-refactor-v1/resources/spike/spike-hydrology-modeling.md#L86`.
- The earth-physics synthesis doc suggests “vector-field construction + advection/diffusion” (wind + gyre + coast tangent) rather than Navier–Stokes: `docs/system/libs/mapgen/research/SPIKE-synthesis-earth-physics-systems-swooper-engine.md#L84`.

From those, a pragmatic “realism” target is:
- **Wind**: a per-tile vector field with meaningful meridional structure (Hadley/Ferrel/Polar surface winds), jet meanders, seasonal shifts, and terrain/land–sea perturbations.
- **Currents**: per-tile ocean-only vector field with basin-scale gyres, coast-parallel boundary currents, and some wind-stress imprint (plus optional upwelling proxy).
- **Consumers**: moisture advection and orographic precipitation that actually use continuous vectors (not snapped dx/dy).

---

## 3) Integration touchpoints (what must change)

| Component | Impact | What changes | Evidence |
|---|---:|---|---|
| `hydrology/compute-atmospheric-circulation` | High | Add new strategies and/or broaden inputs to include land/sea + terrain + thermal contrast; produce tile-varying U/V | `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/contract.ts#L14` |
| `hydrology/compute-ocean-surface-currents` | High | Actually use wind; add basin/coast fields; add gyre logic | `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-surface-currents/strategies/default.ts#L5` |
| `hydrology/transport-moisture` | High | Replace cardinal-only upwind with vector advection on the hex neighborhood | `mods/mod-swooper-maps/src/domain/hydrology/ops/transport-moisture/rules/index.ts#L3` |
| `hydrology/compute-precipitation` | Medium–High | Replace barrier-scan orographic shadow with vector-consistent uplift/rainout (or keep as fallback) | `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-precipitation/strategies/baseline.ts#L74` |
| `hydrology-climate-baseline` step orchestration | Medium | Thread new upstream inputs (bathymetry, landMask, thermal outputs) into wind/current ops; publish new debug layers | `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts#L405` |
| Downstream domains (Ecology/Narrative/Placement) | Low–Medium | Indirectly affected via changed rainfall/humidity distributions; optional direct wind/current-derived products later | (rainfall/humidity are the shared surfaces) |

---

## 4) Proposed architecture (data products and seams)

### A) Split “circulation” into explicit products (even if some remain internal)
Today we conflate winds/currents into one internal artifact: `artifact:hydrology._internal.windField`. `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts#L65`.

For realism work, we likely want:
- **Public**: keep existing `artifact:climateField` and `artifact:hydrology.climateSeasonality` stable.
- **Internal (initially)**: add `artifact:hydrology._internal.ocean` (basin + coast fields + optional SST/upwelling).
- **Internal or public**: promote `windField` to a stable public tag once it has real semantics (open question already noted in Hydrology domain docs): `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md#L112`.

### B) Add “ocean geometry helpers” as a dedicated op (new)
We have `landMask` and `bathymetry`, but we currently do not compute:
- ocean basins (connected components),
- distance-to-coast field,
- coast normal/tangent (needed for boundary currents + upwelling).

Proposal: add a new compute op (Hydrology-owned) with deterministic output:
- `hydrology/compute-ocean-geometry`
  - Inputs: `width/height`, `landMask` or `isWaterMask`, `bathymetry`, and wrap semantics.
  - Outputs: `basinId: Int32Array`, `coastDistance: Int16Array`, `coastNormalU/V: Float32Array` (or quantized i8), `coastTangentU/V`.

This is the primary seam that lets currents become more than “latitude stripes”.

---

## 5) Wind: “realistic but cheap” algorithm plan

### Inputs we already have (baseline step)
Baseline orchestration already computes:
- seasonal forcing via `latitudeByRowSeasonal` (declination): `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts#L382`
- thermal state (`surfaceTemperatureC`): `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts#L394`
- topography (`elevation`, `landMask`, `bathymetry`) from Morphology: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts#L310`

### Proposed wind model (staged)
**Wind v2 (“circulation scaffold”)**
1) **3-cell surface wind scaffold** (Hadley/Ferrel/Polar) from latitude and season (NOAA JetStream is the conceptual reference): https://www.noaa.gov/jetstream/global/global-atmospheric-circulations
2) **Jet structure / storm-track meander** as a coherent noise perturbation (tile-varying, not row-varying), ideally via Perlin noise in hex space:
   - `projectOddqToHexSpace`: `packages/mapgen-core/src/lib/grid/hex-space.ts#L12`
3) **Land–sea thermal contrast coupling**:
   - compute a smoothed land temperature anomaly field from `surfaceTemperatureC` and `landMask`;
   - apply a pressure-gradient proxy that drives monsoon-like seasonal reversals near large landmasses.
4) **Orographic deflection / blocking proxy**:
   - compute terrain gradient via hex neighbors;
   - reduce wind speed and deflect direction when encountering strong upwind slope.
5) **Coherence smoothing**:
   - a small number of relaxation steps on the hex neighborhood to avoid noisy divergence spikes.

### Contract changes (recommended)
Prefer *adding a new strategy* first to avoid breaking existing maps:
- `hydrology/compute-atmospheric-circulation`:
  - New strategy: `earthlike` (or `circulationV2`)
  - Expanded input (for new strategy only): add `landMask`, `elevation`, and `surfaceTemperatureC` (optional in schema, required by the strategy).
  - Expanded config: add controls for monsoon/thermal coupling, noise scale, terrain deflection strength, smoothing iterations, and “cell boundaries” (Hadley edge, Ferrel edge).

This keeps existing `default` behavior for regression comparisons and MapGen Studio A/B.

---

## 6) Currents: “wind + basin gyre + coast tangent” algorithm plan

This aligns with the repo’s own recommended construction. `docs/system/libs/mapgen/research/SPIKE-synthesis-earth-physics-systems-swooper-engine.md#L84`.

### Physical grounding references
- NOAA Ocean Service currents tutorial (gyres/boundary currents): https://oceanservice.noaa.gov/education/tutorial_currents/04currents3.html
- Ekman spiral / wind-driven transport (Coriolis deflection basis): https://oceanservice.noaa.gov/education/tutorial_currents/04currents4.html

### Proposed current model (v2)
1) Compute ocean geometry helpers (basins + coast tangent).
2) Compute a basin-scale **gyre field** per basin:
   - subtropical gyre rotation sign depends on hemisphere.
   - optionally add a weaker subpolar gyre band at higher latitudes.
3) Compute a **wind stress imprint**:
   - align partially with wind,
   - optionally deflect by hemisphere (Ekman-like).
4) Compute a **coast-parallel boundary component**:
   - stronger near coasts (use coastDistance),
   - aligned to coastTangent with hemisphere-dependent direction.
5) Blend and smooth:
   - `Current = wWind*Wind + wGyre*Gyre + wCoast*CoastTangent`
   - apply a few diffusion/relaxation steps over ocean tiles for coherence.
6) Optional derived ocean diagnostics (for downstream + viz):
   - upwelling potential (from alongshore wind and coast normal),
   - surface “mixing” proxy from current magnitude + wind speed.

### Contract changes (recommended)
`hydrology/compute-ocean-surface-currents` should (eventually) consume:
- windU/windV (actually used),
- ocean geometry helpers (basinId, coast tangent),
- bathymetry (for speed damping and boundary current strength scaling).

Add a new strategy `earthlike` and keep `default` as a fallback until the new one is validated.

---

## 7) Downstream consumer upgrades (to realize the “realism” value)

### A) Moisture transport: replace cardinal snapping with vector advection
Current `transport-moisture` uses a cardinal dx/dy derived from the dominant wind component. `mods/mod-swooper-maps/src/domain/hydrology/ops/transport-moisture/rules/index.ts#L3`.

Plan:
- Implement vector advection on the hex neighborhood:
  - for each tile, choose the neighbor that best matches `-windDir` (backtrace) via dot product against neighbor offset vectors in hex space;
  - optionally do a 2-neighbor weighted blend for smoother transport.
- Keep bounded iterations for determinism/perf.

Outcome:
- moisture plumes follow winds realistically (curving around terrain, converging into ITCZ-like belts, etc.).

### B) Orographic precipitation: use uplift (∇z · wind) and/or rainout along streamlines
The existing “upwind barrier scan” can be replaced or complemented:
- compute local uplift as the projection of elevation gradient onto wind direction;
- convert uplift + humidity into precipitation increment;
- optionally reduce humidity downwind (rainout) as part of the transport step.

This avoids the current artifact where orographic effect depends on a snapped cardinal direction and a fixed number of steps.

### C) Currents consumer wiring (optional but recommended)
Right now currents appear unused downstream. `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.ts#L178`.

If we want currents to matter (not just look cool), wire them into one or more:
- **Ocean evaporation sources**: make ocean evaporation depend on SST proxy + wind speed; SST proxy depends on currents.
- **Thermal state**: add an “ocean moderation” term driven by SST/current transport near coasts.

This is the step where realism yields visible climate outcomes (e.g., warm western boundary coasts).

---

## 8) Rollout plan (phased, low-risk)

### Phase 0: Instrumentation + invariants (fast)
- Add debug viz layers for wind speed, divergence, curl/vorticity, coastDistance, basinId, current speed.
- Add regression checks in tests for determinism and non-NaN outputs.

### Phase 1: Wind v2 + consumers v2 (largest immediate payoff)
- Add `compute-atmospheric-circulation:earthlike`.
- Update `transport-moisture` to vector advection (new strategy first).
- Update precipitation orographic logic to use real vectors (new strategy first).

### Phase 2: Ocean geometry + current v2
- Add `compute-ocean-geometry` op.
- Add `compute-ocean-surface-currents:earthlike`.
- Wire MapGen Studio to visualize basins/coast fields and compare.

### Phase 3: Ocean coupling “matters” (SST/upwelling)
- Add a cheap SST proxy field (advection-diffusion on ocean tiles).
- Feed SST into evaporation and/or thermal state for coastal moderation.

At each phase, keep the old strategies available so MapGen Studio can A/B test and we can bisect regressions.

---

## 9) Key risks and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| “Realistic wind” still doesn’t change outcomes | Consumers currently snap direction and discard diagonal structure | Upgrade transport + orographic consumers in the same slice (Phase 1) |
| Coordinate mismatch / artifacts at wrap seam | Some routines don’t wrap X or don’t respect hex adjacency | Standardize on `hex-oddq` neighbor functions with X-wrap for new work (`packages/mapgen-core/src/lib/grid/neighborhood/hex-oddq.ts#L37`) |
| Performance in browser/studio | More iterations and more fields | Keep bounded iterations, quantize outputs, push expensive steps behind knobs/strategies |
| Hard-to-tune parameters | Many knobs become “black magic” | Provide a small set of semantic knobs; keep advanced config in strategy config with documented defaults |

---

## 10) Deliverables checklist (what “done” looks like)
- Wind layer shows non-banded global circulation with meaningful meridional components (trades/westerlies/polar).
- Current layer shows basin-scale gyres and boundary currents, not pure stripes; currents differ by basin geometry and hemisphere.
- Rainfall/humidity fields show believable wind-driven rain shadows and moisture advection patterns (not purely distance-to-water + noise).
- Deterministic regeneration (same seed/config → same outputs), with tests guarding key invariants.
- MapGen Studio exposes debug layers to validate divergence/curl/coastDistance/basinId and to tune knobs.

