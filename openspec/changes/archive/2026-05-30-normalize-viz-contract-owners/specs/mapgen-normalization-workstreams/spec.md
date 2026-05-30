## ADDED Requirements

### Requirement: Visualization Contracts Use Owner Surfaces

Standard recipe visualization contracts SHALL live at the nearest real owner:
stage/phase-level contracts at the stage surface, and step-private helpers in
the owning step only.

#### Scenario: A visualization helper has multiple consumers
- **WHEN** a visualization category, geometry converter, or palette is consumed
  by multiple steps or by a different stage
- **THEN** the helper is exported from `stages/<stage>/viz.ts` for the owner
  stage
- **AND** consumers do not import from another stage's private `steps/**`
  paths

#### Scenario: A visualization helper is step-private
- **WHEN** a visualization helper is imported only by files in its owning step
- **THEN** it may remain under `stages/<stage>/steps/<step>/viz.ts`
- **AND** any new external consumer must first promote the helper to the owner
  stage surface

#### Scenario: A stage-level visualization surface exists
- **WHEN** a stage-level visualization contract has replaced an old private
  path
- **THEN** wrapper-only re-exports at the old step path are removed
- **AND** guardrails reject private-step visualization hubs or cross-step
  imports
