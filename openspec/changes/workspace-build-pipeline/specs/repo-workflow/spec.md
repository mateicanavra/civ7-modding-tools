## ADDED Requirements

### Requirement: Repo Provides Turbo-Backed Studio Direct-Control Verification

The repository SHALL expose one root command that verifies the direct-control,
SDK, Swooper Maps, and Mapgen Studio build/check/test path through the Turbo
task graph.

#### Scenario: Developer verifies Studio Run in Game work
- **WHEN** a developer changes direct-control, SDK mapgen runtime, Swooper map
  generation, or Mapgen Studio
- **THEN** they can run one root command for the Studio Run in Game lane
- **AND** Turbo builds dependency packages before checking dependents
- **AND** Swooper Maps runs focused tests for map config, canonical map
  execution, and built map runtime imports owned by this lane
- **AND** OpenSpec changes in that lane are validated

#### Scenario: CI-style tests use workspace graph ordering
- **WHEN** a developer runs the root CI-style test command
- **THEN** package tests run through Turbo
- **AND** packages that depend on built workspace declarations receive their
  dependency builds through the task graph
- **AND** Vitest projects previously covered by the root Vitest config remain
  covered by package-local test scripts

### Requirement: Repo Provides Explicit Live Runtime Proof Gate

The repository SHALL expose a separate root command for Studio Run in Game live
runtime proof that does not run as part of default CI.

#### Scenario: Developer checks live readiness without mutation
- **WHEN** a developer runs the live proof command without mutation flags
- **THEN** the command checks direct-control health through `LSQ:`
- **AND** it attempts setup snapshot and optional map row reads only after
  health succeeds
- **AND** it emits structured proof output with a proof id, stage list, and
  failure stage
- **AND** no setup/start mutation is attempted

#### Scenario: Developer explicitly runs setup/start proof
- **WHEN** a developer runs the live proof command with explicit setup/start flags
- **THEN** the command requires map script, map size, and setup seed inputs
- **AND** it calls `@civ7/direct-control` setup/start wrappers rather than raw
  socket commands
- **AND** it records whether preparation, start, and post-start verification
  succeeded
- **AND** failed live readiness does not replay mutating commands

### Requirement: Package Checks Do Not Rely On Stale Generated Dependencies

The Turbo graph SHALL encode generated/build prerequisites for package checks
that depend on generated files or built workspace declarations.

#### Scenario: Swooper Maps check runs through Turbo
- **WHEN** Turbo runs `mod-swooper-maps#check`
- **THEN** Swooper map artifacts and dependency declaration outputs are built
  first
- **AND** the check does not depend on a developer remembering manual package
  order

#### Scenario: Swooper Maps checks map-policy source changes
- **WHEN** Swooper Maps imports `@civ7/map-policy` during its package-local
  check
- **THEN** TypeScript resolves the import to the workspace source entrypoint
- **AND** the check observes unbuilt map-policy source changes instead of stale
  package declaration output

#### Scenario: Swooper Maps checks adapter source changes
- **WHEN** Swooper Maps imports `@civ7/adapter` during its package-local check
- **THEN** TypeScript resolves the import to the workspace source entrypoint
- **AND** the check observes unbuilt adapter source changes instead of stale
  package declaration output
- **AND** source-resolved workspace package files are inside the package-local
  TypeScript check root

#### Scenario: Studio check runs through Turbo
- **WHEN** Turbo runs `mapgen-studio#check`
- **THEN** Studio recipe artifacts and workspace dependencies are built first
- **AND** Studio TypeScript is checked without requiring a full Vite bundle

#### Scenario: Focused architecture tests use Turbo prerequisites
- **WHEN** a developer runs the root architecture cutover test command
- **THEN** the focused Swooper Maps tests run through a package-local test task
- **AND** Turbo builds dependency packages before that focused test task starts

#### Scenario: Swooper Maps deploy builds workspace dependencies
- **WHEN** Studio or a developer deploys the Swooper Maps mod
- **THEN** the deploy script builds the workspace packages that feed the mod and
  CLI deploy command through Turbo before the mod-local build/deploy step
- **AND** request-id-sensitive generated map source is regenerated clean after
  Studio Run in Game proof collection

#### Scenario: Built map scripts are self-contained for Civ MapGeneration
- **WHEN** Swooper Maps builds generated map scripts for the deployed mod
- **THEN** repo-owned workspace packages used by those scripts are bundled into
  the map output
- **AND** the output scripts do not contain bare `@swooper/*`, `@civ7/*`, or
  `@mateicanavra/*` imports that Civ MapGeneration cannot resolve
- **AND** engine virtual imports such as `/base-standard/...` remain external
