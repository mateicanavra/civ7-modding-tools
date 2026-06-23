# Crust relief — working reference frame (normative)

> Canonical, forward-looking frame for the Foundation crust-relief work. Companion: the original
> brief [`FOUNDATION-CRUST-RELIEF.md`](./FOUNDATION-CRUST-RELIEF.md) and the harness in [`tools/`](./tools).
> Session log + raw measurements live in `WORKSTREAM.md` (historical).
>
> **Status:** root cause is structural — crust→tile **resolution/projection** (§2). The crust-buoyancy
> reshape already landed (§5) is the right substrate but is per-cell, so it cannot resolve a per-cell
> defect. Direction is now **locked** (§4, §9): finer crust at fixed plate count, bounded, with the
> coarseness-dependent cosmetic noise stripped. Acceptance is a **two-layer framework** (§8). A
> targeted tectonic-content (down/lateral relief) effort is a flagged **adjacent** workstream (§10),
> sequenced after the resolution slice — not folded in by default.
>
> Measured figures below are a snapshot (earthlike seed 1018 / ToT = swooper-earthlike HUGE; stack tip
> at time of writing). Re-measure after any mesh/config change — they are diagnostics, not invariants.

---

## 1. The problem (precise)

Large regions of continental crust sit submerged **flat just below the waterline as featureless
shelf**, with nothing — no islands, microcontinents, mountains — emerging from them. The land/water
*budget* is fine; the **coast-vs-ocean distinction is not**: ~45% of the map is shallow coast/shelf,
much of it empty flat shallows; ~17% is open ocean; ~38% land. Landmasses come out as **3 large
continents + ~49 tiny 1–2 tile specks, with ZERO microcontinents (13–60 tiles)**.

A real continental region rises into land-with-shelf-margins, or it is oceanic. A vast flat shelf with
nothing on it is the artifact.

---

## 2. Root cause — VERIFIED (coarse Voronoi crust, blocky tile projection)

The crust-history model (maturity → thickness → buoyancy → rise/sink over eras) is **one unified
emergent process**, and the "sunken" crust runs the **identical** algorithm — it is not artificially
separated. The defect is **resolution + projection**:

- Crust state is computed on the **plate mesh**, sized `cellCount = plateCount × cellsPerPlate`
  (`compute-mesh/index.ts`). Earthlike's mantle mesh = 28 × 13 = **364 cells** → **~19 tiles per cell**
  over a 6,996-tile (106×66, HUGE) map. (This `plateCount` is the *mantle mesh* one, distinct from the
  separate lithosphere `platePartition.plateCount` = 42; the mesh uses 28.)
- The mesh→tile step (`compute-plates-tensors/lib/project-plates.ts`) is **nearest-cell (Voronoi), no
  interpolation**: each tile takes its nearest mesh cell (argmin hex-distance, L242–256) and **copies
  that cell's crust verbatim** (`crustBuoyancy[i] = crust.buoyancy[cellId]`, L277–286). Every per-era
  tectonic field is stamped the same blocky way (L288–318). Only `boundaryCloseness` (a distance field
  from plate boundaries, L336–385) and the additive noise in `compute-base-topography` carry true tile
  resolution — neither can create an emergent island core inside a drowned cell.

**Mechanism:** a mesh cell is a ~19-tile block with **one** crust value. It emerges (continent),
drowns flat (shelf), or sits deep — *as a whole block*. A mid-buoyancy cell cannot have a core that
pokes up as an island while its rim is shelf; all its tiles share one elevation. Hence 3 big continents
+ specks + 0 microcontinents, and drowned regions are flat tubs. This is the "Voronoi clustering"
divergence: the crust is granular at the mesh level and collapses to Voronoi blocks at the tile
projection.

**The resolution is already a per-map lever, and it is set backwards for intent.** `cellsPerPlate`
varies by map: earthlike & latest-juicy = 13 (~19 tiles/cell); **sundered-archipelago = 2 (~83
tiles/cell)**, shattered-ring = 2, desert-mountains coarser still. The maps that most need fine island
structure have the **coarsest** crust.

---

## 3. Governing principles (binding)

1. **Emergent, not cosmetic.** Relief — shelf vs archipelago vs wide passive margin — must fall out of
   the unified crust-evolution process. No post-hoc noise/fractal islands painted onto sunken shelves.
2. **One unified process.** Cratons cluster, harden, accrue a crust history, and rise/sink through
   tectonic activity over eras. Shelves, islands, microcontinents, passive margins are *outcomes* of
   that at adequate resolution — not separate mechanisms.
