## 1. State Model

- [x] 1.1 Read the operation event/current client and Run in Game UI state
      model.
- [x] 1.2 Make mount/reload/reconnect reconciliation explicit.
- [x] 1.3 Ensure terminal daemon state wins over local in-progress state.
- [x] 1.4 Ensure recovery never replays a start mutation automatically.

## 2. Tests

- [x] 2.1 Add tests for missed terminal event recovery.
- [x] 2.2 Add tests for browser reload during active and terminal operations.
- [x] 2.3 Add tests for event stream disconnect/reconnect.
- [x] 2.4 Add public/private payload tests for terminal UI and diagnostics
      lookup.

## 3. Verification

- [x] 3.1 Run `bun run openspec -- validate studio-run-terminal-adoption-invariant --strict`.
- [x] 3.2 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [x] 3.3 Run focused browser operation adoption tests.
- [x] 3.4 Run a live Studio endpoint/browser check for terminal adoption after
      reload or reconnect.
- [x] 3.5 Run and record TypeScript refactoring, code quality/structure,
      library correctness, testing-design, and Habitat/authority review lanes.
- [x] 3.6 Record every gate in `workstream/verification-evidence.md`.
