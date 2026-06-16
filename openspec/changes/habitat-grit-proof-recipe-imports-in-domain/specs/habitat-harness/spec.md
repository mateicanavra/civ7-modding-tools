## ADDED Requirements

### Requirement: Recipe Imports In Domain Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-recipe-imports-in-domain` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, apply safety, classify/generator
behavior, and downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter recipe_imports_in_domain --json` exits 0
- **THEN** Habitat records native fixture proof for `recipe_imports_in_domain`
- **AND** Habitat SHALL NOT claim raw acquisition, baseline mutation,
  classify/generator behavior, apply safety, dynamic import closure, broader
  domain-refactor closure, or product/runtime proof from that command

#### Scenario: Domain parser inventory is recorded

- **WHEN** the row records parser inventory for Swooper domain source
- **THEN** the record SHALL name scan roots, exclusions, current-predicate path
  classes, counts, row id, live match list status, and non-claims
- **AND** stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean closure

### Requirement: Domain Source Avoids Recipe Imports

Swooper domain `.ts` source SHALL avoid static imports, dynamic imports, or
re-exports from recipe modules under the current
`grit-recipe-imports-in-domain` predicate.

#### Scenario: Domain source imports a recipe module

- **WHEN** a Swooper domain `.ts` file imports from a recipe alias or relative
  `../recipes` source
- **THEN** `grit-recipe-imports-in-domain` SHALL report the import

#### Scenario: Domain source re-exports a recipe module

- **WHEN** a Swooper domain `.ts` file uses named re-export or export-star from
  a recipe alias or relative `../recipes` source
- **THEN** `grit-recipe-imports-in-domain` SHALL report the re-export

#### Scenario: Domain source dynamically imports a recipe module

- **WHEN** a Swooper domain `.ts` file uses a dynamic import expression from a
  recipe alias or relative `../recipes` source
- **THEN** `grit-recipe-imports-in-domain` SHALL report the dynamic import

#### Scenario: Non-domain or source-lookalike classes appear

- **WHEN** the same source strings appear in recipe files, `.tsx` files, other
  mods, source strings, or recipe-looking source lookalikes
- **THEN** this row SHALL classify them as controls or non-claims, not as
  current-row violations

### Requirement: Recipe Imports In Domain Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for
`grit-recipe-imports-in-domain`.

#### Scenario: Shared and row-specific proof classes stay separated

- **WHEN** current shared wrapper selector and explicit baseline proof exist
  through accepted HGPR ids
- **THEN** row records MAY cite those shared ids as inherited current state
- **AND** row records SHALL cite the RID-specific wrapper selector, baseline
  inventory, and injected-probe evidence before treating those proof classes as
  satisfied for this registered row
- **AND** row records SHALL keep raw direct Grit acquisition, source
  remediation, classify/generator behavior, retired parity, apply safety,
  broader domain-refactor closure, and product proof as separate non-claims
  unless separately proven
