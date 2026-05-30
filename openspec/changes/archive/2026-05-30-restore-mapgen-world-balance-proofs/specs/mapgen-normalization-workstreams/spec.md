## ADDED Requirements

### Requirement: Shipped Map World Balance Is Measured

The MapGen normalization workstream SHALL verify shipped map identities through
full standard-recipe world-balance stats that measure product-visible geography
rather than isolated implementation details.

#### Scenario: A shipped map config is generated

- **WHEN** a shipped map identity is run through the public standard recipe and runtime
- **THEN** the resulting stats include pre-lake land, projected water, planned
  lake tiles, wetland tiles, reef-family tiles, and feature counts
- **AND** tests assert ratios or presence properties appropriate to the map
  identity instead of exact tile counts

#### Scenario: Lakes are planned

- **WHEN** Hydrology converts routing sinks into lake intent
- **THEN** sink tiles are admitted by accumulated discharge and an explicit
  lakeiness budget
- **AND** `map-hydrology` only projects the Hydrology lake plan and records
  engine acceptance or drift

#### Scenario: Ecology feature scores become visible features

- **WHEN** reef, wetland, vegetation, or ice planners convert score layers into
  feature intents
- **THEN** the score-to-intent policy is owned by the feature-family planner
- **AND** configs may tune family-local admission policy for shipped map identity
- **AND** feature-specific habitat physics remain in the owning score op or
  strategy rather than a generic shared planner bucket

#### Scenario: Hydrology artifacts are validated

- **WHEN** Hydrology publishes climate or hydrography artifacts
- **THEN** runtime typed-array/size validation is owned by the producing step
  publication boundary or by generic MapGen-core artifact machinery
- **AND** stage artifact registries remain schema/contract surfaces unless a
  categorical artifact-module architecture is introduced for all in-kind stages
- **AND** broad domain helper buckets do not become the default owner for
  unrelated artifact payload validation

#### Scenario: Engine sea-level behavior is investigated

- **WHEN** official resources expose only schema/UI sea-level artifacts without
  active map-script usage or adapter API
- **THEN** MapGen does not add a compatibility layer or dedicated sea-level
  OpenSpec change
- **AND** MapGen `seaLevel` remains morphology truth while water-fill mismatch
  remains projection/readback evidence
