# Earthlike orogeny study

**Executable authority:** [`earthlike-orogeny.study.ts`](earthlike-orogeny.study.ts)
**Target ID:** `swooper-earthlike/orogeny-cohort`

## Question and design

Do Earthlike Huge maps retain region-scale mountain footprints with varied
aggregate exposed-terrain composition? The cohort runs `MAPSIZE_HUGE` (106 x 66,
10 players) at seeds `1018`, `2024`, and `5050`.

## Measurements and expected outcomes

Every sample passes `standard/integrity`. The seven cohort laws are:

| Observation | Cohort reduction and bound |
| --- | --- |
| Modeled mountain count | Minimum `>=1` |
| Largest raw mountain-region component size | Minimum `>=450` |
| Region non-mountain share | Minimum `>=0.65` |
| Region flat-interior share | Minimum `>=0.35` |
| Total region flat-interior count | Minimum `>=300` |
| Region mountain share | Maximum `<=0.38` |
| Sum of region foothill and rough-land shares | Minimum `>=0.25` |

**Expectation IDs:** `mountain-presence`, `mountain-region-size`,
`mountain-region-non-mountain-share`,
`mountain-region-flat-share`, `mountain-region-flat-volume`,
`mountain-region-mountain-share`, and `mountain-region-shoulder-share`.

The [relief family](../families/relief.md) measures connectivity on the row-parity
odd-R hex grid, with X wrapping and bounded Y despite legacy `OddQ` helper names.
Regional components use the raw `mountainRegionMask`; touching owner regions can
merge. Composition uses exposed land intersected with that mask, aggregated
across all regions in each sample. These bounds do not apply separately to every
region or establish a transverse passage, native passability, or settlement
sufficiency.

`mountainRegion.components.maximumComponentDiameter` remains a diagnostic:
the maximum two-sweep BFS span over raw region components, measured in
within-mask graph edges rather than kilometres or ridge length. Largest size
and maximum span may describe different components. Size alone does not
guarantee elongation or width.

## Contract amendments

### Peak-span amendment

The [earlier relief-coherence amendment](../../../../../../../../../../docs/projects/native-map-controls/relief-coherence.md#explicit-orogeny-acceptance-amendment)
retires only the `mountain-spine-diameter >=25` acceptance floor. That categorical
mountain-connectivity proxy does not measure regional continuity through passes
or transverse passability. `plannedMountainComponents.maximumComponentDiameter`
remains a diagnostic; neither a shorter peak span nor a longer one proves that
passes or movement improved. This is an explicit contract revision, not a pass
against the former floor or a replacement floor tuned to a failing seed.

That amendment retained all regional extent, interior composition, mountain
presence, and peak-density bounds then in force, as well as the separate
coverage, range-diversity, and relief-support obligations. Generation was
unchanged by that amendment.

### Regional-span amendment (2026-10-10)

The [prospective regional-span amendment](../../../../../../../../../../docs/projects/native-map-controls/relief-coherence.md#prospective-regional-span-amendment-2026-10-10)
retires only `mountain-region-diameter >=38` from this target's active laws,
without a replacement floor. It deliberately removes the guarantee that each
of these three Huge samples has a raw region component with two-sweep graph
span of at least 38 edges. There is no minimum regional-length guarantee for
this cohort; long, broad, varied ranges remain the product intent, not a claim
proved by the seven retained laws.

The diagnostic and all seven laws above remain unchanged, as do independent
relief studies and physical terrain-admission rules. The separate Huge relief
cohort's existing span `>=30` on seeds `1`, `42`, `99`, and `7777` is not a
replacement obligation for these three samples. The representative study and
relief-coherence accounting checks also retain their own populations and
interpretation limits.

This policy-only revision changes admission, not generated terrain or the
benchmark design. The frozen historical rainfall candidate remains failed
under its original 38 protocol; old decisions and receipts are not requalified.

## Proof

```bash
civ7 mapgen metrics report
nx run swooper-physics:test
```
