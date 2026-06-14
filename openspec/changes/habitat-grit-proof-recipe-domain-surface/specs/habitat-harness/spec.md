## ADDED Requirements

### Requirement: Recipe Domain Surface Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-recipe-domain-surface` as
implementation-complete until row-level proof exists for native fixtures,
current-tree wrapper behavior, wrapper scan-root behavior, raw acquisition or
accepted adapter proof, injected violations, explicit baseline behavior,
retired-mechanism parity, neighboring-rule disposition, exact-surface gap
disposition, and downstream records.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter recipe_domain_surface --json` exits 0
- **THEN** Habitat records native fixture proof for this pattern
- **AND** Habitat SHALL NOT claim current-tree enforcement, exact allowed
  surface proof, injected violation, baseline, neighboring-rule ownership, or
  rewrite safety from that command unless those proof classes are also present

#### Scenario: Current-tree wrapper proof passes

- **WHEN** `habitat check --json --rule grit-recipe-domain-surface` exits 0
- **THEN** the report SHALL include `grit-recipe-domain-surface` and
  `baseline-integrity`
- **AND** the proof record SHALL name command provenance, selected rule ids,
  diagnostics count, baseline state, and non-claims

### Requirement: Recipe Domain Surface Rule Has Exact Scope

Habitat SHALL define the exact adapter roots, registry metadata, filename
predicate, and import/export source predicate for
`grit-recipe-domain-surface`.

#### Scenario: Wrapper scan roots are recorded

- **WHEN** Habitat records wrapper proof for `grit-recipe-domain-surface`
- **THEN** the proof SHALL name the effective Grit adapter scan roots:
  `packages`, `apps/mapgen-studio/src`,
  `mods/mod-swooper-maps/src/recipes`,
  `mods/mod-swooper-maps/src/maps`, and
  `mods/mod-swooper-maps/src/domain`, filtered by existence
- **AND** bounded raw acquisition roots SHALL be recorded separately from the
  wrapper roots
- **AND** any wrapper root outside the current recipe `.ts` predicate SHALL
  have projection proof or explicit non-claim

#### Scenario: Non-public domain source appears in recipe source

- **WHEN** a `mods/mod-swooper-maps/src/recipes/**/*.ts` file imports or
  re-exports from `@mapgen/domain/<domain>/<tail>` outside accepted public
  surfaces
- **THEN** Habitat SHALL report `grit-recipe-domain-surface`
- **AND** the proof record SHALL identify the matched file, source specifier,
  export/import form, and scan-root class

#### Scenario: Same source appears outside current effective scope

- **WHEN** the same non-public domain source appears in maps, another mod,
  `.tsx`, tests outside recipe roots, or other paths outside this rule's
  effective predicate
- **THEN** this rule SHALL NOT claim coverage for that path
- **AND** any broader policy SHALL be owned by predicate expansion proof,
  sibling implementation/proof ids, or downstream blocked downgrade with a
  named owner

#### Scenario: Same source appears in recipe-local tests

- **WHEN** the same non-public domain source appears under
  `mods/mod-swooper-maps/src/recipes/**/__tests__/**/*.ts`,
  `mods/mod-swooper-maps/src/recipes/**/__type_tests__/**/*.ts`,
  `mods/mod-swooper-maps/src/recipes/**/*.test.ts`, or
  `mods/mod-swooper-maps/src/recipes/**/*.spec.ts`
- **THEN** the proof record SHALL classify recipe-local tests as intentionally
  in-scope, predicate-excluded, or sibling-owned
- **AND** downstream records SHALL NOT claim test import policy from this row
  without that classification

### Requirement: Recipe Domain Surface Fixtures Cover Source Forms

Habitat SHALL provide fixture or adapter coverage for the source forms that the
pattern claims to classify.

#### Scenario: Non-public domain imports appear

- **WHEN** a matching recipe file uses default, named, namespace, or type-only
  imports from a non-public domain source
- **THEN** `grit-recipe-domain-surface` SHALL report the import
- **AND** the proof record SHALL state whether this is proven by native
  Markdown fixtures, direct Grit proof, or adapter-level proof

#### Scenario: Side-effect non-public domain imports appear

- **WHEN** a matching recipe file uses a side-effect import from a non-public
  domain source
- **THEN** `grit-recipe-domain-surface` SHALL report the import or closure SHALL
  remain blocked until an accepted policy record assigns the form to another
  owner and downgrades this row's all-import claims
- **AND** the proof record SHALL name the source form, owner, and downstream
  non-claim

#### Scenario: Non-public domain re-exports appear

- **WHEN** a matching recipe file uses named re-export, type re-export, or star
  re-export from a non-public domain source
- **THEN** `grit-recipe-domain-surface` SHALL report the export

#### Scenario: Allowed public surfaces appear

- **WHEN** a matching recipe file imports from `@mapgen/domain/<domain>`,
  `@mapgen/domain/<domain>/ops`, or
  `@mapgen/domain/<domain>/config.js`
- **THEN** `grit-recipe-domain-surface` SHALL NOT report it
- **AND** the proof record SHALL distinguish exact allowed-surface proof from
  substring allowance

### Requirement: Exact Surface Gaps Are Not Overclaimed

Habitat SHALL NOT use `grit-recipe-domain-surface` to claim exact three-surface
recipe enforcement unless every source that contains `/ops` or `/config.js`
without being exactly `@mapgen/domain/<domain>/ops` or
`@mapgen/domain/<domain>/config.js` is covered by this row, sibling proof ids,
or downstream blocked records.

#### Scenario: `/ops/<tail>` appears

- **WHEN** a recipe file imports `@mapgen/domain/<domain>/ops/<tail>`
- **THEN** the proof record SHALL link `grit-domain-deep-import` proof ids or
  a reviewed predicate expansion
- **AND** this row SHALL NOT claim that substring allowance proves exact `/ops`
  policy

#### Scenario: `ops-by-id` appears

- **WHEN** a recipe file imports `@mapgen/domain/<domain>/ops-by-id`
- **THEN** the proof record SHALL link the domain-deep-import defect repair,
  another accepted owner, or a blocked downstream record
- **AND** complete recipe domain-surface enforcement SHALL remain unproven until
  that link exists

#### Scenario: `config.js/<tail>` appears

- **WHEN** a recipe file imports `@mapgen/domain/<domain>/config.js/<tail>`
- **THEN** the proof record SHALL link predicate repair, sibling proof ids, or
  a blocked downstream record with named owner
- **AND** exact `/config.js` policy SHALL NOT be claimed from substring
  allowance

#### Scenario: Contains-substring lookalike appears

- **WHEN** a recipe file imports a non-exact source that contains `/ops` or
  `/config.js`, such as `@mapgen/domain/<domain>/ops-private`,
  `@mapgen/domain/<domain>/private/ops`,
  `@mapgen/domain/<domain>/config.js-private`, or
  `@mapgen/domain/<domain>/private/config.js`
- **THEN** the proof record SHALL link predicate repair, sibling proof ids, or
  a blocked downstream record with named owner
- **AND** exact public-surface enforcement SHALL NOT be claimed from substring
  allowance

### Requirement: Neighboring Rule Overlap Is Classified

Habitat SHALL classify overlap between `grit-recipe-domain-surface`,
`grit-domain-deep-import`, and `grit-step-contract-domain-surface` before
closure.

#### Scenario: Recipe `rules` or `strategies` source appears

- **WHEN** a recipe file imports from
  `@mapgen/domain/<domain>/rules/<tail>` or
  `@mapgen/domain/<domain>/strategies/<tail>`
- **THEN** the proof record SHALL state whether one or multiple rules report
- **AND** it SHALL name which rule owns remediation guidance and downstream
  closure

#### Scenario: Step contract source appears

- **WHEN** a step contract under `recipes/**/steps/**/contract.ts` imports from
  a domain subpath
- **THEN** proof for this row SHALL either avoid that path for isolated
  injected proof or record the expected neighboring diagnostics
- **AND** step-contract policy SHALL remain owned by
  `grit-step-contract-domain-surface`

### Requirement: Recipe Domain Surface Check Does Not Claim Rewrite Safety

Habitat SHALL keep `grit-recipe-domain-surface` check proof separate from any
import rewrite proof.

#### Scenario: Non-public domain source is reported

- **WHEN** this rule reports a non-public domain import or re-export
- **THEN** the diagnostic may instruct authors to use domain root, `/ops`, or
  `/config.js`
- **BUT** Habitat SHALL NOT claim an automated rewrite is safe unless a
  separate accepted apply or generator workstream proves target export
  existence, import-kind preservation, formatting, typecheck/tests, and
  rollback proof

### Requirement: Injected Proof Uses Accepted Typed Grit Adapter Substrate

Habitat SHALL NOT implement injected probe creation, Grit command execution,
parser classification, pattern projection, overlap classification, or cleanup
proof for this row until an accepted typed Grit adapter substrate exists.

#### Scenario: Effect adapter substrate is used

- **WHEN** implementation consumes `habitat-effect-grit-adapter`
- **THEN** injected proof SHALL record command provenance, scan-root
  provenance, parser-classified output, projected pattern identity, cleanup
  behavior, overlap classification, and typed failure classes
- **AND** tests SHALL provide fake services for command, filesystem, and cleanup
  behavior where unit proof does not need real repo mutation

#### Scenario: Non-Effect typed substrate is proposed

- **WHEN** implementation proposes not to use the Effect adapter substrate
- **THEN** the design SHALL prove equivalent tagged failures, service-injected
  tests, command provenance, scan-root provenance, cleanup behavior,
  parser classification, overlap classification, and runtime-edge discipline
- **AND** the review record SHALL explain why Effect's native capabilities are
  not selected for this row

#### Scenario: Manual adapter behavior preserves current failure classes

- **WHEN** implementation preserves string-only Grit JSON recovery,
  exit-code-only command facts, cleanup by convention, parser edges without
  typed classification, or unit tests that require real repo mutation
- **THEN** row closure SHALL be blocked
- **AND** the workstream SHALL consume or complete the accepted Effect adapter
  substrate before injected proof is implemented

### Requirement: Recipe Domain Surface Baseline Expansion Proof Uses Accepted Owner

Habitat SHALL keep this row's explicit baseline proof separate from the shared
baseline mutation contract.

#### Scenario: Empty baseline is committed

- **WHEN** `tools/habitat-harness/baselines/grit-recipe-domain-surface.json`
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
