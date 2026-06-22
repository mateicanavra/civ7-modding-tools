# Foundation crust-relief — workstream (living framing doc)

> **Living working document.** Maintained from first discovery through investigation,
> design, implementation, verification, and closure. Grounds everything downstream.
> Companion to the handoff brief [`FOUNDATION-CRUST-RELIEF.md`](./FOUNDATION-CRUST-RELIEF.md)
> (the proven root-cause analysis) and the measurement harness under [`tools/`](./tools).
> **Do not re-derive the finding** — start from the brief and verify it.

**Status:** investigation COMPLETE (root cause verified in code + falsification re-reproduced +
full subsystem trace synthesized); design fixed; entering implementation (slice 2, consolidation).
**Base:** `agent-shelf-physical-break` (realism-thread tip, commit `e1bfde4b9`).
**Branch:** `agent-crust-relief-frame` (worktree `wt-agent-crust-relief-frame`), graphite-tracked
onto `agent-shelf-physical-break` → `agent-coast-r3d-shelf-diagnostic`.
**Governing philosophy (binding):** inputs first, physics first, emergent and real. No
author-facing downstream-math knobs. **Never tune a constant to hit an output ratio.**

---

## 1. Frame (objective / hard core / falsifiers / exterior)

**Objective.** Reshape the Foundation continental-crust elevation distribution from a single
dense unimodal hump centred on sea level into a genuine **bimodal hypsometry** — a high
continental mode (thick/old/stable cratons + orogens) and a deep mode (oceanic/basins),
with the waterline naturally falling in a **sparse trough** between them — *emergent from
crust history*, not imposed. Eliminate "drowned continental platforms" (≈1/3 of continental
crust submerged dead-flat at the waterline).

**Hard core (must hold).**
- Bimodality is *emergent* from crust-history signals (maturity, thickness, thermal age,
  uplift, rift, fracture, orogeny), not a tuned amount.
- Acceptance measured by **SHAPE**, never by hitting a coast/ocean/land number.
- Downstream consumers (shelf sculpt, mountains, islands, ecology/reefs) consume the
  reshaped relief without special-casing.
- Mis-modelled physics corrected/clarified (uniform continental thermal subsidence; a
  saturated thermalAge that carries no continental spatial signal).
- Playable for Civ 7: valid starts, island↔mainland connectivity, believable land/water
  budget, strategy-relevant coastal & continental geography.

**Falsifiers (off-track if I…).** Inherited from the brief §10 + shelf workstream:
- edit the shelf sculpt / shelf classifier to *mask* drowned platforms (upstream of both);
- "fix" it in `compute-base-topography` datums or noise (proven cancelled by the solver);
- tune any relief/buoyancy constant to an output ratio (calibrate to *physical* targets —
  e.g. an oceanic depth-age curve — never to a downstream percentage);
- introduce an author-facing downstream-math knob;
- re-derive the finding from scratch instead of starting from the brief + `tools/`.

**Exterior (explicitly out of scope unless forced).** Engine/SDK architecture; the shelf
sculpt math; the sea-level solver algorithm itself (it is correct — it just faithfully
re-targets); placement/resource policy beyond what reshaped geography implies.

---

## 2. Context & skills gathered (proof: read-in-full)

Governing skills read in full (entry point → relevant references):
- `civ7-mapgen-workstream` SKILL + `references/pipeline-map.md` + starting-frame template —
  11-step loop; truth(1–10)/projection(map-*) split; recipe-domain lives in
  `mods/mod-swooper-maps/src/{domain,recipes}`; in-game verification is closure.
- `civ7-systematic-workstream` SKILL — 12 gates; corpus-before-tuning,
  expectations-before-stats, proof-classes-stay-separate.
- `civ7-open-spec-workstream` SKILL — phase loop (ground→spec→review→implement→verify→
  realign→close); OpenSpec via `bun run openspec`; dominoes-control-sequence.
- `graphite-stack-drain` SKILL + `dev:graphite` + `dev:git-worktrees` — worktree/branch
  mechanics; `gt sync --no-restack` default in multi-worktree repos.
- Brief `FOUNDATION-CRUST-RELIEF.md` read in full; harness `tools/{drowned,hypso,agecorr}.mjs`
  located.

