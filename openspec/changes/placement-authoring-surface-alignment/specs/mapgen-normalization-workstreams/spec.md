## ADDED Requirements

### Requirement: Placement Uses Semantic Public Authoring Groups

The standard recipe placement stage SHALL expose semantic public authoring
groups rather than raw placement step ids, op ids, adapter/runtime inputs, or
op `{ strategy, config }` envelopes.

#### Scenario: Placement schema is inspected
- **WHEN** the standard recipe config schema is generated
- **THEN** `placement` exposes `knobs`, `naturalWonders`, `discoveries`,
  `floodplains`, and `resources`
- **AND** `placement` does not expose `derive-placement-inputs`,
  `plot-landmass-regions`, `place-natural-wonders`,
  `prepare-placement-surface`, `place-resources`, `assign-starts`,
  `place-discoveries`, `assign-advanced-starts`, terminal `placement`, raw
  `{ strategy, config }` envelopes, `candidateResourceTypes`, or start-sector
  override fields
- **AND** every Placement public field has a schema description
- **AND** every Placement public numeric leaf has `default`, `minimum`, and
  `maximum`

#### Scenario: Semantic public Placement config is compiled
- **WHEN** an author provides semantic Placement public groups
- **THEN** compile output maps them into the existing internal
  `derive-placement-inputs` op configs and product/effect step configs
- **AND** adapter-owned resource candidates and runtime map-size starts are not
  accepted as authored config
- **AND** compile/defaulting preserves legacy internal envelope defaults needed
  for deterministic equivalence
- **AND** execution reads adapter resource catalogs and runtime start data from
  placement step inputs
- **AND** natural wonder count derivation and empty product/effect step configs
  are supplied by compile/defaulting rather than accepted as authored config

### Requirement: Placement Migration Is Behavior-Equivalent For Shipped Configs

The Placement authoring-surface migration SHALL update first-party shipped map
configs in the same slice and SHALL prove the migrated configs compile to the
same internal Placement config as the prior raw-step/raw-envelope configs.

#### Scenario: Shipped configs are validated
- **WHEN** first-party shipped map config and preset validation tests run
- **THEN** every migrated shipped config validates against the standard recipe
  schema
- **AND** removed raw Placement step keys fail strict validation as unknown
  keys
- **AND** removed raw Placement op envelopes fail strict validation as unknown
  keys
- **AND** public Placement numeric controls outside their documented ranges fail
  strict validation

#### Scenario: Stable compiled configs are compared
- **WHEN** each migrated shipped map config is compiled with the same seed,
  dimensions, and latitude bounds as its pre-migration config
- **THEN** the stable serialized Placement compile output is equivalent
- **AND** any generated map artifact hash churn is attributed to persisted
  config shape changes, not claimed runtime behavior evidence

### Requirement: Studio Sees Only Intended Placement Public Fields

Studio schema/default consumers SHALL present the semantic Placement public
surface and SHALL not leak raw placement step/op/runtime internals.

#### Scenario: Studio default schema guard runs
- **WHEN** `apps/mapgen-studio` validates the generated standard recipe default
  config and schema
- **THEN** Placement default config validates
- **AND** Placement schema exposes only intended semantic public keys
- **AND** Placement controls used by Studio have schema descriptions and numeric
  bounds
- **AND** Studio keeps Placement runtime steps visible without focus paths
  pointing at removed raw internal authoring keys
