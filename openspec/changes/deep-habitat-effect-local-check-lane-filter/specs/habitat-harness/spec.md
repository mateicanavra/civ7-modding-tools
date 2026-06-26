## MODIFIED Requirements

### Requirement: Local Check Lane

Habitat SHALL keep unscoped local diagnostic checks separate from graph and
hygiene proof lanes.

#### Scenario: Default local check runs local Habitat tools

- **WHEN** a caller runs an unscoped current-tree `habitat check`
- **THEN** Habitat SHALL execute local Habitat rule tools
- **AND** Habitat SHALL NOT execute graph proof or hygiene proof tools as part
  of that default local lane.

#### Scenario: Explicit selectors still run proof rules

- **WHEN** a caller selects a graph or hygiene proof rule by owner, tool, or rule
- **THEN** Habitat SHALL execute the selected rules
- **AND** Habitat SHALL NOT silently drop them from the explicit selection.
