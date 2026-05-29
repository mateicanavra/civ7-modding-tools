## ADDED Requirements

### Requirement: Catalog Cleanup Distinguishes Shared Surfaces From Drift

The morphology/catalog owner change SHALL classify broad catalogs before
moving or deleting them.

#### Scenario: A domain or recipe catalog is retained
- **WHEN** a broad catalog remains after owner cleanup
- **THEN** it is a thin barrel or an explicit shared surface
- **AND** its invariant and concrete consumers are documented

### Requirement: Milestone Tags Are Retired Before G1

Milestone-prefixed tag identifiers SHALL be renamed, retired, or explicitly
excluded before the G1 guardrail is enabled.

#### Scenario: G1 is proposed
- **WHEN** the milestone-tag guard is enabled
- **THEN** active source no longer uses milestone-prefixed tag identifiers
- **AND** any remaining occurrence is historical, archived, or explicitly
excluded
