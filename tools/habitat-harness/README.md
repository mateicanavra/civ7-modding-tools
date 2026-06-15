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
bun run habitat:fix        # Biome safe writes: format + organize imports + safe fixes
bun run habitat:verify     # check + nx affected build/check/test/boundaries/biome:ci
bunx nx run-many -t habitat:check   # the same rules, per owning project, cached
bunx nx run-many -t boundaries      # project-plane tag boundaries
bunx nx run-many -t biome:ci        # hygiene-layer CI gate
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
- H2 wrapped existing mechanisms verbatim (zero new rules, zero semantic
  change). H3 added Nx boundaries; H4 makes Biome the hygiene owner. GritQL
  and file-layer rules land in H5/H6.

## Biome Hygiene

Biome owns formatting, ordinary lint hygiene, import organization, and safe
assists. The target names are deliberately namespaced (`biome:format`,
`biome:check`, `biome:ci`); do not add a plain `lint` target for Biome or move
Biome-owned rules into ESLint.

Use:

```bash
bun run habitat:fix -- --dry-run   # report hygiene drift without writes
bun run habitat:fix                # apply Biome format + safe assists
bunx nx run-many -t biome:ci       # CI-equivalent hygiene gate
```

Editor setup:

- Install the Biome editor extension.
- Make Biome the default formatter for this workspace.
- Enable format-on-save only through Biome.
- Do not install or reintroduce Prettier config, scripts, or formatter-ignore
  comments; use `// biome-ignore format` only when the adjacent code requires
  a stable physical line for a toolchain reason.

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
