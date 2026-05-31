## 1. Turbo Graph

- [x] 1.1 Add package-specific check dependencies for Swooper generated/build
  outputs.
- [x] 1.2 Add Studio package check script and Turbo check dependencies.
- [x] 1.3 Add root Studio/direct-control verification command.
- [x] 1.4 Move root `test`/`test:ci` to Turbo graph execution.
- [x] 1.5 Add package-local Vitest scripts for docs, config, and Mapgen
  Studio so root Turbo tests preserve existing root Vitest project coverage.
- [x] 1.6 Move architecture cutover tests behind a Turbo task with a
  package-local focused script.
- [x] 1.7 Add a focused Swooper Maps Studio Run in Game test task for the
  lane verifier.
- [x] 1.8 Add a separate live runtime proof command that defaults to read-only
  LSQ/setup probes and requires explicit mutation flags for setup/start.

## 2. Verification

- [x] 2.0 Run Turbo dry-runs for `mod-swooper-maps#check` and
  `mod-swooper-maps#test`.
- [x] 2.1 Run `bun run verify:studio-run-in-game`.
- [x] 2.2 Run `bun run openspec -- validate workspace-build-pipeline --strict`.
- [x] 2.3 Run `bun run verify:studio-run-in-game:live -- --timeout-ms 3000`
  and record the current LSQ blocker without attempting mutation.
