## 1. Adapter Capability

- [ ] 1.1 Inventory current adapter lake generation/stamping/readback support.
- [ ] 1.2 Add or expose lake stamping/readback capability.
- [ ] 1.3 Update browser/test adapter doubles.

## 2. Hydrology Truth

- [ ] 2.1 Define `plan-lakes` contract, artifacts, and config inputs.
- [ ] 2.2 Implement lake intent planning as Hydrology truth.
- [ ] 2.3 Add focused tests for lake intent.

## 3. Projection

- [ ] 3.1 Update `map-hydrology` to project/stamp the lake plan.
- [ ] 3.2 Add readback diagnostics and parity checks only after capability is
  available.
- [ ] 3.3 Migrate placement lake-input contracts away from projection
  diagnostics.
- [ ] 3.4 Audit touched `map-*` stages against the projection-only rule.
- [ ] 3.5 Update hydrology docs and deferrals affected by the capability.

## 4. Verification

- [ ] 4.1 Run adapter and hydrology focused tests.
- [ ] 4.2 Run projection/readback tests.
- [ ] 4.3 Run `bun run openspec -- validate normalize-projection-lakes --strict`.
- [ ] 4.4 Run `bun run openspec:validate`.
- [ ] 4.5 Run `git diff --check`.
