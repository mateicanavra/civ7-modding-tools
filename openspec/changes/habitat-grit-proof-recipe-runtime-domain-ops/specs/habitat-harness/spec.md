## ADDED Requirements

### Requirement: Recipe Runtime Domain Ops Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-recipe-runtime-domain-ops` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, apply
disposition, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter recipe_runtime_domain_ops --json` exits
  0
- **THEN** Habitat records native fixture proof for
  `recipe_runtime_domain_ops`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, or product proof from that
  command

#### Scenario: Recipe runtime parser inventory is recorded

- **WHEN** the row records parser inventory for runtime recipe imports
- **THEN** the record SHALL name scan root
  `mods/mod-swooper-maps/src/recipes`, exclusions, import source classes,
  counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof

### Requirement: Runtime Recipes Import Domain Ops

Runtime recipe files SHALL import domain ops bundles rather than domain contract
roots under the current `grit-recipe-runtime-domain-ops` predicate.

#### Scenario: Runtime recipe imports domain contract root

- **WHEN** a `mods/<mod>/src/recipes/**/recipe.ts` file imports
  `@mapgen/domain/<domain>`
- **THEN** `grit-recipe-runtime-domain-ops` SHALL report the import
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Runtime recipe imports domain ops bundle

- **WHEN** a runtime `recipe.ts` file imports
  `@mapgen/domain/<domain>/ops`
- **THEN** `grit-recipe-runtime-domain-ops` SHALL NOT report that import

#### Scenario: Non-runtime recipe path imports domain contract root

- **WHEN** a file that is not a `mods/<mod>/src/recipes/**/recipe.ts` path
  imports `@mapgen/domain/<domain>`
- **THEN** this row SHALL NOT claim a violation under the current predicate
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

### Requirement: Recipe Runtime Domain Ops Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-recipe-runtime-domain-ops`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, or apply safety is not available in the
  current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
