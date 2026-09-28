# Earthlike climate structure study

**Executable authority:** [`earthlike-climate-structure.study.ts`](earthlike-climate-structure.study.ts)
**Target IDs:** `swooper-earthlike/climate-structure`,
`swooper-earthlike/climate-biome-structure`

## Question and design

Does Earthlike preserve geographic climate variation within latitude bands,
without using widespread rainfall saturation to create wet regions? The cohort
contains Huge 1018 (106 x 66, player IDs 0-9) and Standard 1018, 1, and 42
(84 x 54, player IDs 0-7). Map and game seeds are equal in each case. These exact
scenario identities reuse captures from the existing study bank; every sample
also receives `standard/integrity`.

The bounds were declared before production correction, not fitted to passing
outputs. They are product regression bounds, not observational Earth calibration:
rainfall uses a bounded empirical 0-200 scale and relief has no physical-meter
calibration. The existing Huge 1337 biome-structure study and all other studies
retain their original thresholds.

## Measurements and expected outcomes

| Measurement | Every-map expectation |
| --- | --- |
| Maximum seasonal land rainfall saturation | <0.10 |
| Refined annual land rainfall saturation | <0.05 |
| Pooled within-row land temperature SD | 1-8 C |
| Land-weighted dominant biome share in qualified rows | <=0.75 |
| Tundra or boreal land tiles | >=1 |
| Classified land biome families | >=3 |

Saturation counts rainfall at or above 200 and excludes modeled water from both
count and population. Baseline annual saturation is retained as causal evidence,
without an additional target. Seasonal rainfall arrays stay invocation-local;
the baseline metrics facet retains each season's saturated count and land
population. Missing seasonal evidence is a capture failure, not a passing zero.

Temperature SD removes each row's land-only mean, then computes
`sqrt(sum(squared departures) / total land tiles)`. This weights rows by their
land population rather than giving a short island row the weight of a continent.
Zero within-row variance fails the lower bound. A missing land population yields
null evidence.

Biome dominance sums each row's modal classified-biome count, divided by total
land in those same rows. Only rows containing at least 20 land tiles qualify.
Biome IDs are categories, never numeric distances; unclassified 255 is not a
biome and remains a separate integrity failure. Empty qualified populations are
missing evidence, not zero dominance.

**Expectation IDs:** `seasonal-land-rainfall-saturation`,
`refined-land-rainfall-saturation`, `within-row-temperature-variation-floor`,
`within-row-temperature-variation-ceiling`, `land-weighted-row-biome-dominance`,
`cold-biome-presence`, and `land-biome-diversity`.

The [Hydrology family](../families/hydrology.md) owns physical climate facts;
the [Ecology family](../families/ecology.md) owns categorical row structure.
Targets evaluate cohort extremes, so a good seed cannot hide a failing seed.

## Proof

```bash
civ7 mapgen metrics report
nx run swooper-physics:test
```

Headless capture and targets establish modeled behavior only. Native appearance
and runtime realization still require separate Civ7 proof.
