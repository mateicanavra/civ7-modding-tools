## ADDED Requirements

### Requirement: Zone Authority Comes From Valid Declarations

Habitat SHALL evaluate generated, protected, host-owned, and forbidden mutation surfaces from D10 zone declarations that name a stable zone id, matcher, surface kind, owner authority, allowed mutation lanes, recovery instruction, and non-claims.

#### Scenario: Generated-zone facet resolves to declaration
- **WHEN** a file-layer rule consumes a D2 generated-zone projection
- **THEN** D10 resolves the projected zone id to exactly one valid `ZoneDeclaration`
- **AND** the resolved declaration includes surface kind, matcher, owner authority, and recovery instruction

#### Scenario: Declaration lacks required recovery
- **WHEN** a declaration would reach command, hook, scan-root, drift, or transaction output without a recovery instruction
- **THEN** D10 blocks catalog readiness before guard execution
- **AND** the command surface cannot report that declaration as a normal pass

#### Scenario: Declaration conflict exists
- **WHEN** two declarations claim the same surface with incompatible owner, allowed lane, or recovery behavior
- **THEN** D10 reports a `blocked-declaration-conflict` state
- **AND** no consumer may choose a winner by array order

### Requirement: Host-Owned Surface Data Comes From G-HOST

D10 SHALL consume host-owned generated and protected path facts from G-HOST declarations and SHALL NOT treat Civ7, MapGen, resource, or host-specific path literals as generic Habitat authority.

#### Scenario: Host declaration is available
- **WHEN** G-HOST publishes a host-owned generated or protected surface declaration
- **THEN** D10 consumes the host owner, matcher, regeneration or recovery action, and host-policy non-claims through that declaration
- **AND** D10 projects those facts without redefining host semantics

#### Scenario: Host declaration is missing
- **WHEN** a touched surface or D2 zone reference requires host policy and the matching G-HOST declaration is absent, unavailable, or malformed
- **THEN** D10 returns `blocked-missing-host-declaration`
- **AND** the blocked decision names G-HOST as the missing authority and includes recovery for repairing the declaration

### Requirement: D2 Provides Rule-To-Zone Relations

D10 SHALL consume rule-to-zone relations through D2 projections and SHALL NOT parse whole registry rows, prose scope, or optional metadata bags as target authority.

#### Scenario: D2 projection is well formed
- **WHEN** D2 provides a rule id, owner-tool family, file-layer rule variant, and generated-zone reference
- **THEN** D10 resolves only that projected relation against the declaration catalog
- **AND** consumers receive a D10 decision or projection rather than the whole rule record

#### Scenario: D2 projection is malformed
- **WHEN** the rule-to-zone projection is missing, malformed, contradictory, or references an unknown zone id
- **THEN** D10 returns a blocked metadata decision compatible with D1 output-family handling
- **AND** the related file-layer rule cannot pass as if protection were disabled

### Requirement: Staged Mutation Guard Refuses Unauthorized Direct Edits

D10 SHALL evaluate staged user mutations against the declaration catalog and SHALL refuse direct edits to generated, protected, host-owned, or forbidden surfaces unless the request carries an allowed authority lane.

#### Scenario: Staged edit touches generated prefix
- **WHEN** a staged add, modify, delete, rename, or copy touches a path under a declared generated surface
- **THEN** D10 returns `refused-direct-generated-edit`
- **AND** the decision includes repo-relative path, path action, zone id, owner authority, recovery instruction, and D1 non-claim mapping

#### Scenario: Staged edit touches exact protected file
- **WHEN** a staged mutation touches an exact protected path
- **THEN** D10 returns `refused-direct-protected-edit`
- **AND** D7 may render the refusal but may not redefine the protected-zone policy

#### Scenario: Staged state is clean for D10 surfaces
- **WHEN** the staged mutation set contains no D10-owned surfaces
- **THEN** D10 may return pass or not-applicable projections for D7
- **AND** that outcome does not claim generated files are fresh

### Requirement: Authorized Generator And Host Writes Are Separate From Hand Edits

D10 SHALL distinguish declared generator or host-policy writes from user, agent, or transaction writes.

#### Scenario: Declared generator writes generated surface
- **WHEN** a mutation request identifies a declared generator authority for a matching generated surface
- **THEN** D10 may return `allowed-generator-write`
- **AND** the decision states that this allowance does not prove generated freshness, runtime behavior, or product correctness

#### Scenario: Transaction attempts protected path
- **WHEN** D9 plans a write to a generated, protected, host-owned, or forbidden surface
- **THEN** D9 must consume a D10 `TransactionPathAuthorityProjection`
- **AND** D9 cannot self-authorize the path through dry-run output, apply admission, or local path matching

### Requirement: Generated Drift Check Is Separate From Staged Guard

