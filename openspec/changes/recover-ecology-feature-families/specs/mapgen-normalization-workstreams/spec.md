## ADDED Requirements

### Requirement: Ecology Vegetation Families Remain Distinct Product Outcomes

Ecology vegetation scoring and planning SHALL preserve distinct habitat
outcomes for forest, rainforest, taiga, savanna woodland, and sagebrush steppe
instead of collapsing all visible vegetation into the highest generic score.

#### Scenario: A cold forest habitat is evaluated
- **WHEN** taiga suitability is scored for cold land with enough moisture and
  biomass to support boreal cover
- **THEN** cold evidence is not counted as both required habitat and a
  duplicate penalty that erases the score
- **AND** the score can exceed the owning taiga planner admission policy

#### Scenario: A dry shrub-steppe habitat is evaluated
- **WHEN** sagebrush steppe suitability is scored for semiarid, well-drained
  land with low-to-moderate biomass
- **THEN** aridity evidence is not counted as both required habitat and a
  duplicate penalty that erases the score
- **AND** the score can exceed the owning sagebrush planner admission policy

#### Scenario: Vegetation feature intents are selected
- **WHEN** the vegetation planner evaluates forest, rainforest, taiga, savanna
  woodland, and sagebrush candidates for a tile
- **THEN** each candidate is filtered by its own owner-local admission policy
- **AND** selection remains deterministic among admitted physical candidates
- **AND** the planner does not emit fallback, quota, alias, or generic
  vegetation placements

#### Scenario: Shipped map identities are tested
- **WHEN** shipped map configs and presets run through the standard recipe
- **THEN** world-balance tests assert required vegetation-family presence and
  density bands by map identity across seeds
- **AND** aggregate vegetation counts alone are insufficient proof
