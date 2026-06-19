## ADDED Requirements

### Requirement: Habitat Core Uses Effect-First Domain And Provider Boundaries

Habitat SHALL organize reusable core code around Effect runtime services,
provider resources, domain services, and explicit public contracts.

#### Scenario: A command uses reusable Habitat logic

- **WHEN** an oclif command needs reusable Habitat behavior
- **THEN** it calls one Effect-backed program through the Habitat runtime
  adapter
- **AND** the reusable behavior lives in a domain service or provider module
- **AND** the command adapter remains responsible for host parsing and output
  rendering

#### Scenario: A capability calls an external tool

- **WHEN** Habitat needs Git, Grit, Biome, Nx, or Husky-related data
- **THEN** a provider module owns command construction, config, failures, and
  resource lifecycle
- **AND** a domain service consumes provider results without rebuilding vendor
  semantics locally

### Requirement: Public Contracts Are Explicit Before Source Movement

Habitat SHALL classify public exports, command JSON, hook behavior, root
scripts, and `.habitat` authored paths before moving implementation code.

#### Scenario: A module is moved

- **WHEN** a source module moves from `src/lib/**` into a target domain or
  provider location
- **THEN** every public import, package export, command output, and test
  callsite affected by that module is classified as public contract, internal
  callsite, or dead code
- **AND** dead code is removed rather than retained as another implementation
  path
