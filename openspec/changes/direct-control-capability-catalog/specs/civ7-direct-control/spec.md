## ADDED Requirements

### Requirement: Direct Control Provides A Provenance-Aware Capability Catalog

The direct-control package SHALL provide a machine-readable capability catalog
that records runtime, official resource, declaration, and wrapper provenance.

#### Scenario: Runtime snapshot is generated
- **WHEN** a caller generates a runtime capability snapshot
- **THEN** the package probes curated App UI and Tuner roots through direct
  control
- **AND** it records state role, phase, path, kind, descriptors, methods,
  confidence, access classification, risk classification, and wrapper
  recommendation

#### Scenario: Official resources are merged
- **WHEN** official resource evidence is available
- **THEN** the catalog records table and enum-like identifiers with official
  resource provenance
- **AND** it does not treat official resource shape as an implemented wrapper
  contract

#### Scenario: Type declarations are promoted
- **WHEN** catalog evidence supports durable ambient declarations
- **THEN** declaration updates in `@civ7/types` require a reviewed source-backed
  path
- **AND** generated catalog output alone is not sufficient promotion authority

### Requirement: Catalog Generation Does Not Generate Wrapper APIs Blindly

The direct-control catalog SHALL NOT automatically create high-level wrapper
functions from native runtime method names.

#### Scenario: Native method has weak metadata
- **WHEN** runtime introspection sees a native method with weak signature data
- **THEN** the catalog records availability and confidence
- **AND** wrapper implementation remains a reviewed package decision
