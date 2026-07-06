# Studio Run Runtime Observation

## Why

Runtime observation should validate the deployed request artifact after
deployment is complete. It should not compensate for missing manifest,
generation, or deployment records.

## System Context

Affected owners:

- `@civ7/direct-control` integration points
- Studio Run in Game workflow after deployment
- scripting log and setup row readback collection
- bounded post-start loaded-game readback through Studio `/rpc`
- private diagnostics/attribution records

This packet excludes broad runtime map parity readback. It owns the bounded
post-start loaded-game oracle used by final live verification: after game start,
Studio must observe a request-specific generated-artifact marker from the
running game that matches `RunCorrelation`, and must prove through public `/rpc`
reads that Civ7 is in a loaded/in-game state with a non-empty bounded map
snapshot sized for the request. Shape-only status/snapshot evidence is never
enough without the request marker. The supported observation contract is
scripting-log observation, setup-row readback, and loaded-game readback.

## Before And After

Before:

- runtime observation and attribution are mixed with deployment and public
  details;
- missing artifact records can be masked by later runtime checks.

After:

- observation starts only after manifest, generated mod, deployment, and
  deployed snapshot records exist;
- Studio establishes the scripting-log observation window before Civ7 start or
  focus;
- Studio collects `ScriptingLogObservation` and `SetupRowReadback`;
- Studio collects `LoadedGameReadback` after game start: a generated-artifact
  marker matching `RunCorrelation`, plus `civ7.live.status` and
  `civ7.live.snapshot` reads over the public `/rpc` oRPC mount;
- observations must match `RunCorrelation`;
- direct Civ7 control remains inside `@civ7/direct-control`;
- mismatched correlation fails the operation with public category
  `runtime-observation`.

## Behavior Verification

Behavior tests verify observation preconditions, log-window offset handling,
stale-log exclusion, matched correlation success, correlation mismatch failure,
setup row missing/mismatch failure, loaded-game readback missing/mismatch
failure, observation timeout, and direct-control error mapping.

## Structural Enforcement

Permanent positive assertions:

- runtime observation consumes deployment snapshot and run correlation records;
- Studio runtime calls direct-control through the owned direct-control boundary;
- observation records are private and not public status payloads.
- public `/rpc` live reads are the only accepted endpoint evidence for
  loaded-game readback; direct-control calls do not satisfy endpoint evidence.

Structural authority row: SA-12
`grit-studio-run-direct-control-observation-boundary`.

## Verification Gates

- Runtime observation behavior tests with fake direct-control/log readers.
- Live Studio endpoint plus Civ7-controlled observation gate that establishes a
  fresh log window, excludes stale log markers, observes the generated-artifact
  marker from the running game, reads setup row state, reads loaded-game status
  and bounded map snapshot through `civ7.live.status` and `civ7.live.snapshot`
  over `/rpc`, and correlates the deployed run.
- SA-12 `grit-studio-run-direct-control-observation-boundary`.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate studio-run-runtime-observation --strict`.
