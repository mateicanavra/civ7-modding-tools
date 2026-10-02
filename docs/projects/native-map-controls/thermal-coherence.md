# Thermal Coherence And Earth Calibration

**Goal:** one causal ground-temperature field for water availability and
terrestrial ecology, followed by independent Earth calibration.
**Owner:** root, with independent architecture and empirical-reference review.

## Diagnosis

The config-only neutral Earthlike candidate is not accepted as a calibrated
baseline. Its failed seed3 vegetation study identified competing thermal
owners, not a reason to adjust vegetation quotas. Baseline climate calculates
seasonal ground temperatures for evaporation and demand, then discards them.
Refine independently calculates another field for ecology using an unseasonal
solar curve and a different elevation lapse rate. On Standard seed3, their
land means differ by about 28 degrees C before the proposed ownership repair.

Earthlike's baseline lapse is -0.0065 per model relief unit; refine uses -0.15
per model relief unit. Neither unit is a meter. Their solar endpoints also
differ (1.5/0.22 versus 0.9/0.1). The baseline equatorial calibration can clamp
land to 50 degrees C. Promoting either old set of constants is not empirical
validation, and the old `hot` label did not establish global overheating.

A separate albedo buffer-swap defect discards the first cooling pass and
aliases later passes. Repair it with exact 0/1/2/3-pass tests rather than fold
its numerical effect into thermal tuning. The resource-density regression is
also independent: the regional-minimum pass bypassed the density guard used
by rotation and range completion. Record a lawful, reason-bearing shortfall
when no alternative legal site can satisfy both obligations.

## Selected Design

Publish domain-owned `thermalField` with a named `{ surfaceTemperatureC }`
payload, finite map-cardinality Float32 values in degrees C. It is the
equal-season annual mean of actual seasonal ground/SST temperatures already
computed in baseline, before albedo feedback. Retain seasonal samples in the
step observation for aggregation proof, not an unused seasonal contract.

The [comparative lineage audit](climate-artifact-lineage.md) supersedes the
initial publication-shape rationale. The user's concern was an investigation
prompt, not a settled instruction that every property must be a standalone
artifact. July's pressure-field work did explicitly implement this baseline
thermal handoff on a local branch and defer refinement's consumption. Its
mainline reconstruction omitted both. The artifact blueprint was intentional
kind-wide law, not stale syntax; a named-object thermal product fits it.

Refinement publishes the post-feedback temperature in the existing
`climateIndices` descriptor product. Consumers and observers read that one
final authority. Do not retain either a standalone final temperature alias or
temperature in `baselineClimateField`. The baseline field and final descriptor
are successive causal vintages, not independent climate algorithms. This
completes the concrete documented deferral without universal scalar splitting
or a competing field/buffer publication mechanism.

Refine consumes this field directly and applies only declared feedback.
Remove its radiative-forcing and thermal-state operations, temperature knob
and normalization. Keep its latitude field for diagnostics. Baseline's
sea-level temperature calculation for pressure remains: it uses the same
thermal calibration without ground lapse and has a genuinely different
physical datum. Existing domain operations own numerical physics; the step
uses its existing aggregation helper and composes them. No new thermal stage,
profile registry, engine or general aggregation abstraction is justified.

All eight authored profiles migrate strictly. Their baseline settings remain
authoritative; obsolete refine knobs and advanced thermal envelopes are
removed and rejected on admission, not silently ignored. Annual seasonal
aggregation changes outputs even where both old calibrations happened to
match, so this shared repair does not claim the config-only seven-map hold.

This gives a common annual thermal baseline, not a complete seasonal ecology
or water-budget model. Baseline seasonal demand and refined demand evaluated
at annual temperature are not generally equal for nonlinear responses. Keep
that approximation explicit; do not pretend arithmetic equality is physical
equivalence or expand this repair into a new seasonal simulator.

## Acceptance Criteria

