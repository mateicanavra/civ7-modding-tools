# Foundation crust-relief: drowned continental platforms

**Status:** investigation complete → **handoff to a dedicated DRA**. This is NOT a config tweak.
**Owner of the finding:** spun out of the Path-A continental-shelf workstream (see
[`../coastal-shelf-tiling/PATH-A-MARGIN-SCULPT.md`](../coastal-shelf-tiling/PATH-A-MARGIN-SCULPT.md),
section "(c) OPEN FINDING").
**Governing philosophy (binding):** inputs first, physics first, emergent and real. No author-facing
downstream-math knobs. **Never tune a constant to hit an output ratio.** Mechanisms must emerge from
physical inputs.

---

## 1. TL;DR / verdict

On earthlike, roughly a third of continental crust is **submerged flat right at the waterline** —
vast shallow "platforms" with no emergent islands, microcontinents, or mountains rising from them.
This is what made the coast/ocean ratio "look weird."

The cause is **not** the continental-shelf sculpt (that op faithfully shapes the apron→break→slope of
the crust it is handed). The cause is **upstream, in how Foundation crust elevation is distributed**:
the continental crust forms a single **dense, narrow, unimodal hump centred on sea level**. Earth's
hypsometry is **bimodal** — a high continental peak and a deep abyssal peak with a *narrow* shelf
between them. Ours is not.

**Config cannot fix it** (proven empirically below): scaling the relief datums only *translates* the
hump up or down, and the sea-level solver re-targets the same water% and tracks the hump, re-cutting
the waterline through the same dense band. The fix must **reshape** the distribution — drive real
bimodal relief out of crust history — which is a **crust-evolution model change**, hence a workstream.

---

## 2. Symptom (what the user sees)

- Continents that look like they "sank under the water" — broad shelves with nothing emergent on them.
- Coast tiles dominate the water budget; the land that exists is fringed by huge flat shallows.
- Downstream: cold-reef habitat (cold + shallow shelf) collapses on the already-marginal
  `sundered-archipelago` map (its `requireColdReefs` guarantee is currently **suspended** — see §9).

## 3. Root cause (mechanism)

The elevation a tile gets is, in `compute-base-topography`
([`rules/index.ts`](../../../mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/rules/index.ts) `computeElevationRaw`, L73–79):

```
reliefSpan = continentalHeight − oceanicHeight
base       = oceanicHeight + reliefSpan · clamp(crustUnit, 0, 1)
elevation  = round(base · DEFAULT_ELEVATION_SCALE)        // scale = 100
```

`crustUnit` is the per-tile projection of Foundation `crust.baseElevation`, which **equals crust
buoyancy** from `compute-crust-evolution`
([`index.ts`](../../../mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts) `deriveBuoyancy`, L58–67):

```
buoyancy = clamp01( 0.32                                  // OCEANIC_BASE_ELEVATION
                  + 0.45 · maturity                       // MATURITY_BUOYANCY_BOOST
                  + 0.25 · thickness                      // THICKNESS_BUOYANCY_BOOST
                  − 0.22 · thermalAge )                   // OCEANIC_AGE_DEPTH (subsidence)
```

with `thickness = max(initThickness, 0.25 + 0.5·maturity)`. So, in practice:

```
buoyancy ≈ clamp01( 0.3825 + 0.575·maturity − 0.22·thermalAge )
```

Two coupled model deficiencies make continental crust pile up at the waterline:

**(i) Thermal subsidence is applied to crust that physically should not subside, and it is uniform.**
Measured: **every** continental cell is maximally thermally-aged (thermalAge p10/p50/p90 =
0.94/0.96/0.98 — *all* in the 0.8+ bucket). `thermalAge` as implemented just measures "eras since the
last rift reset," and continental interiors never reset, so they saturate at ~1. The subsidence term
then applies a **uniform −0.22·0.96 ≈ −0.21** (≈ −21 elevation units) to *all* continental crust.
Physically this is inverted: thermal subsidence is an **oceanic** process (cooling oceanic
lithosphere sinks with age); old continental **cratons are the highest, most stable crust**. The
model drags down exactly the crust that should ride high.

**(ii) Maturity differentiation is weak, so the buoyancy hump is narrow and unimodal.**
Continental maturity clusters just above the continent threshold (0.55). Back-solved from measured
buoyancy (continental `crustUnit` 0.485–0.68, p50 0.54, at age≈0.96): maturity ≈ 0.55–0.88, **median
≈ 0.64**. The thick-old-craton tail (maturity > 0.8) is thin. There is no strong runaway that
separates "thick high craton" from "thinned/young low crust," so continental buoyancy is a tight band
rather than a spread with a clear high mode.

Net: continental `crustUnit` 0.485–0.68 → through earthlike `base = −0.75 + 1.29·crustUnit` →
elevation **−12…+13**. The entire continental population is born inside a ±13 band around sea level.
**73.7% of continental crust sits within ±15 of sea level** (clearly emergent >+15: only 17.8%;
clearly below −15: 8.6%).

## 4. Evidence (measured, earthlike seed 1018, 106×66)

**Crust buoyancy is nearly unimodal and barely separated** (`tools/hypso.mjs`):

