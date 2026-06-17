# Source Synthesis - Stage Contract Dependencies

## Authority

`docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md` defines step
contracts as typed authoring contracts. Direct `requires` and `provides` tags
are dependency metadata, while `artifacts.requires` and `artifacts.provides`
carry artifact contract references. `packages/mapgen-core/src/authoring/step/contract.ts`
normalizes those typed values and rejects direct artifact strings when
artifacts are present.

The corpus ledger candidate asks for literal dependency-key drift detection in
stage contracts. This row narrows that to string-like literals in top-level
`defineStep` dependency arrays.

## Current Predicate

- Root: `mods/mod-swooper-maps/src/recipes/standard/stages`
- Current Grit file predicate:
  `mods/mod-swooper-maps/src/recipes/standard/stages/.*/(?:contract|.*\.contract)\.ts$`
- Current syntax predicate: `defineStep({ ... })` top-level `requires` or
  `provides` arrays containing string literal elements.
- Artifact arrays under `artifacts.*` are false-positive controls, not owned
  positives.

## Inventory Summary

The parser inventory scanned 216 stage TS/TSX/JSON files and found 68 current
contract files. It counted 53 direct `requires` arrays, 53 direct `provides`
arrays, 51 artifact `requires` arrays, and 50 artifact `provides` arrays, with
0 direct string-like candidates and 0 parse diagnostics.

## Boundaries

Artifact dependency enforcement, generated artifact parity, and semantic DAG
validation are adjacent proof surfaces, not this row's proof. This row is a
static contract-authoring guard for direct literal dependency keys.
