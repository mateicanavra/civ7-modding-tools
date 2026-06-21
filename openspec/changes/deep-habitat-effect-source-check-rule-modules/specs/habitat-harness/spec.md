## MODIFIED Requirements

### Requirement: Source Check Rule Modules

Habitat source-check SHALL represent native rule implementations as named
rule modules instead of one all-rules policy module.

#### Scenario: Selected rules load selected modules

- **WHEN** Habitat runs source-check for a selected set of source-check rules
- **THEN** it SHALL load only the implementation modules for those selected
  rule ids plus the shared source-check runtime
- **AND** diagnostics SHALL preserve the selected rule ids, severity mapping,
  and baseline behavior.

#### Scenario: Rule implementation edits have scoped Nx inputs

- **WHEN** a single source-check rule module changes
- **THEN** Nx direct rule targets SHALL depend on that specific rule module and
  the shared source-check runtime
- **AND** unrelated source-check rule modules SHALL NOT be direct inputs for
  that rule target.

#### Scenario: The monolith is removed

- **WHEN** source-check execution starts
- **THEN** Habitat SHALL NOT load `.habitat/source-check/source-rules.mjs`
- **AND** that old all-rules policy file SHALL NOT remain as an active bridge.
