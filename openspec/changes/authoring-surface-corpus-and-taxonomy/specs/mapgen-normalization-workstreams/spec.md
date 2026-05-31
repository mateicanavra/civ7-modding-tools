## ADDED Requirements

### Requirement: Standard Recipe Authoring Surface Corpus Is Complete

The standard recipe authoring-surface cleanup train SHALL begin from a
repeatable corpus ledger generated from current recipe/stage/schema objects
rather than from hand-copied schema fragments.

#### Scenario: Corpus ledger is generated
- **WHEN** the standard recipe authoring surface ledger command is run
- **THEN** it enumerates every standard recipe stage and step
- **AND** it records stage knobs, public schemas, internal-as-public step
  schemas, op envelopes, strategy sets, generated artifact owners, shipped
  configs and presets, Studio focus-path consumers, and runtime read sites

#### Scenario: Author-facing fields are classified
- **WHEN** the ledger walks stage surface schemas
- **THEN** every author-facing schema row is classified as `knob`, `public`,
  `internal-as-public`, or `internal-envelope`
- **AND** each row records defaults, bounds or enums, description quality,
  compile target, strategy reachability, and output impact

### Requirement: Cleanup Buckets Drive Slice Design

The standard recipe authoring-surface cleanup train SHALL classify defects into
explicit issue buckets and choose one solution type per bucket before editing
stage behavior.

#### Scenario: A raw public envelope is found
- **WHEN** a public stage schema exposes raw step/op envelope structure
- **THEN** the issue is classified as internal parameter leakage
- **AND** the next behavior slice must convert it to semantic public config
  plus compile output, move it internal, or explicitly defer it with authority
  and proof

#### Scenario: A transitional internal-as-public surface is found
- **WHEN** a stage has no public schema and exposes step/op config directly
- **THEN** the issue is classified separately from public leakage
- **AND** the cleanup slice must keep it as accepted low-level step-key
  authoring only when each exposed field is gameplay/execution meaningful,
  documented, bounded where numeric, and not private runtime/projection
  plumbing
- **AND** otherwise the cleanup slice must collapse it into semantic
  knobs/profiles or move it internal

### Requirement: Downstream Cleanup Preserves Flat Stage Shape

Downstream cleanup slices SHALL preserve the flat stage config shape and avoid
persisted advanced/internal wrappers, dual shapes, generated-output hand edits,
compatibility shims, or broad public exports.

#### Scenario: A stage surface is cleaned
- **WHEN** a downstream slice changes a standard stage authoring surface
- **THEN** default persisted config remains `{ knobs?, [stepId]?: stepConfig }`
- **AND** flat public-key config `{ knobs?, [publicKey]?: publicConfig }` is
  used only when the slice records a genuine public+compile transform decision,
  public keys, internal step keys, and reason
- **AND** public fields compile deterministically into internal stage/step/op
  config before runtime execution

#### Scenario: A public field is removed or renamed
- **WHEN** a downstream slice removes or renames an author-facing field
- **THEN** shipped configs, presets, generated schema/default/uiMeta artifacts,
  and Studio consumers are migrated or proved in the same behavior slice
- **AND** strict validation fails unknown old keys with clear errors
