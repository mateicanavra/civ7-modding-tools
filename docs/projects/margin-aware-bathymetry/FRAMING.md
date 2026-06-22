# Thread 2 — Framing & decision: margin-aware seafloor bathymetry

> The "why" and the "what we're doing about it." Empirical grounding: [ANALYSIS.md](./ANALYSIS.md).
> Pre-declared success bounds: [EXPECTATIONS.md](./EXPECTATIONS.md).

## The premise was wrong (and the analysis corrected it)

[coastal-shelf-tiling EXPECTATIONS §6](../coastal-shelf-tiling/EXPECTATIONS.md) deferred margin-aware
seafloor as polish, on the premise that "the generated bathymetry is only **weakly margin-correlated**."
Thread 2 measurement (10 self-validated runs, byte-faithful vs the live op) **refutes that adjective**:

- The nearshore seafloor carries a **strong, robust margin signal** — active−passive depth delta
  ≈ **+11.5** (positive in 10/10), closeness↔depth Pearson **+0.29** (positive in 10/10), survives
  island removal. Not "weak."
- The real defect is the **sign of the consequence, not the strength.** Because
  `bathymetry = min(0, elevation − seaLevel)`, the seafloor is an **orogenic-relief proxy**: high-relief
  active (convergent/transform) coasts make the adjacent water **shallow**, passive coasts stay **deep**.
  Shallow active nearshore water clears the depth gate over *more* rings → it tends to **widen** active
  shelves, the opposite of the intended Pacific-narrow / Atlantic-wide contrast.

So the prior doc and this analysis **agree on the mechanism and disagree only on the adjective**: the
bathymetry does not translate into the *desired* width contrast — but because the signal is *strong and
mis-aimed*, not weak. (Honest scope: "inverted *width consequence*," not a flatly non-physical seafloor —
real active margins are shallow at the coast too.)

## Two layers, sequenced: **a-then-b**

### (a) Localize the shelf-break cutoff — do now, low-risk

Today `shallowCutoff` is **one global quantile** over all nearshore water tiles. Abundant island samples
(island local cutoff ≈ −13) drag it deep, so continents (local cutoff ≈ −4) inherit a deeper-than-warranted
gate and gain ~+400 shelf tiles — **Thread-1's quantified island→continent coupling**. The ordering
continentCutoff > globalCutoff > islandCutoff holds in 10/10 runs.

**Fix:** compute the cutoff **per-landmass** (nearest-land Voronoi attribution + blend-to-global below a
sample-count floor; 16-tile spatial window as the graceful fallback). Self-contained in
`compute-shelf-mask`; **no bathymetry consumer changes**; near-zero blast radius. It shrinks continental
shelf in 10/10 (≈ −25% latest-juicy / −14% earthlike) while redistributing to islands so total area holds.
It is also a **measurement prerequisite**: removing the island-density confound lets (b) be measured on a
per-landmass gate free of the +400 contamination.

### (b) Margin-aware seafloor subsidence — necessary for realism depth, sequence after (a)

M2 proves (a) alone cannot make the contrast physically honest or give it **dynamic range** — against an
orogenic-shallow active nearshore, the break-depth lever (a clean 2.0 ratio on every run) saturates and
active continental shelves pin at the 0–1 ring floor. (b) adds a **margin-aware sub-sea depth term** so
convergent/transform nearshore seafloor **deepens** (steeper drop-off → genuinely narrow active shelf) and
passive nearshore stays gentle/shallow → wider. This is the seafloor analogue of the foundation's existing
land **forcing→elevation coupling** (top-uplift-decile → top-30% land elevation; see
`pipeline-realism/.../morphology-contract.md`), which has **no seafloor equivalent today** — that gap is (b).

Entry point: `reconcile-heightfield-from-coast` (and whatever sets sub-sea elevation). **Risk surface:**
reefs (atoll/reef scoring keys on warm shallow *open* ocean beyond the shelf — already a delicate tradeoff,
EXPECTATIONS §6 R3) and ecology (sand/snow, marine resources, the C9 marine-adequacy guard). So (b) is a
foundation/heightfield change that **must follow (a)**, re-verify marine adequacy, and re-run the live
in-game gate (it is map-affecting).

**Urgency note (honest):** the continent-restricted metric shows the contrast *direction* is already
reliable on continents (active narrower in 9/10) — it is only the artifact-laden all-tiles metric that
looked "inverted." So (b) is **realism depth + per-map dynamic range**, not a correctness emergency. This
matches the ledger's downgrade/escalate triggers.

## Rejected alternatives

- **b-only (skip cutoff localization):** leaves the robust +400 coupling in place, so any seafloor change
  is measured through a global cutoff still dragged deep by island density — you can't attribute the
  improvement to the seafloor fix. Worst ordering; also forgoes a near-zero-risk win.
- **a-only (localize and declare done):** M2 is decisive that the seafloor itself is mis-aimed; (a)
  de-confounds and sharpens but cannot give the contrast dynamic range or physical honesty. Acceptable as
  an interim if the downgrade trigger fires, but not the end state.
- **both-now (parallel a+b):** couples a low-risk self-contained op change to a high-scope foundation
  change that reefs+ecology read — destroys effect isolation and inflates the live-verification surface.
  (a) is a measurement prerequisite for evaluating (b); sequence, don't merge.
- **neither:** refuted by all three confirmed findings (robust coupling, artifact-laden + compressed
  contrast, mis-aimed seafloor signal).

## What would change the call

- **Downgrade (b) to "realism polish":** if a cheap experiment shows (a) alone lifts the per-map
  continent-restricted width ratio to a reliable floor across all runs — the direction is already there,
  so this is plausible.
- **Escalate (b) to first/urgent:** only if a live/gameplay check shows the compressed/mis-aimed active
  shelves break **start or marine balance** (a concrete C9/G4 or C10/G5 consequence), not merely a realism gap.
- **Reconsider both-now:** only if (b) can be proven bathymetry-isolated (reef/ecology fingerprints
  demonstrably unaffected), removing the scope-coupling that motivates sequencing.
- **Drop (a) priority:** if a fresh-generation sweep at other map sizes shows the M3 coupling does not
  survive.
