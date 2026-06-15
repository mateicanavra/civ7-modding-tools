# Plugin Vitest Project Scope Phase Record

## State

- Branch/Graphite stack: `agent-F-plugin-vitest-project-scope` above
  `agent-F-adapter-boundary-river-metadata`.
- Change id: `plugin-vitest-project-scope`.
- Objective: remove the remaining DL-15 package-local Vitest fan-out blocker by
  making plugin package test scripts execute only their own root Vitest project.
- Status: implemented and verified; DL-15 record updated; downstream H4 root
  test remains red for a separate `mapgen-studio` timeout class.

## Authority And Inputs

- Root `AGENTS.md`: package scripts should use repo tooling defaults and keep
  tests adjacent to changed behavior.
- `docs/projects/habitat-harness/discrepancy-log.md` DL-15: bare package
  `vitest run` scripts ascend to the root workspace config and execute
  unrelated suites from package cwd.
- H4 phase record: root `bun run test` closure was blocked by DL-15 after
  Biome work because plugin test targets fanned out into unrelated root
  projects.
- SDK async-write repair: `packages/sdk` is already scoped with
  `vitest run --project sdk`; the remaining local script issue is in plugin
  packages.

## Findings

- `packages/plugins/plugin-files`, `plugin-git`, `plugin-graph`, and
  `plugin-mods` all used bare `vitest run`.
- The root `vitest.config.ts` already declared `plugin-files`, `plugin-graph`,
  and `plugin-git`, but did not declare `plugin-mods`.
- The intended package-local behavior is straightforward: each package has one
  test file under its own `test/` directory and should run only that project.
- `plugin-mods` unit coverage previously reached the built `@civ7/plugin-files`
  filesystem helpers through the workspace package boundary, which attempted
  a real deployment path when run as its own project. The test now mocks that
  boundary and asserts the copied-file count returned by the deployment helper.

## Implementation Plan

1. Change each plugin package `test` script to
   `vitest run --project <project-name>`.
2. Add `plugin-mods` to root `vitest.config.ts`.
3. Verify package-local scripts and Nx plugin test targets.
4. Update H4/DL-15 records with the result before closing this slice.

## Verification

- `cd packages/plugins/plugin-files && bun run test` PASS (6 tests).
- `cd packages/plugins/plugin-git && bun run test` PASS (1 test).
- `cd packages/plugins/plugin-graph && bun run test` PASS (4 tests).
- `cd packages/plugins/plugin-mods && bun run test` PASS (4 tests) after the
  package-boundary filesystem helper mock.
- `bunx nx run-many -t test --projects=@civ7/plugin-files,@civ7/plugin-git,@civ7/plugin-graph,@civ7/plugin-mods --skip-nx-cache`
  PASS.
- `bun run openspec -- validate plugin-vitest-project-scope --strict` PASS.
- `git diff --check` PASS.
- Downstream root probe:
  `NX_DAEMON=false bunx nx run-many -t test --outputStyle=static`
  progressed past the plugin package fan-out class and `mod-civ7-intelligence-bridge:test`
  passed, but `mapgen-studio:test` failed under full-repo load with 13 failed
  files / 16 timed-out tests after 601.30s. The remaining
  `mod-swooper-maps:test` child was interrupted after the root probe was
  already red and had continued CPU-bound for more than 25 minutes; no green
  root-test claim is made from that run.

## Downstream Realignment

- H4 task 2.4 is no longer blocked by DL-15 package-local Vitest fan-out or
  the SDK async teardown race. It remains open because the full root test now
  exposes a separate `mapgen-studio` timeout class under repo-wide parallel
  execution.
- DL-15 moved from active blocker to resolved-by-promoted-repair in
  `docs/projects/habitat-harness/discrepancy-log.md`.
