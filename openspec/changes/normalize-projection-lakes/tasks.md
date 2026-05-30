## 1. Adapter Capability

- [x] 1.1 Inventory current adapter lake generation/stamping/readback support.
- [x] 1.2 Add or expose lake stamping/readback capability.
- [x] 1.3 Update browser/test adapter doubles.

## 2. Hydrology Truth

- [x] 2.1 Define `plan-lakes` contract, artifacts, and config inputs.
- [x] 2.2 Implement lake intent planning as Hydrology truth.
- [x] 2.3 Add focused tests for lake intent.

## 3. Projection

- [x] 3.1 Update `map-hydrology` to project/stamp the lake plan.
- [x] 3.2 Add readback diagnostics and parity checks only after capability is
  available.
- [x] 3.3 Migrate placement lake-input contracts away from projection
  diagnostics.
- [x] 3.4 Audit touched `map-*` stages against the projection-only rule.
- [x] 3.5 Update hydrology docs and deferrals affected by the capability.

## 4. Verification

- [x] 4.1 Run adapter and hydrology focused tests.
- [x] 4.2 Run projection/readback tests.
- [x] 4.3 Run `bun run openspec -- validate normalize-projection-lakes --strict`.
- [x] 4.4 Run `bun run openspec:validate`.
- [x] 4.5 Run `git diff --check`.
