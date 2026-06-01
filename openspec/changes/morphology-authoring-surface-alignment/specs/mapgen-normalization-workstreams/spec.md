## ADDED Requirements

### Requirement: Morphology Public Fields Are Documented And Range-Bounded

The standard recipe Morphology public authoring surface SHALL keep semantic
public keys and SHALL document/range-bound every public field exposed to authors
or Studio schema consumers.

#### Scenario: Morphology schema is inspected
- **WHEN** the standard recipe config schema is generated
- **THEN** Morphology public keys remain the accepted semantic keys for
  `morphology-coasts`, `morphology-routing`, `morphology-erosion`, and
  `morphology-features`
- **AND** those stages do not expose raw `{ strategy, config }` envelopes
- **AND** every Morphology public field has a schema description
- **AND** every Morphology public numeric leaf has both `minimum` and `maximum`

#### Scenario: Studio consumes generated schema artifacts
- **WHEN** Studio validates the generated standard recipe default config and
  schema
- **THEN** Morphology exposes only the accepted semantic public keys
- **AND** Morphology fields used by Studio have descriptions and bounds

### Requirement: Morphology Alignment Does Not Change Shipped Compile Output

The Morphology documentation/range alignment SHALL preserve executable
Morphology config for first-party shipped maps unless a behavior-change proof is
recorded.

#### Scenario: Shipped configs compile
- **WHEN** first-party shipped map configs are validated and compiled
- **THEN** they remain schema-valid
- **AND** stable serialized compiled Morphology config matches the pre-slice
  compiled Morphology golden fixture
- **AND** no runtime/in-game behavior proof is claimed for this schema-only
  alignment slice
