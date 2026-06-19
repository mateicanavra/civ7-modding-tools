# Habitat Toolkit Capabilities

This document is the current capability map for `@internal/habitat-harness`.
It describes what Habitat can actually do from code, tests, and registered
workspace wiring. It is not a roadmap and it does not grant authority to
unimplemented surfaces.

## Product Posture

Habitat is currently a repo-local structural harness for Civ7 modding work. It
is strong at classification, enforcement, graph-owned checks, Grit diagnostics,
baseline integrity, hooks, and guarded mechanical fixes. It is not yet a broad
MapGen authoring toolkit.

Use Habitat in its current state to answer:

- Which project and rule surfaces own this path or diff?
- Which structural checks apply before and after a change?
- Does the current tree violate locked Habitat rules?
- Can an approved structural codemod be applied safely?
- Can a supported uniform workspace project be scaffolded?
- Can a Grit rule candidate or registered rule promotion be scaffolded under the
  pattern manifest contract?

Do not assume Habitat can yet answer:

- How do I generate a new MapGen recipe?
- How do I generate a new MapGen domain?
- How do I add an operation, stage, or step to an existing recipe?
- How do I convert every diagnostic Grit finding into an automatic fix?

Those are authoring-workflow capabilities, and they remain explicit gaps.

## Command Surface

The root script `bun run habitat` dispatches to
`tools/habitat-harness/bin/dev.ts`, which runs the oclif command set from
`tools/habitat-harness/src/commands`. The available commands are:

| Command | Root usage | Actual capability |
| --- | --- | --- |
| `check` | `bun run habitat check`, `bun run habitat:check` | Runs the Habitat rule pack, supports `--owner`, `--rule`, and `--tool` selection, applies baselines, appends built-in `baseline-integrity`, and exits non-zero on unbaselined enforced violations. |
| `verify` | `bun run habitat verify [--base <ref>]` | Runs Habitat check first, then `nx affected` over `build`, `check`, `test`, `boundaries`, `biome:ci`, `grit:check`, and `generated:check`. JSON mode emits a structured verification receipt. |
| `classify` | `bun run habitat classify <path-or-diff>` | Classifies a path, diff text, or patch file into owning Nx project metadata, tags, D2 rule-routing facts, D3 graph-backed target guidance, explicit unavailable target facts, and refusal states for malformed/pathless or unresolved inputs. |
| `fix` | `bun run habitat fix`, `bun run habitat:fix` | Runs the approved Grit apply transaction, then hands changed files to Biome. Live writes require a clean worktree unless explicitly overridden by the transaction API. |
| `graph` | `bun run habitat graph --json` | Runs Nx graph generation and prints the project graph JSON. |
| `hook` | `bun run habitat hook pre-commit`, `bun run habitat hook pre-push` | Provides the stable Husky hook entrypoint. Hooks are local friction reduction; CI and explicit verification remain authoritative. |

Root scripts also expose graph-owned entrypoints:

- `bun run lint` runs the canonical repo-wide Biome CI hygiene target.
- Full Habitat structural verification lives in `bun run habitat:check`,
  `@internal/habitat-harness:habitat:check:all`, `bun run verify`, and
  `bun run check`; it is not hidden inside root lint.
- `bun run verify` runs `nx run-many --targets=verify`.
- `bun run check` runs `nx run-many --targets=build,check,lint,test,verify`.
- `bun run habitat:fix` runs `bun run habitat fix`.

Important distinction: root `bun run verify` is an Nx aggregate. It is not the
same command as diagnostic `bun run habitat verify`.

## Nx Integration

Nx loads the Habitat inference plugin from
`tools/habitat-harness/src/plugin.ts`. The plugin gives the workspace graph
these Habitat-owned targets:

- Repo-wide `boundaries`
- Repo-wide `biome:format`, `biome:check`, and `biome:ci`
- Repo-wide `grit:check`
- Repo-wide `generated:check`
- Aggregate `habitat:check:all` for one-pass full Habitat graph checks
- Per-rule `habitat:rule:<rule-id>` aliases
- Per-owner `habitat:check` targets for projects that own Habitat rules

The graph is the intended orchestration layer. Package scripts should not hide
cross-project dependency ordering that belongs in Nx `dependsOn`.

## Rule Pack

The rule registry is `.habitat/rules/index.json and .habitat/rules/<rule-id>/rule.json`. At this
state it contains 51 registered rules:

| Owner tool | Count | Role |
| --- | ---: | --- |
| `grit-check` | 31 | GritQL source-shape diagnostics over registered scan roots. |
| `wrapped-test` | 7 | Existing package test or verification targets wrapped as Habitat rules. |
| `file-layer` | 4 | Generated-zone and forbidden-file staged checks. |
| `habitat-native` | 4 | Native structural rules and built-in checks. |
| `wrapped-script` | 3 | Existing scripts wrapped without changing their semantics. |
| `biome` | 1 | Hygiene-layer CI gate. |
| `nx-boundaries` | 1 | Project-plane import boundary enforcement. |

Lane state:

- 49 enforced rules fail `habitat check` on unbaselined violations.
- 2 advisory rules report findings without failing the check.

Owner state:

