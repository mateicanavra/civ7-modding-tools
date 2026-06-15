# Habitat Tooling Spec Delta

## ADDED Requirements

### Requirement: Root Workflows Route To Owning Nx Targets

The repository SHALL route package-specific root workflows through the Nx target
owned by the package that owns the implementation, without adding per-verifier
root aliases or a synthetic root target registry.

#### Scenario: Running a root workflow script

- **WHEN** a contributor or agent runs `bun run lint`
- **THEN** the script invokes Nx targets for package lint and Habitat checks
- **AND** Nx schedules dependencies through the project graph

#### Scenario: Running a package verifier

- **WHEN** a contributor or agent runs `nx run mod-swooper-maps:verify -- --mode placement-metrics`
- **THEN** the Swooper package `verify` entrypoint selects the placement metrics
  mode
- **AND** there is no separate root `verify:placement-metrics` alias

### Requirement: Nx Commands Use The Repo-Local Dev Dependency

The repository SHALL keep Nx in root `devDependencies` and use the standard Nx
CLI path where the global `nx` command defers to the repo-local Nx version,
without downloading Nx on demand.

#### Scenario: Running an ad hoc Nx command

- **WHEN** a contributor or agent runs `nx show projects`
- **THEN** Nx resolves to the repo-local Nx package version
- **AND** Nx uses its official default cache, daemon, socket, and workspace-data
  behavior

#### Scenario: Habitat spawns Nx

- **WHEN** Habitat needs `nx affected` or `nx graph`
- **THEN** Habitat invokes `nx ...`
- **AND** the same repo-local Nx command surface applies

### Requirement: Worktree Setup Does Not Repair Package-Manager Link State

Habitat worktree setup SHALL treat `node_modules` layout as generated
package-manager state. Repo tooling SHALL NOT repair dependency symlinks or run
direct Nx distribution binaries as part of Nx worktree stabilization.

#### Scenario: Creating a fresh worktree

- **WHEN** a fresh worktree is created from the active branch
- **AND** `bun install` completes
- **THEN** focused Nx verification runs through `nx ...`
- **AND** no step edits, relinks, or patches `node_modules`
