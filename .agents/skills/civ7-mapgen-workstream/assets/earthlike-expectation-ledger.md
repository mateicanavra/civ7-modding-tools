# Earth-like Expectation Ledger (template)

> Open when you are at **loop step 5** (alternative selection) and about to tune or implement a *behavioral* change. Fill this BEFORE touching generation logic. Pre-declaring the expected Earth-like outcome is what makes step-7 verification falsifiable instead of post-hoc rationalization. This is the **step-5 gate artifact** referenced by `references/orchestration.md` and `references/facet-verification.md`.

Copy this file into the workstream's project dir (e.g. `docs/projects/<workstream>/expectations.md`) and fill it. Modeled on `docs/projects/placement-realignment/expectations.md` (the most complete executed-benchmark example in the repo). The benchmark *philosophy/program* lives in `docs/projects/pipeline-realism/`; this is the *executed* pattern.

The rule this enforces: **observed stats may calibrate the declared numbers only by a recorded amendment in this file, never silently.** A change that "looks better" but was never predicted is not verified — it is lucky.

---

## 0. Change under test

- **Workstream / request:** `<one line — e.g. "improve how rivers are generated">`
- **Arm:** behavioral (this ledger is only for the behavioral arm; technical-only changes verify structurally — see `references/facet-verification.md`).
- **Domain(s) touched:** `<foundation | morphology | hydrology | ecology | placement | resources>`
- **Structural alternative chosen (step 5):** `<the one of ≥1 alternatives you picked, in one line>`
- **Hypothesis (physical, falsifiable):** `<what Earth-science mechanism you expect to show up in the metrics — see references/facet-physics.md for the mechanism owner>`
- **Baseline run:** label `<...>` · seed `<1337>` · map size `<48×30 | Huge 106×66>` · config `<swooper-earthlike>` · runId `<from diag:dump>`

A change with no falsifiable hypothesis is not ready for step 6. Go back to step 4/5.

---

## 1. Metric vocabulary (the primitive you measure against)

`computeEarthMetrics(input)` from `mods/mod-swooper-maps/src/dev/diagnostics/extract-earth-metrics.ts` is the metric primitive. It takes ONE object and returns the fields below. Wire it after a `diag:dump` (no turnkey "run the benchmark" script exists — you compose the call chain).

Input: `{ width, height, landMask, lakeMask?, riverClass?, riverNetworkBenchmarkSummary?, biomeIndex? }`

| Metric | Type | Meaning | Earth-anchored intuition (verify against `references/facet-physics.md`) |
| --- | --- | --- | --- |
| `landShare` | 0..1 | land tiles / total tiles | Earth ≈ 0.29; Civ-playable maps usually run higher. Declare the family, not "realistic". |
| `lakeShare` | 0..1 | lake tiles / total tiles | small but non-zero; 0 is a regression for most regimes |
| `riverClassShare` | 0..1 | tiles with any river class / total | rivers concentrate in wet/temperate bands; arid families lower |
| `biomeDiversity` | integer | count of distinct biome symbols on land | more = more varied; collapse to 1–2 is a regression |
| `dominantBiome` | string \| null | most-common land biome symbol | which biome wins; a *shift* here is often the real signal |
| `hydrology.riverNetworkSummary` | object \| null | river-network benchmark summary (`version:1`) when supplied | structural river stats; cross-check `riverTileCount`/`landTileCount` |

Metrics are **regime-family** (wet / arid / mountain / closed / archipelago), not single global scalars. Declare which family this change targets; do not assert one global "Earth-like" number.

For placement/resource changes, the metric primitive is instead E1–E4 placement-metrics (`verify --mode placement-metrics`, `placement-metrics.ts`) — same ledger shape, different measures (see the placement-realignment expectations.md).

---

## 2. Pre-declared expectations (fill BEFORE step 6)

One row per metric you expect to move. Declare **direction** (UP / DOWN / HOLD) and a **range or bound** — a bare direction with no magnitude is weak; prefer a range when you can defend it. Leave untouched metrics as explicit HOLD guards so you catch collateral damage.

| ID | Metric | Direction | Pre-declared range / bound | Physical rationale (1 line) | Regime family |
| --- | --- | --- | --- | --- | --- |
| X1 | `riverClassShare` | UP | `<e.g. 0.06 → 0.09–0.12>` | `<more orographic rainfall feeds more channels>` | wet/temperate |
| X2 | `lakeShare` | HOLD | `<within ±15% of baseline>` | `<change must not drain/flood lakes as a side effect>` | all |
| X3 | `dominantBiome` | HOLD-or-NAMED | `<stays "grassland" | shifts grassland→forest>` | `<...>` | `<...>` |
| X4 | `biomeDiversity` | UP | `<≥ baseline; target +1>` | `<wetter bands open new biomes>` | wet |
| X5 | `landShare` | HOLD | `<within ±0.01>` | `<hydrology change must not move coastlines>` | all |
| … | `<metric>` | `<UP/DOWN/HOLD>` | `<range/bound>` | `<rationale>` | `<family>` |