- Annual temperature equals the mean of actual seasonal surface outputs,
  including SST, with deterministic finite cardinality.
- With cryosphere disabled, refined temperature equals baseline exactly.
  With feedback enabled, differences come only from the albedo operation;
  baseline buffers remain immutable.
- Ground relief affects surface thermal and demand without applying ground
  lapse to pressure's sea-level thermal input. Existing sea-datum and
  bathymetry invariance tests continue to hold.
- Demand-forwarding tests prove both thermal consumption and common demand
  calibration, not a stubbed replacement temperature.
- All profiles compile with one thermal owner; obsolete refine input fails
  at canonical admission. No vegetation, placement or integrity threshold is
  loosened to adopt the change.
- Baseline temperature is published/read through `thermalField`; refinement
  publishes its later vintage through `climateIndices`. Exact declared
  dependencies gate both. No duplicate final authority or ambient field/cache
  supplies consumers. The original artifact kind rule passes unchanged.
- Repeat the fixed-Earth diagnostic, Standard cohorts and canonical study
  bank. Record changed temperature, rain, runoff, biome and river outcomes
  rather than assuming current absolute coefficients are valid.

## Sequencing And Calibration

One stack: shared causal repairs and strict migration precede temperature
calibration. Native connectivity discriminators and Earth-reference evidence
can be developed independently but do not tune production physics yet.

Use independent terrestrial temperature evidence before choosing new solar
and thermal coefficients. A compact candidate is NOAA PSL's NCEP/NCAR
1991-2020 monthly 2 m air-temperature climatology. This is reanalysis, not raw
observation, and 2 m air is not identical to ground skin temperature. Pin the
source, units, coordinates, calendar and mask; use geographic area-aware
seasonal/latitude summaries and low-relief land first. SST and relief contrasts
need separate contracts. Do not conflate Firaxis terrain/biomes with observed
climate, or native game elevation indices with physical meters.

Fixed Firaxis geometry is documented in [Earth reference](earth-reference.md).
The full question and acceptance ledger remains
[calibration questions](calibration-question-sheet.md). Numerical calibration
is not complete merely because the duplicate computation is removed.

## Implementation And Measured Acceptance

Before the lineage correction, the causal thermal repair was implemented and
independently reviewed. Source/test typechecks, generated recipe/catalog builds
and the realization build passed. That owning graph ran
887 definition tests (886 pass, one product-study aggregate fails) and 175
realization tests (all pass). Focused tests establish actual seasonal/SST
aggregation, exact dependencies, disabled-feedback identity, nonmutation and
artifact-backed visualization. The definition study failure retains twelve
expectations rather than disguising changed climate with relaxed targets:

- Earthlike: insufficient within-row temperature variation, forest presence
  and rainforest presence.
- Sundered Archipelago: atoll presence.
- Mountains of Time Earthlike/Original, Latest Juicy and Mountain Patch:
  vegetation-family variety and taiga presence.

The first implementation unnecessarily expanded the kind-level source-shape
rule for raw typed-array roots. Core support alone did not justify treating the
existing rule as stale. ADR-022 restores its original admitted named-schema
shape and corrects that overreach. Verification for the corrected publication
shape is recorded separately below; earlier pass receipts are not substituted
for that run.

### Corrected Publication Proof

On September 29, the corrected named-object thermal handoff passed 77 focused
tests (67,452 assertions); independent review also ran 12 focused tests
(476 assertions) without findings. A fresh owning graph ran:

```sh
nx run-many --projects=swooper-physics,swooper-physics-mod --targets=check,test,build,check:policy --outputStyle=static
```

All typechecks, builds and original kind-policy checks passed. Definition tests
were again 886 pass / one product-study aggregate failure with the same twelve
expectations listed above; all 175 realization tests passed. The graph is not
fully green, and this correction does not claim to resolve calibration.

