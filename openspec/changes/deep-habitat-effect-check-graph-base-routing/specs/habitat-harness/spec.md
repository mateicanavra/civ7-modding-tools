## MODIFIED Requirements

### Requirement: Graph Check Base Routing

Habitat SHALL run local graph validation with an explicit affected base that
matches the active stacked-work branch whenever possible.

#### Scenario: Verify prefers Graphite parent

- **WHEN** verify runs without an explicit base
- **AND** Graphite reports a parent branch
- **THEN** verify SHALL use that parent as the affected base
- **AND** the verify receipt SHALL record `graphite-parent` as the base source.

#### Scenario: Verify preserves fallback behavior

- **WHEN** verify runs without an explicit base
- **AND** no Graphite parent is available
- **THEN** verify SHALL fall back to the remote-default merge-base.
