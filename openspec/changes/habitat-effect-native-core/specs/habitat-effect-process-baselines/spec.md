## ADDED Requirements

### Requirement: Resourceful Habitat Capabilities Are Layered Services

Habitat SHALL provide resourceful tooling capabilities through injectable
Effect contexts and layers. Service interfaces SHALL expose Habitat concepts
rather than oclif, Node, Bun, or shell-specific details.

#### Scenario: Service-level tests replace live tool boundaries
- **WHEN** Habitat core tests exercise workspace, process, Git, baseline,
  external tool, hook, or generated-zone logic
- **THEN** tests can provide fake service layers for process, filesystem, Git,
  workspace, and clock behavior
- **AND** command adapter tests can remain focused on host parsing and output
  writing

#### Scenario: Process execution remains argument-array based
- **WHEN** Habitat invokes Git, Nx, Grit, Biome, Bun, or repo scripts through
  its core services
- **THEN** execution uses structured command arguments, explicit cwd/env/PATH
  policy, and normalized stdout/stderr/exit-code results
- **AND** shell-string interpolation is not introduced

### Requirement: Workspace And Git State Are Explicit Service Inputs

Habitat SHALL move workspace path resolution, package discovery, Git merge-base
discovery, staged path discovery, unstaged path checks, and exact `git add`
operations behind services with fakeable behavior and preserved current parsing
semantics.

#### Scenario: Workspace package discovery remains classification-compatible
- **WHEN** Habitat discovers project roots for command, classify, generator,
  or rule ownership logic
- **THEN** it scans the established `apps`, `packages`, `packages/plugins`,
  `mods`, and `tools` roots
- **AND** it preserves longest-root ownership selection for nested roots such
  as `packages/plugins/*`

#### Scenario: Git mutation is explicit
- **WHEN** Habitat must mutate the Git index
- **THEN** the mutation goes through a Git service operation naming the exact
  paths being staged
- **AND** the service can be faked in tests to prove no unrelated path is
  staged, unstaged, or rewritten

### Requirement: Baseline Store Preserves Ratchet Semantics

Habitat SHALL move baseline loading, writing, violation-key application, and
shrink-only integrity checks behind Effect services without changing ratchet
behavior.

#### Scenario: Ratchet semantics survive service migration
- **WHEN** a baseline file grows for an existing rule relative to the merge-base
- **THEN** `habitat check` reports the baseline-integrity violation and fails
- **AND** normal check, verify, hook, classify, generator, migration, and
  generated-zone execution do not write baseline entries

#### Scenario: Baseline authoring remains explicit
- **WHEN** an author runs `habitat check --expand-baseline --rule <id>`
- **THEN** Habitat writes only the selected rule's current unbaselined error
  keys to that rule's baseline
- **AND** the written baseline remains sorted JSON with the established
  trailing newline format
- **AND** the command emits authoring messages rather than a `CheckReport`
