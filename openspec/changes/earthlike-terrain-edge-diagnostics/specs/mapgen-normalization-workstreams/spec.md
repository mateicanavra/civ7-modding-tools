## ADDED Requirements

### Requirement: Terrain Edge Deltas Require Projection Evidence Before Repair

Swooper recovery terrain edge repairs SHALL be preceded by exact-authored
terrain row context and projection/readback evidence that identifies the owner
of each coast/ocean mismatch.

#### Scenario: Coast/ocean terrain edge rows are observed

- **WHEN** final-surface parity reports local/live terrain mismatches involving
  `TERRAIN_COAST` and `TERRAIN_OCEAN`
- **THEN** diagnostics record the exact request identity, row coordinates,
  local/live terrain symbols, neighborhood water classes, and candidate owners
- **AND** source authority remains unresolved until shelf/coast/lake,
  projection-boundary, validation, or live water/area evidence identifies the
  owner

#### Scenario: Live terrain edge facts are read from Civ

- **WHEN** a verifier records live water/lake/area context for terrain edge
  rows
- **THEN** the artifact is bound to the saved exact-authored request and
  current runtime identity
- **AND** each row has successful facts for terrain, water, lake, river type,
  area id, region id, and landmass id
- **AND** missing or failed requested facts keep the artifact blocked rather
  than complete

#### Scenario: Terrain repair is proposed

- **WHEN** a change proposes a coast/ocean terrain repair
- **THEN** it cites the classified row owner
- **AND** it does not use feature/resource legality evidence as terrain repair
  authority unless shared materialization ownership is proven
