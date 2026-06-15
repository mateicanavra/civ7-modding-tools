## ADDED Requirements

### Requirement: Domain Engine Imports Candidate Has Truthful Disposition

Habitat SHALL NOT register `habitat-grit-domain-engine-imports` as an active
Grit check until row-level records prove a safe predicate for domain-op engine
imports.

#### Scenario: Predicate attempts cannot safely separate value imports from type-only controls

- **WHEN** native Grit predicate attempts for domain-op engine imports
  false-positive pure type-only controls, reject required regex features, or
  fail to match positive samples
- **THEN** Habitat SHALL record the candidate as blocked rather than registering
  an unsafe rule
- **AND** Habitat SHALL NOT add a `rules.json` entry, baseline file, injected
  probe, or active `.grit` pattern for that candidate

#### Scenario: Parser inventory is recorded for current source

- **WHEN** the row records parser inventory for domain-op engine imports
- **THEN** the record SHALL name scan roots, exclusions, current predicate,
  candidate buckets, counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** zero current candidates SHALL NOT be treated as native Grit rule
  registration, wrapper proof, baseline proof, injected proof, apply safety, or
  product proof

### Requirement: Domain Engine Import Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`habitat-grit-domain-engine-imports`.

#### Scenario: Candidate remains unregistered

- **WHEN** the candidate has no safe active Grit predicate
- **THEN** row records SHALL state that native positive fixture proof, Habitat
  wrapper/current-tree proof, raw Grit acquisition, baseline behavior, injected
  cleanup/path-control, apply safety, classify/generator behavior, retired
  parity, broader domain-refactor closure, and product/runtime proof are
  non-claims
- **AND** future work SHALL reopen the row only through a safe native predicate,
  a parser-backed check owner decision, or an explicit architecture decision
  that changes the type-only import policy
