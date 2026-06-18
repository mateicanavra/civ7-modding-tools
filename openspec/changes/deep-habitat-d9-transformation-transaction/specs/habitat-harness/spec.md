## ADDED Requirements

### Requirement: Transformation Transaction Owns Apply Execution State

Habitat SHALL model `habitat fix` structural rewrites as a closed
`Transformation Transaction` state family rather than as `ok: boolean` plus
nullable command/proof fields.

#### Scenario: Transaction result is projected for compatibility
- **WHEN** legacy `GritApplyTransactionResult` or `GritApplyTransactionProof`
  surfaces remain exported or rendered
- **THEN** they SHALL be D0/D1 compatibility projections from
  `ApplyTransactionRecord`
- **AND** they SHALL NOT be the authoritative target state.

#### Scenario: Terminal outcome is rendered
- **WHEN** command rendering, package export projection, or legacy compatibility
  wrapping consumes a transaction outcome
- **THEN** the implementation SHALL use exhaustive discriminated-state handling
  that fails compilation when a new terminal outcome is not rendered.

### Requirement: Apply Request Modes Are Explicit

Habitat SHALL construct D9 transactions through closed lifecycle variants:
`DryRunIntent`, `LiveWriteIntent`, D9-produced `LiveWriteAttempt`, and
`RollbackProbeRequest`.

#### Scenario: Dry-run intent is created
- **WHEN** the `fix` command constructs a dry-run intent
- **THEN** it SHALL NOT carry live-write, rollback-after-apply, formatter-write,
  or post-write gate states.

#### Scenario: Live-write intent is created
- **WHEN** the `fix` command constructs a live-write intent
- **THEN** it SHALL carry user intent, D8 apply admission, and non-write
  observations needed to plan the transaction
- **AND** SHALL NOT carry an approved write set before D9 dry-run/copy/path
  planning produces one.

#### Scenario: Live-write attempt is created
- **WHEN** D9 constructs a live-write attempt from a live-write intent
- **THEN** it SHALL require a clean worktree observation, approved write set,
  rollback policy, and formatter/gate handoff policy.

#### Scenario: Anonymous gate command is supplied
- **WHEN** a caller supplies a gate command without a D8, D10, G-HOST, or
  transaction-owned gate declaration
- **THEN** D9 SHALL refuse before live write.

### Requirement: D8 Pattern Admission Is Consumed, Not Decided, By D9

Habitat SHALL run apply transactions only for patterns that D8 publishes as
apply-admitted through `ApplyAdmissionProjection`.

#### Scenario: Diagnostic pattern lacks apply admission
- **WHEN** a rule has diagnostic capability but no D8 apply admission
- **THEN** D9 SHALL refuse before dry-run or live write.

#### Scenario: Pattern file exists without apply admission
- **WHEN** a Grit pattern file exists in the repository but D8 has not admitted
  it for apply
- **THEN** file presence SHALL NOT authorize a transaction.

#### Scenario: D8 refuses or retires a pattern
- **WHEN** D8 reports an apply refusal or retired apply lifecycle state
- **THEN** D9 SHALL refuse the transaction even if native Grit can execute the
  pattern file.

### Requirement: Diagnostic Findings Cannot Authorize Writes

Habitat SHALL NOT treat D6 diagnostic findings, injected probes, native Grit
samples, or clean diagnostic runs as apply safety.

#### Scenario: Diagnostic finding exists
- **WHEN** D6 emits a finding for an apply-capable rule
- **THEN** D9 SHALL still require D8 apply admission and D9 write-set/path
  checks before any write.

#### Scenario: Diagnostic adapter fails
- **WHEN** D6 records a diagnostic adapter failure
- **THEN** D9 SHALL NOT convert that diagnostic failure into a write transaction
  failure unless an explicit apply transaction was requested and reached a D9
  state.

### Requirement: Dry-Run Inventory Is A First-Class Transaction State

Habitat SHALL distinguish dry-run no-match, approved dry-run changes, dry-run
parse failure, native dry-run failure/interruption, and dry-run/copy mismatch.

#### Scenario: Dry-run reports zero matches
- **WHEN** native apply dry-run reports zero matches
- **THEN** D9 SHALL return a no-mutation state
- **AND** SHALL NOT infer that live apply would succeed.

