## Design

Mutating wrappers are explicit package functions. Every function names the state
role, validation sequence, postcondition, retry behavior, and risk category.

## Public Wrappers

- Existing lifecycle wrappers remain public:
  `restartCiv7Game`, `beginCiv7Game`, `restartCiv7GameAndBegin`.
- Autoplay:
  `getCiv7AutoplayStatus`, `configureCiv7Autoplay`, `startCiv7Autoplay`,
  `stopCiv7Autoplay`.
- Visibility:
  `revealCiv7MapForPlayer` and `exploreCiv7MapForPlayer` where direct runtime
  evidence supports equivalent behavior.
- Turn flow:
  `sendCiv7TurnComplete` and `sendCiv7TurnUnready` where App UI evidence
  supports them.
- Validators:
  `canStartCiv7UnitOperation`, `canStartCiv7UnitCommand`,
  `canStartCiv7CityOperation`, `canStartCiv7CityCommand`,
  `canStartCiv7PlayerOperation`.
- Requests:
  `requestCiv7UnitOperation`, `requestCiv7UnitCommand`,
  `requestCiv7CityOperation`, `requestCiv7CityCommand`,
  `requestCiv7PlayerOperation`.

## Validator-First Contract

Operation request wrappers run `canStart` first by default. A request proceeds
only when validation reports success. The request output contains the validation
result, request output, and postcondition snapshot where one is available.

## Selected Safe Gameplay/Debug Actions

The first approved actions are explicit autoplay, reveal/explore for developer
visibility debugging, turn complete/unready, and generic operation validators.
Generic request wrappers exist but classify high-risk operation types and
require the caller to pass the exact operation family, target id, operation
type, and arguments.

Autoplay start may be unbounded because `Autoplay.setActive(true)` is a native
supported mode. Bounded smoke runs remain available by passing `turns`, and
start clears a prior pause unless the caller explicitly requests paused
autoplay. Stop keeps `Autoplay.setPause(true)`, sets `setActive(false)`, and
waits for the return player plus a stable turn. `isActive === false` alone is
not a sufficient stop proof.

## Failure Behavior

Mutating wrappers do not retry after command send. If postcondition proof is not
observed, the wrapper reports a mutation-postcondition error with before/after
evidence.

## Review Lanes Required

- Product/safety review for player and LLM-agent use.
- Adversarial review for high-blast-radius requests and force semantics.
- Verification review for before/after proof.
