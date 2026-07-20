# Earthlike river-network study

**Executable authority:** [`earthlike-river-network.study.ts`](earthlike-river-network.study.ts)
**Target ID:** `swooper-earthlike/river-network`

## Question and design

Does Earthlike produce a meaningful river hierarchy with complete active-flow
classification across stable worlds? Three `MAPSIZE_STANDARD` scenarios (84 x
54, 8 players) use seeds `1018`, `1`, and `42`.

## Measurements and expected outcomes

Every sample passes `standard/integrity`. Every captured network must reach at
least second-order branching, classify every river tile as ephemeral,
intermittent, or perennial, leave no classified river tile dry, and retain a
non-perennial share above zero.

**Expectation IDs:** `stream-order-hierarchy`, `river-permanence-partition`,
`river-active-flow`, and `river-flow-mix`.

The [hydrology family](../families/hydrology.md) owns the neutral network
measurements. This target owns the Earthlike product expectation; it does not
reconstruct or reinterpret river evidence.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
