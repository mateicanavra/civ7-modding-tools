# Placement Vertical — Earth-like Expectation Ledger

Predeclared BEFORE tuning (systematic-workstream gate 6). These are the
benchmarks implementation slices verify against; observed stats may calibrate
exact numbers only by recorded amendment here, never silently. Baseline =
Earth-like planet at default knobs; knobs expand outward to declared mins/maxes.

Authority split per workstream frame:
- **Starts** lean on Civ 7 game mechanics (official `assign-starting-plots.js`
  is the behavioral baseline) with physical signals (fertility, freshwater) as
  scoring substance.
- **Resources** are game mechanics with stronger Earth-realism emphasis
  (official Weight/MinimumPerHemisphere/legality respected; spatial structure
  Earth-like). The per-resource corpus source of truth is
  `domain/resources` earthlike expectations (`expectedCountRange`, habitat
  lanes) reconciled against official policy tables once regenerated.

## E1 — Player starts (default knobs, standard map, N players)

| ID | Expectation | Measure | Baseline range |
| --- | --- | --- | --- |
| E1.1 | Every start is on passable, settleable land | % starts on mountain/volcano/wonder/lake tiles | **0%** (hard invariant, not a range) |
| E1.2 | Exactly the configured alive players are seated, correct ids | seated vs `getAliveMajorIds()` | exact match; no doubling |
| E1.3 | Freshwater access (river/lake adjacency ≤1 tile) | % starts with freshwater | ≥ 80% (Earth: major settlements overwhelmingly riverine/lacustrine) |
| E1.4 | Fertile neighborhood | mean pedology fertility, radius 2, vs land mean | start mean ≥ 1.3× land mean |
| E1.5 | Spacing respects official buffers | min pairwise start distance | ≥ 6 tiles hard; score tapers to 12 (official g_Required/g_Desired are FIXED constants — no official map-size scaling; any scaling is a repo extension with its own knob, recorded by amendment) |
| E1.6 | Fairness | worst-pair gap on the published 0..1 `StartRecord.score` (fixed normalization) | gap ≤ 0.3 |
| E1.7 | No silent quality abandonment | desperation/openPool fallback rate over 20 seeds | ≤ 5% of seats; every fallback surfaced in artifact + viz |
| E1.8 | Climate plausibility | % starts in the top aridity decile or outer temperature deciles (both tails), deciles computed over land tiles | ≤ 10% of starts |

Knob expansion: spacing min/max, fairness strictness, freshwater weight,
coastal-start preference (new), per-hemisphere player split — each declares its
legal range; defaults reproduce the table above.

## E2 — Resources (default knobs, antiquity age)

| ID | Expectation | Measure | Baseline range |
| --- | --- | --- | --- |
| E2.1 | Rarity stratification survives (official deficit-rotation semantics: frequency ∝ 1/Weight among co-eligible types) | Spearman(count, Weight) within shared-habitat pools | ≤ −0.7; NOT uniform (uniformity = regression) |
| E2.2 | Region minimums honored (official semantics: per landmass-region, `MinimumPerHemisphere` + `MapResourceMinimumAmountModifier`, gated by `isResourceRequiredForAge`) | modifier-adjusted minimum per landmass-region | 100% satisfied or recorded shortfall with reason |
| E2.3 | Habitat fidelity | % placements inside the type's habitat lane (e.g. furs boreal, ivory tropical, fish coastal/marine) | ≥ 90%; whole-map fallback eliminated |
| E2.4 | Marine resources place | count of FISH/PEARLS etc. on water | > 0 on any map with coast (currently unverified, suspected 0) |
| E2.5 | Clustering matches genesis at the right scale (blue-noise locally, aggregated regionally via habitat intensity — inhomogeneous Poisson) | Ripley's K / pair-correlation at radii ABOVE the type's spacing floor | geological types aggregate > CSR at r > floor; cultivated climate-banded; nearest-neighbor distances still respect E2.6 |
| E2.6 | Type-aware spacing | same-type min spacing | per-type floor honored at default; never decays to 0 |
| E2.7 | Per-type ranges | counts within `expectedCountRange` min/target/max from domain/resources corpus | 100% of types in [min,max]; ≥ 70% within ±20% of target |
| E2.8 | Regional equity | per-landmass resource density spread | max/min landmass density ≤ 2× (for landmasses ≥ 10% of land) |
| E2.9 | RDP step-1 metrics covered (accepted resource-distribution-policy strategy) | reassignment rate, preferred-legality rate, planned→assigned→final drift, latitude-band overrepresentation, sector entropy | S0 harness computes all five; baseline recorded; improvement direction declared per metric before tuning |

## E3 — Resource ↔ start relationship (the missing knob family)

| ID | Expectation | Measure | Baseline range |
| --- | --- | --- | --- |
| E3.1 | Start support guarantee | resources within radius 4 of each start | ≥ 2 per start (configurable floor) |
| E3.2 | Start support equity | per-player resource count radius 4 | max−min ≤ 2 at default fairness |
| E3.3 | No start starvation by order | resources placed blind to starts today → after fix, support pass runs with knowledge of starts | guarantee holds on 20/20 seeds |
| E3.4 | Sparsity is expressible | sparsity knob at max | global density at min legal; spacing at max; ranges still respected |

## E4 — Studio / pipeline / live-game parity

| ID | Expectation | Measure | Baseline |
| --- | --- | --- | --- |
| E4.1 | Studio seats == live seats | same seed/config: start count & plots | identical (after E1.2 fix) |
| E4.2 | Every placement product step has viz | steps with ≥1 layer | 9/9 (currently 3/9) |
| E4.3 | Viz shows decision substance | per-component start scores, per-type resource points, rejected-with-reason layers | present and backed by artifacts, not viz-only |
| E4.4 | Policy legality is inspectable offline | mock `canHaveResource` vs live engine on probe plots | ≥ 95% agreement on sampled plots (measured via `civ7 game map` probe) |

## Proof-class ladder (which expectations gate where)

- **Per-slice (cheap, every change):** unit/contract tests + stats harness over
  stable seeds → E1.1–E1.8, E2.1–E2.8, E3.* computed from artifacts.
- **Per-milestone (studio):** browser-runner dump inspected in studio → E4.2–E4.3.
- **Milestone boundaries (live game):** `civ7 game` probes + deployed mod run →
  E1.2 engine semantics, E2.2/E2.4 live counts, E4.1, E4.4.

Amendments: record any range change here with date + evidence before relying on it.
