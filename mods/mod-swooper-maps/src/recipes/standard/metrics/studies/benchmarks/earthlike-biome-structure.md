# Earthlike biome structure study

**Executable authority:** [`earthlike-biome-structure.study.ts`](earthlike-biome-structure.study.ts)
**Target ID:** `swooper-earthlike/biome-structure`

## Question and design

Does one representative Earthlike map avoid abrupt rainforest latitude cutoffs
and horizontally uniform biome bands while retaining cold-climate biomes? The
sample runs `MAPSIZE_HUGE` (106 x 66, 10 players) at seed `1337` and applies
`standard/integrity` first. One completed generation supplies every expectation.

## Measurements and expected outcomes

Rows with at least 20 land tiles form the rainforest-transition sample. At least
one adjacent qualifying pair must exist, and its maximum rainforest-share delta
must be `<=0.61`. Land-bearing rows must exist; their median biome diversity must
be `>=1`, their maximum `>=2`, and the full land surface must contain at least
three biome families. Tundra or boreal must occur at least once.

**Expectation IDs:** `rainforest-latitude-row-evidence`,
`rainforest-latitude-transition`, `cold-biome-presence`, `land-row-evidence`,
`median-row-biome-diversity`, `maximum-row-biome-diversity`, and
`land-biome-diversity`.

The [Ecology family](../families/ecology.md) owns the neutral row measurements;
this target owns their product thresholds.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
