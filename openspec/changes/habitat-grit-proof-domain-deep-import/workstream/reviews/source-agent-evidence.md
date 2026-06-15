# Source Agent Evidence - Domain Deep Import

## Objective

Gather independent evidence for whether `grit-domain-deep-import` is ready to
become an implementation-proof workstream, while preserving the boundary
between check proof and apply proof.

## Confirmed Evidence

- Native Grit fixture proof passes for the current pattern.
- Habitat wrapper proof passes for
  `bun run habitat:check -- --json --rule grit-domain-deep-import`.
- Raw Grit scan over recipe and map roots returns `results: []`.
- Regex inventory for alias-based forbidden families returns no live findings.
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
- Whether generated map source is scanned as read-only evidence only or also
  needs special current-tree proof treatment.
- Whether `import type`, namespace imports, and `.tsx` reach are actually
  matched by the accepted pattern semantics.