An independent canonical capture replay then matched 120 of 120 SHA-256 field
hashes across the ten retained current arms: all eight Huge seed1018 profiles
and Earthlike Standard seeds1018 and3. Admitted configs, effective operation
configs and scenario provenance also matched. The captured surfaces were
elevation, original land, planned lakes, flow direction, river class, final
temperature, baseline/final rain, pressure, wind U/V and sea level. Neither
source nor retained evidence changed during the replay.

The receipt is retained at the stable atlas root documented in
`docs/process/LOCAL-VIEWERS.md`, under
`huge-1018/earth-calibration/thermal-publication-parity-replay.json`; its sibling
`.mjs` is the rerunnable script. This establishes exact parity for those
twelve portable captured fields and ten scenarios, not every field or seed
and not native-engine parity.

The [independent thermal reference](earth-thermal-reference.md) now replays
literal old profiles and a frozen, held-out low-relief annual fit through the
actual domain operations. The neutral baseline's zero-relief comparison is
16.53 C warm on that qualified cohort; this is not a world-average estimate.
The annual fit improves held-out error but overstates tropical seasonal range.
Profile migration and thermal-process calibration therefore remain open, with
terrain, calendar, sea datum and missing maritime effects kept distinct.

### Held-Geography Profile Experiment

The canonical capture/measurement path ran 26 diagnostic arms across all eight
Huge seed1018 profiles and additional Standard Earthlike cases. Twenty-two
completed with integrity passing; four returned explicit closed-basin
`shoreline-quantization` refusals. Each completed comparison holds physical
ground, original water mask and sea datum exactly. Source and expectation
receipts live beside the retained atlas at
`earth-calibration/thermal-profile-experiment/`.

Neither wholesale inheritance of the old baseline nor copying the retired
refine coefficients establishes a correct shared climate. For Earthlike Huge
1018, exposed-land mean temperature is 26.04 C under the current baseline,
4.74 C with retained-refine coefficients and 7.63 C with the frozen NOAA
low-relief fit. These are generated-map means, not Earth global-temperature
comparisons. The NOAA candidate retains five vegetation families there but
still has only 0.148 C pooled within-row variation. Restoring the retired
per-model-unit lapse increases regional variation but is not physical height
calibration and exposes one of the closed-basin refusals. Do not choose climate
coefficients to avoid that unsupported basin regime.

### Relief Units Are A Separate Calibration Question

The current morphology policy explicitly quantizes normalized relief by 100;
neither bounded crust buoyancy nor its authored relief span establishes metres.
Thermal cooling currently multiplies height above the sea datum in those
model units. A meter-based atmospheric lapse rate cannot be inserted unchanged.

An independent, area-weighted comparison of the three retained maps with
NOAA model orography, cropped to their +/-80-degree latitude domain, finds a
shape mismatch rather than just an unknown scale. The following rounded table
uses cumulative-midweight interpolated quantiles on both populations:

| Land distribution | Median | P90 | P99 | P99 / median |
| --- | ---: | ---: | ---: | ---: |
| NOAA geopotential metres | 454 | 1845 | 4471 | 9.85 |
| Huge 1018, model units | 24 | 56 | 72.38 | 3.02 |
| Huge 42, model units | 19 | 44 | 64 | 3.37 |
| Standard 1018, model units | 17 | 51 | 65 | 3.82 |

The 2026-09-29 pinned re-extraction reproduces the NOAA row under that
convention: P90 1844.6727, P99 4470.5216, ratio 9.846964. Inverse empirical-CDF
quantiles instead give 454/1845/4449 and ratio 9.799559; this is a method
difference, not changed source data. The original calculation's receipt was
not recovered, so the new receipt qualifies this numerical reproduction only.

