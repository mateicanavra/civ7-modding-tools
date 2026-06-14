## ADDED Requirements

### Requirement: Hooks Preserve Local Mutation Boundaries

Habitat Git hooks SHALL provide local feedback without treating hook success as
CI or product proof.

#### Scenario: Hook passes
- **WHEN** `habitat hook pre-commit` or `habitat hook pre-push` exits 0
- **THEN** records and guidance SHALL describe the result as local feedback and
  SHALL NOT claim CI verification or product proof

#### Scenario: Hook is bypassed locally
- **WHEN** a contributor uses `--no-verify`
- **THEN** Habitat guidance SHALL continue to identify CI and explicit
  verification commands as the authoritative gates

### Requirement: Pre-Commit Does Not Publish Resources

The default pre-commit path SHALL NOT commit or push resources.

#### Scenario: Generated-zone edit is staged
- **WHEN** a generated-zone edit would fail the file-layer staged check
- **THEN** pre-commit SHALL fail before any resources submodule commit, push,
  or monorepo submodule pointer staging

#### Scenario: Package-manager artifact is staged
- **WHEN** a forbidden package-manager artifact is staged
- **THEN** pre-commit SHALL fail before any resources submodule commit, push,
  or monorepo submodule pointer staging

#### Scenario: Resource submodule is dirty
- **WHEN** resources are dirty or the submodule pointer needs publishing
- **THEN** pre-commit SHALL fail with the exact publish and status commands and
  SHALL NOT publish resources itself

#### Scenario: Resource submodule is uninitialized
- **WHEN** the resources submodule is required but absent or not a Git worktree
- **THEN** pre-commit SHALL fail before Biome, Grit, formatter restage, resource
  commit, resource push, or monorepo submodule pointer staging and SHALL print
  the exact init and status commands

#### Scenario: Resource submodule is locked
- **WHEN** the resources submodule has a Git index lock or accepted lock
  sentinel
- **THEN** pre-commit SHALL fail before Biome, Grit, formatter restage, resource
  commit, resource push, or monorepo submodule pointer staging and SHALL print
  the exact unlock and status commands

#### Scenario: Resource gitlink is unstaged
- **WHEN** the resources submodule HEAD differs from the monorepo index and the
  gitlink is not staged
- **THEN** pre-commit SHALL fail before Biome, Grit, formatter restage, resource
  commit, resource push, or unrelated path staging and SHALL print the exact
  staging and status commands

#### Scenario: Resource gitlink is staged and clean
- **WHEN** the resources gitlink is staged and the resources submodule is clean
- **THEN** pre-commit SHALL treat the staged gitlink as an explicit pointer
  update and SHALL NOT publish resources itself

### Requirement: Pre-Commit Write Steps Are Transaction-Aware

Pre-commit write-capable steps SHALL declare exact paths, pre-state,
post-state, and failure behavior.

#### Scenario: Biome-supported file is partially staged
- **WHEN** a Biome-supported file has both staged and unstaged hunks
- **THEN** pre-commit SHALL refuse before formatting and SHALL leave the file
  content and index unchanged

#### Scenario: Biome formats staged files
- **WHEN** Biome modifies one or more accepted staged files
- **THEN** pre-commit SHALL restage only formatter-touched paths and SHALL NOT
  stage unrelated dirty or foreign staged paths

#### Scenario: Grit output cannot be parsed
- **WHEN** staged-path Grit check output cannot be parsed into the accepted
  report shape
- **THEN** pre-commit SHALL fail closed and SHALL record the parse failure as a
  hook proof class rather than treating the check as green

### Requirement: Pre-Push States Its Checked Range

Pre-push SHALL state the exact committed range and target set it checked.

#### Scenario: Graphite parent is available
- **WHEN** the current branch has a Graphite parent
- **THEN** pre-push SHALL use that parent as the affected base and SHALL report
  it in command output or proof records

#### Scenario: Graphite parent is unavailable
- **WHEN** the current branch has no Graphite parent
- **THEN** pre-push SHALL use the accepted non-Graphite base calculation and
  SHALL report that base in command output or proof records

### Requirement: Hook Hardening Has An Effect Substrate Decision

Habitat hook hardening SHALL accept or reject Effect before changing hook
transaction orchestration.

#### Scenario: Effect is adopted for hook transactions
- **WHEN** the implementation adopts Effect for hook hardening
- **THEN** oclif remains the outer command shell unless a separate accepted
  command-surface decision changes it, and Effect owns typed failures,
  services, scoped resources, command provenance, runtime-edge execution,
  dependency surfaces, version pinning, and package-manager-generated lockfile
  proof

#### Scenario: Effect is rejected for hook transactions
- **WHEN** the implementation rejects Effect after crossing transaction
  orchestration boundaries
- **THEN** the accepted architecture record SHALL prove equivalent typed hook
  states, command provenance, service substitution, scoped cleanup, and tests
  without preserving the current manual failure modes

### Requirement: Hook Guidance Is Truthful

Agent-facing guidance SHALL reflect the accepted hook side-effect policy and
proof boundaries.

#### Scenario: Guidance describes resources publishing
- **WHEN** root AGENTS, Habitat README, or resources-submodule docs describe
  resources publishing
- **THEN** the guidance SHALL state that publishing is an explicit command path
  and SHALL distinguish that path from default hook behavior

#### Scenario: Guidance describes hook proof
- **WHEN** docs describe pre-commit or pre-push success
- **THEN** they SHALL state what the hook checked, what it wrote, and what it
  does not prove
