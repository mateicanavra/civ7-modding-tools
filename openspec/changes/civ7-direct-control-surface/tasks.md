## 1. Discovery

- [x] 1.1 Verify current repo direct socket behavior and call sites.
- [x] 1.2 Verify live protocol/state/command behavior against a running Civ7
  instance when available.
- [x] 1.3 Inspect FireTuner/Firaxis binaries for protocol/API clues without
  treating them as required runtime authority.
- [x] 1.4 Inspect Chrispresso Debug Console and public Civ7 JS/type sources for
  command/global/autocomplete evidence.
- [x] 1.5 Record keep/replace/archive cleanup manifest for bridge paths,
  scripts, docs, tests, and messy externalities.

## 2. Specification

- [x] 2.1 Finalize proposal, design, tasks, and spec deltas after discovery.
- [x] 2.2 Run product, architecture, spec, and verification review lanes.
- [x] 2.3 Disposition accepted findings before implementation.

## 3. Implementation

- [x] 3.1 Implement `packages/civ7-direct-control` as the canonical
  direct-control boundary.
- [x] 3.2 Route CLI control behavior through the canonical boundary.
- [x] 3.3 Route Studio control behavior through the canonical boundary.
- [x] 3.4 Remove the Windows/FireTuner bridge path from repo-owned runtime
  control.
- [x] 3.5 Update developer docs and runtime proof guidance.

## 4. Verification

- [x] 4.1 Run focused unit/mock socket tests.
- [x] 4.2 Run CLI and Studio integration/build checks.
- [x] 4.3 Run OpenSpec validation and `git diff --check`.
- [x] 4.4 Run live Civ7 proof when available and record evidence boundary.
- [x] 4.5 Record downstream realignment and closure/handoff state.
