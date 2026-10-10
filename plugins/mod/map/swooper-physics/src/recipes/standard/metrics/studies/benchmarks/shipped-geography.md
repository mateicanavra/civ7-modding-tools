# Core and configuration-stress geography studies

**Executable authority:** [`shipped-geography.study.ts`](shipped-geography.study.ts)
**Target ID:** `standard/shipped-geography`

## Question and design

Does every shipped Standard product generate nondegenerate land and water across
stable seeds? The explicit `earthlike/geography-cohort` declaration qualifies
Earthlike on the existing four Huge seeds `123`, `1337`, `1538316415`, and
`1538316523`, using the same generic targets as the mixed study. It is part of the
default `earthlike-core` scope and preserves all existing Earthlike geography
cases without runtime cohort filtering or new thresholds.

The opt-in `shipped/geography` cohort crosses the primary Earthlike profile and the
Desert Mountains and Archipelago stress profiles with seeds `123`, `1337`,
`1538316415`, and `1538316523`: twelve `MAPSIZE_HUGE`
scenarios at 106 x 66 and 10 players. Shared scenarios are captured once across
overlapping studies.

The mixed cohort is configuration-stress evidence only. Desert Mountains and
Archipelago are intentionally biased configurations of the same recipe, not
core Earthlike calibration or release gates. Both declarations share exact
Earthlike scenario identities; the runner captures each semantic scenario once.

## Measurements and expected outcomes

The [geography family](../families/geography.md) measures planned land, realized
land, realized water, and land share. Every sample first passes
`standard/integrity`; the cohort target requires at least one planned-land,
realized-land, and realized-water tile in every scenario, with realized land share
between `0.075` and `0.95` inclusive.

**Expectation IDs:** `planned-land`, `observed-land`, `observed-water`,
`land-share-floor`, and `land-share-ceiling`.

The broad bounds reject collapsed products without imposing one geography on all
three catalog configurations.

## Proof

```bash
civ7 mapgen metrics report
civ7 mapgen metrics report --scope all
nx run swooper-physics:test
```

The default report and study gate evaluate the Earthlike-only declaration. The
explicit `all` report also evaluates the unchanged mixed cohort.
