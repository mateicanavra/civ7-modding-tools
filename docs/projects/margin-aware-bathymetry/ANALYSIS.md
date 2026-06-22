# Thread 2 — Analysis: margin contrast & shelf-break locality

> Empirical record for the ANALYSIS phase. All numbers are reproducible and were **adversarially
> re-derived** (see §5). Conclusions feed [FRAMING.md](./FRAMING.md) and [EXPECTATIONS.md](./EXPECTATIONS.md).

## 1. Question

Thread 1 closed the erosion question and handed Thread 2 a quantified lever: the single **global**
shelf-break cutoff couples island density to continental shelf width (~+400 tiles on latest-juicy).
The prior docs also claimed the active-narrow / passive-wide contrast was muted because the generated
bathymetry is "only weakly margin-correlated." This analysis asks, with numbers:

1. **How real and reliable is the margin-width contrast today?** (M1)
2. **Does the seafloor carry a margin signal — and in which direction?** (M2) — decides whether
   localizing the cutoff alone can ever produce contrast, or whether margin-aware seafloor depth is required.
3. **How non-local is the global cutoff, and what does localizing it do?** (M3)

## 2. Method (reproducible, self-validating)

- **Harness:** `mods/mod-swooper-maps/scripts/diag/analyze-margin-contrast.ts` — replays the real shelf
  physics (`compute-shelf-mask`) offline over a `diag:dump`, anchored on the live shelf-stage bins
  (`bathymetryInput`, `landmaskInput`, `distancetocoast`, `breakdepth`, `depthgatemask`,
  `shelfmask`, `activemarginmask`) plus the `morphology-belts` boundary signals.
- **Self-validation (every run):** the harness recovers the op's exact `(shallowCutoff, effScale)` by
  fitting against the live `breakdepth` bin and asserts three diffs are **0**: recomputed break depth
  vs live, offline flood vs live shelf, margin classification vs live. All 10 runs: **0 / 0 / 0**.
  (The recovered cutoff is the faithful op value — `cutoffOffsetFromRecompute = 0` in 10/10.)
- **Corpus:** `latest-juicy` and `swooper-earthlike`, Huge **106×66**, seeds **1337, 1018, 207, 99, 451**
  (10 runs). Per-run JSON + aggregate table in `dist/visualization/t2-results/` (gitignored).
- **Repro:**
  ```bash
  cd mods/mod-swooper-maps
  bun ./src/dev/diagnostics/run-standard-dump.ts -- 106 66 1337 --label t2 \
    --configFile "$PWD/src/maps/configs/latest-juicy.config.json"
  bun scripts/diag/analyze-margin-contrast.ts dist/visualization/t2/<runId> \
    "$PWD/src/maps/configs/latest-juicy.config.json"
  ```

## 3. Findings

### M1 — the width contrast is directionally reliable on continents, but compressed (and the naive metric lies)

- **On continents** (shelf tiles attributed to a land component ≥ 100 tiles — the honest population):
  active shelf is narrower than passive in **9/10 runs**. Mean active width 0.4–2.1 rings vs passive
  1.8–2.6; per-config continent-restricted mean ratio ≈ **2.3 (latest-juicy)** / **2.7 (earthlike)**.
- **The contrast is compressed/saturated, not wide.** Active continental shelf is frequently pinned at
  the **0–1 ring floor** (shore-clamped); the active median width is 0 or 1 across runs. The break-depth
  **lever works** (realized passive/active break-depth ratio is a clean 2.0–2.29 on all 10 runs, matching
  the designed 1.25/0.6 = 2.08) but its **reach into realized width is small** — it cannot widen a shelf
  the seafloor won't allow.
- **The "all-tiles" metric is artifact-prone — do not trust it.** Splitting *all* shelf tiles by margin
  gives a per-map-noisy ratio (0.81–3.40) because the active sample is tiny (n often < 100) and, on
  island-heavy seeds, is dominated by single-tile island "dots" whose ring distance is structurally
  inflated. The headline "earthlike s451 inverts to 0.81" is **a counting artifact**: 218 of 343 active
  shelf tiles there are size-1 island dots; restricted to continents s451 is **1.06 mean / 2.0 median**
  — not inverted at all. → Use the **continent-restricted, median-aware** metric (now in the harness).

### M2 — the seafloor carries a STRONG margin signal (refutes "weakly correlated"), but it is an orogenic-relief proxy that produces an inverted WIDTH consequence

- **Strong, robust signal.** Nearshore (rings 1..8) active-minus-passive bathymetry delta is
  **+11.5 units mean [+8.5..+13.2], positive in 10/10 runs**; boundary-closeness↔depth Pearson
  **+0.29 [+0.20..+0.45], positive in 10/10**, with a monotonic ladder (low closeness ≈ −13.6 →
  high closeness ≈ −0.3). It **survives island removal** (continent-only delta +9.6 to +10.7). So the
  prior "**only weakly margin-correlated**" premise is **empirically false** on the strength dimension.