D10 SHALL keep generated drift checks separate from protected mutation guards.

#### Scenario: Drift check runs generator relation
- **WHEN** a generated drift target or successor checks declared generated surfaces
- **THEN** it consumes `GeneratedSurfaceProjection` and native Nx target metadata
- **AND** it may compare and restore generated outputs without authorizing hand edits

#### Scenario: Staged guard refuses hand edit
- **WHEN** the staged guard refuses a generated-surface edit
- **THEN** the refusal does not claim the generated output is stale
- **AND** it only reports that the proposed mutation lacks an allowed authority lane

### Requirement: D7 Consumes Guard Decisions Without Owning Policy

D7 SHALL render D10 guard decisions into structural enforcement reports without recomputing D10 path policy.

#### Scenario: File-layer command reports protected-zone refusal
- **WHEN** `habitat check --staged --tool file-layer --json` encounters a D10 refusal
- **THEN** the structured report includes the D10 decision family projected through D1-compatible output handling
- **AND** `CheckReport.ok` and exit status cannot contradict the refused decision

#### Scenario: Advisory lane cannot downgrade D10 refusal
- **WHEN** a D10 decision is `refused-direct-protected-edit`, `refused-direct-generated-edit`, `refused-forbidden-artifact`, or a blocking state
- **THEN** D7 cannot report that rule as a normal pass because the rule is advisory or because a baseline covers unrelated diagnostics

### Requirement: D9 Requires D10 Path Authority Before Writes

D9 SHALL consume D10 path-authority projections for protected/generated/host-owned/forbidden paths before approving dry-run-to-live or copy-to-live writes.

#### Scenario: D9 lacks D10 decision
- **WHEN** D9 plans a write to a D10-owned surface and no D10 projection is available
- **THEN** D9 refuses the write before live mutation
- **AND** the refusal includes D10 recovery or missing-authority information

#### Scenario: D10 allows path but D9 transaction still fails
- **WHEN** D10 returns an allowed path-authority decision
- **THEN** D9 still owns transaction approval, rollback, formatter handoff, changed-path verification, and final status
- **AND** D10 allowance is not a transaction success claim

### Requirement: D11 Local Feedback Stops At File-Layer Refusal

D11 SHALL consume D10/D7 local-feedback-safe output for staged protected mutation refusals and SHALL preserve hook sequencing boundaries.

#### Scenario: Pre-commit sees D10-origin refusal
- **WHEN** pre-commit invokes staged file-layer checks and receives a D10-origin refusal
- **THEN** the hook stops before Biome, Grit, generated publish, resource publish, or restaging commands
- **AND** the hook output remains local feedback rather than CI or generated freshness status

### Requirement: Forbidden Artifact State Is Explicit

D10 SHALL model forbidden artifacts separately from generated and protected surfaces, or SHALL name another accepted owner before moving that behavior out of D10.

#### Scenario: Forbidden package-manager artifact is staged
- **WHEN** a staged path matches a declared forbidden artifact matcher
- **THEN** D10 returns `refused-forbidden-artifact`
- **AND** the decision includes removal or remediation instruction

#### Scenario: Forbidden artifact is not generated surface
- **WHEN** a forbidden artifact rule is evaluated
- **THEN** D10 does not report it as generated drift, generator ownership, or generated-zone recovery

### Requirement: Public Surfaces Wait For D0 Rows

D10 source implementation SHALL NOT change public command, output, export, hook, script, Nx target, generated/help, or public docs behavior until concrete D0 rows classify and handle the affected surface.

#### Scenario: Check JSON changes
- **WHEN** D10 implementation would add, remove, rename, or reinterpret check JSON fields
- **THEN** the implementation must cite the concrete D0 surface row and closed compatibility handling
- **AND** without that row the change remains blocked or must preserve the existing shape through a facade

#### Scenario: Package exports are introduced
- **WHEN** D10 declaration, decision, projection, or recovery types become exported
- **THEN** D0 compatibility handling must classify the export surface before source implementation

### Requirement: Invalid Decision States Are Unrepresentable Or Blocked

D10 SHALL remove the current optional-field and string-bag state-space from the target design.

#### Scenario: Refusal lacks owner or recovery
- **WHEN** a refused or blocked decision would be created without owner or recovery instruction
- **THEN** D10 treats that as an invalid decision state before projecting to consumers

#### Scenario: Required non-empty facts are empty
- **WHEN** conflicts, affected paths, forbidden filenames, missing D0 rows, or missing host declarations are required by a decision state
- **THEN** D10 represents them as non-empty facts or blocks the state construction

#### Scenario: Drift check attempts to authorize mutation
- **WHEN** generated drift result is used as if it authorized a staged or transaction mutation
- **THEN** the consuming workflow must refuse or block because drift result and mutation authority are different D10 state families
