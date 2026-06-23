# Crust relief — working reference frame (normative)

> Canonical, forward-looking frame for the Foundation crust-relief work. Companion: the original
> brief [`FOUNDATION-CRUST-RELIEF.md`](./FOUNDATION-CRUST-RELIEF.md) and the harness in [`tools/`](./tools).
> Session log + raw measurements live in `WORKSTREAM.md` (historical).
>
> **Status:** root cause is structural — crust→tile **resolution/projection** (§2). The crust-buoyancy
> reshape already landed (§5) is the right substrate but is per-cell, so it cannot resolve a per-cell
> defect. Acceptance (§8) is unmet until the resolution is addressed.
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

The crust evolution must express relief finer than ~19-tile Voronoi blocks. The plate **dynamics** want
to stay coarse (plate motion/boundaries are fine at `plateCount` plates); the crust **relief** must get
finer. Decision criterion: *yield sub-cell relief without destabilizing coarse plate dynamics.*

- **Preferred — finer crust resolution at fixed plate count.** Raise `cellsPerPlate` (or evolve crust
  on a derived finer grid). Verified-critical distinction: the plate partition seeds **exactly**
  `plateCount` plates (`compute-plate-graph`), so raising `cellsPerPlate` gives more cells *per plate*
  and **does not change the plate count or over-split plates**. It makes crust + tectonic fields finer
  while plate tectonics stay coarse — directly serving Principle 2. Open design costs: (i) the
  projection is O(tiles × cells) — at ~per-tile resolution ≈ 49M nearest-cell tests/map; needs a
  spatial index or a cheaper assignment; (ii) confirm the per-cell crust/tectonic dynamics produce good
  *fine* structure (not just a finer copy of the same blobs).
- **Avoid for this purpose — raising `plateCount`.** That changes the number of plates and is the
  lever that can **over-split** (the reported prior failure mode — confirm in §7). It is a plate-
  dynamics knob, not the crust-resolution knob.
- **Complement only — interpolate the projection** (smooth crust field vs nearest-cell copy). Cheap,
  but a smooth ramp yields graded slopes, not discrete emergent islands → fails Principle 1 as a
  standalone fix. At most a smoothing complement to finer resolution.

Author **knobs** (Principle 3) attach to whatever resolution/formation parameters this introduces.

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

## 7. Open questions / decisions

- **Acceptance thresholds (blocking decision — see §8):** exact pass numbers for coast/ocean %,
  microcontinent count, and submerged-continental % are not yet set. Decide them with the user before
  implementing, so "pass" is not qualitative.
- **History:** was a finer/granular crust accumulation lowered to coarse cells because **plates
  over-split**? That failure mode attaches to `plateCount`, not `cellsPerPlate` — confirm before
  designing §4 (doc: `docs/projects/engine-refactor-v1/resources/slides/_archive/voronoi-plate-generation.outline.md`).
- **Resolution approach:** how fine, and how to pay the O(tiles×cells) projection cost.
- **Knob set:** which physical levers to expose (buoyancy bias, sea shallowness, archipelago-ness, crust
  resolution).

---

## 8. Verification protocol + acceptance

Generate on the **ToT config (swooper-earthlike), HUGE, 10 players**, live in-game (deploy from the
studio worktree pinned to the stack tip), plus the harness dump at 106×66. Report **before vs after**,
all directional targets to be ratified in §7:

- **coast-tile % and ocean-tile %** of the map — coast/shelf **down** from ~45%; open ocean **up** from
  ~17% (`tools/drowned.mjs`).
- **microcontinent count (13–60 tiles)** and island chains — **up from 0** to a ratified floor
  (connected-component landmass labeling — add/keep a small histogram tool; the §1 figure came from a
  flood-fill over `landMask`, not from drowned/hypso/agecorr).
- **submerged-continental %** and submerged bathymetry — drowned fraction **down** from ~33% and/or the
  submerged crust genuinely deep, not flat at the waterline (`tools/drowned.mjs`).
- whole-map + cross-section renders (`tools/ascii-map.mjs`, `tools/render-png.mjs`).

**Pass** = land emerges on former platforms (microcontinents/archipelagos appear), coast/ocean reads
crisp, emergent from crust history (no cosmetic relief, no output-tuned constant), holding across
seeds and across the map archetypes (earthlike, sundered-archipelago, shattered-ring, desert-mountains).
