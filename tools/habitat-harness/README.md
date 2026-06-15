# @internal/habitat-harness

The repo's single enforcement entrypoint. Wraps every structural check
(lint scripts, ESLint, architecture tests) behind one CLI with normalized
JSON diagnostics and shrink-only ratchet baselines.

Authority: `docs/projects/habitat-harness/FRAME.md` (five-layer ownership,
ratchet invariant, settled decisions). Migration map:
`docs/projects/habitat-harness/invariant-corpus.md`.

## Usage

```bash
bun run habitat            # command help
bun run habitat:check      # all rules, human output (add -- --json for JSON)
bun run habitat:verify     # check + nx affected build/check/test vs merge-base
bunx nx run-many -t habitat:check   # the same rules, per owning project, cached
bunx nx run-many -t boundaries      # project-plane tag boundaries
```

Notes:

- `habitat check` assumes a built tree for the bundle-output test rules
  (`bunx nx run-many -t build` first, or use `habitat verify`).
- Advisory-lane rules (`adr-lint`, `doc-ambiguity`) report but never fail —
  matching their pre-harness enforcement reality.
- Baselines (`baselines/<rule-id>.json`) are shrink-only. Additions are valid
  only in the change that introduces the rule (`--expand-baseline` locally;
  CI cross-references the rule pack at the merge-base and rejects everything
  else). An empty baseline means the rule is locked: any violation fails.
- H2 wraps existing mechanisms verbatim (zero new rules, zero semantic
  change). Porting to owning tools (Nx boundaries, GritQL, Biome, file layer)
  happens in H3–H6; codemods (`habitat fix`) land with the grit catalog.

## Project-Plane Tags

H3 locks the project-plane taxonomy from
`docs/projects/habitat-harness/taxonomy.md`: workspace projects carry `kind:*`
tags in `package.json`, and `@nx/enforce-module-boundaries` enforces the
dependency table through `eslint.boundaries.config.mjs`.

Current vocabulary:

- `kind:app`
- `kind:sdk`
- `kind:engine`
- `kind:adapter`
- `kind:control`
- `kind:foundation`
- `kind:plugin`
- `kind:mod`
- `kind:tooling`

Taxonomy revisions are deliberate rule changes. Edit
`docs/projects/habitat-harness/taxonomy.md` and
`eslint.boundaries.config.mjs` together, cite the provenance for the tag or
constraint change, and keep `nx-boundaries` locked unless the rule-introduction
gate explicitly baselines a discovered edge.
