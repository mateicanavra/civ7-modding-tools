## ADDED Requirements

### Requirement: Core Purity And Studio Contracts Are Separate From D1

Consumer/package-boundary repairs SHALL be specified separately from the D1
config-shape migration unless the only changes are direct config callsite
fallout.

#### Scenario: Pure core owns a Civ7-bound helper
- **WHEN** a helper under pure MapGen core imports adapter values or runtime
  globals
- **THEN** the consumer-boundary change moves it to an explicit runtime owner
- **AND** pure core retains only pure authoring, typing, or recipe contracts

### Requirement: Studio Contract Source Is Explicit

Studio SHALL consume recipe config schema/default contracts from an intentional
source-visible or generated-contract owner.

#### Scenario: Studio reads recipe config contracts
- **WHEN** Studio imports schema or default config for a recipe
- **THEN** the owning source or generated-contract path is documented
- **AND** generated artifacts are not treated as editable product policy
