# Resource Aquatic Operation Contract Design

## Decision

Add a resource-domain operation:

```text
resources/plan-aquatic-resources
```

The op is group-level because the six aquatic resources share the same
water/coast/river input family and output artifact shape. The output remains
per-resource: fish, pearls, whales, crabs, cowrie, and turtles each receive a
separate planning row.

The six-resource set is strategy-owned, not caller-configurable. Callers may
not shrink group coverage through op config.

## Input Boundary

The op consumes symbolic earthlike expectation rows from
`artifact:resources.earthlikeExpectations`. It may also receive resource-owned
eligibility masks for coastal water, shelf, warm shallow water, cold productive
water, reefs/protected shallows, estuaries, navigable-river mouths, lakes, and
ice.

These masks model the future `artifact:resources.inputs` boundary. They are not
the placement-domain broad input blob and they do not carry numeric resource
ids.

## Output Boundary

Each output row carries:

- `resourceType`;
- active status (`planned`, `proxy-gap`, `missing-expectation`, or `blocked`);
- `expectedCountRange`;
- `targetIntentCount` and `eligibleTileCount`;
- `rangeStatus`;
- `proofStatus = "warning-only"`;
- `runtimeIdStatus = "unverified"`;
- signal fields, proxy requirements, blockers, and caveats.

This is a planning contract, not adapter materialization. It emits no
`resourceId`, `numericId`, `preferredResourceType`, or tile-level placement
intent.

## Crabs River Boundary

`RESOURCE_CRABS` remains eligible through estuary and navigable-river-mouth
signals as well as coastal signals. Tests assert the
`navigable-river mouth or floodplain proxy` requirement survives planning.

## Write Set

- `mods/mod-swooper-maps/src/domain/resources/index.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/**`
- `mods/mod-swooper-maps/test/resources/resource-aquatic-op-contract.test.ts`
- `openspec/changes/resource-aquatic-operation-contract/**`
