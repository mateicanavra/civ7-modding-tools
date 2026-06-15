## ADDED Requirements

### Requirement: Domain Root Catalogs Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-domain-root-catalogs` as complete until
row-level proof records separate native fixture behavior, parser inventory,
Habitat wrapper behavior, raw acquisition or accepted adapter proof, injected
violations, explicit baseline behavior, retired-mechanism parity, broader
domain-root facade coverage, generator/migration behavior, apply safety, and
downstream record truth.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter domain_root_catalogs --json` exits 0
- **THEN** Habitat records native fixture proof for `domain_root_catalogs`
- **AND** Habitat SHALL NOT claim Habitat wrapper behavior, raw acquisition,
  baseline behavior, injected cleanup, apply safety, generator/migration,
  broader facade coverage, neighboring row proof, or product proof from that
  command

#### Scenario: Domain catalog parser inventory is recorded

- **WHEN** the row records parser inventory for domain-root catalog files
- **THEN** the record SHALL name scan roots, exclusions, predicate path classes,
  counts, row id, and non-claims
- **AND** temporary stdout or scratch files SHALL NOT be cited as durable proof
- **AND** live current-predicate candidates SHALL be recorded as blocker or
  disposition inputs rather than clean enforcement closure

### Requirement: Domain Root Catalog Files Stay Retired

Swooper domain source SHALL avoid immediate domain-root `tags.ts` and
`artifacts.ts` catalog files under the current `grit-domain-root-catalogs`
predicate.

#### Scenario: Current predicate domain root defines a tags catalog

- **WHEN** a matching
  `mods/mod-swooper-maps/src/domain/<domain>/tags.ts` file exists
- **THEN** `grit-domain-root-catalogs` SHALL report the file
- **AND** the proof record SHALL state whether the behavior is proven by native
  fixtures, parser inventory, or Habitat wrapper proof

#### Scenario: Current predicate domain root defines an artifacts catalog

- **WHEN** a matching
  `mods/mod-swooper-maps/src/domain/<domain>/artifacts.ts` file exists
- **THEN** `grit-domain-root-catalogs` SHALL report the file
- **AND** live findings SHALL require supervisor/source-owner/generator
  disposition before clean row closure

#### Scenario: Owned nested or recipe-stage surfaces contain catalog filenames

- **WHEN** a nested domain path, recipe-stage path, generated-output-shaped
  path, map path, package path, test path, or `.tsx` path contains
  `tags.ts` or `artifacts.ts`
- **THEN** this row SHALL classify that path as outside the current
  domain-root catalog predicate
- **AND** any future predicate expansion SHALL require separate path-control
  proof and downstream record updates

### Requirement: Domain Root Catalog Non-Claims Stay Explicit

Habitat SHALL keep proof classes separate for `grit-domain-root-catalogs`.

#### Scenario: Dependency-bound proof is unavailable in the row stack

- **WHEN** wrapper selector truth, raw acquisition, baseline behavior, injected
  cleanup, Effect adapter behavior, apply safety, or generator/migration proof
  is not available in the current row stack/base
- **THEN** row records SHALL label those proof classes as blocked or non-claims
- **AND** the row SHALL NOT close those gates through native fixtures or parser
  inventory
