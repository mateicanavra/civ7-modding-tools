## MODIFIED Requirements

### Requirement: Graph Runs Through Habitat Service And Nx Provider

Habitat SHALL expose the graph command as an owned service module while keeping
Nx graph command execution provider-owned and malformed graph payloads out of
successful output.

#### Scenario: Graph service rejects null graph payloads

- **WHEN** `NxProvider.graph` succeeds but the graph JSON contains
  `graph: null`
- **THEN** the graph service SHALL fail through the service error channel
- **AND** it SHALL NOT fall back to emitting the raw payload as graph data.

#### Scenario: Graph service projects valid graph payloads

- **WHEN** `NxProvider.graph` succeeds and the graph JSON contains a non-null
  `graph` object
- **THEN** the graph service SHALL emit that graph object.
