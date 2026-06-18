## ADDED Requirements

### Requirement: Baseline Source Resolves To Accepted Authority Or Refusal

For each D2-registered Habitat rule, Baseline Authority SHALL resolve exactly
one rule-level baseline authority state: `explicit-empty`, `explicit-debt`,
`external-exception`, or `baseline-refusal`.

Baseline Authority SHALL distinguish diagnostic keys, baseline entries,
external exception projection entries, and baseline application matches. It
SHALL NOT use a generic debt-row concept as authority.

#### Scenario: Explicit empty baseline file resolves to accepted authority
- **WHEN** a registered rule has a baseline file containing a sorted empty JSON array
- **THEN** D5 publishes accepted baseline authority with state `explicit-empty`
- **AND** the result includes the rule id, baseline path, `keys: []`, and `locked: true`
- **AND** D7 treats every matching rule diagnostic as uncovered current debt
- **AND** D8 receives D5's accepted baseline authority projection without deciding baseline truth

#### Scenario: Explicit debt baseline file resolves to accepted authority
- **WHEN** a registered rule has a baseline file containing sorted unique diagnostic keys
- **THEN** D5 publishes accepted baseline authority with state `explicit-debt`
- **AND** the result includes the rule id, baseline path, sorted diagnostic keys, and `locked: false`
- **AND** D7 may mark diagnostics whose diagnostic keys match baseline entries as covered debt
- **AND** non-matching diagnostics remain uncovered current debt

#### Scenario: Missing required baseline file refuses
- **WHEN** a registered rule has no explicit baseline file and no modeled external exception source
- **THEN** D5 publishes a baseline refusal with reason `missing-baseline`
- **AND** the refusal includes the rule id and expected baseline path
- **AND** D7 emits a baseline contract diagnostic rather than treating the rule as clean

#### Scenario: Malformed baseline file refuses
- **WHEN** a baseline file is unreadable, invalid JSON, or not a JSON array
- **THEN** D5 publishes a baseline refusal with reason `malformed-baseline`
- **AND** D7 emits a baseline contract diagnostic
- **AND** D5 does not apply any baseline entries from that file

#### Scenario: Non-string baseline entry refuses
- **WHEN** a baseline JSON array includes an entry that is not a string
- **THEN** D5 publishes a baseline refusal with reason `non-string-baseline-key`
- **AND** the refusal identifies the rule id, baseline path, and offending entry location

#### Scenario: Duplicate baseline entry refuses
- **WHEN** a baseline JSON array repeats a diagnostic key
- **THEN** D5 publishes a baseline refusal with reason `duplicate-baseline-key`
- **AND** duplicate entries are not collapsed into an accepted baseline

#### Scenario: Unsorted baseline entries refuse
- **WHEN** baseline entries are not sorted lexicographically
- **THEN** D5 publishes a baseline refusal with reason `unsorted-baseline`
- **AND** the implementation does not silently sort the file during check execution

#### Scenario: Orphan baseline file refuses
- **WHEN** a baseline JSON file exists for no D2-registered rule
- **THEN** D5 publishes a baseline-integrity refusal with reason `orphan-baseline`
- **AND** the built-in baseline-integrity command outcome fails

### Requirement: External Exception Sources Project Diagnostic Keys

Baseline Authority SHALL model external exception sources as explicit projection
contracts. An external exception source is not a Habitat baseline file. The D5
authority is the validated projection from that source into sorted diagnostic
keys.

#### Scenario: Modeled fixed external projection is accepted
- **WHEN** a registered rule has no explicit baseline file and has a modeled fixed external exception projection
- **THEN** D5 publishes accepted baseline authority with state `external-exception`
- **AND** the result includes source path, owner, migration owner, sorted projected diagnostic keys, and `locked: false`
- **AND** D8 consumes the D5-published projection/refusal result without reading the raw external source model

#### Scenario: Modeled derived external projection is accepted
- **WHEN** a registered rule has a modeled external source whose projector validates the source and derives sorted diagnostic keys
- **THEN** D5 publishes accepted baseline authority with state `external-exception`
- **AND** the accepted state records the source path, owner, migration owner, and produced diagnostic keys

#### Scenario: Declared but unmodeled external source refuses
- **WHEN** D2 rule metadata declares an exception path but D5 has no modeled external exception source for that rule
- **THEN** D5 publishes a baseline refusal with reason `unmodeled-external-exception`
- **AND** D7 emits a baseline contract diagnostic

#### Scenario: Unreadable external source refuses
- **WHEN** a modeled external exception source cannot be read
- **THEN** D5 publishes a baseline refusal with reason `external-exception-source-unreadable`
- **AND** D5 does not fall back to an empty projection

#### Scenario: Malformed external source refuses
- **WHEN** a modeled external exception source cannot be parsed, validated, or projected into sorted diagnostic keys
- **THEN** D5 publishes a baseline refusal with reason `external-exception-source-malformed`
- **AND** D5 requires a complete valid projection before accepting the source

#### Scenario: External projection mismatch refuses
- **WHEN** a rule reports parser-owned covered diagnostics for an external exception source
- **AND** those covered diagnostic keys do not exactly equal the D5 projected keys
- **THEN** D5 publishes a baseline refusal with reason `external-exception-projection-mismatch`
- **AND** D7 emits a baseline contract diagnostic unless the projection equality condition is complete

