# Thread 2 — Layer (a) design: per-landmass shelf-break cutoff localization

> The "how." Empirical grounding: [ANALYSIS.md](./ANALYSIS.md). Decision + rejected layers:
> [FRAMING.md](./FRAMING.md). Pre-declared success bounds: [EXPECTATIONS.md](./EXPECTATIONS.md).
> Chosen by a 3-draft + 2-judge design panel (both judges 9/9 on draft A, "Voronoi + blend-to-global").

## 0. What changes (one sentence)

Replace the single **global** `shallowCutoff` quantile in `compute-shelf-mask` with a **per-water-tile
local cutoff field** derived from nearest-land-component (Voronoi) attribution, blended toward the global
cutoff for under-sampled components — self-contained in the op, **output shape unchanged**, gated by a
`localizeCutoff` flag for clean A/B + zero-risk rollback.

## 1. Mechanism (the chosen scheme)

The op already computes a global nearshore quantile (`shallowCutoff`). Keep that pass verbatim — it stays
the returned output, the trace-summary value, and the **blend anchor**. Add localization on top:

1. **Land components** — `collectMaskComponentsOddQ({ mask: landMask, width, height })` (existing
   `@mapgen/lib/grid/components.ts`); write each component's 1-based `id` into `landIdByTile: Int32Array`.
2. **Nearest-land Voronoi** — multi-source odd-Q BFS seeded from every land tile (dist 0,
   `nearestLand=landIdByTile[i]`), propagating the source's component id to every water tile. Port the
   harness's exact loop (`analyze-margin-contrast.ts` 174–201) **verbatim**, including land-tile **seeding
   order (index order)** so the op and harness break ties identically.
3. **Per-component nearshore buckets** — re-walk water tiles with `dist ∈ [1, sampleRadius]` (same predicate
   as the global pass), push `min(0, bathymetry[i])` into `compSamples.get(nearestLand[i])`.
4. **Per-component cutoff + blend** — for each component with `n` attributed samples:
   `rawQ = quantile(samples, shallowQuantile)`; `w = clamp01(n / localCutoffMinSamples)`;
   `effCut = min(0, w * rawQ + (1 − w) * shallowCutoff)`. Store in `effCutoffById`.
5. **Per-tile accessor** — `effCutoffByTile(i) = effCutoffById.get(nearestLand[i]) ?? shallowCutoff`. The
   `?? shallowCutoff` is an **explicit, tested terminal branch** (zero-sample component / no-land map), not
   an incidental coalesce (graft from B).
6. **Gate pass** — the *only* line that changes in the existing loop:
   `rawBreak = effCutoffByTile(i) * breakDepthScale * marginFactor` (was the scalar `shallowCutoff`).
   `clampInt16`, the `absoluteMaxShelfDepth` floor, `min(0, …)`, the depth gate, `shelfBreakDepthByTile`,
   the active/passive `marginFactor`, and the connectivity flood are **all unchanged**.

`localizeCutoff === false` ⇒ `effCutoffByTile` returns the scalar `shallowCutoff` and the op is
**byte-identical to today** (the A/B baseline + rollback path).

### Why blend, not window-fallback or hard-discard

- **Blend-to-global** degrades gracefully on **one code path**; the Voronoi label covers every tile, so
  there is never an unattributed region needing a window. A continent (n in the hundreds) gets `w=1` ⇒ full
  localization exactly where A2/A4 need it; a single-tile island dot (n ≈ 3–8) gets `w ≈ 0.13–0.33` ⇒
  ~70–87 % blended to global, neutralizing its unstable 0.6-quantile **without a hard discard** (no spatial
  seam at `n = floor`).
- The **[global, islandCutoff) invariant** for continents holds by construction: a full-weight continent
  cutoff is `rawQ` (≈ −5 juicy / −10.7 earthlike), strictly between global (≈ −8.8 / −14.2) and island
  (≈ −12.1 / −17.3) — measured 10/10 at baseline; the blend only pulls an under-sampled component **toward**
  global, never past it.

## 2. New config keys (in `ShelfMaskConfigSchema`, canonicalized in `normalize()`)

| key | type | default | range | normalize clamp | purpose |
|---|---|---|---|---|---|
| `localizeCutoff` | boolean | `true` | true/false | `config.localizeCutoff === false ? false : true` | master on/off; false ⇒ byte-identical global-cutoff op (A/B + rollback) |
| `localCutoffMinSamples` | integer | `24` | 1..4096 | `Math.max(1, Math.min(4096, Math.trunc(clampNonNegative(v, 24))))` | sample-count **floor**: components with ≥ this many attributed nearshore samples are fully localized; fewer ⇒ linear blend toward global |

Backward-compatible: configs omitting the keys get defaults via `normalize()`. **A frozen pre-Thread-2
baseline run must set `localizeCutoff: false` explicitly.**

## 3. Resolved open questions (EXPECTATIONS §6)

- **OQ3 — floor value + blend formula:** `localCutoffMinSamples = 24` (≈ 3 odd-Q frontage rings at
  `sampleRadius = 8`; the smallest pool whose `shallowQuantile=0.6` order statistic `floor(0.6·(n−1))` is
  stable to ±1 unit). **Provisional → SWEEP {16, 24, 40}** against the A3 [−5%,+10%] band in DEV before
  locking (config-only, no code change). Blend = linear ramp `w = clamp01(n/floor)`, convex combo to global.
  Reject floor=8 (trusts noisy island quantiles); reject weighting by land **area** (sample count is the
  direct measure of quantile stability, not area — a thin vs blob continent of equal area differ in frontage).
