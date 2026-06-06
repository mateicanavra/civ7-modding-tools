## ADDED Requirements

### Requirement: Build-elevation policy surfaces must be live or removed

The map generation workstream SHALL NOT retain exported Civ7 policy helpers
that are not consumed by the active pipeline or an active verification boundary.

#### Scenario: A recovered branch contributes an unused policy helper

- **GIVEN** a recovered branch contains a build-elevation policy helper
- **WHEN** the current recipe uses an explicit lifecycle drift policy instead
- **THEN** the unused helper MUST be removed or reattached through a tested
  runtime consumer
- **AND** provenance-only tests MUST NOT stand in for active policy enforcement.
