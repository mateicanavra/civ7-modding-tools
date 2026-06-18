## ADDED Requirements

### Requirement: D8 Pattern Governance Is Resolved Before Implementation

Habitat Pattern Governance SHALL define explicit candidate, reviewed, registered, refused, and retired states before a generated or cataloged pattern can affect enforcement.

#### Scenario: Candidate pattern is generated
- **WHEN** a pattern generator creates a draft
- **THEN** Habitat marks it as non-enforcing until Pattern Authority admits it

#### Scenario: Pattern is registered
- **WHEN** Pattern Authority accepts a pattern
- **THEN** the registry records lifecycle state, owner, diagnostic relation, and baseline policy before enforcement consumes it