- **OQ2 — odd-Q vs engine odd-R:** **DEFER, do not co-fix in (a).** The op + harness + `components.ts` are
  all odd-Q; the engine is odd-R (differs by 1 of 6 neighbors). Co-fixing would alter Voronoi labels, sample
  membership, the depth-gate neighbor checks, AND the flood across the *entire* shelf — confounding the A2/A3/A4
  measurement — and would force the harness off the live odd-Q bins, breaking G6's 0/0/0. Documented as a
  deliberately-carried-forward correctness item, not a regression introduced here.
- **Harness fidelity (G6):** keep the harness an **independent replica** — it still solves `effScale` by
  brute-force fitting the live `breakdepth` bin (it cannot see the `shelfWidth` knob) but re-derives the
  per-component cutoff field with its **own** Voronoi+blend code (NOT an import of the op's function —
  rejected by all three drafts as tautological). 0/0/0 then requires three independent derivations to agree:
  the recomputed global quantile, the harness's own field, and the fitted scale.

## 4. Adversarial risks the design must beat (the two judge leader-rejections)

These are **load-bearing** — they convert "looks right" into measured-right:

1. **A4 injection-stability (residual coupling through Voronoi pool-membership).** Nearest-land Voronoi
   assigns each near-coast water tile to its *closest* land component. Injecting an island near a continent's
   coast **steals** near-coast water tiles into the new island's cell, changing the continent's attributed
   pool — a residual coupling **even though no island sample enters the continent's quantile**. Static-land
   G6=0/0/0 proves field-faithfulness but proves **nothing** about injection-stability.
   → **Resolution:** add an **island-injection counterfactual mode** to the harness (mutate `landMask` to
   inject N islands near a continent, recompute Voronoi + per-component field, measure continental-shelf
   delta). A4 passes iff that delta < 5 %. This is the headline A4-DECOUPLE test and is currently unproven.
2. **A3 redistribution must be MEASURED, not assumed.** Blend-to-global gives deep-basin micro-island dots a
   too-shallow gate ⇒ they lose their own deep island shelf ⇒ weakens redistribution-to-islands ⇒ total area
   could drift below the −5 % floor on island-heavy seeds (earthlike s451: 218/343 active tiles were size-1
   dots). → **Resolution:** report **per-seed island-shelf delta AND total-area delta** across all 10 runs;
   confirm total ∈ [−5%,+10%] specifically on island-heavy seeds. Keep B's **16-tile window estimator** as a
   pre-specified, **flag-gated contingency** (one extra config key) — if the sweep shows dots over-blending,
   the fix is a config switch for below-floor components, not a redesign.

## 5. Implementation gating discipline (do not trust any A-row until these hold)

- **Quantile bit-identity across 3 call sites** — op `computeQuantileCutoff(Int16Array,count,q)`, the op's
  new `number[]` overload, and harness `quantileCutoff(number[])` must be bit-identical (same ascending sort,
  `idx = floor(q·(n−1))`, `min(0, x ?? 0)`, and empty/n=1/ties behavior). **Pin with a unit equivalence
  test** — do not rely on inspection.
- **Harness `breakDiffFor` → per-component-FIELD fit** (sweep `effScale` only; `raw = localCutoffOf(i) ·
  effScale · marginFactor`). A scalar-cutoff fit can no longer hit 0 against the localized live bin.
- **1-based (op `collectMaskComponentsOddQ`) vs 0-based (harness `landId`) component ids** — harmless (ids
  are opaque keys; the compared quantity is the cutoff *field*) but must be called out; the BFS **seeding +
  scan order** must be identical so contested *shallow* tiles don't flip components between op and harness.
- **Op-edit + harness-edit land in the SAME commit** and re-validate **0/0/0 in 10/10** before any A-row.
- **G1-COASTRING** explicit re-check (no land tile loses its sole dist-1 coastal-water neighbor — mechanically
  the dist-1 ring is shallowest and clears any cutoff ≥ global, but assert it).
- **G4-MARINE** flag (out of (a)'s strict pass rule, but shelf is the marine substrate; the ~−25 % continental
  shrink goes to the `placement-metrics` re-check during DEV).

## 6. Predicted ledger (to be confirmed in DEV, ≥5 seeds × 2 configs)

| row | prediction | basis |
|---|---|---|
| A1 | HOLD (continentCutoff > islandCutoff ≥ 9/10) | baseline already 10/10 |
| A2 | DOWN, ~−25 % juicy / ~−14 % earthlike (∈ [−5%,−27%]) | M3 Voronoi counterfactual; re-confirmed live: s1337 −26.5 %, s451 −8.7 % |
| A3 | HOLD (∈ [−5%,+10%]), redistribution measured | re-confirmed live: s1337 total +0.05 %, s451 +3.4 % |
| A4 | DECOUPLE → 0 (Pearson ≤ 0.2 AND injection < 5 %) | **the headline test — injection mode must be added** |
| A5 | HOLD (graceful degrade; n=1-continent seeds pass on large per-component pool) | construction + s1337 baseline (continent n=1, w=1, no degeneracy) |

## 7. Output / blast radius

Output shape **identical** (no new bin): `shelfMask, activeMarginMask, depthGateMask,
nearshoreCandidateMask, shelfBreakDepthByTile, shallowCutoff`. `shallowCutoff` stays the global quantile;
the per-component field is internal and fully observable through the existing `shelfBreakDepthByTile`
(`morphology.shelf.breakDepth`) bin. `computeShelf.ts` (`validateShelf`, trace summary, viz dumps) and all
consumers are **untouched**. Net contract/step/viz delta: **two optional config keys**.
