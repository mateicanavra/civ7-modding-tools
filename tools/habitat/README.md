# @habitat/cli

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
pattern: command classes live under `src/cli/commands/**`, local repo scripts
run `bin/dev.ts`, and `bin/run.js` is the built production runner. Build
output (`dist/**`) and `oclif.manifest.json` are generated artifacts.

## Portable package

The package contains TypeScript 6.0.3 JavaScript-compiler output and
declarations, `bin/run.js`, the Oclif manifest, generator metadata and schemas,
and ordinary package dependencies. The build names that compiler explicitly
rather than using the workspace's Effect-patched native `tsc` alias, whose
declaration union ordering can vary with the checkout path. The package does
not ship Habitat source files, `bin/dev.ts`, or source maps.

```bash
nx run habitat:pack
nx run habitat:verify:package
```

`pack` retains the exact release candidate and digest at
`tools/habitat/artifacts/habitat-cli-0.1.0.tgz{,.sha256}`. `verify:package`
consumes those files, rebuilds the exact committed Git tree from a disposable
archive and frozen lockfile, and requires its package bytes to match before
installing the retained tarball into two isolated-linker Nx workspaces. The
proof also typechecks the public service declarations without skipping library
checks, keeps the Nx-plugin declaration probe isolated from upstream declaration
noise, and runs the real Habitat check service through its service, module, and
Effect-handler middleware lineage. A negative service probe injects the exact
producer-only `EffectProcedure` shape and requires vanilla TypeScript resolution
to reject it.

Packing uses a disposable staging tree with canonical modes: `bin/run.js` is
`0755` and every ordinary package file is `0644`. Verification asserts every
archive entry, so ambient worktree permissions cannot change the retained
artifact.

The runtime proof matrix is:

| Bun line | Status |
| --- | --- |
| 1.3.14 | Supported, pinned by `.bun-version`, and required by `verify:package`. |
| 1.4.x | Pending: no stable tag exists as of 2026-07-30, so it is not claimed as tested. |

When Bun 1.4 is released, pin its exact stable version in CI and run the same
pack and two-location consumer proof before expanding the package engine range.

Consumers must trust the pinned Grit lifecycle dependency and register the
compiled plugin export:

```json
{
  "trustedDependencies": ["@getgrit/cli"]
}
```

```json
{
  "namedInputs": {
    "habitatRuntime": [
      "{workspaceRoot}/package.json",
      "{workspaceRoot}/bun.lock",
      { "env": "HABITAT_HARNESS_ROOT" },
      { "env": "HABITAT_CACHE_ROOT" },
      { "env": "HABITAT_PATTERN_CACHE_ROOT" },
      { "env": "HABITAT_TELEMETRY_DISABLED" },
      { "env": "HABITAT_COMMAND_TIMEOUT_MS" }
    ]
  },
  "plugins": [
    {
      "plugin": "@habitat/cli/nx-plugin",
      "options": { "checkTargetName": "check:policy" }
    }
  ]
}
```

After installation, explicitly realize and verify Habitat's package-local Grit
native binary:

```bash
bun -e 'import { acquirePinnedGrit } from "@habitat/cli/grit"; acquirePinnedGrit()'
```

Install with `bun install --linker isolated`. Habitat resolves
`@getgrit/cli@0.1.0-alpha.1743007075` from its own installed module graph,
the explicit acquisition verifies native identity `grit 0.1.1`, and ordinary
rule execution disables runtime downloads. Nx targets use `{workspaceRoot}`
rather than embedding the consumer's absolute path, while shared acquisition
roots retain one multi-pattern Grit execution.

Habitat depends only on the published `effect-orpc@0.5.0` contract-first
surface and native oRPC middleware. The Civ7 producer checkout patches that
dependency for other services' Effect-middleware extensions, but the package
does not export or require that patch. `verify:package` pins the vanilla
registry runtime hash and proves the compiled Habitat middleware lineage
against it.

No release, tag, upload, or registry publication is performed by these targets.
The retained `.tgz` and `.sha256` are the separately reviewable GitHub release
assets. Package authorship and license scope are recorded in `PROVENANCE.md`.

## Usage

```bash
bun habitat                # command help
nx run-many -t check:policy # Nx owner-level Habitat checks
bun run check              # complete non-mutating correctness graph
bun run typecheck          # compiler-only proof lanes
bun run lint               # advisory Effect source audit
bun run format             # workspace source formatting
bun habitat fix --dry-run  # plan every explicitly admitted rule; does not write
bun habitat fix            # immediate unsupported-live-mutation refusal
bun run verify             # graph-owned heavier verification aggregate
bun habitat check          # diagnostic Habitat CLI loop (add --json for JSON)
bun habitat verify         # diagnostic Habitat CLI verify loop
bun habitat classify packages/config/src/index.ts
nx run habitat:check:boundaries # project-plane tag boundaries
nx run habitat:check:hygiene    # formatter/lint/import hygiene gate
bun habitat hook pre-commit     # local staged hook path
bun habitat hook pre-push       # local affected pre-push path
bun habitat hook agent-stop     # Codex Stop gate for enforced structure rules
```

