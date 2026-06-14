# Habitat Tool Harness Specification — Bun Edition

**Status:** implementation-ready proposal, revised for Bun  
**Audience:** agents and maintainers implementing the harness inside an existing repository  
**Scope:** Nx, Biome, ESLint as temporary boundary compatibility, GritQL, Husky, Bun, and the local integration glue that composes them  
**Non-scope:** product architecture, runtime architecture, durable work systems, review/governance systems, service transport semantics, or any mandatory application ontology

## 1. Executive decision

A Habitat tool harness is a small repository-local development harness that makes structure executable. It lives inside the repository, normally under `tools/habitat-harness/`, and wires together:

```text
Bun      -> package manager, workspace installer, script runner, local TS harness CLI runtime
Nx       -> project graph, affected scope, generators, executors, migrations, cache
Biome    -> formatting, ordinary lint hygiene, import organization where enabled
ESLint   -> temporary compatibility runner for Nx's open-source module-boundary rule
GritQL   -> structural source search and rewrite / remediation
Husky    -> local Git hook dispatch for cheap checks at the right Git moments
```

The harness is not the product architecture. It is not a framework. It is not a governance layer. It is a toolkit that helps humans and agents keep whatever architecture the repository chooses enforceable down to the file level.

The operating rule is:

```text
Bun installs, locks, and runs local scripts.
Nx knows the repository graph.
Biome knows hygiene.
ESLint temporarily carries Nx's JS/TS boundary rule.
GritQL knows source-code shape and can rewrite it.
Husky knows local Git moments.
The harness glue decides what to run, where, and in what order.
```

The north-star is a workflow where most structural work is performed through generation, remediation, formatting, linting, and verification. Humans and agents should spend most manual effort on business logic, domain rules, examples, edge cases, and intentional exceptions. The harness should make the right structure cheaper than improvisation.

## 2. Bun posture and audit result

Switching from pnpm to Bun is not only a command rename. The harness must adopt Bun's package-manager model deliberately:

```text
lockfile:             bun.lock, committed to git
workspace file:       package.json workspaces, not pnpm-workspace.yaml
local workspace refs: workspace:*
CI install:           bun ci, or bun install --frozen-lockfile
script execution:     bun run <script>
package binaries:     bunx <binary>, unless a root script wraps them
local TS CLI:         bun tools/habitat-harness/src/bin/habitat.ts
Node CLIs:            Nx, ESLint, and often Grit should run normally through bunx, not forced with --bun unless tested
Biome CLI:            use bunx --bun @biomejs/biome, matching Biome's Bun docs
```

The harness should pin both Node and Bun. Bun is the package manager and the runtime for the local `habitat` CLI, but Nx and ESLint remain Node-ecosystem CLIs. Nx's own Bun CI guide pins both `node` and `bun` with `mise.toml`, then runs Nx via `bunx`. That is the posture this spec uses.

Recommended root `mise.toml`:

```toml
[tools]
node = "24.11.0"
bun = "1.3.11"
```

The exact versions should be updated intentionally by maintainers. The point is not those specific numbers; the point is that the repo pins both runtimes instead of assuming Bun removes the need for Node.

Recommended root `bunfig.toml`:

```toml
[install]
linker = "isolated"
```

For a new Bun workspace/monorepo, isolated installs are the right default because they reduce phantom dependency leakage. If an existing repository cannot yet run isolated, the harness may temporarily use `linker = "hoisted"`, but that should be treated as migration debt because hidden dependencies weaken file-level enforcement.

Bun does not run arbitrary lifecycle scripts for installed dependencies unless they are trusted. The root project's own `prepare` script is still expected to install Husky hooks, but any binary package that relies on dependency lifecycle scripts may require either a different installation route or an explicit `trustedDependencies` entry. Treat this as a supply-chain hardening feature, not as a nuisance.

## 3. Design rationale

A useful agent-facing repository needs more than instructions. It needs executable structure. The reusable Habitat design notes frame this as making the environment enforceable, queryable, generatable, observable, and diagnosable rather than merely documented. The graph/query/diagnostics layer is especially relevant here: agents need to ask what a file is, what may import what, what breaks when a thing changes, and which gates must run. This harness implements that structural operating slice, without adopting the broader coordination or governance layers.

