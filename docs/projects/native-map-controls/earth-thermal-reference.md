# Independent Earth Thermal Reference

This diagnostic compares actual radiative-forcing and thermal-state operations
with a pinned external low-relief land reference. It does not adopt a new map
profile, establish a physical relief scale, or change a metric-study target.

## Source And Meaning

The source is NOAA PSL's NCEP-NCAR Reanalysis 1 monthly 2 m air-temperature
climatology for 1991-2020, plus its matching Gaussian surface geopotential
height and land mask. The three files total 1,046,482 bytes. Their exact URLs,
byte sizes, and SHA-256 hashes are retained in
`plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth-thermal/noaa-low-relief-land.json`.

- [Temperature metadata](https://www.psl.noaa.gov/thredds/dodsC/Datasets/ncep.reanalysis/Monthlies/surface_gauss/air.2m.mon.ltm.1991-2020.nc.html)
- [Source catalog, including height and mask](https://psl.noaa.gov/thredds/catalog/Datasets/ncep.reanalysis/Monthlies/surface_gauss/catalog.html)
- [NOAA variable classification](https://www.cpc.ncep.noaa.gov/products/precip/atlas_2/cont_data.html)

This is reanalysis, not raw observations. NOAA classifies 2 m temperature as
type B: observations influence it, but the model has strong influence too.
Two-meter air temperature is not land skin temperature. The Swooper
`surfaceTemperatureC` proxy therefore needs an explicit comparison convention
before a temperature fit becomes product calibration. Ocean air is not SST;
this fixture contains no ocean samples.

## Extraction Contract

The sources share 94 Gaussian latitudes and 192 equally spaced longitudes.
The extractor validates exact coordinate agreement, source hashes, Kelvin
units, identity scale/offset, finite valid temperatures, and 30 contributing
years at every monthly cell. Kelvin is converted to Celsius by subtracting
273.15. Surface height remains the source model's geopotential meters; it is
never passed into Swooper's normalized relief field.

The land-mask file supplies no `flag_meanings`. Its `-1=land, 0=water` coding
is inferred and checked against Sahara, Amazon, and Siberian land controls
and Pacific, Atlantic, and Indian Ocean controls.

The retained cohort requires all nine cells in a wrapped-longitude 3x3
neighborhood to be land, absolute source height at most 250 m, and source
neighborhood height range at most 250 m. Polar edge rows are excluded. These
are coarse reanalysis terrain criteria, not sub-grid terrain measurements.
The result is 411 cells and is geographically unbalanced, particularly toward
Northern Hemisphere interiors. Its mean must not be called Earth's mean.

Spatial weights are 94-point Gaussian quadrature weights; the extractor
checks their implied latitudes against the source to within 0.0001 degree.
Equal longitude widths cancel in weighted means. Annual temperatures use
mean Gregorian month lengths over 1991-2020, including eight leap Februaries.
These are day-weighted monthly-climatology approximations, not reconstructed
daily records. The source's climatology bounds identify first/last same-month
starts, so their differences are not valid month weights.

Training uses absolute-latitude bands [0,15), [30,45), and [60,75): 196 cells.
Held-out bands [15,30) and [45,60) contain 215 cells. Membership is frozen and
explicit per sample. The fixture retains annual temperature, monthly range,
source cell identity, latitude, source-height admission evidence, and area
weight; it does not require NetCDF readers during tests.

## Frozen Diagnostic Fit

The external analysis fixed forcing endpoints to 1 and 0.25, exponent 1.2,
and four equal phases with declinations 0, +23.44, 0, and -23.44 degrees.
Area-weighted least squares on the training cells fitted the two identifiable
affine combinations only. Base temperature, land cooling, forcing gain, and
both forcing endpoints cannot all be inferred independently.

The frozen fit has `insolationScaleC = 72.58464582463931` and
`baseTemperatureC - landCoolingC = -3.612945666608553`. The test represents
this gauge with zero land cooling. This is diagnostic parameterization, not
a recommendation to set an authored world profile to these values.

The test calls the real admitted `computeRadiativeForcing` and
`computeThermalState` operations. Every source point is a separate test row;
this is not a reconstructed map. Model elevation and sea level are both zero,
all samples are land, and albedo is excluded. No source meters or native
Firaxis elevation indices are converted into model relief units. Seasonal
outputs are averaged equally, matching the model's four-phase convention,
not pretending those phases are monthly observations.

| Diagnostic | Bias C | RMSE C | MAE C |
| --- | ---: | ---: | ---: |
| Frozen fit, training | 0.000 | 2.559 | 1.987 |
| Frozen fit, held-out bands | -1.449 | 3.035 | 2.553 |
| Original neutral baseline, all retained cells | 16.529 | 16.770 | 16.529 |
| Retired neutral refine, all retained cells | 0.549 | 4.058 | 3.132 |

Original comparisons are literal fixtures, not imports of evolving authored
configs. Baseline retains its four phases, 1.5/0.22 forcing endpoints, 8 C
base, 50 C gain, 3.2 C land cooling, and -40/50 C clipping. Retired refine
retains its actual single unshifted phase, 0.9/0.1 endpoints, exponent 1,
9 C base, 50 C gain, 0.32 C land cooling, and -60/50 C clipping. Its severe
old lapse does not participate at zero relief.

Numerical assertions allow 0.0001 C error against the external float64
analysis to accommodate production float32 fields. That is a computation
parity tolerance, not a scientific realism threshold. The frozen fit also
predicts a 12.272 C tropical four-phase range versus a 3.278 C source monthly
range. The test preserves that mismatch as evidence; it does not claim these
differently averaged quantities should be identical.

## Reproduction

The repository owns the frozen JSON references, source pins, TypeScript
consumers and Bun checks. It does not own a Python environment, extraction
runtime, package cache or Python test target. Ordinary development and CI use:

```sh
bun test plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/stages/hydrology/earth-thermal-reference.test.ts
bun test plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/stages/hydrology/earth-monthly-reference.test.ts
```

The one-off extraction tools, their source-backed checks and reference copies
are retained outside the checkout at `noaa-extraction/` under
`~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/`.
Its README records the offline replay command. The three source files and
temporary analysis dependencies also remain outside the checkout. Extraction
refuses source-pin drift; monthly replay preserves the original annual cohort
byte-for-byte and does not refit it. The original bounded analysis used Python
3.11, NumPy 2.2.4 and h5py 3.11.0; this is historical provenance, not a repository
toolchain requirement. The broader analysis and receipts remain in that same
external evidence directory, discoverable through [local viewers](../../process/LOCAL-VIEWERS.md).

Next calibration work should keep annual error, seasonal contrast, and relief
response separate. Fitting annual lowland temperature does not validate polar
day length, thermal lag, maritime transport, or a lapse per physical meter.
Changing vegetation quotas or inflating lapse to repair within-row variance
would not answer those missing mechanisms.

## Solar Geometry Discriminator

The test-owned `fixtures/earth-thermal/solar-*` extension compares the current
shifted-latitude curve with daily-mean top-of-atmosphere solar geometry from
[FAO-56 equations 21, 25 and 34](https://www.fao.org/4/x0490e/x0490e07.htm).
It keeps the harmonic 23.44-degree declination schedule and explicitly assumes
circular orbital distance. Independent hour-angle integration, global
area-mean irradiance of one quarter of the solar constant, equinox/equator
irradiance of one over pi, polar transitions and hemisphere symmetries qualify
the geometry. The source HTML and unchanged NOAA cohort are pinned.

Each candidate fits only its annual affine intercept and gain on the same
196 training cells, then evaluates the existing admitted thermal operation
on the 215 held-out cells. Four, 48 and 384 phases distinguish geometry from
sampling error. No seasonal attenuation is fitted. Clipping and float32
roundoff are reported separately; none of the fitted cases physically clips.

At 384 phases the current curve's annual held-out RMSE is 2.928 C and daily
geometry's is 2.971 C. Daily geometry reduces the tropical phase range from
14.512 to 11.142 C, still well above the reference monthly range of 3.278 C.
At 60-75 degrees it increases the range from 31.364 to 74.433 C, versus the
reference's 35.322 C. Phase ranges and monthly means are not identical temporal
quantities, but these results reject a geometry-only production replacement:
an annual spatial fit applied instantaneously is not a qualified seasonal
thermal response. The experiment does not identify a physical heat capacity.

The final capture is
`earth-calibration/solar-geometry-20260929/run-2026-09-29T16-41-21.588Z/`
under the same external evidence root. Its receipt SHA-256 is
`fbb5c7dd9d9fc8b7845ff45bc0650b7ede80f47952db8ac8072c4f0e79cd5c97`.
See the adjacent `solar-study.md` for the complete protocol and rerun command.
This is a discriminator, not adopted coefficients or a new production strategy.

## Fixed-Height Thermal Discriminator

The follow-through admits the same pinned NOAA sources over all source-mask
land, retaining the original 411-cell cohort and its exact train/holdout
identities. It freezes the accepted periodic response and asks how known source
height changes its predictions. The remaining land is **out of fit**, not an
independent validation sample: neighboring cells and climatological regimes
remain dependent, and polar/high-terrain samples extend the fitted domain.

Each source cell is an independent input row to the actual admitted solar and
thermal operations. This is not a new Earth grid, complete map, pressure
simulation or hydrological reconstruction. No Foundation artifact is fabricated
and no production height field acquires a physical unit implicitly.

The zero-height control is compared with two diagnostic encodings:
`round(sourceGeopotentialHeight / q)`, for `q = 1` and `q = 10` geopotential
metres per model unit. Sea datum is zero and the lapse coefficient is multiplied
by the same `q`. The illustrative lapse is -0.0065 C per geopotential metre,
following the lower-layer convention in [NASA/TM-2005-213659, Table 1](https://ntrs.nasa.gov/api/citations/20050207438/downloads/20050207438.pdf).
That standard vertical profile is not evidence for a universal geographical
surface-temperature lapse. This experiment neither estimates that coefficient
nor adopts either encoding for generated maps.

The paired runs must agree within height-rounding and Float32 reconstruction
error; their sea-level thermal samples and means must remain exact. The latter
are pressure inputs, not evaluated pressure fields. Negative source heights
remain in the evidence and are reported separately because the existing
operation clamps height-above-sea at zero. Broad diagnostic clipping bounds
must be demonstrated inactive, not presumed so.

Actual operation-derived harmonics are integrated over the existing frozen
Gregorian month windows and equinox alignment. Monthly observations are never
compared with month-center instantaneous temperatures. Annual publication stays
independent of monthly reconstruction. Error summaries distinguish altitude,
latitude, original training/holdout, out-of-fit land and the +/-80-degree crop.
These describe sensitivity, not new pass/fail Earth accuracy targets.

The lowland fit already includes some nonzero heights, which can affect its
annual intercept and geographic gain. Both remain frozen; no compensating
refit is allowed. Source geopotential height is coarse model orography and the
temperature reference is 2 m air, not terrain-surface skin temperature. Missing
land heat transport and maritime behavior remain separate model limitations.
Precipitation, runoff and native river projection are outside this diagnostic;
their other raw-height coefficients are not made physical by this conversion.

### Results And Reproduction

The pinned JSON contains 5,914 source-mask land cells, including 4,970 within
the +/-80-degree crop, all original 196 training and 215 holdout cells, and
80 below-sea-level source heights. The latter remain signed in the reference;
the q10 encoding rounds 12 of them to zero rather than silently dropping them.
Source height ranges from -276 to 5,760 geopotential metres. The full fixture
SHA-256 is
`11827210fcde734c4c3e1a9497e03ec21c516e6eec9aef364fe6236ec2943282`.

| Diagnostic | Zero height | Known height, q1 |
| --- | ---: | ---: |
| Global land annual RMSE, C | 9.680 | 5.494 |
| Global land monthly RMSE, C | 10.241 | 6.432 |
| +/-80 land annual RMSE, C | 8.541 | 5.108 |
| Original lowland holdout annual RMSE, C | 2.971 | 3.377 |
| Height >=4,000 m annual bias, C | +24.256 | -7.248 |

Known height removes a substantial warm error at altitude, but the assumed
lapse overshoots there and worsens the original lowland holdout. This rejects
both treating the global error as purely a solar problem and treating a larger
uniform lapse as a completed calibration. The remaining residuals do not by
themselves identify a unique lapse, heat-transport law or relief scale.

All three arms remain unclipped. Maximum calendar-reconstructed versus
published annual difference is 0.000002265 C; maximum q1/q10 difference is
0.0325021 C against a 0.03575 C height-rounding bound plus 0.0001 C Float32
budget. Sea-level thermal pressure inputs remain exact. Independent review
and the focused old-replay/new-height tests passed: eight tests and 47,337
assertions. Neither frozen coefficients nor product metric targets changed.
The owning definition/realization graph passes types, builds and policy, with
1,012 definition tests and all 175 realization tests passing. The sole failing
definition test is the aggregate study bank: its twelve failed expectations
are exactly the ocean-strength baseline, including Standard Earthlike forest
presence. That unresolved calibration bank is not presented as green.
See `earth-height-owning-proof-20260929.log` in the external evidence root.

Run from the repository root after the owning dependency build:

```sh
bun test plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/stages/hydrology/earth-height-reference.test.ts
bun plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth-thermal/height-capture.ts "$HOME/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/fixed-earth-height-20260929"
```

The capture requires an explicit external destination, creates a fresh run,
and checks pins, numerical controls and source stability before publishing its
receipt. The post-build capture is
`fixed-earth-height-20260929/run-2026-09-29T20-49-33.947Z/` under the external
Earth-calibration evidence root; receipt SHA-256
`318596f411ad506a515e21aabb13ae033ec54ea76d43c355f7ca8a16ccb57e6c`.
The numerical report is byte-identical to the preceding reviewed capture,
SHA-256 `384979c922569875141d46e1c072c5f59ec790da5ae79167eb28223d9704ee4c`.
The repo contains only the pinned JSON and Bun/TypeScript consumer; no Python
toolchain, dependency directory, cache or extraction target is introduced.

### Source-Latitude Variance Follow-Through

The next sealed study groups those same retained samples by their **original
Gaussian source row**, not by the helper's artificial independent input rows.
It preserves all source land weights, original training/holdout identities,
frozen thermal response and zero/q1/q10 arms. Each cohort is demeaned within
its selected source rows. Singleton rows retain their area mass and contribute
zero variance; their support and paired-row-only results are reported.

| Annual Within-Latitude RMS, C | Observed | Known Height q1 | Residual |
| --- | ---: | ---: | ---: |
| All source land | 5.3114 | 4.8909 | 2.7081 |
| +/-80 source land | 5.1287 | 4.8513 | 2.6548 |
| Original low-relief cohort | 2.2038 | 0.3567 | 2.0809 |
| Original low-relief holdout | 2.3148 | 0.3617 | 2.1618 |

Zero-height predictions have numerically zero within-row variation. Known
height reduces paired row-demeaned error variance by 74.0% across all source
land but only 10.8% in the original low-relief cohort. These are error reductions,
not independent causal variance shares: the retained budget includes covariance.
Day-weighted monthly residual RMS remains 3.5181 C globally and 2.5186 C in
original low-relief. Monthly fields are separately demeaned before weighting,
not replaced by annual means or month-center instantaneous predictions.

Height improves within-row structure while worsening total original holdout
RMSE from 2.9710 to 3.3768 C; the row-mean bias is a different error axis. The
high-altitude overcooling likewise remains. The reference therefore supports
two separate questions: missing height-linked variation and missing low-relief
land inputs/processes. It does not select a stronger lapse, invent a physical
scale for generated relief, or uniquely identify maritime exchange. The
[generated four-case budget](land-thermal-variance.md) is a different population
and geometry, not a matched-grid Earth accuracy test.

Full source copies, actual admitted inputs/outputs, per-month/per-source-row
moments and repeat receipts live at
`earth-calibration/earth-height-latitude-variance-20260930/`. Root reran five
analysis tests (34 assertions) and the read-only verifier: both independent
processes match all ten retained artifacts, and 232,440 independent pairwise
moment checks pass with maximum discrepancy `4.733e-12 C^2`. Clipping is
inactive, sea-level thermal pressure inputs remain byte-exact, and q1/q10
differences remain within the original rounding budget. The executed 910-file
source inventory SHA-256 is
`5d08cfe481d4f70a2ff7494016ace4ec108c56922ecb66a8e7cb50efc55e2e24`;
it is not a whole-checkout identity. The adjacent README gives repeatable Bun
commands. No procedural recipe, product coefficient or expectation changes.
Independent eight-file review found no actionable grouping, weighting,
covariance-sign, temporal-aggregation or membership defect. It did not rerun
the verifier or independently rehash retained arrays; the execution proof
above remains root-owned.