#### Scenario: Dry-run reports approved inventory
- **WHEN** native apply dry-run reports a pattern-owned structured inventory
- **THEN** D9 SHALL record pattern identity, target path, rewrite target,
  approval source, and output digest before write-set approval.

#### Scenario: Dry-run output is ambiguous
- **WHEN** native apply dry-run output is non-empty and is neither zero-match
  output nor a declared inventory format
- **THEN** D9 SHALL refuse before live write unless the pattern declares an
  isolated-copy inventory mode.

#### Scenario: Dry-run reports matches but copy check produces no diff
- **WHEN** native dry-run reports matches and the isolated-copy check produces
  no changed paths
- **THEN** D9 SHALL fail closed as a dry-run/copy mismatch.

### Requirement: Approved Write Set Owns Every Changed Path

Habitat SHALL approve every transaction write path through D8 apply admission,
D9 write-set approval, and D10/G-HOST path decision where applicable.

#### Scenario: Inventory names path outside approved roots
- **WHEN** dry-run inventory names a path outside the approved apply roots
- **THEN** D9 SHALL refuse before live write.

#### Scenario: Isolated-copy diff changes path outside approved roots
- **WHEN** isolated-copy diff observation changes a path outside approved roots
- **THEN** D9 SHALL refuse before live write.

#### Scenario: Create is not admitted
- **WHEN** isolated-copy or live write observation creates a file without an
  explicit D8 create capability and D9 cleanup contract
- **THEN** D9 SHALL refuse or roll back according to the observed stage.

#### Scenario: Delete is not admitted
- **WHEN** isolated-copy or live write observation deletes a file without an
  explicit D8 delete capability and D9 cleanup contract
- **THEN** D9 SHALL refuse or roll back according to the observed stage.

#### Scenario: Live write produces unexpected path
- **WHEN** live apply changes a path not present in the approved write set
- **THEN** D9 SHALL roll back and report unexpected-path failure.

### Requirement: Protected And Host Policy Inputs Are Blocking

Habitat SHALL consume D10 protected/generated-zone decisions and G-HOST
host-specific gate declarations before live write where touched.

#### Scenario: Planned write intersects generated or protected zone
- **WHEN** a planned write intersects a generated or protected zone and D10 does
  not provide an allowed mutation decision
- **THEN** D9 SHALL refuse before live write.

#### Scenario: Host-specific apply gate is missing
- **WHEN** a planned write requires host-specific validation and G-HOST does not
  declare the gate
- **THEN** D9 SHALL refuse rather than silently disabling that validation.

#### Scenario: MapGen public-ops validation is required
- **WHEN** the current MapGen public-ops validation is needed for an apply
  pattern
- **THEN** D9 SHALL consume it as a declared host gate
- **AND** SHALL NOT embed Civ7/MapGen paths or public-ops semantics as generic
  transaction policy.

### Requirement: Live Write Is Conditional On Dry-Run And Copy Check

Habitat SHALL run live apply only after dry-run inventory and isolated-copy
checks approve the exact write set.

#### Scenario: Dirty worktree live write is requested
- **WHEN** a live-write transaction is requested while the worktree is dirty
- **THEN** D9 SHALL refuse before invoking native Grit.

#### Scenario: Dirty worktree dry-run is requested
- **WHEN** a dry-run transaction is requested while the worktree is dirty
- **THEN** D9 MAY run because the request is non-writing
- **AND** SHALL report only dry-run state.

#### Scenario: Live write succeeds
- **WHEN** live apply succeeds and changed paths equal the approved write set
- **THEN** D9 SHALL enter live-write-applied state and proceed only to declared
  handoffs.

#### Scenario: Live write fails after possible write
- **WHEN** native live apply fails or is interrupted after possible writes
- **THEN** D9 SHALL attempt rollback and record rollback outcome.

### Requirement: Formatter Handoff Is Hygiene Handoff

Habitat SHALL model Biome or other formatter invocation as a formatter handoff,
not as apply safety or product correctness.

#### Scenario: Formatter succeeds
- **WHEN** formatter handoff succeeds after live write
- **THEN** D9 MAY continue to declared gates
- **AND** SHALL NOT claim current-tree diagnostic cleanliness, runtime behavior,
  or apply admission from formatter success.

#### Scenario: Formatter fails
- **WHEN** formatter handoff fails after live write
- **THEN** D9 SHALL attempt rollback
- **AND** SHALL report formatter-handoff failure as the cause.

