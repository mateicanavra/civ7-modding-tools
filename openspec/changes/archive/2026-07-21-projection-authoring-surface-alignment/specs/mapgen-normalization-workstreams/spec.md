## ADDED Requirements

### Requirement: Projection Uses Semantic Public Authoring Groups

The standard recipe projection stages SHALL expose semantic public authoring
groups rather than raw runtime step ids, op ids, diagnostic toggles, or op
`config` envelopes.

#### Scenario: Projection schema is inspected
- **WHEN** the standard recipe config schema is generated
- **THEN** `map-morphology` exposes `knobs`
- **AND** `map-hydrology` exposes `knobs`
- **AND** `map-elevation` exposes `knobs`
- **AND** `map-rivers` exposes `knobs` and `riverProjection`
- **AND** `map-ecology` exposes `knobs` and `biomeBindings`
- **AND** Projection public schemas do not expose `plot-coasts`,
  `plot-continents`, `plot-mountains`, `plot-volcanoes`, `lakes`,
  `build-elevation`, `plot-rivers`, `plot-biomes`, `features-apply`,
  `plot-effects`, or raw `{ strategy, config }` envelopes
- **AND** every Projection public field has a schema description
- **AND** every Projection public numeric leaf has both `minimum` and `maximum`
- **AND** every Projection public string selector is enum/literal bounded

#### Scenario: Semantic public Projection config is compiled
- **WHEN** an author provides any semantic Projection public group
- **THEN** compile output maps that group into the corresponding internal
  runtime step/op config expected by projection steps
- **AND** omitted public groups continue to receive existing internal defaults
- **AND** lake readback, feature-apply guard config, and plot-effect application
  are injected by compile/defaulting rather than accepted as authored config

### Requirement: Projection Migration Is Behavior-Equivalent For Shipped Configs

The Projection authoring-surface migration SHALL update first-party shipped map
configs in the same slice and SHALL prove the migrated configs compile to the
same internal Projection config as the prior raw-step/raw-envelope configs.

#### Scenario: Shipped configs are validated
- **WHEN** first-party shipped map config and preset validation tests run
- **THEN** every migrated shipped config validates against the standard recipe
  schema
- **AND** removed raw Projection step keys fail strict validation as unknown keys
- **AND** removed raw Projection op envelopes fail strict validation as unknown
  keys
- **AND** invalid authored biome globals fail strict validation
- **AND** non-`BIOME_MARINE` marine bindings fail strict validation

#### Scenario: Stable compiled configs are compared
- **WHEN** each migrated shipped map config is compiled with the same seed,
  dimensions, and latitude bounds as its pre-migration config
- **THEN** the stable serialized Projection compile output is equivalent
- **AND** any generated map artifact hash churn is attributed to persisted
  config shape changes, not claimed runtime behavior evidence

### Requirement: Studio Sees Only Intended Projection Public Fields

Studio schema/default consumers SHALL present the semantic Projection public
surface and SHALL not leak raw runtime step/op internals.

#### Scenario: Studio default schema guard runs
- **WHEN** `apps/mapgen-studio` validates the generated standard recipe default
  config and schema
- **THEN** Projection default config validates
- **AND** Projection schema exposes only the intended semantic public keys
- **AND** Projection leaf controls used by Studio have schema descriptions,
  numeric bounds, and enum/literal bounds where applicable
- **AND** Studio keeps Projection runtime steps visible without focus paths
  pointing at removed raw internal authoring keys
