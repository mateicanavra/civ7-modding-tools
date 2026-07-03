## ADDED Requirements

### Requirement: Hook Runs Through Habitat Service And Remains Local Feedback

Habitat SHALL expose hook execution as an owned Habitat service module while
keeping Husky as a delegator and hook results as local workstation feedback
only.

#### Scenario: Pre-commit runs

- **WHEN** `bun run habitat hook pre-commit` runs
- **THEN** the CLI calls the in-process Habitat service client
- **AND** the hook service module owns hook name dispatch, pre-commit stage
  orchestration, stream rendering, and the hook procedure boundary
- **AND** staged path discovery, partial-staging refusal, Biome formatting,
  formatter restage, Grit staged scan, and resource policy behavior remain
  stable
- **AND** formatter restage touches formatter-changed files only
- **AND** package helper export `runHook` is not preserved as a wrapper
- **AND** the old `lib/hooks` aggregate helper/type facade is not preserved as a
  wrapper
- **AND** the hook record states local-only non-claims

#### Scenario: Pre-push runs

- **WHEN** `bun run habitat hook pre-push` runs
- **THEN** the CLI calls the in-process Habitat service client
- **AND** the hook service module owns base selection and Nx affected execution
  orchestration
- **AND** base selection and Nx affected execution behavior remain stable
- **AND** CI remains authoritative
