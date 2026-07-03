## MODIFIED Requirements

### Requirement: Hook Service Execution

Habitat hook service procedures SHALL execute Habitat-owned checks inside the
service runtime instead of invoking the Habitat CLI as a subprocess.

#### Scenario: Pre-commit staged checks run in process

- **WHEN** the Habitat service client runs the `pre-commit` hook
- **THEN** staged `file-layer` checks SHALL be executed through the
  `StructuralCheck` service
- **AND** staged `pattern-check` checks SHALL be executed through the
  `StructuralCheck` service when staged paths are eligible
- **AND** the hook SHALL pass its staged path snapshot into those checks
- **AND** the hook SHALL NOT spawn `habitat check` to run those checks.
