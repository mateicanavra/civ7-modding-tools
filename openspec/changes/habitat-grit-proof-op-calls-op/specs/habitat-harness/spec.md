## ADDED Requirements

### Requirement: Op Calls Op Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-op-calls-op` as complete until row-level
proof records separate native fixture behavior, parser inventory, wrapped-test
behavior, Habitat wrapper behavior, raw acquisition or accepted adapter proof,
injected violations, explicit baseline behavior, retired parity, apply safety,
classify/generator behavior, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter op_calls_op --json` exits 0
- **THEN** Habitat records native fixture proof for `op_calls_op`
- **AND** Habitat SHALL NOT claim raw acquisition, baseline mutation,
  classify/generator behavior,
  apply safety, retired parity, broader domain-refactor closure, neighboring
  `ops.bind` / `runValidated` proof, or product/runtime proof from that command

#### Scenario: Domain parser inventory is recorded

- **WHEN** the row records parser inventory for Swooper domain source
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, counts, row id, live match list status, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean closure

### Requirement: Domain Op Runtime Entrypoints Avoid Op Composition Imports

Swooper domain op runtime `index.ts` files SHALL avoid sibling op runtime
imports and domain ops barrel imports under the current `grit-op-calls-op`
predicate for `mods/mod-swooper-maps/src/domain/**/ops/*/index.ts`.

#### Scenario: Runtime entrypoint imports sibling op runtime

- **WHEN** a Swooper domain op runtime `index.ts` file imports from
  `../<op>/index.js`
- **THEN** `grit-op-calls-op` SHALL report the import

#### Scenario: Runtime entrypoint imports domain ops barrel

- **WHEN** a Swooper domain op runtime `index.ts` file imports from
  `@mapgen/domain/<domain>/ops` or
  `@mapgen/domain/<domain>/ops/index.js`
- **THEN** `grit-op-calls-op` SHALL report the import

#### Scenario: Runtime entrypoint re-exports or dynamically imports sibling op runtime

- **WHEN** a Swooper domain op runtime `index.ts` file re-exports from
  `../<op>/index.js` or dynamically imports `../<op>/index.js`
- **THEN** `grit-op-calls-op` SHALL report the re-export or dynamic import

#### Scenario: Same-op or non-runtime path imports adjacent modules

- **WHEN** the same source classes appear in same-op local imports, rules
  paths, strategy paths, root ops barrel files, recipes, tests, `.tsx` files,
  same-op export-from declarations, private/lookalike dynamic imports, or
  source strings
- **THEN** this row SHALL classify them as controls or non-claims, not as
  current-row violations

### Requirement: Op Calls Op Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for `grit-op-calls-op`.

#### Scenario: Shared and row-specific proof classes stay separated

- **WHEN** current restacked shared wrapper selector and explicit baseline
  proof exist through accepted HGPR ids
- **THEN** row records MAY cite those shared ids as inherited current state
- **AND** row records SHALL cite the OCO-specific wrapper selector, baseline
  inventory, and injected-probe evidence before treating those proof classes as
  satisfied for this registered row
- **AND** row records SHALL keep raw direct Grit acquisition, source
  remediation, classify/generator behavior, retired parity, apply safety,
  broader op-architecture closure, neighboring row proof, and product proof as
  separate non-claims unless separately proven
