## ADDED Requirements

### Requirement: Habitat Rule Baseline State Is Explicit

Every registered Habitat rule SHALL have an explicit baseline contract state:
committed empty locked baseline file, committed debt baseline file, modeled
external exception source, or baseline contract failure. Missing baseline files
SHALL NOT silently serve as accepted locked proof for registered rules after
this repair closes.

#### Scenario: Rule has explicit empty baseline state
- **WHEN** a registered rule has a committed empty baseline file
- **THEN** Habitat reports the rule as locked and any unbaselined error
  diagnostic fails the check

#### Scenario: Rule has explicit debt baseline
- **WHEN** a registered rule has a non-empty explicit baseline file
- **THEN** matching diagnostics are marked baselined, non-matching error
  diagnostics fail, and the rule is not reported as locked

#### Scenario: Rule has no explicit baseline state
- **WHEN** a registered rule lacks an explicit baseline state and has no modeled
  external exception source
- **THEN** Habitat emits a baseline contract failure and SHALL NOT report the
  rule as green proof

#### Scenario: Grit-consuming locked rule has committed baseline file
- **WHEN** a Grit-consuming registered rule has no current debt
- **THEN** Habitat represents the locked state through a committed
  `tools/habitat-harness/baselines/<rule-id>.json` empty JSON array rather than
  implicit file absence

#### Scenario: Baseline keys use v1 executable format
- **WHEN** Habitat records or compares v1 baseline entries
- **THEN** the stable key format is `path::message` unless a separate accepted
  key-format migration changes code, files, tests, and downstream proof
  together

### Requirement: Baseline Files Are Validated As Contract Artifacts

Habitat SHALL validate baseline artifacts before accepting their contents as
proof input.

#### Scenario: Baseline JSON is malformed
- **WHEN** a baseline file is unreadable, malformed, or not a JSON array
- **THEN** Habitat emits a baseline contract failure for that file

#### Scenario: Baseline entries are not stable sorted strings
- **WHEN** a baseline file contains non-string entries, duplicate keys, or keys
  outside sorted order
- **THEN** Habitat emits a baseline contract failure and does not treat the file
  as accepted debt proof

#### Scenario: Baseline file has no registered rule
- **WHEN** `tools/habitat-harness/baselines/<rule-id>.json` exists but no
  matching registered rule exists
- **THEN** Habitat emits an orphan-baseline contract failure

### Requirement: External Exception Sources Are Modeled

Habitat SHALL NOT mark diagnostics as baselined through parser convention alone.
If a rule consumes an exception source outside `tools/habitat-harness/baselines`,
that source SHALL be modeled with owner, path, projected keys, current proof,
and downstream owner.

#### Scenario: Adapter-boundary debt is reported
- **WHEN** `adapter-boundary` reports known debt as baselined
- **THEN** every baselined diagnostic is backed by explicit Habitat baseline
  state or by a modeled external exception source recorded by the baseline
  contract

#### Scenario: Current external exception sources are inventoried
- **WHEN** the repair validates the current rule pack
- **THEN** every non-`none` `exceptionPath`, including `adapter-boundary` and
  `doc-ambiguity`, is represented as a committed Habitat baseline file, a
  modeled external exception source, or a contract failure

#### Scenario: Parser marks finding baselined without contract state
- **WHEN** a rule parser would set `baselined: true` without baseline contract
  state or a modeled external exception source
- **THEN** implementation is invalid and Habitat must report a contract failure

#### Scenario: External projected keys diverge from reported diagnostics
- **WHEN** parser or native rule code projects external exception entries into
  diagnostics marked `baselined: true`
- **THEN** the projected keys must exactly equal the baseline contract's current
  projected key set or Habitat reports a contract failure

### Requirement: Baseline Mutation Is Write-Guarded

Habitat SHALL guard `--expand-baseline` with selector validation, rule
introduction proof, existing-rule growth refusal, and no-write proof for
refused mutations.

#### Scenario: Invalid selector requests baseline expansion
- **WHEN** a requested `--owner`, `--rule`, or `--tool` selector is invalid or
  selects no rules during `--expand-baseline`
- **THEN** Habitat exits non-zero before any baseline file is created, rewritten,
  or deleted

