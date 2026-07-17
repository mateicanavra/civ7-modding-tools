# Earthlike deep-ocean study

**Executable authority:** [`earthlike-deep-ocean.study.ts`](earthlike-deep-ocean.study.ts)
**Target ID:** `swooper-earthlike/deep-ocean-cohort`

## Question and design

Does Earthlike water remain deep-ocean dominant across Civ7 map sizes and seed
rolls? The cohort contains Tiny, Small, Standard, Large, and Huge at seed `1337`,
plus Standard and Huge at seeds `7` and `42`: nine scenarios. Named preset grids
range from 60 x 38 to 106 x 66 and retain their canonical player counts.

## Measurements and expected outcomes

The [geography family](../families/geography.md) distinguishes coast from deep
ocean on the realized headless surface. Every sample passes `standard/integrity`;
the cohort minimum deep-ocean share must be at least `0.40`.

**Expectation ID:** `deep-ocean-floor`.

The minimum comparator means every scenario, not merely the cohort mean, clears
the floor.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
