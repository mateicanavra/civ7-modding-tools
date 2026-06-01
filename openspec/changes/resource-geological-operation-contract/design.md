# Resource Geological Operation Contract Design

## Decision

Add a resource-domain operation:

```text
resources/plan-geological-resources
```

The op is group-level because the current expectation artifact groups these
resources under `geological-mineral-gemstone-industrial`. The output remains
per-resource, with one row for every group resource.

The 20-resource set is strategy-owned, not caller-configurable. Callers may not
shrink group coverage through op config.

## Resource Set

- `RESOURCE_GOLD`
- `RESOURCE_GOLD_DISTANT_LANDS`
- `RESOURCE_SILVER`
- `RESOURCE_SILVER_DISTANT_LANDS`
- `RESOURCE_GYPSUM`
- `RESOURCE_JADE`
- `RESOURCE_KAOLIN`
- `RESOURCE_MARBLE`
- `RESOURCE_IRON`
- `RESOURCE_SALT`
- `RESOURCE_LAPIS_LAZULI`
- `RESOURCE_NITER`
- `RESOURCE_COAL`
- `RESOURCE_NICKEL`
- `RESOURCE_OIL`
- `RESOURCE_CLAY`
- `RESOURCE_LIMESTONE`
- `RESOURCE_TIN`
- `RESOURCE_PITCH`
- `RESOURCE_RUBIES`

## Lane Map

- `orogenic-hydrothermal`: `RESOURCE_GOLD`, `RESOURCE_SILVER`
- `blocked-derivative`: `RESOURCE_GOLD_DISTANT_LANDS`,
  `RESOURCE_SILVER_DISTANT_LANDS`
- `evaporite-sedimentary`: `RESOURCE_GYPSUM`
- `ultramafic-metamorphic`: `RESOURCE_JADE`
- `weathering-clay`: `RESOURCE_KAOLIN`
- `carbonate-metamorphic`: `RESOURCE_MARBLE`
- `craton-orogen`: `RESOURCE_IRON`
- `closed-basin-salt`: `RESOURCE_SALT`
- `blocked-no-valid-biome`: `RESOURCE_LAPIS_LAZULI`, `RESOURCE_NICKEL`
- `arid-nitrate`: `RESOURCE_NITER`
- `sedimentary-fuel`: `RESOURCE_COAL`, `RESOURCE_OIL`
- `wet-alluvial-clay`: `RESOURCE_CLAY`
- `carbonate-industrial`: `RESOURCE_LIMESTONE`
- `granite-orogen-placer`: `RESOURCE_TIN`
- `hydrocarbon-seep`: `RESOURCE_PITCH`
- `ruby-metamorphic`: `RESOURCE_RUBIES`

## Input Boundary

The op consumes symbolic expectation rows from
`artifact:resources.earthlikeExpectations`. It may also receive resource-owned
eligibility masks for geological proxy families:

- orogenic or hydrothermal belts;
- alluvial placer drainage;
- tundra/desert mineralized hill exposure;
- evaporite and closed basins;
- sedimentary and hydrocarbon basins;
- ultramafic, metamorphic, collision, and carbonate belts;
- craton, granite, weathering clay, wet alluvial, and arid nitrate soils;
- oil adjacency for pitch.

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

- `RESOURCE_GOLD` and `RESOURCE_SILVER` preserve orogenic/hydrothermal source
  lanes instead of using generic hills.
- `RESOURCE_JADE`, `RESOURCE_MARBLE`, `RESOURCE_IRON`, `RESOURCE_NITER`, and
  `RESOURCE_LIMESTONE` do not let companion terrain signals satisfy source
  requirements on their own.
- `RESOURCE_COAL` uses sedimentary or peat-forming basin signals, not generic
  forest or wetland signals.
- `RESOURCE_OIL` and `RESOURCE_PITCH` preserve hydrocarbon basin or seep
  signals; offshore remains suppressed until explicitly authorized.
- `RESOURCE_LIMESTONE` and `RESOURCE_MARBLE` preserve carbonate source lanes.
- `RESOURCE_TIN` preserves granite, orogeny, or placer source lanes.
- `RESOURCE_RUBIES` preserves metamorphic or collision-belt source lanes and
  does not broaden to generic tropical flats or broad carbonate/limestone
  signals.

## FireTuner Runtime-Proof Boundary

The downstream resource-runtime-proof boundary remains the control record for final runtime proof. This contract
slice does not claim runtime proof and does not restart the game.

## Follow-Up Repair Boundary

This slice repairs stale terrestrial closure metadata in a follow-up branch
because `codex/resource-terrestrial-operation-contract` was already locally
committed clean at `292629dce` before this geological branch was opened.

## Write Set

- `mods/mod-swooper-maps/src/domain/resources/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/resources/ops/plan-geological-resources/**`
- `mods/mod-swooper-maps/test/resources/resource-geological-op-contract.test.ts`
- `openspec/changes/resource-terrestrial-operation-contract/**`
- `openspec/changes/resource-geological-operation-contract/**`
