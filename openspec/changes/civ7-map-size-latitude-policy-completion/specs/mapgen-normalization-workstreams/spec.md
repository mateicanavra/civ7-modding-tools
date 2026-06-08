## ADDED Requirements

### Requirement: Map Size Latitude Policy Is Verified From Live Row Evidence

Map-size latitude policy repairs SHALL be based on live row-latitude evidence
for the affected size and SHALL preserve already verified Standard and Huge
behavior.

#### Scenario: Latitude mismatch is found
- **WHEN** final-surface parity finds a map-size latitude mismatch
- **THEN** the workstream extracts live row-latitude facts for that size
- **AND** it records Standard and Huge behavior as non-regression constraints

#### Scenario: Repair assumes interpolation without evidence
- **WHEN** a proposed repair depends on interpolated latitude behavior without
  live row evidence
- **THEN** review rejects the repair before implementation
