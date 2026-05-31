## 1. Specification

- [x] 1.1 Record Studio runtime step navigation boundary requirements.

## 2. Implementation

- [x] 2.1 Decouple generated `uiMeta.steps` from public schema property names.
- [x] 2.2 Preserve config-focus paths as editor hints without adding internal
  keys to default public config.
- [x] 2.3 Refresh stale Studio recipe artifacts during Studio preflight.
- [x] 2.4 Regenerate Studio recipe artifacts.

## 3. Verification

- [x] 3.1 Add/adjust tests for Morphology Studio step visibility and semantic
  public config separation.
- [x] 3.2 Run the focused Studio artifact test.
- [x] 3.3 Run Studio recipe generation and app build gates.
- [x] 3.4 Run OpenSpec validation and `git diff --check`.
