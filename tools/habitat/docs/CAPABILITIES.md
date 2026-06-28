# Habitat Toolkit Capabilities

This document is the current capability map for `@habitat/cli`.
It describes what Habitat can actually do from code, tests, and registered
workspace wiring. It is not a roadmap and it does not authorize
unimplemented surfaces.

## Product Posture

Habitat is currently a repo-local structural harness for Civ7 modding work. It
is strong at classification, enforcement, graph-owned checks, pattern diagnostics,
baseline integrity, hooks, and guarded mechanical fixes. It is not yet a broad
MapGen authoring toolkit.

Use Habitat in its current state to answer:

- Which project and rule surfaces own this path or diff?
- Which structural checks apply before and after a change?
- Does the current tree violate locked Habitat rules?
- Can an approved structural codemod be applied safely?
- Can a supported uniform workspace project be scaffolded?
- Can a Habitat pattern candidate or registered rule promotion be scaffolded under the
  pattern manifest contract?

Do not assume Habitat can yet answer:

- How do I generate a new MapGen recipe?
- How do I generate a new MapGen domain?
- How do I add an operation, stage, or step to an existing recipe?
- How do I convert every diagnostic pattern finding into an automatic fix?

Those are authoring-workflow capabilities, and they remain explicit gaps.

## Command Surface

The direct command `bun habitat` dispatches through the root `habitat` script to
`tools/habitat/bin/dev.ts`, which runs the oclif command set from
`tools/habitat/src/cli/commands`. The available commands are:

| Command | Root usage | Actual capability |
| --- | --- | --- |
| `check` | `bun habitat check`; graph entrypoint: `nx run-many -t habitat:check` | Runs Habitat checks, supports `--owner`, repeatable `--rule`, and `--runner` selection, applies baselines, appends built-in `baseline-integrity`, and exits non-zero on unbaselined enforced violations. Curated `--rule` execution remains a diagnostic selector; package scripts do not own Habitat rule lists. |
| `verify` | `bun habitat verify [--base <ref>]` | Runs Habitat check first, then affected workspace verification over build, check, test, boundary, formatter, pattern, and generated-zone gates. JSON mode emits a structured verification receipt. |
| `classify` | `bun habitat classify <path-or-diff>` | Classifies a path, diff text, or patch file into owning project metadata, tags, rule-routing facts, graph-backed target guidance, explicit unavailable target facts, and refusal states for malformed/pathless or unresolved inputs. |
| `fix` | `bun habitat fix` | Runs the approved Habitat apply transaction, then hands changed files to the formatter. Live writes require a clean worktree unless explicitly overridden by the transaction API. |
| `graph` | `bun habitat graph --json` | Runs workspace graph generation and prints the project graph JSON. |
| `hook` | `bun habitat hook pre-commit`, `bun habitat hook pre-push` | Provides the stable Husky hook entrypoint. Hooks are local friction reduction; CI and explicit verification remain authoritative. |

Root scripts also expose graph-owned entrypoints:

- `bun run lint` runs graph-discovered package lint targets. Biome remains
  available as `bun run biome:ci`.
- Habitat structural verification lives behind generated owner and rule targets:
  `nx run-many -t habitat:check`, `nx run <project>:habitat:check`, and
  `habitat:habitat:check:all`. Curated direct `habitat check --rule`
  invocations are for diagnostics and focused proof, not package script policy.
- `habitat:habitat:check` runs the Toolkit-owned Habitat rules for CLI
  smoke, boundary taxonomy, service-module shape, and other registered
  `habitat` owner rules.
- Native `grit patterns test` validation is not exposed as a current package
  script or graph target because this checkout no longer has an active testable
  pattern corpus for that command.
- `bun run check` runs graph-discovered package check targets.
- `bun habitat hook pre-push` runs changed-path hook Grit checks in
  process. Ordinary source changes then run affected package checks plus
  explicit validation targets; Habitat artifact-only changes run Habitat
  structural or owning-rule targets instead of generic product `check`.
- `bun run verify` runs the heavier repo-wide verification aggregate.
- `bun run ci` runs the full repo-wide build, check, lint, and test aggregate
  without re-entering `verify`.

Important distinction: root `bun run verify` is a workspace aggregate. It is not
the same command as diagnostic `bun habitat verify`.

## Workspace Graph Integration

The workspace graph loads the Habitat inference plugin from
`tools/habitat/src/nx-plugin.ts` and package-declared Nx targets from
project manifests. Together they expose these Habitat-owned targets:

- Repo-wide `boundary`
- Repo-wide formatter targets
- Repo-wide pattern checks
- Repo-wide `generated:check`
- Package-owned `lint` for Toolkit CLI smoke, current workspace taxonomy,
  manifest, Nx metadata, boundary config, graph-edge validation, and service
  module shape
- Aggregate `habitat:check:all` for one-pass full Habitat graph checks
  (known rebuild target until full-suite discovery/admission is repaired)
- Per-rule `habitat:rule:<rule-id>` aliases
- Per-owner `habitat:check` targets for projects that own Habitat rules

The graph is the intended orchestration layer. Package scripts should not hide
cross-project dependency ordering that belongs in graph target dependencies.
Current workspace topology audits belong in this layer; unit tests cover the
pure parser and audit model with fixtures.

