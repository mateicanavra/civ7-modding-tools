## ADDED Requirements

### Requirement: Contract Export All Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-contract-export-all` as
implementation-complete until row-level proof exists for native fixtures,
type-star behavior, current-tree wrapper behavior, raw acquisition or accepted
adapter proof, injected violations, explicit baseline behavior, old-mechanism
parity, domain-root facade disposition, and downstream records.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter contract_export_all --json` exits 0
- **THEN** Habitat records native fixture proof for this pattern
- **AND** Habitat SHALL NOT claim current-tree enforcement, type-star
  allowance, injected violation, baseline, or rewrite safety from that command
  unless those proof classes are also present

#### Scenario: Current-tree wrapper proof passes

- **WHEN** `habitat check --json --rule grit-contract-export-all` exits 0
- **THEN** the report SHALL include `grit-contract-export-all` and
  `baseline-integrity`
- **AND** the proof record SHALL name command provenance, selected rule ids,
  diagnostics count, baseline state, and non-claims

### Requirement: Contract Export All Rule Has Exact Scope

Habitat SHALL define the exact adapter roots, registry metadata, filename
predicate, and export-form predicate for `grit-contract-export-all`.

#### Scenario: Wrapper scan roots are recorded

- **WHEN** Habitat records wrapper proof for `grit-contract-export-all`
- **THEN** the proof SHALL name the effective Grit adapter scan roots:
  `packages`, `apps/mapgen-studio/src`,
  `mods/mod-swooper-maps/src/recipes`,
  `mods/mod-swooper-maps/src/maps`, and
  `mods/mod-swooper-maps/src/domain`, filtered by existence
- **AND** bounded raw acquisition roots SHALL be recorded separately from the
  wrapper roots
- **AND** any wrapper root omitted from bounded raw acquisition SHALL have a
  projection proof or explicit non-claim

#### Scenario: Value star appears in an approved step contract

- **WHEN** a recipe stage step `contract.ts` or `*.contract.ts` uses
  `export * from ...`
- **THEN** Habitat SHALL report `grit-contract-export-all`
- **AND** the proof record SHALL identify the matched file, export form, and
  scan-root class

#### Scenario: Value star appears in an approved domain op surface

- **WHEN** a domain op `contract.ts`, `types.ts`, `index.ts`, `rules/**`, or
  `strategies/**` file uses `export * from ...`
- **THEN** Habitat SHALL report `grit-contract-export-all`
- **AND** the proof record SHALL identify the matched file, export form, and
  op-surface class
- **AND** implementation SHALL NOT skip `contract.ts`, `types.ts`,
  `rules/**`, or `strategies/**` proof unless a reviewed scope-reduction
  packet updates the pattern, registry metadata, aggregate proof matrix, and
  downstream records

#### Scenario: Same value star appears outside effective scope

- **WHEN** the same value-star export appears in a package barrel, non-op
  domain shared file, or other path outside this rule's effective predicate
- **THEN** this rule SHALL NOT claim coverage for that path
- **AND** any broader policy SHALL be owned by predicate expansion proof,
  sibling implementation/proof ids, or downstream blocked downgrade with a
  named owner

### Requirement: Contract Export All Fixtures Cover Export Forms

Habitat SHALL provide fixture or adapter coverage for the export forms that the
pattern claims to classify.

#### Scenario: Type-star aggregation appears

- **WHEN** a matching file uses `export type * from ...`
- **THEN** `grit-contract-export-all` SHALL NOT report it
- **AND** the proof record SHALL state whether this is proven by native
  Markdown fixtures, direct Grit proof, or adapter-level proof

#### Scenario: Named re-export appears

- **WHEN** a matching file uses `export { value } from ...`
- **THEN** `grit-contract-export-all` SHALL NOT report it

#### Scenario: Named type re-export appears

- **WHEN** a matching file uses `export { type Value } from ...`
- **THEN** `grit-contract-export-all` SHALL NOT report it

#### Scenario: Namespace re-export appears

- **WHEN** a matching file uses `export * as name from ...`
- **THEN** the proof record SHALL classify the form as allowed, forbidden by
  this row, or owned by a sibling rule
- **AND** the accepted classification SHALL be backed by fixture or adapter
  proof

### Requirement: Domain Root Facade Coverage Is Not Overclaimed

Habitat SHALL NOT use `grit-contract-export-all` to claim complete domain-root
facade enforcement unless the rule's implementation and proof explicitly cover
that surface.

#### Scenario: Domain root facade value star exists outside current predicate

- **WHEN** a domain root, domain config, public index, or other public facade
  uses `export * from ...` outside the current `contract_export_all` predicate
- **THEN** this row SHALL record it as outside current coverage
- **AND** downstream records SHALL link predicate expansion proof, sibling
  implementation/proof ids, or explicit downstream downgrade before claiming complete
  `scope:domain-surface` export-star hygiene

#### Scenario: Rule expansion is accepted

- **WHEN** implementation expands `contract_export_all` to cover domain-root
  facades
- **THEN** the expansion SHALL include authority, exact scan roots, native or
  adapter fixtures, current-tree inventory, false-positive controls, baseline
  policy, and downstream realignment

#### Scenario: Sibling ownership is used

- **WHEN** domain-root facade coverage is not added to this row
- **THEN** any complete domain-surface export-star claim SHALL link a sibling
  row with accepted implementation/proof ids
- **AND** absent those proof ids, downstream records SHALL mark the broader
  domain-surface claim blocked/unproven with a named owner

### Requirement: Contract Export All Check Does Not Claim Rewrite Safety

Habitat SHALL keep `grit-contract-export-all` check proof separate from any
export-list rewrite proof.

#### Scenario: Value star is reported

- **WHEN** this rule reports a bare value `export *`
- **THEN** the diagnostic may instruct authors to replace it with named exports
- **BUT** Habitat SHALL NOT claim an automated rewrite is safe unless a
  separate accepted apply or generator workstream proves exact export-list
  synthesis, collision handling, type-only preservation, formatting,
  typecheck/tests, and rollback proof

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

#### Scenario: Manual adapter behavior preserves current failure classes

- **WHEN** implementation preserves string-only Grit JSON recovery,
  exit-code-only command facts, cleanup by convention, parser edges without
  typed classification, or unit tests that require real repo mutation
- **THEN** row closure SHALL be blocked
- **AND** the workstream SHALL consume or complete the accepted Effect adapter
  substrate before injected proof is implemented

### Requirement: Contract Export All Baseline Expansion Proof Uses Accepted Owner

Habitat SHALL keep this row's explicit baseline proof separate from the shared
baseline mutation contract.

#### Scenario: Empty baseline is committed

- **WHEN** `tools/habitat-harness/baselines/grit-contract-export-all.json`
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
