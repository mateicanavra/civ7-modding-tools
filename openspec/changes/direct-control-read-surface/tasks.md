## 1. Package Reads

- [x] 1.1 Implement shared JSON command execution and parse helpers.
- [x] 1.2 Implement playable status and role-aware health summary.
- [x] 1.3 Implement historical Tuner map summary, plot snapshot, and bounded
  grid reads.
- [x] 1.4 Implement player, unit, city, and visibility summaries.
- [x] 1.5 Implement bounded GameInfo rows and bounded root inspection.
- [x] 1.6 Add mock socket tests for read wrappers and bounds.

## 2. Tooling Integration

- [x] 2.1 Add focused CLI commands or extend existing inspect/status commands
  to expose structured reads.
- [x] 2.2 Add Studio server endpoint integration for map/status reads if the
  existing server boundary can consume them without UI churn.
- [x] 2.3 Add CLI/Studio tests where touched.

## 3. Verification

- [x] 3.1 Run direct-control package tests/check/build.
- [x] 3.2 Run focused CLI tests/check/build.
- [x] 3.3 Run Studio build/tests if touched.
- [x] 3.4 Run live read-only proof when Civ7 is available.
- [x] 3.5 Run OpenSpec validation and `git diff --check`.

## 4. 2026-06-03 Controller Realignment

- [ ] 4.1 Supersede Tuner-default gameplay reads through
  `direct-control-game-controller-bridge`.
- [ ] 4.2 Compare controller read outputs against the historical Tuner wrappers
  on the same turn before promoting each wrapper family.
