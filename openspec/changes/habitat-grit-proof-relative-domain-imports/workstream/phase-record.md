# Phase Record - Relative Domain Imports

## Current State

This slice is ready for local Graphite checkpoint on
`agent-HG-habitat-grit-recipe-relative-domain-imports`.

The product capability is source remediation plus an enforced recurrence guard:
recipe/map source must not import local `src/domain/**` through relative
`../domain` paths when a public `@mapgen/domain/*` surface owns the symbol.

## Review Loop

- Product/proof review accepted the six current rewrites because the used
  hydrology/resources symbols already exist on public domain package surfaces.
- Adversarial Grit review rejected the initial broad relative-source predicate.
  The implemented predicate uses exact filename-depth arms and fixture controls
  for short same-root `../domain` lookalikes.

## Proof Boundary

Closure proof classes are source remediation, native Grit fixtures, full native
corpus, Habitat per-rule wrapper, aggregate `grit-check`, explicit empty
baseline, row-specific injected violation/path-control, OpenSpec validation,
diff/deleted/residue hygiene, and clean local Graphite checkpoint.

Non-claims remain raw direct Grit acquisition, apply/codemod safety,
generated-output edit/freshness, broader public-surface closure,
neighboring-row proof, aggregate injected-corpus closure while DDIT is blocked,
and product/runtime proof.

## Next Action

Commit locally with Graphite, verify clean-start injected proof from the
committed head, amend records only if the injected result differs from the
recorded boundary, and stop for supervisor review.