The harness distribution argument is also load-bearing: a harness is a set of generators, rules, structural tests, discovery mechanisms, composition helpers, and migrations. Those map directly onto Nx extension points: generators scaffold, module-boundary rules enforce, executors verify, project graph plugins infer nodes and dependencies, and migrations propagate harness evolution.

The domain-design principle behind the harness is hierarchical composition. A flat repository makes agents investigate first: read files, trace imports, infer conventions, then guess. A structured repository lets agents classify first: what kind of thing is this, what rules apply at this level, and which generated/remediated move is legal. The harness should therefore encode kinds, tags, path rules, import rules, file-shape rules, and repair paths as machinery.

## 4. Installation and repository layout

### 4.1 New repository setup

For a new TypeScript-oriented repository using Bun:

```sh
bunx create-nx-workspace@latest my-repo --preset=ts --packageManager=bun
cd my-repo

bun add -d nx @nx/plugin eslint @nx/eslint-plugin husky typescript @types/bun @getgrit/cli
bun add -d -E @biomejs/biome
bunx --bun @biomejs/biome init
bunx husky init
bunx nx add @nx/plugin
bunx nx g @nx/plugin:plugin tools/habitat-harness --importPath=@internal/habitat-harness
```

For an existing repository:

```sh
bun add -d nx @nx/plugin eslint @nx/eslint-plugin husky typescript @types/bun @getgrit/cli
bun add -d -E @biomejs/biome
bunx nx init
bunx --bun @biomejs/biome init
bunx husky init
bunx nx add @nx/plugin
bunx nx g @nx/plugin:plugin tools/habitat-harness --importPath=@internal/habitat-harness
```

If the repo is migrating from pnpm, remove `pnpm-lock.yaml` and `pnpm-workspace.yaml` after verifying `bun.lock`, `package.json` workspaces, and the Nx project graph. Do not keep competing lockfiles.

Exact package versions may vary, but the harness must create one local plugin under `tools/`, one root Biome config, one purpose-limited ESLint boundary config, one GritQL pattern catalog, and thin Husky hook delegators.

### 4.2 Required root package fields

```jsonc
{
  "private": true,
  "packageManager": "bun@1.3.11",
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*",
    "tools/*"
  ],
  "scripts": {
    "habitat": "bun tools/habitat-harness/src/bin/habitat.ts",
    "habitat:init": "bun run habitat init",
    "habitat:check": "bun run habitat check",
    "habitat:fix": "bun run habitat fix",
    "habitat:verify": "bun run habitat verify",
    "prepare": "husky"
  }
}
```

Use `workspace:*` for local workspace dependencies:

```jsonc
{
  "devDependencies": {
    "@internal/habitat-harness": "workspace:*"
  }
}
```

### 4.3 Required root layout

```text
repo/
  apps/                         # optional; repo-defined application projects
  packages/                     # optional; repo-defined libraries/packages
  services/                     # optional; repo-defined domain/service projects
  tools/
    habitat-harness/
      package.json
      project.json
      src/
        index.ts
        plugin.ts               # Nx createNodesV2/createDependencies
        bin/
          habitat.ts            # Bun-run CLI entrypoint for humans, agents, hooks
        rules/
          architecture.ts       # repo-local rule pack
          messages.ts           # agent-readable diagnostics
        lib/
          graph.ts
          paths.ts
          tags.ts
          spawn.ts
          diagnostics.ts
          git.ts
        executors/
          biome/
          eslint-boundaries/
          grit-check/
          grit-apply/
          verify/
        generators/
          init/
          project/
          boundary/
          pattern/
          migration/
        migrations/
        patterns/
          grit/
            no-internal-import.grit
            no-deprecated-builder.grit
            no-generated-zone-edit.grit
          fixtures/
  .grit/
    grit.yaml
  .husky/
    pre-commit
    commit-msg
    pre-push
    post-checkout
    post-merge
  biome.json
  bun.lock
  bunfig.toml
  eslint.boundaries.config.mjs
  mise.toml
  nx.json
  package.json
```

This is deliberately local. The harness begins as repository infrastructure, not a published framework. If multiple repositories converge on the same harness, the `tools/habitat-harness` package can later become a shared private or public Nx plugin.

## 5. Per-tool specifications

## 5.1 Bun

### Setup

Install Bun through the official installer, package manager, or CI image, then pin it through `mise.toml` or an equivalent toolchain manager. Commit `bun.lock` and remove other package-manager lockfiles after migration.