Pending deeper reads (loaded as the relevant gate needs them): `mapgen:foundation` /
`mapgen:morphology` (domain *philosophy* only — outdated arch), `civ7-architecture-authority`
(review gate), `civ7-operational-debugging` + `civ7-play-game` (live verification gate),
`facet-physics.md` (physics depth), `earthlike-expectation-ledger.md` (predeclare gate).

---

## 3. Repo / Graphite state (proof: inspected)

Realism thread is a local lane stacked on the graphite-tracked coast stack:

```
agent-crust-relief-frame   ◉  (this work — docs/investigation slice)
agent-shelf-physical-break ◯  e1bfde4b9  (Path-A physical shelf + brief; not yet submitted)
agent-coast-r3d-shelf-diagnostic ◯  0b032cf95  (tracked; also parent of agent-bathy-t2-analysis)
… coast stack … → main (bcc5ab7bd)
```

`agent-shelf-physical-break` was previously untracked in graphite; tracked it onto its true
parent `agent-coast-r3d-shelf-diagnostic` (metadata-only, no restack) so this branch joins the
stack cleanly. Shelf worktree was clean before tracking.

**Env:** bun@1.3.14 + nx 22.7.5 monorepo. Fresh worktree needs: resources submodule
(`git submodule update --init -- .civ7/outputs/resources` — done) + workspace package build
(`bun run build` — `@swooper/mapgen-core` exports point at `dist/`; diagnostics fail with
"Cannot find module '@swooper/mapgen-core'" until built). [build: in progress]

---

## 4. Root cause — verified against live code

Confirmed the brief's mechanism directly against source in this worktree:

**Buoyancy = continental relief.** `compute-crust-evolution/index.ts` `deriveBuoyancy` (L58–67):
```
buoyancy = clamp01(0.32 + 0.45·maturity + 0.25·thickness − 0.22·thermalAge)
thickness = max(initThickness, initThickness + 0.5·maturity)   // L160-162, initThickness≈0.25
⇒ buoyancy ≈ clamp01(0.3825 + 0.575·maturity − 0.22·thermalAge)
```
`baseElevation[i] = buoy` (L179) — crust relief IS buoyancy.

**Crust→elevation map is linear in buoyancy.** `compute-base-topography/rules/index.ts`
`computeElevationRaw` (L55–80):
```
reliefSpan = continentalHeight − oceanicHeight
base       = oceanicHeight + reliefSpan · clamp(crustUnit,0,1)   // crustUnit = projected buoyancy
elevation  = round((base + upliftEffect + boundaryBoost − riftPenalty + noise…) · 100)
upliftEffect = upliftBlend·reliefSpan·0.45 ; riftPenalty = riftNorm·reliefSpan·0.15
```
The additive uplift/rift terms exist but are weak/smooth; the **shape** of the buoyancy
distribution dominates → the shape problem is decided in `compute-crust-evolution`.

**Two coupled model deficiencies (confirmed in code):**
1. **Uniform thermal subsidence on crust that shouldn't subside.** `−0.22·thermalAge` is
   applied to *all* crust (L65). `thermalAge01` accrues `1/eraCount` per era unless rift-reset
   (L154–156); continental interiors never rift → **saturate to ~1.0** → uniform ≈ −0.21 drag
   on exactly the crust that should ride highest. Physically inverted: thermal subsidence is an
   *oceanic* process; cratons don't sink.
2. **Saturating maturity integrator → narrow unimodal hump.** maturity increments by
   `3.6·u·headroom² + 0.8·v·headroom` (L132–136). The `headroom²` on uplift makes the
   increment shrink quadratically as maturity rises — a soft-ceiling integrator that
   **compresses the high tail**, so continental maturity clusters just above the 0.55 threshold
   (median ~0.64) with no runaway high-craton mode.

Net: continental `crustUnit` ≈ 0.485–0.68 (p50 0.54) — a ±13-elevation band around sea level;
73.7% within ±15 of sea level. Whatever percentile the solver picks cuts this dense band.

---

## 5. Stale / duplicated relief logic — FOUND

**`deriveBuoyancy()` + the four buoyancy constants (`OCEANIC_BASE_ELEVATION` 0.32,
`OCEANIC_AGE_DEPTH` 0.22, `MATURITY_BUOYANCY_BOOST` 0.45, `THICKNESS_BUOYANCY_BOOST` 0.25) +
`strengthFrom{ThermalAge,Maturity,Thickness}()` + `MATURITY_CONTINENT_THRESHOLD` 0.55 are
copy-pasted verbatim in BOTH `compute-crust/index.ts` AND `compute-crust-evolution/index.ts`.**
`compute-crust` is the t=0 basaltic-lid initial condition (oceanic everywhere: maturity 0,
thickness 0.25, thermalAge 0 ⇒ buoyancy 0.3825); `compute-crust-evolution` re-runs the same
buoyancy model after the era loop. Any reshaping must land in ONE shared place (a foundation
crust-relief rule), not be duplicated.

