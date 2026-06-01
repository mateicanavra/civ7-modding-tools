# Build Pipeline Audit: Studio Run in Game

Date: 2026-05-31

## Current Graph Findings

- [source-proven] The repo is a Bun + Turborepo monorepo. Root `package.json`
  exposes `build` as `turbo run build`, `check-types` as `turbo run check`, and
  `check` as `turbo run check` followed by non-Turbo lint guardrails.
- [source-proven] `turbo.json` already makes `build` depend on `^build` and
  `check` depend on `^build` plus `^check`. A dry run for
  `turbo run check --filter=mod-swooper-maps` schedules
  `@mateicanavra/civ7-sdk#build`, `@mateicanavra/civ7-sdk#check`,
  `@swooper/mapgen-core#build`, `@swooper/mapgen-core#check`,
  `@civ7/adapter#build`, and `@civ7/adapter#check` before
  `mod-swooper-maps#check`.
- [source-proven] `mods/mod-swooper-maps/package.json` declares dependencies on
  `@mateicanavra/civ7-sdk`, `@swooper/mapgen-core`, `@swooper/mapgen-viz`, and
  `@civ7/adapter`. Its `check` script is `tsc --noEmit`.
- [source-proven] Generated Swooper map entries import
  `createMap` from `@mateicanavra/civ7-sdk/mapgen`; the generator emits the
  same import in `scripts/generate-map-artifacts.ts`.
- [source-proven] `@mateicanavra/civ7-sdk` exposes `./mapgen` from
  `dist/mapgen/index.d.ts` and builds declarations with
  `tsup src/index.ts src/mapgen/index.ts --format esm,cjs --dts`.
- [source-proven] Root `test:ci` manually runs Vitest, then builds
  `@civ7/adapter`, builds/tests `@swooper/mapgen-core`, and runs
  `mod-swooper-maps` tests. That sequence does not build
  `@mateicanavra/civ7-sdk` before the mod tests.
- [source-proven] `turbo.json` has `test: { dependsOn: ["^build"] }`. A dry run
  for `turbo run test --filter=mod-swooper-maps` schedules
  `@mateicanavra/civ7-sdk#build`, `@swooper/mapgen-core#build`,
  `@swooper/mapgen-viz#build`, and `@civ7/adapter#build` before
  `mod-swooper-maps#test`.
- [source-proven] `build:studio-recipes` already depends on `^build`, and
  Studio build/dev depends on `mod-swooper-maps#build:studio-recipes`, but its
  Turbo outputs list only `dist/**` even though the script also regenerates
  `src/maps/generated/**` and `mod/**`.
- [inferred] The unreliable path is not root `bun run check`; it is manually
  sequenced test/build scripts that bypass Turbo for package tests or capture
  only part of generated recipe outputs.
- [source-proven] An untracked draft OpenSpec change already exists at
  `openspec/changes/workspace-build-pipeline/`. Its proposal targets a root
  Turbo-backed Studio/direct-control verification command and package-specific
  graph prerequisites.
- [unresolved] I did not execute full builds/tests because this audit is
  report-only and the worktree has unrelated active changes. The dry-run graph
  evidence proves scheduling, not runtime success.

## Recommended OpenSpec Change

Use the existing draft change id `workspace-build-pipeline`.

Scope it as an implementation-control change under the Studio Run in Game
workstream. It should not change product behavior. Its purpose is to make one
workspace-level command rely on Turbo's package graph so generated map entries
cannot observe stale SDK declarations. If the draft was created by another
agent, reconcile into it rather than creating a second change for the same
build-pipeline concern.

## Exact Edits To Make

1. `turbo.json`
   - Keep `check.dependsOn` as `["^build", "^check"]`; it already encodes the
     dependency graph needed for `mod-swooper-maps#check`.
   - Keep `test.dependsOn` as `["^build"]`, but set `outputs: []` explicitly.
   - Expand `build:studio-recipes.outputs` from `["dist/**"]` to include all
     generated outputs from the script:
     `["dist/**", "mod/**", "src/maps/generated/**"]`.

2. Root `package.json`
   - Change `test:ci` from the manual Bun chain to Turbo-owned package tests:
     `turbo run test`.
   - Change `test` to the same graph authority if preserving current coverage
     through package-local test scripts is completed: `turbo run test`.
   - Change `test:mapgen` to
     `turbo run test --filter=@swooper/mapgen-core`.
   - Change `test:architecture-cutover` to a single Turbo-filtered
     `mod-swooper-maps` test invocation, passing the focused test file list
     through to the package test command, rather than manually building adapter,
     viz, and core first.
   - Remove `pretest:vitest` once root `test` no longer uses `test:vitest` as
     the package-test umbrella. Do not replace it with another manual build
     chain.

3. Package `package.json` files
   - Add package-local `test` scripts for Vitest projects that root `vitest`
     currently covers but Turbo would otherwise skip. At minimum:
     - `packages/config`: `vitest run --project config`
     - `apps/docs`: `vitest run --project docs`
     - `apps/mapgen-studio`: `vitest run --project mapgen-studio`
   - Leave existing package `build`, `check`, and `test` scripts simple:
     package-local commands only, no dependency ordering encoded in package
     scripts.

4. OpenSpec files
   - Update `openspec/changes/workspace-build-pipeline/proposal.md` so the
     change explicitly names stale `@mateicanavra/civ7-sdk/mapgen` declarations
     as the failure mode.
   - Update `tasks.md` with the Turbo/root/package edits above and dry-run plus
     real-command verification.
   - Add `design.md` only if reviewers need the distinction between Turbo task
     graph ownership and Bun package-runner ownership preserved explicitly.

## Verification Commands

- `bunx turbo run check --filter=mod-swooper-maps --dry=json`
  - Verify `mod-swooper-maps#check` depends on `@mateicanavra/civ7-sdk#build`
    and `@mateicanavra/civ7-sdk#check`.
- `bunx turbo run test --filter=mod-swooper-maps --dry=json`
  - Verify `mod-swooper-maps#test` depends on `@mateicanavra/civ7-sdk#build`.
- `bun run check-types`
  - Proves workspace type checks still use Turbo ordering.
- `bun run test:ci`
  - After the edit, proves the CI-style workspace test command no longer
    relies on a hand-maintained dependency sequence.
- `bun run --cwd mods/mod-swooper-maps check`
  - Optional negative/legacy check: this package-local command is still not
    responsible for rebuilding dependencies. Developers should use the
    workspace command for graph-sensitive validation.
- `bun run openspec -- validate workspace-build-pipeline --strict`
- `bun run openspec:validate`

## Risks

- [source-proven] Moving root `test` fully to `turbo run test` can drop Vitest
  project coverage unless every Vitest project has a package-local `test`
  script. Add the missing scripts in the same OpenSpec change.
- [inferred] Turbo-caching generated files under `src/maps/generated/**` is
  operationally sensitive because they live under source rather than `dist/`.
  It is still preferable to incomplete output metadata, but reviewers should
  confirm cache restore behavior before enabling remote cache for this task.
- [inferred] Focused architecture tests may need Turbo pass-through argument
  syntax verified on Turbo 2.7.6. If pass-through is awkward, define a
  package-local focused test script and invoke it through a Turbo task instead
  of restoring manual dependency builds.
- [source-proven] Package-local commands such as
  `bun run --cwd mods/mod-swooper-maps check` remain valid for fast iteration
  but cannot guarantee dependency freshness. Docs should steer graph-sensitive
  validation to root Turbo commands.
