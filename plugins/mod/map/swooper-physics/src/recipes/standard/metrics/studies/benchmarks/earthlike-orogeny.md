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
flat share `>=0.35`, at least `300` flat-region tiles, and shoulder share `>=0.25`;
maximum mountain share is `<=0.38`.

**Expectation IDs:** `mountain-presence`, `mountain-region-diameter`,
`mountain-region-size`, `mountain-region-non-mountain-share`,
`mountain-region-flat-share`, `mountain-region-flat-volume`,
`mountain-region-mountain-share`, and `mountain-region-shoulder-share`.

The [relief family](../families/relief.md) measures topology and composition on
the periodic odd-Q grid. These bounds define the Earthlike orogeny product.

## Contract amendment

The [relief-coherence amendment](../../../../../../../../../../docs/projects/native-map-controls/relief-coherence.md)
retires only the `mountain-spine-diameter >=25` acceptance floor. That categorical
mountain-connectivity proxy does not measure regional continuity through passes
or transverse passability. `plannedMountainComponents.maximumComponentDiameter`
remains a diagnostic; neither a shorter peak span nor a longer one proves that
passes or movement improved. This is an explicit contract revision, not a pass
against the former floor or a replacement floor tuned to a failing seed.

All regional extent, interior composition, mountain presence, and peak-density
bounds above remain unchanged, as do the separate coverage, range-diversity,
and relief-support obligations. Generation is unchanged by this amendment.

## Proof

```bash
civ7 mapgen metrics report
nx run swooper-physics:test
```