Root `bunfig.toml`:

```toml
[install]
linker = "isolated"
```

Root scripts should use `bun run` explicitly. Avoid relying on naked script names in documentation because Bun built-ins can take precedence over same-named scripts.

### Run commands

```sh
bun install
bun ci
bun add -d <package>
bun add -d -E @biomejs/biome
bun run habitat verify
bunx nx graph
bunx eslint -c eslint.boundaries.config.mjs "**/*.{ts,tsx,js,jsx}"
```

### Unique capabilities

Bun gives the harness a fast package manager, text lockfile, workspace installation, script runner, TypeScript execution for the local harness CLI, and `bunx` for local/npm package binaries.

### Owns

Bun owns:

```text
dependency installation
bun.lock
package.json workspace linking
workspace:* local dependency references
root package scripts
local TypeScript execution for the habitat CLI
CI dependency reproducibility through bun ci or --frozen-lockfile
```

### Does not own

Bun does not own the architecture, project graph, lint semantics, module boundaries, structural rewrites, or Git hook semantics. Bun also does not automatically make every Node CLI a Bun-native runtime. Use normal `bunx` for Node-shebang CLIs unless the CLI's own docs say to use `--bun`.

### Integration glue

The harness owns a Bun-run CLI:

```sh
bun run habitat <command>
```

That CLI delegates to Nx, Biome, ESLint, GritQL, Git, and local rule-pack code. It should use safe process spawning with argument arrays, not shell-concatenated command strings.

## 5.2 Nx

### Setup

Register the local plugin in `nx.json`:

```jsonc
{
  "plugins": [
    {
      "plugin": "./tools/habitat-harness/src/plugin.ts",
      "options": {
        "biomeTargetName": "biome:ci",
        "boundaryTargetName": "boundaries",
        "gritCheckTargetName": "grit:check"
      }
    }
  ],
  "targetDefaults": {
    "biome:ci": { "cache": true },
    "boundaries": { "cache": true },
    "grit:check": { "cache": true },
    "verify": { "dependsOn": ["biome:ci", "boundaries", "grit:check"] }
  }
}
```

The plugin must implement `createNodesV2` for project discovery and target inference. It should identify projects from `project.json`, package-level `package.json`, and any repo-specific marker files declared in `tools/habitat-harness/src/rules/architecture.ts`.

The plugin should implement `createDependencies` only for dependency edges that Nx cannot infer from normal imports but the repository can prove from explicit declarations, manifests, config files, or project metadata.

### Run commands

```sh
bunx nx graph
bunx nx graph --affected
bunx nx show project <project-name>
bunx nx affected -t biome:ci,boundaries,grit:check,typecheck,test
bunx nx run-many -t verify --all
bunx nx g @internal/habitat-harness:project <name> --kind=<kind>
bunx nx migrate <package-or-version>
bunx nx sync:check
```

### Unique capabilities

Nx is authoritative over the repository-level graph and task orchestration. Its unique capabilities in this harness are:

- project graph construction;
- custom graph node and dependency inference;
- affected-project calculation;
- cacheable target execution;
- local generators;
- migrations;
- sync generators;
- task composition.

### Owns

Nx owns:

```text
project identity
project tags
project dependency graph
affected-scope calculation
target wiring
generators
executors
migrations
cache policy
module-boundary authority at project level
```

### Does not own

Nx does not own formatting, ordinary lint rules, source-code structural pattern language, or Git hook timing. It may invoke tools that own those concerns.

### Integration glue

`tools/habitat-harness/src/plugin.ts` is glue. It translates repository-specific architecture rules into Nx graph nodes, dependencies, tags, and targets. It should stay thin and explicit.

## 5.3 Biome

### Setup

Install Biome as an exact-pinned dev dependency:

```sh
bun add -d -E @biomejs/biome
bunx --bun @biomejs/biome init
```

