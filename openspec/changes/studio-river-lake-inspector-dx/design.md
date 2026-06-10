## Design

The inspector is a tool surface with lanes:

- Hydrology: discharge, river class, planned minor, planned major.
- Projection: selected navigable terrain, eligible count, target count,
  connected-chain count, selected chain lengths, endpoint-discharge semantics,
  and typed no-signal reason.
- Civ terrain readback: live `TERRAIN_NAVIGABLE_RIVER`, rejected selected
  tiles, extra engine terrain.
- Civ metadata readback: `isRiver`, `isNavigableRiver`, minor metadata, and
  native-writer/materialization disposition.
- Lakes: planned, accepted, rejected, exact counters, final drift, and missing
  exact-log state.
- Floodplains: Hydrology/final-surface intent inputs, applied count, rejected
  count, live feature readback, and active/no-signal disposition.

Each lane must bind display rows to exact layer identity:

- `dataTypeKey`
- `spaceId`
- `kind` / `role`
- `variantKey`
- proof class (`hydrology-truth`, `projection-plan`, `terrain-readback`,
  `metadata-readback`, `studio-visible`, `civ-rendered`, or
  `product-acceptance`)

Projection masks must not be labeled as engine truth. In particular,
`map.rivers.projectedRiverMask` is a projection-plan surface, while
`map.rivers.engineRiverMask` is terrain readback. Duplicated Hydrology truth
layers shown near map-rivers must retain Hydrology ownership labels.

Statuses include:

- `no-physical-rivers`
- `minor-only-expected-no-navigable`
- `major-present-none-selected`
- `selected-rejected-by-engine`
- `terrain-match`
- `terrain-match-metadata-divergent`
- `terrain-mismatch`
- `metadata-readback-missing`
- `native-writer-parity-unproven`
- `floodplain-intent-missing`
- `floodplain-apply-rejected`
- `floodplain-live-missing`
- `lake-exact-log-missing`

## Review Lanes

- Studio UX/DX review.
- Product proof vocabulary review.
- Config migration review.
- Visual regression/accessibility review.
