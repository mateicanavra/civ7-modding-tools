## ADDED Requirements

### Requirement: Step Contract Domain Surface Rule Has Row-Level Proof

Habitat SHALL NOT classify `grit-step-contract-domain-surface` as
implementation-complete until row-level proof exists for native fixtures,
current-tree wrapper behavior, wrapper scan-root behavior, injected violations,
explicit baseline behavior, neighboring-rule disposition, scope-gap
disposition, filename-control disposition, source-specifier-control
disposition, downstream records, and explicit non-claims for raw acquisition,
retired-mechanism parity, apply safety, and product/runtime proof.

#### Scenario: Native fixture proof passes

- **WHEN** `grit patterns test --filter step_contract_domain_surface --json`
  exits 0
- **THEN** Habitat records native fixture proof for this pattern
- **AND** Habitat SHALL NOT claim current-tree enforcement, all-mod wrapper
  coverage, injected violation, baseline, neighboring-rule ownership, or
  rewrite safety from that command unless those proof classes are also present

#### Scenario: Current-tree wrapper proof passes

- **WHEN** `habitat check --json --rule grit-step-contract-domain-surface`
  exits 0
- **THEN** the report SHALL include `grit-step-contract-domain-surface` and
  `baseline-integrity`
- **AND** the proof record SHALL name command provenance, selected rule ids,
  diagnostics count, baseline state, wrapper scan roots, and non-claims

### Requirement: Step Contract Domain Surface Rule Has Exact Scope

Habitat SHALL define the exact adapter roots, registry metadata, filename
predicate, and import/export source predicate for
`grit-step-contract-domain-surface`.

#### Scenario: Wrapper scan roots are recorded

- **WHEN** Habitat records wrapper proof for
  `grit-step-contract-domain-surface`
- **THEN** the proof SHALL name the effective Grit adapter scan roots:
  `packages`, `apps/mapgen-studio/src`,
  `mods/mod-swooper-maps/src/recipes`,
  `mods/mod-swooper-maps/src/maps`, and
  `mods/mod-swooper-maps/src/domain`, filtered by existence
- **AND** bounded raw acquisition roots SHALL be recorded separately from the
  wrapper roots
- **AND** wrapper roots outside the current step-contract predicate SHALL have
  projection proof or explicit non-claim

#### Scenario: Registry scope and wrapper scope differ

- **WHEN** the registry says the rule scope is
  `mods/*/src/recipes/**/stages/**/steps/**/{contract.ts,*.contract.ts}`
- **THEN** proof SHALL distinguish raw Grit regex capability, current Habitat
  wrapper enforcement, and intended all-mod metadata
- **AND** all-mod enforcement SHALL NOT be claimed until adapter roots, current
  scans, injected path controls, and downstream records prove it

#### Scenario: Non-root domain source appears in matching step contract

- **WHEN** a matching step contract imports or re-exports from
  `@mapgen/domain/<domain>/<tail>`
- **THEN** Habitat SHALL report `grit-step-contract-domain-surface`
- **AND** the proof record SHALL identify the matched file, source specifier,
  export/import form, filename class, and scan-root class

#### Scenario: Source specifier lookalike appears in matching step contract

- **WHEN** a matching step contract imports or re-exports from a prefixed,
  relative, or other non-package source specifier that contains
  `@mapgen/domain/<domain>/<tail>`
- **THEN** `grit-step-contract-domain-surface` SHALL NOT report it after the
  source predicate repair
- **AND** the proof record SHALL keep the lookalike as a native/source control,
  not a step-contract domain-source violation

#### Scenario: Same source appears outside current effective scope

- **WHEN** the same non-root domain source appears in maps, ordinary recipe
  files, non-step contract files, stage artifact contract files, `.tsx`, or
  other paths outside this rule's effective predicate
- **THEN** this rule SHALL NOT claim coverage for that path
- **AND** any broader policy SHALL be owned by predicate expansion proof,
  sibling implementation/proof ids, or downstream blocked record with a named
  owner

### Requirement: Step Contract Domain Surface Fixtures Cover Source Forms

Habitat SHALL provide fixture or adapter coverage for the source forms that the
pattern claims to classify.

#### Scenario: Non-root domain imports appear

- **WHEN** a matching step contract uses default, named, namespace, type-only,
  or side-effect imports from a non-root domain source
- **THEN** `grit-step-contract-domain-surface` SHALL report the import
- **AND** the proof record SHALL state whether this is proven by native
  Markdown fixtures, direct Grit proof, or adapter-level proof

#### Scenario: Non-root domain re-exports appear

- **WHEN** a matching step contract uses named re-export, type re-export, or
  star re-export from a non-root domain source
- **THEN** `grit-step-contract-domain-surface` SHALL report the export
- **AND** overlap with `grit-contract-export-all` SHALL be classified for star
  re-export cases

#### Scenario: Allowed domain root appears

- **WHEN** a matching step contract imports from `@mapgen/domain/<domain>`
- **THEN** `grit-step-contract-domain-surface` SHALL NOT report it
- **AND** the proof record SHALL distinguish the step-contract domain-root-only
  policy from ordinary recipe `/ops` and `/config.js` allowances

### Requirement: Step Contract Domain Surface Source Gaps Are Not Overclaimed

Habitat SHALL NOT use `grit-step-contract-domain-surface` to claim complete
step-contract source enforcement unless every exact
`@mapgen/domain/<domain>/<tail>` source family and every current-regex
source-specifier lookalike class is covered by this row, sibling proof ids, or
downstream blocked records.

#### Scenario: Runtime ops source appears

- **WHEN** a matching step contract imports from
  `@mapgen/domain/<domain>/ops`
