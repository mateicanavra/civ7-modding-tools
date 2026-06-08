## ADDED Requirements

### Requirement: Initial Map Resource Authoring Uses Age Policy

The Swooper earthlike map generation pipeline SHALL derive initial-map resource
authoring eligibility from the official resource corpus before numeric resource
placement.

#### Scenario: Official corpus is classified
- **WHEN** the resource initial-map authoring policy is loaded
- **THEN** it contains one row per official resource corpus row
- **AND** each row records the official resource symbol, static resource row
  slot, valid ages, authoring age, status, and rationale
- **AND** the authoring age is `AGE_ANTIQUITY`

#### Scenario: Future-age resources are deferred from initial map authoring
- **WHEN** a resource is official-placeable but does not include
  `AGE_ANTIQUITY` in valid ages
- **THEN** its policy status is `deferred-future-age`
- **AND** it is absent from the initial-map resource id candidate set
- **AND** `RESOURCE_COAL`, `RESOURCE_OIL`, and `RESOURCE_RUBBER` are deferred

#### Scenario: Resource expectations expose the policy
- **WHEN** earthlike resource expectations are published
- **THEN** each expectation row includes initial-map authoring policy evidence
- **AND** future-age resources keep their corpus and physical expectation
  evidence visible

### Requirement: Resource Placement Cannot Stamp Deferred Resource IDs

Runtime-facing resource placement SHALL consume only initial-map eligible
resource ids and reject drift before mutating the Civ map.

#### Scenario: Placement input derivation filters adapter candidates
- **WHEN** the adapter returns the complete placeable resource id catalog
- **THEN** placement resource planning receives only ids eligible under the
  initial-map resource authoring policy

#### Scenario: Materialization guards fallback assignment
- **WHEN** a resource plan contains a candidate or preferred resource id whose
  policy status is not `eligible`
- **THEN** materialization fails before calling the adapter write path
- **AND** the error names the offending static id, resource symbol, and policy
  status

#### Scenario: Public config cannot override policy
- **WHEN** public placement config is compiled
- **THEN** there is no resource candidate id list in the public authoring
  surface or compiled default resource strategy config
