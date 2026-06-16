## ADDED Requirements

### Requirement: Map Bundle Runtime Imports Use Graph-Owned Wrapped-Test Proof

Habitat SHALL enforce Swooper generated map bundle runtime-import safety through
the wrapped-test owner layer selected by `arch-test-map-bundle-runtime-imports`.

#### Scenario: Map bundle runtime-import guard runs through Habitat

- **WHEN** `habitat check --rule arch-test-map-bundle-runtime-imports` runs
- **THEN** Habitat SHALL run the Swooper Maps package target
- **AND** the target SHALL depend on the package build before reading generated
  map bundles
- **AND** the rule SHALL pass when generated map scripts are present,
  self-contained for Civ7 runtime loading, bootstrap TextEncoder before use,
  and include the authored river materialization markers

#### Scenario: Map bundle proof is not duplicated as Grit

- **WHEN** this row records map bundle runtime-import proof
- **THEN** the row SHALL NOT register an active Grit rule, Grit baseline, or
  injected Grit probe
- **AND** records SHALL state that this boundary remains wrapped-test-owned
  under the current Habitat rule catalog

### Requirement: Map Bundle Runtime Import Non-Claims Stay Explicit

Habitat SHALL keep the map-bundle proof separate from unrelated Grit, generated
output, and runtime proof classes.

#### Scenario: Generated-output freshness is inherited, not row-owned

- **WHEN** the graph-owned package target and aggregate `wrapped-test` evidence
  pass from the corrected current stack
- **THEN** records SHALL keep broad generated-output freshness ownership
  separate from this row
- **AND** records SHALL state that this row owns only the package target and
  Habitat wrapped-test proof for the map-bundle runtime-import guard

#### Scenario: Product/runtime and apply closure are outside the row

- **WHEN** this row proves the package architecture test and Habitat wrapper
  selection
- **THEN** records SHALL NOT claim product/runtime proof
- **AND** records SHALL NOT claim apply safety, source remediation, or
  generated-output hand edits