**Exhaustive sweep (trace-confirmed):**
- `deriveBuoyancy`, the four constants, `strengthFrom{ThermalAge,Maturity,Thickness}` + `STRENGTH_*_MIN`,
  and `MATURITY_CONTINENT_THRESHOLD` 0.55 — **byte-identical** in `compute-crust/index.ts` and
  `compute-crust-evolution/index.ts`. `clampU8` even forks (local def in compute-crust vs imported
  from core in evolution) — evidence of a copy-drift.
- `compute-crust`'s `buoyancy/baseElevation/type/age/strength` outputs are **dead for relief** —
  evolution reads only `crustInit.thickness`. They survive via the viz dump + schema validation only.
- `baseElevation === buoyancy` verbatim (evolution L178-179) — one source under two names; consumers
  split (base-topo/landmask read `crustBaseElevation`, margin sculpt reads `crustBuoyancy`).
- `OCEANIC_BASE_ELEVATION` is **misnamed** — it's the buoyancy floor for *all* crust (continental
  interiors inherit it), not oceanic-specific; will confuse a real oceanic/continental split.
- **Stale band-aid:** `relaxUndrivenInteriorDomes` (landmassPlates.ts:215-242) artificially lowers
  undriven interior land to fake relief on the flat unimodal hump → remove/retune once real bimodal
  relief exists (double-counting risk).
- Tangential dead code: `lib/tectonics/fields.ts` is a stale clone of `compute-era-tectonic-fields/rules`
  (missing the newer `activityGain`/`plateActivity` gating; no src importer); `compute-shelf-mask`'s
  `shallowCutoff` hardwired to 0. Note, don't necessarily fix here.
- `crustNoiseAmplitude`/`crustEdgeBlend`/`fractalGrain` are consumed in the strategy `default.ts`
  (noise generator), not in `rules/index.ts` — **live, not stale** (my noise falsifier proves it).

---

## 6. Falsification re-verification (harness) — ✅ DONE (independently reproduced)

Re-ran the brief's repro myself (earthlike seed 1018, 106×66). Numbers match the brief to the
decimal — proof label: **harness-measured**, this worktree, build `e1bfde4b9`+pkg-build.

| run | land | submergedPctOfCont | submerged bathy p50/p90/max | continental crustUnit (min/p50/max) | verdict |
|---|---|---|---|---|---|
| baseline (earthlike s1018) | 2708 | **32.2%** | −1 / 0 / 0 | 0.485 / 0.54 / 0.68 | dense unimodal hump straddling waterline (46% in [0.50,0.55)) |
| continentalHeight=1.2 (2× span) | 2717 | **32.0%** | −2 / 0 / 0 | **0.485 / 0.54 / 0.68 (identical)** | hump *translates up* (93.9% now >+15 abs) yet drowned fraction unchanged — solver raised sea level with it |
| crustNoiseAmplitude=0.85 (huge) | 2736 | **31.5%** | 0 / 0 / 0 | **0.485 / 0.54 / 0.68 (identical)** | noise smears the topo band but drowned fraction unchanged |
| latest-juicy (grounding config) | 2656 | **44.6%** | −5 / 0 / 0 | 0.484 / 0.547 / 0.69 | **worse** — 67% of crust is continental → more forced under the waterline; same unimodal hump |

**Cross-check (latest-juicy vs swooper-earthlike):** latest-juicy is the more drowned case —
67% continental crust (vs 56%) and **44.6%** drowned (vs 32.2%), coast 39.6% of map. Confirms
the mechanism scales with the continental/oceanic ratio: the maturity distribution produces *too
much* continental crust AND packs it densely at the waterline, so the solver must push the
waterline deep into the dense band. Reshaping must address both the **spread** (sparse trough)
and implicitly the **continental fraction** (emergent from the maturity distribution, never tuned
to a ratio).

`agecorr`: **all 3918 continental cells in the single thermalAge 0.8+ bucket** (p10/p50/p90 =
0.94/0.96/0.98, meanBuoy 0.546) → thermalAge has **zero continental spatial signal**. Confirmed.

