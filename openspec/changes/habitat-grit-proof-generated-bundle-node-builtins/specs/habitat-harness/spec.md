## ADDED Requirements

### Requirement: Generated Bundle Runtime Safety Has Executable Proof

Habitat SHALL keep generated game UI bundle runtime-safety proof executable
through the owner layer that can inspect generated artifacts without
hand-editing them.

#### Scenario: Intelligence Bridge UI bundle is wrapped by Habitat

- **WHEN** `habitat check --rule arch-test-intelligence-bridge-bundle-runtime-imports`
  runs
- **THEN** Habitat SHALL run the Intelligence Bridge bundle package test through
  the package-owned Nx target
- **AND** the target SHALL depend on this package's generated-bundle build
  chain before reading the generated UI bundle
- **AND** the bundle build SHALL run after upstream workspace package builds
  needed to resolve bundled workspace exports
- **AND** the rule SHALL report Node builtin imports, Node builtin
  `require(...)` calls, Node builtin dynamic imports, direct-control tokens, or
  runtime transport tokens in the generated UI bundle

#### Scenario: Generated output is not registered as a Grit scan root

- **WHEN** this row records generated-bundle proof
- **THEN** the row SHALL NOT claim active Grit proof over generated outputs
- **AND** generated files SHALL be scanned or regenerated through owner
  commands rather than hand-edited

### Requirement: Generated Bundle Non-Claims Stay Explicit

Habitat SHALL keep generated-bundle proof classes separate from Grit-row proof
classes.

#### Scenario: Swooper map bundle freshness is separately owned

- **WHEN** historical row-local evidence showed a manifest-listed Swooper map
  bundle missing from the ignored generated output directory
- **THEN** records SHALL treat that evidence as superseded by the accepted
  map-bundle/downstack freshness repair
- **AND** records SHALL NOT claim Swooper map bundle closure from the
  Intelligence Bridge wrapped-test proof
