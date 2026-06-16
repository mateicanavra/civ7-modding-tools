# Phase Record - Apply Helper Redeclarations

## Current Gate

The AHR row implementation, proof refresh, record alignment, and local Graphite
checkpoint are complete for supervisor review. The P1 semantic bug from the
initial alias rewrite is repaired in source and native fixture shape: non-finite
helpers use explicit `clampPct(value, 0, 1, 0)` call-site rewrites, not
`clampPct as clamp01`.

## Implemented So Far

- Added `helper_redeclarations_to_imports` apply pattern.
- Removed the three live Swooper helper redeclarations.
- Reverted shared `habitat fix` apply registration for this pattern because
  multi-workflow routing is outside this row.
- Created the row packet to preserve direct apply, source remediation, package
  validation, and runtime-helper check proof as separate classes.
- Proved representative finite and non-finite helper equivalence for the
  explicit `clampPct(value, 0, 1, 0)` replacement.
- Refreshed RHR parser inventory and Habitat wrapper proof to show zero
  remaining helper redeclaration diagnostics.

## Next Actions

1. Supervisor review of the bounded AHR checkpoint.
2. Keep Habitat apply registration, generic transaction proof, and product proof
   as non-claims unless a separate owner layer proves those surfaces.

## Non-Claims

- No Habitat apply registration or selector proof for this apply pattern.
- No generic apply transaction, rollback, or multi-workflow adapter proof.
- No injected apply proof.
- No generated-output edits.
- No product/runtime proof.
