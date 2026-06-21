# @internal/habitat-harness

The repo's single enforcement entrypoint. Runs structural checks through their
owning layers (Nx boundaries, Biome, Grit, file-layer, Habitat-native rules,
and the few remaining wrapped compatibility checks) behind one CLI with
normalized JSON diagnostics and shrink-only ratchet baselines.

Authority: `docs/projects/habitat-harness/FRAME.md` (five-layer ownership,
ratchet invariant, settled decisions). Invariant map:
`docs/projects/habitat-harness/invariant-corpus.md`.

Current toolkit reference:

- `docs/CAPABILITIES.md` maps what Habitat can actually do today.
- `docs/IMPLEMENTED-SURFACE.md` records the durable implemented surface.
- `docs/GAPS.md` names unsupported product and authoring gaps.
- `docs/SCENARIOS.md` separates supported and unsupported usage scenarios.
- `docs/AUTHORING-NEXT.md` frames the next generator/apply product loop.

The command shell is oclif, matching the repo's `@mateicanavra/civ7-cli`
pattern: command classes live under `src/host/commands/**`, local repo scripts
run `bin/dev.ts`, and `bin/run.js` is the built production runner. Build
output (`dist/**`) and `oclif.manifest.json` are generated artifacts.

## Usage

```bash
bun run habitat            # command help
bun run habitat:check      # diagnostic full Habitat rule aggregate
bun run check              # diagnostic full Habitat rule aggregate
bun run lint               # graph-owned repo-wide Biome hygiene
bun run habitat:fix        # approved Grit codemods, then Biome safe writes
bun run check:graph        # affected graph package-check and structural aggregate
bun run verify             # graph-owned heavier verification aggregate
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
  (`bun run build` first, or use graph validation through `bun run check:graph`).
- `bun run lint` owns repo-wide Biome hygiene. Habitat structural findings
  belong to `bun run check`; graph validation belongs to `bun run check:graph`.
- Advisory-lane rules (`adr-lint`, `doc-ambiguity`) report but never fail —
  matching their pre-harness enforcement reality.
- Baselines (`.habitat/baselines/<rule-id>.json`) are explicit contract artifacts and
  shrink-only. A registered rule with no baseline file is a contract failure
  unless the rule is modeled as an external exception source. An empty baseline
  file means the rule is locked: any violation fails. A non-empty baseline file
  means matching findings are tracked debt and new findings fail.
- Baseline files must be JSON arrays of sorted, unique strings using the v1
  `path::message` key format. Malformed, duplicate, unsorted, orphaned, or
  missing required baseline state fails through `baseline-integrity`.
- `adapter-boundary` and `doc-ambiguity` are the current modeled external
  exception sources. `adapter-boundary` validates its script allowlist
  projection against reported baselined diagnostics; `doc-ambiguity` keeps its
  advisory native baseline at `docs/.doc-ambiguity-lint-baseline.json`.
- Baseline additions are valid only in the change that introduces the rule
  (`--expand-baseline` locally with an accepted rule-introduction manifest; CI
  cross-references the rule pack at the merge-base and rejects existing-rule
  growth).
- Requested check selectors are validated before rule execution. Unknown
  `--owner`, `--rule`, or `--tool` values, values passed in the wrong selector
  namespace, and valid selectors whose intersection contains no rules exit
  non-zero. JSON mode renders a schemaVersion 1 `CheckReport` with the single
  failing `rule-selection-integrity` report; `--expand-baseline` exits before
  any baseline file is written.
- H2 wrapped existing mechanisms verbatim (zero new rules, zero semantic
  change). H3 added Nx boundaries; H4 makes Biome the hygiene owner. H4.5
  moved the command shell to oclif. H5 added the GritQL/file-layer catalog.
  H6 retired duplicated scripts, root ESLint, and structural test copies once
  Habitat owned those checks. H7 adds Husky hook delegators to the same Habitat
  command surface; hooks are local friction reduction, not verification truth.
  H8 added classify-first orientation and generators for supported structure;
  current classify/generator contracts are resolved by Nx metadata and
  candidate-only Pattern Authority generation.

## Agent Operating Loop

Use Habitat as the structural entrypoint before authoring:

```bash
bun run habitat classify <path-or-diff>
```

The JSON output names the owning workspace project, its `kind:*` tags,
in-scope Habitat rules, resolved verification targets, and unavailable targets.
For literal diffs or `.diff`/`.patch` files, the command returns one
classification per changed path. Treat resolved project targets and Habitat
workspace gates as the required handoff set; unavailable targets are routing
facts, not commands to run. Add narrower package-local checks for the behavior
you changed.

For supported uniform project kinds, generate structure instead of hand
creating it:

```bash
nx g @internal/habitat-harness:project my-lib --kind=foundation
nx g @internal/habitat-harness:project my-plugin --kind=plugin
nx g @internal/habitat-harness:project my-app --kind=app
```

Supported kinds are currently `foundation`, `plugin`, and `app`. Their accepted
roots are `packages/<name>`, `packages/plugins/plugin-<name>`, and
`apps/<name>`, respectively. The generator emits `package.json` with the
correct `kind:*` tag, `tsconfig.json`, `src/index.ts`, a Bun test stub, and
package-local `build`, `check`, `test`, and `clean` scripts. It refuses
mismatched roots, mismatched package names, non-empty roots, existing package
name collisions, and non-uniform kinds (`mod`, `engine`, `control`, `adapter`,
`sdk`, `tooling`) before writes. Do not guess those layouts in Habitat.

For new Grit-backed rules, generate a non-enforcing candidate draft first:

```bash
nx g @internal/habitat-harness:pattern grit-my-rule
```

Candidate output lives under
`.habitat/pattern-authority/candidates/`. It is not an
active `.grit` check, not a `rules.json` entry, not a baseline file, and not
hook-scoped. Registered advisory or enforced Grit rules require an accepted
Pattern Authority Manifest, baseline contract, current-tree validation,
fixture strategy, false-positive model, and hook-scope decision before they can
enter the rule pack. Native Grit samples remain one validation class:

```bash
GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --verbose
```

## Git Hooks

Husky owns the Git hook files and delegates to Habitat:

- `.husky/pre-commit` -> `bun run habitat hook pre-commit`
- `.husky/pre-push` -> `bun run habitat hook pre-push`

Pre-commit is staged-scope only. It checks resource submodule state without
publishing, fails with explicit remediation when resources require action,
formats staged Biome-supported files, restages only files the formatter
actually changed, runs one native Grit check over staged TS/JS paths, and runs
staged file-layer rules including generated-zone and pnpm-artifact guards. If a
format-eligible file has both staged and unstaged hunks, the hook fails before
formatting; stage or unstage that whole file first.

Pre-push runs Nx affected targets for the local branch slice. In a Graphite
stack it uses the Graphite parent branch as the affected base; outside
Graphite it falls back to the merge-base with `main`. The hook pins
`--head=HEAD` so uncommitted or untracked worktree files do not change the
push scope, and Nx expands task dependencies from the declared graph.
CI and explicit verification remain authoritative.

`--no-verify` remains a local escape hatch. CI remains authoritative.

## Biome Hygiene

Biome owns formatting, ordinary lint hygiene, import organization, and safe
assists. The target names are deliberately namespaced (`biome:format`,
`biome:check`, `biome:ci`); do not add a plain `lint` target for Biome or move
Biome-owned rules into ESLint.

Use:

```bash
bun run habitat:fix -- --dry-run   # report approved Grit codemods + hygiene drift without writes
bun run habitat:fix                # apply approved Grit codemods, then Biome format + safe assists
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
