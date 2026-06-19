## ADDED Requirements

### Requirement: Diagnostic Catalog Entries Bind Rule Facts To Diagnostic Capabilities

Habitat SHALL model each D6 diagnostic capability as a `DiagnosticCatalogEntry`
that binds one D2-owned `ruleId` to one closed `DiagnosticIdentity`: either a
D2-backed Grit `patternIdentity` or a D6-owned native diagnostic identity. The
entry SHALL NOT contain Pattern Governance lifecycle, baseline authority, apply
eligibility, hook sequencing, or transaction state.

#### Scenario: Grit facet creates a diagnostic entry

- **WHEN** D2 publishes valid `ruleGritFacts` for a Grit-owned Habitat rule
- **THEN** D6 creates a `grit-diagnostic` catalog entry with
  `diagnosticCatalogEntryId`, `ruleId`, `DiagnosticIdentity.kind ==
  "grit-pattern"`, scan contract, projection contract, and limitations

#### Scenario: Native rule creates a diagnostic entry

- **WHEN** D6 owns a native Habitat diagnostic such as docs advisory scanning
- **THEN** D6 creates a `native-diagnostic` catalog entry with
  `DiagnosticIdentity.kind == "native-rule"` and a closed native diagnostic
  identity
- **AND** downstream projections SHALL NOT require `patternIdentity` for that
  native entry

#### Scenario: Missing pattern identity is refused

- **WHEN** a Grit-owned rule lacks a D2-published `patternIdentity`
- **THEN** D6 refuses the catalog entry before native Grit execution
- **AND** D6 SHALL NOT fall back from missing `patternIdentity` to `ruleId`

#### Scenario: Catalog entry does not admit a pattern

- **WHEN** D6 publishes a diagnostic catalog entry
- **THEN** D8 still owns whether the pattern is candidate, registered,
  hook-scoped, apply-approved, refused, or retired

### Requirement: Scan Roots Are Closed Decisions

Habitat SHALL model D6 scan roots as `DiagnosticScanRootDecision` states rather
than generic strings or command failures.

#### Scenario: Accepted source roots

- **WHEN** D2 rule facts identify approved existing source scan roots
- **THEN** D6 records `accepted` scan roots and builds a native diagnostic
  request from those roots

#### Scenario: Test directory roots expand to exact files

- **WHEN** a Grit diagnostic targets ignored test scope
- **THEN** D6 records `expanded-test-files` with requested roots and effective
  exact candidate files

#### Scenario: Injected probe root is probe-only

- **WHEN** an injected diagnostic probe requests an injected probe root
- **THEN** D6 accepts that root only as `accepted-injected-probe-root`
- **AND** ordinary Grit diagnostics SHALL refuse the same root

#### Scenario: Scan root refused before command execution

- **WHEN** a requested root is empty, outside the repo, missing, generated
  output, protected, not approved, or an injected-probe root outside probe mode
- **THEN** D6 records a `refused` scan-root decision with the exact reason
- **AND** no native command request is treated as a diagnostic run

### Requirement: Native Grit Command Requests Are Bounded Observations

Habitat SHALL model D6 native Grit execution through bounded command request and
observation projections. Downstream consumers SHALL NOT receive full process
records as D6 authority.

#### Scenario: JSON diagnostic request

- **WHEN** D6 runs ordinary source Grit diagnostics
- **THEN** the request records a closed command family, command invocation id,
  executable, argv, cwd, scan roots, output contract `json-report`, cache
  requirement, and limitations

#### Scenario: Unknown command family is refused

- **WHEN** a D6 request cannot be classified as `current-tree-json-check`,
  `selected-rule-json-check`, `docs-text-check`,
  `docs-apply-dry-run-observation`, or `injected-probe-json-check`
- **THEN** D6 refuses that request before treating it as a diagnostic acquisition
- **AND** D6 SHALL NOT accept a bare string command id as a core command family

#### Scenario: Text-output docs request

