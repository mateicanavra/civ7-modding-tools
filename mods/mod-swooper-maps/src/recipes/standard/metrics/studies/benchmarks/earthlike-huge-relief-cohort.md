# Earthlike Huge relief cohort

**Executable authority:** [`earthlike-huge-relief-cohort.study.ts`](earthlike-huge-relief-cohort.study.ts)
**Target ID:** `swooper-earthlike/huge-relief-cohort`

## Question and design

Does useful, geographically broken relief persist across representative Huge-map
seed rolls? Four `MAPSIZE_HUGE` scenarios (106 x 66, 10 players) use seeds `1`,
`42`, `99`, and `7777`.

## Measurements and expected outcomes

Every sample passes `standard/integrity`. Cohort minima require modeled hills
`>=0.12`, foothills `>=0.08`, observed hills `>=0.08`, mountain-region diameter
`>=30`, non-mountain share `>=0.65`, flat-region share `>=0.35`, and a flat
pocket of at least `50` tiles. Cohort maxima require rough-upland share `<=0.08`,
largest rough-upland component `<=40`, and observed flat share `<=0.85`.

**Expectation IDs:** `modeled-hill-share`, `foothill-share`,
`rough-upland-share`, `rough-upland-component-size`, `observed-hill-share`,
`observed-flat-share`, `mountain-region-diameter`,
`mountain-region-non-mountain-share`, `mountain-region-flat-share`, and
`mountain-region-flat-pocket`.

Minima and maxima apply to the worst scenario, not the cohort mean.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
