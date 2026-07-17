# Earth-like Expectation Ledger (template)

> Open when you are at **loop step 5** (alternative selection) and about to tune or implement a *behavioral* change. Fill this BEFORE touching generation logic. Pre-declaring the expected Earth-like outcome is what makes step-7 verification falsifiable instead of post-hoc rationalization. This is the **step-5 gate artifact** referenced by `references/orchestration.md` and `references/facet-verification.md`.

Copy this file into the workstream's project dir (e.g. `docs/projects/<workstream>/expectations.md`) and fill it. The generic benchmark subsystem is canonical at `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`; the Standard recipe's executable studies and product sheets live at `mods/mod-swooper-maps/src/recipes/standard/metrics/studies/STUDIES.md`. Historical project ledgers remain evidence of their own workstreams, not current benchmark authority.

The rule this enforces: **observed stats may calibrate the declared numbers only by a recorded amendment in this file, never silently.** A change that "looks better" but was never predicted is not verified — it is lucky.

---

## 0. Change under test

- **Workstream / request:** `<one line — e.g. "improve how rivers are generated">`
- **Arm:** behavioral (this ledger is only for the behavioral arm; technical-only changes verify structurally — see `references/facet-verification.md`).
- **Domain(s) touched:** `<foundation | morphology | hydrology | ecology | placement | resources>`
- **Structural alternative chosen (step 5):** `<the one of ≥1 alternatives you picked, in one line>`
- **Hypothesis (physical, falsifiable):** `<what Earth-science mechanism you expect to show up in the metrics — see references/facet-physics.md for the mechanism owner>`
- **Baseline study:** study id `<...>` · seed `<1337>` · Civ7 preset `<MAPSIZE_STANDARD | MAPSIZE_HUGE>` · config `<swooper-earthlike>` · scenario id `<from metrics report>`

A change with no falsifiable hypothesis is not ready for step 6. Go back to step 4/5.

---

## 1. Metric vocabulary (the primitive you measure against)

Standard product metrics live under
`mods/mod-swooper-maps/src/recipes/standard/metrics`. A metric family measures one
completed Standard run without embedding pass/fail policy. A `MetricTarget` owns
the pre-declared product expectation, and `STANDARD_METRIC_STUDIES` binds targets
to named Civ7 map-size presets and stable seed cohorts. Each logical binding lives
beside its study sheet under `metrics/studies/benchmarks`. Add or amend that
authority before changing generation behavior; do not recreate a workstream-local
metrics harness.

The reusable families currently cover geography, relief, hydrology, ecology,
placement, and resources. Metrics are **regime-family** (wet / arid / mountain /
closed / archipelago), not single global scalars. Declare which family this
change targets; do not assert one global "Earth-like" number.

For placement/resource changes, use the placement and resource families in this
same completed-map subsystem. They preserve the completed-map E1–E3 observations
they actually measure without a separate `placement-metrics` mode. Synthetic
operation laws remain behavior tests, and E4 remains Studio/live operational
proof; see the placement-realignment expectation ledger for the historical
vocabulary.

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

Run the declared catalog; record the exact target, study, presets, and seeds so the
measurement is reproducible.

```bash
# Emit the complete machine-readable Standard product-metrics report.
bun run --cwd mods/mod-swooper-maps metrics:report

# Run the behavior owner through the native Nx graph.
nx run mod-swooper-maps:test

# For a generation-vs-display question, compare already-captured viz layers.
bun run --cwd mods/mod-swooper-maps diag:diff -- --prefix <layer> --dataTypeKey <key>
```

Record for each measurement: study id, scenario id, seed, named Civ7 map-size
preset, config, and timestamp. Live closure still records its correlated request
and run identifiers under the `civ7-operational-debugging` proof boundary.

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

- **Per-change (cheap, every iteration):** focused unit/contract tests plus the relevant named Standard metric study over its stable Civ7-preset seed cohort → the §2 rows.
- **Per-milestone (Studio):** browser-runner dump inspected in Mapjet Studio → display/parity expectations; use `diff-layers.ts` to separate a generation bug from a viz bug.
- **Milestone boundaries (live game, expensive — not per-change):** deployed mod run + `verify --mode final-surface-parity` → live-engine expectations. Record branch / commit / runId / config / timestamp / payloads.

Do not promote a change past a tier until its tier passes. Expect attempt-1 live failures and hotfix slices — they are normal here, not exceptional (MockAdapter-valid maps can still SIGSEGV the live engine).
