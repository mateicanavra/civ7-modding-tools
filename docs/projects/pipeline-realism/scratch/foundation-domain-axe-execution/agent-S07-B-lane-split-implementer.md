# Agent S07-B — Lane Split Implementer (M4-004 lane split)

## What I changed (paths)
- Implemented the atomic projection lane cutover (no dual publish) by moving Foundation projection artifacts to the map-facing namespace and rewiring all consumers:
  - `packages/mapgen-core/src/core/types.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/islands.contract.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.contract.ts`
  - Tests/harness updated to follow new `mapArtifacts.foundation*` ids (see `git diff --stat` for the full list).
- Updated canonical docs to match the new lane:
  - `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
  - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`

## Why it matches rails
- **Truth vs projection holds**: only the map-facing projections moved (`artifact:map.foundation*`); truth artifacts remain `artifact:foundation.*`.
- **No shims / no dual publish**: the old projection artifacts were removed from the Foundation artifact catalog, so there is no “legacy alias” available to publish/read.
- **Atomic cutover**: downstream contracts were rewired in the same slice so no intermediate state requires reading old ids.

## Proof (commands run + results)
- Proof is owned by S07-C (verification gatekeeper); expected proof includes “0 matches” scans for legacy ids and green `build:studio-recipes`.

## Implementation notes
### Locked rename map (projection artifacts only)
- `artifact:foundation.plates` → `artifact:map.foundationPlates`
- `artifact:foundation.tileToCellIndex` → `artifact:map.foundationTileToCellIndex`
- `artifact:foundation.crustTiles` → `artifact:map.foundationCrustTiles`
- `artifact:foundation.tectonicHistoryTiles` → `artifact:map.foundationTectonicHistoryTiles`
- `artifact:foundation.tectonicProvenanceTiles` → `artifact:map.foundationTectonicProvenanceTiles`

### Execution strategy
1) Flip the core string constants first (so any lookups use the new ids).
2) Add the `mapArtifacts.foundation*` definitions using the same schemas as before.
3) Rewire the Foundation `projection` publisher to publish the new map artifacts only.
4) Rewire all consumers (foundation + morphology) contracts and tests to require the new ids.
5) Remove legacy projection artifacts from `foundationArtifacts` to prevent drift back to the old lane.

## Open risks / follow-ups
- Ensure no stale `artifact:foundation.*` projection ids remain in doc/spec pages that are linted (handle in S07 if `lint:mapgen-docs` checks them; otherwise defer to S09 parity sweep).
