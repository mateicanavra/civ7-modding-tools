# Earthlike orogeny study

**Executable authority:** [`earthlike-orogeny.study.ts`](earthlike-orogeny.study.ts)
**Target ID:** `swooper-earthlike/orogeny-cohort`

## Question and design

Do Earthlike Huge maps form long mountain systems with passes, valleys, and
foothills rather than solid walls? The cohort runs `MAPSIZE_HUGE` (106 x 66,
10 players) at seeds `1018`, `2024`, and `5050`.

## Measurements and expected outcomes

Every sample passes `standard/integrity`. The cohort minima require mountains,
mountain-region diameter `>=38`, region size `>=450`, non-mountain share `>=0.65`,
flat share `>=0.35`, at least `300` flat-region tiles, shoulder share `>=0.25`,
and mountain-spine diameter `>=25`; maximum mountain share is `<=0.38`.

**Expectation IDs:** `mountain-presence`, `mountain-region-diameter`,
`mountain-region-size`, `mountain-region-non-mountain-share`,
`mountain-region-flat-share`, `mountain-region-flat-volume`,
`mountain-region-mountain-share`, `mountain-region-shoulder-share`, and
`mountain-spine-diameter`.

The [relief family](../families/relief.md) measures topology and composition on
the periodic odd-Q grid. These bounds define the Earthlike orogeny product.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
