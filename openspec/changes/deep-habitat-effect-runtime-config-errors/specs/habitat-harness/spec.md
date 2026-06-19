## ADDED Requirements

### Requirement: Habitat Runtime Owns Effect Execution And Resources

Habitat SHALL provide a shared Effect runtime substrate for command execution,
configuration, clocks, filesystem access, reporting, and scoped resources.

#### Scenario: A core module needs time or filesystem access

- **WHEN** reusable Habitat core logic needs time, filesystem, temp directory,
  cache, env, or command execution
- **THEN** it receives the capability through an Effect service
- **AND** direct access is limited to runtime/provider/host-adapter modules

#### Scenario: A command completes

- **WHEN** a Habitat command creates runtime-scoped resources
- **THEN** all finalizers complete before the host adapter returns
- **AND** no child process, temp directory, lock, queue, or fiber remains owned
  by the command scope

### Requirement: Expected Habitat Failures Are Typed

Habitat SHALL model expected command, config, filesystem, baseline,
protected-zone, workspace-graph, and staged-state failures as tagged errors or
explicit refusal data.

#### Scenario: An expected failure reaches a command adapter

- **WHEN** an expected failure reaches a CLI or hook adapter
- **THEN** the adapter renders it through a stable output path
- **AND** domain code does not require string matching of stderr to classify
  the failure
