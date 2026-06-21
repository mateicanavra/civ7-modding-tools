# Design: Rule Selection Test Drain

## Frame

Rule selection is a Habitat domain boundary. It decides which registered rules
are in scope, how selector refusals become check reports, and how staged Grit
rules remain explicit when staged paths are outside approved scan roots.

The previous tests proved those contracts through `createCheckReportEffect` and
`runHabitatEffect`. That entered the full runtime and required a 90 second test
timeout for a case that should not touch Grit, baselines, providers, Nx, or host
processes.

## Ownership

- `tools/habitat-harness/src/domains/structural-check/selection.ts` owns
  selector-refusal report construction.
- `tools/habitat-harness/src/domains/structural-check/execution.ts` owns staged
  Grit scan-root decisions and rule execution records.
- `tools/habitat-harness/test/lib/rule-selection.test.ts` owns fixture-level
  coverage for rule selector and staged disposition behavior.

## Implementation

Expose `selectorRefusalReport` from the structural-check public domain barrel so
tests and service modules can use the same owned selector-refusal projection
without entering full report execution.

Add `stagedPatternNotApplicableRecords` to `execution.ts`. The helper takes the
already selected Grit rule facts and computed staged scan roots. If there are no
approved roots, it returns the exact not-applicable execution records used by
the live execution path. If scan roots exist, it returns `undefined` so live
execution continues through `SourceCheck`.

Update `executeSelectedRulesEffect` to call the helper before resolving
`SourceCheck`. This keeps the live behavior unchanged while making the
not-applicable branch explicit and directly testable.

## Risks

- The helper must remain an owned execution-domain policy, not a second report
  model.
- Full report coverage for staged Grit now lives in package/owner validation,
  while the unit test owns only the narrow disposition contract.
