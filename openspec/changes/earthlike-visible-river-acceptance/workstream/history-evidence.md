# History Evidence

Date: 2026-06-09

This record captures the semantic git-history evidence behind the river
diagnosis. It is intentionally scoped to commits that changed the ownership
shape of river/lake materialization, readback, and policy boundaries.

## Commands

```sh
git log --oneline --decorate -S'modelRivers' --all -- mods/mod-swooper-maps packages scripts docs openspec
git log --oneline --decorate -S'TERRAIN_NAVIGABLE_RIVER' --all -- mods/mod-swooper-maps packages scripts docs openspec
git log --oneline --decorate --grep='project lake plans through adapter' --all
git log --oneline --decorate --grep='river' --all -- docs openspec mods/mod-swooper-maps packages/civ7-adapter packages/civ7-map-policy
git show -s --format='%H%n%ad%n%s%n%b' --date=iso-strict \
  418c9cddb 9583caeb6 73d7435ce 64a32130e 98fb96747 1914cb44d \
  33ca94aa3 4746ab98b 07a49061c HEAD
```

## Relevant Lineage

| Commit | Date | Evidence | Interpretation |
| --- | --- | --- | --- |
| `9583caeb6` / `418c9cddb` | 2026-01-28 | `map-hydrology: stamp navigable rivers from hydrography` | Earlier MapGen work attempted visible river materialization from hydrography through the map-hydrology projection lane. This is the historical root of direct visible-river stamping. |
| `73d7435ce` | 2026-02-14 | `fix(map-hydrology): refresh area and water caches after river modeling` | The river path depended on engine cache/topology refresh after river modeling, which is why later proof must distinguish terrain rows, river metadata, area/water caches, and downstream placement surfaces. |
| `98fb96747` / `1914cb44d` | 2026-05-29 | `refactor(hydrology): project lake plans through adapter` | Lakes were normalized into Hydrology-owned truth plus adapter projection/readback. The current rivers solution mirrors that boundary: truth upstream, materialization/readback at the adapter/projection edge. |
| `64a32130e` | 2026-05-31 | `feat(mapgen): align projection authoring surface` | Projection stages gained public schemas and deterministic compile mappings, making `map-rivers` the correct place for visible terrain projection knobs instead of Hydrology or Studio-only state. |
| `33ca94aa3` | 2026-06-03 | `fix(mapgen): enforce Swooper projection parity` | Introduced stronger Civ7 policy/readback posture, including the idea that Studio output must satisfy engine materialization requirements without handing terrain ownership back to Civ scripts. |
| `4746ab98b` / `07a49061c` | 2026-06-04 / 2026-06-07 | `feat(mapgen): add Civ map policy engine`; `fix(mapgen): add map policy workspace scaffold` | Created the pure `@civ7/map-policy` boundary that now owns shared terrain/river constants and prevents mock/runtime sentinel drift. |
| Current branch commit | 2026-06-09 | `fix(mapgen): add river metadata readback guardrails` | Current branch: direct major/navigable terrain projection is proved against raw `TERRAIN_NAVIGABLE_RIVER`; Civ metadata readback remains a separate proof class; minor metadata stamping remains unsupported until a writer is proven. |

## Negative History Signal

`git log -S'modelRivers'` finds the historical engine-delegated river modeling
path, but the current branch intentionally does not reintroduce
`TerrainBuilder.modelRivers` as the solution. That old path generated or
refreshed engine-owned river/caches as a bulk postprocess; it does not provide
a stable per-tile `RIVER_MINOR` authoring contract.

`git log -S'TERRAIN_NAVIGABLE_RIVER'` shows a newer projection-policy lineage:
terrain-row materialization became the durable authorable surface, while river
metadata/API readback became evidence. This matches the live proof where
`TERRAIN_NAVIGABLE_RIVER` rows matched exactly but `GameplayMap.isRiver`,
`isNavigableRiver`, and `getRiverType` remained zeroed.

## Current Design Consequence

The history supports the branch architecture:

- Hydrology owns river/lake truth and physical routing.
- `map-rivers` owns the Civ-visible navigable terrain projection subset.
- The adapter owns terrain-row and river-metadata readback separation.
- `@civ7/map-policy` owns generated Civ constants and mock/runtime sentinel
  semantics.
- Minor river metadata remains explicitly unsupported until a new writer
  surface is discovered in official resources or runtime and proven by
  disposable-session readback.
