# Coastal Shelf Tiling — Framing & Investigation (working doc)

> Status: **active investigation**. This is the preparatory working document for the
> coastal-tile-placement workstream. It carries the route, frame, investigation brief,
> evidence ledger, and current understanding. It is kept current as the loop runs.
> Closure artifacts (expectation ledger, phase record, slices) branch off this.

Workstream skill: `civ7-mapgen-workstream` · Loop arm: **Behavioral / generation-logic**
· Grounding config: `latest_juicy` (`mods/mod-swooper-maps/src/maps/configs/latest-juicy.config.json`)
· Worktree: `wt-agent-coast-coastal-tiling-frame` (off `main`) · gt parent: `main`

---

## 0. Intake & route

- **Request (user's words):** Coastal tiles are placed "too naively: roughly uniform
  expansion around land out to a fixed distance, regardless of physical context… ignores
  or underuses the shelf mask… does not feel natural." Trace the whole coastal-determination
  path; design + implement a physically-grounded coast placement; verify live in Civ7.
- **Arm:** Behavioral (physical realism of generated terrain). **Problem class:** generation-logic.
- **Lead facets:** facet-physics (continental-margin shelf physics), facet-verification
  (Earth-like ledger + live gate), facet-civ7-domain (coast → start/resource/reef legality).
- **Prior art (directly relevant):** `docs/projects/coasts-by-erosion/` (Option D margin-aware
  shelf design) and commit `621658f3c` (coast drift-at-boundary fix). This workstream is the
  **completion/repair** of that work: the physics was built but is currently defeated.

---

## 1. Frame

**Hard core (load-bearing commitments):**
- Coast (`TERRAIN_COAST`) is the **continental shelf** — shallow, nearshore, neritic water —
  not "any water within a fixed distance of land." Its width is a *physical output*
  (bathymetry + tectonic margin type), not a global constant.
- MapGen **owns** the coast/ocean split deterministically (engine `expandCoasts` is neutralized;
  `restoreProjectedCoastTerrain` re-asserts the declared `waterClass`). So coast shape is ours
  to define, not the engine's to impose.
- The map serves the player: coast must remain **Civ-playable** — every land tile keeps a coast
  ring, marine resources/reefs have adequate eligible water, island/mainland relationships and
  start legality hold.

**Selection / salience:**
- **In / foreground:** the coast *projection* (`map-morphology/plot-coasts`), the coast *policy*
  (`@civ7/map-policy` coast-classification), the *shelf* truth (`compute-shelf-mask` +
  `compute-coastline-metrics`), and the `latest_juicy` config knobs that drive them.
- **Exterior (out of scope this workstream):** landmass/continent shaping, sea-level %, erosion
  model, river/lake projection, biome classification. We consume their truth; we do not retune them.
  (Bathymetry quality is upstream — flagged only if it proves to be the limiting signal.)

**Falsifier (what forces a reframe):** If empirical dumps show the final coast is *already*
shelf-driven with real margin variation (i.e. the uniform-band hypothesis is wrong), or if removing
the uniform band cannot satisfy Civ7 marine-resource/coast-ring adequacy, the "uniform band defeats
physics" frame is wrong and we reframe toward the shelf *generator* (bathymetry/sea-level) instead.

**Structural alternative considered (and why not chosen as the frame):** Treat this as a *bathymetry*
problem (the shelf is weak because the upstream surface lacks a real shelf break) and fix it in
`compute-geomorphic-cycle` / `compute-sea-level`. Rejected as the *primary* frame because the shelf
op already encodes margin-aware depth-gated structure; evidence points at it being **flattened by
config and overridden by a uniform band downstream**, not absent upstream. Held as the falsifier branch.

---

## 2. Investigation brief (rail = codebase deep dive + diagnostic dump)

**Primary questions:**
1. What actually determines a tile's final `TERRAIN_COAST` vs `TERRAIN_OCEAN` classification, end to end?
2. Where, if anywhere, is the shelf mask's physical structure lost?
3. Is the "uniform fixed-distance" behavior a config problem, a wrong/missing strategy, an
   implementation issue, stale/duplicated logic, or a structural mismatch? (The prompt's taxonomy.)

**Secondary:** How does `latest_juicy` configure the shelf/coast? What does the engine require
(no-water-drift)? What downstream gameplay depends on coast (starts, marine resources, reefs)?

**Exclusion (preserve exterior):** not retuning landmass/sea-level/erosion; not redesigning the
Studio viz; not touching unrelated placement logic.

**Evidence policy:** Live source is authoritative for code/path/schema claims (re-read, don't trust
docs). Behavioral claims require a `diag:dump` runId + measured counts, not a screenshot. Closure
requires the live in-game gate (`studio-run-in-game-live`).

**Stop conditions:** stop analysis when (a) the full coast-determination chain is traced with
file:line evidence, AND (b) empirical dumps quantify how much of the coast is shelf-derived vs
uniform-band, AND (c) the no-water-drift / engine-ownership question is settled.

---

## 3. Findings — the coast-determination chain (traced, file:line)

**The pipeline (truth → projection):**
1. `compute-shelf-mask` (`domain/morphology/ops/compute-shelf-mask/strategies/default.ts`) —
   **genuine physics.** Per water tile: active margin (convergent/transform + boundaryCloseness ≥
   threshold) → `capActive`; else passive → `capPassive`. Tile is shelf iff `dist ≤ cap` AND
   `bathymetry ≥ shallowCutoff` (a nearshore-bathymetry quantile). Margin-aware + depth-gated.
2. `compute-coastline-metrics` (`…/compute-coastline-metrics/strategies/default.ts`) — produces
   `coastalLand`, `coastalWater` (1-ring), `coastMask` (rugged bays/fjords). Does **not** itself
   produce `shelfMask`.
3. `morphology-coasts/steps/ruggedCoasts.ts` assembles the `coastlineMetrics` artifact, calling the
   shelf-mask op and packing `shelfMask` + `distanceToCoast` alongside the coastline metrics.
4. `map-morphology/steps/plotCoasts.ts` (the projection / stamp):
   - `sourceCoastMask[i] = water && (coastalWater[i]==1 || shelfMask[i]==1)` — shelf truth + 1-ring. ✅
   - **THEN** `applyCiv7CoastClassificationPolicy({ waterClass: base })` adds a uniform band. ⚠️
   - THEN land-adjacent coast-ring promotion (heals islands / late land). ✅ (minimal, legit)
   - Publishes `coastClassification {baseWaterClass, sourceCoastMask, waterClass, policyCoastMask}`;
     stamps engine terrain from `waterClass`.
5. `restoreProjectedCoastTerrain` (`projection-policies/coastProjectionParity.ts`) re-asserts
   `waterClass` after engine maintenance at **3 boundaries**: `plotContinents` (map-morphology),
   `plotRivers` (map-rivers), `prepare-placement-surface` (placement). → MapGen owns coast pipeline-wide.

**The policy (`@civ7/map-policy/src/coast-classification.ts`):**
`applyCiv7CoastClassificationPolicy` seeds from existing COAST tiles, BFS hex-distance, and promotes
**every** ocean tile with `0 < distance ≤ coastBufferTiles` to coast. `coastBufferTiles =
mapGlobals.oceanWaterColumns ?? 4`. This is a **uniform fixed-distance band**.

### Root-cause chain (the "naive uniform coast")
- **RC1 — Config footgun (latest_juicy):** `shelf.capTilesMax: 1` while `capTilesActive: 3,
  capTilesPassive: 4`. The shelf cap is **double-clamped** to `capTilesMax`: once in
  `ruggedCoasts.ts` normalize (`min(capTilesMax, round(cap×shelfMultiplier))`, lines ~176–189) and
  again in the strategy (`clampInt(capActive,0,capMax)`). With `capTilesMax:1`, both caps → **1**,
  and the `shelfWidth: "wide"` knob (`shelfMultiplier>1`) is silently defeated. → shelf collapses to
  a degenerate ~1-tile depth-gated ring with **zero margin variation**.
- **RC2 — Structural override (all configs):** the uniform `coastBufferTiles` band (default 4)
  promotes every ocean within 4 hex of coast → coast. This **subsumes/dominates** the shelf; the
  shelf physics is computed and dumped to viz but does not drive the final `waterClass`.
- **RC3 — Misappropriated constant / indirection:** `coastBufferTiles` is sourced from
  `mapGlobals.oceanWaterColumns` — the **map-edge forced-ocean column count** — which has no relation
  to coast width or to actual engine coast behavior (`expandCoasts` is neutralized; the mod's map
  class overrides it and the projection test asserts it's never called). It is a "4 looks fine"
  coincidence dressed as Civ7 policy.
- **RC4 — Design regression vs accepted prior art:** `coasts-by-erosion/REPORT.md` accepted Option D
  ("shelfMask → COAST, **no engine helpers, no uniform band**"). The shipped projection contradicts
  it; the uniform band was layered on later (≈ the 621658f3c coast-ring/drift work), defeating the
  physics that was deliberately built.

**Verdict on the prompt's taxonomy:** it is a *combination* — primarily a **structural mismatch**
(RC2/RC4: a uniform band overriding shelf truth) compounded by a **config footgun** (RC1) and
**stale/misappropriated indirection** (RC3). It is *not* missing physics: the shelf op is good.

---

## 4. Target design (physics-first) — provisional, pending step-5 gate

**Coast = continental shelf (margin-aware, depth-gated) ∪ guaranteed 1-tile coastal ring. Deep water elsewhere.**

- Make the **shelf mask the coast driver** (it already is the `sourceCoastMask` input) and stop
  overriding it with a uniform distance band.
- **Fix RC1:** make `capTilesMax` a sane hard ceiling (not a flattener); reconcile the `shelfWidth`
  knob; correct `latest_juicy` so margin-aware caps actually apply (Atlantic-broad vs Pacific-narrow).
- **Fix RC2/RC3:** retire the uniform `coastBufferTiles` band; replace with a minimal, named coast
  policy primitive — **"every land tile has ≥1 coast ring"** (the land-adjacent ring already exists
  inline; promote it to the policy adapter `@civ7/map-policy` and delete the distance-band + the
  `oceanWaterColumns` misappropriation).
- Keep `restoreProjectedCoastTerrain` (the structural locus that makes coast MapGen-owned).

**Gameplay invariants to preserve (verify, don't assume):** coast ring on every land tile; adequate
coast for marine resources & reefs; island/mainland connectivity & island starts
(`maxIslandStartCoastDistance: 8`); start legality; **no water drift**.

**Structural alternative for the design (step 5 will record ≥1 rejected):** keep the policy band but
clamp it to the shelf (band ∩ shelf) — rejected-leaning because it keeps the misappropriated constant
and the indirection; the cleaner move is shelf-owns-coast + minimal ring guarantee.

---

## 5. Evidence ledger (append as gathered)

| Date | Claim | Evidence | Class |
|---|---|---|---|
| 2026-06-20 | Shelf op is margin-aware + depth-gated | `compute-shelf-mask/strategies/default.ts:25-108` | source-read |
| 2026-06-20 | Uniform band promotes ocean within `coastBufferTiles` | `coast-classification.ts:45-106` | source-read |
| 2026-06-20 | `coastBufferTiles` = `oceanWaterColumns ?? 4` | `coast-classification.ts:29-36` | source-read |
| 2026-06-20 | latest_juicy `capTilesMax:1` flattens caps; double-clamp | `latest-juicy.config.json:154-161`, `ruggedCoasts.ts:170-192`, `compute-shelf-mask/strategies/default.ts:47-49` | source-read |
| 2026-06-20 | engine `expandCoasts` neutralized; MapGen owns coast | `plot-coasts.test.ts:83-84`; restore at 3 boundaries | source-read |
| 2026-06-20 | Prior art chose Option D (no uniform band) | `coasts-by-erosion/REPORT.md:63-90,143-148` | source-read |
| 2026-06-20 | latest_juicy: **70.7%** of coast (1834/2594) is policy-band-only; only **18.5%** (480) shelf-derived; `capTilesByTile` flat=1; `shallowCutoff`=0m | diag:dump runId `1f0df895…` (106×66 s1337) | generated |
| 2026-06-20 | swooper-earthlike: shelf machinery works (caps {5,13}, cutoff −12m, 52% shelf-derived) when `capTilesMax:14` | diag:dump runId `a856e371…` | generated |
| 2026-06-20 | `applyCiv7CoastClassificationPolicy` called in 2 prod sites: `plotCoasts.ts` + `ecology-features/score-layers` (duplicate) | structural lane | source-read |
| 2026-06-20 | `policyCoastMask` is viz/diagnostics/test-only (no gameplay consumer) → safe to retire | structural lane | source-read |
| 2026-06-20 | `shelfMask` widely consumed (reefs, ocean-geometry/thermal, resources, starts, climate) → load-bearing; coast should align to it | structural lane | source-read |
| 2026-06-20 | `capTilesMax` double-clamp footgun invisible to tests (they use capTilesMax:8) | structural lane | source-read |
