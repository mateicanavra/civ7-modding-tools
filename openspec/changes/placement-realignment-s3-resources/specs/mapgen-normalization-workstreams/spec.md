## ADDED Requirements

### Requirement: Resource Planning Is Owned By domain/resources And Happens Within Policy

Resource planning SHALL be performed by `domain/resources` operations
(family demand planners → habitat-field derivation → site selection) invoked
from a dedicated placement planning step, with per-resource policy legality
(generated `Resource_ValidPlacements` rows) and official distribution facts
(Weight, MinimumPerHemisphere, required-for-age,
MapResourceMinimumAmountModifier) applied BEFORE site selection. Symbolic
resource ids SHALL be proven against the generated policy tables before any
numeric id is planned; unresolvable ids SHALL hard-fail.

#### Scenario: Demand rows carry proven runtime ids
- **WHEN** the plan-resources step builds demand rows for site selection
- **THEN** every row's `resourceTypeId` equals the corpus static slot, the
  V0 `resourceTypes` index, and the V1 `resourceRows` entry for the same
  symbol, and the demand plan artifact records `runtimeIdResolution.status`
  `"verified"`

#### Scenario: Unresolvable ids refuse to plan
- **WHEN** any corpus symbol disagrees with the policy tables
- **THEN** resolution throws naming every divergent type instead of planning
  with a guessed id

#### Scenario: Plans stay within policy legality
- **WHEN** site selection emits intents on the mock policy surface
- **THEN** every intent's plot satisfies the static `canHaveResource`
  emulation for its type (preferred-legality rate 1.0 in the metrics
  harness)

### Requirement: Habitat Lanes Drive Resource Placement Including Marine Lanes

A `derive-habitat-fields` operation SHALL derive every habitat lane mask the
family planners declare — including marine/aquatic lanes so water resources
are plannable — plus per-family intensity fields, from pipeline artifacts
only. Placed resources SHALL sit inside their type's habitat lane at ≥ 90%
on the Earth-like baseline map.

#### Scenario: Marine resources place on water
- **WHEN** the standard recipe runs on a map with coast
- **THEN** aquatic-lane intents exist and marine placements are > 0

#### Scenario: Habitat fidelity holds
- **WHEN** the metrics harness computes E2.3 over stable seeds
- **THEN** the placed in-lane share is ≥ 0.9 on the Earth-like baseline

### Requirement: Site Selection Implements Official Deficit-Rotation And Range Semantics

The `select-resource-sites` operation SHALL emit typed per-plot intents from
a deterministic blue-noise site stream thinned by habitat intensity, with:
the official weight deficit rotation at co-eligible sites (frequency ∝
1/Weight), per-type spacing floors that never decay, per-type counts clamped
to the authored expectedCountRange with typed shortfalls when unreachable, an
official region-minimum force pass (per landmass-region, required-for-age
gated), a per-landmass equity ceiling, and resource-resource
affinity/exclusion rules.

#### Scenario: Co-eligible rotation stratifies by weight
- **WHEN** a fully co-eligible pool with distinct Weights competes for scarce
  sites
- **THEN** rotation counts decrease strictly as Weight increases
  (Spearman ≤ −0.7)

#### Scenario: Floors never decay
- **WHEN** a type's minimum count cannot fit under its spacing floor
- **THEN** the floor holds and the deficit is recorded as a typed shortfall

#### Scenario: Sparsity and exclusion are expressible
- **WHEN** the sparsity knob is at max and an exclusion rule is configured
- **THEN** planned counts pin to the range minimums and no excluded pair
  co-occurs within the rule radius

### Requirement: Resource Materialization Is A Thin Typed-Reconcile Shell

The place-resources step SHALL stamp plan intents verbatim and reconcile
engine legality with typed outcomes only: engine rejections are recorded as
per-type shortfalls with reasons; the planned type at the planned plot is
never re-decided, relocated, or rebalanced; wrong-type readback remains
fail-hard; the resource plan, demand plan, and placement outcomes artifacts
register validate hooks.

#### Scenario: Oracle rejection produces typed shortfalls, not fallback
- **WHEN** the engine oracle rejects every planned intent
- **THEN** the run completes with placedCount 0, every outcome rejected with
  a named reason, recorded reconciliation shortfalls, and zero official
  generator or relocation calls

#### Scenario: Stamp respects plan authority
- **WHEN** placement outcomes are published
- **THEN** every outcome's plot and type equal the plan intent at that plot
  (harness reassignment rate 0)
