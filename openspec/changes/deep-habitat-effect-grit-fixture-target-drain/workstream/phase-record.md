# Phase Record: Grit Fixture Target Drain

## Context

After the boundary taxonomy drain, package tests still contained native vendor
execution. `workspace-tools.test.ts` ran live `grit --version`, and the package
script for pattern fixtures used `grit patterns test --json`, producing a large
machine-output stream on stderr through the Bun wrapper.

## Decision

Move checked-in Grit pattern fixture validation to a cacheable package-owned Nx
target. Keep unit tests focused on command materialization.

## Closure Boundary

This slice closes native Grit fixture proof ownership. It does not optimize
current-tree `grit:check`, import boundaries, or public-surface guard scan tests.

## Verification Notes

- Baseline `validate:grit-patterns` passed in roughly `0.86s`, but emitted a
  very large JSON stream through stderr.
- Native `grit patterns test` without `--json` passed in roughly `0.60s` with
  concise output.
- `nx run @internal/habitat-harness:validate:grit-patterns` passes and reports
  40 testable patterns with all 78 samples passing.
- Focused `workspace-tools.test.ts` passes with `15ms` test time after removing
  live Grit execution.
- Full Habitat package suite remains green. Current remaining runtime is mostly
  Vitest transform/import plus other scan or timeout-oriented tests, not native
  Grit availability proof.
- `habitat verify --base HEAD~1 --json` plans affected targets as `build`,
  `check`, `test`, `validate:boundary-taxonomy`, and
  `validate:grit-patterns`.
