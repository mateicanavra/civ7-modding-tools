## ADDED Requirements

### Requirement: Final Matrix Uses The Canonical Config Product Path

MapGen Studio SHALL close Run in Game only after every required complete
canonical config starts its generated content through the rendered control.

#### Scenario: Swooper Earthlike completes

- **WHEN** the rendered Studio selects `swooper-earthlike`,
  `ToT_BasicModsEnabled.Civ7Cfg`, seed `1538316415`, `MAPSIZE_HUGE`,
  10 players, and balanced resources
- **AND** the user clicks Run in Game
- **THEN** exactly one request completes in Civ7
- **AND** retained evidence satisfies the exact per-row correlation contract

#### Scenario: Latest Juicy completes

- **WHEN** the same fixed tuple selects `latest-juicy`
- **AND** the user clicks Run in Game
- **THEN** exactly one request completes in Civ7
- **AND** retained evidence satisfies the exact per-row correlation contract

#### Scenario: Swooper Desert Mountains completes

- **WHEN** the same fixed tuple selects `swooper-desert-mountains`
- **AND** the user clicks Run in Game
- **THEN** exactly one request completes in Civ7
- **AND** retained evidence satisfies the exact per-row correlation contract

### Requirement: Every Live Row Has One Exact Evidence Chain

Each successful P21 row SHALL connect the rendered request to the exact
generated and loaded content without exposing private diagnostics publicly.

#### Scenario: A required row reaches terminal success

- **WHEN** a required rendered request reaches public phase `completed`
- **THEN** one request id and diagnostics id identify the operation
- **AND** a request-specific scripting marker matches every `RunCorrelation`
  field from the parsed generation manifest
- **AND** the setup row is
  `{mod-swooper-studio-run}/maps/studio-run.js`
- **AND** `runArtifactId` remains correlation identity rather than a filename
- **AND** generated and deployed script identities and digests match
- **AND** exact-authorship evidence has `status: "complete"` and
  `unresolvedLinks: []`
- **AND** the separate attribution report has `status: "complete"` and
  `missingSections: []`
- **AND** balanced resources agree in the admitted launch envelope and generation
  manifest while setup readback proves seed, size, players, mods, and map row
- **AND** setup evidence separately proves the stable row, target mod, seed,
  size, and players
- **AND** loaded-game evidence separately proves in-game state, `106x66`
  dimensions, and turn at least 1
- **AND** recipe-owned validation proves a nondegenerate playable result
- **AND** the Civ7 application process is unchanged
- **AND** pre/post `/healthz` retains the same `repoRoot`, `serverInstanceId`,
  and `startedAt`
- **AND** public status/current/event output contains no private diagnostics or
  local paths

### Requirement: Controlled Failure And Recovery Stay Deterministic

P21 SHALL use executable behavior gates for controlled failure, recovery,
freshness, and redaction instead of manufacturing additional live Civ7
mutations.

#### Scenario: A controlled non-success case is verified

- **WHEN** validation, ownership, cancellation, terminal adoption, row mismatch,
  saved-config mismatch, freshness, or redaction behavior is checked
- **THEN** its concrete Nx/test owner in `design.md` proves the closed contract
- **AND** the case is not repeated as a live Civ7 mutation merely for evidence

### Requirement: Final Rows Bind To The Frozen Runtime Tree

The required live matrix SHALL run after A.2 and A.3 reconverge on the frozen
runtime-relevant candidate.

#### Scenario: Runtime-relevant source changes after a row

- **WHEN** any runtime-relevant source, asset, lifecycle, contract, generation,
  or dependency authority changes after a required row
- **THEN** all three rows are invalidated and rerun against the new exact tree
- **AND** record-only changes rerun only their static validation
