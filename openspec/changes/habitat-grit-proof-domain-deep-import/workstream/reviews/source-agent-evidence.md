# Source Agent Evidence - Domain Deep Import

## Objective

Gather independent evidence for whether `grit-domain-deep-import` is ready to
become an implementation-proof workstream, while preserving the boundary
between check proof and apply proof.

## Confirmed Evidence

- Native Grit fixture proof passes for the current pattern with exact
  `ops-by-id` positives and lookalike negatives.
- Prior seed notes claimed Habitat wrapper proof for
  `bun run habitat:check -- --json --rule grit-domain-deep-import`; those
  notes remain historical context only. Current restacked shared wrapper
  selector/current-tree proof is inherited through
  `HGPR-HABITAT-GRIT-TOOL-2026-06-15` and
  `HGPR-PER-RULE-SELECTORS-2026-06-15`.
- Prior raw scan notes returned `results: []`, but raw acquisition/adapter
  proof is not consumed by this checkpoint.
- TypeScript parser inventory for alias-based forbidden families returns no
  live findings.
- Current recipe/map source contains many public domain-root, `/ops`, and
  `/config.js` imports that must remain negative examples.
- Architecture docs support public domain surfaces for recipe/map composition.

## Product Boundary Finding

The current rule only matches `@mapgen/domain/...` specifiers. Source inventory
also found relative recipe imports into local `src/domain/**` paths. This row
therefore cannot claim complete domain public-surface enforcement by itself.

The packet records this as an alias-only boundary and requires a sibling guard
or accepted non-claim before downstream records can claim full coverage.

## Open Questions Preserved

- Whether relative local-domain reaches should become a sibling Grit check,
  generator repair, migration, or accepted non-claim.
- Whether generated map source needs special current-tree proof treatment
  beyond read-only parser inventory.
- Whether DDI-specific injected/path-control proof needs additional row-local
  evidence beyond the accepted shared injected-probe API for native
  `import type`, namespace, re-export, exact `ops-by-id`, and `.tsx`
  semantics.
