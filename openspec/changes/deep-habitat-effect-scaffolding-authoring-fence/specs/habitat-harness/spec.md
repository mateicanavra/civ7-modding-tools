## ADDED Requirements

### Requirement: Scaffolding Respects Authoring Fences

Habitat SHALL move project and pattern scaffolding behind domain/provider
contracts while refusing unsupported host/product authoring shapes.

#### Scenario: A supported uniform project is generated

- **WHEN** Habitat scaffolds a supported uniform project kind
- **THEN** scaffolding domain logic consumes Nx generator/tree capabilities
- **AND** generated output preserves existing kind, package, tsconfig, README,
  and target semantics

#### Scenario: An unsupported authoring shape is requested

- **WHEN** a request asks generic Habitat to generate unsupported product
  authoring semantics
- **THEN** Habitat refuses with a typed refusal
- **AND** D14 remains the authoring fence rather than an implementation
  authorization
