# Mountain drama study

**Executable authority:** [`mountain-drama.study.ts`](mountain-drama.study.ts)
**Target ID:** `shipped/mountain-drama-elevation`

## Question and design

Do the retained mountain products produce more dramatic land elevation than
Earthlike without fitting an absolute elevation threshold? The cohort runs
`MAPSIZE_HUGE` (106 x 66, 10 players) for Earthlike, Mountain Patch, Mountains
of Time Earthlike, and Mountains of Time Original at matched seeds `1018`,
`2024`, and `5050`.

The study admits the intended static tectonic contrast exactly:
`swooper-earthlike` has `plateActivity=0.5`; each mountain configuration has
`plateActivity=0.85`. A config drift fails during study construction.

## Measurements and expected outcomes

Every sample first passes `standard/integrity`. For each seed, every mountain
configuration's maximum final land elevation must exceed Earthlike at that same
seed. This is a relational comparison only: the target contains no absolute
elevation floor and refuses a cohort with any missing or duplicate matched
sample.

**Expectation ID:** `maximum-land-elevation-exceeds-earthlike`.

Maximum elevation is intentionally the only mountain-drama oracle. A
predeclared matched-seed diagnostic also examined land-elevation `p90`, `p95`,
`p95-p50` upper-tail relief, and mean. `p90`, `p95-p50`, and mean were not
uniformly higher across the cohort. Although `p95` was uniformly higher, it was
not admitted because another absolute height statistic would reward broad
uplift without adding a distinct peak-amplitude guarantee. Mean land elevation
is therefore intentionally not required: a mountain product may add higher
peaks without raising the whole landmass.

The [relief family](../families/relief.md) measures the neutral final-land
elevation summary; this target owns the matched product relationship.

## Proof

```bash
nx run swooper-physics:metrics:report
nx run swooper-physics:test
```
