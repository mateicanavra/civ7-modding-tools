## Why

Four plugin package `test` scripts still run bare `vitest run`. From a plugin
package working directory, Vitest ascends to the root workspace config and
runs the full project matrix instead of the package's own tests. This is the
remaining DL-15 class blocking H4's root test closure after the SDK async write
race was repaired.

Package-local scripts should stay leaf-local: a plugin package test target
must execute the plugin's Vitest project, not unrelated app/package suites.

## What Changes

- Change the plugin package `test` scripts to `vitest run --project <name>`.
- Add the missing `plugin-mods` project to the root Vitest workspace config so
  its package-local and Nx test target can be scoped like the other plugins.
- Record DL-15 disposition and verification evidence.

## What Does Not Change

- No plugin runtime code or test assertions change.
- No root test orchestration change beyond adding the missing plugin project.
- No workaround for unrelated test failures; the fix is explicit project
  scoping.

## Affected Owners

- `packages/plugins/plugin-files/package.json`
- `packages/plugins/plugin-git/package.json`
- `packages/plugins/plugin-graph/package.json`
- `packages/plugins/plugin-mods/package.json`
- `vitest.config.ts`
- Habitat H4/DL-15 records as downstream context

## Verification Gates

- `cd packages/plugins/plugin-files && bun run test`
- `cd packages/plugins/plugin-git && bun run test`
- `cd packages/plugins/plugin-graph && bun run test`
- `cd packages/plugins/plugin-mods && bun run test`
- `bunx nx run-many -t test --projects=@civ7/plugin-files,@civ7/plugin-git,@civ7/plugin-graph,@civ7/plugin-mods --skip-nx-cache`
- `bun run openspec -- validate plugin-vitest-project-scope --strict`
- `git diff --check`

## Stop Conditions

- Project scoping hides a plugin test file instead of running it.
- A package-local test still executes unrelated root workspace projects.
