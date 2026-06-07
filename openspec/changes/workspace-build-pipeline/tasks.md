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
- [x] 1.9 Update Swooper Maps deploy so Studio Run in Game deployments build
  workspace dependencies through Turbo before the request-id-sensitive mod
  build/deploy step.
- [x] 1.10 Route Swooper Maps `@civ7/map-policy` type-check resolution to the
  workspace source entrypoint instead of stale package `dist` declarations.
- [x] 1.11 Route Swooper Maps `@civ7/adapter` type-check resolution to the
  workspace source entrypoint instead of stale package `dist` declarations.
- [x] 1.12 Allow Swooper Maps package-local TypeScript checks to include
  source-resolved workspace package files outside the mod `src` tree.
- [x] 1.13 Bundle `@civ7/map-policy` into generated Swooper map scripts so
  Civ MapGeneration never sees repo-owned workspace package specifiers.

## 2. Verification

- [x] 2.0 Run Turbo dry-runs for `mod-swooper-maps#check` and
  `mod-swooper-maps#test`.
- [x] 2.1 Run `bun run verify:studio-run-in-game`.
- [x] 2.2 Run `bun run openspec -- validate workspace-build-pipeline --strict`.
- [x] 2.3 Run `bun run verify:studio-run-in-game:live -- --timeout-ms 3000`
  and record the initial LSQ blocker without attempting mutation.
- [x] 2.4 Re-run `bun run verify:studio-run-in-game` after disposable setup
  reload implementation.
- [x] 2.5 Verify `bun run --cwd mods/mod-swooper-maps check` resolves
  `@civ7/map-policy` to `packages/civ7-map-policy/src/index.ts`.
- [x] 2.6 Verify `bun run --cwd mods/mod-swooper-maps check` observes current
  `@civ7/adapter` source types without rebuilding adapter declarations first.
- [x] 2.7 Verify source-resolved workspace package files do not fail Swooper
  Maps package-local checks through `rootDir` bounds.
- [x] 2.8 Verify built Swooper map scripts contain no bare repo-owned workspace
  imports after the map-policy bundling fix.
