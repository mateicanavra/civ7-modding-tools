## 1. Summary Model

- [x] 1.1 Derive a river/lake/floodplain summary from current artifacts and
  proof labels.
- [x] 1.2 Add status classification for zero/missing/divergent river states.
- [ ] 1.3 Add stable palettes and category metadata for masks.
- [x] 1.4 Bind each summary row to exact layer identity (`dataTypeKey`,
  `spaceId`, `kind` / `role`, `variantKey`) and proof class.
- [x] 1.5 Add lake exact-counter/drift rows and floodplain intent/applied/live
  rows so raw score layers cannot masquerade as product proof.

## 2. UI And Config

- [x] 2.1 Build the River/Lake Inspector with count chips, status chips, and
  one-click layer selection.
- [x] 2.2 Keep primary physical/projection/engine terrain layers visible in
  normal mode and metadata/mismatch layers behind debug.
- [x] 2.3 Ensure projected river masks are labeled as projection-plan surfaces
  and engine river masks as terrain-readback surfaces.
- [x] 2.4 Add config migration for legacy `map-rivers.knobs.riverDensity`
  without preserving it as an accepted product model.
- [ ] 2.5 Normalize docs/examples/presets to `navigableRiverDensity` where proof
  hashes do not require the alias.
- [ ] 2.6 Remove stale inspector/docs wording that describes min/max river
  lengths as the accepted selector model.

## 3. Validation

- [x] 3.1 Run Studio summary/model/config migration tests.
- [x] 3.2 Run Browser/Playwright screenshot checks for the inspector.
  - Verified in Chrome at `http://127.0.0.1:5176/` after a Studio run: the
    Water Proof section showed same-run counts for Hydrology/projection/terrain
    and rendered without obvious right-panel overlap. Computer Use rejected
    click actions, so click-through remains covered by the wired selection
    model rather than a physical click in this pass.
- [x] 3.3 Validate this OpenSpec change and `bun run openspec:validate`.
