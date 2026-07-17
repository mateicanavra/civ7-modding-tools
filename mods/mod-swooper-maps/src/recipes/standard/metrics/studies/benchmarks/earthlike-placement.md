# Earthlike placement and resource study

**Executable authority:** [`earthlike-placement.study.ts`](earthlike-placement.study.ts)
**Target IDs:** `swooper-earthlike/placement`, `swooper-earthlike/resources`

## Question and design

Do Earthlike starts remain fair, habitable, regionally dispersed, and adequately
supported while resources retain geological structure and conditional cross-
landmass equity? Twenty `MAPSIZE_STANDARD` scenarios (84 x 54, 8 players) use the
stable seed interval `1337..1356`. Every sample first passes `standard/integrity`.

## Placement expected outcomes

Every scenario must give at least 80% of starts modeled/headless freshwater
opportunity; start fertility at least `1.05x` land fertility; worst pair score gap
`<=0.30`; non-regional fallback and unique region relaxation each `<=5%`; no
small landmass (less than 25% of modeled land) may seat half the players;
global dispersion `>=85%` of even spacing; each multi-start homeland `>=40%`;
climate-tail starts `<=10%`; and the radius-4 support contract must realize at
least two resources per start with gap `<=2` and no shortfall.

**Placement expectation IDs:** `freshwater-access-share`,
`fertility-advantage`, `worst-pair-fairness-gap`,
`non-regional-fallback-share`, `landmass-modeled-land-share`,
`global-start-dispersion`, `regional-start-dispersion`,
`region-relaxation-share`, `climate-extreme-start-share`,
`start-resource-support-contract`, `realized-start-resource-floor`,
`realized-start-resource-equity`, and `start-resource-shortfalls`.

## Resource expected outcomes

Hard placement phases remain inside habitat lanes. Geological resources must
aggregate above their same-type spacing floor. Landmass density equity is
conditional: only maps with at least two landmasses each containing `>=10%` of
modeled land are comparable. The cohort must contain at least one comparable map
and, among comparable samples, every qualifying landmass has resources and
maximum/minimum density is `<=2x`. The study fails
closed if no sample is comparable. Authored count ranges, latitude bands, and
sector entropy remain measurements, not target gates.

**Resource expectation IDs:** `geological-aggregation-above-spacing`,
`comparable-landmass-sample-evidence`,
`qualifying-landmass-resource-presence`, and
`qualifying-landmass-density-spread`.

Freshwater and legality here are completed headless measurements, not live Civ7
readback. See the [placement](../families/placement.md) and
[resource](../families/resources.md) family sheets.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
