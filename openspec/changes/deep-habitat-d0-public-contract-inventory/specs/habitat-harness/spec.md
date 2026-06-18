## ADDED Requirements

### Requirement: Public Contract Inventory Gates Deep Refactor Packets

Deep Habitat refactor packets SHALL consult the D0 public contract inventory
before moving, narrowing, removing, or versioning Habitat command, JSON,
package export, root script, Nx target, generator, or hook surfaces.

#### Scenario: Later packet changes a public surface
- **WHEN** a later packet changes an inventoried public stable, public
  versioned, or command-only DTO surface
- **THEN** the packet records whether compatibility is preserved, versioned,
  migrated, deprecated, or refused

#### Scenario: Later packet moves an internal export
- **WHEN** a later packet moves an inventoried package-internal export
- **THEN** the packet realigns in-repo imports and tests or introduces an
  explicit facade before claiming closure

### Requirement: Command Invocation Compatibility Is Explicit

Habitat SHALL distinguish canonical command invocations from unsupported or
ambiguous argument-forwarding forms.

#### Scenario: Canonical JSON check invocation
- **WHEN** docs, tests, or packets need JSON check output
- **THEN** they use `bun run habitat check --json` unless a later accepted
  command-surface packet changes the canonical invocation

#### Scenario: Double-dash forwarding ambiguity
- **WHEN** `bun run habitat check -- --json` is discussed or encountered
- **THEN** it is treated as a product command-compatibility issue rather than a
  harmless documentation typo

### Requirement: Command DTOs Are Distinct From Internal Helpers

Habitat SHALL classify command JSON/receipt DTOs separately from implementation
helpers exported through the package index.

#### Scenario: Current command JSON shape is consumed by agents
- **WHEN** an agent consumes current command JSON such as `CheckReport`,
  `Classification`, `DiffClassification`, or `VerifyProof`
- **THEN** the owning packet preserves the current DTO shape or introduces an
  explicit versioned replacement

#### Scenario: Future or internal receipt shape is inventoried
- **WHEN** D0 records future or internal surfaces such as
  `GritApplyTransactionProof` or `HookTrace`
- **THEN** the matrix distinguishes them from current CLI JSON output and names
  the downstream owner before treating them as public agent-facing contracts

#### Scenario: Proof-shaped surface lacks product value
- **WHEN** a downstream packet evaluates a proof/artifact-shaped current surface
- **THEN** it simplifies the surface into the smallest command receipt required
  by a real repo-maintenance scenario or removes/collapses the artifact concept
  instead of preserving proof generation as target-domain authority

#### Scenario: Helper function is exported through `src/index.ts`
- **WHEN** a helper function is exported only for in-repo implementation or
  tests
- **THEN** broad export reachability alone does not make the helper a stable
  user-facing API

### Requirement: Package Exports Have Compatibility Dispositions

Habitat SHALL classify package export paths and `src/index.ts` symbols as
public stable, public versioned, package-internal, command-only DTO, test-only,
generated/derived, deprecated, or refused.

#### Scenario: Package export path is consumed by tooling
- **WHEN** Nx, commands, tests, or local code consume a package export path
- **THEN** the D0 matrix records the surface state and later packets preserve
  the path or realign consumers with receipt checks

#### Scenario: Rule or plugin data is generated or derived
- **WHEN** a later packet changes generated or derived surfaces such as the Nx
  plugin target surface or rule manifest
- **THEN** it changes the owning source/generator and records regenerated receipts
  rather than hand-editing generated output

### Requirement: Root Scripts, Nx Targets, Generators, And Hooks Are Inventoried

Habitat SHALL include root scripts, inferred Nx targets, generator schema
surfaces, and Husky hook delegators in the D0 compatibility ledger.

#### Scenario: Agent follows Habitat handoff guidance
- **WHEN** an agent reads the inventory before authoring or verifying
- **THEN** it can distinguish root script gates, project-local targets,
  workspace/Habitat targets, generator refusals, and local hook feedback

#### Scenario: Unsupported generator kind is requested
- **WHEN** a non-uniform project kind such as `mod` is passed to the Habitat
  project generator
- **THEN** the generator refuses before writes with a named product/domain
  reason

### Requirement: D0 Does Not Change Behavior

D0 SHALL create compatibility records without changing command, generator,
hook, graph, baseline, Grit, or package export behavior.

#### Scenario: D0 closes
- **WHEN** D0 is closed
- **THEN** its closure receipt is inventory, review, and existing behavior smoke
  verification, not an implementation claim for later refactor behavior
