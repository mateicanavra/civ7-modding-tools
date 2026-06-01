## ADDED Requirements

### Requirement: Flat Config Migration Owns All Persisted Consumers

The D1 config-surface change SHALL migrate all first-party persisted config
consumers to `{ knobs?, [stepId]?: stepConfig }` in the same change that
removes wrapper-only stage compiles.

#### Scenario: Wrapper-only compile is removed
- **WHEN** a standard stage deletes a `public.advanced` wrapper that only
  unwraps step config
- **THEN** first-party map configs, presets, tests, Studio config readers, and
  examples that targeted that wrapper are migrated to top-level step IDs
- **AND** no dual persisted config shape is introduced

### Requirement: Genuine Public Transforms Remain Explicit

The D1 migration SHALL preserve explicit `public + compile` stages only when
the public surface is a genuine transform rather than an `advanced` passthrough.

#### Scenario: A stage keeps public compile
- **WHEN** a standard stage keeps `public + compile`
- **THEN** the design records the public keys, internal step keys, and reason
  the transform is product-visible
- **AND** the stage is excluded from G9 wrapper-only enforcement

### Requirement: Flat Schema Feasibility Is Dispositioned

The D1 migration SHALL disposition every flat step-key schema that cannot be
derived from declared stage steps in the same slice.

#### Scenario: A flat step key remains late-validated
- **WHEN** a flat stage config key cannot be schema-derived during D1
- **THEN** the implementation records the reason and the remaining runtime
  validation gate
- **AND** tests still prove the flat persisted config behavior
