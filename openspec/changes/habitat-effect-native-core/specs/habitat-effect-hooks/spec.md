## ADDED Requirements

### Requirement: Hooks Preserve H7 Git-Moment Policy

Hook execution SHALL use Effect services for Git index inspection, mutation,
process execution, staged-file checks, formatting, and affected verification
while preserving the H7 local-hook policy. Husky hooks remain thin delegators
to `habitat hook <name>`.

#### Scenario: Pre-commit restages only formatter-touched files
- **WHEN** `habitat hook pre-commit` formats staged Biome-supported files
- **THEN** Habitat restages only files whose content changed due to the
  formatter
- **AND** it fails before formatting a format-eligible file with both staged
  and unstaged hunks

#### Scenario: Resource publish behavior remains the only non-formatter carve-out
- **WHEN** `habitat hook pre-commit` preserves the H7 resource-publish behavior
- **THEN** any Git index mutation outside formatter-touched files is limited to
  the accepted resources submodule gitlink behavior
- **AND** the hook does not stage unrelated worktree paths

#### Scenario: Hook orchestration does not invoke Habitat recursively
- **WHEN** `habitat hook pre-commit` runs staged file-layer checks
- **THEN** the hook calls the internal Habitat check or rule program through
  the same command-scoped runtime
- **AND** it does not spawn another `habitat` CLI process for that check

### Requirement: Pre-Push Keeps Committed-Range Verification

`habitat hook pre-push` SHALL preserve the H7 committed-range affected
verification semantics and Graphite base handling.

#### Scenario: Graphite parent base drives affected verification
- **WHEN** pre-push runs in a Graphite stack branch
- **THEN** Habitat uses the established Graphite parent or explicit base
  behavior for affected target selection
- **AND** it runs the same affected build, check, test, boundaries, Biome,
  Grit, and generated-zone target set as before the Effect migration

#### Scenario: Unknown hook names remain rejected
- **WHEN** an agent runs `habitat hook <unknown>`
- **THEN** the command exits with the established unknown-hook exit behavior
- **AND** the error is emitted outside machine JSON output
