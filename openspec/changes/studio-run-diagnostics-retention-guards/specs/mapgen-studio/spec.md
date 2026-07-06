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

MapGen Studio SHALL run the live Run in Game verification contract before green
closure.

#### Scenario: Civ7 live environment is available

- **WHEN** the final packet closes
- **THEN** implementation runs the live verification scenario defined in the
  target vocabulary
- **AND** records public phases, request workspace artifacts, matched
  correlation, and terminal completed status

#### Scenario: Civ7 live environment is unavailable

- **WHEN** the final packet cannot run live verification
- **THEN** implementation records not-green closure with the missing
  prerequisite and exact re-entry protocol