Root `biome.json`:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "files": {
    "includes": ["**/*", "!node_modules", "!dist", "!coverage", "!.nx"]
  },
  "formatter": { "enabled": true },
  "linter": { "enabled": true },
  "assist": { "enabled": true }
}
```

### Run commands

```sh
bunx --bun @biomejs/biome format --write .
bunx --bun @biomejs/biome lint .
bunx --bun @biomejs/biome check .
bunx --bun @biomejs/biome ci .
bunx nx affected -t biome:ci
```

### Unique capabilities

Biome is the fast hygiene engine. It provides formatting, ordinary lint checks, import organization through `check`/`ci`, staged/changed-file workflows, reporters, and editor integration.

### Owns

Biome owns:

```text
formatting
ordinary lint hygiene
import organization where enabled
fast local diagnostics
CI hygiene posture
```

### Does not own

Biome does not own project graph law, module-boundary authority, repository migrations, or bulk source-code remediation. Biome can host GritQL diagnostics, but in this harness that is diagnostic integration only, not the full rewrite engine.

### Integration glue

The harness owns Nx targets that call Biome with the right path set:

```text
biome:format   -> bunx --bun @biomejs/biome format --write <projectRoot>
biome:lint     -> bunx --bun @biomejs/biome lint <projectRoot>
biome:check    -> bunx --bun @biomejs/biome check <projectRoot>
biome:ci       -> bunx --bun @biomejs/biome ci <projectRoot>
```

The harness may add a batch path for affected projects, but it must preserve clear target names. Do not call the Biome target plain `lint` in this harness, because `lint` becomes ambiguous once ESLint boundary compatibility and structural checks exist.

## 5.4 ESLint

### Setup

ESLint is temporary compatibility glue for Nx's open-source JavaScript/TypeScript module-boundary rule. It must not become the main linter.

Install:

```sh
bun add -d eslint @nx/eslint-plugin
```

Create `eslint.boundaries.config.mjs`:

```js
import nx from "@nx/eslint-plugin"

export default [
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "kind:app",
              onlyDependOnLibsWithTags: ["kind:adapter", "kind:domain", "kind:support"]
            },
            {
              sourceTag: "kind:adapter",
              onlyDependOnLibsWithTags: ["kind:domain", "kind:support"]
            },
            {
              sourceTag: "kind:domain",
              onlyDependOnLibsWithTags: ["kind:domain", "kind:support"]
            },
            {
              sourceTag: "kind:support",
              onlyDependOnLibsWithTags: ["kind:support"]
            }
          ]
        }
      ]
    }
  }
]
```

These `kind:*` tags are examples. Each repository must define its own tag taxonomy.

### Run commands

```sh
bunx eslint -c eslint.boundaries.config.mjs "**/*.{ts,tsx,js,jsx}"
bunx nx affected -t boundaries
```

Do not run ESLint with `bunx --bun` by default. ESLint officially requires Node, and this harness uses ESLint only as a compatibility runner for the Nx boundary rule.

### Unique capabilities

In this harness, ESLint has exactly one unique reason to exist: Nx's open-source `@nx/enforce-module-boundaries` rule is an ESLint rule for JavaScript/TypeScript repositories.

### Owns

ESLint owns:

```text
temporary module-boundary compatibility for JS/TS imports
```

### Does not own

ESLint does not own formatting, ordinary lint hygiene, stylistic rules, architectural source-shape rewrites, or repo-wide task orchestration.

### Integration glue

The harness owns the `boundaries` target. That target invokes ESLint with the purpose-limited boundary config. The target name must be `boundaries`, not `lint`, so the repository does not accidentally treat ESLint as the primary linter.

### Exit path

When the repository has a suitable replacement, this layer may be removed. Valid replacements are:

```text
Nx Conformance, if the repository is licensed for it;
a custom graph-boundary executor in tools/habitat-harness;
a future Biome/Nx boundary integration that fully covers the required rules.
```

Until then, keep ESLint purpose-limited and boring.

## 5.5 GritQL

### Setup

Install the CLI through the npm package if it works cleanly in the Bun workspace:

```sh
bun add -d @getgrit/cli
bunx grit init
```

If the local package install does not expose the `grit` binary correctly under Bun, use Grit's official install script or a pinned global install. This is acceptable because GritQL is a structural rewrite tool; the harness target is the source of truth for when it runs.

Pattern layout:

```text
tools/habitat-harness/patterns/grit/
  no-internal-import.grit
  no-deprecated-builder.grit
  no-generated-zone-edit.grit
  no-raw-cross-layer-call.grit
  migrate-boundary-v1-to-v2.grit
  fixtures/
    no-internal-import.input.ts
    no-internal-import.output.ts
