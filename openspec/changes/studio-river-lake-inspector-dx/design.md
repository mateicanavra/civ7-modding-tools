## Design

The inspector is a tool surface with lanes:

- Hydrology: discharge, river class, planned minor, planned major.
- Projection: selected navigable terrain, eligible count, target count, min/max
  length, connected-chain count.
- Civ terrain readback: live `TERRAIN_NAVIGABLE_RIVER`, rejected selected
  tiles, extra engine terrain.
- Civ metadata readback: `isRiver`, `isNavigableRiver`, minor metadata, and
  unsupported minor-stamping reason.
- Lakes: planned, accepted, rejected, final drift.
- Floodplains: intent, applied, rejected, final feature.

Statuses include:

- `no-physical-rivers`
- `minor-only-expected-no-navigable`
- `major-present-none-selected`
- `selected-rejected-by-engine`
- `terrain-match`
- `terrain-match-metadata-divergent`
- `terrain-mismatch`
- `metadata-readback-missing`
- `floodplain-intent-missing`
- `floodplain-apply-rejected`

## Review Lanes

- Studio UX/DX review.
- Product proof vocabulary review.
- Config migration review.
- Visual regression/accessibility review.
