## ADDED Requirements

### Requirement: External Tools Are Habitat Providers

Habitat SHALL expose consumed external tools such as Git, Grit, Biome, and Nx
through provider services with typed commands, config, failures, resource
policy, and fake test layers.

#### Scenario: Habitat runs a vendor command

- **WHEN** a Habitat domain service needs vendor data
- **THEN** it calls the relevant provider service
- **AND** the provider constructs an argument-array command through
  `CommandRunner`
- **AND** the provider returns typed data or typed provider failure

#### Scenario: Vendor semantics are bounded

- **WHEN** provider results are consumed by Habitat
- **THEN** Habitat records which semantics are vendor-owned and which decisions
  are Habitat-owned
- **AND** providers do not claim baseline policy, architecture proof, staged
  transaction policy, or product behavior outside their vendor boundary

#### Scenario: Unconsumed hook delegators are not providers

- **WHEN** a repository hook is a static `.husky` delegator into `habitat hook`
- **THEN** Habitat SHALL preserve that public hook behavior at the hook surface
- **AND** it SHALL NOT keep an unused Husky provider service or fake provider
  layer without a runtime consumer