#### Scenario: Existing rule tries to grow baseline
- **WHEN** `--expand-baseline` would add baseline entries for a rule that existed
  at the comparison base
- **THEN** Habitat refuses before writing and records the existing-rule growth
  refusal

#### Scenario: New rule introduction writes baseline
- **WHEN** a rule-introduction change adds a new registered rule and an
  accepted rule-introduction baseline manifest
- **THEN** Habitat may create the explicit baseline file for that new rule and
  records comparison base, keys, output path, and non-claims

#### Scenario: New rule introduction has no accepted manifest
- **WHEN** a rule-introduction change requests baseline writes without an
  accepted rule-introduction baseline manifest
- **THEN** Habitat exits non-zero before any baseline file is created, rewritten,
  or deleted

### Requirement: Baseline Integrity Validates Shape And Shrink-Only Growth

`baseline-integrity` SHALL validate baseline contract shape and shrink-only
growth using structured rule registry comparison.

#### Scenario: Existing-rule baseline grows
- **WHEN** a current baseline file contains keys absent at the comparison base
  and the rule existed at that base
- **THEN** `baseline-integrity` fails with a diagnostic naming the rule id,
  baseline file, added key count, and comparison base

#### Scenario: Rule registry is compared
- **WHEN** `baseline-integrity` decides whether a rule is new
- **THEN** it parses current and base rule registries structurally rather than
  relying on string inclusion

#### Scenario: Comparison base is unavailable
- **WHEN** `baseline-integrity` cannot resolve a trusted comparison base
- **THEN** it fails with a baseline contract diagnostic instead of returning
  green

#### Scenario: Base rule registry cannot be trusted
- **WHEN** the base `tools/habitat-harness/src/rules/rules.json` is missing,
  unreadable, or malformed
- **THEN** `baseline-integrity` fails with a baseline contract diagnostic

#### Scenario: Base baseline cannot be read
- **WHEN** a base baseline file required for comparison is unreadable or
  malformed
- **THEN** `baseline-integrity` fails with a baseline contract diagnostic

#### Scenario: Graphite child branch grows a downstack rule baseline
- **WHEN** a child branch baseline contains added keys for a rule that existed
  on the trusted stack parent but appears new relative to trunk merge-base
- **THEN** `baseline-integrity` compares against the trusted stack parent or
  explicit trusted comparison base and refuses the growth

#### Scenario: Contract shape is invalid during check
- **WHEN** missing, malformed, duplicate, unsorted, orphan, or unmodeled external
  exception state is present
- **THEN** `baseline-integrity` fails with schemaVersion 1 CheckReport
  diagnostics and the affected proof remains unclaimed

### Requirement: Baseline Contract Boundaries Are Preserved

Baseline policy and mutation SHALL remain owned by Habitat baseline/scaffold
code and SHALL NOT move into the Grit adapter, Biome, Nx, hooks, or generators.

#### Scenario: Grit adapter consumes baseline state
- **WHEN** the Grit adapter classifies findings as baselined or unbaselined
- **THEN** it consumes the accepted Habitat baseline contract and does not write
  or define baseline policy

#### Scenario: Pattern generator creates a rule
- **WHEN** the Habitat pattern generator creates a new Grit-backed rule
- **THEN** it must satisfy the explicit baseline file contract, while authority
  source, proving source, false-positive model, scan roots, fixture strategy,
  baseline policy, and hook-scope metadata remain owned by the pattern-generator
  metadata repair

### Requirement: Baseline Implementation Substrate Is Evidence-Gated

Habitat SHALL record a manual-vs-Effect implementation decision before
implementation commits to the baseline contract substrate.

#### Scenario: Effect removes recurring manual failure classes
- **WHEN** the implementation design shows Effect services, layers, schemas,
  tagged errors, scoped resources, or command orchestration materially reduce
  baseline-store, rule-registry, comparison-base, command-provenance, or test
  seam failure classes
- **THEN** the repair adopts Effect behind the Habitat baseline boundary and
  preserves baseline policy outside the Grit adapter

#### Scenario: Plain TypeScript remains the substrate
- **WHEN** the implementation design chooses a plain TypeScript state module
- **THEN** the decision record proves typed states, injected dependencies,
  command provenance, and test seams are fully expressed without recreating
  Effect primitives by hand
