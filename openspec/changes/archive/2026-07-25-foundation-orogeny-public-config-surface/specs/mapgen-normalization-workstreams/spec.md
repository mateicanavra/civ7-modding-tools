## ADDED Requirements

### Requirement: Foundation Orogeny Uses Semantic Public Config

The Swooper standard recipe SHALL expose Foundation Orogeny configuration
through a semantic public authoring schema rather than an internal operation
envelope.

#### Scenario: Default config materializes

- **WHEN** Studio builds the default Swooper standard recipe config
- **THEN** the `foundation-orogeny` section contains only `knobs` and
  `crustCharacter` as author-facing public fields
- **AND** does not expose operation strategy/config envelopes
- **AND** the recipe compile path can produce the internal operation input
  required by runtime execution

#### Scenario: Built-in preset applies

- **WHEN** a built-in map preset is applied in Studio
- **THEN** the resulting authoring config validates against the recipe public
  schema
- **AND** does not expose internal operation envelopes

#### Scenario: Existing config contains legacy envelope

- **WHEN** a first-party checked-in config contains the legacy Foundation
  Orogeny operation envelope
- **THEN** the packet migrates that config to `crustCharacter`
- **AND** new Studio authoring state is not generated from the legacy envelope

#### Scenario: Imported config contains legacy envelope

- **WHEN** an imported or user-provided config contains the legacy Foundation
  Orogeny operation envelope
- **THEN** public config validation rejects it with a safe validation error
- **AND** Studio does not scrub or normalize it locally
