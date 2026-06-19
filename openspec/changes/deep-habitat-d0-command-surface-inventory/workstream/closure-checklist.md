# Closure Checklist: D0 Public Surface Compatibility Matrix

## Design Closure

- [x] Proposal frames D0 as public-surface compatibility design, not docs
      backfill.
- [x] Design defines the matrix path, sections, row schema, state glossary, plane
      authority, write set, protected paths, validation oracle, and stale-path
      policy.
- [x] Tasks are ordered implementation actions for producing the matrix.
- [x] Spec delta requires matrix path, stable row IDs, plane separation,
      completeness checks, and no TypeScript source edits.
- [x] Review ledger dispositions every accepted D0 P1/P2 finding.
- [x] Downstream ledger names what later packets must cite.
- [x] Focused D0 re-review has no accepted unresolved P1/P2 findings.
- [x] `bun run openspec -- validate deep-habitat-d0-command-surface-inventory --strict`
      passes.

## Implementation Closure Later

- [x] `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`
      exists.
- [x] Every required plane has rows and stable `surface_id` values.
- [x] Every package export and command file has a row.
- [x] Validation commands record expected status, actual status, cache stance,
      and non-claims.
- [x] Source changes stay inside the D0 approved write set.
- [x] Later packet index rows cite D0 as the compatibility authority.
- [x] `git status --short --branch` is clean after the D0 implementation layer.
