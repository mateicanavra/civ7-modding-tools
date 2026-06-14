## ADDED Requirements

### Requirement: Classify Reports Resolved Targets Only

Habitat classify SHALL report target commands only when the targets are
resolved in the current Nx project metadata.

#### Scenario: Project target exists
- **WHEN** `habitat classify` reports a project-local target command
- **THEN** the project and target are backed by resolved Nx metadata for the
  current workspace

#### Scenario: Project target is missing
- **WHEN** Nx does not resolve a target for the classified project
- **THEN** `habitat classify` SHALL NOT emit a command for that target and SHALL
  record the target as unavailable or absent

#### Scenario: Workspace gate is reported
- **WHEN** `habitat classify` reports a workspace or Habitat structural gate
- **THEN** the gate is distinguished from project-local targets and has its own
  resolved target or Habitat-owned proof

### Requirement: Classify Rule Scope Is Path-Aware

Habitat classify SHALL distinguish exact path, project-owner, workspace-gate,
and unresolved rule scope.

#### Scenario: Rule applies by exact path
- **WHEN** rule metadata proves the classified path is inside the rule's scan
  roots or file-layer roots
- **THEN** classify reports the rule with exact-path scope

#### Scenario: Rule applies by project owner
- **WHEN** a rule is owned by the classified project but lacks exact path scope
  metadata
- **THEN** classify reports project-owner scope rather than exact-path scope

#### Scenario: Rule metadata is insufficient
- **WHEN** current rule metadata cannot prove path-specific scope
- **THEN** classify reports unresolved-metadata scope or withholds exact-scope
  claims

### Requirement: Classify Uses Current Project Graph Authority

Habitat classify SHALL use current resolved project metadata for project
ownership and target reporting.

#### Scenario: Project path is classified
- **WHEN** a repo path belongs to an Nx workspace project
- **THEN** classify reports the project name, root, tags, and targets from the
  current resolved project metadata rather than from static string
  construction alone

#### Scenario: Workspace-level path is classified
- **WHEN** a repo path does not belong to a workspace project
- **THEN** classify reports workspace-level ownership and only workspace/Habitat
  verification gates

### Requirement: Project Generators Prove Supported Structure

Habitat project generators SHALL write supported structure only when kind, root,
package name, tag, workspace discovery, and target proof align.

#### Scenario: Supported kind uses accepted root
- **WHEN** a supported project generator kind is requested
- **THEN** Habitat validates the generated root family, package name, `kind:*`
  tag, workspace discoverability, and expected target matrix before accepting
  the generator path

#### Scenario: Supported kind uses mismatched root
- **WHEN** a supported kind is paired with a root family that contradicts the
  kind contract
- **THEN** the generator refuses before creating, rewriting, or deleting files

#### Scenario: Unsupported kind is requested
- **WHEN** a non-uniform kind is requested
- **THEN** the generator refuses before writes and reports the owning-domain
  reason

### Requirement: Migration Claims Match Migration Proof

Habitat migration claims SHALL distinguish migration wiring proof from
convention-change proof.

#### Scenario: No-op migration exists
- **WHEN** the current no-op migration is cited
- **THEN** it proves only local migration wiring and SHALL NOT be used as proof
  that future convention changes are mechanically supported

#### Scenario: Convention migration is claimed
- **WHEN** a convention migration is added
- **THEN** it carries a named source shape, target shape, file-operation proof,
  idempotence proof, and before/after validation

### Requirement: Effect Substrate Decisions Protect Structural Proof

Habitat classify/generator implementation SHALL accept or reject Effect through
a written substrate decision when the implementation crosses command
orchestration, provenance, service substitution, scoped resource, retry,
concurrency, or typed failure-channel boundaries.

#### Scenario: Implementation stays in structured metadata
- **WHEN** classify obtains project ownership and target truth through
  in-process structured Nx metadata and typed local results
- **THEN** the implementation MAY remain local TypeScript without adopting
  Effect, while preserving resolved-target proof and testability

#### Scenario: Implementation orchestrates external proof commands
- **WHEN** classify or generator proof executes external commands or coordinates
  multiple proof steps requiring argv, cwd, env, stdout, stderr, exit code,
  duration, failure class, lifecycle, or cleanup evidence
- **THEN** the implementation SHALL complete the Effect substrate decision
  before closing the repair

#### Scenario: Effect is rejected for orchestration
- **WHEN** the substrate decision rejects Effect after an orchestration boundary
  is reached
- **THEN** the accepted architecture record SHALL prove equivalent typed
  failures, command provenance, service substitution, scoped cleanup,
  runtime-edge discipline, and tests without preserving the current manual
  failure modes

### Requirement: Classify And Generator Guidance Is Truthful

Agent-facing guidance SHALL reflect current classify target truth, generator
support boundaries, and the separate pattern-generator metadata gate.

#### Scenario: README or AGENTS instructs classify-first workflow
- **WHEN** README or AGENTS tells agents to run `habitat classify`
- **THEN** the guidance states that reported project targets are resolved from
  current Nx metadata and workspace gates are separate structural checks

#### Scenario: README or AGENTS instructs project generation
- **WHEN** README or AGENTS tells agents to generate supported projects
- **THEN** the guidance names supported kind/root contracts and states that
  non-uniform kinds require owning-domain generator authority

#### Scenario: README or AGENTS mentions Grit pattern generation
- **WHEN** README or AGENTS mentions generated Grit-backed rules
- **THEN** the guidance points to the Pattern Authority Manifest and metadata
  gate rather than the old enforced-rule generator path
