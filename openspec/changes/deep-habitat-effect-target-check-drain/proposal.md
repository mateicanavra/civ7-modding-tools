# Change: Deep Habitat Effect Target Check Drain

## Why

Habitat was running package architecture tests as active structural rules through
`target-check`. That made `habitat check` pay for package test execution in the
fast structural loop and blurred ownership: source-shape policy, generated
bundle regressions, and domain correctness tests were all presented as the same
kind of Habitat rule.

The product shape needs Habitat to be the harness that composes the right tool
for each kind of repository constraint. Source-shape constraints belong to
source-check/pattern ownership. Generated bundle and domain correctness
regressions belong to package build/test targets. The harness should report and
compose those layers without reclassifying every useful package test as a
structural rule.

## What Changes

- Remove all active `.habitat/rules/arch-test-*` `target-check` rows and their
  empty baselines.
- Replace the source-shape portions with source-check pattern rules:
  `rng-authority-static`, `ecology-step-imports`, and
  `cutover-source-guardrails`.
- Expand `mapgen-core-runtime-civ7` to cover the same production-source surface
  as the removed core purity architecture test.
- Keep generated bundle and domain-correctness architecture tests available as
  package Nx test/build targets, not Habitat structural rules.
- Update Habitat capability docs, OpenSpec records, and rule counts to state the
  current owner model.

## Non-Goals

- Do not delete the package tests.
- Do not add test-based topology enforcement.
- Do not add compatibility shims, fallback rows, or duplicate active
  implementations.
- Do not replace Nx import-boundary semantics with a second graph-law engine.

## Validation

- `habitat check --tool pattern-check` must pass with the replacement rules.
- Default `habitat check` must no longer run active `target-check` rows.
- Package architecture targets remain defined in their owning packages.
- OpenSpec validation must pass for this change.
