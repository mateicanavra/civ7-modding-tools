## ADDED Requirements

### Requirement: Authoring Topology Requests Are Fenced From Current Structural Scaffolding

Habitat SHALL classify MapGen recipe, domain, operation, stage, step, contract,
default, schema, registry, public-surface, Studio artifact, and topology-wiring
generation requests as unsupported Authoring Topology requests unless a later
accepted Authoring Topology packet opens implementation.

#### Scenario: Recipe/domain/stage/step generation is requested
- **WHEN** an agent asks current Habitat to create a MapGen recipe, domain,
  domain operation, recipe stage, recipe step, or authoring topology wiring
- **THEN** Habitat refuses before writes through the D13 scaffold refusal
  envelope
- **AND** the refusal carries D14-owned blocked-action language
- **AND** no MapGen source, registry, recipe, Studio artifact, or generated file
  is written
- **AND** the refusal states that current Habitat does not implement Authoring
  Topology

#### Scenario: Generic project scaffolding is requested
- **WHEN** an agent requests a D13-supported uniform workspace project scaffold
- **THEN** Habitat evaluates the request through D13's supported scaffold
  contract
- **AND** D14 does not require MapGen authoring concepts for that generic
  workflow
- **AND** the resulting receipt or refusal does not claim authoring topology
  support

#### Scenario: Existing MapGen path is classified
- **WHEN** Habitat classifies an existing path such as
  `mods/mod-swooper-maps/src/recipes/standard`
- **THEN** D4 orientation facts may describe project/path ownership and runnable
  target availability
- **AND** those facts SHALL NOT be interpreted as generator support, authoring
  readiness, product approval, target freshness, apply safety, or verify closure

### Requirement: D14 Supplies Authoring-Specific Refusal Language For D13

D13 SHALL own the generic scaffold refusal envelope. D14 SHALL own the
authoring-specific `blocked_action`, `request_class`, recovery instruction,
retry condition, and support-boundary language for Authoring Topology refusals.

#### Scenario: D13 receives an unsupported scaffold request
- **WHEN** D13 receives a project generator request outside the supported
  generic scaffold contract
- **THEN** Habitat refuses through the D13 scaffold refusal envelope
- **AND** the write set is empty
- **AND** the recovery text does not claim authoring topology support
- **AND** the implementation does not infer product-specific topology from
  generator input strings

#### Scenario: A product-specific authoring request appears before a future authoring surface
- **WHEN** a request asks current Habitat to create product-specific topology
  that is not part of the supported generic scaffold contract
- **THEN** Habitat refuses before writes through the generic unsupported
  scaffold boundary
- **AND** product-specific authoring support remains blocked until a future
  accepted authoring contract owns the command/API surface

### Requirement: Future Authoring Topology Has Explicit Acceptance Criteria

Habitat SHALL NOT open authoring implementation until a later accepted packet
defines a current-topology investigation, target topology model, first vertical
slice, generator write contract, D0 public compatibility handling, validation
matrix, and current support-boundary set.

#### Scenario: Future work proposes a MapGen authoring generator
- **WHEN** a future packet proposes generating MapGen authoring structures
- **THEN** it cites a current investigation of MapGen docs, domain source,
  recipe source, mapgen-core source, and relevant tests
- **AND** it names one owner for each recipe/domain/operation/stage/step,
  registry, public export, generated/protected-zone, and Studio artifact
  responsibility
- **AND** it defines a first vertical slice that crosses generation, wiring, and
  validation
- **AND** it defines exact generated writes, registry updates, collision policy,
  rollback/no-residue behavior, and invalid-topology refusals
- **AND** it includes generator tests, Nx generator dry-run records,
  `habitat classify` over generated paths or diff, owning package checks/tests,
  `habitat:check`, and recipe compilation or the nearest accepted recipe gate

#### Scenario: Future work cites D4, D12, or D13 as authoring support
- **WHEN** a future packet uses D4 orientation, D12 verify handoff, or D13
  scaffold behavior as acceptance input
- **THEN** it SHALL state the exact consumed fact
- **AND** it SHALL preserve the D14 support boundary that those upstream packets do not
  themselves prove authoring readiness

### Requirement: D14 Does Not Open Authoring Implementation

D14 acceptance SHALL NOT mean Authoring Topology implementation exists.
Current Habitat source remains limited to the supported generic scaffold
contract and D13 unsupported-project-kind refusals. Future authoring
implementation remains blocked behind concrete D0 rows and a later accepted
Authoring Topology packet with a structured command/API surface.

#### Scenario: D14 current boundary is accepted
- **WHEN** D14 final rereviews and validations pass
- **THEN** packet index and workstream records state D14 keeps current Habitat
  source free of product-specific authoring parsers, DTOs, and authoring data
  files
- **AND** current unsupported project scaffolds continue to refuse before writes
  through D13's generic refusal envelope
- **AND** future authoring source work remains blocked behind concrete D0 rows
  and a later accepted authoring command/API contract

#### Scenario: Implementation tries to add authoring files during Phase 3
- **WHEN** a Phase 3 implementation packet adds MapGen recipe/domain/operation/
  stage/step generator behavior without a later accepted Authoring Topology
  packet
- **THEN** D14 blocks that implementation as out of scope
- **AND** the correct repair is a future authoring packet, not local source
  expansion inside D13 or D14
