## 1. Specification

- [x] 1.1 Record Morphology public config surface requirements.

## 2. Implementation

- [x] 2.1 Promote Morphology public config schemas through the domain config
  surface.
- [x] 2.2 Add explicit `public + compile` surfaces for Morphology stages.
- [x] 2.3 Verify public schemas accept the shipped-config migration output.
- [x] 2.4 Update tests to prove public shape and compiled internal shape without
  asserting mutable product tuning values.

## 3. Verification

- [x] 3.1 Run focused shipped-config and Morphology config tests.
- [x] 3.2 Run the Swooper Maps check gate.
- [x] 3.3 Run OpenSpec validation for this change.
- [x] 3.4 Run `git diff --check`.
