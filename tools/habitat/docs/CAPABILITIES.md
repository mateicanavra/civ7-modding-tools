# Habitat Toolkit Capabilities

This document is the current capability map for `@habitat/cli`.
It describes what Habitat can actually do from code, tests, and registered
workspace wiring. It is not a roadmap and it does not authorize
unimplemented surfaces.

## Product Posture

Habitat is currently a repo-local structural harness for Civ7 modding work. It
is strong at classification, enforcement, graph-owned checks, pattern diagnostics,
baseline integrity, hooks, and apply-admission discovery with dry-run diagnostics.
It is not yet a broad MapGen authoring toolkit.

Use Habitat in its current state to answer:

- Which project and rule surfaces own this path or diff?
- Which structural checks apply before and after a change?
- Does the current tree violate locked Habitat rules?
- Which apply-admission definitions resolve against the live Grit registry?
- What does an admitted Grit dry-run diagnostic report?
- Can a supported uniform workspace project be scaffolded?
- Can a Habitat pattern candidate or registered rule promotion be scaffolded under the
  pattern manifest contract?

Do not assume Habitat can yet answer:

- How do I generate a new MapGen recipe?
- How do I generate a new MapGen domain?
- How do I add an operation, stage, or step to an existing recipe?
- How do I convert every diagnostic pattern finding into an automatic fix?
- How do I apply a live codemod, format its output, run its post-fix gates,
  roll it back, or declare it ready to commit?

Those are authoring-workflow capabilities, and they remain explicit gaps.

## Command Surface

The direct command `bun habitat` dispatches through the root `habitat` script to
`tools/habitat/bin/dev.ts`, which runs the oclif command set from
`tools/habitat/src/cli/commands`. The available commands are:

| Command | Root usage | Actual capability |
| --- | --- | --- |
| `check` | `bun habitat check`; graph entrypoint: `nx run-many -t habitat:check` | Runs Habitat checks, supports `--owner`, repeatable `--rule`, and top-level `--runner` selection, applies baselines, appends built-in `baseline-integrity`, and exits non-zero on unbaselined enforced violations. Curated `--rule` execution remains a diagnostic selector; package scripts do not own Habitat rule lists. |
| `verify` | `bun habitat verify [--base <ref>]` | Runs Habitat check first, then affected workspace verification over build, check, test, boundary, formatter, pattern, and generated-zone gates. JSON mode emits a structured verification receipt. |
| `classify` | `bun habitat classify <path-or-diff>` | Classifies a path, diff text, or patch file into owning project metadata, tags, rule-routing facts, graph-backed target guidance, explicit unavailable target facts, and refusal states for malformed/pathless or unresolved inputs. |
| `fix` | `bun habitat fix --dry-run`; `bun habitat fix` | `--dry-run` resolves the default apply-admission definitions against live Grit registry facts and runs the resolved Grit dry-run diagnostics without writing. The non-dry invocation requests live-write intent, but current routing supplies no protected-zone decision and the transaction policy explicitly refuses live execution as not implemented. It does not write, format, gate, roll back, or establish commit readiness. |
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
- Registered Grit rules run through `bun habitat check --rule <rule-id>` for
  focused proof, or the Habitat graph targets above for owner/workspace proof.
  Each registered `.habitat/**/rule.json` manifest names its executable
  `pattern.md`; there is no separate native `grit patterns test` fixture corpus
  wired today. A future fixture corpus would be a distinct validation layer,
  not another rule authority.
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

The rule registry is authored as location-independent manifests discovered at
`.habitat/**/rule.json`. Each manifest owns stable rule identity, current
placement inventory facts, explicit runner file references, and explicit
artifact references. `.habitat/index.json` supplies root registry metadata,
including owner roots.

### Live Rule Inventory

Rule-pack totals, lane mix, runner mix, and owner distribution are mutable
registry data, not a documentation contract. Habitat currently has no
inventory subcommand, so run this registry-loader query from the repository
root when those facts are needed. It uses the same discovery, schema, and
referenced-file validation boundary as the live Habitat service before it
groups the valid manifests:

