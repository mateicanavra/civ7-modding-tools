## ADDED Requirements

### Requirement: D1 Classifies Proof-Shaped Surfaces Before Implementation

Habitat SHALL classify each proof-shaped current surface into one target contract family and one D0 compatibility decision before implementation changes that surface.

#### Scenario: Proof-shaped name is encountered
- **WHEN** D1 encounters `Proof*`, `*Proof`, `proofId`, `proofClass`, proof human output, proof artifact path, or broad evidence language
- **THEN** the surface is recorded as a compatibility fact unless D1 explicitly marks it target-retained for a concrete repo-maintenance invariant
- **AND** the record names its target family, owner, D0 row, D0 compatibility handling from the closed set `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`, bad case, and non-claims

#### Scenario: Public surface lacks a D0 row
- **WHEN** a D1 implementation task would change command JSON, package exports, hook output, human output, docs examples, or generated/workstream artifact paths
- **AND** the surface lacks a D0 `surface_id`
- **THEN** implementation stops before source edits

#### Scenario: One implementation shape appears on multiple planes
- **WHEN** a surface is both command JSON and package export
- **THEN** D1 records separate compatibility decisions for each D0 plane

### Requirement: Check Reports Remain Check Output

Habitat SHALL model check output as `CheckReport` and diagnostics, not as a receipt, proof, apply-safety signal, CI result, or global current-tree assertion.

#### Scenario: Valid check JSON result
- **WHEN** `habitat check --json` emits schemaVersion 1 output
- **THEN** the output reports selected rules, rule statuses, diagnostics, baseline/check command outcome, and `ok`
- **AND** `ok` matches the rule statuses

#### Scenario: Invalid selector in JSON mode
- **WHEN** `habitat check --json --rule definitely-not-a-rule` runs
- **THEN** the output is a schemaVersion 1 `CheckReport`
- **AND** it exits nonzero with `ok: false`
- **AND** it reports `rule-selection-integrity` without claiming ordinary rule execution

#### Scenario: Contradictory check report
- **WHEN** a `CheckReport` has `ok: true` and at least one rule status `fail`
- **THEN** validation rejects it or construction makes the state unrepresentable

### Requirement: Diagnostics Remain Findings Inside Owning Reports

Habitat SHALL model diagnostics as structured findings inside reports, not standalone receipts or proof artifacts.

#### Scenario: Invalid diagnostic severity
- **WHEN** a diagnostic has a severity outside the closed set `error` or `advisory`
- **THEN** check report validation rejects the payload

#### Scenario: Baseline contract failure
- **WHEN** baseline integrity fails
- **THEN** the failure is represented as a diagnostic/check failure under the owning report
- **AND** it does not become a receipt or proof claim

### Requirement: Verify Output Is A Bounded Handoff Receipt

Habitat SHALL model verify JSON output as a bounded verify handoff receipt, with `VerifyProof` retained only as a D0-backed legacy public name under `preserve`, `version`, or `facade` handling.

#### Scenario: Check passes before Nx affected
- **WHEN** Habitat check passes and Nx affected runs
- **THEN** verify output may record `nxAffected.status: "executed"`
- **AND** streams are bounded with truncation metadata
- **AND** cache state is task-local rather than a broad freshness claim

#### Scenario: Check fails before Nx affected
- **WHEN** Habitat check fails
- **THEN** verify output records `nxAffected.status: "skipped"`
- **AND** skip reason is `habitat-check-failed`
- **AND** projects, cache states, stdout, stderr, and numeric Nx exit code are empty or null

#### Scenario: Nx affected fails after running
- **WHEN** Nx affected runs and exits nonzero
- **THEN** verify output records an explicit failed affected-target state
- **AND** it does not report the command as a passing receipt

#### Scenario: Verify non-claims
- **WHEN** verify output is emitted
- **THEN** it includes non-claims for CI, apply safety, Graphite readiness, product/runtime behavior, OpenSpec acceptance, and rule correctness unless a narrower D0/versioned contract explicitly removes one

### Requirement: Hook Traces Are Local Feedback Only

Habitat SHALL model hook output as local feedback traces and human output, not CI authority or review proof.

#### Scenario: Resource-blocked pre-commit
- **WHEN** resources are dirty during pre-commit
- **THEN** the hook refuses before file-layer, Biome, Grit, or publish commands
- **AND** the trace records local feedback and recovery instructions

#### Scenario: Partial staging refusal
- **WHEN** partially staged Biome-supported files exist
- **THEN** pre-commit refuses before formatting or restaging

#### Scenario: Malformed Grit JSON
- **WHEN** staged Grit JSON is malformed
- **THEN** pre-commit records `grit-parse-failed`
- **AND** the failure is not reported as a passing receipt

#### Scenario: Hook human output non-claim
- **WHEN** hook output includes the legacy proof notice or its D0-approved replacement
- **THEN** the target meaning is `local-feedback-only`
- **AND** the text does not imply CI authority

### Requirement: Apply Transaction Records Distinguish Lifecycle States

Habitat SHALL model apply/fix command output as apply transaction records, with legacy `GritApplyTransactionProof` retained only as D0-backed compatibility unless D0 permits versioning.

#### Scenario: Dirty live apply
- **WHEN** live apply is requested against a dirty worktree
- **THEN** Habitat refuses before executing Grit
- **AND** the transaction cannot report success

#### Scenario: Dirty dry-run
- **WHEN** dry-run is requested against a dirty worktree
- **THEN** Habitat may proceed because dry-run does not write source files
- **AND** the transaction remains a dry-run record, not live apply safety

#### Scenario: Ambiguous dry-run
- **WHEN** dry-run output reports matches but isolated-copy validation produces no diff
- **THEN** Habitat fails closed as an apply transaction failure

