# Phase Record: Nx Single Target Provider

## Context

This slice follows the slow-check investigation. Source-check planning reduced
pattern-check cost; the remaining structural-check cost is graph-backed rule
execution, especially `import-boundaries`.

## Decision

Use the vendor-native single-target Nx command when structural-check has already
resolved exactly one target. Keep `runMany` for true batches.

## Closure Notes

- This does not replace Nx as import-boundary authority.
- This does not change root graph/CI/hook target lists.
- A later slice can revisit graph dependency resolution for direct provider
  rules, but this phase is scoped to provider target execution.