#### Scenario: Parser-owned explicit-baseline bypass refuses
- **WHEN** a rule using explicit Habitat baseline authority reports diagnostics already marked as covered
- **THEN** D5 publishes a baseline refusal with reason `parser-owned-baseline-without-contract`
- **AND** explicit Habitat baseline entries remain the only authority for covered debt

### Requirement: Baseline Integrity Is Shrink-Only

Baseline Authority SHALL compare current baseline entries against a trusted
comparison base. Existing-rule baselines MAY stay stable or shrink. Existing
rules SHALL NOT grow baseline entries unless a later accepted authority changes
the shrink-only policy.

#### Scenario: Stable or deleted baseline entries pass integrity
- **WHEN** a current explicit baseline has no diagnostic keys added relative to the comparison base
- **THEN** D5 publishes an accepted baseline-integrity result
- **AND** deleted entries are accepted as shrink-only progress

#### Scenario: Existing rule adds baseline entries and refuses
- **WHEN** a rule exists at the comparison base
- **AND** its current baseline file contains diagnostic keys absent from the comparison base baseline
- **THEN** D5 publishes a baseline-integrity refusal with reason `baseline-growth-existing-rule`
- **AND** the refusal names the rule id, baseline path, comparison base, and added diagnostic keys

#### Scenario: Comparison base unavailable refuses
- **WHEN** D5 cannot resolve the requested trusted comparison base
- **THEN** D5 publishes a baseline-integrity refusal with reason `comparison-base-unavailable`
- **AND** `--expand-baseline` refuses before writing any files

#### Scenario: Base rule registry missing refuses
- **WHEN** the trusted comparison base lacks a readable rule registry
- **THEN** D5 publishes a baseline-integrity refusal with reason `base-rule-registry-missing`
- **AND** `--expand-baseline` refuses before writing any files

#### Scenario: Base rule registry malformed refuses
- **WHEN** the trusted comparison base rule registry cannot be parsed as valid rule identity input
- **THEN** D5 publishes a baseline-integrity refusal with reason `base-rule-registry-malformed`
- **AND** `--expand-baseline` refuses before writing any files

#### Scenario: Base baseline unreadable refuses
- **WHEN** the trusted comparison base baseline for an explicit current baseline cannot be parsed
- **THEN** D5 publishes a baseline-integrity refusal with reason `base-baseline-unreadable`
- **AND** D5 does not treat the base baseline as empty by default

### Requirement: Rule Introduction Manifest Authorizes Seeded Baselines

Baseline Authority SHALL accept seeded baseline entries for an introduced rule
only when the rule is absent from the comparison base and a
`RuleIntroductionBaselineManifest` exactly matches the requested baseline write.

#### Scenario: New rule with exact manifest is accepted
- **WHEN** a rule is absent from the comparison base
- **AND** the current baseline adds diagnostic keys for that rule
- **AND** a rule-introduction manifest exactly matches rule id, owner project, owner tool, baseline path, sorted initial diagnostic keys, and comparison base
- **THEN** D5 publishes an accepted `BaselineExpansionDecision` for an introduced rule

#### Scenario: New rule without manifest refuses
- **WHEN** a rule is absent from the comparison base and has seeded baseline entries
- **AND** no rule-introduction manifest exists for that rule
- **THEN** D5 publishes a refusal with reason `rule-introduction-manifest-missing`

#### Scenario: Manifest mismatch refuses
- **WHEN** a rule-introduction manifest exists
- **AND** its rule id, baseline path, sorted initial diagnostic keys, owner fields, or comparison base do not match the requested write
- **THEN** D5 publishes a refusal with reason `rule-introduction-manifest-mismatch`

#### Scenario: Existing rule cannot use introduction manifest to grow debt
- **WHEN** a rule exists at the comparison base
- **AND** its current baseline adds diagnostic keys
- **THEN** D5 publishes `baseline-growth-existing-rule`
- **AND** a rule-introduction manifest does not override the existing-rule refusal

### Requirement: D5 Publishes Consumer Results Without Owning D7 Or D8

Baseline Authority SHALL publish bounded consumer results so downstream packets
do not inspect D5 internals or recreate D5 authority.

#### Scenario: D7 consumes baseline application result
- **WHEN** Structural Enforcement has rule diagnostics and D5 has resolved baseline authority
- **THEN** D7 consumes a D5 `BaselineApplicationResult`
- **AND** D7 owns report construction, status derivation, rendering, and enforcement pipeline staging
- **AND** D7 does not decide shrink-only integrity, manifest acceptance, or external exception projection

#### Scenario: D7 consumes baseline integrity result
- **WHEN** the built-in baseline-integrity rule is reported
- **THEN** D7 consumes a D5 `BaselineIntegrityResult`
- **AND** D7 renders D5 refusals as command diagnostics without redefining refusal reasons

#### Scenario: D8 consumes baseline authority projection
- **WHEN** Pattern Governance evaluates pattern lifecycle or admission
- **THEN** D8 consumes the D5-published baseline authority projection/refusal result
- **AND** D8 owns lifecycle/admission decisions
- **AND** D8 does not decide baseline acceptance, external projection validity, or shrink-only growth policy

#### Scenario: Public surface change waits for D0 row
- **WHEN** D5 implementation would change baseline JSON shape, command JSON, command messages, `--expand-baseline`, package exports, Pattern Authority baseline inputs, docs examples, or generated help/manifests
- **THEN** implementation cites a concrete D0 row
- **AND** the D0 compatibility handling is one of `preserve`, `version`, `facade`, `deprecate`, `refuse`, `document-only`, or `generated-only`
- **AND** source implementation stops if the concrete D0 row is missing
