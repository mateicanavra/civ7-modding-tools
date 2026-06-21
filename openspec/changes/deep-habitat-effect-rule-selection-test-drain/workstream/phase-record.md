# Workstream Phase Record: Rule Selection Test Drain

## Context

Fresh test-duration investigation identified `rule-selection.test.ts` as a
remaining Habitat Harness unit suite that used broad runtime execution for a
small staged Grit no-root contract. The test had an explicit 90 second timeout
and still imported the Habitat runtime after earlier provider drains.

## Decision

Move the unit test to structural-check domain seams:

- selector refusal through `selectorRefusalReport`
- staged no-root disposition through `stagedPatternNotApplicableRecords`

Full command/check composition remains covered by package and owner validation,
not by this unit suite.

## Result

The focused rule-selection suite now completes with 11ms of reported test work.
The broad runtime import and long staged Grit timeout are removed from the
suite.
