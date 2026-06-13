## ADDED Requirements

### Requirement: Package Test Scripts Stay Project-Scoped

Package-local Vitest test scripts SHALL execute only the package's intended
Vitest project when the root workspace config is in scope.

#### Scenario: Plugin package runs its local test script
- **WHEN** a plugin package runs `bun run test`
- **THEN** the script selects that plugin's Vitest project with
  `--project <plugin-project>`
- **AND** unrelated root workspace projects are not executed

#### Scenario: Root Nx runs plugin test targets
- **WHEN** Nx runs plugin package `test` targets
- **THEN** each target executes the same scoped Vitest project used by the
  package-local script
