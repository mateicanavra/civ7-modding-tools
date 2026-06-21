## MODIFIED Requirements

### Requirement: Source Check Rule Module Metadata

Habitat source-check rule modules SHALL declare the file extensions they can
evaluate so the execution planner can bound file collection to selected rule
capabilities.

#### Scenario: Selected rule extensions bound file collection

- **WHEN** source-check runs a selected set of rules
- **THEN** Habitat SHALL collect source paths using the union of the selected
  rule modules' candidate extensions
- **AND** each rule SHALL only evaluate files whose extension is declared by
  that rule module.

#### Scenario: Missing extension metadata is refused

- **WHEN** a source-check rule module does not export a non-empty
  `candidateExtensions` array
- **THEN** Habitat SHALL report that rule as an unsupported native rule instead
  of silently applying a global default.