- **THEN** `grit-step-contract-domain-surface` SHALL report it
- **AND** proof SHALL state that ordinary recipe `/ops` allowance does not
  apply to step contracts

#### Scenario: Deep domain source appears

- **WHEN** a matching step contract imports from
  `@mapgen/domain/<domain>/ops/<tail>`,
  `@mapgen/domain/<domain>/rules/<tail>`,
  `@mapgen/domain/<domain>/strategies/<tail>`,
  `@mapgen/domain/<domain>/shared/<tail>`,
  `@mapgen/domain/<domain>/types.js`, or
  `@mapgen/domain/<domain>/ops-by-id`
- **THEN** the proof record SHALL state whether one or multiple neighboring
  rules report
- **AND** it SHALL name which rule owns remediation guidance and downstream
  closure

#### Scenario: Config source appears

- **WHEN** a matching step contract imports from
  `@mapgen/domain/<domain>/config.js` or
  `@mapgen/domain/<domain>/config.js/<tail>`
- **THEN** `grit-step-contract-domain-surface` SHALL report it
- **AND** exact step-contract source policy SHALL NOT be softened by ordinary
  recipe config-surface allowances

### Requirement: Filename And Path Controls Are Classified

Habitat SHALL classify filename and path boundaries before row closure.

#### Scenario: Contract filename class appears

- **WHEN** the matching file is `steps/**/contract.ts` or
  `steps/**/*.contract.ts`
- **THEN** the proof record SHALL classify the file as an intended step contract
  target

#### Scenario: Contract lookalike filename appears

- **WHEN** the matching file name ends in `contract.ts` without being
  `contract.ts` or `*.contract.ts`, such as `notacontract.ts`
- **THEN** `grit-step-contract-domain-surface` SHALL NOT report it after the
  filename predicate repair
- **AND** the proof record SHALL keep the lookalike as a native/path control,
  not an intended step-contract file

#### Scenario: Recipe-local test step contract appears

- **WHEN** a non-root domain source appears under
  `steps/**/__tests__/contract.ts`,
  `steps/**/__type_tests__/contract.ts`,
  `steps/**/*.test.ts`, or
  `steps/**/*.spec.ts`
- **THEN** the proof record SHALL classify recipe-local tests as predicate
  excluded for this row
- **AND** downstream records SHALL NOT claim test import policy from this row
  without that classification

#### Scenario: Stage artifact contract appears

- **WHEN** a domain source appears under
  `recipes/**/stages/**/artifacts/contract/**/*.ts`
- **THEN** this row SHALL NOT claim coverage unless a reviewed predicate
  expansion includes that path
- **AND** the proof record SHALL name the sibling owner or non-claim

### Requirement: Neighboring Rule Overlap Is Classified

Habitat SHALL classify overlap between `grit-step-contract-domain-surface`,
`grit-recipe-domain-surface`, `grit-domain-deep-import`, and
`grit-contract-export-all` before closure.

#### Scenario: Recipe-domain-surface overlap appears

- **WHEN** a step contract imports from a non-root domain source that
  `grit-recipe-domain-surface` also reports
- **THEN** the proof record SHALL state whether one or multiple rules report
- **AND** step-contract domain-root-only policy SHALL own remediation guidance

#### Scenario: Domain-deep-import overlap appears

- **WHEN** a step contract imports from a domain source owned by
  `grit-domain-deep-import`
- **THEN** the proof record SHALL state whether one or multiple rules report
- **AND** it SHALL preserve `grit-domain-deep-import` ownership for map/recipe
  deep-import policy outside the step-contract source rule

#### Scenario: Contract export overlap appears

- **WHEN** a step contract uses `export * from` a non-root domain source
- **THEN** the proof record SHALL classify both the source-surface diagnostic
  and the contract value-star export diagnostic
- **AND** it SHALL name which rule owns each remediation demand

### Requirement: Step Contract Domain Surface Check Does Not Claim Rewrite Safety

Habitat SHALL keep `grit-step-contract-domain-surface` check proof separate
from import rewrite proof.

#### Scenario: Non-root domain source is reported

- **WHEN** this rule reports a non-root domain import or re-export
- **THEN** the diagnostic may instruct authors to use the domain root
- **BUT** Habitat SHALL NOT claim an automated rewrite is safe unless a separate
  accepted apply, generator, or migration workstream proves target export
  existence, import-kind preservation, formatting, typecheck/tests, and rollback
  proof

### Requirement: Injected Proof Uses Accepted Shared Probe Runner

Habitat SHALL NOT claim row-specific injected proof for this row unless a
clean-start runner creates the probe, reports the exact rule id at the
intended path, keeps an outside-scope control clean, and restores the worktree
and probe root.

#### Scenario: Shared injected runner is used

- **WHEN** implementation consumes the accepted injected-probe runner
- **THEN** injected proof SHALL record the probe path, control path, diagnostic
  count, projected pattern identity, clean initial/final git state, and
  probe-root cleanup behavior
- **AND** aggregate injected-corpus closure SHALL remain a non-claim while any
  unrelated row remains an accepted projection miss

#### Scenario: Parser-edge injected matrix is not provided

- **WHEN** parser-edge import/export forms are proved through native fixtures
  rather than injected probes
- **THEN** the proof record SHALL say that row-specific injected proof is a
  representative violation/path-control proof, not a full parser-edge
  injected matrix

### Requirement: Step Contract Domain Surface Baseline Expansion Proof Uses Accepted Owner

Habitat SHALL keep this row's explicit baseline proof separate from the shared
baseline mutation contract.

#### Scenario: Empty baseline is committed

- **WHEN** `tools/habitat-harness/baselines/grit-step-contract-domain-surface.json`
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