#### Scenario: Formatter changes unexpected path
- **WHEN** formatter handoff changes a path outside the approved write set
- **THEN** D9 SHALL treat the path drift as transaction failure and attempt
  rollback.

### Requirement: Gate Handoffs Are Declared

Habitat SHALL run only declared post-apply gates associated with the admitted
pattern, host policy, or transaction contract.

#### Scenario: Declared gate succeeds
- **WHEN** a declared gate succeeds
- **THEN** D9 SHALL record the gate command outcome and non-claims.

#### Scenario: Declared gate fails
- **WHEN** a declared gate fails after live write
- **THEN** D9 SHALL attempt rollback
- **AND** SHALL report the failed gate identity and owner.

#### Scenario: Gate command sequence has prior successes
- **WHEN** one gate fails after earlier gates succeeded
- **THEN** D9 SHALL NOT report transaction success from the prior gates.

### Requirement: Rollback Is An Explicit State Relation

Habitat SHALL model rollback as a transaction state relation with success,
failure, dirty-path, and recovery data.

#### Scenario: Failure rollback succeeds
- **WHEN** live write, formatter handoff, or gate handoff fails after writes and
  rollback succeeds
- **THEN** D9 SHALL report a rolled-back terminal state with the original failed
  stage, rollback command outcome, reverted paths, and clean worktree
  observation.

#### Scenario: Failure rollback fails
- **WHEN** rollback fails after a write-stage failure
- **THEN** D9 SHALL report rollback-failed with residual dirty paths and
  recovery instructions
- **AND** SHALL NOT project success exit status.

#### Scenario: Rollback probe is requested
- **WHEN** a rollback probe is requested for transaction validation
- **THEN** D9 SHALL distinguish that probe from failure rollback and SHALL keep
  it out of normal live success semantics.

### Requirement: Docs And Source Apply Lanes Stay Distinct

Habitat SHALL keep docs-local-checkout-path rewrites and source structural
rewrites in distinct apply lanes with distinct roots, pattern ownership, and
write-set approval.

#### Scenario: Docs dry-run finds Markdown candidate
- **WHEN** the docs apply pattern reports a rewrite for an exact markdown file
- **THEN** D9 SHALL approve only that docs path through the docs lane.

#### Scenario: Docs dry-run reports file without rewrite hunk
- **WHEN** native docs apply output lists a file without a rewrite hunk
- **THEN** D9 SHALL NOT treat that file as an approved changed path.

#### Scenario: Source structural rewrite is planned
- **WHEN** the source apply pattern reports a TypeScript rewrite
- **THEN** D9 SHALL approve it only through the source lane and any required
  host/pattern gate.

### Requirement: Public Fix Output Is Compatibility-Controlled

Habitat SHALL expose `habitat fix` transaction output only through D0-backed
compatibility decisions.

#### Scenario: Existing fix command is used
- **WHEN** `habitat fix` or `habitat fix --dry-run` behavior is preserved
- **THEN** D9 SHALL cite D0 rows for the command surface and output/exit
  compatibility before source implementation changes it.

#### Scenario: JSON output is added
- **WHEN** D9 adds a `--json` flag or JSON output
- **THEN** D9 SHALL require D0 compatibility disposition, schema version, stable
  terminal `kind`, non-claim identifiers, recovery shape, and bad-case JSON
  tests.

#### Scenario: JSON output is not in D9 scope
- **WHEN** D9 does not add JSON output
- **THEN** D9 validation SHALL NOT cite `habitat fix --dry-run --json`.

### Requirement: Downstream Consumers Receive Projections

Habitat SHALL publish D9 downstream projections instead of requiring downstream
domains to parse legacy proof/result objects.

#### Scenario: D11 consumes transaction state
- **WHEN** D11 needs local feedback about apply/fix state
- **THEN** it SHALL consume a D9 projection for unavailable, refused, dry-run,
  applied, rolled-back, rollback-failed, or recovery-required outcomes
- **AND** it SHALL NOT recompute apply safety.

#### Scenario: D13 consumes transaction prerequisites
- **WHEN** D13 describes an apply-capable candidate
- **THEN** it MAY consume D9 transaction input prerequisites
- **AND** SHALL NOT treat candidate generation as D8 apply admission or D9
  write safety.
