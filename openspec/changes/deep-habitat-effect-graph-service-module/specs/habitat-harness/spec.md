## ADDED Requirements

### Requirement: Graph Runs Through Habitat Service And Nx Provider

Habitat SHALL expose the graph command as an owned service module while keeping
Nx graph command execution provider-owned.

#### Scenario: Graph CLI runs

- **WHEN** a user runs `habitat graph`
- **THEN** the command calls the in-process Habitat service client
- **AND** the service module owns graph JSON projection and command result
  output
- **AND** the CLI handles only flags, stream writes, and exit behavior

#### Scenario: Graph service needs Nx output

- **WHEN** the graph service needs a project graph JSON file
- **THEN** it asks `NxProvider` to run the graph command
- **AND** it uses Effect-managed temp directory acquisition for the output path
- **AND** it reads the graph JSON through Habitat filesystem resources
- **AND** it does not shell out or read files directly from the CLI
