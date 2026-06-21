## ADDED Requirements

### Requirement: Shared Check Timing

Habitat check reports SHALL distinguish rule-local work from work shared across
multiple selected rules.

#### Scenario: Pattern rules share one source-check scan

- **WHEN** a Habitat check selects more than one pattern-check rule
- **AND** those rules execute through the shared source-check path
- **THEN** each affected rule report includes shared timing metadata
- **AND** the shared timing identifies the `source-check:pattern-rules` group
- **AND** the shared timing records the elapsed group duration and selected rule
  count

#### Scenario: Single pattern rule keeps a direct duration

- **WHEN** a Habitat check selects exactly one pattern-check rule
- **THEN** the rule report remains renderable with a concrete duration
- **AND** the report does not require shared timing metadata

#### Scenario: Human output summarizes shared work

- **WHEN** the human Habitat check renderer receives reports with shared timing
- **THEN** individual rule lines identify the shared group
- **AND** the renderer emits one shared-work summary per group
- **AND** the summary shows the elapsed group duration and rule count

#### Scenario: Graph-backed rules share grouped Nx execution

- **WHEN** more than one selected graph-backed command rule executes through one
  grouped Nx operation
- **THEN** each affected rule report includes shared timing metadata
- **AND** the shared timing identifies the `nx:graph-targets` group
