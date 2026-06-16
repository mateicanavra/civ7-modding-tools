## ADDED Requirements

### Requirement: Studio Recipe Artifacts Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-studio-recipe-artifacts` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, and
downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter studio_recipe_artifacts --json` exits 0
- **THEN** Habitat records native fixture proof for
  `studio_recipe_artifacts`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, or product proof from that
  command

#### Scenario: Studio parser inventory is recorded

- **WHEN** the row records parser inventory for Studio recipe imports
- **THEN** the record SHALL name scan root `apps/mapgen-studio/src`,
  exclusions, import source classes, counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof

### Requirement: Studio UI Imports Recipe Artifacts

Studio UI files SHALL import recipe artifacts instead of runtime recipe modules
under the current `grit-studio-recipe-artifacts` predicate.

#### Scenario: UI imports runtime recipe module

- **WHEN** a Studio UI `.ts` or `.tsx` file outside `browser-runner` and
  `server` imports `mod-swooper-maps/recipes/standard` or
  `mod-swooper-maps/recipes/browser-test`
- **THEN** `grit-studio-recipe-artifacts` SHALL report the import
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: UI imports recipe artifact module

- **WHEN** a Studio UI file imports `mod-swooper-maps/recipes/*-artifacts` or
  `mod-swooper-maps/recipes/standard-map-configs`
- **THEN** `grit-studio-recipe-artifacts` SHALL NOT report that import

#### Scenario: Worker or server imports runtime recipe module

- **WHEN** a file under `apps/mapgen-studio/src/browser-runner/` or
  `apps/mapgen-studio/src/server/` imports a runtime recipe module
- **THEN** this row SHALL NOT claim a violation under the current predicate
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

### Requirement: Studio Recipe Artifacts Closure Keeps Non-Claims Explicit

Habitat SHALL keep proof classes separate for
`grit-studio-recipe-artifacts`.

#### Scenario: Active check proof closes without broadening product claims

- **WHEN** native fixtures, parser inventory, Habitat wrapper proof, explicit
  baseline proof, and row-specific injected proof are current
- **THEN** row records MAY classify the active SRA check as row-closed
- **AND** row records SHALL keep raw direct Grit acquisition, generated artifact
  proof, Effect adapter closure, apply safety, retired parity, and
  product/runtime proof as explicit non-claims