- **WHEN** D6 runs a docs-scoped Grit diagnostic whose native JSON path does not
  expose Markdown findings
- **THEN** the request records output contract `standard-text-report` or
  `standard-apply-dry-run`
- **AND** non-doc Grit diagnostics continue through the JSON output contract

#### Scenario: Tool unavailable

- **WHEN** Grit cannot be executed
- **THEN** D6 records a `tool-unavailable` command observation and adapter
  failure
- **AND** the diagnostic outcome SHALL NOT become a structural pass

### Requirement: Adapter Outcomes Distinguish Diagnostic Failure Families

Habitat SHALL model D6 adapter outcomes as parsed reports, scan-root refusals,
or a closed diagnostic adapter failure subset. D6 SHALL NOT include D9-owned
apply transaction failures in diagnostic target states.

#### Scenario: Parsed native report

- **WHEN** native Grit output matches the expected output contract
- **THEN** D6 records a `parsed` acquisition outcome with a parsed native report
  ready for projection
- **AND** the parsed acquisition carries a completed command observation only

#### Scenario: No JSON

- **WHEN** a JSON-output diagnostic command emits no JSON object
- **THEN** D6 records `GritNoJson`
- **AND** reports an adapter-failed diagnostic outcome

#### Scenario: Malformed JSON

- **WHEN** Grit output contains malformed JSON or wrapper text around JSON
- **THEN** D6 records `GritMalformedJson`
- **AND** reports an adapter-failed diagnostic outcome

#### Scenario: Schema drift or unexpected shape

- **WHEN** parsed Grit JSON lacks required arrays or has unsupported result
  field shapes
- **THEN** D6 records `GritSchemaDrift` or `GritUnexpectedResultShape`

#### Scenario: Apply failure tag cannot appear in D6 diagnostics

- **WHEN** a D6 diagnostic acquisition, projection, or injected probe path
  encounters a `GritApply*` transaction failure tag
- **THEN** D6 treats that as an owner-boundary defect
- **AND** D9 remains the owner of apply transaction failure semantics

### Requirement: Diagnostic Projection Uses Explicit Pattern Identity

Habitat SHALL project native diagnostic results only when observed native
identity evidence matches the selected D6 `DiagnosticIdentity`. Observed native
identity evidence SHALL remain distinct from accepted catalog identity until
projection matching succeeds.

#### Scenario: Clean result

- **WHEN** the native report parses and contains no findings for the selected
  diagnostic identity
- **THEN** D6 emits `DiagnosticRunOutcome.kind == "clean"` with no diagnostics

#### Scenario: Findings result

- **WHEN** the native report contains findings whose observed diagnostic
  identity evidence matches the selected diagnostic identity
- **THEN** D6 emits `DiagnosticRunOutcome.kind == "findings"` with normalized
  diagnostic projections
- **AND** the findings report, run outcome, and consumer projection each carry
  at least one diagnostic finding

#### Scenario: Projection miss

- **WHEN** a validation path requires a finding for the selected diagnostic identity
  and no matching finding is projected
- **THEN** D6 emits `projection-missed`

#### Scenario: Unexpected diagnostic identity

- **WHEN** native output includes observed diagnostic identity evidence outside
  the selected diagnostic entry set
- **THEN** D6 emits `unexpected-diagnostic-identity`

#### Scenario: Native identity fields disagree

- **WHEN** native output includes both `local_name` and parsed `check_id`
  identity evidence for one finding and those values disagree
- **THEN** D6 records observed identity mismatch evidence
- **AND** D6 emits `unexpected-diagnostic-identity`
- **AND** D6 SHALL NOT coerce either observed value into the selected
  `DiagnosticIdentity`

### Requirement: Cache And Freshness Are Explicit Diagnostic States

Habitat SHALL distinguish ordinary current-tree diagnostics from freshness
required validation paths.

#### Scenario: Ordinary current-tree diagnostic

- **WHEN** D6 runs ordinary current-tree diagnostics
- **THEN** workspace cache may be allowed only with a
  `workspace-unobserved` limitation

