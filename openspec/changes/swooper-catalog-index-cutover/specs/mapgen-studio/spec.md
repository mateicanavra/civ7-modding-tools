## ADDED Requirements

### Requirement: Catalog Generation Reads The Catalog Source Index

Swooper Maps SHALL generate catalog map metadata from the catalog source index.

#### Scenario: Catalog generation runs

- **WHEN** catalog map artifact generation runs
- **THEN** it reads catalog sources from `CatalogSourceIndex`
- **AND** emits Studio catalog metadata from those indexed sources

#### Scenario: Catalog source index is invalid

- **WHEN** the catalog source index references a missing or invalid source
- **THEN** catalog generation fails before emitting catalog metadata