#### Scenario: Rollback failure
- **WHEN** a gate fails after live apply and rollback fails
- **THEN** the transaction records rollback failure
- **AND** it cannot report `ok: true`

### Requirement: Adapter Command Artifacts Are Compatibility-Bounded

Habitat SHALL model adapter artifacts as adapter command capture, not as a generic proof substrate.

#### Scenario: Unsafe artifact id
- **WHEN** an adapter artifact id attempts path traversal or unsafe characters
- **THEN** the artifact path constructor rejects it before writing

#### Scenario: Redacted command capture
- **WHEN** command input includes sensitive environment values
- **THEN** serialized adapter command artifacts omit those values and may record redacted key names only

#### Scenario: Legacy artifact path
- **WHEN** the historical adapter proof artifact path remains public
- **THEN** D1 records it as a D0-backed `preserve`, `version`, `facade`, `deprecate`, or `generated-only` handling decision

#### Scenario: Adapter artifact retention is invalid
- **WHEN** an adapter command artifact has unknown retention state
- **THEN** validation rejects it or construction makes the state unrepresentable

#### Scenario: Adapter artifact raw output is unbounded
- **WHEN** command output is large or sensitive
- **THEN** serialized adapter command artifacts use bounded metadata such as hashes, byte counts, and truncation flags
- **AND** they do not persist unbounded raw stream text

### Requirement: Legacy Public DTOs Use Explicit Compatibility Handling

Habitat SHALL keep legacy proof-shaped public DTOs only through explicit D0-backed compatibility handling from the closed D0 action set.

#### Scenario: Legacy verify DTO remains public
- **WHEN** `VerifyProof` remains a public command JSON shape
- **THEN** D1 treats the implementation strategy as a legacy-name wrapper for `VerifyReceipt` semantics
- **AND** the D0 handling remains `preserve`, `version`, or `facade`

#### Scenario: Legacy apply DTO remains public
- **WHEN** `GritApplyTransactionProof` remains a package export or command output shape
- **THEN** D1 treats the implementation strategy as a legacy-name wrapper for `ApplyTransactionRecord` semantics
- **AND** the D0 handling remains `preserve`, `version`, or `facade`

#### Scenario: Package export and command JSON diverge
- **WHEN** D0 classifies an exported type and command JSON on different planes
- **THEN** D1 may preserve one and version/rename the other only if both D0 rows allow it

### Requirement: Refusals And Recovery Instructions Are Explicit

Habitat SHALL represent unsupported, unsafe, malformed, or ambiguous requests as explicit refusals or failures with recovery instructions.

#### Scenario: Unsupported hook
- **WHEN** a user requests an unsupported hook name
- **THEN** Habitat exits with an explicit expected-name message
- **AND** it does not produce a passing hook trace

#### Scenario: Invalid selector in human mode
- **WHEN** a human-mode check command receives an invalid selector
- **THEN** Habitat exits nonzero with human failure output
- **AND** it does not emit JSON unless JSON mode was requested

#### Scenario: Unsupported apply change
- **WHEN** an apply change observation includes outside-root paths, unapproved creates, unapproved deletes, or missing target exports
- **THEN** Habitat refuses or fails the transaction with a recovery instruction

### Requirement: Typed Relationships Replace Untyped Handoff Links

Habitat SHALL use typed relationships for D1 target records and keep untyped downstream links only as D0-classified compatibility fields.

#### Scenario: Receipt references a D0 row
- **WHEN** a record depends on public compatibility
- **THEN** it uses `references-d0-surface` to point at the D0 row

#### Scenario: Relationship endpoint class is ambiguous
- **WHEN** a target relationship would point to a command, post-state, downstream target, refused request, or legacy public surface
- **THEN** the endpoint is represented as `CommandInvocation`, `PostStateObservation`, `DownstreamHandoffTarget`, `RefusedRequest`, or `LegacyCompatibilitySurface`
- **AND** free-form endpoint strings are not target D1 relationships

#### Scenario: Receipt includes a check summary
- **WHEN** a verify receipt includes check output
- **THEN** it uses `summarizes-check-report`
- **AND** it does not reinterpret diagnostic semantics

#### Scenario: Apply transaction rolls back
- **WHEN** rollback runs after a failed apply state
- **THEN** the transaction uses `rolled-back-by` with rollback command outcome

### Requirement: D1 Non-Claims Are Canonical

Habitat SHALL use canonical non-claim identifiers for cross-family command record limits.

#### Scenario: Record is local command output
- **WHEN** a command receipt, report, trace, transaction, or artifact is emitted
- **THEN** it uses relevant identifiers from the D1 base set such as `does-not-prove-ci`, `does-not-prove-runtime`, `does-not-prove-product-completion`, `does-not-prove-graphite-readiness`, `does-not-prove-openspec-acceptance`, `does-not-prove-apply-safety`, `does-not-prove-current-tree-cleanliness`, `does-not-prove-rule-correctness`, `local-feedback-only`, and `command-output-only`

#### Scenario: Downstream packet needs a new non-claim
- **WHEN** a downstream packet needs a family-specific non-claim
- **THEN** it names the owner, scenario, public compatibility impact, and consumer before adding it

### Requirement: Graphite And OpenSpec State Are Not Command Receipt Substitutes

Habitat SHALL keep Graphite state and OpenSpec workstream status separate from command receipt semantics.

#### Scenario: Graphite base is observed
- **WHEN** hook or verify records Graphite branch/base provenance
- **THEN** the record treats it as observed state only
- **AND** it does not claim PR readiness

#### Scenario: OpenSpec validation passes
- **WHEN** OpenSpec validation passes for the D1 packet
- **THEN** that status validates packet shape
- **AND** it does not prove TypeScript implementation, runtime behavior, CI, apply safety, or current-tree cleanliness
