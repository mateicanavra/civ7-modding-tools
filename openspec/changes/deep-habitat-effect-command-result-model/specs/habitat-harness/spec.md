## ADDED Requirements

### Requirement: Habitat Command Observations Use One Typed Model

Habitat SHALL use one typed command request/result/error model for provider
commands and command observations.

#### Scenario: A provider command completes

- **WHEN** a provider command completes
- **THEN** Habitat records command id, kind, executable, argv, cwd, env delta,
  timing, exit, signal/interruption, stdout/stderr bounds, digest, cache
  observation when applicable, and typed failure state
- **AND** the command observation does not require stderr string matching to
  classify expected failures

#### Scenario: A command is not run

- **WHEN** a precondition refuses a command before execution
- **THEN** Habitat records a typed not-run state with the refusal reason
- **AND** no fabricated process exit is used as proof
