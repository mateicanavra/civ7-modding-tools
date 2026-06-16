## ADDED Requirements

### Requirement: MapGen Core Runtime Civ7 Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-mapgen-core-runtime-civ7` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, neighboring
adapter/sdk/runtime rows, apply safety, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter mapgen_core_runtime_civ7 --json` exits
  0
- **THEN** Habitat records native fixture proof for
  `mapgen_core_runtime_civ7`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, neighboring row proof, or
  product proof from that command

#### Scenario: MapGen core parser inventory is recorded

- **WHEN** the row records parser inventory for MapGen core runtime coupling
- **THEN** the record SHALL name scan roots, exclusions, predicate path
  classes, counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: MapGen Core Runtime Coupling Gaps Are Recorded

MapGen core and engine source SHALL avoid Civ7 runtime value imports,
`/base-standard/` imports, and direct member access on Civ7 engine globals under
the current `grit-mapgen-core-runtime-civ7` predicate.

#### Scenario: Current predicate file imports a Civ7 runtime value

- **WHEN** a matching `packages/mapgen-core/src/core/**/*.ts` or
  `packages/mapgen-core/src/engine/**/*.ts` file imports a value from
  `@civ7/adapter`, `@civ7/adapter/civ7`, or `/base-standard/...`
- **THEN** `grit-mapgen-core-runtime-civ7` SHALL report the import
- **AND** pure type-only imports SHALL remain controls unless future row
  authority deliberately broadens this check beyond runtime value coupling

#### Scenario: Current predicate file references a Civ7 runtime global member

- **WHEN** a matching file accesses a member on `GameplayMap`,
  `TerrainBuilder`, `ResourceBuilder`, `FeatureBuilder`, `AreaBuilder`,
  `MapConstructibles`, or `GameInfo`
- **THEN** `grit-mapgen-core-runtime-civ7` SHALL report the member expression
- **AND** the proof record SHALL state whether the behavior is proven by
  native fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Current predicate file imports adapter types only

- **WHEN** a matching file uses type-only imports from `@civ7/adapter`
- **THEN** this row SHALL classify that syntax as a parser-edge fact
- **AND** the row SHALL NOT claim clean value-import runtime coupling closure
  from type-only imports unless the current predicate proves that behavior
  explicitly and the owner boundary accepts that semantics
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

### Requirement: MapGen Core Runtime Civ7 Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-mapgen-core-runtime-civ7`.

#### Scenario: Non-row proof remains unavailable

- **WHEN** raw acquisition, Effect adapter behavior, apply safety, retired
  parity, neighboring rows, or product/runtime behavior is not proven by this
  row
- **THEN** row records SHALL label those proof classes as non-claims
- **AND** the row SHALL NOT close those gates through native fixtures, parser
  inventory, wrapper proof, baseline proof, or injected proof
