## 1. Phase Opening

- [x] 1.1 Create the phase record before implementation.
- [x] 1.2 Preserve the full-root failure evidence.

## 2. Implementation

- [x] 2.1 Add the missing Nx dependency from `mod-swooper-maps:test` to
  `build:studio-recipes`.
- [x] 2.2 Confirm no source/runtime or generated outputs need edits.
- [x] 2.3 Update H4/workstream records with the repaired proof boundary.

## 3. Verification

- [x] 3.1 Inspect the resolved Nx project target.
- [x] 3.2 Run focused root-load reproduction with `mod-swooper-maps:test` and
  `mapgen-studio:test`.
- [x] 3.3 Rerun full root `test` before claiming H4 task 2.4.
- [x] 3.4 Run OpenSpec validation for this change and H4.
- [x] 3.5 Run `git diff --check`.
- [x] 3.6 Check for generated/protected drift.
