## ADDED Requirements

### Requirement: Legacy Bridge Is Not A Runtime Control Path

Repo-owned Civ7 runtime control SHALL use direct tuner-socket control only.

#### Scenario: CLI controls Civ7
- **WHEN** a developer uses repo CLI commands to inspect or control Civ7
- **THEN** the CLI calls `@civ7/direct-control`
- **AND** it does not expose bridge transport flags or append bridge log
  requests

#### Scenario: Direct control fails
- **WHEN** direct-control discovery, health, command execution, or restart fails
- **THEN** the caller receives a classified direct-control error
- **AND** repo tooling does not invoke FireTuner UI automation or Windows bridge
  scripts as a fallback

#### Scenario: Shared bridge artifacts are cleaned up
- **WHEN** bridge-removal cleanup runs
- **THEN** shared-drive bridge scripts and wrappers are removed or explicitly
  preserved with a recorded reason
- **AND** official FireTuner binaries are not deleted as part of bridge cleanup
  because they are development tools and reference-client evidence
