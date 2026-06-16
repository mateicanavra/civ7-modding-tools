## ADDED Requirements

### Requirement: M11 Projection Band Uses Its Executable Owner Layer

Habitat SHALL enforce the M11 projection-band regression boundary through the
wrapped-test owner layer selected by `arch-test-m11-projection-band`.

#### Scenario: M11 projection-band guardrail runs through Habitat

- **WHEN** `habitat check --rule arch-test-m11-projection-band` runs
- **THEN** Habitat SHALL run the Swooper Maps package target
- **AND** the target SHALL run the M11 projection-band package test
- **AND** the rule SHALL pass when the package test proves boundary regime and
  signals project beyond the exact plate-boundary line

#### Scenario: M11 projection-band proof is not duplicated as Grit

- **WHEN** this row records M11 projection-band proof
- **THEN** the row SHALL NOT register an active Grit rule, Grit baseline, or
  injected Grit probe
- **AND** records SHALL state that this boundary remains wrapped-test-owned
  under the current Habitat rule catalog

### Requirement: M11 Projection Band Non-Claims Stay Explicit

Habitat SHALL keep the M11 projection-band proof separate from unrelated Grit,
generated-output, model-wide, and runtime proof classes.

#### Scenario: Aggregate wrapped-test proof is inherited, not M11-owned

- **WHEN** aggregate `wrapped-test` evidence passes from the corrected current
  stack
- **THEN** records SHALL keep generated-output freshness ownership separate
  from M11 projection-band proof
- **AND** records SHALL state that M11 owns only the package architecture test
  proof for the projection-band regression boundary

#### Scenario: Product/runtime and model-wide closure are outside the row

- **WHEN** this row proves the package architecture test and Habitat wrapper
  selection
- **THEN** records SHALL NOT claim product/runtime proof
- **AND** records SHALL NOT claim full Foundation topology or model-wide
  tectonic correctness closure
