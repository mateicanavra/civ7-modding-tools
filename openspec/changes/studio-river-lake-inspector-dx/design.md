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

Studio may derive non-zero tile counts from same-run inline grid layer payloads
for known binary masks. Those counts are display evidence, not a replacement for
Hydrology benchmark summaries, live readback counters, rendered screenshots, or
product acceptance proof.

Layer presence is an inspectability claim, not a pass condition. Rows backed
only by manifest layers use an `available`/inspect status so the UI can route a
user to the evidence without implying product proof. `pass` is reserved for
rows backed by their required proof class: exact same-run counters for
projection/readback/lakes/floodplains, rendered screenshot packets for Civ
visibility, or reviewer-dispositioned acceptance records for product closure.

For the pipeline DAG, stage rows remain the primary topology surface. Steps
within a stage must render as compact one-line rows in an expandable list: a
long rectangular shutter interaction that can slide open for per-step layer,
artifact, and proof detail, then collapse back to the scan row without losing
stage context. River/lake/floodplain proof details belong in the expanded step
content, not as always-visible nested cards that make the DAG unreadable.

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
