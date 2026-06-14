## ADDED Requirements

### Requirement: Boundary Taxonomy Is Current Graph Truth

Habitat SHALL prove the project-plane boundary taxonomy against current package
manifests, resolved Nx project metadata, and resolved Nx dependency edges
before claiming `CLAIM-H3-TAXONOMY` is current.

#### Scenario: Workspace project inventory is audited
- **WHEN** the taxonomy proof runs
- **THEN** every workspace project in resolved Nx project metadata SHALL have a
  taxonomy row or an explicit exterior disposition
- **AND** every taxonomy project row SHALL resolve to a current Nx project

#### Scenario: Project tags match
- **WHEN** package manifests, taxonomy rows, and resolved Nx project metadata
  are compared
- **THEN** each project's `kind:*` tags SHALL match across all three sources

#### Scenario: Current graph edges are legal
- **WHEN** resolved Nx graph dependency edges are evaluated
- **THEN** every workspace edge SHALL satisfy the active matching
  depConstraints from the project taxonomy
- **AND** any illegal edge SHALL block taxonomy closure until repaired,
  moved by explicit architecture decision, or recorded as shrink-only debt that
  keeps taxonomy closure mixed or unknown

### Requirement: Boundary Config Matches Taxonomy

The active boundary ESLint config SHALL encode the same project-plane
depConstraints as `docs/projects/habitat-harness/taxonomy.md`.

#### Scenario: Constraint table changes
- **WHEN** a change edits `kind:*` constraints
- **THEN** it SHALL edit `taxonomy.md` and `eslint.boundaries.config.mjs`
  together or record why one artifact is intentionally unchanged
- **AND** review records SHALL cite the authority for the constraint change

#### Scenario: Boundary config expands
- **WHEN** a rule other than `@nx/enforce-module-boundaries` is proposed for
  `eslint.boundaries.config.mjs`
- **THEN** the change SHALL fail the owner-layer gate unless a new accepted
  design changes the import-layer owner model

### Requirement: Dual-Tag Sentinel Semantics Are Proven

Habitat SHALL prove the live dual-tag sentinel relied on by the taxonomy before
claiming that the current `kind:mod` plus `kind:control` project boundary is
enforced.

#### Scenario: Dual-tagged control/mod project imports SDK
- **WHEN** a probe in `mod-civ7-intelligence-bridge` imports
  `@mateicanavra/civ7-sdk`
- **THEN** the boundary target SHALL fail through the `kind:control` constraint
- **AND** the probe SHALL be removed before closure

#### Scenario: Broader dual-tag closure is claimed
- **WHEN** a change claims all dual-tagged projects are constrained by every
  matching source-tag rule
- **THEN** it SHALL provide a structured verifier, explicit `allSourceTags`
  constraints, or equivalent current Nx evidence for every relied-on dual-tag
  case

### Requirement: Boundary Proof Commands Are Whole-Command Truthful

Boundary verification SHALL treat the enclosing command exit status as part of
the proof.

#### Scenario: Target succeeds but Nx command exits nonzero
- **WHEN** Nx reports the `boundaries` target as successful but the enclosing
  `nx run-many` command exits nonzero
- **THEN** the proof SHALL be recorded as unresolved or failing for that command
  path
- **AND** the phase SHALL NOT claim the command path is green from target output
  alone

#### Scenario: Daemon and no-daemon behavior differ
- **WHEN** daemon-enabled and `NX_DAEMON=false` boundary runs produce different
  command outcomes
- **THEN** the implementation SHALL record the difference, select an accepted
  proof command policy, and patch stale records that imply a broader command
  claim

#### Scenario: Habitat JSON boundary proof is used
- **WHEN** `bun run habitat:check -- --json --rule nx-boundaries` is cited as
  proof
- **THEN** the parsed JSON SHALL contain an `nx-boundaries` rule entry
- **AND** that entry SHALL include owner/tool metadata, `locked: true`,
  `status: pass`, and an empty diagnostics array
- **AND** the proof SHALL fail if the requested rule is absent while another
  rule reports green

### Requirement: Boundary Owner Scope Is Truthful

Habitat SHALL distinguish Nx project-plane boundary proof from other
structural proof classes.

#### Scenario: Docs cite taxonomy as authority
- **WHEN** downstream docs, packets, or guidance cite the taxonomy
- **THEN** they SHALL describe it as project-plane authority and SHALL NOT use
  it as proof of Grit, file-layer, Biome, generated-output, runtime, or product
  behavior

#### Scenario: H3 historical records are consumed
- **WHEN** H3 records are cited after this repair
- **THEN** records SHALL identify which H3 claims are current, which are
  historical, and which command paths remain bounded by the repair proof
