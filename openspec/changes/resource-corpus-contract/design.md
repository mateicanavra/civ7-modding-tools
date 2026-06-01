# Resource Corpus Contract Design

## Decision

The resource corpus lives in `mods/mod-swooper-maps/src/domain/resources`.
It is a Swooper Maps domain contract because it describes official resource
semantics consumed by future resource-stage strategy work. It is not adapter
state: the adapter currently owns numeric candidate ids and engine feasibility.

The corpus models `Resources` row order from `base-standard.modinfo` load order:

```text
Base/modules/base-standard/data/resources.xml
Base/modules/base-standard/data/resources-v2.xml
```

This is named `staticResourceRowSlot`. It is source evidence, not runtime id
proof. The `<Types>` declaration order is deliberately not used as corpus order,
because it differs from `Resources` row order and would put `RESOURCE_CAMELS`
before `RESOURCE_COTTON`.

## Runtime Boundary

Every corpus row has:

```text
runtimeId.status = "unverified"
runtimeId.value = null
```

This prevents downstream stats and strategy code from joining adapter numeric
diagnostics to symbolic resource names until runtime proof is attached. Later
runtime work must use bounded in-game evidence such as `GameInfo.Resources`
dump telemetry before a row can move to `verified` or `mismatch`.

## Contract Shape

The corpus entry records:

- `resourceType`
- `staticResourceRowSlot`
- `staticSource`
- display fields (`name`, `tooltip`)
- `baseClass`
- `weight`
- `runtimeId`
- `validAges`
- `ageClassOverrides`
- `officialPlacementConstraints`
- `yieldChanges`
- `typeTags`
- `placeability`
- `strategyRequired`

The placement constraint field records source-backed constraint coverage and
placement flags for this slice. Full per-row predicate implementation remains
owned by downstream strategy batches, but missing official biome rows are
already visible as `blocked` strategy-required dispositions.

## Caveats Captured

- `RESOURCE_GOLD_DISTANT_LANDS` and `RESOURCE_SILVER_DISTANT_LANDS` have
  official `Resources` rows but no base-standard valid ages or biome rows in
  the consulted corpus files.
- `RESOURCE_LAPIS_LAZULI`, `RESOURCE_CLOVES`, and `RESOURCE_NICKEL` have valid
  ages but no base-standard `Resource_ValidBiomes` rows in the consulted corpus
  files.
- `FEATURE_LOTUS` is not in the resource corpus.
- SDK resource constants are not treated as authority for this slice.

## Write Set

- `mods/mod-swooper-maps/src/domain/resources/**`
- `mods/mod-swooper-maps/src/domain/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/resources/artifacts.ts`
- `mods/mod-swooper-maps/test/resources/**`
- `openspec/changes/resource-corpus-contract/**`

## Downstream Work

The next slices can consume this contract to add earthlike expectations and
resource-owned input/summary artifacts. Runtime id verification remains a later
slice and must not be inferred from the static corpus.
