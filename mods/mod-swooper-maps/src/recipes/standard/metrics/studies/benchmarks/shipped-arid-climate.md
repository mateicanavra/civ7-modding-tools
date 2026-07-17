# Desert Mountains arid-climate studies

**Executable authority:** [`shipped-arid-climate.study.ts`](shipped-arid-climate.study.ts)
**Target ID:** `swooper-desert-mountains/arid-climate`

## Question and design

Does Desert Mountains stay dry and botanically varied without tropical drift
across seed rolls? Four sample studies run `MAPSIZE_HUGE` (106 x 66, 10 players)
at seeds `123`, `1337`, `1538316415`, and `1538316523`. Runtime IDs are
`shipped/arid-climate/MAPSIZE_HUGE/seed-<seed>`.

## Measurements and expected outcomes

The ecology family supplies wetland share, vegetation families, feature counts,
and rainforest count. Each sample must retain the Desert Mountains configuration,
keep wetlands `<=0.08`, expose at least two vegetation families, contain savanna
and sagebrush, and realize at most 20 rainforest tiles.

**Expectation IDs:** `configuration-identity`, `wetland-share`,
`vegetation-family-variety`, `required-feature/feature_savanna_woodland`,
`required-feature/feature_sagebrush_steppe`, and `rainforest-tile-count`.

This study isolates the arid-climate hypothesis; it intentionally does not add
the cross-domain `standard/integrity` target already exercised by shipped identity
and geography studies over the same semantic scenarios.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
