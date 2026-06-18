## ADDED Requirements

### Requirement: Pattern Governance Owns Pattern Admission

Habitat SHALL use D8 Pattern Governance as the single owner of pattern
lifecycle admission, refusal, and retirement.

#### Scenario: Candidate draft is generated
- **WHEN** a pattern candidate is generated from a supported request
- **THEN** Habitat records `candidate-draft`
- **AND** the candidate has no active rule, baseline, hook, diagnostic
  admission, local-feedback admission, or apply admission projection.

#### Scenario: Candidate enters review
- **WHEN** a candidate is selected for Pattern Authority review
- **THEN** Habitat records `candidate-under-review`
- **AND** the state lists every required admission input still needed before
  diagnostic, local-feedback, or apply use.

#### Scenario: Pattern is admitted for diagnostics
- **WHEN** D8 has a valid Pattern Authority decision, D2 governance/Grit facts,
  D5 baseline authority projection, D6 diagnostic capability, fixture strategy,
  false-positive assessment, and current-tree disposition
- **THEN** Habitat records `diagnostic-admitted`
- **AND** the projection states that diagnostic admission is not apply admission.

#### Scenario: Pattern is admitted for local feedback
- **WHEN** a diagnostic-admitted pattern has an explicit hook/local-feedback
  admission decision and the required D7/D10/D11 inputs
- **THEN** Habitat records `local-feedback-admitted`
- **AND** D11 remains the owner of hook sequencing, staged-file behavior, and
  local output.

#### Scenario: Pattern is admitted for apply consideration
- **WHEN** a pattern has explicit apply admission inputs and D9-owned
  transaction-safety references
- **THEN** Habitat records `apply-admitted`
- **AND** D9 remains the owner of dry-run, live writes, rollback, path approval,
  formatter handoff, and recovery.

#### Scenario: Admission is refused
- **WHEN** any required admission input is missing, malformed, contradicted,
  refused by its owner, or incompatible with public-surface rules
- **THEN** Habitat records `refused`
- **AND** the refusal names one D8 refusal reason and protected paths that were
  not written.

#### Scenario: Pattern is retired
- **WHEN** a previously admitted pattern is withdrawn
- **THEN** Habitat records `retired`
- **AND** new diagnostic, local-feedback, or apply consumption requires a new
  admission decision.

### Requirement: Candidate Artifacts Are Never Active Authority

Candidate files, candidate manifests, and generator options SHALL NOT act as
active diagnostic, baseline, hook, or apply authority.

#### Scenario: Candidate has active-looking Grit markdown
- **WHEN** a candidate Markdown file exists under the candidate root
- **THEN** Habitat treats it as candidate material only
- **AND** it is not loaded as an active Grit check by D8 admission.

#### Scenario: Candidate tries to mark registration accepted
- **WHEN** candidate metadata says registration is accepted
- **THEN** Habitat records `manifest-invalid-candidate`
- **AND** registration refuses before active writes.

#### Scenario: Candidate collides with active surfaces
- **WHEN** candidate generation would collide with an active Grit pattern,
  baseline file, or `rules.json` row
- **THEN** Habitat refuses the candidate request before writing candidate files.

#### Scenario: Candidate carries baseline or hook state
- **WHEN** candidate input includes baseline, hook, diagnostic, or apply state
  that only admitted patterns may carry
- **THEN** Habitat refuses or records invalid candidate state
- **AND** no adjacent owner consumes that input as authority.

### Requirement: Manifest Validation Is Necessary But Not Sufficient

A valid Pattern Authority manifest SHALL be one admission input, not complete
admission by itself.

#### Scenario: Manifest is missing
- **WHEN** registered promotion lacks a manifest path
- **THEN** Habitat records `missing-manifest`
- **AND** no active Grit pattern or rule row is written.

#### Scenario: Manifest is malformed
- **WHEN** a manifest is not a valid Pattern Authority object
- **THEN** Habitat records `malformed-manifest`.

