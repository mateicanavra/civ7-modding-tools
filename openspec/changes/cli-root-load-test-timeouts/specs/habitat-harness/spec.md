## ADDED Requirements

### Requirement: CLI Root-Load Tests Use Project-Appropriate Timeout Budgets

Repo-wide Habitat proof runs SHALL allow the oclif CLI Vitest project to
declare a project-scoped timeout budget without changing unrelated projects.

#### Scenario: CLI tests run under Nx/root-load execution
- **WHEN** Nx runs `@mateicanavra/civ7-cli:test` as part of a focused or
  repo-wide root test run
- **THEN** the project uses its explicit `cli` timeout budget
- **AND** tests fail only on assertion/runtime failures, not the default
  workspace 5s timeout being too small under Nx/root-load execution
- **AND** unrelated projects keep their existing timeout behavior
