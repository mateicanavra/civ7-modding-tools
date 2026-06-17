## ADDED Requirements

### Requirement: Domain Deep Import Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-domain-deep-import` as implementation-complete
until row-level proof exists for native fixtures, current-tree wrapper behavior,
raw acquisition or accepted adapter proof, injected violations, explicit
baseline behavior, neighboring-rule boundaries, and downstream records.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter domain_deep_import --json` exits 0
- **THEN** Habitat records native fixture proof for this pattern
- **AND** Habitat SHALL NOT claim current-tree enforcement, injected violation,
  baseline, or apply safety from that command

#### Scenario: Current-tree wrapper proof passes

- **WHEN** `habitat check --json --rule grit-domain-deep-import` exits 0
- **THEN** the report SHALL include `grit-domain-deep-import` and
  `baseline-integrity`
- **AND** the proof record SHALL name command provenance, selected rule ids,
  diagnostics count, baseline state, and non-claims

### Requirement: Domain Deep Import Rule Has Exact Scope

Habitat SHALL define the exact scan roots, filename predicate, and source
predicate for `grit-domain-deep-import`.

#### Scenario: Registry metadata and Grit predicate agree

- **WHEN** Habitat records row-level proof for `grit-domain-deep-import`
- **THEN** the proof record SHALL compare `rules.json` scope, corpus-ledger
  scan roots, Grit filename predicate, and fixture paths
- **AND** the proof record SHALL state whether `.ts`, `.tsx`, or both file
  classes are in scope
- **AND** any metadata or predicate disagreement SHALL be repaired or accepted
  by review before the row can leave pending status

#### Scenario: Forbidden deep domain import appears in recipe or map source

- **WHEN** a source file under approved recipe/map roots imports or re-exports
  from `@mapgen/domain/<domain>/ops/<tail>`,
  `@mapgen/domain/<domain>/ops-by-id`,
  `@mapgen/domain/<domain>/rules/<tail>`, or
  `@mapgen/domain/<domain>/strategies/<tail>`
- **THEN** Habitat SHALL report `grit-domain-deep-import`
- **AND** the proof record SHALL identify the matched file, source specifier,
  import/export form, and scan-root class

#### Scenario: Ops-by-id family is claimed

- **WHEN** Habitat claims `@mapgen/domain/<domain>/ops-by-id` is forbidden by
  `grit-domain-deep-import`
- **THEN** native fixtures and injected wrapper proof SHALL show imports and
  re-exports of that exact specifier reporting `grit-domain-deep-import`
- **AND** the proof SHALL include lookalike negatives that do not report for
  non-owned specifiers such as `ops-by-identity` or `ops-by-id-extra`

#### Scenario: Public domain surface appears in recipe or map source

- **WHEN** a recipe or map source imports from `@mapgen/domain/<domain>`,
  `@mapgen/domain/<domain>/ops`, or
  `@mapgen/domain/<domain>/config.js`
- **THEN** `grit-domain-deep-import` SHALL NOT report that import

#### Scenario: Same source appears outside effective scope

- **WHEN** the same forbidden source specifier appears in a domain source file
  or external test source file outside this rule's effective scope
- **THEN** this rule SHALL NOT report it
- **AND** any test-only policy SHALL be owned by a separate workstream

#### Scenario: Relative local domain reach appears

- **WHEN** a recipe or map file imports from a relative
  `mods/mod-swooper-maps/src/domain/**` path
- **THEN** this alias-based rule SHALL NOT claim coverage for that import
- **AND** the aggregate domain-surface record SHALL link a sibling guard
  candidate or an accepted non-claim before claiming complete public-surface
  enforcement

### Requirement: Domain Deep Import Fixtures Cover Import And Export Forms

Habitat SHALL provide fixture coverage for the import and re-export forms that
the pattern claims to match.

#### Scenario: Import forms are exercised

- **WHEN** fixtures are run for this pattern
- **THEN** they SHALL include default, named, namespace or explicitly rejected
  namespace, side-effect, and type-only import cases according to the accepted
  rule semantics

#### Scenario: Re-export forms are exercised

- **WHEN** fixtures are run for this pattern
- **THEN** they SHALL include `export { ... } from` and `export * from` cases
  for forbidden sources

#### Scenario: Map path is exercised

- **WHEN** fixtures are run for this pattern
- **THEN** at least one positive fixture SHALL use an approved map source path
  outside generated output

#### Scenario: File-extension reach is exercised

- **WHEN** the accepted scope includes `.tsx`
- **THEN** fixture proof SHALL include `.tsx` coverage for at least one matching
  path
- **AND** if `.tsx` is excluded, the proof record SHALL identify the accepted
  metadata and predicate change that removed it from this rule

#### Scenario: Recipe and map local test paths are classified

- **WHEN** fixture proof covers this rule's effective filename predicate
- **THEN** Habitat SHALL classify recipe/map-local `__tests__`,
  `__type_tests__`, and `*.test.ts` paths as included or excluded
- **AND** the chosen scope SHALL be proven by fixtures and current-tree scan
  records
- **AND** external test roots SHALL remain owned by the test-policy workstream
  unless this packet explicitly accepts them

### Requirement: Generated Map Outputs Are Protected During Proof

Habitat MAY scan generated map source for this rule, but SHALL NOT use
generated output paths as injected probe write targets.

#### Scenario: Generated map source is in the scan root

- **WHEN** the scan roots include `mods/mod-swooper-maps/src/maps`
- **THEN** the proof record SHALL state whether generated map files are scanned
  by this rule
- **AND** any live finding in generated output SHALL be remediated by the
  generator/build owner rather than by hand-editing generated files

#### Scenario: Injected probe is created

- **WHEN** the injected proof harness creates a matching source file
- **THEN** the path SHALL be under an approved non-generated recipe or map
  probe root
- **AND** cleanup SHALL leave `git status --short` clean

### Requirement: Domain Deep Import Check Does Not Claim Apply Safety

Habitat SHALL keep `grit-domain-deep-import` check proof separate from the
`deep_import_to_public_surface` apply proof.

#### Scenario: Deep ops import is reported

- **WHEN** this rule reports `@mapgen/domain/<domain>/ops/<tail>`
- **THEN** the diagnostic may reference the public-surface remediation policy
- **BUT** Habitat SHALL NOT claim the import can be safely rewritten unless the
  apply packet has target-export, dry-run, applied-diff, type/test, and
  rollback proof for that candidate

#### Scenario: Rules or strategies import is reported

- **WHEN** this rule reports `rules/<tail>` or `strategies/<tail>`
- **THEN** Habitat SHALL classify the remediation as check-only/manual unless a
  separate accepted codemod or generator workstream owns an exact transform

### Requirement: Domain Deep Import Ownership Does Not Hide Neighboring Rules

Habitat SHALL record whether `grit-domain-deep-import` shares any diagnostics
with neighboring domain-surface rules and SHALL make the owner of each next
action clear.

#### Scenario: Recipe rules import overlaps recipe-domain-surface

- **WHEN** an approved recipe source imports or re-exports from
  `@mapgen/domain/<domain>/rules/<tail>` or
  `@mapgen/domain/<domain>/strategies/<tail>`
- **THEN** injected proof SHALL record whether both
  `grit-domain-deep-import` and `grit-recipe-domain-surface` report
- **AND** if both report, the proof record SHALL state which rule owns
  remediation guidance and which downstream rows are updated

#### Scenario: Map rules import proves this row outside recipe-only policy

- **WHEN** an approved non-generated map source imports or re-exports from
  `@mapgen/domain/<domain>/rules/<tail>` or
  `@mapgen/domain/<domain>/strategies/<tail>`
- **THEN** injected proof SHALL report `grit-domain-deep-import`
- **AND** the proof record SHALL state that recipe-only
  `grit-recipe-domain-surface` does not own the map-source finding

#### Scenario: Step-contract paths are not used as isolated row probes

- **WHEN** an injected probe path matches the step-contract filename predicate
- **THEN** the proof record SHALL treat it as a multi-rule probe
- **AND** isolated proof for `grit-domain-deep-import` SHALL use a path outside
  the step-contract predicate

### Requirement: Injected Proof Uses Accepted Typed Grit Adapter Substrate

Habitat SHALL NOT implement injected probe creation, Grit command execution,
parser classification, pattern projection, or cleanup proof for this row until
an accepted typed Grit adapter substrate exists.

#### Scenario: Effect adapter substrate is used

- **WHEN** implementation consumes `habitat-effect-grit-adapter`
- **THEN** injected proof SHALL record command provenance, scan-root
  provenance, parser-classified output, projected pattern identity, cleanup
  behavior, and typed failure classes
- **AND** tests SHALL provide fake services for command, filesystem, and cleanup
  behavior where unit proof does not need real repo mutation

#### Scenario: Non-Effect typed substrate is proposed

- **WHEN** implementation proposes not to use the Effect adapter substrate
- **THEN** the design SHALL prove equivalent tagged failures, service-injected
  tests, command provenance, scan-root provenance, cleanup behavior, and
  runtime-edge discipline
- **AND** the review record SHALL explain why Effect's native capabilities are
  not selected for this row

### Requirement: Domain Deep Import Baseline Expansion Proof Uses Accepted Owner

Habitat SHALL keep this row's explicit baseline proof separate from the shared
baseline mutation contract.

#### Scenario: Empty baseline is committed

- **WHEN** `tools/habitat-harness/baselines/grit-domain-deep-import.json`
  exists as `[]`
- **THEN** `baseline-integrity` SHALL accept it
- **AND** injected findings for this rule SHALL remain unbaselined and fail

#### Scenario: Expansion safety is claimed

- **WHEN** implementation claims this baseline cannot grow outside the accepted
  rule-introduction policy
- **THEN** the proof record SHALL link the accepted scaffold/baseline contract
  repair owner that governs baseline mutation
- **AND** this row SHALL NOT independently claim shared baseline expansion
  safety without that owner linkage