Guard rows (HOLD) are not optional. The most common failure is a behavioral change that hits its target metric while silently wrecking an adjacent one.

---

## 3. Diagnostic command (how you measure)

Compose the chain; record the exact invocation so the run is reproducible.

```bash
# 1. Dump the full standard recipe through MockAdapter (writes dist/visualization/<label>/<runId>/)
cd mods/mod-swooper-maps && bun run diag:dump   # prints {"runId","outputDir"}

# 2. Compute Earth metrics from the dump's landMask/lakeMask/riverClass/biomeIndex layers
#    (compose computeEarthMetrics over the dumped layers; see extract-earth-metrics.ts)

# 3. (generation-vs-display question) compare two runs layer-by-layer
bun run diag:diff -- --prefix <layer> --dataTypeKey <key>   # diff-layers.ts — the gen-vs-viz separator

# 4. (placement/resource changes) use the placement-metrics mode instead of raw earth metrics
nx run mod-swooper-maps:verify:operational -- --mode placement-metrics
```

Record for each measurement: `runId`, label, seed, map size, config, and the timestamp. Behavioral claims that cannot name their runId are not proof (see `civ7-operational-debugging` proof boundaries).

Stability: measure over **multiple stable seeds** (the repo norm is ~20 seeds for placement; pick a defensible N) and report `mean [min..max]`, not a single seed. A single-seed delta is an anecdote.

---

## 4. Pass / fail rule (declare BEFORE the run)

State the decision rule now, so the result cannot be reinterpreted after you see it.

- **PASS** = every targeted row lands inside its declared range/direction over the seed set, AND every HOLD guard stays inside its bound.
- **FAIL (target miss)** = a targeted metric did not move as predicted → the hypothesis (or the implementation) is wrong; loop back to step 4.
- **FAIL (collateral)** = a HOLD guard broke → the change has an unintended side effect; loop back to step 4/6.
- **AMEND (calibration)** = the declared number was mis-set but the *direction and mechanism held* → record an amendment in §6 with date + evidence + runId, then re-judge against the amended number. Amending a *direction* is a reframe, not a calibration — surface it.

Mock metrics are necessary but **not sufficient**: a behavioral change is not closed until **step-7 live in-game verification** passes (Studio is where you see; the live engine is where you know). The mock ledger gates entry to live; live is the closure test. See `references/facet-verification.md` and `assets/live-verification-runbook.md`.

---

## 5. Results (fill AFTER the run)

| ID | Metric | Predicted | Observed (mean [min..max], N seeds) | runId | Verdict |
| --- | --- | --- | --- | --- | --- |
| X1 | `riverClassShare` | `0.09–0.12` | `<...>` | `<...>` | `<PASS / FAIL / AMEND>` |
| X2 | `lakeShare` | `HOLD ±15%` | `<...>` | `<...>` | `<...>` |
| … | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |

**Overall mock verdict:** `<PASS / FAIL / AMEND>` — `<one line>`
**Live verification:** `<pending / branch+commit+requestId+timestamp once run — see live-verification-runbook.md>`

---

## 6. Amendments (append-only; never edit a declared number in place)

> Record every range/direction change here with **date + evidence path + runId** before relying on it. An unrecorded change to a pre-declared number voids the gate.

- `<YYYY-MM-DD>`: `<which ID>` `<old → new>` — `<why; evidence: docs/projects/<ws>/evidence/<file>.md; runId <...>>`

---

## 7. Proof-class ladder (which expectations gate where)

Mirror the placement-realignment ladder — match each expectation to the cheapest sufficient proof surface:

- **Per-change (cheap, every iteration):** unit/contract tests + `diag:dump` → `computeEarthMetrics` over stable seeds → the §2 rows.
- **Per-milestone (Studio):** browser-runner dump inspected in Mapjet Studio → display/parity expectations; use `diff-layers.ts` to separate a generation bug from a viz bug.
- **Milestone boundaries (live game, expensive — not per-change):** deployed mod run + `verify --mode final-surface-parity` → engine-truth expectations. Record branch / commit / runId / config / timestamp / payloads.

Do not promote a change past a tier until its tier passes. Expect attempt-1 live failures and hotfix slices — they are normal here, not exceptional (MockAdapter-valid maps can still SIGSEGV the live engine).
