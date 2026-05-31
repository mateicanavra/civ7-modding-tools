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

### Requirement: Package Checks Do Not Rely On Stale Generated Dependencies

The Turbo graph SHALL encode generated/build prerequisites for package checks
that depend on generated files or built workspace declarations.

#### Scenario: Swooper Maps check runs through Turbo
- **WHEN** Turbo runs `mod-swooper-maps#check`
- **THEN** Swooper map artifacts and dependency declaration outputs are built
  first
- **AND** the check does not depend on a developer remembering manual package
  order

#### Scenario: Studio check runs through Turbo
- **WHEN** Turbo runs `mapgen-studio#check`
- **THEN** Studio recipe artifacts and workspace dependencies are built first
- **AND** Studio TypeScript is checked without requiring a full Vite bundle

#### Scenario: Focused architecture tests use Turbo prerequisites
- **WHEN** a developer runs the root architecture cutover test command
- **THEN** the focused Swooper Maps tests run through a package-local test task
- **AND** Turbo builds dependency packages before that focused test task starts
