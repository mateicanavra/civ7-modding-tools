## ADDED Requirements

### Requirement: SDK MapGen Entrypoint Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-sdk-mapgen-entrypoint` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, broader
SDK/mapgen architecture closure, apply safety, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter sdk_mapgen_entrypoint --json` exits 0
- **THEN** Habitat records native fixture proof for `sdk_mapgen_entrypoint`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, generator/migration,
  broader SDK/mapgen architecture proof, neighboring row proof, or product
  proof from that command

#### Scenario: SDK and mapgen-core parser inventory is recorded

- **WHEN** the row records parser inventory for SDK and mapgen-core source
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: SDK Root Does Not Reintroduce MapGen Runtime Entrypoint

The SDK root SHALL avoid importing or value-exporting the SDK mapgen runtime
entrypoint under the current `grit-sdk-mapgen-entrypoint` predicate.

#### Scenario: SDK root exports the mapgen runtime subpath

- **WHEN** `packages/sdk/src/index.ts` value-exports from `./mapgen` or
  `./mapgen/index.js`, including export-star, named value re-export, or mixed
  value+type named re-export forms
- **THEN** `grit-sdk-mapgen-entrypoint` SHALL report the export
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: SDK root type-only re-exports the mapgen runtime subpath

- **WHEN** `packages/sdk/src/index.ts` type-only re-exports from `./mapgen` or
  `./mapgen/index.js` using `export type { ... }` or the fixture-proven
  single-line `export { type ... }` form
- **THEN** `grit-sdk-mapgen-entrypoint` SHALL classify that usage as type-only
  non-runtime control context rather than a named value re-export candidate
- **AND** multiline or alternate-whitespace inline type-only forms SHALL remain
  unclaimed until a future predicate/fixture checkpoint proves them

#### Scenario: SDK mapgen subpath imports the Civ7 adapter

- **WHEN** `packages/sdk/src/mapgen/**` imports `@civ7/adapter/civ7`
- **THEN** this row SHALL classify that usage as SDK mapgen runtime subpath
  control context, not a current-row violation

#### Scenario: MapGen core imports the Civ7 adapter

- **WHEN** `packages/mapgen-core/src/**/*.ts` imports `@civ7/adapter/civ7`
- **THEN** the row SHALL record that as a current-row candidate or blocker
  under the available proof class

### Requirement: SDK MapGen Entrypoint Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for `grit-sdk-mapgen-entrypoint`.

#### Scenario: Wrapper, baseline, and injected proof are recorded

- **WHEN** the row records Habitat per-rule wrapper proof, aggregate
  `grit-check` proof, explicit empty baseline proof, and row-specific injected
  violation/path-control proof
- **THEN** those proof classes SHALL be named separately from native fixtures
  and parser inventory
- **AND** aggregate injected-corpus closure SHALL remain unclaimed while an
  unrelated row remains blocked

#### Scenario: Unproved proof classes remain outside closure

- **WHEN** raw acquisition, Effect adapter behavior, apply safety,
  generator/migration proof, retired parity, broader SDK/mapgen architecture
  closure, or product/runtime proof is not separately proven
- **THEN** row records SHALL label those proof classes as non-claims
- **AND** the row SHALL NOT close those gates through native fixtures, parser
  inventory, wrapper proof, baseline proof, or injected path-control proof