#### Scenario: Manifest uses placeholder authority
- **WHEN** manifest decision fields contain placeholders or unresolved template
  language
- **THEN** Habitat records `placeholder-manifest`.

#### Scenario: Grit metadata is presented as Habitat authority
- **WHEN** Grit frontmatter, Markdown prose, or a native Grit sample is the only
  authority input
- **THEN** Habitat records `grit-metadata-only`.

#### Scenario: Nx generator options are presented as Habitat authority
- **WHEN** generator options or schema fields are the only authority input
- **THEN** Habitat records `nx-options-only`.

#### Scenario: Manifest validation succeeds
- **WHEN** a manifest passes structure validation
- **THEN** Habitat still requires D2, D5, D6, and applicable D7/D10/D9/D13
  admission inputs before recording an admitted state.

### Requirement: Registry Metadata Is Consumed Through D2 Projections

D8 SHALL consume D2 registry projections and SHALL NOT treat whole registry rows
or optional fields as Pattern Governance authority.

#### Scenario: Governance facts are available
- **WHEN** D2 publishes `ruleGovernanceFacts` for a pattern
- **THEN** D8 may consume the governance relation and manifest reference.

#### Scenario: Grit facts are available
- **WHEN** D2 publishes `ruleGritFacts`
- **THEN** D8 may consume pattern identity and scan-root relation through D2/D6
  projections.

#### Scenario: Baseline facts are available
- **WHEN** D2 publishes `ruleBaselineFacts`
- **THEN** D8 may relate the pattern to D5 baseline authority without reading
  baseline truth locally.

#### Scenario: Only broad rule row exists
- **WHEN** only `lane`, `scope`, `gritPattern`, `hookScope`, or `manifestPath`
  field presence is available
- **THEN** D8 does not record admission from those fields alone.

### Requirement: Baseline Authority Is Consumed Through D5

D8 SHALL consume D5 baseline authority projection or refusal result and SHALL
NOT define baseline truth.

#### Scenario: Baseline projection accepts empty baseline
- **WHEN** D5 publishes an accepted explicit-empty baseline projection
- **THEN** D8 may use that as one diagnostic admission input.

#### Scenario: Baseline projection accepts debt
- **WHEN** D5 publishes accepted explicit debt
- **THEN** D8 may use that projection without erasing D8 admission inputs.

#### Scenario: Baseline authority refuses
- **WHEN** D5 refuses baseline authority
- **THEN** D8 records a baseline-related refusal and does not admit the pattern.

#### Scenario: Baseline file exists without authority projection
- **WHEN** a baseline JSON file exists but no D5 projection is available
- **THEN** D8 does not treat file presence as admission input.

### Requirement: Diagnostic Capability Is Consumed Through D6

D8 SHALL consume D6 diagnostic capability and diagnostic projections without
owning Grit acquisition or diagnostic catalog behavior.

#### Scenario: Diagnostic capability is accepted
- **WHEN** D6 publishes accepted diagnostic identity, fixture/sample result,
  injected-probe result where required, and diagnostic non-claims
- **THEN** D8 may use those as diagnostic-admission inputs.

#### Scenario: Diagnostic identity is missing or unexpected
- **WHEN** D6 reports missing, unexpected, malformed, or projection-missed
  diagnostic identity
- **THEN** D8 refuses diagnostic admission.

#### Scenario: Native Grit command passes
- **WHEN** native Grit command execution passes
- **THEN** D8 does not infer admission unless the D6 projection and remaining
  D8 inputs are present.

#### Scenario: Diagnostic pattern has no apply admission
- **WHEN** a pattern is diagnostic-admitted only
- **THEN** D9 cannot consume it as apply-ready.

### Requirement: Local Feedback Admission Is Explicit

D8 SHALL make local-feedback admission explicit and SHALL NOT infer hook
eligibility from rule lane, Grit metadata, or generator output.

