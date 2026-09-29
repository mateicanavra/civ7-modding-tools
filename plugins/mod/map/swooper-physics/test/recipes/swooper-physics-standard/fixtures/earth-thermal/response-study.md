# Monthly Thermal Response Discriminator

This is test-owned evidence, not a production strategy or a full Earth calibration.
It separates the annual geographic fit from the periodic temperature response.
No tilt, lapse, terrain height, biome quota, or production operation is changed.

## Frozen Protocol

- Input: `monthly-low-relief-land.json`, SHA256 `cdc4f1dd74a3ec6f9f92a55307ac273902a3f83ba34f010df372ce50dbf71a1f`; exactly 411 prior low-relief inland cells, 196 training and 215 held out. All fits use training cells and their original area weights.
- Calendar: 1991-2020 has 22 common and 8 leap years. January 1 midnight is elapsed time zero. The declared FAO approximation is `declination = 23.44*sin(2*pi*(t+0.5)/yearDays - 1.39)` degrees. This fixes the solar phase before fitting; it is not a decoded date from the source's synthetic year-0001 timestamps or an astronomical ephemeris.
- Circular-orbit daily-mean TOA forcing `q` is normalized by the solar constant. Four midpoint quadrature points per day integrate each actual month. Common/leap monthly means and harmonic bases are pooled by their day counts, matching the fixture's annual weights.
- Weighted QR fits intercept, annual cosine/sine, and semiannual cosine/sine to the 12 monthly means. The basis uses exact integrals over monthly intervals, not month-center values. Complex convention: `a*cos + b*sin = Re((a-i*b)*exp(i*omega*t))`.
- Lag is withheld when temperature amplitude is below 0.1 C or forcing amplitude below 0.0001 q. These declared display guards are not statistical confidence limits or acceptance quotas. All amplitudes remain in the sample output and all samples remain in model fitting/error metrics.
- The independently fitted geographic mean is `a + b*mean(q)`. It identifies a regression intercept and slope, not physical radiative feedback. Both candidate temporal models retain this identical annual mean.

The three seasonal hypotheses are: instantaneous response with geographic gain `b`; storage-only `tau*dT'/dt + T' = b*q'` with one nonnegative training-fitted relaxation time; and a periodic proxy with independent complex `G1` and `G2` fitted to the two harmonic coefficients. The last model has four identifiable real seasonal coefficients, not two inferred heat capacities. Fits minimize declared area-weighted harmonic error; evaluation reports separate area-and-day-weighted monthly error.

For the conditional storage null, `H_n = 1/(1+i*2*pi*n*tau)`, so `abs(H_n)=cos(lag_n)` and `0 <= lag_n < pi/2`. This is a joint amplitude/lag restriction, not permission to attenuate amplitude independently. Rejecting it does not reject storage with a separately identified forcing/feedback gain, spatial heat transport, or other processes.

## Results

All temperatures below are unclipped. The held-out error is never used to refit.

| Seasonal Hypothesis | Training Monthly RMSE C | Held-Out Monthly RMSE C | Held-Out Anomaly RMSE C |
| --- | ---: | ---: | ---: |
| Instantaneous geographic gain | 13.676 | 13.251 | 12.914 |
| Storage-only, shared relaxation | 6.637 | 7.063 | 6.408 |
| Independent periodic response | 3.261 | 3.573 | 1.985 |

The annual RMSE is unchanged at 2.514 C training and 2.971 C held out. The annual coefficients are `a=-37.281718 C`, `b=206.811310 C/q`. The periodic coefficients are `G1=87.415755-43.894928i C/q` and `G2=3.657858-68.662974i C/q`, corresponding to magnitudes 97.818 and 68.760 C/q and harmonic lags 27.053 and 44.111 days. The storage-null optimum is 83.248 days; this is a conditional model parameter, not a measured heat-storage timescale.

At absolute latitudes 45-60 degrees, the area-weighted mean annual gain ratio is 0.502 and the circular mean lag is 26.160 days, while the mean storage prediction at those observed lags is 0.899. The 30-45 and 60-75 degree bands show the same qualitative mismatch. Thus one fitted storage time cannot repair the geographically fitted gain's seasonal amplitude without introducing a much larger lag. The independent periodic proxy improves monthly error in every reported latitude band; `summary.json` also separates band errors by split.

The observed two-harmonic reconstruction residual itself is 0.599 C training and 0.459 C held out. Fourteen weak semiannual temperature harmonics are excluded from meaningful lag summaries, not error metrics. Tropical annual phase is not interpreted as a sufficient seasonal description: semiannual forcing and other controls matter. No monthly prediction crosses the diagnostic -40/50 C bounds; this does not certify continuous phase extrema or production clipping behavior.

