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
- private diagnostics/attribution records

This packet excludes runtime map readback. The supported observation contract is
scripting-log observation plus setup-row readback.

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
- observations must match `RunCorrelation`;
- direct Civ7 control remains inside `@civ7/direct-control`;
- mismatched correlation fails the operation with public category
  `runtime-observation`.

## Behavior Verification

Behavior tests verify observation preconditions, log-window offset handling,
stale-log exclusion, matched correlation success, correlation mismatch failure,
setup row missing/mismatch failure, observation timeout, and direct-control error
mapping.

## Structural Enforcement

Permanent positive assertions:

- runtime observation consumes deployment snapshot and run correlation records;
- Studio runtime calls direct-control through the owned direct-control boundary;
- observation records are private and not public status payloads.

Structural authority row: SA-12
`grit-studio-run-direct-control-observation-boundary`.

## Verification Gates

- Runtime observation behavior tests with fake direct-control/log readers.
- SA-12 `grit-studio-run-direct-control-observation-boundary`.
- `bun run openspec -- validate studio-run-runtime-observation --strict`.
