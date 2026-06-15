## ADDED Requirements

### Requirement: Runtime Config Merge Candidate Has Truthful Disposition

Habitat SHALL NOT register `habitat-grit-runtime-config-merge` as an active
Grit check until row-level records prove source-owner or baseline disposition
for current live candidates.

#### Scenario: Draft predicate proves syntax but current source has live candidates

- **WHEN** draft native Grit proof can detect `?? {}` and `Value.Default(...)`
  under the intended runtime step/domain-op predicate
- **AND** current-source inventory finds live current-predicate candidates
- **THEN** Habitat SHALL record the candidate as blocked from registration
- **AND** Habitat SHALL NOT add a `rules.json` entry, baseline file, injected
  probe, or active `.grit` pattern for that candidate without disposition

#### Scenario: Parser inventory is recorded for runtime config merges

- **WHEN** the row records parser inventory for runtime config merge/defaulting
  syntax
- **THEN** the record SHALL name scan roots, exclusions, current predicate,
  broader retired-stage context, candidate buckets, counts, row id, and
  non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live candidates SHALL be recorded as blocker/disposition inputs rather
  than clean row closure

### Requirement: Runtime Config Merge Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`habitat-grit-runtime-config-merge`.

#### Scenario: Candidate remains unregistered

- **WHEN** the candidate has live current-predicate findings and no baseline or
  remediation disposition
- **THEN** row records SHALL state that Habitat wrapper/current-tree proof, raw
  Grit acquisition, baseline behavior, injected cleanup/path-control, source
  remediation, apply safety, classify/generator behavior, retired parity,
  broader runtime-purity closure, and product/runtime proof are non-claims
- **AND** future work SHALL reopen the row only through source remediation,
  explicit baseline-debt proof, a narrowed architecture decision, or a separate
  safe apply/source-owner row
