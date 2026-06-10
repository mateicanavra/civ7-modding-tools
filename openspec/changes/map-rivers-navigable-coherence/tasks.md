## 1. Projection Metrics

- [x] 1.1 Add connected-chain, length, distribution, and rejection metrics to
  `map-rivers`.
- [x] 1.2 Add typed no-signal exceptions for arid/closed-basin maps.
- [x] 1.3 Update `navigableRiverDensity` tests to verify projection changes do
  not rewrite Hydrology truth.
- [x] 1.4 Retire the legacy `map-rivers.knobs.riverDensity` alias and realign
  adjacent Hydrology wording to the narrow owner model.
- [ ] 1.5 Fix `endpointDischargePercentileMin` so the selected endpoint floor is
  enforced by the selector, or remove/rename the reported floor with tests.

## 2. Acceptance Thresholds

- [x] 2.1 Add generated-map checks for minimum projected/live navigable terrain
  on normal Earthlike maps.
- [x] 2.2 Add negative controls where low/no navigable projection is expected.
- [ ] 2.3 Rebaseline shipped/default configs only after same-run proof passes.
- [ ] 2.4 Add a native-writer decision record before any `modelRivers(...)`
  integration is treated as part of projection closure.

## 3. Validation

- [x] 3.1 Run map-rivers, hydrology knobs, config, build, and live-parity tests.
- [x] 3.2 Validate this OpenSpec change and `bun run openspec:validate`.
