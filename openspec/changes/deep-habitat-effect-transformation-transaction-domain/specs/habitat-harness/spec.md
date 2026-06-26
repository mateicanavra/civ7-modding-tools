## ADDED Requirements

### Requirement: Fix Runs Through Habitat Service Before Transaction Drain

Habitat SHALL expose fix execution as an owned Habitat service module before
the deeper transformation transaction and protected-zone authority drain.

#### Scenario: Fix CLI runs

- **WHEN** a user runs `habitat fix`
- **THEN** the command calls the in-process Habitat service client
- **AND** the service module owns fix intent validation, apply admission
  selection, worktree observation, pattern transaction requests, and command
  stream output
- **AND** package helper export `runFix` is not preserved as a wrapper
- **AND** the CLI handles only flags, stream writes, and exit behavior

#### Scenario: Transaction domain drain remains

- **WHEN** a write-capable transform is implemented after this slice
- **THEN** transformation transaction and protected-zone authority domains own
  dry-run evidence, admitted write set, protected-zone checks, rollback data,
  cleanup, and typed refusal records
- **AND** provider command success alone is not sufficient to authorize writes
