# Shipped geography study

**Executable authority:** [`shipped-geography.study.ts`](shipped-geography.study.ts)
**Target ID:** `standard/shipped-geography`

## Question and design

Does every shipped Standard product generate nondegenerate land and water across
stable seeds? One cohort study crosses four configurations with seeds `123`,
`1337`, `1538316415`, and `1538316523`: 16 `MAPSIZE_HUGE` scenarios at 106 x 66
and 10 players. Shared scenarios are captured once across overlapping studies.

## Measurements and expected outcomes

The [geography family](../families/geography.md) measures planned land, realized
land, realized water, and land share. Every sample first passes
`standard/integrity`; the cohort target requires at least one planned-land,
realized-land, and realized-water tile in every scenario, with realized land share
between `0.075` and `0.95` inclusive.

**Expectation IDs:** `planned-land`, `observed-land`, `observed-water`,
`land-share-floor`, and `land-share-ceiling`.

The broad bounds reject collapsed products without imposing one geography on all
four identities.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