- `mod-swooper-maps`: 32 rules
- `@internal/habitat-harness`: 14 rules
- `@swooper/mapgen-core`: 2 rules
- `@civ7/control-orpc`: 1 rule
- `@mateicanavra/civ7-sdk`: 1 rule
- `mod-civ7-intelligence-bridge`: 1 rule

## Baselines

Baselines live under `.habitat/baselines/<rule-id>.json`.
They are contract artifacts, not ordinary snapshots.

The baseline model is:

- Missing required baseline state is a contract failure.
- An empty baseline file locks a rule: any violation fails.
- A non-empty baseline tracks existing debt; new unbaselined findings fail.
- Baseline files must be sorted JSON string arrays using the v1
  `path::message` key shape.
- `baseline-integrity` rejects malformed, duplicate, unsorted, orphaned, or
  impermissibly grown baseline state.
- Baseline expansion is an authoring-only path behind `--expand-baseline` and
  the rule-introduction contract.

## Grit Diagnostics

Habitat runs Grit through `tools/habitat-harness/src/lib/grit.ts`.

Current active Grit state:

- 31 check patterns under `.habitat/patterns/active/checks`.
- 31 registered `ownerTool: "grit-check"` rules in the rule registry.
- Patterns are diagnostic/enforcing checks, not automatic transforms by
  default.
- Habitat projects Grit JSON results back to Habitat rule IDs and normalized
  diagnostics.

The active Grit checks cover families such as:

- domain deep imports and relative domain imports;
- recipe/domain surface ownership;
- step contract domain surfaces;
- recipe runtime domain ops;
- runtime validation imports and `runValidated` calls;
- runtime config merge defaults;
- helper redeclarations;
- empty schema/default shapes;
- MapGen core runtime Civ7 coupling;
- sibling stage/step imports;
- domain root catalogs;
- wrapper advanced stage config;
- placement outcome boundaries;
- adapter base-standard imports;
- control-oRPC/control app ownership;
- visualization contract ownership;
- SDK MapGen entrypoint ownership;
- domain ops boundary, projection, root config, engine import, and op-call-op
  rules.

## Grit Apply

Habitat has a guarded apply path, but its transform inventory is intentionally
small.

Apply state:

- Apply patterns under `.habitat/patterns/active/apply`: 2 files.
- Wired into `habitat fix`: only
  `.habitat/patterns/active/apply/deep_import_to_public_surface.md`.
- Not wired into `habitat fix`:
  `.habitat/patterns/active/apply/helper_redeclarations_to_imports.md`.

The apply transaction:

- runs a Grit dry-run first;
- parses a Habitat-owned structured rewrite inventory when available;
- compares an isolated working copy when dry-run output is not structured;
- blocks unapproved creates, deletes, and outside-root rewrites;
- rejects unexpected changed paths;
- hands changed files to Biome;
- can run optional gate commands;
- can roll back failed or preview-only writes;
- records transaction data including changed paths, file digests, and diff
  summaries.

`habitat fix` should be treated as a guarded structural repair entrypoint, not
as a general-purpose "fix all Habitat findings" engine.

## Generators

Habitat exposes exactly two Nx generators in
`tools/habitat-harness/generators.json`.

### `@internal/habitat-harness:project`

Supported:

- `kind=foundation` -> `packages/<name>`
- `kind=plugin` -> `packages/plugins/plugin-<name>`
- `kind=app` -> `apps/<name>`

Generated files:

- `package.json` with the correct `kind:*` tag;
- `tsconfig.json`;
- `src/index.ts`;
- `test/index.test.ts`;
- `README.md`.

Refused before writes:

- unsupported non-uniform kinds: `mod`, `engine`, `control`, `adapter`, `sdk`,
  and `tooling`;
- mismatched roots;
- mismatched package names;
- non-empty project roots;
- package name collisions.

### `@internal/habitat-harness:pattern`

Candidate lifecycle:

- writes non-enforcing candidate artifacts under
  `.habitat/patterns/candidates`;
- does not write an active `.grit` check;
- does not write a the rule registry entry;
- does not write a baseline;

Registered advisory/enforced lifecycle:

- requires `--manifestPath`;
- validates an accepted pattern manifest Manifest;
- validates an explicit baseline contract and rule-introduction manifest;
- refuses collisions;
- writes the active `.habitat/patterns/active/checks/<pattern>.md` file;
- appends the rule-pack entry to the rule registry;

## Hooks

Husky delegates directly to Habitat:

- `.husky/pre-commit` -> `bun run habitat hook pre-commit`
- `.husky/pre-push` -> `bun run habitat hook pre-push`

Pre-commit is a workstation hook check. It checks resources state, staged
file-layer protections, partial-staging risk, Biome staged formatting/checks,
and staged Grit paths.

Pre-push runs affected verification for local branch scope. In Graphite stacks,
it uses the Graphite parent branch as the affected base; otherwise it resolves
the remote default branch merge-base or refuses with instructions to pass an
explicit base.

## What Habitat Does Not Own

Habitat does not own:

- product architecture;
- MapGen recipe semantics;
- domain behavior;
- ordinary formatting or lint hygiene beyond routing to Biome;
- all verification truth;
- arbitrary codemod safety outside approved apply patterns;
- generation of MapGen recipes, domains, operations, stages, or steps.

Those boundaries matter. Habitat should wrap and enforce the tools that own
their domains, and should only own authoring workflows when it has concrete
generators and acceptance tests for those workflows.
