## ADDED Requirements

### Requirement: Command Rule Execution Dedupe

Habitat structural checks SHALL execute identical command rule vectors once and
project the shared result to each consuming rule.

#### Scenario: Multiple rules share a command vector

- **WHEN** selected command-backed rules have the same executable, argv, and cwd
- **THEN** Habitat runs the command vector once through the command provider
- **AND** each selected rule receives a rule-specific report derived from the
  shared command result
- **AND** each selected rule report includes shared timing metadata

#### Scenario: Distinct command vectors stay independent

- **WHEN** selected command-backed rules have different executable or argv values
- **THEN** Habitat runs them as separate command provider requests
- **AND** their rule reports do not require shared timing metadata

#### Scenario: Shared command failure keeps rule-specific diagnostics

- **WHEN** a shared command provider request fails
- **THEN** Habitat projects the provider failure into each consuming rule
- **AND** each diagnostic uses the consuming rule's message and lane
