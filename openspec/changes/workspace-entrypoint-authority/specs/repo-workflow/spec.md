## ADDED Requirements

### Requirement: Normal Package Entrypoints Stay Leaf-Local

Package-local `dev`, `build`, `check`, and `test` scripts SHALL execute the
package's own task only. They SHALL NOT hide cross-workspace dependency
freshness, sibling workspace builds, package-manager filters, or nested Turbo
invocations.

#### Scenario: App dev relies on root Turbo for dependency freshness
- **WHEN** a developer starts an app that depends on built workspace packages or
  generated workspace artifacts
- **THEN** the root Turbo command encodes those dependency prerequisites
- **AND** the app-local `dev` script only starts the app's local dev server
- **AND** a guard fails if the app-local `dev` script runs hidden preflight or
  sibling workspace build commands

#### Scenario: App build relies on root Turbo for dependency freshness
- **WHEN** a developer builds an app that depends on built workspace packages or
  generated workspace artifacts
- **THEN** the root Turbo task graph builds prerequisites first
- **AND** the app-local `build` script only performs that app's local build
- **AND** a guard fails if the app-local `build` script runs hidden preflight or
  sibling workspace build commands

### Requirement: Explicit Diagnostics Are Not Hidden Entrypoint Preflights

The repository SHALL keep diagnostic setup explicit and outside normal
package-local `dev`, `build`, `check`, and `test` preflights. Deploy scripts
SHALL be leaf operations whose cross-workspace build prerequisites are owned by
the root Turbo graph, not package-local Turbo or workspace-filter invocations.

#### Scenario: Diagnostic command needs runtime artifacts
- **WHEN** a diagnostic script needs built visualization or map artifacts
- **THEN** it may name that preparation in the diagnostic path
- **AND** normal app entrypoints still rely on root Turbo for dependency
  freshness

#### Scenario: Deploy command needs workspace prerequisites
- **WHEN** a package deploy task needs package builds or the Civ7 CLI
- **THEN** the root Turbo graph encodes those prerequisites
- **AND** the package-local deploy script only performs the local deploy action
- **AND** a guard fails if the package-local deploy script invokes Turbo or
  selects sibling workspaces directly
