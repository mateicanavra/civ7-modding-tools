# Phase Record: Public Surface Guard Test Drain

## Context

After the boundary taxonomy and Grit fixture drains, package tests still had a
source-scan subprocess test in `public-surface-guards.test.ts`.

## Decision

Extract public-surface guard logic into Habitat source and keep the root lint
script as a wrapper. Unit tests call the guard module with in-memory injected
files.

## Closure Boundary

This slice closes the public-surface guard subprocess test. It does not optimize
the current-tree Habitat rule execution or broader Vitest transform/import cost.

## Verification Notes

- Focused guard test passes with `104ms` test time after extraction.
- `bun scripts/lint/lint-habitat-public-surface-guards.mjs` and
  `node scripts/lint/lint-habitat-public-surface-guards.mjs` both pass.
- Final focused guard test passed with `184ms` test time after formatting.
- Full Habitat package tests, package typecheck, package build, Habitat
  `check --json`, strict OpenSpec change validation, full OpenSpec validation,
  and `git diff --check` passed.
- In the Habitat check run, `habitat-public-surface-guards` reported `446ms`.
