# Earthlike representative relief study

**Executable authority:** [`earthlike-relief-representative.study.ts`](earthlike-relief-representative.study.ts)
**Target ID:** `swooper-earthlike/relief`

## Question and design

Does one representative Earthlike Huge map balance foothills, rough uplands,
hills, and flat terrain? The sample runs `MAPSIZE_HUGE` (106 x 66, 10 players)
at seed `1018` and applies `standard/integrity` first.

## Measurements and expected outcomes

Foothill share must be `>=0.12` and exceed rough-upland share. Rough uplands must
remain between `0.04` and `0.08`, with largest component `<=60`. Modeled hill
share must be `>=0.12`; observed hill share `>=0.10`; observed flat share
`<=0.75`; and observed non-volcano relief `>=0.18`.

**Expectation IDs:** `foothill-share`, `foothills-exceed-rough-uplands`,
`rough-upland-share-floor`, `rough-upland-share-ceiling`,
`rough-upland-component-size`, `modeled-hill-share`, `observed-hill-share`,
`observed-flat-share`, and `observed-non-volcano-relief`.

The [relief family](../families/relief.md) keeps modeled and realized surfaces
separate so projection drift cannot hide behind one aggregate.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
