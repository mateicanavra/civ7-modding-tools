## ADDED Requirements

### Requirement: Resource Stamping Runs After Starts And The Support Pass (D3 Contract Change)

The placement stage SHALL order its resource product as
plan → starts → support-adjust → stamp, carried by the effect chain
`resourcesPlanned → startsAssigned → resourcesAdjusted → resourcesPlaced`.
Resource planning SHALL remain after `surfacePrepared` (it reads the
prepared engine surface for policy legality); resource stamping SHALL
consume the ADJUSTED intent set and remain the last resource authority
point. Post-stamp mutation of resources is rejected: no step may alter
stamped resources, and any start-aware correction happens on the plan
before stamping. `assign-starts` SHALL consume the resource PLAN
(`plannedResourcePlotIndices` from the site intents) for its
resource-support scoring term — placed outcomes do not exist at start time.

#### Scenario: The effect chain serializes the reorder
- **WHEN** the standard recipe compiles
- **THEN** plan-resources provides `resourcesPlanned`, assign-starts
  requires it and provides `startsAssigned`, adjust-resources requires
  `startsAssigned` and provides `resourcesAdjusted`, place-resources
  requires `resourcesAdjusted` (plus `surfacePrepared`) and provides
  `resourcesPlaced`, and place-discoveries requires `resourcesPlaced`

#### Scenario: Starts stamp before resources on the engine
- **WHEN** the recipe runs against an adapter recording call order
- **THEN** every `setStartPosition` call precedes the first
  `placeResourceIntent` call

### Requirement: A Bounded Support Pass Guarantees Per-Start Resource Support And Equity

The `resources/adjust-resource-support` operation SHALL adjust the resource
plan so every seated start has at least `supportFloor` planned sites within
`supportRadiusTiles` (default 2 within 4, E3.1) and the cross-player
support-count gap is at most `equityTolerance` (default 2, E3.2), as a
bounded pass that moves or adds the minimum number of sites. Moves SHALL be
preferred over adds (count-preserving); adds SHALL stay within the type's
authored maxCount. Every destination SHALL satisfy the S3 plan invariants:
per-resource policy-table legality, per-type same-type spacing floors,
cross-type adjacency clearance, affinity/exclusion rules, the per-landmass
equity ceiling, and the region-minimum guard for cross-region moves.
Adjustments that cannot be made without violating an invariant SHALL be
recorded as typed shortfalls, never forced. The knob surface
(`enabled`, `supportFloor`, `supportRadiusTiles`, `equityTolerance`,
`strength`) SHALL be derived from the op schema with declared ranges, and
Earth-like defaults SHALL reproduce the E3 gates.

#### Scenario: The guarantee holds across the seed window
- **WHEN** the metrics harness runs the 20-seed standard window at defaults
- **THEN** every seed has zero starts below the floor and a max−min support
  gap of at most 2 (E3.3: 20/20)

#### Scenario: Invariants beat the floor
- **WHEN** no legal, spacing-valid, non-excluded destination exists within a
  start's radius and no type has maxCount headroom
- **THEN** the plan is left untouched for that unit and a typed shortfall
  (seatIndex, reason, missing) is recorded and surfaced as a warning

#### Scenario: Disabled is pass-through, not silent
- **WHEN** the pass runs with `enabled: false`
- **THEN** the adjusted plan equals the input plan and unmet floors are
  recorded as `adjustment-disabled` shortfalls

### Requirement: Adjusted Plans Carry Typed Support Provenance Into Artifacts And Outcomes

The adjusted plan SHALL be published once as a validated artifact carrying
the full adjusted intent set, every adjustment (`action: move|add`,
`reason: support-floor|support-equity`, the seat it serves, source plot for
moves), per-start support before/after, the equity gap before/after, and
typed shortfalls. Adjusted intents SHALL carry per-site provenance
(`support` field; additions use the `support` planning phase). The stamped
outcomes SHALL surface the provenance additively:
`reconciliation.byPhase.support` and `supportAdjustedPlacedCount`.

#### Scenario: Provenance joins plan to outcomes
- **WHEN** the support pass moves or adds sites and the stamp succeeds
- **THEN** each adjustment row maps onto exactly one adjusted intent with
  matching provenance, and `supportAdjustedPlacedCount` in the outcomes
  equals the number of placed support-adjusted intents

#### Scenario: The validate hook rejects incoherent adjustments
- **WHEN** an adjusted plan is published with a support-phase intent lacking
  add provenance, duplicate plots, or adjustment counts that disagree with
  moveCount/addCount
- **THEN** artifact validation fails with named issues
