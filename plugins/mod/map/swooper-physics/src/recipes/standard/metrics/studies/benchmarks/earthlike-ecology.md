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
vegetation and `0.35` of land. Forest and taiga must appear in every map;
savanna and sagebrush must each appear in at least six of eight maps. Rainforest
must appear in at least one cohort member as a completed-recipe integration
smoke test against total family erasure.

**Expectation IDs:** `vegetation-presence`, `vegetation-family-variety`,
`vegetation-share-floor`, `vegetation-share-ceiling`,
`rainforest-vegetation-share`, `rainforest-land-share`, `forest-presence`,
`rainforest-cohort-non-vacuity`, `taiga-presence`, `savanna-presence`, and
`sagebrush-presence`.

The [ecology family](../families/ecology.md) owns feature and population facts;
this target owns the Earthlike identity policy.

## Rainforest smoke boundary

`rainforest-cohort-non-vacuity` observes the number of cohort members with a
positive final `FEATURE_RAINFOREST` count and requires that number to be at
least `1`. A single realized rainforest tile in one map passes even when the
other seven maps have none. This is not an abundance, prevalence, distribution,
or Earth-accuracy target; rainforest abundance calibration remains open.

This prospectively replaces the unconditional per-map `rainforest-presence`
expectation. The eight registered scenarios and all other expectations remain
unchanged. Historical verdicts under the retired expectation remain historical
evidence, not amended passing proof. Per-case habitat and realized feature
extent remain necessary evidence for abundance and causal review.

## Proof

```bash
civ7 mapgen metrics report
nx run swooper-physics:test
```
