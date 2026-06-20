## ADDED Requirements

### Requirement: Owned Habitat Capabilities Are Service Modules

Habitat SHALL expose owned command, hook, check, fix, graph, verification,
classification, pattern, scaffolding, and transformation capabilities through
Effect-oRPC service modules rather than provider-shaped APIs or incidental
`src/lib` workflows.

#### Scenario: A command has an owned service module

- **WHEN** a Habitat CLI command invokes a capability that has a service module
- **THEN** the command calls the in-process Habitat service client for owned
  orchestration
- **AND** the command remains responsible only for flag parsing, rendering, and
  exit behavior
- **AND** it does not call the legacy `src/lib` workflow directly

#### Scenario: A service module consumes vendor behavior

- **WHEN** a Habitat service module needs Git, Grit, Biome, Nx, Husky,
  filesystem, clock, command execution, or reporter behavior
- **THEN** it consumes that behavior through Effect providers/resources
- **AND** the provider returns typed provider observations or failures
- **AND** the provider does not import service modules or decide Habitat
  product policy

#### Scenario: Service topology is extended

- **WHEN** a new Habitat capability is moved into the service layer
- **THEN** its contract lives under `src/service/modules/<capability>/contract.ts`
- **AND** its module implementer binding lives under
  `src/service/modules/<capability>/module.ts`
- **AND** its procedure bindings live under a module router or procedure files
- **AND** root service files compose module contracts and routers without
  handler logic

#### Scenario: Transformation application runs as an owned service module

- **WHEN** `habitat fix` applies an admitted transformation transaction
- **THEN** the apply lifecycle runs through the `transactions.apply` service
  module capability
- **AND** `fix` does not call a `src/lib/pattern-apply` execution runner
- **AND** `src/lib/pattern-apply` may only retain DTO, parser, presenter, or
  observation material until the transformation-domain split moves it
