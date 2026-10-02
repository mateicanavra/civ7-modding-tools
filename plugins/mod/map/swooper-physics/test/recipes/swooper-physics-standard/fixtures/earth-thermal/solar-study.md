# Solar Geometry Discriminator

This retained protocol describes an archived pre-periodic measurement. Its
`solar-study.ts` and `solar-capture.ts` execution paths are retired; historical
capture bytes and scientific sources remain unchanged. Current thermal studies
use the periodic response owner, while `solar-geometry.ts` remains an independent
FAO geometry oracle rather than an alternate production forcing path.

Test-owned evidence only. Nothing here selects a production strategy, changes
Earth's tilt or lapse rate, adjusts biome targets, or calibrates a full climate.
The original thermal reference and its 411-cell cohort are unchanged.

## Question And Controls

Can correcting daily solar geometry, while fitting only an annual intercept and
gain, distinguish annual calibration error from seasonal response error?

The existing shifted curve is compared with an independent daily-mean TOA
reference based on [FAO-56 chapter 3](https://www.fao.org/4/x0490e/x0490e07.htm),
equations 21, 25 and 34. With constant Earth-Sun distance, the dimensionless
reference is daily mean irradiance divided by the solar constant:

```text
A = sin(latitude) sin(declination)
B = cos(latitude) cos(declination)
H = acos(-A/B) between polar-night/day limits
q = (H A + B sin(H)) / pi
daylightHours = 24 H / pi
```

The implementation classifies polar night/day from `A+B` and `A-B`, avoiding
the tangent singularity at the poles. Independent numerical integration of a
clipped normal/sun dot product qualifies the formula. Equal-area integration
gives global mean `q=1/4` at each tested declination. Equatorial equinox gives
`q=1/pi`. These tests establish incident geometry, not surface heating.

Only distance is circularized. The existing harmonic declination schedule
`23.44 sin(2 pi phase)` is held fixed to isolate the daily-geometry change;
it is not claimed to be an exact orbital-longitude model or dated ephemeris.
Both geometries are evaluated at 4, 48 and 384 equally weighted phases.

The frozen 196 training and 215 held-out cells retain their Gaussian area
weights. Fits minimize annual, unclipped, weighted squared temperature error
using two coefficients only. Holdout responses and monthly ranges never enter
the fit. All rows are land with model elevation and sea level zero. Source
geopotential meters are never converted to model relief units.

The real admitted production thermal operation evaluates each phase. Its
existing gain bound cannot admit the fitted gain in `q` units directly, so the
test uses the fixed conversion `I=4q`, a global-mean-one proxy. This changes
units, not predictions or fitted freedom: `T=a+bq` becomes production
`base=a+b/8`, `gain=b/4`. This adapter is not a proposed production contract;
the existing proxy is already permitted to exceed one. The comparison with
the shifted curve also calls the real radiative-forcing operation.

## Results

RMSEs below are unclipped annual errors in Celsius. Phase ranges are weighted
means of each cell's sampled maximum minus minimum, not ranges of a zonal
mean. Every fitted case has zero phase clipping at the fixed `[-40,50]` bounds.

| Geometry | Phases | Train RMSE | Holdout RMSE | 0-15 range | 60-75 range |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shifted curve, annual fit | 4 | 2.559 | 3.035 | 12.272 | 31.157 |
| Daily TOA, annual fit | 4 | 2.548 | 2.992 | 10.727 | 75.130 |
| Shifted curve, annual fit | 48 | 2.458 | 2.928 | 14.402 | 31.363 |
| Daily TOA, annual fit | 48 | 2.514 | 2.971 | 11.129 | 74.432 |
| Shifted curve, annual fit | 384 | 2.458 | 2.928 | 14.512 | 31.364 |
| Daily TOA, annual fit | 384 | 2.514 | 2.971 | 11.142 | 74.433 |
| NOAA monthly climatology | 12 months | n/a | n/a | 3.278 | 35.322 |

The original unfitted baseline has all-cohort annual RMSE 17.006 C before
clipping and 16.770 C after clipping. Its upper bound affects 8.025% of
weighted phase area and 24.713% of sample area, lowering the annual cohort
mean by 0.210 C. That saturation is distinct from the seasonal geometry issue.

For dense daily geometry, the raw-q fit is `a=-37.28171794909175 C` and
`b=206.81130964326928 C`. The admitted proxy parameters are base
`-11.43030424368309 C`, gain `51.70282741081732 C`, land cooling zero.
The parameterization is diagnostic, not an authored Earth profile.

## Interpretation

Annual intercept/gain calibration removes the large baseline warm bias.
Correct daily geometry fixes a separate defect: latitude minus declination
does not determine daily solar energy because daylight duration also matters.
However, this geometry correction is not a seasonal thermal repair. The
instantaneous affine response still gives excessive tropical variability and
roughly doubles the retained high-latitude monthly range. Denser phases do not
remove that discrepancy; annual results have already nearly converged by 48.
Daily geometry also does not uniformly beat the shifted curve's annual fit.

The next causal investigation should distinguish annual spatial temperature
response from temporal response to seasonal forcing. Retain phase-resolved
reference months and explicit calendar alignment, then test storage/lag and
transport hypotheses independently of the annual fit. These range summaries
do not identify a heat capacity, relaxation time, attenuation coefficient, or
unique missing process. A smaller tilt or fitted seasonal attenuation would
hide this question rather than answer it.

Do not equate phase samples with monthly air-temperature means. The NOAA
cohort is reanalysis low-relief land, not Earth's global mean, ocean SST, or
land skin temperature. No uncertainty interval or full-climate validation is
claimed. Those limitations survive even when an annual fit looks good.

## Replay And Evidence

```bash
bun test plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/stages/hydrology/earth-solar-geometry.test.ts
bun plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth-thermal/solar-capture.ts
```

Capture creates an exclusive timestamped run directory beneath
`~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/solar-geometry-20260929`.
An optional positional argument selects a different output root. Prior
receipts are never overwritten. The capture freezes FAO HTML and the NOAA
fixture, source/runtime/config digests, protocol, per-sample phase results,
unclipped/clipped cohort errors, clipping shares, numerical parity and all
five latitude-band ranges. A changed source hash refuses capture; offline
tests require no network. Numerical capture is not a substitute for tests or
the owning TypeScript check.
