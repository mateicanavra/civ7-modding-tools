## ADDED Requirements

### Requirement: Swooper Catalog Sources Are Explicit

Swooper Maps SHALL define durable catalog membership through a tracked catalog
source index.

#### Scenario: Catalog source is valid

- **WHEN** the catalog source index is read
- **THEN** every entry has a stable catalog source id, config path, display
  metadata, and digest inputs
- **AND** every referenced config path resolves in the repository

#### Scenario: Catalog source identity is invalid

- **WHEN** two catalog source entries reuse an id or config path
- **THEN** catalog source index validation fails before Studio consumes the
  index

#### Scenario: Catalog cutover has not happened yet

- **WHEN** catalog generation still uses its previous source set
- **THEN** the temporary consistency Grit pattern asserts that source set
  matches `CatalogSourceIndex`
- **AND** a mismatch blocks launch-source resolution from treating the index as
  authoritative
