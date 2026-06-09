## 1. Summary Model

- [ ] 1.1 Derive a river/lake/floodplain summary from current artifacts and
  proof labels.
- [ ] 1.2 Add status classification for zero/missing/divergent river states.
- [ ] 1.3 Add stable palettes and category metadata for masks.

## 2. UI And Config

- [ ] 2.1 Build the River/Lake Inspector with count chips, status chips, and
  one-click layer selection.
- [ ] 2.2 Keep primary physical/projection/engine terrain layers visible in
  normal mode and metadata/mismatch layers behind debug.
- [ ] 2.3 Add config migration for legacy `map-rivers.knobs.riverDensity`.
- [ ] 2.4 Normalize docs/examples/presets to `navigableRiverDensity` where proof
  hashes do not require the alias.

## 3. Validation

- [ ] 3.1 Run Studio summary/model/config migration tests.
- [ ] 3.2 Run Browser/Playwright screenshot checks for the inspector.
- [ ] 3.3 Validate this OpenSpec change and `bun run openspec:validate`.
