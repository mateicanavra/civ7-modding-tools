---
title: "SPIKE: Wind + Currents (why banded; what uses them)"
date: "2026-02-03"
owner: "agent-codex"
scope: "mapgen-studio viz + hydrology wind/current fields"
status: "spike"
---

## 1) Objective
Explain why MapGen Studio’s wind/current vector layers render as mostly horizontal bands, and map the real implementation status: what inputs exist, what’s missing, and what downstream code (if any) uses wind/currents and how much influence they have.

## 2) Assumptions and Unknowns
**Assumptions**
- The screenshots correspond to MapGen Studio visualizing the hydrology vector products emitted by the standard pipeline (`hydrology.wind.wind` and `hydrology.current.current`) and/or their component grids.

**Unknowns**
- Whether there is any MapGen Studio UI-side rendering bug (I focused on data production + obvious consumption; the data itself explains the banding).
- Intended longer-term design for currents (several docs describe richer ocean coupling, but active code appears placeholder).

## 3) What We Learned
### Winds are intentionally “latitude-band + jitter”, so banding is expected
The wind field is computed solely from latitude and a deterministic RNG seed. In the default rule implementation, the vector is effectively constant across each row:
- `u` is set from coarse latitude bands (trade/westerly-like), with optional “jet streak” boosts by latitude distance, but still computed per-row.
- `v` is always 0, aside from a small per-row random `varV`.
- `varU/varV` are sampled once per row (not per tile), so the entire row shares the same vector.

Evidence:
- Wind op inputs are only `latitudeByRow` + `rngSeed`: `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/contract.ts#L14`.
- Per-row constant U/V generation: `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-atmospheric-circulation/rules/index.ts#L26`.

Implication for MapGen Studio viz: the “wind vectors” are a clean visualization of what we currently generate: stripes by latitude (plus minor jitter), not a fluid-like circulation field.

### Currents are a placeholder: latitude-band over water, not wind-driven
The ocean current op contract accepts windU/windV, but the implementation does not use them:
- `computeCurrents` sets a base zonal current `baseU` from latitude bands and sets `baseV = 0`.
- It applies that uniform U/V to all ocean tiles (`isWaterMask[i] === 1`) and zeros everything on land.
- The default strategy validates wind arrays but ignores them when computing currents.

Evidence:
- Current rule ignores wind, uses only latitude + water mask: `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-surface-currents/rules/index.ts#L15`.
- Strategy validates wind but does not pass it to the rule: `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-ocean-surface-currents/strategies/default.ts#L5`.

Implication for MapGen Studio viz: current vectors will also appear as zonal stripes over water (and zero over land), matching the second screenshot.

### Wind is “wired”: it affects moisture, rainfall, and diagnostics (but in a coarse way)
Wind U/V is produced in the baseline hydrology stage and then reused in later hydrology steps:
- **Moisture transport** advects humidity “upwind” using a cardinal-only upwind direction derived from the dominant wind component. `mods/mod-swooper-maps/src/domain/hydrology/ops/transport-moisture/strategies/default.ts#L36` and `mods/mod-swooper-maps/src/domain/hydrology/ops/transport-moisture/rules/index.ts#L3`.
- **Precipitation** applies an orographic rain-shadow proxy by scanning “upwind” for elevation barriers. `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-precipitation/strategies/baseline.ts#L74`.
- **Climate diagnostics** computes a convergence proxy (divergence estimate) and a rain shadow index, both influenced by the wind field. `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-climate-diagnostics/strategies/default.ts#L63`.

The influence is currently limited by two design choices:
1) wind itself is mostly zonal and row-uniform, and
2) multiple consumers “snap” wind to a cardinal upwind direction, so diagonal structure (even if present) is partially discarded.

### Currents are “wired” for production + viz, but appear unused downstream
Currents are computed during baseline hydrology and emitted as viz layers alongside winds:
- Produced and visualized in baseline: `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts#L405` and `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/steps/climateBaseline.ts#L644`.

However, within the active pipeline, I found no downstream code that reads `currentU/currentV` to affect climate/moisture/etc. The refine step reads only `windU/windV`. `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/steps/climateRefine.ts#L178`.

## 4) Potential Shapes
If the goal is “earthlike-looking circulation fields” (for viz and for stronger climate causality), there are a few conceptual upgrade shapes:
- **Wind v1 (still cheap):** keep latitude bands, but add per-tile directional perturbations and/or terrain/landmask deflection so you get coherent flow features instead of perfect stripes.
- **Currents v1 (still cheap):** derive surface currents from winds + water mask (at minimum: align with wind stress and apply hemisphere sign), then add a coastline tangent component and weak basin-scale “gyre” steering. This would immediately make the current layer non-trivial and plausible.
- **Coupling v1:** decide what currents are for in the pipeline: evaporation sources, coastal moderation/temperature, or moisture transport. Wire the chosen coupling into `computeEvaporationSources` and/or transport.

## 5) Minimal Experiment (Optional)
- Create a small experimental variant of `compute-atmospheric-circulation` that samples variance per tile (or per column + row) rather than per row, then compare MapGen Studio’s `hydrology.wind.wind` viz output to confirm the banding disappears as expected.
- Add a “wind-aligned” current prototype (even before basins) by setting `current = k * wind` over water; validate that `hydrology.current.current` becomes meaningful and then decide what to couple it into.

## 6) Risks and Open Questions
- **Semantics risk:** multiple consumers snap wind to cardinal upwind; improving the wind field may not yield much downstream effect until consumers are upgraded to use true vector advection.
- **Coupling ambiguity:** currents currently have no consumers; adding realism without a clear downstream use risks building an expensive visualization-only artifact.
- **Design intent:** some older design docs discuss richer physical modeling, but active code is intentionally simplified; confirm the intended target for v0/v1.

## 7) Next Steps
- Confirm which downstream systems should “feel” wind/currents first (precip realism, humidity transport patterns, coastal moderation, gameplay hooks).
- Decide whether to:
  - upgrade wind generation only (fastest visible payoff), or
  - upgrade currents + add a first consumer (more architectural impact, but makes currents non-dead).
- If the goal becomes integration planning (which op owns what, what contracts to change, how to stage rollouts), escalate this spike into a `/dev:spike-feasibility` style plan.

---

Appendix: raw notes captured in `.scratch` for quick reference: `.scratch/agent-codex-wind-currents.md`.
