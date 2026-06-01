# Resource Cultivated Operation Contract Design

## Decision

Add a resource-domain operation:

```text
resources/plan-cultivated-resources
```

The op is group-level because cultivated, plantation, and medicinal resources
share agricultural, coastal, wetland, highland, tropical, arid-water, and
temperate-plains proxy families. The output remains per-resource, with one row
for every group resource.

The 18-resource set is strategy-owned, not caller-configurable. Callers may not
shrink group coverage through op config.

## Resource Set

- `RESOURCE_COTTON`
- `RESOURCE_DATES`
- `RESOURCE_DYES`
- `RESOURCE_INCENSE`
- `RESOURCE_SILK`
- `RESOURCE_WINE`
- `RESOURCE_COCOA`
- `RESOURCE_SPICES`
- `RESOURCE_SUGAR`
- `RESOURCE_TEA`
- `RESOURCE_COFFEE`
- `RESOURCE_TOBACCO`
- `RESOURCE_CITRUS`
- `RESOURCE_QUININE`
- `RESOURCE_MANGOS`
- `RESOURCE_RICE`
- `RESOURCE_CLOVES`
- `RESOURCE_FLAX`

## Input Boundary

The op consumes symbolic expectation rows from
`artifact:resources.earthlikeExpectations`. It may also receive resource-owned
eligibility masks for agricultural proxy families:

- warm alluvial/floodplain/river;
- warm grass/plains;
- oasis or desert water;
- arid dry woodland;
- coastal/marine;
- humid tropical forest and wet tropics;
- highland or relief;
- temperate dry plains;
- savanna/forest;
- tropical fruit belt;
- wetland/paddy;
- cool temperate plains.

Suppression masks are advisory local signals only. They do not imply runtime
placement or numeric resource ids.

## Output Boundary

Each row carries the same symbolic planning contract shape as the aquatic op:

- `resourceType`;
- `laneId`;
- status (`planned`, `proxy-gap`, `missing-expectation`, or `blocked`);
- `expectedCountRange`;
- `targetIntentCount` and `eligibleTileCount`;
- `rangeStatus`;
- `proofStatus = "warning-only"`;
- `runtimeIdStatus = "unverified"`;
- signal fields, proxy requirements, blockers, and caveats.

The op emits no runtime numeric id fields, adapter materialization, or tile-level
resource placement intents.

## Lane Map

- `alluvial-irrigated`: `RESOURCE_COTTON`, `RESOURCE_SILK`,
  `RESOURCE_SUGAR`
- `arid-oasis-resin`: `RESOURCE_DATES`, `RESOURCE_INCENSE`
- `marine-dye`: `RESOURCE_DYES`
- `temperate-field-orchard`: `RESOURCE_WINE`, `RESOURCE_TOBACCO`,
  `RESOURCE_CITRUS`, `RESOURCE_FLAX`
- `humid-tropical-plantation`: `RESOURCE_COCOA`, `RESOURCE_SPICES`,
  `RESOURCE_MANGOS`
- `highland-medicinal`: `RESOURCE_TEA`, `RESOURCE_COFFEE`,
  `RESOURCE_QUININE`
- `wetland-paddy`: `RESOURCE_RICE`
- `blocked-no-valid-biome`: `RESOURCE_CLOVES`

## Edge Proxies

- `RESOURCE_DYES` remains in this group but preserves its coastal/marine proxy.
- `RESOURCE_TEA`, `RESOURCE_COFFEE`, and `RESOURCE_QUININE` preserve highland or
  relief proxy needs.
- `RESOURCE_DATES` uses an oasis or desert-water proxy.
- `RESOURCE_RICE` uses wetland/paddy and floodplain/river proxies.
- `RESOURCE_CLOVES` is blocked, visible, and active-zero.

## Write Set

- `mods/mod-swooper-maps/src/domain/resources/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-cultivated-resources/**`
- `mods/mod-swooper-maps/test/resources/resource-cultivated-op-contract.test.ts`
- `openspec/changes/resource-aquatic-operation-contract/tasks.md`
- `openspec/changes/resource-aquatic-operation-contract/workstream/phase-record.md`
- `openspec/changes/resource-cultivated-operation-contract/**`
