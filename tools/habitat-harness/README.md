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
bun run lint               # graph-owned package lint + Habitat rule aggregate
bun run habitat:check      # graph-owned Habitat rule aggregate
bun run habitat:fix        # Biome safe writes: format + organize imports + safe fixes
bun run verify             # graph-owned package verifier aggregate
bun run check              # graph-owned build/check/lint/test/verify aggregate
bun run habitat check      # diagnostic Habitat CLI loop (add --json for JSON)
bun run habitat verify     # diagnostic Habitat CLI verify loop
bun run habitat classify packages/config/src/index.ts
nx run @internal/habitat-harness:boundaries  # project-plane tag boundaries
bun run biome:ci                                       # hygiene-layer CI gate
bun run habitat hook pre-commit     # local staged hook path
bun run habitat hook pre-push       # local affected pre-push path
```

Notes:

- `habitat check` assumes a built tree for the bundle-output test rules
  (`bun run build` first, or use graph proof through `bun run verify` /
  `bun run check`).
- `bun run lint` includes Habitat checks through Nx. A lint failure can be a
  locked Habitat/Grit architecture finding, not only Biome or style hygiene.
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
  surface; hooks are local friction reduction, not verification truth. H8 adds
  classify-first orientation, Nx generators for supported structure, and
  migration wiring for future harness convention changes.

## Agent Operating Loop

Use Habitat as the structural entrypoint before authoring:

```bash
bun run habitat classify <path-or-diff>
```

The JSON output names the owning workspace project, its `kind:*` tags,
in-scope Habitat rules, and required verification targets. For literal diffs
or `.diff`/`.patch` files, the command returns one classification per changed
path. Treat those targets as the required handoff set, then add narrower
package-local checks for the behavior you changed.

For supported uniform project kinds, generate structure instead of hand
creating it:

```bash
nx g @internal/habitat-harness:project my-lib --kind=foundation
nx g @internal/habitat-harness:project my-plugin --kind=plugin
nx g @internal/habitat-harness:project my-app --kind=app
```

Supported kinds are currently `foundation`, `plugin`, and `app`. The generator
emits `package.json` with the correct `kind:*` tag, `tsconfig.json`,
`src/index.ts`, a Bun test stub, and package-local `build`, `check`, `test`,
and `clean` scripts. Non-uniform kinds (`mod`, `engine`, `control`, `adapter`,
`sdk`, `tooling`) are refused until their owning domain supplies a real shape;
do not guess those layouts in Habitat.

For new Grit-backed rules, generate the native pattern and Habitat rule-pack
entry together:

```bash
nx g @internal/habitat-harness:pattern grit-my-rule \
  --ownerProject=@internal/habitat-harness \
  --scope="source scope" \
  --forbids="forbidden shape" \
  --why="architectural rationale" \
  --message="diagnostic message"
```

The pattern generator writes `.grit/patterns/habitat/checks/<pattern>.md`, an
empty locked baseline, and a `grit-check` rule-pack entry. Native Grit samples
remain the pattern authority:

```bash
GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --verbose
```

Harness migrations are declared in `migrations.json`. Because this package is
repo-local and unpublished, migration proof uses a hand-authored run file whose
`package` field points at `./tools/habitat-harness`, then executes:

```bash
nx migrate --run-migrations=<run-file>.json --skip-install
```

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
push scope, and Nx expands task dependencies from the declared graph.
CI and explicit verification remain authoritative proof.

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
nx run-many -t biome:ci # CI-equivalent hygiene gate
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