| population | crustUnit min / p50 / max | note |
|---|---|---|
| continental | 0.485 / **0.54** / 0.68 | 46% jammed in [0.50, 0.55) |
| oceanic | 0.376 / 0.445 / 0.484 | nearly *touches* the continental floor at ~0.48 |

**Hypsometry** (`morphology.topography.elevation`, all tiles): one sharp abyssal spike at −75 (the
shelf sculpt's oceanic floor — correct) **+ a broad continental hump centred at −10…0** (peak 17.9% in
[−10,−5)). Not Earth's two-peaks-with-narrow-shelf.

**Drowned-platform stat** (`tools/drowned.mjs`): 32.2% of continental crust submerged; submerged
continental bathymetry **p50 −1, p90 0, max 0** → dead flat at the waterline.

**Config-tweak hypothesis — falsified.** Doubling the relief span and cranking crust noise barely move
the outcome; the sea-level solver re-drowns the middle every time:

| run | land tiles | submerged % of continental | submerged bathy p50 / p90 / max |
|---|---|---|---|
| baseline (`continentalHeight` 0.54) | 2708 | **32.2%** | −1 / 0 / 0 |
| `continentalHeight` **1.2** (2× span) | 2717 | **32.0%** | −2 / 0 / 0 |
| `crustNoiseAmplitude` **0.85** (huge) | 2736 | **31.5%** | 0 / 0 / 0 |

**The decisive observation.** Under `continentalHeight=1.2` the continental hump *translates up* — in
absolute terms 93.9% of continental crust is now above +15 (drowning-zone band collapses to 6.1%) —
**yet the waterline-relative drowned fraction stays 32%, still flat at the waterline.** The solver
raised sea level *with* the hump to hold the water% target, re-cutting the same dense, narrow band.
**This is the proof that the problem is the SHAPE of the distribution, not its position.** Scaling
relief only slides the hump; the solver follows it. You must reshape it so the waterline lands in a
**sparse** part of the distribution.

## 5. Why config genuinely can't fix it

- The author-facing knobs in `ReliefConfigSchema`
  ([`config.ts`](../../../mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/config.ts))
  are all **linear scale/shift or additive noise** (`oceanicHeight`, `continentalHeight`,
  `crustNoiseAmplitude`, tectonic weights). None reshape a unimodal hump into a bimodal one.
- Sea level is a **percentile of elevation** (the floating datum). Any uniform relief scaling is
  cancelled by the solver — the same lesson the shelf workstream already learned. §4 demonstrates it
  directly.
- The buoyancy coefficients that *would* matter (`OCEANIC_AGE_DEPTH`, `MATURITY_BUOYANCY_BOOST`, the
  maturity-integration coefficients) are **hardcoded constants in `compute-crust-evolution`**, not
  config — and changing them blindly to hit a target would violate the governing philosophy anyway.

## 6. Levers (physically-grounded candidates, ranked)

All live in **`compute-crust-evolution`** (and its inputs), not in base-topography datums. The goal is
**emergent bimodality**: a high continental mode (cratons, orogens) and a deep mode (oceanic/basins),
with the waterline naturally falling in a sparse trough between them.

1. **Make thermal subsidence crust-type-aware (highest-leverage, most clearly physical).** Thermal
   subsidence (`OCEANIC_AGE_DEPTH`) should act on **oceanic** crust (young ridge high → old abyss
   deep) and be **absent or strongly attenuated for mature/continental** crust. Cratons don't sink.
   This alone lifts the aged continental hump off the waterline. *Caveat:* by itself it produces a
   *uniformly lifted flat slab* — necessary but not sufficient; pair with (2)/(3) to get real relief.
2. **Strengthen maturity differentiation into a spread, not a cluster.** Make continental maturity
   develop a genuine high-craton tail (e.g. stronger thickness/maturity positive feedback, accretion
   over eras) so buoyancy spreads into a clear high mode instead of hugging the 0.55 threshold. This
   is what turns "lifted flat slab" into "high cratons + intervening lower crust."
3. **Let crust-history relief variance reach elevation.** Old/thick crust high; thinned, rifted, or
   young crust low — driven by the tectonic-history fields (uplift, rift, fracture, orogeny) that
   already exist (`foundation.history.*`, `morphology.belts.*`). Base-topography already adds an
   uplift term (`upliftEffect = upliftBlend·reliefSpan·0.45`); evidently too weak / too smooth to
   create bimodality. Consider whether relief should be a **non-linear** (sigmoidal) function of
   crust state rather than the current linear map.

Validating thermalAge itself is the suggested **first probe**: it is currently saturated (~0.96
everywhere) and carries no useful spatial signal for continental crust — confirm whether it should,
and whether oceanic age should drive an oceanic-only depth-age curve.

## 7. Entry points

- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts`
  — `deriveBuoyancy` (L58–67), the era-integration loop (maturity/thermalAge/thickness, L107–186),
  constants `OCEANIC_AGE_DEPTH` (0.22), `MATURITY_BUOYANCY_BOOST` (0.45), `THICKNESS_BUOYANCY_BOOST`
  (0.25), `MATURITY_CONTINENT_THRESHOLD` (0.55), `THICKNESS_FROM_MATURITY_GAIN` (0.5), the maturity
  integration coeffs (L33–39).
- `compute-crust/index.ts` — the t=0 basaltic-lid initial condition (oceanic everywhere); continental
  emergence is era-driven, so the evolution op is where relief is actually decided.
- `compute-base-topography/rules/index.ts` — `computeElevationRaw` (the linear crust→elevation map),
  `DEFAULT_ELEVATION_SCALE`. Downstream of the cause; do **not** "fix" it here.
- Inputs to crust evolution: `compute-tectonic-history-rollups`, `compute-era-tectonic-fields`,
  `compute-mantle-forcing` (these supply the per-era uplift/rift/volcanism/fracture that drive
  maturity).
- Sea-level coupling: `compute-sea-level` (the percentile solver that cancels uniform shifts).
- Margin sculpt that consumes the crust: `compute-sculpt-continental-margin` (do not change; it is the
  downstream consumer and is correct).

## 8. Acceptance criteria (measure, don't tune-to)

The point is a **physically-grounded reshaping**, verified by *shape*, not by hitting a number:

- Continental crust hypsometry is **visibly bimodal / spread**, not a single dense hump centred at the
  waterline (`tools/hypso.mjs` — the continental histogram should show a clear high mode).
- The **drowned-platform fraction falls** and submerged continental crust is **no longer dead-flat at
  0** (`tools/drowned.mjs` — `submergedPctOfCont` down; `submergedContinentalBathy` p50 meaningfully
  below 0 and/or far fewer such tiles). The point is that crust near the waterline becomes *sparse*.
- Emergent relief appears **on** former platforms: islands / microcontinents / mountains, emergent
  from crust state — not stamped.
- The suspended **`sundered-archipelago` cold-reef guarantee is restored** (coherent cold shallow
  shelf returns) — or an explicit product decision drops it.
- Behaviour holds across maps/seeds (earthlike, shattered-ring, sundered-archipelago,
  desert-mountains), not just one tuned seed.
- **No constant tuned to hit a coast/ocean/land ratio.** Every change traces to a physical mechanism.

## 9. Coupled consequences (don't surprise these)

- **Sea level / water%.** Reshaping crust shifts the land/water split; the percentile solver will
  re-target. Expect coastline changes; this needs the same kind of sign-off the shelf coastline got.
  Related: tasks #20 (waterline artifact) and #22 (unifying stage-knob surface).
- **Margins / shelf.** Less crust at the waterline → narrower, crisper shelves (the sculpt will
  faithfully follow). The shelf workstream is already datum-free and will absorb this.
- **Cold reefs.** Restoring coherent cold shallow shelf should bring back the suspended
  `sundered-archipelago` guarantee (`mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`,
  dated tracking comment). Re-enable it as part of closure.
- **Mountains / islands / ecology.** Real emergent relief feeds mountain ranges, island chains, soil
  relief weighting, biome moisture — all downstream of crust elevation.

## 10. Falsifiers (hard core — same as the shelf workstream)

Off-track if the successor:
- edits the shelf sculpt or shelf classifier to mask drowned platforms (this is upstream of both);
- "fixes" it in `compute-base-topography` datums or noise (proven cancelled by the solver — §4/§5);
- tunes any relief/buoyancy constant to hit a coast/ocean/island/land **output ratio** (calibrate to
  *physical* targets — e.g. an oceanic depth-age curve — never to a downstream percentage);
- introduces an author-facing downstream-math knob;
- re-derives this finding from scratch instead of starting from this brief + `tools/`.

## 11. Reproduce

```sh
# from the swooper-maps package; fresh worktrees need the resources submodule first:
git submodule update --init -- .civ7/outputs/resources

# 1. dump the full pipeline (emits per-tile .bin layers under dist/visualization/<label>/<runId>)
bun ./src/dev/diagnostics/run-standard-dump.ts 106 66 1018 \
  --configFile src/maps/configs/swooper-earthlike.config.json --label crustrelief

# 2. analyze (RUNDIR = the outputDir printed by step 1)
node docs/projects/crust-relief/tools/drowned.mjs <RUNDIR> earthlike   # drowned-platform stat
node docs/projects/crust-relief/tools/hypso.mjs   <RUNDIR> earthlike   # hypsometry + crustUnit + drowning-zone band
node docs/projects/crust-relief/tools/agecorr.mjs <RUNDIR>             # continental crust buoyancy/elev by thermalAge

# 3. falsify a config "fix" (override merges deep into the config)
bun ./src/dev/diagnostics/run-standard-dump.ts 106 66 1018 \
  --configFile src/maps/configs/swooper-earthlike.config.json \
  --override '{"morphology-coasts":{"relief":{"continentalHeight":1.2}}}' --label crustrelief-chigh
```

Key layer keys: `foundation.crustTiles.{type,baseElevation,buoyancy,age}`,
`morphology.topography.elevation` (post base-topo + sculpt), `map.elevation.elevation` (final),
`map.morphology.continents.landMask`, `morphology.topography.bathymetry`.
