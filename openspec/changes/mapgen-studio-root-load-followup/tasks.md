## 1. Phase Opening

- [x] 1.1 Create the phase record before implementation.
- [x] 1.2 Preserve the inherited H4/root-load failure evidence.

## 2. Implementation

- [x] 2.1 Reduce the `standardLayerVisibility` fixture workload without
  changing the standard recipe or assertions.
- [x] 2.2 Stabilize the first `Civ7TunerSession` proof with deterministic
  cleanup and bounded FIN waiting.
- [x] 2.3 Confirm no production app/runtime code or unrelated project timeout
  budgets change.

## 3. Verification

- [x] 3.1 Run the focused browser-worker test.
- [x] 3.2 Run the focused `Civ7TunerSession` test.
- [x] 3.3 Run the direct `mapgen-studio` Vitest project.
- [x] 3.4 Run a representative uncached Nx load probe including
  `mapgen-studio:test`.
- [x] 3.5 Run OpenSpec validation for this change and H4.
- [x] 3.6 Run `git diff --check`.
- [x] 3.7 Update H4/workstream records with the result.