```

`.grit/grit.yaml` should load the harness pattern directory.

### Run commands

```sh
bunx grit check
bunx grit apply <pattern-name-or-path>
bunx nx affected -t grit:check
bunx nx run <project>:grit:apply --pattern=<pattern>
```

### Unique capabilities

GritQL is the structural source-code engine. It can search for source shapes and rewrite them. This is different from formatting and different from project graph enforcement.

Use it for:

```text
codemods
bulk source rewrites
forbidden code-shape detection
automated remediation after architecture changes
deprecated builder/API migrations
repairing generated file drift
rewriting deep imports to public imports when mapping is known
```

### Owns

GritQL owns:

```text
structural search
source-shape diagnostics
source-code rewrites
codemod patterns
repair recipes
```

### Does not own

GritQL does not own the project graph, affected scope, module boundary authority, or normal formatting. Nx decides where and when GritQL runs. Biome cleans after rewrites.

### Integration glue

The harness exposes two targets:

```text
grit:check  -> detect forbidden source shapes
grit:apply  -> apply approved structural rewrites, then run Biome format
```

Every `grit:apply` pattern must be paired with fixtures. If a pattern has no fixture, it may run only in `check` mode.

Illustrative pattern shape:

```grit
// tools/habitat-harness/patterns/grit/no-deprecated-builder.grit
`oldBoundary($args)` => `newBoundary($args)`
```

Illustrative forbidden-import diagnostic shape:

```grit
// illustrative only; tune to real paths and target language
language js;

`import $what from "$path"` where {
  $path <: r".*/internal/.*",
  register_diagnostic(
    span = $path,
    message = "Do not import another project's internal files. Use the public boundary export or add a harness-approved remediation."
  )
}
```

When a safe rewrite is possible, use `grit:apply`. When intent is ambiguous, emit a diagnostic and let the agent/human choose the boundary.

## 5.6 Husky

### Setup

```sh
bun add -d husky
bunx husky init
```

Husky hook files must be thin delegators. The logic belongs in the harness CLI, not in shell scripts.

```sh
# .husky/pre-commit
bun run habitat hook pre-commit
```

```sh
# .husky/commit-msg
bun run habitat hook commit-msg "$1"
```

```sh
# .husky/pre-push
bun run habitat hook pre-push
```

### Run commands

```sh
bun run habitat hook pre-commit
bun run habitat hook commit-msg .git/COMMIT_EDITMSG
bun run habitat hook pre-push
```

### Unique capabilities

Husky owns local Git hook dispatch. It runs the right local command at the right Git moment.

### Owns

Husky owns:

```text
pre-commit trigger
commit-msg trigger
pre-push trigger
post-checkout trigger
post-merge trigger
optional Git hook trigger points
```

### Does not own

Husky does not own verification truth. Hooks are local, can be disabled, and can be bypassed. CI must remain authoritative.

### Required hook policy

| Hook | Status | Harness behavior |
| --- | --- | --- |
| `pre-commit` | recommended | Run staged Biome formatting/checks, cheap GritQL checks, and optionally a tiny boundary smoke check. Re-stage safe formatter output. Must stay fast. |
| `commit-msg` | recommended if the repo uses conventions | Validate message shape, issue link, or local context link. Must not inspect the whole repo. |
| `pre-push` | recommended | Run affected verification against the merge base: `biome:ci`, `boundaries`, `grit:check`, `typecheck`, and tests if configured. |
| `post-checkout` | optional | Run lightweight sync warnings or dependency/install hints. Do not perform surprising mutations. |
| `post-merge` | optional | Run `nx sync:check` or dependency drift warnings. Do not perform heavy verification. |
| `pre-rebase` | optional | Block rebase only for repo-specific safety reasons, such as active generated drift. |
| `post-rewrite` | optional | Run sync warnings after amend/rebase. |
| `prepare-commit-msg` | optional | Pre-fill context IDs only if the repo uses them. |
| `applypatch-msg`, `pre-applypatch`, `post-applypatch` | optional | Use only for patch-based workflows. |

The default hook flow:

```text
pre-commit:
  staged files
    -> biome format/check on staged files
    -> git update-index / re-stage formatter output
    -> cheap grit:check on staged files
    -> optional generated-zone guard

pre-push:
  merge-base
    -> nx affected -t biome:ci,boundaries,grit:check,typecheck,test
