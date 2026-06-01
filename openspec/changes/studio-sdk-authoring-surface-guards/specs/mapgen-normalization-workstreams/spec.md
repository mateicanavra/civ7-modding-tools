## ADDED Requirements

### Requirement: Standard Authoring Surface Guards Cover All Stages

The standard recipe SHALL have cross-cutting tests that inspect every authored
stage and fail if a stage exposes raw step/op envelopes or falls back to
unreviewed internal-as-public authoring.

#### Scenario: Source stage authoring models are inspected
- **WHEN** the standard recipe source stages are inspected
- **THEN** every standard stage authoring model is `semantic-public-config`
- **AND** every stage public schema is strict
- **AND** no public schema exposes raw `{ strategy, config }` envelopes
- **AND** Studio focus paths resolve to public schema/default paths or are empty
- **AND** focus paths do not point to removed raw step/op envelope internals

### Requirement: Studio Artifacts Stay Aligned To Source Public Config

Studio generated schema/default/uiMeta artifacts SHALL remain aligned with the
standard recipe source public config surface.

#### Scenario: Generated Studio artifacts are inspected
- **WHEN** Studio imports the generated standard recipe schema, defaults,
  built-in presets, and UI metadata
- **THEN** the generated schema matches the source-derived standard recipe
  config schema
- **AND** the generated default config validates against that schema
- **AND** generated default config does not contain raw `{ strategy, config }`
  envelopes
- **AND** built-in standard map presets validate against the generated schema
- **AND** Studio catalog artifacts and runtime recipe entries use the same
  standard schema/default config objects

### Requirement: Generated Map Entry Points Use Canonical Public Config

Generated SDK-facing Swooper map entrypoints SHALL consume canonical public map
config envelopes and SHALL not inline raw authored, compiled, or generated-only
config shapes.

#### Scenario: Generated map entrypoints are inspected
- **WHEN** generated Swooper map entrypoint source files are inspected
- **THEN** each generated map imports its canonical source map config JSON
- **AND** each generated map passes
  `canonicalRecipeConfig<StandardRecipeConfig>(mapConfig)` to SDK `createMap`
- **AND** each generated map records `sourceConfigId`, `configHash`, and
  `envelopeHash`
- **AND** generated map entrypoints do not inline raw step/op envelopes or
  compiled config objects

### Requirement: Shipped Map Identity Tests Respect Public And Compiled Layers

Shipped map identity checks SHALL distinguish authored public config from
compiled internal stage/step/op config.

#### Scenario: Shipped map identity guard runs
- **WHEN** first-party shipped map configs are inspected
- **THEN** public configs are asserted on semantic public keys and raw-envelope
  absence
- **AND** internal strategy, threshold, and planner-output assertions are made
  against deterministic compiled config rather than persisted public config
