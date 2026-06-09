## ADDED Requirements

### Requirement: River And Lake Workstreams Preserve Proof Classes

River and lake recovery workstreams SHALL NOT collapse hydrology truth,
projection plans, engine terrain readback, Civ river metadata, Studio display,
in-game rendered visibility, and product acceptance into one proof claim.

#### Scenario: A river or lake claim is closed
- **WHEN** a river or lake workstream closes a claim
- **THEN** it names the exact proof class being closed
- **AND** it names all adjacent proof classes that remain open or out of scope
- **AND** product-visible closure remains blocked until same-run Studio evidence,
  live Civ readback, rendered in-game evidence, and reviewer disposition agree

#### Scenario: Terrain readback succeeds but metadata diverges
- **WHEN** live `TERRAIN_NAVIGABLE_RIVER` readback matches projected terrain but
  `GameplayMap.getRiverType`, `isRiver`, or `isNavigableRiver` reports no river
- **THEN** the workstream MAY close terrain-row materialization
- **AND** it MUST keep Civ river metadata and gameplay-river semantics open

### Requirement: Adversarial River Planning Precedes Execution

River and lake execution SHALL start from adversarially reviewed OpenSpec slices
that name architecture owners, DX outcomes, proof oracles, and closure blockers.

#### Scenario: Execution goal starts
- **WHEN** an agent starts implementing the full river/lake recovery
- **THEN** it follows the standalone OpenSpec change set produced by this design
- **AND** it does not mark the product goal complete until every accepted P1/P2
  finding is repaired, rejected with evidence, or explicitly moved out of scope
