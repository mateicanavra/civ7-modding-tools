## 1. Package Actions

- [x] 1.1 Implement action result, risk, validation, and postcondition types.
- [x] 1.2 Implement autoplay status/configure/start/stop wrappers.
- [x] 1.3 Implement reveal/explore map wrapper with visibility before/after
  proof.
- [x] 1.4 Implement turn-complete/unready wrappers with GameContext before/after
  proof where direct evidence supports them.
- [x] 1.5 Implement unit/city/player operation and command validators.
- [x] 1.6 Implement request wrappers with validator-first behavior and
  no automatic replay.
- [x] 1.7 Add mock socket tests for command builders, validation parsing,
  failures, and no-replay behavior.

## 2. Tooling Integration

- [x] 2.1 Add CLI commands for autoplay, reveal, and operation validators.
- [x] 2.2 Add CLI tests for action command surfaces.

## 3. Live Proof

- [x] 3.1 Gate live autoplay proof behind explicit bounded-start and stop proof;
  native unbounded start is allowed when no turn count is supplied.
- [x] 3.2 Gate live reveal/explore proof behind developer/disposable-session
  proof; no live mutation run without that proof.
- [x] 3.3 Validate operation wrappers with mock socket proof; live validator
  proof remains evidence-limited by current observer session.
- [x] 3.4 Record proof limits in workstream verification notes.

## 4. Verification

- [x] 4.1 Run direct-control package tests/check/build.
- [x] 4.2 Run focused CLI tests/check/build.
- [x] 4.3 Run OpenSpec validation and `git diff --check`.