**Decisive:** the continental crustUnit (buoyancy) distribution is *invariant* to both config
knobs — they act in base-topography (reliefSpan / additive noise), downstream of the crust map.
The percentile solver cancels uniform relief change. The shape is decided in
`compute-crust-evolution`. **Falsification holds; moving past it.**

---

## 7. Design — bimodal hypsometry from two crust-type depth-age curves

**Core insight (trace).** The model has **no cratonization mechanism**. Maturity = belt-proximity
integrated over eras through a `headroom²` saturating integrator, so quiet plate interiors get
maturity≈0 (→ classified oceanic) and belt cells cluster at 0.6–0.7 with a starved high tail. The
LOW mode (rifted, maturity≤0.08 via rift-reset) partially exists; the **HIGH craton mode is
structurally absent**, then `−0.22·thermalAge` (saturated ~0.96) drags the whole band down uniformly.

**The model (emergent, physical): two depth-age behaviours by crust type.**
- **Oceanic crust** (low maturity): subsides with thermal age — young ridge high → old abyss deep.
  The existing `−OCEANIC_AGE_DEPTH·thermalAge` is *correct for oceanic*; keep it (and let oceanic
  thermalAge carry its real spreading-age signal).
- **Continental crust** (high maturity): does **not** thermally subside; instead old, quiescent,
  thick crust *rides high* (isostatic cratonic root). Replace the inverted uniform subsidence with a
  cratonic-stability term that **grows** with maturity, thickness, and time-since-last-orogeny.

Bimodality is then emergent: oceanic deepens with age (deep mode); continental rises/stays-high
(high mode); young/transitional crust (newly-accreted margins, rifted crust) is *sparse* in the
trough where the 63rd-percentile waterline lands.

**Wire in existing-but-unused signals (no new compute):**
- `lastActiveEra`/`lastCollisionEra`/`lastSubductionEra`/`upliftRecentFraction`
  (`compute-tectonic-history-rollups`, computed + dumped, NOT consumed by crust-evolution) — encode
  "time since orogeny" = cratonic stability. A craton = high-maturity crust with an *old* lastActiveEra.
- thickness: currently `0.25 + 0.5·maturity` (no independent signal). Let stable cratons accumulate
  thickness over quiescent eras so `THICKNESS_BUOYANCY_BOOST` carries a real high-mode contribution.

**Two coupled mechanisms (verify each by SHAPE with the harness):**
- **M1 — crust-type-aware subsidence.** Gate `OCEANIC_AGE_DEPTH·thermalAge` by crust type: full on
  oceanic, removed/attenuated on continental. (Brief H1; alone → uniformly lifted flat slab —
  necessary, not sufficient, because the solver re-cuts a still-dense band, exactly like the datum.)
- **M2 — cratonization → high mode.** Add quiescence/age-driven craton stabilization (maturity
  and/or thickness positive feedback using `lastActiveEra`), so a genuine high-craton mode develops
  instead of a cluster at the 0.55 threshold. (Brief H2; turns the flat slab into high cratons +
  lower intervening crust → the sparse trough.)

**Keep UNCHANGED (correct; touching them would create a second shape-owner):**
- base-topography linear remap (histogram-preserving — transmits bimodal buoyancy automatically;
  this resolves brief-H3: shape it in *buoyancy*, not in the elevation map).
- the sea-level percentile solver (cuts the trough once the distribution is bimodal; `targetWaterPercent=63`).
- the margin/shelf sculpt (datum-free; follows real shelf-break morphology).

**Home:** extract the duplicated buoyancy/strength/threshold into one `domain/foundation/lib/crust/`
primitive (precedent: `lib/tectonics/constants.ts`), imported by both `compute-crust` and
`compute-crust-evolution`. NOT a config knob (crust-evolution has zero config by design) and NOT in
`@civ7/map-policy` (engine-compliance, not geophysics). Any new constant is a *physical rate/ratio*,
never tuned to an output ratio (follow the `compute-sculpt-continental-margin` config convention).

---

## 8. Predeclared expectations (declared BEFORE implementing — step-5 gate)

