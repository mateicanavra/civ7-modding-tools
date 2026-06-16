# Phase Record - `habitat-nx-worktree-state-contract`

## Phase

- Project: habitat-harness / workspace tooling
- Phase: Nx root workflow contract
- Owner: Codex workstream owner
- Status: implemented and verified for the Nx root workflow/fresh-worktree
  contract; supervisor acceptance remains pending

## Objective

Make Nx execution stable for primary and fresh Habitat worktrees by putting
named root workflows into the Nx DAG and invoking Nx through the standard
global-to-local Nx CLI path with official Nx defaults.

## Authority

- Direct user authority: no symlink repair, no package metadata detour, no
  manual lockfile edits, no direct Nx distribution-binary workaround, and no
  custom socket/temp-directory management.
- Root `AGENTS.md` Tooling Defaults.
- `openspec/changes/habitat-nx-adoption/` for Nx-as-orchestrator authority.
- Official Nx docs for daemon/cache/env behavior.

## Current State

- Primary branch before this phase: `agent-F-habitat-dependency-toolchain-cleanup`
- Primary install: `bun install` passed with no changes.
- Initial root project discovery failed only after a custom runner introduced
  socket overrides. Direct local Nx with official defaults works.
- Direct-control build orchestration is now explicit project metadata rather
  than package-script inference: `build-bundle` and `build-types` are
  `project.json` targets with package-local `cwd`, and `build` is an `nx:noop`
  aggregate that depends on declaration emission.
- Swooper live verification keeps mod-owned proof logic inside the mod package
  and no longer depends on plugin project helpers for Civ Mods path resolution.
- Map-policy generated-table verification now lives in `@civ7/map-policy`; its
  official-resource path references are intentionally allowlisted with the
  existing map-policy provenance files in the adapter-boundary rule.

## Scope

- Write set:
  - `openspec/changes/habitat-nx-worktree-state-contract/**`
  - root `package.json`
  - root `AGENTS.md`
  - Habitat command-engine and hook Nx invocation paths
  - active process/tooling docs with direct Nx guidance
- Protected:
  - `node_modules/**`
  - `bun.lock` unless Bun changes it through a normal install
  - package dependency metadata
  - generated build outputs

## Design State

- Chosen path: package-owned Nx targets plus direct `nx` invocation using the
  documented global-to-local handoff to the root `devDependencies.nx` version.
- Rejected paths:
  - only wrapping direct Nx calls while leaving root workflows loose;
  - custom Nx socket/cache/workspace-data placement;
  - global daemon disable as the primary design;
  - plugin-isolation override as a normal repo fix;
  - direct Nx binary execution;
  - package-manager link repair.

## Review

- Architecture lane accepted root DAG ownership and Habitat-spawned Nx routing.
- Verification lane required fresh-worktree verification from a real branch
  commit and static coverage of root script entrypoints.
- Shortcut-boundary lane rejected install-layout repair, package metadata
  detours, direct Nx binary paths, and custom state overrides.

## Verification Plan

- `bun install`
- `bun run openspec -- validate habitat-nx-worktree-state-contract --strict`
- `bun run verify`
- `nx run --project=@internal/habitat-harness --target=habitat:rule:workspace-entrypoints`
- `nx run @internal/habitat-harness:generated:check --output-style=stream`
- `nx run @civ7/direct-control:build --output-style=stream`
- `nx run @internal/habitat-harness:build --output-style=stream`
- `nx run @internal/habitat-harness:test --output-style=stream`
- `bun run lint` to prove the graph-owned lint/Habitat-check aggregate is
  reached; a current failure is Habitat/Grit rule debt, not Nx execution
  failure
- fresh verification worktree install and focused Nx verification

## Verification Results

- `bun install` passed.
- `bun run openspec -- validate habitat-nx-worktree-state-contract --strict`
  passed.
- `bun run verify` passed.
- `nx run --project=@internal/habitat-harness --target=habitat:rule:workspace-entrypoints`
  passed.
- `nx run @internal/habitat-harness:generated:check --output-style=stream`
  passed.
- `nx run @civ7/direct-control:build --output-style=stream` passed.
- `nx run @internal/habitat-harness:build --output-style=stream`
  passed.
- `nx run @internal/habitat-harness:test --output-style=stream`
  passed.
- `bun run lint` reaches the Nx `lint,habitat:check` aggregate. Current local
  result fails on locked Habitat/Grit findings in `habitat:check` targets; the
  lint targets themselves pass. This is existing architecture rule debt, not
  yargs/dependency resolution, Nx invocation, or Biome formatting failure.
- Fresh verification worktree proof:
  - Created a detached fresh verification worktree from the committed branch
    head so the active HR branch remained checked out only in the HR worktree.
  - `bun install` passed in the fresh worktree.
  - Initial `bun run verify` failed because the official resources submodule was
    not initialized in the fresh worktree. `bun run resources:init` initialized
    `.civ7/outputs/resources` through the repo-owned resource workflow, and the
    generated-output side effects from the failed attempt were restored before
    rerunning proof.
  - `bun run verify` then passed through direct `nx run-many --targets=verify`.
  - `nx run @internal/habitat-harness:build --output-style=stream` passed.
  - `nx run --project=@internal/habitat-harness --target=habitat:rule:workspace-entrypoints`
    passed.
  - `nx run @civ7/direct-control:build --output-style=stream` passed.
  - The fresh worktree was source-clean before removal and was removed after
    verification. Removal used the explicit forced worktree removal path because
    the proof worktree intentionally contained the initialized resources
    submodule; it contained no unique source edits.
- Non-proof probes during the fresh-worktree pass:
  - `nx run @internal/habitat-harness:test --output-style=stream` was current-red
    on broader Habitat/Grit/tooling tests and is not claimed by this H1
    worktree-state proof.
  - `nx run @internal/habitat-harness:generated:check --output-style=stream`
    was current-red on Swooper generated map drift and remains generated-output
    freshness debt, not Nx invocation failure.

## Current Next Action

Fresh-worktree proof record is locally committed and awaiting supervisor
acceptance or repair.
