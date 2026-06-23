# Crust relief — working reference frame (normative)

> Canonical, forward-looking frame for the Foundation crust-relief work. Companion: the original
> brief [`FOUNDATION-CRUST-RELIEF.md`](./FOUNDATION-CRUST-RELIEF.md) and the harness in [`tools/`](./tools).
> Session log + raw measurements live in `WORKSTREAM.md` (historical).
>
> **Status — CORRECTED (Juicy counterexample, §2.1):** the lead root cause is **CONTENT, not
> resolution**. The buoyancy field is smooth and low-frequency from its mantle source, with a unimodal
> lump of mass near the waterline → contiguous crust crosses sea level as flat shelves. Finer cells only
> sample the same smooth field more finely (a finer tiling of a flat shelf is still a flat shelf).
> Verified: swooper-earthlike and latest-juicy have **identical** `cellsPerPlate = 13` (the "~26" is
> false) and differ only in `plateActivity` (0.85 vs 0.5) — Juicy cranks tectonic *intensity* and still
> drowns. So neither the resolution knob nor the intensity knob reshapes the distribution; only a new
> emergent **content** mechanism does (§10 is now the lead, not adjacent). Resolution (§9) is a *modest
> enabler* — `cellsPerPlate ~3–5` once content exists; finer just makes speckle. Acceptance is the
> **two-layer framework** (§8). The crust-buoyancy reshape already landed (§5) is correct substrate.
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

## 2.1 Re-adjudication — CONTENT is the lead cause, resolution is a secondary enabler (VERIFIED)

§2's "resolution/projection" framing was **half the story and the wrong half to lead with**. Adversarially
re-verified against the code and the Juicy counterexample:

- **The buoyancy field is smooth and low-frequency by construction.** `buoyancy.ts:91` —
  `0.32 + 0.45·maturity + 0.25·thickness − subsidence` — is linear in inputs that are themselves smooth:
  the mantle potential is a sum of ~24 Gaussian plumes/downwellings, normalized and Laplacian-smoothed
  (`compute-mantle-potential/index.ts:104-217`); maturity/thickness integrate exponentially-decayed
  tectonic emissions per cell with **no** independent fine-scale variance (`compute-crust-evolution:106-150`).
  Finest structure ≈ 10–20 cells. `buoyancy.ts:69-73`: "the SHAPE of this function's output distribution
  IS the hypsometry."
- **Smooth + unimodal mass near the waterline ⇒ flat shelves.** A large fraction of continental buoyancy
  sits in a narrow band (~0.3–0.6) around the sea-level crossing (~0.58), so contiguous regions cross the
  waterline **together** as flat blocks. The only fine variance in the chain is per-tile **white noise**
  in base-topography (`crustNoiseAmplitude=0.1`, `arcNoiseWeight=0.2`) — incoherent → speckle, not islands.
- **The Juicy counterexample is decisive.** swooper-earthlike and latest-juicy have **identical**
  `cellsPerPlate = 13` (both `…config.json:12`; the "~26" claim is false). They differ only in
  `plateActivity` (0.85 vs 0.5). Juicy cranks tectonic *intensity* and **still drowns**. So neither the
  resolution knob nor the intensity knob touches the smooth unimodal *distribution shape* — and a finer
  tiling of a smooth field is still a flat shelf. "The real lever is SOURCE VARIANCE, not SINK RESOLUTION."
- **Conceptual conflation (the deep cause).** `project-plates.ts` copying crust verbatim is the *symptom*
  of crust **relief** being computed on, and bound to, the **plate/mantle mesh** — so it inherits that
  simulation's smoothness *and* its coarseness. Relief has no generating process of its own. The clean
  decomposition gives crust relief its own structure-making step (cratonic-keel patchiness, rift basins,
  passive-margin thinning) that *creates* coherent few-tile variance, decoupled from the smooth mantle
  field. This is why content and resolution were tangled — one shared root.

**Corrected order:** content-led (§10, now the lead), resolution as a *modest* enabler (§9): once content
has coherent few-tile structure, `cellsPerPlate ~3–5` expresses it; finer only adds speckle/truncation
artifacts. Even an agent tasked with *defending* resolution concluded content is primary.

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

> **Corrected by §2.1:** the lead is **content** (§10) — make the crust-evolution/buoyancy field carry
> coherent fine-scale variance (cratonic-keel patchiness, rift basins, margin thinning) so its
> distribution stops being a smooth lump at the waterline. Resolution below is the *enabler* that lets
> that content reach tiles — necessary but secondary, and only modestly (`cellsPerPlate ~3–5`).

The crust **relief** must (a) *have* fine structure to express (§10, content — the lead) and (b) be
sampled finely enough to express it (below, resolution — the enabler). The plate **dynamics** stay coarse
(motion/boundaries are fine at `plateCount` plates). Resolution criterion: *express the new content
without destabilizing coarse plate dynamics — and without speckle.*

**Resolution (enabler) — finer crust at fixed plate count, bounded, with cosmetic noise stripped.**
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
- **Sequencing — CORRECTED to content-led (§2.1).** The Juicy counterexample already ran the
  "resolution/intensity alone" experiment and it still drowns, so resolution-first would burn a cycle to
  rediscover that. Lead with the §10 **content** mechanism (coherent fine-scale buoyancy variance) +
  the acceptance harness (R1–R6); bring resolution (§9) along as the modest enabler needed to express it.
  Open: which content mechanism(s) and how much of §9 rides with the first slice (see §10).

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

## 9. Resolution + anti-speckle plan (ENABLER — secondary to §10 content)

**Finer crust at fixed plate count, bounded, with the coarseness-dependent cosmetic noise stripped.**

> **Resolution sets the *minimum feature size*, not whether features exist.** It only matters once §10
> content gives cells differentiated buoyancy. Critically: at the current ~19 tiles/cell, a differentiated
> cell already yields a **~13–60-tile** body — i.e. current resolution may already support **microcontinents**
> (§8 R4) once content varies cell-to-cell. Finer cells (below) are needed only for **sub-microcontinent
> archipelagos**. So resolution may *not* be in the first slice at all.

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

## 10. Content — coherent fine-scale buoyancy variance (THE LEAD)

The lead fix (§2.1): give the continental crust field **coherent, few-tile-scale buoyancy variance**, so
its distribution stops being a smooth lump at the waterline. This is lateral differentiation (some
continental crust thinned toward oceanic, some consolidated into buoyant keels) *and* the down pathway
(rift basins, thermal sag) — both emergent from crust history, never painted on. It subsumes the old
"down/lateral relief" framing and is no longer adjacent/deferred.

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
  is fine for a game; rebuilding it is over-engineering and violates "stay emergent but proportionate."
- **The mechanism (candidates, to choose):** add coherent fine-scale variance to maturity/thickness (hence
  buoyancy) emergent from crust history — e.g. (a) cratonic-keel patchiness (differentiation that does NOT
  consolidate uniformly), (b) rift basins / failed rifts (coherent multi-cell thinning + subsidence),
  (c) passive-margin stretching (continental crust thinned toward oceanic at trailing edges). All reshape
  the buoyancy *distribution* away from a unimodal lump; fragmentation / archipelago-ness (§11) falls out.
- **Sequence (content-led):** the first slice is the acceptance harness (R1–R6, captures the smooth-lump
  baseline) + a chosen content mechanism on the existing mesh (chunky ~13–60-tile bodies are the expected,
  acceptable first result). Resolution (§9) is folded in **only** if/when sub-microcontinent archipelagos
  are wanted. Juicy already proved resolution/intensity-first is a dead end — no need to re-measure that.

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
