# Earthlike geography study

**Executable authority:** [`earthlike-geography.study.ts`](earthlike-geography.study.ts)
**Target ID:** `swooper-earthlike/geography`

## Question and design

Does one representative Earthlike map retain broad terrestrial, hydrologic, and
biome coverage? The sample study runs `swooper-earthlike` on `MAPSIZE_STANDARD`
(84 x 54, 8 players) at seed `1337` and applies `standard/integrity` first.

## Measurements and expected outcomes

Geography must retain land share from `0.15` through `0.90` and lake share at or
below `0.20`. Hydrology must contain river coverage and zero receiver-integrity
violations. Ecology must expose at least two biomes and a non-null dominant biome.

**Expectation IDs:** `land-share-floor`, `land-share-ceiling`, `lake-share`,
`river-coverage`, `hydrology-receiver-integrity`, `biome-diversity`, and
`dominant-biome`.

This is a representative product sentinel, not a claim that one seed describes
the Earthlike distribution. Cohort studies own distributional claims.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
