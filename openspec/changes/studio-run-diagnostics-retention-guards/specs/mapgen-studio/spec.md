## ADDED Requirements

### Requirement: Run In Game Diagnostics Have Explicit Retention

MapGen Studio SHALL retain request workspaces, diagnostics, and attribution by a
declared policy.

#### Scenario: Cleanup runs

- **WHEN** cleanup runs at daemon startup or operation terminalization
- **THEN** active operations are preserved
- **AND** terminal operations are retained for 72 hours and at least the latest
  100 terminal operations ordered by terminal timestamp and request-id
  tie-breaker

#### Scenario: Diagnostics are queried after cleanup

- **WHEN** diagnostics lookup is queried for a retained operation
- **THEN** Studio returns the private diagnostics record
- **AND** if an attribution report was created, Studio returns it through that
  private lookup
- **AND** if any required attribution section is missing, Studio returns the
  incomplete report with missing-section status
- **AND** pre-admission diagnostics without a request workspace are exempt from
  attribution report lookup

### Requirement: Runtime Topology Is Enforced By Authority Rules

MapGen Studio SHALL enforce permanent Run in Game runtime/materialization
topology through the structural authority matrix rather than behavior tests.

#### Scenario: Packet train closes

- **WHEN** the runtime/materialization restructuring is complete
- **THEN** SA-14 verifies that SA-01 through SA-13 are registered and green
- **AND** behavior tests remain scoped to product and code behavior

### Requirement: Final Closure Requires Live Run In Game Verification

MapGen Studio SHALL run the live Run in Game verification matrix before green
closure.

#### Scenario: Final packet closes

- **WHEN** the final packet closes
- **THEN** implementation runs the live verification matrix defined in the
  target vocabulary against actual Studio endpoints
- **AND** successful launch variants are verified in Civilization 7
- **AND** post-start Civilization 7 evidence shows the loaded game is using the
  generated Studio-run artifact
- **AND** API/control variants exercise validation, ownership, and cancellation
  through actual Studio endpoints
- **AND** records public phases, request workspace artifacts, matched
  correlation, and terminal completed status
- **AND** closure remains open until the live matrix passes
