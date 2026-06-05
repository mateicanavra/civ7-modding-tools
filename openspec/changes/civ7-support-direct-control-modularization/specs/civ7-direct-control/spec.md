## ADDED Requirements

### Requirement: Civ7 Support Control Workstream Preserves Modularization Before Composition

The support control workstream SHALL migrate accumulated play-support behavior
through focused CLI ownership and direct-control atoms before adding Effect/oRPC
transport composition.

#### Scenario: CLI play tests are extracted
- **WHEN** a CLI play command owner is moved out of the monolith
- **THEN** the focused suite lives under `packages/cli/test/commands/game/play/**`
- **AND** `test:cli:play` lists the suite explicitly
- **AND** equivalent monolith coverage is removed only after the focused suite
  exists
- **AND** adjacent monolith filters prove remaining owners still pass

#### Scenario: Direct-control atoms are extracted
- **WHEN** runtime logic is moved out of `packages/civ7-direct-control/src/index.ts`
- **THEN** the new module has an owning runtime atom name
- **AND** callers continue to use package-owned functions rather than raw
  JavaScript strings or caller-local socket state
- **AND** package tests and focused CLI consumers verify the move

#### Scenario: Effect/oRPC procedures are added
- **WHEN** an Effect/oRPC control procedure is introduced
- **THEN** it composes a stable direct-control atom or procedure core
- **AND** it does not define the runtime behavior through transport routing
- **AND** it includes typed input/output schema, context/error shaping,
  correlation identity, and validator gates when mutation-facing

### Requirement: Civ7 Support Proof Claims Stay Evidence-Scoped

The support control workstream SHALL label test-only, direct-control source,
and runtime behavior proof separately.

#### Scenario: A test-only slice closes
- **WHEN** a branch only moves tests or test fixtures
- **THEN** closure claims local test ownership only
- **AND** no runtime/direct-control behavior is claimed from local tests

#### Scenario: A mutation-facing runtime slice closes
- **WHEN** a branch changes mutation-facing direct-control behavior
- **THEN** it requires validator-first behavior,
  no-repeat-after-unverified semantics, postcondition evidence, and
  support-owned real-game proof when Civ7 is responsive
- **AND** if Civ7 is unavailable the closure records `pending-runtime-proof`

### Requirement: Civ7 Support Relationship Labels Require Official Evidence

The support control workstream SHALL treat relationship and city-state labels as
neutral unless official relationship, team, war, or suzerain evidence proves a
stronger claim.

#### Scenario: A tactical or notification surface renders actor labels
- **WHEN** a surface has owner mismatch, proximity, contact, visibility, hidden
  facts, or a sidecar label
- **THEN** it does not render hostile, enemy, non-friendly, opponent, threat,
  war, ally, or suzerain labels from those facts alone
- **AND** tests include negative guards when the surface could imply those
  labels
