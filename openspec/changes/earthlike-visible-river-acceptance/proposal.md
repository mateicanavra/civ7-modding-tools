## Why

Visible river and floodplain failures are product blockers only when a proof row
ties them to the exact authored map and classifies whether the issue belongs to
hydrology truth, ecology/floodplain policy, Studio visualization, or Civ
materialization.

## Activation Gate

This change is active. The investigation row is:

- Hydrology truth already publishes `artifact:hydrology.hydrography` with
  discharge, flow direction, sink/outlet masks, and `riverClass` (`1=minor`,
  `2=major`).
- `map-rivers` now uses a bounded native materialization sequence: it stamps the
  Hydrology-selected navigable terrain mask first, then calls adapter-owned
  Civ7 `TerrainBuilder.modelRivers(...)` before validation, named-river
  definition, and water-cache refresh. Hydrology remains truth owner; the native
  writer is a materialization/readback boundary, not a topology authority.
- Current MapGen code stamps selected major-river trunks as
  `TERRAIN_NAVIGABLE_RIVER`; minor hydrology intent remains separate and is not
  promoted into navigable terrain. Earlier projection logic treated all
  `riverClass > 0` as navigable-eligible, which collapsed the minor/major
  distinction.
- Official Civ7 resources distinguish `RIVER_MINOR`, `RIVER_NAVIGABLE`, and
  `TERRAIN_NAVIGABLE_RIVER`. Minor rivers are river metadata, not a terrain row.
  No stable public per-tile `RIVER_MINOR` writer has been identified, but a
  stable bulk river materialization writer has been proven through
  `TerrainBuilder.modelRivers(...)`.
- Live direct-control readback on 2026-06-09 showed `RiverTypes.NO_RIVER=-1`,
  `RIVER_MINOR=0`, `RIVER_NAVIGABLE=1`, and direct terrain stamping could leave
  river metadata at zero. Those river metadata constants now live in
  `@civ7/map-policy` and `@civ7/types`, not in mock-local literals. Disposable
  proof on 2026-06-10 established that the official bulk sequence
  `modelRivers -> validateAndFixTerrain -> defineNamedRivers -> storeWaterData`
  can increase `GameplayMap` river metadata from zero to nonzero minor and
  navigable rows. Current source therefore uses the bounded bulk writer after
  authored terrain stamping and keeps exact parity plus rendered proof open.

Owner classification: projection/materialization plus adapter readback for
navigable/major rivers; adapter capability gap for minor river stamping.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/swooper-earthlike-product-acceptance-proof/**`
- `openspec/changes/civ7-map-policy-final-surface-parity/**`
- Hydrology and ecology sections of the architecture normalization packet

## What Changes

- Isolate authored hydrology truth, projected navigable rivers, Studio
  rendering, Civ terrain readback, and Civ river-metadata readback.
- Keep per-tile minor-river stamping unsupported and explicit until an adapter
  write capability exists; do not pretend minor hydrology classes are stamped by
  navigable terrain writes. Bulk native minor metadata can count only as
  materialization/readback evidence, and only with same-run parity
  classification.
- Split user-facing river knobs by owner: Hydrology `riverDensity` controls the
  physical river network thresholds, while map-rivers `navigableRiverDensity`
  controls the Civ-visible navigable trunk subset.
- Publish planned minor and planned major masks separately from projected
  navigable terrain so Studio display and Civ readback parity compare like with
  like.
- Add product-visible tests/diagnostics that fail when selected navigable river
  trunks are absent from readback or when Studio and Civ classify different
  navigable-river masks.
- Define the physically grounded benchmark suite up front so tuning changes are
  judged by drainage topology, not screenshots alone.

## Requires

- A concrete classified proof row, adapter readback evidence, and physical
  benchmark expectations for river/lake coupling.

## Enables Parallel Work

- Product acceptance rerun for rivers/floodplains.
- Future minor-river authoring once a stable Civ API surface is discovered.

## Affected Owners

- `mods/mod-swooper-maps/**` hydrology/ecology/map-rivers owners when proven.
- `apps/mapgen-studio/**` only for rendering/projection faults.

## Forbidden Owners

- No placement-owned floodplain truth.
- No Civ readback as authored river truth.
- No river tuning from screenshots alone.

## Stop Conditions

- The proof row cannot distinguish authoring, projection, visualization, and live
  materialization.
- The failing row is stale relative to current exact-authorship proof.

## Verification Gates

- Focused failing-row test or diagnostic.
- Same-run Studio artifact/layer proof plus live readback/classified delta.
- OpenSpec strict validation.
