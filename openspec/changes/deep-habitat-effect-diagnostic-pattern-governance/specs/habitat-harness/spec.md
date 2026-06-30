## ADDED Requirements

### Requirement: Diagnostic Pattern Governance Owns Pattern Metadata And Outcomes

Habitat SHALL move diagnostic catalog and pattern governance decisions into
domain services that consume Grit provider evidence without reimplementing
Grit semantics.

#### Scenario: Pattern diagnostic outcomes are assembled

- **WHEN** a Grit-backed diagnostic outcome is projected into Habitat data
- **THEN** the diagnostic catalog domain owns Habitat outcome classification
- **AND** the Grit provider owns raw command execution, parser status, and
  pattern-output evidence

#### Scenario: Pattern admission is evaluated

- **WHEN** active or candidate pattern metadata is evaluated
- **THEN** pattern governance owns duplicate ids, manifests, admission states,
  and rule references
- **AND** `.habitat` authored authority data boundaries remain enforced
