## ADDED Requirements

### Requirement: Shipped Maps Reject Visual Lake Scatter

The MapGen normalization workstream SHALL test player-visible lake shape and
projection state for shipped map identities, not only aggregate lake area.

#### Scenario: Lake area is split into isolated dots

- **WHEN** a shipped map identity is run through the public standard recipe and runtime
- **THEN** world-balance stats measure engine lake connected components,
  one-tile lake share, largest lake component size, projection mismatch, and
  water-fill drift
- **AND** the proof rejects maps where acceptable lake area is mostly isolated
  one-tile basins

#### Scenario: Lake projection is accepted by the engine

- **WHEN** Hydrology lake truth is projected by map-hydrology
- **THEN** engine-accepted lake tiles remain water in adapter readback
- **AND** rejected lake tiles stay within the shipped-map mismatch budget

#### Scenario: Current strategy selections are available

- **WHEN** a shipped map config has a named current strategy that better matches
  the map identity than an older/simple selection
- **THEN** the config selects the named strategy
- **AND** broad replacement of every `default` selection is not required because
  current advanced implementations may be registered as `default`
