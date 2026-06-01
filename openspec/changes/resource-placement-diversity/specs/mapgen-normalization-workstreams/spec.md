## ADDED Requirements

### Requirement: Resource Placement Planner Distributes Candidate Resource Types

The transitional placement resource planner SHALL avoid collapsing numeric
resource assignments into a small adjacent subset when the adapter candidate
catalog contains more usable resource ids.

#### Scenario: Candidate pressure is uniform
- **WHEN** resource placement candidates have uniform environmental suitability
- **AND** the target placement count is greater than the candidate resource
  catalog size
- **THEN** `placement/plan-resources` uses every candidate resource id
- **AND** per-resource assignment counts differ by no more than one

#### Scenario: Preferred offset remains deterministic
- **WHEN** multiple resource ids have equal assignment counts
- **THEN** the planner chooses by forward circular distance from the tile's
  preferred environmental signature offset
- **AND** repeated runs with the same inputs produce the same placements

### Requirement: Resource Placement Diversity Does Not Claim Runtime Id Proof

The diversity repair SHALL keep runtime id proof and symbolic resource
materialization out of scope.

#### Scenario: Runtime proof remains separate
- **WHEN** resource type assignment becomes more diverse
- **THEN** the planner still consumes adapter-owned numeric resource candidates
- **AND** it does not claim `RESOURCE_*` symbolic ids are verified against
  runtime numeric ids
- **AND** final runtime proof still requires the FireTuner socket/API restart
  boundary and bounded scripting-log evidence
