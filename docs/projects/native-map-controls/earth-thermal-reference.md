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