```sh
bun -e '
import { readdirSync, readFileSync, statSync } from "node:fs";
import { loadRuleRegistryDocument } from "./tools/habitat/src/service/model/rules/repositories/registry.repository.ts";

const registry = loadRuleRegistryDocument(".habitat", {
  isDirectory: (entry) => statSync(entry).isDirectory(),
  readDirectory: (entry) =>
    readdirSync(entry, { withFileTypes: true }).map((child) => ({
      name: child.name,
      kind: child.isDirectory() ? "directory" : child.isFile() ? "file" : "other",
    })),
  readText: (entry) => readFileSync(entry, "utf8"),
});
const count = (values) =>
  Object.fromEntries(
    [...values.reduce((result, value) => result.set(value, (result.get(value) ?? 0) + 1), new Map()).entries()].sort(
      ([left], [right]) => left.localeCompare(right)
    )
  );
const runner = (rule) =>
  rule.runner.name === "habitat" ? `habitat:${rule.runner.mode}` : rule.runner.name;

console.log(
  JSON.stringify(
    {
      manifestCorpus: {
        total: registry.rules.length,
        lanes: count(registry.rules.map((rule) => rule.lane)),
        runners: count(registry.rules.map(runner)),
        owners: count(registry.rules.map((rule) => rule.ownerProject)),
      },
    },
    null,
    2
  )
);
'
```

`manifestCorpus` is the complete valid registry corpus. The query normalizes
Habitat modes as `habitat:<mode>` only for the inventory display; CLI
`--runner` selection uses the manifest's top-level runner name (`grit`,
`habitat`, or `nx`).

The manifest corpus is not the execution count for an arbitrary check
invocation. A bare `bun habitat check` uses the default local lane and executes
only `grit` and `habitat` rules. `--owner`, `--rule`, and `--runner` select a
different subset; use that invocation's `--json` report and its `rules` array
to inspect what actually executed. In particular, `--runner habitat` selects
all Habitat modes rather than one normalized inventory label.

## Baselines

Baselines are explicit manifest artifact references, currently sibling
`baseline.json` files for the live corpus. They are contract artifacts, not
ordinary snapshots.

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

Habitat owns the Grit diagnostic contract. A manifest with
`runner.name: "grit"` points at the `pattern.md` file to execute; hook and
check execution select those manifests through the runner surface rather than
authored owner-tool metadata or sibling-file inference.

Current active Grit state:

- Registered Grit rules currently point at `pattern.md` sibling role files
  inside packet directories.
- Hook eligibility uses `hookCheck` plus the packet's `scanRoots`.
- Patterns are diagnostic/enforcing checks, not automatic transforms.
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

## Pattern Admission and Dry-Run Diagnostics

Habitat can discover narrowly defined apply admissions and run their Grit
dry-run diagnostics. It does not currently apply a transform.

Current supported state:

- The registry can name an `apply.pattern.md` role file alongside `pattern.md`,
  but neither role-file presence nor an ordinary Grit check admits automatic
  fixing by itself.
- At invocation, `habitat fix` resolves approved apply-admission definitions
  against live Grit registry facts.
- A definition is admitted only when its rule ID resolves to a live Grit
  registry fact and its required manifest role file resolves. Definitions that
  require `runner.files.applyPattern` require that role specifically.
- An admitted `bun habitat fix --dry-run` runs the declared Grit dry-run
  commands and returns their diagnostic output. It does not mutate the
  worktree.
- Unadmitted ordinary checks, including checks with an apply role, do not
  receive automatic fixes.

`bun habitat fix` without `--dry-run` is a live-write request, not an
implemented live-write capability. The router does not provide a protected-zone
decision to the transaction request, so a clean worktree refuses with
`missing-protected-zone-decision`; a dirty worktree refuses first with
`dirty-worktree`. Even a hypothetical allowed decision reaches the explicit
`live write execution is not implemented` refusal in the
[transaction policy](../src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts).

Live writes, formatting, post-fix gates, rollback, changed-file/diff transaction
records, and commit-readiness are not implemented capabilities. They must not
be inferred from the admission model, dry-run output, or transaction-policy
types.

**Future / not implemented:** a live write path would need the
[fix router](../src/service/modules/fix/router.ts) to obtain and pass an
approved protected-zone decision, followed by an execution implementation in
the [transaction policy](../src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts).
Until then, `habitat fix` is an admission/discovery and dry-run diagnostic
surface, not a structural repair entrypoint.

## Generators

Habitat exposes workspace generators declared in `tools/habitat/generators.json`.

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
- refuses live registration writes; accepted active rules must be authored as
  location-independent `rule.json` manifests with explicit runner and artifact
  references through pattern management, not the candidate generator;

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
- arbitrary codemod application or safety, including live writes from `fix`;
- generation of MapGen recipes, domains, operations, stages, or steps.

Those boundaries matter. Habitat should wrap and enforce the tools that own
their domains, and should only own authoring workflows when it has concrete
generators and acceptance tests for those workflows.
