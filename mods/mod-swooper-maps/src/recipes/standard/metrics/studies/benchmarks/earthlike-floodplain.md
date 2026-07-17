# Earthlike floodplain study

**Executable authority:** [`earthlike-floodplain.study.ts`](earthlike-floodplain.study.ts)
**Target ID:** `swooper-earthlike/floodplain`

## Question and design

Does a representative Earthlike run produce meaningful floodplain intent without
soft surface rejection? The sample uses `MAPSIZE_STANDARD` (84 x 54, 8 players)
at seed `1018` and applies `standard/integrity` first.

## Measurements and expected outcomes

The [ecology family](../families/ecology.md) retains feature attempt and rejection
counts plus final surface legality. Floodplain attempts must be at least `8`,
soft rejections must equal `0`, and final feature-surface violations must equal
`0`.

**Expectation IDs:** `floodplain-attempts`, `floodplain-soft-rejections`, and
`feature-surface-legality`.

This study checks the complete intent-to-surface path, not only realized feature
count, so silently rejected attempts cannot appear healthy.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
