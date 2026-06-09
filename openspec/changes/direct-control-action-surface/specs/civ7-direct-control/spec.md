## ADDED Requirements

### Requirement: Direct Control Provides Explicit Mutating Wrappers

The direct-control package SHALL expose mutating Civ7 controls only as explicit
wrapper functions with state role, validation, failure, and proof contracts.

#### Scenario: Autoplay is configured and started
- **WHEN** a caller configures or starts autoplay
- **THEN** the package sets autoplay fields through a proven state role
- **AND** it returns before/after autoplay status
- **AND** it allows native unbounded start when no turn count is supplied
- **AND** it restores a concrete return player when one can be inferred
- **AND** it exposes a stop function that keeps native pause enabled and waits
  for inactive, player-restored, turn-stable status

#### Scenario: Map is revealed or explored for a player
- **WHEN** a caller requests reveal or explore map behavior
- **THEN** the package requires a player id
- **AND** it captures visibility facts before and after the mutation
- **AND** it reports whether the postcondition was observed

#### Scenario: Caller completes a turn
- **WHEN** a caller requests turn completion
- **THEN** the package uses the App UI turn-complete surface where available
- **AND** it returns before/after turn-complete facts or a classified
  unavailable-action error

### Requirement: Direct Control Validates Gameplay Operations Before Requests

The direct-control package SHALL expose unit, city, and player operation
validators and SHALL use validator-first behavior for operation requests.

#### Scenario: Caller validates a unit operation
- **WHEN** a caller validates a unit operation or command
- **THEN** the package runs the corresponding `Game.UnitOperations.canStart` or
  `Game.UnitCommands.canStart` command in the Tuner role
- **AND** it returns the serialized validation result without mutating gameplay

#### Scenario: Caller requests an operation
- **WHEN** a caller requests a unit, city, or player operation through the
  package
- **THEN** the package runs `canStart` first unless the wrapper contract defines
  a source-backed exception
- **AND** it sends the request only when validation reports success
- **AND** it returns validation, request output, and postcondition evidence

#### Scenario: Operation validation fails
- **WHEN** `canStart` does not report success
- **THEN** the package does not send `sendRequest`
- **AND** it returns a classified validation-rejected result

### Requirement: Mutations Are Bounded And Auditable

Mutating wrappers SHALL produce enough before/after evidence for developers and
LLM-agent callers to understand what happened.

#### Scenario: Mutating command times out
- **WHEN** a mutating command times out or the socket closes after send
- **THEN** the package reports an explicit error
- **AND** it does not replay the command automatically
