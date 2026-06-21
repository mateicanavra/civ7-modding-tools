## MODIFIED Requirements

### Requirement: Source-check plans rule file applicability from registry facts

Habitat source-check execution SHALL use rule registry applicability facts
before invoking generated policy logic.

#### Scenario: Selected scan roots are collapsed before traversal

- **WHEN** source-check evaluates a selected set of source-check rules
- **AND** multiple selected scan roots overlap through ancestor/descendant
  repository paths
- **THEN** source-check SHALL traverse the ancestor root once
- **AND** descendant roots already covered by that ancestor SHALL NOT trigger
  additional filesystem walks.

#### Scenario: Root normalization preserves rule applicability

- **WHEN** source-check collapses selected scan roots for file collection
- **THEN** rule-level file matching SHALL still decide which rules inspect each
  collected file
- **AND** sibling roots and exact files outside selected parent coverage SHALL
  remain in the collection plan.
