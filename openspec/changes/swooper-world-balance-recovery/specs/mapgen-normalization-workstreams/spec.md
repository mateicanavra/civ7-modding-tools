## ADDED Requirements

### Requirement: Pipeline Policy Authority Is Preserved

Swooper map generation SHALL use the pipeline's authored artifacts as the source
of truth for ecology, terrain, resources, and placement while applying Civ7
policy knowledge before runtime so the engine does not need to auto-correct
authored output.

#### Scenario: Civ readback differs from authored truth
- **WHEN** Civ engine readback reports a different river, terrain, feature, or
  placement state after projection
- **THEN** the difference is recorded as diagnostic mismatch evidence
- **AND** downstream pipeline stages continue to depend on the authored
  pipeline artifact, not the readback artifact

#### Scenario: Floodplain-capable features are scored
- **WHEN** ecology scores feature substrates that depend on navigable rivers
- **THEN** ecology consumes the MapGen-authored projected navigable-river mask
- **AND** placement only consumes the resulting ecology feature surfaces

### Requirement: Mountain Regions Are Product-Visible Regions

Swooper Earthlike morphology SHALL measure and preserve mountain regions as
long, physically gated, internally varied regions rather than only counting
single-tile mountain spines.

#### Scenario: A representative Earthlike seed is evaluated
- **WHEN** mountain morphology is summarized for stable Earthlike seeds
- **THEN** tests report region footprint, component diameter, peak share,
  foothill/rough support, non-mountain interior share, flat interior share, and
  largest flat pocket size
- **AND** a long mountain spine without region width and internal passages does
  not satisfy the balance gate

### Requirement: Recovery Evidence Is Durable

World-balance recovery SHALL preserve investigation, implementation, generated
artifact, and verification evidence in OpenSpec artifacts so compaction or
parallel agents cannot erase what was restored.

#### Scenario: The workstream resumes after interruption
- **WHEN** a later agent resumes this change
- **THEN** the proposal, tasks, and workstream record identify recovered
  behaviors, remaining gates, and the authority boundary for Civ policy vs.
  pipeline authorship
