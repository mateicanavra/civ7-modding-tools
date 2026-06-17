## ADDED Requirements

### Requirement: Shim Cutover Terms Use Their Executable Owner Layer

Habitat SHALL enforce the Swooper cutover/shim structural boundary through the
wrapped-test owner layer selected by `arch-test-cutover`.

#### Scenario: Cutover checks run through Habitat

- **WHEN** `habitat check --rule arch-test-cutover` runs
- **THEN** Habitat SHALL run the Swooper Maps cutover package target
- **AND** the target SHALL run the no-shim, no-dual-contract-path,
  foundation-topology, and no-op-calls-op tectonics checks
- **AND** the rule SHALL pass when current Swooper runtime source has no such
  findings

#### Scenario: Shim term inventory remains source-root scoped

- **WHEN** this row records shim vocabulary inventory evidence
- **THEN** the inventory SHALL use the runtime source roots and term set owned
  by `no-shim-surfaces.test.ts`
- **AND** records SHALL NOT present this as broad documentation keyword
  enforcement

#### Scenario: Cutover vocabulary is not duplicated as Grit

- **WHEN** this row records cutover/shim proof
- **THEN** the row SHALL NOT register an active Grit rule, Grit baseline, or
  injected Grit probe
- **AND** records SHALL state that cutover enforcement remains test-owned under
  the current invariant corpus

### Requirement: Shim Cutover Non-Claims Stay Explicit

Habitat SHALL keep cutover proof separate from unrelated generated-output,
Grit, and product proof classes.

#### Scenario: Aggregate wrapped-test remains current-red for another rule

- **WHEN** aggregate `wrapped-test` evidence includes a Swooper map bundle
  freshness failure
- **THEN** records SHALL keep that failure separate from cutover
- **AND** records SHALL NOT claim aggregate wrapped-test closure from the
  cutover per-rule proof