#### Scenario: Hook decision is none
- **WHEN** a diagnostic-admitted pattern declares no local-feedback admission
- **THEN** Habitat does not publish a local-feedback admission projection.

#### Scenario: Pre-commit local feedback is admitted
- **WHEN** D8 records local-feedback admission for an enforced diagnostic
  pattern and D11-compatible inputs are present
- **THEN** Habitat publishes local-feedback eligibility
- **AND** D11 still owns hook sequencing and staged-file behavior.

#### Scenario: Hook scope mismatches registry relation
- **WHEN** Pattern Authority state and D2/D11-facing hook relation disagree
- **THEN** Habitat records `hook-scope-mismatch`.

#### Scenario: Advisory pattern requests pre-commit hook scope
- **WHEN** advisory diagnostic admission requests pre-commit local feedback
- **THEN** Habitat refuses local-feedback admission.

### Requirement: Apply Admission Is Separate From Diagnostics

D8 SHALL separate apply admission from diagnostic admission and SHALL NOT allow
diagnostic registration to imply write capability.

#### Scenario: Diagnostic pattern claims apply safety
- **WHEN** a `grit-check` diagnostic pattern carries apply-ready fields
- **THEN** Habitat records `apply-safety-contradicted`
- **AND** D9 receives no apply-admission projection.

#### Scenario: Apply pattern lacks transaction inputs
- **WHEN** an apply-capable pattern lacks D9-owned dry-run, no-write, diff,
  rollback, type/test, protected-path, or recovery inputs
- **THEN** Habitat records `apply-safety-missing`.

#### Scenario: Apply admission is published
- **WHEN** D8 records `apply-admitted`
- **THEN** the D9 projection contains pattern identity, manifest path,
  D9-owned transaction inputs, protected-zone/host-policy references where
  applicable, and non-claims.

#### Scenario: Apply transaction fails
- **WHEN** D9 reports a transaction failure
- **THEN** D8 does not convert that failure into diagnostic admission state.

### Requirement: Refusal Reasons Are Stable

D8 SHALL represent refusal as first-class lifecycle output with closed reason
names.

#### Scenario: Owner projection is missing
- **WHEN** required D2, D5, D6, D7, D10, D11, D9, D13, or G-HOST projection is
  missing for the requested admission
- **THEN** D8 records a refusal naming the missing owner input.

#### Scenario: Public compatibility is missing
- **WHEN** later implementation would change public or durable surfaces without
  concrete D0 rows
- **THEN** D8 records `public-surface-compatibility-missing` and source
  implementation stops.

#### Scenario: Retired pattern is referenced as active
- **WHEN** a retired pattern is selected for diagnostic, local-feedback, or
  apply consumption
- **THEN** D8 records `retired-pattern-referenced`.

### Requirement: Downstream Consumers Receive Narrow Projections

D8 SHALL publish consumer-specific projections and SHALL NOT expose whole
Pattern Authority manifests to downstream owners as their target API.

#### Scenario: D9 consumes apply admission
- **WHEN** D9 needs apply eligibility
- **THEN** it receives `ApplyAdmissionProjection`
- **AND** it does not read diagnostic admission or whole manifest state as write
  authority.

#### Scenario: D13 consumes candidate state
- **WHEN** D13 creates or reports a generated pattern candidate
- **THEN** it receives `CandidateHandoffProjection`
- **AND** it does not write active `.grit`, baseline, rule registry, hook, or
  apply state by implication.

#### Scenario: D11 consumes local-feedback eligibility
- **WHEN** local feedback needs pattern eligibility
- **THEN** it receives local-feedback eligibility through D8/D7/D10 projections
- **AND** it does not infer eligibility from rule lane or hook fields alone.

#### Scenario: Recovery consumes refusal
- **WHEN** recovery guidance is needed
- **THEN** it receives `PatternRecoveryProjection` with owner, refusal or
  retirement reason, next action, and non-claims.
