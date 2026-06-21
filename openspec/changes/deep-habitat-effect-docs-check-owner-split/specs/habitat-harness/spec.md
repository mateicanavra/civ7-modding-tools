## MODIFIED Requirements

### Requirement: Source Check Domain Ownership

Habitat source-check SHALL own source architecture checks, not general docs/text
hygiene.

#### Scenario: Docs local checkout paths use command-check

- **WHEN** Habitat evaluates `docs-local-checkout-paths`
- **THEN** the rule SHALL run through `command-check`
- **AND** diagnostics SHALL retain the affected docs path and line number.

#### Scenario: Source-check excludes docs hygiene

- **WHEN** Habitat runs `--tool source-check`
- **THEN** `docs-local-checkout-paths` SHALL NOT be part of the selected
  source-check rule set
- **AND** Markdown files SHALL NOT be candidate source-check files solely for
  docs-local checkout hygiene.

#### Scenario: Docs rewrite pattern remains available

- **WHEN** Habitat validates Grit pattern fixtures
- **THEN** the docs local checkout rewrite apply pattern SHALL remain testable
- **AND** the duplicate source-check detection pattern SHALL NOT remain as a
  second active implementation.
