# Earthlike cold-reef study

**Executable authority:** [`earthlike-cold-reef.study.ts`](earthlike-cold-reef.study.ts)
**Target ID:** `swooper-earthlike/cold-reef-cohort`

## Question and design

Do cold reefs persist as accents on deep-ocean-dominant Earthlike water? Eight
`MAPSIZE_HUGE` scenarios (106 x 66, 10 players) use seeds `1018`, `1`, `2`, `3`,
`42`, `99`, `1234`, and `7777`.

## Measurements and expected outcomes

Every sample passes `standard/integrity`. At least four cohort scenarios must
contain a cold reef, the minimum deep-ocean share must remain `>=0.40`, and the
maximum cold-reef share of coast water must remain `<=0.15`.

**Expectation IDs:** `cold-reef-presence`, `deep-ocean-floor`, and
`coast-water-carpet-ceiling`.

The presence count admits seed variability while the coast-share ceiling rejects
carpeting. Measurements come from the [ecology](../families/ecology.md) and
[geography](../families/geography.md) families.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
