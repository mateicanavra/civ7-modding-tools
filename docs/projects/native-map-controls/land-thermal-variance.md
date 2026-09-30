# Land Thermal Variance

The remaining Earthlike thermal-structure failure is measured, not an inference
from the aggregate test log or the old profile experiment. This bounded study
runs the exact four `earthlike/climate-structure` cases without changing forcing,
relief, coefficients, classifier thresholds or study expectations.

## Current Measurements

| Case | Within-Row Land Temperature RMS C | Row-Biome Dominance |
| --- | ---: | ---: |
| Huge1018 | 0.14935597 | 0.74427481 |
| Standard1018 | 0.12778222 | 0.77579092 |
| Standard1 | 0.18130853 | 0.75327511 |
| Standard42 | 0.16326509 | 0.74609929 |

All four fail the authored 1 C floor and pass the 8 C ceiling. Standard1018
and Standard1 exceed the 0.75 dominance target. These are generated-product
checks, not observational Earth accuracy thresholds.

Temperature uses every original modeled land tile, including planned freshwater,
and pools cell deviations from each land-row mean. Biome dominance excludes
planned lakes and qualifies rows with at least twenty terrestrial cells. The
diagnostic reproduces both actual metric populations and values exactly.

## Causal Budget

The test-owned replay invokes the actual solar, sampling, thermal and refinement
operations. Complete thermal output equals published `thermalField` byte-for-byte;
the final albedo output equals `climateIndices.surfaceTemperatureC`. Demand,
water-budget and cryosphere replays also reproduce all five final climate-index
arrays exactly. There is no second temperature implementation or production
observer added for this study.

| Case | Relief Lapse RMS C | Albedo Departure RMS C |
| --- | ---: | ---: |
| Huge1018 | 0.10813649 | 0.10338472 |
| Standard1018 | 0.09964702 | 0.08765118 |
| Standard1 | 0.17848359 | 0.06151021 |
| Standard42 | 0.11931624 | 0.11537132 |

Clipping is exactly inactive on every land tile. The frozen periodic forcing
is row-only after removing lapse, to Float32 precision. Lapse and albedo have
small negative covariance, but both spatial contributions are already small;
cancellation does not explain the order-of-magnitude shortfall. Including
numerical residue and all pairwise covariances closes variance within
`8.68e-17 C^2`; residue RMS is below `4.25e-7 C`.

Generated within-row relief standard deviation is 15.33-27.46 **model units**.
Foundation supplies normalized geological proxies and Morphology remaps them
into quantized relief. Neither producer establishes metres. Increasing lapse
until this study passes would therefore invent a unit conversion, not recover
one. Earlier [stagewise relief evidence](thermal-coherence.md#relief-units-are-a-separate-calibration-question)
also rejects erosion, margin processing and clipping as the observed thin-tail
cause in its held cases.

## Separate Biome Axis

Desert, stable biome index7, dominates the leading excess rows. Standard1018
row16 has 48/51 desert cells at mean17.136 C, temperature SD0.139 C, effective
moisture mean149.92 with SD27.35, and mean aridity0.304. The classifier's current
moisture boundaries `[90,188,228,252]` and aridity shift at0.20 place most of
that population in an arid category despite significant moisture variation.

This is consistent with the actual classification mechanism, not an isolated
ablation of category smoothing. Thermal variation alone is not assured to fix
biome dominance. Keep moisture/category allocation, aridity shifting and edge
refinement as separate candidate causes; do not repair them with biome quotas
or assume every individually dominant row violates the global weighted target.

## Next Discriminator

The [fixed-height source-latitude comparison](earth-thermal-reference.md#source-latitude-variance-follow-through)
now measures those populations with source Gaussian-row grouping, original
land weights and frozen response. Known height reduces row-demeaned error
variance by 74.0% globally but only 10.8% in the original low-relief cohort;
the latter retains 2.0809 C annual and 2.5186 C monthly residual RMS. This
separates height-supplied variation from unexplained low-relief variation.
It does not uniquely identify maritime exchange. A
directional thermal-exchange design needs matched monthly SST, coastal/inland
air and wind evidence, plus an explicit driving vintage because phase winds
are themselves downstream of thermal pressure. No new production strategy,
physical-height convention or fixture-fed procedural branch is selected here.

## Reproduction

Evidence lives at `earth-calibration/land-thermal-variance-20260930/` in the
documented VisualAtlas user-data root. `run-study.mjs`, `analysis.mjs`,
`analysis.test.ts` and `verify-evidence.mjs` retain complete compressed arrays,
source/runtime inventories and strict output destinations. The existing owning
definition's `runAdmittedOperationForTest` pattern is used for diagnostics;
production callers still consume finite recipe contracts and public artifacts.

Root reran five Bun tests (23 assertions) and the evidence verifier. Two complete
runs match all 48 captured field hashes and all four compressed evidence files;
all twenty final climate-index arrays replay exactly. Actual executed
source/runtime inventory SHA-256:
`1ee51fb96487daeb69332890341c784cb6bbdbce6d932bf03be7bb9f61269b31`.
The receipt retains the coordinator's earlier declared revision separately
from that measured inventory; it is not a whole-checkout Git identity claim.
An independent eight-file read found no actionable defect in metric populations,
causal vintages, covariance accounting or interpretation. It did not rerun the
tests/verifier; those remain root-owned proof. Covariance closure alone is an
algebraic identity, while exact operation replay, row-only raw forcing and
negligible residue supply the independent attribution guards.
No native Civ7 comparison or final calibration acceptance is claimed.
