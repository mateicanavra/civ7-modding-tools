## 1. Direct-Control Setup Session

- [x] 1.1 Add or update the direct-control setup preparation operation so it
      loads `ToT_BasicModsEnabled.Civ7Cfg`, enables `mod-swooper-studio-run`,
      applies the generated row and setup values, and returns one prepared
      setup session.
- [x] 1.2 Ensure the prepared setup session includes readback for generated
      row, targeted generated-mod reconciliation, seed, Huge map, and 10
      players.
- [x] 1.3 Ensure the start operation consumes the prepared setup session and
      cannot reload a different saved config state.

## 2. Runtime Repair

- [x] 2.1 Integrate Studio Run in Game with the direct-control prepared setup
      session.
- [x] 2.2 Ensure setup row readback runs after saved-config/targeted-mod
      reconciliation.
- [x] 2.3 Ensure pre-Begin readback covers generated row, seed, Huge map, 10
      players, and active generated mod.
- [x] 2.4 Ensure resources are retained through visible UI selection, admitted
      request, generation manifest, and evidence row.
- [x] 2.5 Ensure `RunInGameWorkflow` phase order and workflow evidence types
      represent the prepared setup session.
- [x] 2.6 Ensure start consumes the checked setup state without a second
      invalidating saved-config load.

## 3. Tests

- [x] 3.1 Add behavior tests for saved-config composition and generated-row
      visibility.
- [x] 3.2 Add behavior tests for sequencing so row readback after
      reconciliation is the launch boundary.
- [x] 3.3 Add failure tests using the specific setup failure taxonomy.

## 4. Verification

- [ ] 4.1 Run `bun run openspec -- validate studio-run-saved-config-modset-reconciliation --strict`.
- [ ] 4.2 Run `bun habitat classify` for the packet write set and all reported
      commands.
- [x] 4.3 Run focused setup sequencing tests.
- [x] 4.4 Run a live rendered-button check with Test of Time basic mods, Huge
      map, 10 players, and one generated source through setup row readback.
- [ ] 4.5 Run and record TypeScript refactoring, code quality/structure,
      library correctness, testing-design, and Habitat/authority review lanes.
- [ ] 4.6 Record every gate in `workstream/verification-evidence.md`.
