## ADDED Requirements

### Requirement: Ecology Step Imports Use Their Executable Owner Layer

Habitat SHALL enforce the ecology step import/topology boundary through the
wrapped-test owner layer selected by `arch-test-ecology-step-imports`.

#### Scenario: Ecology step guardrails run through Habitat

- **WHEN** `habitat check --rule arch-test-ecology-step-imports` runs
- **THEN** Habitat SHALL run the Swooper Maps package target
- **AND** the target SHALL check active ecology stage source for static imports
  and re-exports from ecology ops/rules internals
- **AND** the target SHALL check that retired ecology topology directories are
  absent
- **AND** the rule SHALL pass when current source has no such findings

#### Scenario: Ecology step imports are not duplicated as Grit

- **WHEN** this row records ecology step import proof
- **THEN** the row SHALL NOT register an active Grit rule, Grit baseline, or
  injected Grit probe
- **AND** records SHALL state that this boundary remains wrapped-test-owned
  under the current Habitat rule catalog

### Requirement: Ecology Step Import Non-Claims Stay Explicit

Habitat SHALL keep the ecology step import proof separate from unrelated Grit,
generated-output, dynamic import, and runtime proof classes.

#### Scenario: Aggregate wrapped-test proof is inherited, not ecology-owned

- **WHEN** aggregate `wrapped-test` evidence passes from the corrected current
  stack
- **THEN** records SHALL keep generated-output freshness ownership separate
  from ecology step imports
- **AND** records SHALL state that ecology owns the ecology import/topology
  test repair, not the downstack generated-output freshness proof

#### Scenario: Dynamic imports and source strings are outside the row

- **WHEN** this row proves static import/re-export behavior
- **THEN** records SHALL NOT claim dynamic import or source-string closure
- **AND** records SHALL keep broad product/runtime proof outside the accepted
  outcome
