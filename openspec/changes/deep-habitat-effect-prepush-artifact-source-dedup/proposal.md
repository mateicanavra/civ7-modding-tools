# Change: Deep Habitat Effect Pre-Push Artifact Source Dedup

## Why

Artifact-only pre-push routing still over-selects checks for source-check rule
metadata. A `.habitat/rules/<source-rule>/rule.json` edit currently asks Nx for
both `habitat:check` and `source:check`, which can run the same source-check
rule family twice.

Habitat artifact routing should use the existing Nx target graph more precisely:
source-check rule metadata belongs to the aggregate source-check target, while
non-source rule metadata belongs to that rule's inferred target.

## What Changes

- Make Habitat artifact path planning registry-aware.
- Route source-check rule metadata changes to `source:check`.
- Route non-source rule metadata changes to the owning `habitat:rule:<id>`
  target.
- Preserve Grit pattern fixture validation for `.habitat/patterns/**`.
- Keep broad `habitat:check` only for unclassified Habitat artifacts.

## Non-Goals

- Do not change ordinary source-file pre-push routing.
- Do not change source-check rule execution behavior.
- Do not add topology tests for structure enforcement.
