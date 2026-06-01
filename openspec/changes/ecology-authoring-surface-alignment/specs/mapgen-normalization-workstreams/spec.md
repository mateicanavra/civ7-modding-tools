## ADDED Requirements

### Requirement: Ecology Uses Semantic Public Authoring Groups

The standard recipe Ecology truth stages SHALL expose semantic public authoring
groups rather than raw step ids, op ids, strategy selectors, op `config`
envelopes, or engine selector identifiers.

#### Scenario: Ecology schema is inspected
- **WHEN** the standard recipe config schema is generated
- **THEN** `ecology-pedology` exposes `knobs`, `soilClassification`,
  `resourceBasinPlanning`, and `resourceBasinScoring`
- **AND** `ecology-biomes` exposes `knobs` and `biomeClassification`
- **AND** `ecology-features` exposes `knobs`, `substrateScoring`,
  `wetlandScoring`, `reefScoring`, `iceScoring`, `icePlanning`,
  `reefPlanning`, `wetlandPlanning`, `vegetationPlanning`,
  `plotEffectScoring`, and `plotEffectCoverage`
- **AND** Ecology public schemas do not expose `pedology`, `resource-basins`,
  `biomes`, `score-layers`, `plan-ice`, `plan-reefs`, `plan-wetlands`,
  `plan-vegetation`, `plan-plot-effects`, raw `{ strategy, config }`
  envelopes, stale public strategy selectors, or plot-effect selector fields
- **AND** every Ecology public field has a schema description
- **AND** every Ecology public numeric leaf has both `minimum` and `maximum`

#### Scenario: Semantic public Ecology config is compiled
- **WHEN** an author provides any semantic Ecology public group
- **THEN** compile output maps that group into the corresponding internal
  step/op config with the selected default or profile-specific strategy envelope
  expected by runtime steps
- **AND** omitted public groups continue to receive existing internal defaults
- **AND** plot-effect selector identifiers are injected by compile rather than
  accepted as authored config

### Requirement: Ecology Migration Is Behavior-Equivalent For Shipped Configs

The Ecology authoring-surface migration SHALL update first-party shipped map
configs in the same slice and SHALL prove the migrated configs compile to the
same internal Ecology config as the prior raw-envelope configs.

#### Scenario: Shipped configs are validated
- **WHEN** first-party shipped map config and preset validation tests run
- **THEN** every migrated shipped config validates against the standard recipe
  schema
- **AND** removed raw Ecology step keys fail strict validation as unknown keys
- **AND** stale authored Ecology strategy selectors fail strict validation as
  unknown keys
- **AND** authored plot-effect selector fields fail strict validation as unknown
  keys

#### Scenario: Stable compiled configs are compared
- **WHEN** each migrated shipped map config is compiled with the same seed,
  dimensions, and latitude bounds as its pre-migration config
- **THEN** the stable serialized Ecology compile output is equivalent
- **AND** any generated map artifact hash churn is attributed to persisted
  config shape changes, not claimed runtime behavior evidence

### Requirement: Studio Sees Only Intended Ecology Public Fields

Studio schema/default consumers SHALL present the semantic Ecology public surface
and SHALL not leak raw step/op internals.

#### Scenario: Studio default schema guard runs
- **WHEN** `apps/mapgen-studio` validates the generated standard recipe default
  config and schema
- **THEN** Ecology default config validates
- **AND** Ecology schema exposes only the intended semantic public keys
- **AND** Ecology leaf controls used by Studio have schema descriptions and
  numeric bounds
- **AND** the legacy Studio source default helper uses semantic Ecology keys and
  no top-level `ecology` raw-envelope helper
- **AND** Studio keeps Ecology runtime steps visible without focus paths pointing
  at removed raw internal authoring keys