```

## 6. Integration behavior

The harness composes the tools as a pipeline:

```text
intent or change
  -> classify affected files/projects through Nx graph
  -> generate missing structure through Nx generators
  -> rewrite stale structure through GritQL
  -> clean output through Biome
  -> prove import/project boundaries through Nx + purpose-limited ESLint
  -> prove file-shape invariants through GritQL checks
  -> run affected typecheck/test targets through Nx
  -> trigger cheap local subsets through Husky
  -> run full proof in CI
```

Normative command set:

```sh
bun run habitat graph        # explain graph, tags, targets, and rule pack
bun run habitat classify <path-or-diff>
bun run habitat generate <kind> <name> [...options]
bun run habitat check        # read-only local verification
bun run habitat fix          # safe formatter + approved codemods only
bun run habitat verify       # full affected verification
bun run habitat hook <name>  # hook entrypoint for Husky
```

`habitat fix` must never perform semantic design. It may format, organize imports, apply deterministic codemods, update generated indexes, and rewrite known deprecated shapes. If the harness cannot prove the rewrite is safe, it must emit a diagnostic instead.

## 7. Enforcing architecture down to the file level

The harness enforces architecture across five layers:

```text
repository layer  -> Nx project graph and project tags
import layer      -> Nx module boundaries through purpose-limited ESLint or replacement executor
file layer        -> path rules, generated-zone rules, ownership metadata
syntax layer      -> GritQL structural checks and rewrites
hygiene layer     -> Biome format/lint/import organization
```

Every rule must be specified as an enforceable invariant, not a preference.

### 7.1 Rule pack format

```ts
// tools/habitat-harness/src/rules/architecture.ts
export default defineHarnessRules({
  projectKinds: [
    "app",
    "domain",
    "adapter",
    "support",
    "tooling",
    "test-harness"
  ],

  tagRules: [
    {
      id: "support-must-not-import-domain",
      sourceTag: "kind:support",
      onlyDependOnTags: ["kind:support"],
      message:
        "Support projects must stay reusable. Move domain meaning to a domain project or invert the dependency."
    },
    {
      id: "adapters-do-not-own-domain-truth",
      sourceTag: "kind:adapter",
      onlyDependOnTags: ["kind:domain", "kind:support"],
      message:
        "Adapters may project domain behavior; they must not become domain truth owners."
    }
  ],

  pathRules: [
    {
      id: "generated-zone-is-write-protected",
      glob: "**/__generated__/**",
      allowedWriters: ["tools/habitat-harness/**"],
      remediation: "Run bun run habitat fix or the generator that owns this file."
    }
  ],

  structuralRules: [
    {
      id: "no-internal-import",
      grit: "tools/habitat-harness/patterns/grit/no-internal-import.grit",
      mode: "check",
      remediation: "Use the public boundary export. If no public export exists, generate one or ask for a boundary decision."
    },
    {
      id: "deprecated-boundary-v1",
      grit: "tools/habitat-harness/patterns/grit/migrate-boundary-v1-to-v2.grit",
      mode: "apply",
      remediation: "Run bun run habitat fix."
    }
  ]
})
```

### 7.2 Invariant record

Each invariant must have:

```text
id
owner tool
scope
what it forbids
why it exists
detection command
safe remediation command, if any
failure message written for agents
exception path, if exceptions are allowed
```

Example:

```text
id: no-generated-zone-edit
owner tool: GritQL + Git staged-file check
scope: **/__generated__/**
forbids: manual edits to generated files
why: generated files should be recreated by the owning generator so drift is reproducible
detect: bun run habitat check --staged
remediate: bun run habitat generate <owning-kind> or bun run habitat fix
failure message: This file is generated. Do not hand-edit it. Run the owning generator or update the source declaration.
exception path: none by default
```

## 8. Automated remediation

Automated remediation is a first-class harness capability. Detection without repair is useful, but detection plus safe rewrite is the leverage point.

The harness supports three remediation classes:

```text
Biome remediation:
  formatting, import organization, simple safe assists

GritQL remediation:
  structural source rewrites, deprecated API migration, known import replacement

Nx remediation:
  generators, migrations, sync generators, project config updates, generated index refresh
```

Remediation rules:

1. A remediation must be deterministic.
2. A remediation must be repeatable.
3. A remediation must have fixtures or snapshot tests.
4. A remediation must run Biome after it rewrites source.
5. A remediation must not invent domain behavior.
6. A remediation must fail closed when intent is ambiguous.

Example remediation flow:

```text
agent changes API shape
  -> nx affected identifies impacted projects
  -> grit:check detects old call shape
  -> grit:apply rewrites old call shape to new call shape
  -> biome:format cleans touched files
  -> boundaries verifies dependency direction
  -> typecheck/test prove behavior still compiles/runs
```

## 9. CI posture

CI is authoritative. Husky is only local friction reduction.

Minimum CI command:

```sh
bun ci
bunx nx sync:check
bunx nx affected -t biome:ci,boundaries,grit:check,typecheck,test --base="$NX_BASE" --head="$NX_HEAD"
```

Equivalent install command:

```sh
bun install --frozen-lockfile
```

Full repo fallback:

```sh
bunx nx run-many -t biome:ci,boundaries,grit:check,typecheck,test --all
```

CI should upload or retain artifacts for:

```text
Biome reporter output
ESLint boundary output
GritQL diagnostics
Nx affected project list
test results
typecheck output
```

The harness should emit machine-readable JSON where practical so agents can repair from evidence instead of reading raw logs.

## 10. Agent operating procedure

Agents working in the repository should follow this sequence:

```text
1. Ask the harness to classify the target path or diff.
2. Inspect the Nx project graph and relevant tags.
3. Generate structure with Nx generators rather than hand-creating boilerplate.
4. Write only the business logic or domain-specific content that the generator cannot know.
5. Run bun run habitat fix for safe formatting and structural rewrites.
6. Run bun run habitat check for local read-only diagnostics.
7. Run bun run habitat verify before handing off substantial changes.
8. If a rule fails and no remediation exists, explain the violated invariant before changing architecture.
```

The agent should not begin by searching randomly through files. The harness exists so the agent can classify first, generate second, author third, and verify continuously.

## 11. Implementation sequence

### Phase 1: Tool baseline

```sh
bun add -d nx @nx/plugin eslint @nx/eslint-plugin husky typescript @types/bun @getgrit/cli
bun add -d -E @biomejs/biome
bunx nx init
bunx --bun @biomejs/biome init
bunx husky init
bunx nx add @nx/plugin
```

Deliverables:

```text
bun.lock
bunfig.toml
biome.json
eslint.boundaries.config.mjs
.husky/pre-commit
.husky/pre-push
.husky/commit-msg
```

### Phase 2: Local harness plugin

Create `tools/habitat-harness` and implement:

```text
createNodesV2 for project discovery
inferred targets: biome:ci, boundaries, grit:check, verify
architecture rule pack loader
basic habitat CLI running under Bun
```

Exit condition:

```sh
bun run habitat graph
bunx nx run-many -t biome:ci,boundaries,grit:check --all
```

### Phase 3: Boundary rules

Add project tags and complete initial dependency constraints. Keep the first
rule set focused on proven architecture edges.

```text
kind:app
kind:domain
kind:adapter
kind:support
kind:tooling
```

Exit condition:

```sh
bunx nx affected -t boundaries
```

### Phase 4: GritQL pattern catalog

Add three patterns first:

```text
no-internal-import.grit
no-deprecated-builder.grit
no-generated-zone-edit.grit
```

Each pattern gets fixtures and a clear failure message.

Exit condition:

```sh
bunx nx affected -t grit:check
bun run habitat fix --dry-run
```

### Phase 5: Hook closure

Make hooks delegate to the harness:

```text
pre-commit -> staged hygiene + cheap structural checks
commit-msg -> message/link policy if used
pre-push   -> affected verification
```

Exit condition:

```sh
bun run habitat hook pre-commit
bun run habitat hook pre-push
```

### Phase 6: Generators and migrations

Add generators for the repo's actual project kinds. Add migrations when the harness evolves its own conventions.

Exit condition:

```sh
bunx nx g @internal/habitat-harness:project example --kind=domain
bunx nx migrate @internal/habitat-harness
```

## 12. Forbidden patterns

### 12.1 ESLint becomes the main linter

Forbidden:

```text
eslint runs broad style, formatting, or ordinary lint rules while Biome also does the same.
```

Required:

```text
Biome owns hygiene. ESLint owns temporary boundary compatibility only.
```

### 12.2 GritQL becomes the graph

Forbidden:

```text
GritQL searches imports and acts as the project graph authority.
```

Required:

```text
Nx owns graph law. GritQL owns source shape and rewrites.
```

### 12.3 Hooks become CI

Forbidden:

```text
A change is considered verified because Husky hooks passed locally.
```

Required:

```text
Hooks are local feedback. CI is authoritative.
```

### 12.4 Rules without enforcement

Forbidden:

```text
A rule exists only in documentation or prompt text.
```

Required:

```text
Every hardened rule maps to Nx, Biome, ESLint, GritQL, Husky, or CI enforcement.
```

### 12.5 Remediation invents meaning

Forbidden:

```text
A codemod creates new domain behavior because it guessed intent.
```

Required:

```text
Codemods rewrite known structure. Humans/agents author business logic.
```

### 12.6 Bun hides undeclared dependencies

Forbidden:

```text
The workspace relies on hoisted or phantom dependencies as a normal operating mode.
```

Required:

```text
Prefer Bun isolated installs. Declare every dependency in the project that imports it.
```

## 13. Minimal command reference

```sh
# graph / orientation
bun run habitat graph
bun run habitat classify services/billing/src/index.ts
bunx nx show project billing

# hygiene
bunx nx affected -t biome:ci
bunx --bun @biomejs/biome check .
bunx --bun @biomejs/biome format --write .

# boundaries
bunx nx affected -t boundaries
bunx eslint -c eslint.boundaries.config.mjs "**/*.{ts,tsx,js,jsx}"

