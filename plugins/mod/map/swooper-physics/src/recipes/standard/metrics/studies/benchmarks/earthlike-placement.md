# Earthlike placement and resource study

**Executable authority:** [`earthlike-placement.study.ts`](earthlike-placement.study.ts)
**Target IDs:** `swooper-earthlike/placement`, `swooper-earthlike/resources`

## Question and design

Do Earthlike starts remain fair, habitable, regionally dispersed, and adequately
supported while resources retain geological structure and conditional cross-
landmass equity? Twenty `MAPSIZE_STANDARD` scenarios (84 x 54, 8 players) use the
stable seed interval `1337..1356`. Every sample first passes `standard/integrity`.

## Placement expected outcomes

**Freshwater evidence boundary:** Opportunity means a modeled river or observed
headless lake on or adjacent to a start, not a native Civ7 freshwater founding
bonus. Freshwater is a soft start-score component, not a guarantee of that native
bonus.

**Pooled cohort shares:** Counts and measured start populations are summed across
the twenty scenarios. Freshwater opportunity must reach at least 80% of starts;
non-regional fallback and unique recorded homeland-region relaxation must each
remain `<=5%`; climate-tail starts must remain `<=10%`. These are cohort shares,
not per-map share floors or ceilings.

**Cohort-mean global dispersion:** The arithmetic mean of per-map global
dispersion indices must reach `>=85%` of even spacing over modeled land. Every
map must have an available observation; empty cohorts or missing observations
fail. This is not an `>=85%` requirement for every map individually.

**Per-map and regional requirements:** Every scenario's radius-two start
fertility mean must be at least `1.05x` its land fertility mean, and its published
`0..1` worst pair score gap must be `<=0.30`. No landmass with less than 25% of
modeled land may seat half or more of the players. Each multi-start homeland must
retain `>=40%` of even spacing over its modeled land.

**Start-support requirements:** Every map must use the radius-4 support contract
with configured floor two and equity tolerance two. Every start must realize at
least two resources within that radius, and every map's realized support gap
must be `<=2`. Support populations must be nonempty, with no starts below the
configured floor and no recorded planning shortfall.

**Placement expectation IDs:** `freshwater-access-share`,
`fertility-advantage`, `worst-pair-fairness-gap`,
`non-regional-fallback-share`, `landmass-modeled-land-share`,
`global-start-dispersion`, `regional-start-dispersion`,
`region-relaxation-share`, `climate-extreme-start-share`,
`start-resource-support-contract`, `realized-start-resource-floor`,
`realized-start-resource-equity`, and `start-resource-shortfalls`.

## Resource expected outcomes

Hard placement phases remain inside habitat lanes. Geological aggregation is a
cohort expectation: every map must provide a finite, available pair-correlation
ratio, and their arithmetic mean must be strictly greater than CSR (`1`). Empty
cohorts fail closed. Each map has equal weight, and below-one per-map ratios remain
visible rather than being excluded. This tests cohort-level aggregation beyond
the spacing floor, not universal per-map clustering or physical fidelity.
Per-map legality, habitat, closure, spacing, and placement guards remain unchanged.

Landmass density equity is conditional: only maps with at least two landmasses
each containing `>=10%` of modeled land are comparable. The cohort must contain
at least one comparable map and, among comparable samples, every qualifying
landmass has resources and maximum/minimum density is `<=2x`. The study fails
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
civ7 mapgen metrics report
nx run swooper-physics:test
```