## Rule Pack

The rule registry is authored under the authority tree as
`.habitat/**/blueprints/<blueprint>/<category>/<artifact-kind>/<packet>/rule.json`.
The owner-root index is root registry metadata at `.habitat/index.json`. At this
state it contains 124 registered rules:

| Habitat lane | Count | Role |
| --- | ---: | --- |
| Pattern checks | 79 | Source-shape diagnostics over registered scan roots. |
| Structure checks | 8 | Native file-tree topology checks. |
| File protection | 5 | Generated-zone and forbidden-file staged checks. |
| Command checks | 30 | Existing command-line gates wrapped without changing their semantics. |
| Formatter hygiene | 1 | Hygiene-layer CI gate. |
| Project boundaries | 1 | Project-plane import boundary enforcement. |

Lane state:

- 124 enforced rules fail `habitat check` on unbaselined violations.
- 1 advisory rule reports findings without failing the check.

Owner state:

- `mod-swooper-maps`: 36 rules
- `habitat`: 17 rules
- `mapgen-core`: 1 rule
- `control-orpc`: 1 rule
- `civ7-sdk`: 1 rule
- `mapgen-studio`: 2 rules
- `civ7-docs`: 2 rules

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

Habitat owns the Grit diagnostic contract. A packet with `pattern.md` derives
the `grit` runner; hook and check execution select those packets through the
runner surface rather than authored owner-tool metadata.

Current active Grit state:

- Registered Grit rules live as `pattern.md` sibling role files inside packet
  directories.
- Hook eligibility uses `hookCheck` plus the packet's `scanRoots`.
- Patterns are diagnostic/enforcing checks, not automatic transforms by
  default.
- Habitat reports Grit diagnostics back to Habitat rule IDs.

The active pattern checks cover families such as:

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
- domain ops boundary, root config, engine import, and op-call-op
  rules.

## Pattern Apply

Habitat has a guarded apply path, but its transform inventory is intentionally
small.

Apply state:

- Apply patterns under `.habitat/patterns/apply`: 2 files.
- Wired into `habitat fix`: only
  `.habitat/patterns/apply/deep_import_to_public_surface.md`.
- Not wired into `habitat fix`:
  `.habitat/patterns/apply/helper_redeclarations_to_imports.md`.

The apply transaction:

- runs an adapter dry-run first;
- parses a Habitat-owned structured rewrite inventory when available;
- compares an isolated working copy when dry-run output is not structured;
- blocks unapproved creates, deletes, and outside-root rewrites;
- rejects unexpected changed paths;
- hands changed files to the formatter;
- can run optional gate commands;
- can roll back failed or preview-only writes;
- records transaction data including changed paths, file digests, and diff
  summaries.

`habitat fix` should be treated as a guarded structural repair entrypoint, not
as a general-purpose "fix all Habitat findings" engine.

## Generators

Habitat exposes exactly two workspace generators in
`tools/habitat/generators.json`.

### `@habitat/cli:project`

Supported:

- `kind=plugin` -> `packages/plugins/plugin-<name>`

Generated files:

- `package.json` with the correct `kind:*` tag;
- `tsconfig.json`;
- `src/index.ts`;
- `test/index.test.ts`;
- `README.md`.

Refused before writes:

- unsupported non-uniform kinds: `app`, `foundation`, `mod`, `engine`,
  `control`, `adapter`, `sdk`, and `tooling`;
- mismatched roots;
- mismatched package names;
- non-empty project roots;
- package name collisions.

### `@habitat/cli:pattern`

Candidate lifecycle:

- writes non-enforcing candidate artifacts under
  `.habitat/patterns/candidates`;
- does not write an active Habitat pattern;
- does not write a rule registry entry;
- does not write a baseline;

Registered advisory/enforced lifecycle:

- requires `--manifestPath`;
- validates an accepted pattern manifest;
- validates an explicit baseline contract and rule-introduction manifest;
- refuses collisions;
- writes the active `.habitat/patterns/checks/<pattern>.md` file;
- appends the rule-pack entry to the rule registry;

## Hooks

Husky delegates directly to Habitat:

- `.husky/pre-commit` -> `bun habitat hook pre-commit`
- `.husky/pre-push` -> `bun habitat hook pre-push`

Pre-commit is a workstation hook check. It checks resources state, staged
file-layer protections, partial-staging risk, staged formatting checks, and
staged pattern checks.

Pre-push runs affected verification for local branch scope. In Graphite stacks,
it uses the Graphite parent branch as the affected base; otherwise it resolves
the remote default branch merge-base or refuses with instructions to pass an
explicit base.

## What Habitat Does Not Own

Habitat does not own:

- product architecture;
- MapGen recipe semantics;
- domain behavior;
- ordinary formatting or lint hygiene beyond routing to the formatter;
- all verification truth;
- arbitrary codemod safety outside approved apply patterns;
- generation of MapGen recipes, domains, operations, stages, or steps.

Those boundaries matter. Habitat should wrap and enforce the tools that own
their domains, and should only own authoring workflows when it has concrete
generators and acceptance tests for those workflows.
