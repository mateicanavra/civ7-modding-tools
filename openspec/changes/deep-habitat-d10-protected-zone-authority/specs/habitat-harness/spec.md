## ADDED Requirements

### Requirement: D10 Protected Zone Authority Is Resolved Before Implementation

Habitat protected-zone decisions SHALL come from explicit generic or host-policy declarations and SHALL refuse unauthorized edits before check, hook, or apply workflows mutate or bless protected files.

#### Scenario: Unauthorized edit touches protected zone
- **WHEN** a check, hook, or apply workflow sees an undeclared edit to a protected surface
- **THEN** Habitat reports a guard refusal with owner and recovery guidance

#### Scenario: Authorized generator owns zone
- **WHEN** a declared generator updates its generated surface
- **THEN** Habitat identifies the owner and does not treat the generated write as a user edit
