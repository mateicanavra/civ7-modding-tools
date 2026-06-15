# Proposal - Habitat Nx Root Workflow Contract

## Why

Habitat work depends on parallel git worktrees, fresh installs, and
agent-owned verification runs. Nx is the repository graph and task orchestrator,
so root workflows need to live in the graph instead of as loose shell script
chains.

The product outcome is that agents and contributors do not have to reason about
Nx basics during Habitat work. Root build/check/test/lint/verify/deploy
workflows should enter the Nx DAG, and ad hoc Nx commands should use the
standard Nx CLI path where the global command defers to the repo-local Nx dev
dependency.

## Target Authority Refs

- Direct user authority: no symlink repair, no package metadata detour, no
  manual lockfile edits, no direct Nx distribution-binary workaround, and no
  custom socket/temp-directory management.
- Root `AGENTS.md` Tooling Defaults: root workflows use Bun scripts and Nx
  orchestration; Bun remains the package manager and script runner.
- `openspec/changes/habitat-nx-adoption/`: Nx is the single repository graph
  and task orchestrator; Turbo is retired.
- Official Nx docs:
  - `https://nx.dev/docs/concepts/nx-daemon`
  - `https://nx.dev/docs/reference/environment-variables`
  - `https://nx.dev/docs/reference/devkit/cacheDir`
  - `https://nx.dev/blog/nx-22-7-release`

## What Changes

- Keep root `package.json` as a thin command surface, not a registry of
  synthetic root targets.
- Move package-specific verification ownership into the owning packages, with a
  single `verify` script per owning package and mode flags for focused probes.
- Repoint root workflow scripts to package-owned Nx targets where package
  ownership already exists, using `--target=<target>` only when target names
  contain colons.
- Use the standard Nx installation model: keep `nx` as a root dev dependency,
  rely on the global Nx command to defer to the repo-local version, and avoid a
  package-script wrapper named `nx`.
- Route Habitat-spawned Nx commands through `nx ...`.
- Update durable repo guidance so agents use the graph entrypoint and do not
  repair package-manager install layout by hand.

## What Does Not Change

- No Turbo reintroduction.
- No Nx Cloud or remote cache.
- No custom Nx socket, cache, or workspace-data placement.
- No direct edits to `node_modules`, generated package-manager link state, or
  distribution binaries.
- No package metadata or lockfile workaround for this workstream.
- No root package-script expansion into per-verifier aliases.

## Requires

- Current dependency/toolchain cleanup branch.
- Nx remains installed as a root dev dependency.
- Bun remains the package manager.

## Enables Parallel Work

- Repair-chain and grit-pattern peer worktrees can be created and verified from
  the same top-of-stack branch using normal Nx behavior.
- Habitat workstream commands use one command surface across primary and
  worktree checkouts.

## Affected Owners

- Root package scripts and package-owned Nx target metadata.
- Habitat command execution paths that spawn Nx.
- Root `AGENTS.md` and active process/tooling docs that tell agents how to
  invoke Nx.
- OpenSpec workstream records for this change.

## Forbidden Owners

- Package dependency resolution.
- `node_modules` layout repair.
- Nx socket/cache/workspace-data environment overrides.
- Nx source patches.
- Turbo, `.turbo`, or alternate orchestrator configuration.
- Project graph plugin semantics beyond command execution routing.

## Stop Conditions

- `nx ...` cannot execute the root dev dependency from a clean fresh
  worktree after `bun install`.
- Root workflow scripts no longer preserve their existing command semantics.
- A fix requires custom socket placement or package-manager link repair.

## Consumer Impact

Contributors and agents keep using `bun run <root-script>` for normal tasks and
`nx <args>` for ad hoc Nx. The new behavior is that package-specific
verification flows through package-owned `verify` targets and Nx itself uses
official defaults.

## Verification Gates

- `bun install`
- `bun run verify`
- `nx run @civ7/map-policy:verify`
- `nx run mod-swooper-maps:verify`
- `bun run openspec -- validate habitat-nx-worktree-state-contract --strict`
- `nx run @internal/habitat-harness:build --output-style=stream`
- `nx run @internal/habitat-harness:test --output-style=stream`
- `nx run --project=@internal/habitat-harness --target=habitat:rule:workspace-entrypoints`
- `nx run @internal/habitat-harness:generated:check --output-style=stream`
- `nx run @civ7/direct-control:build --output-style=stream`
- `bun run lint` is expected to execute the graph-owned `lint,habitat:check`
  aggregate; current failure means locked Habitat/Grit rule debt, not
  dependency or Nx execution failure.
- Fresh verification worktree from this branch:
  - `bun install`
  - `bun run verify`
  - `nx run @internal/habitat-harness:build --output-style=stream`