Matching medians would require 18.9-26.7 metres per model unit; matching P99
would require 61.8-69.9. These incompatible fits are diagnostics, not admitted
scales. Using the same inverse-CDF convention, generated ratios remain
3.0000/3.3684/3.8235. Positive source-land aggregation at Huge and Standard
center spacings retains ratios 8.58-8.93 across two longitude registrations.
Each source cell retains its Gaussian land mass once; bins average admitted
land heights without ocean-zero dilution or a land-fraction threshold. This
is source-mass aggregation sensitivity, not geometric area-overlap resampling
or exact hex-cell equivalence. Weighting, quantile convention, negative-height
land exclusion and this coarsening do not explain the gap. The earlier GMT
corroboration is not part of this newly verified evidence.

These retained maps use a young, low-erosion, one-era configuration. The result
does not imply that every generated world must match modern Earth, nor justify
per-map quantile remapping. It does rule out treating their present relief as
Earth-calibrated through a single undocumented multiplier.

The held-config stagewise study now localizes that shape. It captures raw
base-operation output before margin mutation, post-margin ground, reconciled
base topography, eroded topography and final islands. Actual public-operation
replay and a Huge/1018 repeat are exact; 212 retained typed-field hashes pass.
On the same final-land population and final sea datum, raw-to-final P99/median
is 3.0417 to 3.0154, 3.4018 to 3.3684, and 3.8235 to 3.8235. Margin and
reconciliation preserve the upper quantiles; erosion changes P99 by less than
one model unit. No Int16 saturation occurs. Changing the erosion posture is
therefore not a justified remedy for this upper-tail limitation.

The separate low-end effect is real: reconciliation admits floor-height land,
erosion reduces its occupancy, and islands add low land. Final area-weighted
floor shares are 11.68%, 16.63% and 16.34%. These describe a different mechanism
from missing high terrain.

The base-operation decomposition also rejects an uplift-clipping explanation:
the held config bounds its uplift blend below 0.82, and zero cells clip.
Removing smoothing raises P99 by only 1.0/2.37/2.0 model units. Removing uplift
instead lowers P99 by 26/20.63/27 while medians fall only 4/5/5. Uplift is
already the main tail-producing contribution. Four reconstructions match the
retained inputs and actual operation exactly; 128 field hashes pass. The
bounded Foundation crust distribution and additive relief law precede this
shape, but this does not establish a defective geological coefficient. No
coefficient search, quantile remapping or production tuning follows from it.

All receipts live under the discoverable `earth-calibration/` user-data root:

- `noaa-orography-reference-20260929/analysis-receipt.json`:
  `6c65b3200f4cd987b8e311c8ca515ff4ce43f15e69fdbf68169f92e71013a066`.
- `noaa-orography-comparability-20260929/receipt.json`:
  `4262b5999d045d38b6eefcab013b6fd0be00dfb7030b3da56baa11e23f2b71a6`.
- `relief-stagewise-20260929/run-20260929-1/receipt.json`:
  `8808dac262f2ad4009b9d1282bbf2c693cdb73b2aaef58a81505a06a443bb51c`.
- `relief-base-decomposition-20260929/receipt.json`:
  `bfee9955b68a99425229b3c46f9c1f40e5e4ce7767a4e22326084a0e58fdec23`.

Keep low-relief temperature calibration independent. A common physical relief
scale is admissible only after lowland, middle-elevation and high-tail implied
scale ranges overlap across held seeds, sizes and reference sensitivities.
No production scale, lapse coefficient, biome quota or study bound is changed
on the strength of this diagnostic alone.

That production-scale question does not block a fixed-Earth thermal diagnostic.
The existing thermal operation can accept source heights under an explicit
test-only encoding and matching lapse coefficient. For `q` geopotential metres
per diagnostic model unit, encode `round(height / q)` and use `q * lapsePerMetre`.
This supplies one input field, not a second artifact or a claim that generated
relief has those units. Paired encodings can verify covariance up to stated
quantization error. Keep the frozen lowland response unchanged; report its
nonzero source-height/intercept ambiguity, below-sea clamp, and uncalibrated
maritime response rather than fitting them away. This arm excludes Foundation,
Morphology and precipitation, as intended by the fixed-reference experiment.

