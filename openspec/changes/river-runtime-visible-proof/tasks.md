## 1. Runtime Primitives

- [ ] 1.1 Inventory available Civ camera, reveal, zoom, and screenshot APIs.
- [ ] 1.2 Add direct-control wrappers for centering on tile coordinates and
  recording camera/visibility state.
- [ ] 1.3 Add screenshot capture with explicit fallback labeling.
- [ ] 1.4 Add metadata/materialization disposition fields for terrain-only,
  native-writer parity pass/fail, not-run, and unsupported-writer states.
- [x] 1.5 Extend native `MapRivers` readback to preserve bounded plot
  membership for sampled river objects.

## 2. Visible Proof Runner

- [x] 2.1 Select sampled live river tiles/chains from final-surface readback.
- [x] 2.2 Require sampled camera targets to be both live river terrain and a
  native `MapRivers` object plot in the same final-surface proof.
- [ ] 2.3 Center camera on samples, capture screenshots, hash artifacts, and
  emit visual verdict fields.
- [ ] 2.4 Add negative controls for wrong map/seed, off-target camera, and
  no-river configs.
- [ ] 2.5 Require minor-river claims to cite metadata/native-writer evidence,
  not terrain-only readback.

## 3. Validation

- [x] 3.1 Run focused direct-control and proof packet tests for native-object
  plot binding.
- [ ] 3.2 Run at least one live visual proof and attach artifact paths.
- [ ] 3.3 Validate this OpenSpec change and `bun run openspec:validate`.
