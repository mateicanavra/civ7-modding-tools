## ADDED Requirements

### Requirement: Root Test Proof Uses Project-Appropriate Timeout Budgets

Repo-wide Habitat proof runs SHALL allow integration-heavy Vitest projects to
declare project-scoped timeout budgets without changing unrelated projects.

#### Scenario: Mapgen Studio runs under root Nx test load
- **WHEN** Nx runs `mapgen-studio:test` as part of a repo-wide or
  representative root test run
- **THEN** the project uses its explicit `mapgen-studio` timeout budget
- **AND** tests fail only on assertion/runtime failures, not the default
  workspace 5s timeout being too small under full-load execution
- **AND** unrelated projects keep their existing timeout behavior

#### Scenario: Browser-runner visibility proof uses compact fixture scale
- **WHEN** `standardLayerVisibility` runs the standard recipe in the browser
  worker harness
- **THEN** the test may use a compact standard-recipe map size that keeps the
  worker runtime inside the project timeout budget
- **AND** it still asserts the terminal `run.finished` event, default-visible
  core balance layers, vector/arrow tile movement layers, and debug-only raw
  world motion layers
