## 1. Policy Reconciliation

- [x] 1.1 Confirm the static build-elevation boundary helper has no runtime
  caller.
- [x] 1.2 Compare it against the active map-elevation drift-repair boundary.
- [x] 1.3 Remove the unused helper, export, and provenance-only test.

## 2. Verification

- [x] 2.1 Search for stale references after removal.
- [x] 2.2 Run focused `@civ7/map-policy` tests.
- [x] 2.3 Run focused map-elevation water-drift tests.
