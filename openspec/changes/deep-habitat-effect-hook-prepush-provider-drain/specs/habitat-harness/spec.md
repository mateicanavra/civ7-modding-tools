## ADDED Requirements

### Requirement: Hook Pre-Push Uses Provider-Backed Service Execution

Habitat pre-push execution SHALL be owned by the hook service module and SHALL
execute affected project checks through explicit providers instead of an
exported synchronous hook helper.

#### Scenario: Pre-push runs through the hook service

- **WHEN** `habitat hook pre-push` runs
- **THEN** the CLI calls the Habitat hook service
- **AND** base selection is resolved inside the service path
- **AND** Nx affected execution is delegated through `NxProvider`
- **AND** the old synchronous `runPrePush` helper is not exported for callers
- **AND** user-facing stdout, stderr, and exit behavior remain stable
