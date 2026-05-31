## ADDED Requirements

### Requirement: Foundation Uses Semantic Public Authoring Groups

The standard recipe Foundation stage SHALL expose semantic public authoring
groups rather than raw step ids, op ids, strategy selectors, or op `config`
envelopes.

#### Scenario: Foundation schema is inspected
- **WHEN** the standard recipe config schema is generated
- **THEN** `foundation` exposes `knobs`, `meshResolution`, `mantleSources`,
  `mantleForcing`, `lithosphere`, `platePartition`, `plateMotion`,
  `tectonicSegmentation`, `tectonicEras`, `tectonicFields`, and
  `tectonicRollups`
- **AND** the public Foundation schema does not expose `mesh`,
  `mantle-potential`, `mantle-forcing`, `crust`, `plate-graph`,
  `plate-motion`, `tectonics`, `crust-evolution`, `projection`, or
  `plate-topology`
- **AND** the public Foundation schema does not expose raw `{ strategy,
  config }` envelopes

#### Scenario: Semantic public Foundation config is compiled
- **WHEN** an author provides any semantic Foundation public group
- **THEN** compile output maps that group into the corresponding internal
  step/op config with the default strategy envelope expected by runtime steps
- **AND** projection remains defaulted internally
- **AND** omitted public groups continue to receive existing internal defaults

### Requirement: Foundation Migration Is Behavior-Equivalent For Shipped Configs

The Foundation authoring-surface migration SHALL update first-party shipped map
configs in the same slice and SHALL prove the migrated configs compile to the
same internal Foundation config as the prior raw-envelope configs.

#### Scenario: Shipped configs are validated
- **WHEN** first-party shipped map config and preset validation tests run
- **THEN** every migrated shipped config validates against the standard recipe
  schema
- **AND** removed raw Foundation step keys fail strict validation as unknown
  keys

#### Scenario: Stable compiled configs are compared
- **WHEN** each migrated shipped map config is compiled with the same seed,
  dimensions, and latitude bounds as its pre-migration config
- **THEN** the stable serialized Foundation compile output is equivalent
- **AND** any generated map artifact hash churn is attributed to persisted
  config shape changes, not claimed runtime behavior evidence

### Requirement: Studio Sees Only Intended Foundation Public Fields

Studio schema/default consumers SHALL present the semantic Foundation public
surface and SHALL not leak raw step/op internals.

#### Scenario: Studio default schema guard runs
- **WHEN** `apps/mapgen-studio` validates the generated standard recipe default
  config and schema
- **THEN** Foundation default config validates
- **AND** Foundation schema exposes only the intended semantic public keys
- **AND** Foundation leaf controls used by Studio have schema descriptions
