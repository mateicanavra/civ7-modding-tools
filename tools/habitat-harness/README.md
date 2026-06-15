# @internal/habitat-harness

The repo's single enforcement entrypoint. Runs structural checks through their
owning layers (Nx boundaries, Biome, Grit, file-layer, Habitat-native rules,
and the few remaining wrapped compatibility checks) behind one CLI with
normalized JSON diagnostics and shrink-only ratchet baselines.

Authority: `docs/projects/habitat-harness/FRAME.md` (five-layer ownership,
ratchet invariant, settled decisions). Migration map:
`docs/projects/habitat-harness/invariant-corpus.md`.

The command shell is oclif, matching the repo's `@mateicanavra/civ7-cli`
pattern: command classes live under `src/commands/**`, local repo scripts run
`bin/dev.ts`, and `bin/run.js` is the built production runner. Build output
(`dist/**`) and `oclif.manifest.json` are generated artifacts.

## Usage

```bash
bun run habitat            # command help
bun run habitat:check      # all rules, human output (add -- --json for JSON)
bun run habitat:fix        # Biome safe writes: format + organize imports + safe fixes
bun run habitat:verify     # check + nx affected build/test/boundaries/biome:ci/grit/generated
bun run nx run-many -t habitat:check        # the same rules, per owning project, cached
bun run nx run-many -t boundaries           # project-plane tag boundaries
bun run nx run-many -t biome:ci             # hygiene-layer CI gate
bun run habitat hook pre-commit     # local staged hook path
bun run habitat hook pre-push       # local affected pre-push path
```

Notes:

- `habitat check` assumes a built tree for the bundle-output test rules
  (`bun run nx run-many -t build` first, or use `habitat verify`).
- Advisory-lane rules (`adr-lint`, `doc-ambiguity`) report but never fail —
  matching their pre-harness enforcement reality.
- Baselines (`baselines/<rule-id>.json`) are shrink-only. Additions are valid
  only in the change that introduces the rule (`--expand-baseline` locally;
  CI cross-references the rule pack at the merge-base and rejects everything
  else). An empty baseline means the rule is locked: any violation fails.
- H2 wrapped existing mechanisms verbatim (zero new rules, zero semantic
  change). H3 added Nx boundaries; H4 makes Biome the hygiene owner. H4.5
  moved the command shell to oclif. H5 added the GritQL/file-layer catalog.
  H6 retires duplicated scripts, root ESLint, and structural test copies where
  parity is proven. H7 adds Husky hook delegators to the same Habitat command
  surface; hooks are local friction reduction, not verification truth.

## Git Hooks

Husky owns the Git hook files and delegates to Habitat:

- `.husky/pre-commit` -> `bun run habitat hook pre-commit`
- `.husky/pre-push` -> `bun run habitat hook pre-push`

Pre-commit is staged-scope only. It preserves the legacy resource submodule
publish behavior, formats staged Biome-supported files, restages only files the
formatter actually changed, runs one native Grit check over staged TS/JS paths,
and runs staged file-layer rules including generated-zone and pnpm-artifact
guards. If a format-eligible file has both staged and unstaged hunks, the hook
fails before formatting; stage or unstage that whole file first.

Pre-push runs Nx affected targets for the local branch slice. In a Graphite
stack it uses the Graphite parent branch as the affected base; outside
Graphite it falls back to the merge-base with `main`. The hook pins
`--head=HEAD` so uncommitted or untracked worktree files do not change the
push scope, and it excludes Nx task dependencies so local hooks stay on the
named feedback targets. CI and explicit verification own dependency-expanded
proof.

`--no-verify` remains a local escape hatch. CI remains authoritative.

## Biome Hygiene

Biome owns formatting, ordinary lint hygiene, import organization, and safe
assists. The target names are deliberately namespaced (`biome:format`,
`biome:check`, `biome:ci`); do not add a plain `lint` target for Biome or move
Biome-owned rules into ESLint.

Use:

```bash
bun run habitat:fix -- --dry-run   # report hygiene drift without writes
bun run habitat:fix                # apply Biome format + safe assists
bun run nx run-many -t biome:ci    # CI-equivalent hygiene gate
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
