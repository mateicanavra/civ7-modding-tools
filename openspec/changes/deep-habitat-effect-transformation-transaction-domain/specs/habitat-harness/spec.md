## ADDED Requirements

### Requirement: Fix Runs Through Habitat Service And Transaction Domain

Habitat SHALL expose fix execution as an owned Habitat service module and SHALL
own transformation transaction contracts in a named domain rather than generic
`lib` feature logic.

#### Scenario: Fix CLI runs

- **WHEN** a user runs `habitat fix`
- **THEN** the command calls the in-process Habitat service client
- **AND** the service module owns fix intent validation, apply admission
  selection, worktree observation, pattern transaction requests, and command
  stream output
- **AND** package helper export `runFix` is not preserved as a wrapper
- **AND** active pattern transaction contracts and renderers live under
  `src/domains/transformation-transaction/**`, not `src/lib/pattern-apply/**`
- **AND** the CLI handles only flags, stream writes, and exit behavior

#### Scenario: Protected-zone drain remains

- **WHEN** a write-capable transform is implemented after this slice
- **THEN** the transformation transaction domain owns dry-run evidence,
  transaction input resolution, and typed refusal records
- **AND** protected-zone authority, rollback data, cleanup, and write resources
  move only through later named drains
- **AND** provider command success alone is not sufficient to authorize writes