#### Scenario: Injected probe requires fresh observation

- **WHEN** D6 runs an injected diagnostic probe
- **THEN** D6 requires a fresh observable command result

#### Scenario: Required freshness missing

- **WHEN** a freshness-required diagnostic cannot observe the required cache
  state
- **THEN** D6 emits `cache-observation-missing` with
  `GritCacheProvenanceMissing`

### Requirement: Injected Diagnostic Probes Are Diagnostic Outcomes

Habitat SHALL model injected diagnostic probes as D6 validation outcomes, not
Pattern Governance admission, apply safety, or full current-tree cleanliness.

#### Scenario: Probe detects the expected diagnostic

- **WHEN** an injected probe path produces the expected unbaselined diagnostic,
  the outside-scope control path produces no diagnostic, and cleanup restores
  the worktree state
- **THEN** D6 emits `probe-diagnostic-observed`
- **AND** the result carries `validationClass:
  "injected-violation-diagnostic"`
- **AND** dirty or un-restored cleanup SHALL NOT be representable as
  `probe-diagnostic-observed`

#### Scenario: Probe metadata refused

- **WHEN** probe metadata is missing, mismatched, outside scan roots, generated,
  protected, ignored, pre-existing, lacks a `__habitat` ownership segment, or
  uses the same probe/control path
- **THEN** D6 emits `probe-refused` before relying on the probe result

#### Scenario: Control path also matches

- **WHEN** the outside-scope control path produces the diagnostic
- **THEN** D6 emits `probe-control-matched`

#### Scenario: Probe cleanup fails

- **WHEN** probe cleanup does not restore status or leaves dirty final state
- **THEN** D6 emits `probe-cleanup-failed`
- **AND** D6 may retain the observed diagnostic as failure context without
  classifying the probe as successful validation

### Requirement: Downstream Consumers Receive Bounded D6 Projections

Habitat SHALL publish bounded D6 consumer projections instead of raw Grit reports,
whole rule rows, or full process records.

#### Scenario: D7 consumes diagnostics

- **WHEN** D7 assembles Structural Enforcement reports
- **THEN** it consumes D6 `DiagnosticRunOutcome` or its discriminated consumer
  projection and normalized diagnostics
- **AND** a findings projection SHALL NOT represent an empty diagnostic set
- **AND** D7 does not infer Pattern Governance or apply safety

#### Scenario: D8 consumes diagnostic capability

- **WHEN** D8 evaluates Pattern Governance lifecycle
- **THEN** it consumes D6 diagnostic capability and injected probe outcomes
- **AND** D8 owns admission decisions independently

#### Scenario: D9 consumes limitations

- **WHEN** D9 evaluates transformation transactions
- **THEN** it may consume diagnostic identity and limitations
- **AND** D9 must establish write safety through its own transaction packet

#### Scenario: D15 receives only a trigger

- **WHEN** D6 cannot represent required command observations through local DTOs
- **THEN** D6 records a D15 trigger with the exact unrepresentable state
- **AND** D6 does not start a broad substrate migration

### Requirement: Public Surface Compatibility Blocks Source Implementation

Habitat SHALL NOT start D6 source implementation that changes public or durable
surfaces until D0 rows exist for every touched surface.

#### Scenario: Exported adapter types change

- **WHEN** D6 changes exported Grit adapter, failure, process, or injected probe
  types/functions
- **THEN** implementation cites concrete D0 rows before source edits are
  accepted

#### Scenario: Command JSON changes

- **WHEN** D6 changes `habitat check --tool grit-check --json`, selected
  `--rule` JSON, statuses, messages, adapter failure rendering, or
  diagnostic fields
- **THEN** implementation cites concrete D0 rows and D1 output-family decisions

#### Scenario: D2 facts are not live

- **WHEN** live `ruleGritFacts` do not exist
- **THEN** D6 source implementation that would consume Grit metadata remains
  blocked
- **AND** design/specification acceptance does not imply implementation
  readiness
