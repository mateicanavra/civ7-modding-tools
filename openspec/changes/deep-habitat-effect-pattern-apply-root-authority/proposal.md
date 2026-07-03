# Change: Deep Habitat Effect Pattern Apply Root Authority

## Why

Habitat apply admissions are transformation contracts. They should not derive
their dry-run scope from whichever diagnostic tool currently owns a related
rule. That coupling broke when `docs-local-checkout-paths` moved from
source-check to command-check: the docs apply admission stayed registered, but
its transaction input no longer had roots.

## What Changes

- Make built-in apply admissions declare their dry-run roots directly.
- Gate apply transaction inputs by registered rule identity rather than
  source-check-only facts.
- Preserve existing apply admissions while allowing command-owned diagnostic
  rules to participate in apply transactions.

## Non-Goals

- Do not reclassify docs hygiene as source-check.
- Do not change Grit apply pattern syntax.
- Do not add topology tests.
- Do not execute live apply in unit tests.

## Validation

- Pattern-governance tests must show both built-in apply admissions produce
  non-empty dry-run roots.
- Habitat package test/check must pass.
- OpenSpec validation, Biome, and whitespace checks must pass.
