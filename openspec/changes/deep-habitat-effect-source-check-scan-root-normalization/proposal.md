# Change: Deep Habitat Effect Source Check Scan Root Normalization

## Why

Habitat source-check should behave like a fast local feedback loop. Earlier
source-check planning reduced unnecessary rule invocations, but file discovery
still walked overlapping registry roots separately and deduped paths only after
traversal. That made broad source-check rules pay for the same directories more
than once.

## What Changes

- Plan source-check filesystem traversal from a collapsed set of selected scan
  roots.
- Remove nested scan roots when an already-selected ancestor covers the same
  repository subtree.
- Preserve rule applicability and staged/explicit selector behavior; only the
  shared file collection plan changes.

## Non-Goals

- Do not change rule registry records.
- Do not change generated source-check rule modules.
- Do not add structural topology tests.
- Do not replace source-check with live Grit execution.

## Validation

- Focused source-check scan-root planner tests must pass.
- Habitat package check must pass.
- Source-check CLI execution must remain behavior-compatible.
- OpenSpec validation, Biome, and whitespace checks must pass.
