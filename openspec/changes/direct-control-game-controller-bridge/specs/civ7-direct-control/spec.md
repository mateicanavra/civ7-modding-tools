## ADDED Requirements

### Requirement: Direct Control Provides A Game-Scoped Controller Bridge

The direct-control package SHALL support a project-owned game-scoped App UI
controller bridge after the controller mod is deployed and ready.

#### Scenario: Controller bridge is ready
- **WHEN** App UI reports an in-game `GameStarted` state
- **AND** `globalThis.Civ7IntelligenceBridge.invoke(...)` responds with a
  compatible protocol version and capability list
- **THEN** the package reports controller readiness separately from App UI
  readiness and Tuner canary readiness
- **AND** it records the controller version and capabilities in the proof output

#### Scenario: Controller bridge is absent
- **WHEN** App UI is in-game but `Civ7IntelligenceBridge` is absent or
  incompatible
- **THEN** the package reports a classified controller-unavailable result
- **AND** it does not silently run a raw Tuner command for a controller-backed
  product wrapper unless the caller explicitly selected diagnostic or parity
  mode

### Requirement: Proven Gameplay Reads Use The Controller Bridge

The direct-control package SHALL route proven gameplay read families through the
game-scoped controller bridge after lifecycle and parity proof pass.

#### Scenario: Caller requests a controller-proven read
- **WHEN** a caller requests a map, plot, player, unit, city, visibility, or
  bounded `GameInfo` read whose controller parity proof has passed
- **THEN** the package calls the corresponding controller method
- **AND** it returns bounded structured output with observed turn, state, and
  controller provenance

#### Scenario: Caller requests parity comparison
- **WHEN** a caller requests parity comparison for a supported read family
- **THEN** the package reads through the controller and the historical wrapper
  on the same turn where possible
- **AND** it reports field-level match, mismatch, missing, and unsupported
  evidence without promoting unmatched fields

### Requirement: Proven Operation Validation Uses The Controller Bridge

The direct-control package SHALL route proven unit, city, and player operation
validation through the game-scoped controller bridge after validation parity
proof passes.

#### Scenario: Caller validates an operation
- **WHEN** a caller validates a unit, city, or player operation family whose
  controller validation parity proof has passed
- **THEN** the package calls `operations.validate` through the controller
- **AND** it returns the serialized validation result without mutating gameplay

#### Scenario: Validation parity is not proven
- **WHEN** validation parity is missing for the requested family
- **THEN** the package reports that controller validation is unavailable for that
  family
- **AND** it only uses historical raw validation wrappers in diagnostic, parity,
  or explicitly selected legacy mode

### Requirement: Approved Controller Actions Preserve Direct-Control Authority

The controller bridge SHALL NOT execute gameplay mutations except through exact
direct-control-approved helper requests.

#### Scenario: Caller requests an approved helper action
- **WHEN** direct-control has created an approval record for an allowlisted
  helper action
- **AND** the request includes protocol version, request id, operation family,
  target id, operation type, bounded args, approval token, and idempotency key
- **THEN** the controller may execute the exact helper once
- **AND** direct-control rereads semantic postconditions before promoting the
  result

#### Scenario: Caller omits approval metadata
- **WHEN** a controller action request lacks approval metadata or an idempotency
  key
- **THEN** the controller rejects the request
- **AND** no `sendRequest` call is made