- **Direction: active nearshore is SHALLOW (median 0/−1), passive DEEP (~−13).** Mechanism:
  `bathymetry = min(0, elevation − seaLevel)`, so it is an **orogenic-relief proxy** — high-relief
  convergent/transform (active) coasts push the adjacent water shallow; passive coasts stay deep
  (≈ the baseline seafloor). Active is the *special elevated case*, passive is just *typical seafloor*.
- **Precise statement (scrutiny correction): "inverted *width consequence*," not "inverted seafloor."**
  Real active margins *are* shallow at a high-relief coast and the data shows active bathymetry *does*
  deepen offshore (thinly sampled). What is genuinely backwards is the **shelf-width outcome**: shallow
  active nearshore water clears the depth gate over *more* rings → the lever wants narrow active shelves,
  the seafloor pushes them wider. No cutoff trick can manufacture true Pacific-narrow/Atlantic-wide
  contrast against a seafloor whose depth signal runs counter to margin steepness. **This is the case for
  layer (b).**

### M3 — the global cutoff couples island density to continental shelf width; localizing per-landmass retires it

- **Coupling confirmed, robust.** Per-landmass cutoffs reveal a systematic ordering
  **continentCutoff > globalCutoff > islandCutoff** (shallower → deeper) in **10/10 runs**
  (latest-juicy −5 / −9 / −12; earthlike −11 / −14 / −17). Islands sit in deeper seas and **drag the
  single global quantile deep**, so continents inherit a deeper-than-warranted gate and gain shelf — the
  Thread-1 +400 coupling, from the other direction. The global cutoff varies enormously in space: ~85–95%
  of 16-tile windows differ from it by ≥1 step.
- **Localizing shrinks continental shelf in 10/10**, magnitude **method- and config-dependent**:
  per-landmass Voronoi ≈ **−25% (latest-juicy) / −14% (earthlike)**; a simpler 16-tile spatial window
  ≈ **−10%** (about half). The honest range is **~5–25%**, *not* a fixed "18–25%."
- **Total shelf area holds (≈ ±5–10%) — but contingently.** The continental loss is **redistributed to
  islands** (island shelf +9% to +46%) as islands adopt their own deeper local cutoffs. This holds for
  Voronoi/window schemes; **continent-only** localization loses total area outright (−101..−413). The
  **redistribution-to-islands mechanism is the real headline**, not the percentage.
- **Caveat:** continent cutoff rests on **tiny N** (1–3 continents/run; n=1 on both s1337). A naive
  per-component quantile is weakly sampled for exactly the landmasses that matter most → localization
  needs a sample-count floor with blend-to-global, or the window fallback.

## 4. What this means for the layers

| | What the data says | Implication |
|---|---|---|
| **(a) localize the cutoff** | M3 is the strongest claim (10/10, self-validated). Localizing retires the coupling and *also* nudges contrast right, at near-zero blast radius (self-contained in `compute-shelf-mask`). | **Do it.** Robust, low-risk, and a **measurement prerequisite** — it removes the island-density confound so (b) is measurable on a per-landmass gate. |
| **(b) margin-aware seafloor** | M2 proves (a) cannot make the contrast physically honest or give it dynamic range — the seafloor is orogenic-shallow on active margins. But M1 (continent-restricted) shows the contrast *direction* is already reliable, just compressed. | **Necessary for realism depth + per-map dynamic range, not a correctness emergency.** Higher scope (reefs/ecology read bathymetry) → sequence after (a); guard marine adequacy + live gate. |

Decision and rejected alternatives: [FRAMING.md](./FRAMING.md). Pre-declared bounds: [EXPECTATIONS.md](./EXPECTATIONS.md).

## 5. Adversarial verification

A 5-agent workflow independently scrutinized M1/M2/M3 against the raw bins (not the harness aggregation):

- **Bins are byte-faithful:** every run validates 0/0/0; the offline shelf rebuild matched the live
  `shelfmask` with diff 0; key numbers (nsDelta, Pearson, cutoffs, counterfactuals) were re-derived from
  scratch in independent Python and matched the harness exactly.
- **Corrections folded in above:** M1's all-tiles metric is artifact-prone (→ continent-restricted added
  to the harness); M2's "inverted seafloor" downgraded to "orogenic-shallow nearshore → inverted width
  consequence"; M3's "18–25%" widened to "~5–25%, scheme-dependent" with redistribution-to-islands as the
  load-bearing mechanism.
- **All three headline verdicts: confirmed/partially-confirmed.** None reversed the a-then-b decision.

## 6. Known limits of this evidence

- One map size (106×66), two configs; all reads of the **same dumps** — independence is in
  re-computation, not fresh generation. Effect sizes may shift at other sizes/configs (open question).
- Harness + live op both use **odd-Q** adjacency; per project memory the engine is **odd-R** (differs by
  1 of 6 neighbors per tile). The analysis is self-consistent with the op that produced the bins, but any
  localization inherits the op's odd-Q/odd-R mismatch — flag for a future correctness pass.
- Active offshore sample is **thin** (n drops to single digits by ring 5); deep-ring active behavior is
  poorly constrained.
