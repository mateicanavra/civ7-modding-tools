## ADDED Requirements

### Requirement: Hydrology Uses Semantic Public Authoring Groups

The standard recipe Hydrology stages SHALL expose semantic public authoring
groups rather than raw step ids, op ids, strategy selectors, or op `config`
envelopes.

#### Scenario: Hydrology schema is inspected
- **WHEN** the standard recipe config schema is generated
- **THEN** `hydrology-climate-baseline` exposes `knobs`, `seasonalCycle`,
  `solarForcing`, `thermalState`, `atmosphericCirculation`, `oceanCurrents`,
  `oceanGeometry`, `oceanThermalState`, `evaporation`, `moistureTransport`,
  and `precipitation`
- **AND** `hydrology-hydrography` exposes `knobs`, `runoff`,
  `riverNetwork`, and `lakes`
- **AND** `hydrology-climate-refine` exposes `knobs`,
  `precipitationRefinement`, `solarForcing`, `thermalState`,
  `albedoFeedback`, `cryosphereState`, `landWaterBudget`, and `diagnostics`
- **AND** Hydrology public schemas do not expose `climate-baseline`,
  `rivers`, `climate-refine`, legacy nested `lakes.planLakes` wrappers, raw
  `{ strategy, config }` envelopes, or stale public strategy selectors
- **AND** every Hydrology public field has a schema description
- **AND** every Hydrology public numeric leaf has both `minimum` and `maximum`

#### Scenario: Semantic public Hydrology config is compiled
- **WHEN** an author provides any semantic Hydrology public group
- **THEN** compile output maps that group into the corresponding internal
  step/op config with the selected default or refine strategy envelope expected
  by runtime steps
- **AND** omitted public groups continue to receive existing internal defaults

### Requirement: Hydrology Migration Is Behavior-Equivalent For Shipped Configs

The Hydrology authoring-surface migration SHALL update first-party shipped map
configs in the same slice and SHALL prove the migrated configs compile to the
same internal Hydrology config as the prior raw-envelope configs.

#### Scenario: Shipped configs are validated
- **WHEN** first-party shipped map config and preset validation tests run
- **THEN** every migrated shipped config validates against the standard recipe
  schema
- **AND** removed raw Hydrology step keys fail strict validation as unknown keys
- **AND** removed nested Hydrology op wrappers such as `lakes.planLakes` fail
  strict validation as unknown keys
- **AND** stale authored Hydrology strategy selectors fail strict validation as
  unknown keys

#### Scenario: Stable compiled configs are compared
- **WHEN** each migrated shipped map config is compiled with the same seed,
  dimensions, and latitude bounds as its pre-migration config
- **THEN** the stable serialized Hydrology compile output is equivalent
- **AND** any generated map artifact hash churn is attributed to persisted
  config shape changes, not claimed runtime behavior evidence

### Requirement: Studio Sees Only Intended Hydrology Public Fields

Studio schema/default consumers SHALL present the semantic Hydrology public
surface and SHALL not leak raw step/op internals.

#### Scenario: Studio default schema guard runs
- **WHEN** `apps/mapgen-studio` validates the generated standard recipe default
  config and schema
- **THEN** Hydrology default config validates
- **AND** Hydrology schema exposes only the intended semantic public keys
- **AND** Hydrology leaf controls used by Studio have schema descriptions and
  numeric bounds
- **AND** Studio focus paths still point at executable runtime steps even
  though public config keys are semantic