3. **Knobs are physical formation levers, never output targets or micromanagement.** Authors pull a
   crust/continent-formation lever ("more/less buoyant continents", "shallower seas", "archipelago-
   ness", crust resolution) and the geography *emerges*. Never a per-region depth, never a constant
   tuned to hit a coast/land %.
4. **Judge by the coast/ocean reality on the real config** (§8) — waterline-relative, not absolute-
   elevation bands that move with the floating sea-level datum.

---

## 4. Direction (to design, then verify)

The crust evolution must express relief finer than ~19-tile Voronoi blocks. The plate **dynamics** stay
coarse (plate motion/boundaries are fine at `plateCount` plates); the crust **relief** gets finer.
Decision criterion: *yield sub-cell relief without destabilizing coarse plate dynamics — and without
speckle.* Full plan + numbers in §9.

**DECIDED — finer crust at fixed plate count, bounded, with cosmetic noise stripped.**
- Raise `cellsPerPlate` (or evolve crust on a derived finer grid). Verified: the partition seeds
  **exactly** `plateCount` plates (`compute-plate-graph:340`), and `compute-mesh:15` sets
  `cellCount = plateCount × cellsPerPlate`, so raising `cellsPerPlate` gives more cells *per plate* and
  **does not change the plate count or over-split** — over-split is a `plateCount`-only risk (the §7
  history question is now resolved). Finer crust + tectonic fields, plate tectonics stay coarse — serves
  Principle 2.
- **Bounded, not tile-fine** (~3–6 tiles/cell, not 1) and **strip the per-tile cosmetic noise** that
  currently relies on coarseness to smooth — otherwise fine resolution turns it into speckle. This is
  *fewer* cosmetic mechanisms, not more. See §9.
- **Avoid — raising `plateCount`** (that over-splits; it's a plate-dynamics knob, not the resolution
  knob). **Complement only — interpolating the projection** (anti-seam smoothing, never the relief source).

Author **knobs** (Principle 3, §11) attach to the formation parameters this introduces.

---

## 5. Already landed and kept (per-cell substrate)

Directionally correct; keep. All in `domain/foundation`:
- **Isostatic (thickness-gated) thermal subsidence** — thin crust (oceanic + thinned margins) subsides
  with age; thick cratonic keels do not (replaces the prior *uniform* subsidence). (`lib/crust/buoyancy.ts`.)
- **Cratonization** — continental crust surviving quiescent eras consolidates a buoyant keel and rides
  higher. (`compute-crust-evolution`.)
- **Removed `relaxUndrivenInteriorDomes`** — a morphology band-aid that lowered undriven interior land
  to fake relief on the old flat hump.

These enrich the **per-cell** crust (cells now genuinely differentiated, deep ocean deeper, cratons
higher). Right substrate — not the fix, because the blockiness is per-cell and they operate per-cell.
The finer-resolution work (§4) is what lets this richer crust *express* itself at tile scale.

---

## 6. Guardrails (forward rules)

- Judge waterline-relative / by coast-ocean reality; never by absolute-elevation bands (the datum floats).
- No downstream cosmetic relief (noise/fractal islands on shelves) — violates Principle 1.
- Reducing continental over-production (the model calls ~56% of crust continental vs Earth ~40%) is a
  *secondary* lever (cleaner coast/ocean line) but does not make land *emerge* on shelves — resolution does.
- No author-facing output knob; physical formation levers only (Principle 3).

---

## 7. Decisions (resolved)

- **Acceptance model — RESOLVED.** Not single pass-numbers but a **two-layer framework** (§8): per-map
  physical *envelopes* (Layer 1) + cross-map *relational* checks (Layer 2), both over a seed ensemble,
  neither enforcing a template. Replaces the old "set exact coast/ocean/microcontinent numbers" plan.
- **History (over-split) — RESOLVED.** Confirmed in code: `cellsPerPlate` does **not** over-split plates
  (`compute-plate-graph:340` seeds exactly `plateCount`); the real fine-resolution risk is **speckle**,
  coupled to coarseness via per-tile noise in `compute-base-topography` (§9). The archived
  `voronoi-plate-generation.outline.md` is consistent (cell-level plate physics; no resolution-coherence note).
- **Resolution approach — RESOLVED.** Finer crust at fixed plate count, bounded to ~3–6 tiles/cell, with
  cosmetic per-tile noise stripped; projection cost is trivial in that range (§9).
- **Knob set — RESOLVED (§11).** Confirmed pair: continental **buoyancy bias** + **sea shallowness**;
  strong orthogonal third **continental abundance** (`continentalFraction`); **fragmentation /
  archipelago-ness** rides with the §10 content work (it couples near the waterline).
- **Sequencing — RESOLVED: resolution-first.** Land the acceptance harness (R1–R6) + the bounded
  finer-crust + anti-speckle slice first, measure on earthlike HUGE/10, and let R1–R6 decide whether the
  §10 down/lateral content work is needed. The §10 work is a measurement-gated fast-follow, not bundled.

---

## 8. Acceptance framework (two layers)

Acceptance is **two complementary layers**. Neither alone suffices. Both are **envelopes over a seed
ensemble**, never single-map point targets, and neither may enforce a physical template (no "must have a
supercontinent", no "must have N microcontinents"). All metrics are computable from existing tile fields
(`foundationCrustTiles.type`, `morphology.topography.{elevation,seaLevel}`, `.bathymetry`,
`morphology.shelf.shelfMask`, `morphology.landmasses`) — see the field inventory; this is mostly *wiring*,
not new instrumentation. Measure on the **ToT config (swooper-earthlike), HUGE, 10 players**, live in-game
(deploy from the studio worktree pinned to the stack tip) + harness dump at 106×66; report before/after.

### Layer 1 — per-map physical-envelope metrics
Each archetype gets its **own** profile (never shared). Profiles are **probability envelopes (ranges)**
from physical expectation, NOT tuned down to current output. Earthlike is anchored to real-Earth structure;
archipelago/ring get their own anchored envelopes; the rest looser.
- Metrics are **distributional/shape** (bimodality, mode separation, spread), not point ratios, so they
  don't penalize natural emergence. Any metric sensitive to luck-of-the-draw tectonics gets **wide bands**,
  judged over the *ensemble* (fails only if the ensemble leaves the band, not a single seed).
- Earthlike anchor (illustrative, to ratify): land fraction within a band of the config target;
  **hypsometry bimodal** (continental-platform mode + deep-ocean mode, separated, trough at the waterline);
  submerged-continental crust a **minority** of water; deep-ocean median depth ≫ shelf median.

### Layer 2 — cross-map relational checks (the atomic relationships)
The more meaningful layer: measurable, template-free, **symmetric** relationships that say the crust is
physically coherent and naturally varied.

- **R1 — Bidirectional relief within continental crust (symmetry).** Over continental-crust tiles,
  `(elevation − seaLevel)` has **non-trivial spread AND mass on both sides of 0**: some continental crust
  emerges, some sits drowned/lowland, and emerged land has internal relief (not a flat plateau). Evaluate
  the same statistic down-from-land and up-from-shelf. (Encodes the symmetry requirement: relief varies
  *both* ways — not only shelves rising, but land also subsiding into lowlands.)
- **R2 — Coast/ocean bimodality.** Water bathymetry is bimodal: shallow shelf at margins + a genuinely
  deep abyssal population, deep-mode ≫ shelf-mode, shelf does **not** dominate total water. Kills the
  "flat shelf tub at the waterline" pathology.
- **R3 — Shelf belongs to land (continental coherence).** Shelves are **margins of emerged landmasses**,
  not orphan shallows over fully-drowned continental crust. Substantial continental-crust components have
  **both** an emerged core **and** a shelf rim. Kills "vast drowned platform with nothing on it."
- **R4 — Non-degenerate size spectrum.** The landmass size distribution **populates the middle**
  (intermediate islands/microcontinents exist), not just "few huge + many 1–2-tile specks." Framed as
  "the middle of the spectrum is non-empty," NOT "there must be N microcontinents." Measure via
  `morphology.landmasses` — ideally with downstream **island injection turned down** (`islandChains`), so
  we measure crust, not the injector.
- **R5 — Knob monotonicity (composability).** Sweeping a physical knob (§11) shifts the aggregate
  character **monotonically and predictably** while R1–R4 keep holding. Pass = "the knob does what it
  says," not "a sweep point hits a shape."
- **R6 — Cross-seed envelope.** R1–R4 hold across a seed ensemble per config (character robust to RNG
  even though geography differs).

**Overall pass** = Layer-1 envelopes hold over the ensemble for each archetype AND Layer-2 R1–R6 hold —
emergent from crust history, **cosmetic relief OFF**, across seeds and across archetypes (earthlike,
sundered-archipelago, shattered-ring, desert-mountains). Renders (`tools/ascii-map.mjs`,
`tools/render-png.mjs`) remain the human cross-check, not the gate.

---

## 9. Resolution + anti-speckle plan (DECIDED)

**Finer crust at fixed plate count, bounded, with the coarseness-dependent cosmetic noise stripped.**

- **No over-split.** `compute-mesh:15` → `cellCount = plateCount × cellsPerPlate`; `compute-plate-graph:340`
  seeds **exactly** `plateCount` plates regardless of cell count. Raising `cellsPerPlate` adds cells *per
  plate* (finer crust + finer boundary arcs = less-blocky belts), same plate count. Over-split is a
  `plateCount`-only risk.
- **Bounded, not tile-fine.** Target ~3–6 tiles/cell (earthlike ~19 → cellsPerPlate ~40–60), **not 1**.
  Projection is O(tiles×cells); at ~1–2k cells that's ~10–14M nearest-cell tests/map — trivial. A spatial
  index is only needed near tile resolution (~49M).
- **Anti-speckle — the decisive constraint.** The pipeline is *coupled to coarseness*: per-tile white
  noise in `compute-base-topography` (`crustNoiseAmplitude`, `arcNoiseWeight`,
  `default.ts:36`/`rules:79`) relies on ~19 tiles/cell to act as sub-cell smoothing; at fine scale it
  flips marginal-buoyancy tiles into salt-and-pepper. **Remove/curtail that cosmetic noise** — the finer
  *emergent* crust now carries sub-cell structure. Spatial coherence (no speckle) comes from the
  crust-evolution operators being spatially coherent (cratonization, boundary-following orogeny, thermal
  subsidence), not from any added fractal. Net: *fewer* cosmetic mechanisms — aligned with Principle 1.
- **Interpolation = complement only.** Optional light anti-seam smoothing of the mesh→tile projection;
  never the relief source (a smooth ramp gives graded slopes, not discrete islands).
- **Reject:** tile-fine grid (speckle); interpolation-only (no discrete islands); raising `plateCount`.

## 10. Tectonic-content (down/lateral relief) — adjacent workstream

Honest finding: plate motion is **kinematic but internally coherent** — mantle forcing is seeded
(Poisson-disk plumes in `compute-mantle-potential`; plate velocities are least-squares fits in
`compute-plate-motion`), but boundary *type* is correctly derived from relative motion
(`compute-tectonic-segments`), orogeny tracks convergence, and crust responds via maturity/thickness →
buoyancy. The **up (uplift) pathway is strong; the down/lateral pathway (subsidence, rifting,
fragmentation) is weak** and only loosely coupled to tectonics.

Consequence: the §9 resolution fix gives crisper coast/ocean and lets richer crust express, but **R1
(down-variation) and R4 (intermediate landmasses) may need the crust model to *generate* more
intra-continental heterogeneity** — passive-margin thinning, failed rifts, thermal sag — to pass by
*emergence* rather than by the injector.

- **Out of scope (explicitly):** a full physical mantle-convection solver. The seeded-but-coherent model
  is fine for a game; rebuilding it is over-engineering and violates "no output knobs / stay emergent but
  proportionate."
- **The adjacent candidate:** *targeted* coupling of the down/lateral pathway to existing tectonic fields
  (divergence/rift → continental thinning → fragmentation + sag), reusing the unified model.
- **Sequence:** land the §9 resolution + anti-speckle slice **first**, then *measure* R1–R6 — the numbers
  decide whether §10 is needed, instead of guessing. Fragmentation / archipelago-ness (§11) is a natural
  output of this pathway.

## 11. Knobs (physical formation levers)

Global formation levers; none is a per-region depth or an output target (Principle 3).
- **Continental buoyancy bias** — how high continental crust rides → emerged area / drowned fraction.
- **Sea shallowness** — shelf/margin depth → how shallow & wide seas read (defined as a *formation* lever
  — shelf-break depth / margin flexure — decoupled from the sea-level datum and from buoyancy).
- **Continental abundance** (`continentalFraction`) — how much crust is continental at all (more/larger
  vs fewer continents). Orthogonal to buoyancy's "how high."
- **Fragmentation / archipelago-ness** — continental crust breaking into intermediate landmasses; moves
  R4. **Partially couples** to buoyancy near the waterline, so it rides with the §10 content pathway,
  where it falls out of rift/thinning naturally rather than as a standalone knob.
