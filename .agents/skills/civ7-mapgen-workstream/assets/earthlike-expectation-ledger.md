# MapGen Behavioral Expectation Ledger

Copy this asset into the active workstream before changing behavioral logic.
Fill the declaration sections before implementation. Amendments are append-only.

## 1. Change Identity

- **Workstream/request:** `<one sentence>`
- **Actor outcome:** `<what the map author or player should experience>`
- **Definition owner:** `plugins/mod/map/swooper-physics/<exact area>`
- **Other owners touched:** `<none | mapgen-core | realization app | MapGen-runs | controller | projection | app adapter>`
- **Recipe/config identity:** `<recipe, config id/digest>`
- **Cohort:** `<map sizes, regime families, stable seeds>`
- **Baseline evidence ids:** `<metric report/run ids>`
- **Stronger live claim planned:** `<none | exact claim and live setup>`

## 2. Falsifiable Hypothesis

**Mechanism:**

`<physical or gameplay mechanism expected to change>`

**Current classification:**

- Modeled: `<...>`
- Approximated: `<...>`
- Absent: `<...>`

**Falsifier:**

`<evidence that would show this mechanism or chosen locus is wrong>`

## 3. Alternatives

| Alternative | Structural/model shape | Expected benefit | Main risk | Disposition |
| --- | --- | --- | --- | --- |
| A | `<...>` | `<...>` | `<...>` | selected/rejected |
| B | `<meaningfully different shape>` | `<...>` | `<...>` | selected/rejected |

Selected alternative: `<id and rationale>`

## 4. Pre-Declared Expectations

Use one row per metric. Targets must be owned by the Swooper definition's
current metric-study bank; this ledger records the workstream hypothesis and
evidence rather than creating a parallel metrics implementation.

| ID | Regime | Metric | Direction | Bound/range | Physical or gameplay rationale | Source/study |
| --- | --- | --- | --- | --- | --- | --- |
| X1 | `<wet-temperate>` | `<metric id>` | UP/DOWN/HOLD | `<range>` | `<why>` | `<study id>` |
| X2 | `<all>` | `<guard metric>` | HOLD | `<tolerance>` | `<collateral guard>` | `<study id>` |

Required guard families to consider:

- land/water and coast/shelf shape;
- routing conservation, lakes, and river hierarchy;
- climate and biome distribution;
- feature/resource occupancy and legality;
- start fairness and settlement viability;
- deterministic stability and runtime bounds.

## 5. Civ7 Constraint Ledger

| Constraint | Evidence owner | Source revision/epoch | Expected result |
| --- | --- | --- | --- |
| Static legality | `packages/civ7-map-policy` | `<generator receipt>` | `<...>` |
| Official intent | official resource corpus | `<revision/files>` | `<...>` |
| Installed runtime fact, if needed | qualified diagnostic or controller | `<controller realm/boot, access epoch, game identity>` | `<...>` |
| Player value | Swooper product policy/playtest | `<criteria>` | `<...>` |

Do not call a placement successful merely because it is physically plausible.
It must also be legal and useful.

## 6. Decision Rule

Declare before running:

- **PASS:** every target satisfies its declared bound across the cohort and all
  `HOLD` guards stay within tolerance.
- **FAIL - mechanism:** the expected causal signal is absent or reversed.
- **FAIL - collateral:** a hold guard or Civ7 constraint breaks.
- **INCONCLUSIVE:** sample, correlation, or evidence identity is insufficient.
- **AMEND:** a magnitude bound was poorly calibrated but direction/mechanism
  remains defensible; record the amendment below before re-evaluation.

Changing the direction, mechanism, owner, or regime is a redesign, not a
calibration amendment.

## 7. Measurement Discovery

Discover current commands and targets at execution time:

```bash
bun apps/cli/bin/run.js mapgen --help
bunx nx show project swooper-physics --json
bunx nx show project swooper-physics-mod --json
```

Select each command family and leaf from native help. Record the exact leaf
help/version, target, config, seeds, map sizes, regime, timestamp, and output id
used. Prefer a stable multi-seed cohort and report a distribution (`mean`,
spread, quantiles or min/max where appropriate), not one anecdotal seed.

## 8. Deterministic Results

| ID | Declared expectation | Observed distribution | Evidence id | Verdict |
| --- | --- | --- | --- | --- |
| X1 | `<...>` | `<...>` | `<...>` | PASS/FAIL/INCONCLUSIVE/AMEND |
| X2 | `<...>` | `<...>` | `<...>` | `<...>` |

- **Overall deterministic verdict:** `<...>`
- **Generation/display discriminator:** `<not applicable | raw values wrong | projection wrong | unresolved>`
- **Unexpected effects:** `<...>`

## 9. Realization And Live Results

Fill only when the claim crosses into Civ7.

- **Realization build/artifact identity:** `<...>`
- **Installation receipt:** `<...>`
- **MapGen-runs operation/request id:** `<...>`
- **Tuner resource epoch:** `<...>`
- **Game/setup/map identity:** `<...>`
- **Fresh log evidence:** `<...>`
- **Controller map readback:** `<...>`
- **Parity status and unresolved links:** `<...>`
- **Supported proof class:** `<generated | installed | loader | live-behavior>`
- **What remains unproved:** `<...>`

## 10. Amendments

Append; never edit the original declaration in place.

| Date | ID | Old | New | Reason | Evidence |
| --- | --- | --- | --- | --- | --- |
| `<YYYY-MM-DD>` | `<X#>` | `<...>` | `<...>` | `<...>` | `<path/id>` |

## 11. Final Decision

- **Outcome:** `<accepted | rejected | refine | unresolved>`
- **Supported actor claim:** `<...>`
- **Proof classes:** `<...>`
- **Consumer impact:** `<...>`
- **Excluded/generalization limits:** `<...>`