# structural checks and rewrites
bunx nx affected -t grit:check
bunx grit check
bunx grit apply tools/habitat-harness/patterns/grit/migrate-boundary-v1-to-v2.grit

# full verification
bun run habitat verify
bunx nx affected -t biome:ci,boundaries,grit:check,typecheck,test

# hooks
bun run habitat hook pre-commit
bun run habitat hook commit-msg .git/COMMIT_EDITMSG
bun run habitat hook pre-push
```

## 14. Final shape

This harness succeeds when a repository gains this behavior:

```text
Bun owns installs, workspace linking, lockfile, and local script execution
new structure comes from generators
stale structure is repaired by codemods
hygiene is automatic
boundaries are graph-enforced
file-level invariants are structurally checked
local hooks catch cheap mistakes early
CI proves the real change set
agents classify before they author
manual work concentrates on business logic
```

That is the Habitat tool harness: a compact, composable development toolkit that turns repository structure into an executable container for agent and human work.

## References

- Bun install / CI / lifecycle / workspaces: https://bun.com/docs/pm/cli/install
- Bun lockfile: https://bun.com/docs/pm/lockfile
- Bun workspaces: https://bun.com/docs/pm/workspaces
- Bun isolated installs: https://bun.com/docs/pm/isolated-installs
- Bun package scripts and local binary resolution: https://bun.com/docs/runtime
- Bun `bunx`: https://bun.com/docs/pm/bunx
- Bun TypeScript types: https://bun.com/docs/typescript
- Nx create-nx-workspace: https://nx.dev/docs/reference/create-nx-workspace
- Nx setup with Bun on CI: https://nx.dev/docs/guides/nx-cloud/use-bun
- Nx package-manager workspaces and TypeScript project references: https://nx.dev/docs/technologies/typescript/guides/switch-to-workspaces-project-references
- Nx Project Graph Plugins: https://nx.dev/docs/extending-nx/project-graph-plugins
- Nx Affected: https://nx.dev/docs/features/ci-features/affected
- Nx Enforce Module Boundaries ESLint Rule: https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries
- Nx Organization-Specific Plugins: https://nx.dev/docs/extending-nx/recipes/organization-specific-plugin
- Nx Sync Generators: https://nx.dev/docs/extending-nx/recipes/create-sync-generator
- Biome Getting Started / Bun commands: https://biomejs.dev/guides/getting-started/
- Biome CLI: https://biomejs.dev/reference/cli/
- Biome Linter Plugins / GritQL Diagnostics: https://biomejs.dev/linter/plugins/
- ESLint Getting Started / Bun commands: https://eslint.org/docs/latest/use/getting-started
- Grit CLI Quickstart: https://docs.grit.io/cli/quickstart
- GritQL Language Overview: https://docs.grit.io/language/overview
- Husky Get Started: https://typicode.github.io/husky/get-started.html
- Husky How To / skipping hooks: https://typicode.github.io/husky/how-to.html
- Git Hooks: https://git-scm.com/docs/githooks
