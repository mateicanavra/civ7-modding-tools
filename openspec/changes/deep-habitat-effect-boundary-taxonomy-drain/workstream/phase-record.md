# Phase Record: Boundary Taxonomy Drain

## Context

The target-check drain removed package architecture wrappers from Habitat
structural execution, but the package test suite still contained a live
workspace graph audit. In the latest observed run, `boundary-taxonomy.test.ts`
took roughly 8.6 seconds, dominating `@internal/habitat-harness:test`.

## Decision

Move current workspace boundary taxonomy validation to an explicit cacheable Nx
target. Keep unit tests pure and fixture-bounded. The target is package-owned in
`tools/habitat-harness/package.json`, and normal workflow entrypoints include it
through root `bun run check` plus Habitat verify/pre-push target planning.

## Review Findings

- Accepted: the live audit could not become a forgotten manual package script.
  It is now in the normal check/verify/pre-push target path.
- Accepted: docs initially described the target as plugin-inferred. They now
  describe graph exposure as plugin-inferred targets plus package-declared Nx
  targets.
- Deferred to the next drain: native Grit fixture proof and public-surface guard
  scans still have too much subprocess/source-scan weight inside package tests.

## Closure Boundary

This slice closes only the test/topology ownership error for boundary taxonomy.
It does not claim the full Habitat aggregate check is fast enough; additional
dominoes must still address aggregate pattern-check/import-boundary cost and the
remaining tests that shell out to structural scans.

## Verification Notes

- Focused boundary taxonomy test body dropped from the prior observed roughly
  8.6 seconds to fixture-bounded execution (`36ms` focused, `253ms` in the full
  package suite before follow-on wiring; final full package suite shows `111ms`
  for `boundary-taxonomy.test.ts` and `22.32s` overall).
- Direct live boundary taxonomy validation passes with
  `ok=true`, `projectCount=23`, `nxProjectCount=22`, `graphEdgeCount=46`,
  `issueCount=0`.
- Cached Nx target path resolves as
  `@internal/habitat-harness:validate:boundary-taxonomy`.
- `habitat verify --base HEAD~1 --json` plans affected targets as
  `build`, `check`, `test`, and `validate:boundary-taxonomy`.
- `habitat check --json` remains green with 49 rules. Current structural cost is
  now dominated by pattern checks and import-boundaries, not boundary taxonomy
  unit tests.
