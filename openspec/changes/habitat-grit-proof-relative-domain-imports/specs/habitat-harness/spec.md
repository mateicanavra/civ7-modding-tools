## ADDED Requirements

### Requirement: Relative Domain Import Guard Is Executable

Habitat SHALL enforce `grit-relative-domain-imports` as a `grit-check` rule for
recipe/map source that imports local domain source through relative
`../domain` paths.

#### Scenario: Relative domain import is detected

- **WHEN** a matching recipe or map `.ts`/`.tsx` file statically imports or
  re-exports from the exact current-predicate relative path into `src/domain`
- **THEN** `grit-relative-domain-imports` SHALL report the file
- **AND** value, type-only, namespace, side-effect, named re-export, and
  export-star forms SHALL be represented in native fixtures

#### Scenario: Same-root depth lookalikes stay clean

- **WHEN** a recipe file imports from a short relative source such as
  `../domain/<tail>`, `../../domain/<tail>`, or `../../../domain/<tail>`
- **THEN** `grit-relative-domain-imports` SHALL NOT report that source unless
  the filename-depth predicate proves the source reaches repository
  `src/domain`

#### Scenario: Public domain surfaces stay clean

- **WHEN** recipe or map source imports from `@mapgen/domain/<domain>`
- **THEN** `grit-relative-domain-imports` SHALL NOT report that source

### Requirement: Relative Domain Import Closure Separates Proof Classes

Habitat SHALL classify this checkpoint as source remediation plus active
recurrence guard proof only.

#### Scenario: Habitat wrapper proof passes

- **WHEN** `habitat check --json --rule grit-relative-domain-imports` runs
- **THEN** the selected rules SHALL be `grit-relative-domain-imports` plus
  `baseline-integrity`
- **AND** both SHALL pass with zero diagnostics against the remediated current
  tree
- **AND** raw acquisition, apply safety, generated-output freshness, broader
  public-surface closure, and product/runtime proof SHALL remain non-claims

#### Scenario: Injected probe reports the recurrence class

- **WHEN** the registered injected probe writes a stage-root relative-domain
  import and a same-root short-depth control
- **THEN** `grit-relative-domain-imports` SHALL report the injected violation
- **AND** the control path SHALL stay clean
- **AND** aggregate injected-corpus closure SHALL remain separate while DDIT is
  blocked
