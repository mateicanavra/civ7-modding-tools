## ADDED Requirements

### Requirement: Studio Recipe DAG Uses Authored Artifact Contracts

MapGen Studio SHALL expose a selected-recipe dependency graph whose artifact
edges are derived from authored recipe stage and step contracts rather than
generated UI metadata or React-local inference.

#### Scenario: Selected standard recipe DAG is requested

- **WHEN** Studio requests the DAG for `mod-swooper-maps/standard`
- **THEN** the graph includes stage nodes in authored recipe order
- **AND** each stage node includes its sequential authored steps
- **AND** cross-stage artifact edges are derived from explicit
  `step.contract.artifacts.requires` and `step.contract.artifacts.provides`
- **AND** merged `requires`/`provides` tags are exposed only as step metadata
  unless they also originate from explicit artifact contracts

#### Scenario: Phase grouping is rendered

- **WHEN** a graph contains steps with `phase` ids
- **THEN** Studio groups stages into phase clusters or lanes for scanning
- **AND** the phase grouping does not replace recipe order as the execution
  order signal

### Requirement: Studio Recipe DAG Is Served Through oRPC And Effect

The Studio recipe DAG API SHALL be exposed through a Studio-owned oRPC
procedure implemented with Effect-compatible `effect-orpc` patterns.

#### Scenario: Known recipe is loaded

- **WHEN** the client calls the recipe DAG procedure with a known Studio recipe
  id
- **THEN** the procedure returns a JSON-safe DAG DTO containing recipe identity,
  phases, stages, artifact edges, and diagnostics
- **AND** the DTO is ready for rendering without client-side artifact semantic
  reconstruction

#### Scenario: Unknown recipe is loaded

- **WHEN** the client calls the recipe DAG procedure with an unknown recipe id
- **THEN** the procedure returns a typed public oRPC error
- **AND** the error does not expose raw stack traces or filesystem internals

### Requirement: Studio Provides A Full-Screen DAG View

MapGen Studio SHALL provide a secondary full-screen view for the selected recipe
DAG as a peer to the existing map/config exploration experience.

#### Scenario: Recipe author switches to the DAG view

- **WHEN** a recipe author activates the DAG view
- **THEN** Studio renders stage nodes, artifact dependency edges, phase
  grouping, and expandable step details for the selected recipe
- **AND** loading, empty, diagnostic, and error states are accessible
- **AND** selecting a different recipe reloads the DAG for that recipe id

#### Scenario: Dense recipe dependency graph is scanned

- **WHEN** the selected recipe contains many stages and cross-stage artifact
  dependencies
- **THEN** Studio lays out stages by dependency rank with phase lanes as visual
  grouping
- **AND** dependency edges use stable routed paths and labels that make producer
  and consumer relationships easier to follow
- **AND** the graph remains a smooth native scroll surface for trackpad panning