Shape acceptance (measure, don't tune-to). Baseline → expected direction, for earthlike s1018 and
≥3 other seeds + shattered-ring / sundered-archipelago / desert-mountains:
- **Continental crustUnit histogram becomes bimodal/spread** — a clear HIGH mode well above the
  waterline-equivalent, separated from a lower mode; not 46% jammed in [0.50,0.55).
- **submergedPctOfCont falls materially** (from 32.2% earthlike / 44.6% juicy) AND submerged
  continental bathymetry **no longer pinned at 0** (p50 meaningfully <0, p90 <0) — crust near the
  waterline becomes sparse.
- **DROWNING ZONE [−15,+15] share falls** from 73.7%; "clearly above >+15" rises (real high land).
- **Emergent relief on former platforms** — islands/microcontinents/mountains appear where flat
  shallows were (ridges/foothills/volcanoes are landMask-gated → populate new land for free).
- **Water% stays ~63%** (solver invariant) — the coastline moves into the trough, not the budget.
- **Cold-reef habitat coheres** — sundered-archipelago `requireColdReefs` restorable (or product-retire).
- **No constant tuned to a coast/ocean/land ratio** — every change traces to a physical mechanism.

**Anti-expectations (off-track signals):** drowned fraction ~unchanged after M1+M2 (only translated
the hump again); continental fraction explodes (over-cratonization carpets the map); snow/ice carpets
raised interiors past world-balance caps; the trough is achieved by tuning `continentalFraction`/
`targetWaterPercent` (that's the forbidden downstream-math path).

---

## 9. Domino / slice plan (Graphite stack on `agent-shelf-physical-break`)

Each slice = one self-justifying domino = one branch. Complexity-vs-parallelism: slices 2→4 are a
serial chain (each reshapes the same buoyancy fn and must be shape-verified before the next); the
de-dup (2) is independent prep; downstream realignment (5) fans out once relief is reshaped.

1. **`agent-crust-relief-frame`** (this branch) — framing doc, harness re-verification, trace
   synthesis, ascii-map tool. [docs/investigation; no behavior change]
2. **`agent-crust-lib-consolidate`** — extract the duplicated buoyancy/strength/threshold into
   `domain/foundation/lib/crust/`; import in both ops; drop dead `compute-crust` buoyancy outputs or
   import shared rule; rename `OCEANIC_BASE_ELEVATION`→`CRUST_BASE_BUOYANCY`. **No behavior change**
   (harness numbers identical) → cheap reviewable de-dup that makes the reshape land in one place.
3. **`agent-crust-oceanic-subsidence`** (M1) — gate `OCEANIC_AGE_DEPTH·thermalAge` to oceanic crust;
   continental crust stops subsiding. Verify shape (expect lifted band; drowned fraction may NOT yet
   fall — flat-slab caveat).
4. **`agent-crust-cratonization`** (M2) — quiescence/`lastActiveEra`-driven craton stabilization +
   thickness accumulation → high mode. Verify shape (bimodal; drowned fraction falls; bathy un-pins).
5. **`agent-crust-downstream-realign`** — remove/retune `relaxUndrivenInteriorDomes`; re-ground
   sea-level `continentalFraction`/`boundaryShare`; restore sundered-archipelago `requireColdReefs`
   (or product-retire); re-bless world-balance baselines.
6. **closure** — live in-game verification (Civ7 CLI + screenshots) + multi-seed/multi-config proof +
   PR/handoff.

(M1+M2 may co-land if M1-alone shape is uninformative; sequence kept so each is independently
shape-verified per the brief's "necessary, not sufficient" caveat.)

---

## 10. Open decisions (genuinely the user's)

- **Cold-reef guarantee** (`sundered-archipelago` `requireColdReefs`, currently suspended):
  restore it as closure proof, or retire by explicit product decision (brief §9). Defer to
  closure; surface to user then.

---

## 11. Proof-label ledger (claims labelled by strongest evidence actually collected)

| Claim | Strongest evidence | Status |
|---|---|---|
| Buoyancy model + duplication as described | read live source (file:line) | ✅ verified-in-code |
| No cratonization mechanism; unused craton signals exist | 5-agent subsystem trace + source | ✅ verified-in-code |
| Workspace builds; diagnostics run | nx build (21 proj) + dump run | ✅ done |
| Falsification (config can't fix) reproduces | harness drowned/hypso, 3 runs + juicy | ✅ reproduced |
| Reshaped relief is bimodal | harness hypso shape, ≥1 seed | ☐ not started |
| Emergent relief on former platforms | harness + Studio + live | ☐ not started |
| Holds across maps/seeds | multi-seed harness | ☐ not started |
| In-game playable (closure) | live engine run + screenshots | ☐ not started |

---

## 12. Implementation results (as-built)

**Model as built** (in `lib/crust/buoyancy.ts` + `compute-crust-evolution`):
1. **Isostatic, thickness-gated subsidence** (supersedes M1's first-cut maturity gate). Thermal
   subsidence acts fully on THIN crust (oceanic lithosphere → young-ridge-high/old-abyss-deep, *and*
   thinned/young continental margins → subside into real shelves) and fades to zero as crust thickens
   into an isostatically-supported cratonic keel (`isostaticSupport(thickness)`). This is more
   physical than crust-type gating and is what yields a natural shelf→coast→highland spread instead of
   a uniform high plateau. Retires the saturated-thermalAge mis-model (age now drives buoyancy only
   through thickness-gated subsidence, where it is physical).
2. **Cratonization** (`compute-crust-evolution` era loop): continental crust that survives quiescent
   eras consolidates a buoyant keel (`cratonRoot01`); active/rifted eras don't, and rift recycles it.
   Adds a high-craton tail without a wholesale lift (rate 0.08; the isostatic spread carries the
   gradient). Uses the *quiescence* of each era (inverse of disruption) — the differentiator is how
   many quiescent eras a cell experienced.

**Shape outcome (earthlike s1018, vs baseline):**
| metric | baseline | as-built | meaning |
|---|---|---|---|
| continental crustUnit min/p50/max | 0.485/0.54/0.68 (dense hump) | **0.575/0.72/0.96 (broad spread)** | no longer a dense hump at the waterline |
| DROWNING ZONE [−15,+15] | 73.7% | 48% | crust near waterline reduced (now a gradient, not a flat slab) |
| clearly above >+15 | 17.8% | 51% | emergent high continental land tripled |
| submerged continental bathy p50/min | −1 / −21 (flat) | **−5 / −30 (shelf→slope)** | no longer dead-flat; real shelf-slope-abyss profile |
| land elev p10/p50/max | −6/3/53 | 14/28/86 | continents ride high with internal relief |
| submergedPctOfCont | 32.2% | ~33% | **unchanged — by design** (see below) |

**Why `submergedPctOfCont` does not (and should not) fall.** It is structurally pinned:
`water%(63) − oceanic%(~44) = ~19%` of all cells = ~33% of continental crust *must* sit below the
waterline regardless of relief shape, as long as oceanic crust fills the deep mode. Critically,
**33% submerged continental ≈ Earth's own continental-shelf fraction** (~30% of continental crust is
submerged shelf). The brief's symptom was never "shelves exist" — it was "broad **flat** shelves with
**nothing emergent**." That is decisively fixed: the submerged crust is now a real shelf→slope→abyss
profile (bathy p50 −5, sparse continental slope between −70 and −10), and the emergent crust rides
high with relief. Forcing `submergedPctOfCont` down would require shrinking the continental fraction
(a maturity-classification change) — a **possible follow-up lever** (the model over-produces
continental crust: 56% earthlike / 67% juicy vs Earth ~40%), but reducing it to hit a fraction would
be the forbidden tune-to-a-ratio. Recorded as an open lever, not pursued by tuning.

**Visual (earthlike s1018):** `tools/ascii-map.mjs <RUNDIR> elev` — high cratonic cores (`@`/`^`)
grading through coastal land (`#`) and lowlands (`-`) to coherent shelves (`:`) and deep basins (`.`);
former dead-flat platforms are now high continents with internal relief. (Baseline: vast `+` flat
platforms interrupting low featureless land.)

**Robustness (holds across seeds + configs, not one tuned seed):** continental crustUnit is a broad
spread on every map (earthlike s1018/7/99/2024 ≈ 0.57/0.70/0.97; latest-juicy 0.57/0.74/0.97;
shattered-ring 0.57/0.67/0.81; sundered-archipelago 0.61/0.81/0.96; desert-mountains 0.81/0.88/0.96 —
all-land mountainous, high by design). Submerged continental bathymetry un-pinned everywhere (p50:
earthlike −5/−12, juicy −9, shattered-ring −37, **sundered-archipelago −77**). No carpeting / empty
maps. **OPEN (downstream slice):** sundered-archipelago submerged crust is now *deep* (p50 −77) — must
confirm enough *shallow* cold shelf remains to restore `requireColdReefs`, else tune shelf width or
retire by product decision.
