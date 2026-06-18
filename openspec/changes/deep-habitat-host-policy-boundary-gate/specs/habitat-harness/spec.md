## ADDED Requirements

### Requirement: Host Policy Has A Declared Owner Boundary

Habitat host-specific policy SHALL be declared through the Host Policy Boundary
before generic Habitat commands enforce or report host-owned generated surfaces,
protected surfaces, external-resource surfaces, apply gates, or project creation
support/refusal.

The first source implementation SHALL keep declarations in the internal Habitat
TypeScript module `$HABITAT_TOOL/src/lib/host-policy.ts`. It SHALL NOT introduce a
user-authored host config, repo-authored declaration data file, documented
declaration location, or public declaration export unless a later accepted packet
and D0 compatibility rows explicitly upgrade that surface.

#### Scenario: Host policy applies to a host-owned surface
- **WHEN** a path belongs to a declared host-owned surface
- **THEN** Habitat SHALL consume the matching `HostSurfaceProjection`
- **AND** the projection SHALL include host policy id, declaration id, host
  owner, surface kind, matcher, mutation lane, recovery instruction, declaration
  state, and non-claims.

#### Scenario: Host policy is absent for host-specific behavior
- **WHEN** generic Habitat encounters host-specific behavior and no matching host
  declaration exists
- **THEN** Habitat SHALL refuse to claim generic enforcement
- **AND** the refusal SHALL name the missing declaration class, affected surface
  or request, recovery instruction owner when known, retry condition, and
  non-claims.

#### Scenario: Host policy source is invalid
- **WHEN** a host declaration source is unavailable, malformed, or conflicting
- **THEN** Habitat SHALL report the exact declaration state
- **AND** SHALL NOT collapse that state into pass, allow, or not-applicable.

### Requirement: Host Declarations Use Closed Variants

`HostPolicyDeclaration` SHALL be a closed declaration family for the bounded
current host-policy surface.

#### Scenario: Generated or protected path is declared
- **WHEN** a host declaration describes a generated, protected, or
  external-resource surface
- **THEN** the declaration SHALL be represented as
  `HostGeneratedSurfaceDeclaration`, `HostProtectedSurfaceDeclaration`, or
  `HostExternalResourceSurfaceDeclaration`
- **AND** the declaration SHALL carry structured `HostRecoveryInstruction`
  rather than free-form recovery text.

#### Scenario: Apply gate is declared
- **WHEN** a host declaration describes a host-specific apply gate
- **THEN** the declaration SHALL be represented as `HostApplyGateDeclaration`
- **AND** D9 SHALL consume it through `HostApplyGateProjection` rather than
  encoding host semantics in transaction logic.

#### Scenario: Project creation support is declared
- **WHEN** a host declaration describes supported or refused host-owned project
  creation behavior
- **THEN** the declaration SHALL be represented as
  `HostProjectSupportDeclaration` or `UnsupportedHostShapeDeclaration`
- **AND** D13 SHALL consume it through `HostProjectSupportProjection`.

### Requirement: Consumers Cannot Recreate Host Policy Locally

D9, D10, D13, and D14 SHALL consume G-HOST projections and SHALL NOT recreate
host policy from path conventions, package names, current code literals, schema
enum values, or thrown-string text.

#### Scenario: D10 protects a host surface
- **WHEN** D10 evaluates generated, protected, or external-resource paths
- **THEN** D10 SHALL consume `HostSurfaceProjection`
- **AND** D10 SHALL NOT author host owners, host path lists, or recovery
  instructions.

#### Scenario: D9 runs a host apply gate
- **WHEN** D9 evaluates a host-specific apply gate such as MapGen public-ops
  validation
- **THEN** D9 SHALL consume `HostApplyGateProjection`
- **AND** D9 SHALL NOT inspect host semantics unless the projection declares the
  gate.

#### Scenario: D13 refuses a host-owned creation request
- **WHEN** D13 evaluates a host-owned project creation request
- **THEN** D13 SHALL consume `HostProjectSupportProjection`
- **AND** a refused or blocked request SHALL produce no writes.

#### Scenario: D14 references host policy
- **WHEN** D14 references a host-policy relation for authoring topology
- **THEN** D14 SHALL consume `HostAuthoringBoundaryProjection`
- **AND** SHALL state that host policy is not authoring readiness.

### Requirement: Public Surface Compatibility Is A Source Blocker

G-HOST source implementation SHALL remain blocked for any touched public or
durable surface until D0 rows and D1 output-family handling are cited.

#### Scenario: Command output changes
- **WHEN** source implementation changes file-layer, apply/fix, generator,
  exported type, docs, or example behavior
- **THEN** the implementation SHALL cite D0 compatibility rows
- **AND** SHALL record D1 output-family and non-claim handling where public
  output is touched.

#### Scenario: No public behavior changes
- **WHEN** source implementation preserves public behavior
- **THEN** the implementation SHALL cite the D0 preserve or document-only rows it
  relies on
- **AND** SHALL keep host declarations internal unless D0 classifies the
  declaration location or exported type as public.

### Requirement: Validation Falsifies Host Policy Ambiguity

G-HOST validation SHALL include bad-case coverage for missing, unavailable,
malformed, conflicting, and not-applicable declaration-source states, plus
unsupported declaration/refusal outcomes.

#### Scenario: Declaration state matrix is tested
- **WHEN** implementation adds host declaration parsing or projection
- **THEN** tests SHALL cover declared, missing, unavailable, malformed,
  conflicting, and not-applicable source states plus unsupported
  declaration/refusal outcomes
- **AND** each state SHALL have an expected output family, recovery instruction,
  and non-claim.

#### Scenario: Consumer gate is tested
- **WHEN** D9, D10, D13, or D14 consumes a G-HOST projection
- **THEN** focused tests SHALL prove the consumer refuses or blocks when the
  required projection is missing or invalid
- **AND** the consumer SHALL NOT compute host policy locally.

#### Scenario: Generated outputs are protected during validation
- **WHEN** implementation tests use host-owned paths or generated surfaces
- **THEN** tests SHALL use fixtures or temporary declaration data
- **AND** SHALL NOT hand-edit generated outputs, lockfiles, `dist/**`, `mod/**`,
  `.civ7/outputs/**`, or external resource outputs.