Notes:

- Curated `habitat check --rule <id>` execution remains a diagnostic selector,
  not a package-script policy surface. `nx run-many -t check:policy` enters
  the Nx graph and runs owner-level generated Habitat targets.
- Direct `habitat check` assumes a built tree for bundle-output test rules.
  Registered rules declare exact `graphDependencies`; Nx materializes those
  outputs before the Habitat-owned rule target or owner-local batch executes.
- `bun run check` is the public correctness aggregate. It composes compiler,
  Habitat policy, workspace hygiene, boundary, and upstream checks in one Nx
  graph. `bun run lint` is the narrower Biome lint operation.
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
- `block_unapproved_base_standard_boundary_leaks` and `doc-ambiguity` are the current modeled external
  exception sources. `block_unapproved_base_standard_boundary_leaks` validates its script allowlist
  projection against reported baselined diagnostics; `doc-ambiguity` keeps its
  advisory native baseline at `docs/.doc-ambiguity-lint-baseline.json`.
- Baseline additions are valid only in the change that introduces the rule
  (`--expand-baseline` locally with an accepted rule-introduction manifest; CI
  cross-references the rule pack at the merge-base and rejects existing-rule
  growth).
- Requested check selectors are validated before rule execution. Unknown
  `--owner`, `--rule`, or `--runner` values, values passed in the wrong selector
  namespace, and valid selectors whose intersection contains no rules exit
  non-zero. `--rule` may be repeated to run a curated rule group; repeated rules
  are unioned, then intersected with any owner/runner selector. JSON mode renders a
  schemaVersion 2 `CheckReport` with the single failing `rule-selection-integrity`
  report and a required typed disposition; schemaVersion 1 reports are rejected.
  `--expand-baseline` exits before any baseline file is written.
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
bun habitat classify <path-or-diff>
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
nx g @habitat/cli:project my-lib --kind=foundation
nx g @habitat/cli:project my-plugin --kind=plugin
nx g @habitat/cli:project my-app --kind=app
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
nx g @habitat/cli:pattern grit-my-rule
```

Candidate output lives under
`.habitat/patterns/candidates/`. It is not an
active registered rule, not a `.habitat/**/rule.json` manifest, not a baseline
file, and not hook-scoped. Registered advisory or enforced Grit rules are
authored and reviewed as location-independent `rule.json` authority with an
explicit runner, baseline contract, current-tree validation, fixture strategy,
false-positive model, and hook-scope decision. Current executable validation runs the
registered manifest and its `pattern.md` through Habitat:

```bash
bun habitat check --rule <registered-rule-id>
```

The registered corpus has no separate native `grit patterns test` fixture
surface today. Registration therefore requires explicit injected positive,
negative, parser-edge, and false-positive probes against the native runner;
embedded Markdown examples document that strategy but do not execute it. A
future persistent fixture corpus is a distinct validation layer and must not
become another rule-authority tree.

## Git Hooks

Husky owns the Git hook files and delegates to Habitat:

- `.husky/pre-commit` -> `bun habitat hook pre-commit`
- `.husky/pre-push` -> `bun habitat hook pre-push`

The repository-local Codex `Stop` hook delegates to
`bun habitat hook agent-stop`. Habitat selects every enforced
`runner.name=habitat`, `runner.mode=structure` rule from its admitted registry
facts and runs that exact group once. An invalid registry, empty enforced
structure selection, incomplete selection result, or failed check refuses the
stop gate. The agent hook does not invoke Nx, Grit, script rules, or file-layer
rules.

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

## Workspace Hygiene

`sort-package-json` owns canonical workspace manifest ordering. Biome owns
formatting, ordinary lint hygiene, import organization, and safe assists. The
Habitat project exposes workspace-wide `format`, `lint`, and `check:hygiene`
targets; implementation tool names stay private. Do not move
Biome-owned rules into ESLint.

Use:

```bash
bun habitat fix --dry-run  # admitted transformation observations; no writes
bun habitat fix            # immediate live-mutation refusal; no service realization
nx run habitat:check:hygiene # CI-equivalent hygiene gate
```

`habitat fix` is not a Biome orchestration path. `--dry-run` derives preview-only
admissions from registered `rule.json` records, validates the complete optional
rule selection, and reports file impacts without writing. A non-dry
invocation refuses before constructing the service client. Formatting, gates,
rollback, transaction records, and commit readiness are not implemented; Biome
remains a separate hygiene and hook capability.

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
- `kind:library`
- `kind:plugin`
- `kind:cli-topic-plugin`
- `kind:mod`
- `kind:tooling`

Taxonomy revisions are deliberate rule changes. Edit
`docs/projects/habitat-harness/taxonomy.md` and
`eslint.boundaries.config.mjs` together, cite the provenance for the tag or
constraint change, and keep `nx-boundaries` locked unless the rule-introduction
gate explicitly baselines a discovered edge.
