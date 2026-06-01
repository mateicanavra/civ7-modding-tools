# Resource Terrestrial Operation Contract Design

## Decision

Add a resource-domain operation:

```text
resources/plan-terrestrial-resources
```

The op is group-level because the current expectation artifact groups these
resources under `terrestrial-animal-forest-wild`. The output remains
per-resource, with one row for every group resource.

The 11-resource set is strategy-owned, not caller-configurable. Callers may not
shrink group coverage through op config.

## Resource Set

- `RESOURCE_CAMELS`
- `RESOURCE_HIDES`
- `RESOURCE_HORSES`
- `RESOURCE_WOOL`
- `RESOURCE_IVORY`
- `RESOURCE_FURS`
- `RESOURCE_TRUFFLES`
- `RESOURCE_RUBBER`
- `RESOURCE_HARDWOOD`
- `RESOURCE_WILD_GAME`
- `RESOURCE_LLAMAS`

## Lane Map

- `arid-rangeland`: `RESOURCE_CAMELS`
- `open-grazing`: `RESOURCE_HIDES`, `RESOURCE_HORSES`
- `highland-pastoral`: `RESOURCE_WOOL`
- `savanna-megafauna`: `RESOURCE_IVORY`
- `cold-boreal-furs`: `RESOURCE_FURS`
- `woodland-host`: `RESOURCE_TRUFFLES`
- `tropical-forest-product`: `RESOURCE_RUBBER`, `RESOURCE_HARDWOOD`
- `diverse-wild-habitat`: `RESOURCE_WILD_GAME`
- `tropical-highland-pastoral`: `RESOURCE_LLAMAS`

## Input Boundary

The op consumes symbolic expectation rows from
`artifact:resources.earthlikeExpectations`. It may also receive resource-owned
eligibility masks for terrestrial proxy families:

- arid rangeland;
- open grass/plains;
- tundra/cold edge;
- hills/highlands;
- savanna/watering-hole;
- tropical forest edge;
- taiga/boreal forest;
- moist woodland edge;
- tropical forest;
- diverse wild habitat;
- tropical highland.

Suppression masks are advisory local signals only. They do not imply runtime
placement or numeric resource ids.

## Output Boundary

Each row carries:

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

## Edge Proxies

- `RESOURCE_TRUFFLES` preserves the woodland or host-tree proxy requirement.
- `RESOURCE_LLAMAS` preserves the tropical hill/highland candidate histogram
  requirement.
- `RESOURCE_IVORY` uses savanna/watering-hole or tropical forest-edge signals,
  not broad tropical forest.
- `RESOURCE_HARDWOOD` preserves its caveat against broadening to temperate
  forests without official or runtime proof.

## FireTuner Runtime-Proof Boundary

This slice acknowledges the downstream resource-runtime-proof boundary: final resource runtime proof must
verify the downstack restart branch/commit, integrate or restack successor
restart work if needed, use the FireTuner socket/API restart path rather than
stale commands or manual bypasses, and record the exact branch/commit plus
restart command/path used.

## Write Set

- `mods/mod-swooper-maps/src/domain/resources/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-terrestrial-resources/**`
- `mods/mod-swooper-maps/test/resources/resource-terrestrial-op-contract.test.ts`
- `openspec/changes/resource-terrestrial-operation-contract/**`
