# Earthlike ecology study

**Executable authority:** [`earthlike-ecology.study.ts`](earthlike-ecology.study.ts)
**Target ID:** `swooper-earthlike/ecology-cohort`

## Question and design

Does Earthlike retain varied vegetation and a bounded biome mix across stable
seeds? Eight `MAPSIZE_STANDARD` scenarios (84 x 54, 8 players) use seeds `1018`,
`1`, `2`, `3`, `42`, `99`, `1234`, and `7777`.

## Measurements and expected outcomes

Every sample passes `standard/integrity`. Across the cohort, vegetation must be
present, every map must expose at least four vegetation families, and vegetation
share must remain between `0.08` and `0.55`. Rainforest is capped at `0.70` of
vegetation and `0.35` of land. Forest, rainforest, and taiga must appear in every
map; savanna and sagebrush must each appear in at least six of eight maps.

**Expectation IDs:** `vegetation-presence`, `vegetation-family-variety`,
`vegetation-share-floor`, `vegetation-share-ceiling`,
`rainforest-vegetation-share`, `rainforest-land-share`, `forest-presence`,
`rainforest-presence`, `taiga-presence`, `savanna-presence`, and
`sagebrush-presence`.

The [ecology family](../families/ecology.md) owns feature and population facts;
this target owns the Earthlike identity policy.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
