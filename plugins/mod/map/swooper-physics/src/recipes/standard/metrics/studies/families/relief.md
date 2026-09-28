# Relief measurements

**Executable authority:** [`families/relief.ts`](../../families/relief.ts)

This family compares authored mountains, hills, foothills, rough land, volcanoes,
and mountain-region interiors with realized Civ7 mountain, hill, flat, and
volcano surfaces. It retains counts, populations, connected-component size and
diameter, volcano boundary-regime classification, exact per-tile volcano
feature/terrain readback mismatches, flat pockets inside orogenic regions, and
the count, minimum, maximum, and mean of final Morphology elevation on land.

Certified planned surface-category shares use exposed land, excluding the
physical wet footprint, matching the landform allocator. Geological elevation,
original mountain-region diagnostics, and existing final observation populations
retain original marine-land semantics. Legacy populations are unchanged.

Connectivity uses the recipe's periodic odd-Q grid. The family does not decide
whether a range is long enough, an interior is open enough, or rough terrain is
too dense; targets own those product judgments.

## Native numeric projection

[`families/elevation-projection.ts`](../../families/elevation-projection.ts)
compares every exact numeric height after the write and again after placement.
Its mismatch count is the sum of accepted native-lake adjustments
(`lakeAdjustmentCount`), accepted non-lake inland COAST-water adjustments
(`acceptedInlandWaterAdjustmentCount`), native-lake mismatches outside the
accepted footprint, and all remaining mismatches (`nonLakeMismatchCount`).
The inland-water category requires current water, COAST terrain, and an observed
false native lake flag; an accepted mask alone cannot create that category.
All exact values, errors, extrema, and example counts remain unnormalized.

These measurement categories are not admission authority. The elevation-writing
step requires finite complete numeric readback, unchanged ordinary land/ocean,
and locally stable water, COAST terrain, and native classification for adjusted
accepted inland water. Outside that footprint, only stable preexisting native
lakes on original water qualify. Native leveling is not the physical basin spill
height; uniform body height is diagnostic, not a guard. Final measurements retain
later changes, including placement effects, without rewriting physics or water
masks or retroactively granting a write exception.
