## MODIFIED Requirements

### Requirement: Apply admissions produce executable transaction inputs

Habitat apply admissions SHALL produce transaction inputs only when their
related rule identities exist and their dry-run commands have explicit
non-empty roots.

#### Scenario: Apply roots belong to the apply admission

- **WHEN** a built-in apply admission is converted into transaction input
- **THEN** its dry-run command roots SHALL come from apply admission metadata
- **AND** the roots SHALL NOT depend on the diagnostic rule's current owner
  tool.

#### Scenario: Command-owned diagnostics can back apply admissions

- **WHEN** an apply admission references a registered command-owned diagnostic
  rule
- **THEN** Habitat SHALL still produce a transaction input for the apply
  admission
- **AND** the dry-run command SHALL use the apply admission's roots.

#### Scenario: Missing related rules still block transaction inputs

- **WHEN** an apply admission references a rule id that is absent from the
  provided rule facts
- **THEN** Habitat SHALL NOT synthesize a transaction input for that admission.