The holdout occupies only two of these bands: 33 cells at 15-30 degrees and 182 at 45-60 degrees. Its other band metrics are explicitly absent, not zero. Therefore improvement in all five full-cohort bands is not five independent held-out validations. The complete cohort has 359 Northern and 52 Southern Hemisphere cells, with no land sample south of 35.24 degrees.

Four-versus-eight solar quadrature subdivisions differ by at most `2.063e-7 q`; eight-versus-sixteen by `5.156e-8 q`. These and frozen numerical replay assertions qualify computation, not empirical model acceptance. The source cohort is geographically uneven inland reanalysis, heavily Northern Hemisphere, not global area coverage, an ocean calibration, independent observational truth, a time holdout, or an uncertainty estimate. Longitude is retained for audit; no winds or maritime exposure have been inferred from it.

## Recommendation

Use an explicitly calibrated **periodic thermal-response proxy**, with annual geographic coefficients separate from annual/semiannual complex response coefficients, in one climate-owned publication chain. Do not build a unit-aware energy-balance simulator to unblock this correction. Such a simulator would require consistent absorbed flux, feedback, heat capacity, distance, velocity, and time units that the current quantized winds, spatial SST iterations, and relief proxy do not supply. The annual warm-bias correction need not wait for those additions.

Compute the forcing harmonics from sufficiently resolved seasonal geometry, then evaluate the response at the recipe's requested phases. Four equally spaced output phases cannot identify both semiannual coefficients, so they must not also be the calibration basis. Keep the empirical parameter names and units honest. Qualify interpolation, harmonic truncation, clipping, and non-Earth configurations separately before adoption.

The current baseline independently computes each phase, reusing an SST field that is initialized from true latitude and iterated spatially. Those iterations are not elapsed seasonal time. SST only alters water temperatures; land has no wind-mediated maritime thermal exchange. Pressure and moisture must consume the same resulting phase family as demand and `thermalField`, rather than recomputing the old instantaneous relation through another path. Retain the existing lapse projection without relabeling proxy elevation as physical altitude.

The minimal maritime extension is a directional, upwind mixing of **seasonal thermal anomalies** within that same response domain, using land/ocean end members and the existing wind field, not a radial coast-distance temperature bonus. Its exposure scale is a declared grid-relative proxy until separately qualified. Jointly calibrate its response coefficients rather than adding it on top of the globally fitted `G1/G2`, which already include unresolved maritime influence. This inland fixture identifies the periodic coefficients but cannot identify an ocean end member or an exchange rate; those values must not be fabricated to ship the annual correction.

The causal motivation is [McKinnon, Stine and Huybers (2013)](https://phuybers.sites.fas.harvard.edu/Doc/McKinnon_JC2013.pdf), DOI `10.1175/JCLI-D-13-00021.1`: their extratropical analysis links amplitude and lag structure to land/ocean influence and atmospheric advection. Their coupled model is evidence for directional exchange, not evidence that this game's wind magnitude is a physical velocity or that one local heat-capacity knob is sufficient. The daily geometry and fixed phase approximation follow [FAO-56 chapter 3](https://www.fao.org/4/x0490e/x0490e07.htm), with the study's circular-orbit and leap-year conventions explicit above.

Before any maritime adoption, use one idealized wind-reversal discriminator: a flat, fixed-latitude periodic strip with an ocean segment and a land segment; prescribe distinct zero-annual-mean ocean/land harmonic cycles and frozen uniform winds. Reversing winds must mirror the downstream maritime footprint while unchanged coast distance cannot. Zero exchange must reproduce the local periodic solution; zero wind must remove advective asymmetry; equal end members must produce no anomaly; increasing upwind ocean exposure must approach the prescribed ocean harmonic without overshoot. Preserve each local annual mean and report annual and semiannual complex coefficients, not just range. This is a directional causality test, not an empirical tuning target or proof of physical energy conservation.

Acceptance for the bounded periodic change should compare predeclared training/held-out monthly and anomaly errors, report band regressions, preserve the independent annual fit, and pass algebraic and integration checks. The frozen results justify the next bounded candidate; they do not authorize a hidden tolerance chosen to force particular climate or biome coverage.

## Reproduction

Run `bun test plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/stages/hydrology/earth-thermal-response.test.ts`.

Run `bun plugins/mod/map/swooper-physics/test/recipes/swooper-physics-standard/fixtures/earth-thermal/response-capture.ts [output-root]`. The default root is `earth-calibration/thermal-response-20260929` under the existing VisualAtlas `huge-1018` directory. Each run creates an exclusive timestamped directory containing frozen primary-source bytes, monthly input, summary, sample predictions, scoped source snapshots/digests, runtime, protocol, and receipt. It refuses changed monthly or primary-source hashes. Production code is not imported; the receipt makes no whole-worktree freeze claim.