### Atoll Regression Is A Placement Assumption, Not A Thermal Handoff Bug

Sundered Archipelago Huge1018 now supplies actual coupled SST to marine ecology,
instead of refine's former independent radiative water curve. Independent
operation replays hold geography and isolate this from seasonal averaging and
albedo (which is disabled for this profile):

| Bank cell | Retired water curve | Current SST | Old / current atoll score | Diagonal lane |
| --- | ---: | ---: | ---: | --- |
| 2150, (30,20) | 28.208 C | 17.396 C | 0.7146 / 0 | Admitted |
| 3894, (78,36) | 37.440 C | 19.995 C | 0.8200 / 0.1363 | Admitted |
| 3510, (12,33) | 39.752 C | 26.957 C | 1 / 0.7464 | Rejected |

The last bank still exceeds the unchanged 0.52 confidence floor. The planner
discards it solely because `(x + 2*y) % 10` is not zero. It makes no placement
attempt, so this is not a Civ7 legality rejection or competition with another
feature. Four-season forcing without SST and the retired unshifted curve both
recover the same two old placements; that counterfactual is not a reason to
restore overly warm water or a duplicate thermal owner.

The bounded correction to design next is habitat-aware spatial thinning:
retain isolated eligible banks irrespective of coordinate origin, while
limiting dense neighboring reef patches and preserving navigation gaps. Do
not simply switch to the existing `habitat` strategy; its tile-index modulus
is another origin-dependent filter. Keep confidence and habitat gates fixed.
Require lone-bank translation tests, dense-bank spacing, wrapped adjacency,
occupancy, determinism and the unchanged complete map study bank before
acceptance. This is a domain planner change, not more step computation.

### Basin Refusals Expose Two Distinct Missing Capabilities

Exact replays of all four failed candidate arms preserve the experiment's
source/config hashes and reproduce the same refusals. The current network is
deliberately certified only for open basins; more realistic thermal forcing
has now entered previously unsupported states. Do not restore hot forcing or
change demand solely to stay inside that certificate.

1. Huge1018 NOAA-plus-retired-lapse root17 has no incoming root. Its budget is
   +14.902249 for levels `22 < h <= 24`, then -3.312319 for `24 < h <= 25`.
   Wetness is defined by whole cells with ground strictly below the surface.
   There is no fractional-height root under this stepwise law. Widening the
   current Int16 water-surface contract would not create one.
2. Standard3 NOAA root37 receives 6.897626 from root39, enough to turn its raw
   full-sill deficit into +1.717064. But reversing dry sill connector312
   diverts 7.303595 of runoff and leaves the actual reservoir at -5.586531.
   Relaxing the preliminary zero-incoming certificate cannot repair actual
   supply ownership. A connected equal-level reservoir/junction component
   must distinguish component export from reservoir exchange.

The next basin design must complete the previously accepted coordinator:
explicit open/closed/dry/subtile states, disjoint catchments, actual upstream
exchange and equal-sill junction accounting before publishing receivers and
water bodies. Preserve the documented quantized-closure approximation, with
its shoreline bracket and explicit unresolved residual separate from physical
losses and floating roundoff. It is not exact stationary equilibrium. A future
claim of exact closed-lake equilibrium instead requires an explicitly designed
continuous wet-area or temporal storage law, not interpolation between two
whole-cell budgets. Do not add that larger simulator as an incidental fix.

The exact rows, every unsupported node (not just the first), real-operation
discriminators and reproducible scripts are retained under the atlas's
`earth-calibration/basin-refusal-trace/`, with
`basin-refusal-trace.mjs`, `basin-refusal-discriminators.mjs` and
`basin-refusal-design.md` beside it. Reuse root17 and root37/root39/connector312
as permanent regression inputs for the coordinator implementation. Require
source attribution, signed exchange, explicit terminal identity, complete
body admission and unchanged geometry in both these cases and the prior
supported cohort. Resolve this before enabling basin-aware terrain evolution.
