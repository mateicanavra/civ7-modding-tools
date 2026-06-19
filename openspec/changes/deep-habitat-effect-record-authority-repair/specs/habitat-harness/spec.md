## ADDED Requirements

### Requirement: Habitat Refactor Records Reflect Stack-Tip Truth

Habitat refactor records SHALL distinguish current stack-tip status from
historical session or worktree provenance before downstream implementation
packets use those records as authority.

#### Scenario: D14A status is read

- **WHEN** an agent reads the D14A authored-artifact record
- **THEN** adjacent workstream records state the current branch, stack order,
  command evidence, cache or freshness stance, and non-claims
- **AND** historical checkout paths are marked as provenance-only

#### Scenario: D15 is referenced

- **WHEN** an Effect-first packet references D15
- **THEN** the packet states whether it preserves command-observation contracts
  or opens a concrete D15 trigger row
- **AND** D15 is not treated as broad permission for unrelated service or
  provider refactoring
