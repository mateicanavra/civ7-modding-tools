## 1. State Model

- [ ] 1.1 Read the operation event/current client and Run in Game UI state
      model.
- [ ] 1.2 Make mount/reload/reconnect reconciliation explicit.
- [ ] 1.3 Ensure terminal daemon state wins over local in-progress state.
- [ ] 1.4 Ensure recovery never replays a start mutation automatically.

## 2. Tests

- [ ] 2.1 Add tests for missed terminal event recovery.
- [ ] 2.2 Add tests for browser reload during active and terminal operations.
- [ ] 2.3 Add tests for event stream disconnect/reconnect.
- [ ] 2.4 Add public/private payload tests for terminal UI and diagnostics
      lookup.

## 3. Verification

- [ ] 3.1 Run `bun run openspec -- validate studio-run-terminal-adoption-invariant --strict`.
- [ ] 3.2 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [ ] 3.3 Run focused browser operation adoption tests.
- [ ] 3.4 Run a live Studio endpoint/browser check for terminal adoption after
      reload or reconnect.
- [ ] 3.5 Run and record TypeScript refactoring, code quality/structure,
      library correctness, testing-design, and Habitat/authority review lanes.
- [ ] 3.6 Record every gate in `workstream/verification-evidence.md`.
