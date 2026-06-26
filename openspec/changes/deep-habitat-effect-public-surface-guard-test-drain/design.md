# Design: Public Surface Guard Test Drain

## Ownership

Public-surface guard enforcement has two execution forms:

- **Current-tree enforcement:** the `.habitat` rule continues to call
  `scripts/lint/lint-habitat-public-surface-guards.mjs`.
- **Guard model tests:** Vitest calls
  `tools/habitat-harness/src/domains/public-surface-guards/guard.js` directly
  with injected fixture files.

The root lint script is an adapter, not the home of the guard logic.

## Module Shape

The owned source module exports:

- `runPublicSurfaceGuard(options)`, returning `{ ok, failures }`;
- `renderPublicSurfaceGuardFailures(result)`, preserving CLI failure output.

The module accepts either an injected fixture root for CLI compatibility or an
in-memory injected file map for unit tests.

## Boundary

This slice only changes test and script structure. It does not alter the guard
catalog, allowlists, failure messages, or `.habitat` rule registration.
