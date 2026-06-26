# Contributing to Civ7 Modding Tools

This repository is a Bun + Nx monorepo.

## Prerequisites
- Node 22.14+ (see `.nvmrc`)
- Bun (see `.bun-version`)

## Getting Started
```bash
bun install --frozen-lockfile
bun run build
bun run test
```

### Developing the CLI (@mateicanavra/civ7-cli)
- Local dev:
  ```bash
  nx run civ7-cli:dev
  ```
- Global link (optional):
  ```bash
  nx run civ7-cli:link:global
  civ7 --help
  ```

### Workspace apps/packages
- Docs:
  ```bash
  nx run civ7-docs:dev
  nx run civ7-docs:fix:mdx-links
  ```
- CLI:
  ```bash
  nx run civ7-cli:build
  node packages/cli/bin/run.js --help
  ```
- SDK:
  ```bash
  nx run civ7-sdk:build
  ```
- Playground:
  ```bash
  nx run civ7-playground:dev
  ```
- MapGen Studio:
  ```bash
  nx run mapgen-studio:dev
  bun run restart:mapgen-studio
  nx run mapgen-studio:build
  ```

### Project task commands
- Dev per package:
  ```bash
  nx run civ7-cli:dev
  nx run civ7-sdk:dev
  nx run civ7-docs:dev
  nx run civ7-playground:dev
  ```
- Run CLI from root:
  ```bash
  nx run civ7-cli:dev -- <civ7-command-and-args>
  # example
  nx run civ7-cli:dev -- data unzip default
  ```

## Outputs policy
- No outputs at repo root.
- Defaults and configuration live in `civ.config.jsonc`. All CLI commands write to a central `.civ7/outputs` directory by default.
- Apps like `docs` are responsible for pulling the resources they need from `.civ7/outputs` as part of their build/dev process. They should not be written to directly by the CLI.
- Defaults:
  - Base outputs: `.civ7/outputs`
  - Zip archives: `.civ7/outputs/archives`
  - Unzip directory: `.civ7/outputs/resources` (**git submodule**)
- Graph exports: `.civ7/outputs/graph/<seed>`
- The unzip directory is a git submodule that publishes snapshots to `mateicanavra/civ7-official-resources`.
  - One-time setup: `bun install` (Husky installs Habitat hooks via the root `prepare` script)
  - Init on a fresh clone: `bun run resources:init` (or `git submodule update --init --recursive`)
  - `civ7 data unzip` writes into the submodule working tree; diffs show up in the submodule and are auto-committed/pushed on monorepo commit (via `habitat hook pre-commit`).
- Docs: served directly from `apps/docs/site` (no build/dist by default)
- SDK: emits to `packages/sdk/dist`
- Playground: generated content remains under its app directory

## Publish readiness (Phase 9)
- SDK: `bun pm pack --cwd packages/sdk` (validation only; do not commit `.tgz`)
- CLI: `nx run civ7-cli:link:global && civ7 --help`

## Package Validation

Use root scripts for package validation so Nx builds workspace
dependencies before running package tests:

```bash
nx run civ7-cli:build
nx run civ7-cli:test
nx run civ7-cli:test:play
nx run civ7-cli:check
```

Avoid package-local CLI tests such as `bun run --cwd packages/cli test` unless
the dependency graph has already been built. The CLI imports compiled workspace
packages like `@civ7/direct-control`, so package-local tests can otherwise read
stale `dist/` output.

`nx run civ7-cli:link:global` follows the same rule: it builds the CLI package through Nx first,
including the oclif manifest generation in the package build, then registers the package binary as
the global `civ7` command.

Normal package-local `dev`, `build`, `check`, and `test` scripts must stay
leaf-local. They should not call `scripts/preflight`, run `bun --filter`, run
`bun --cwd` against sibling workspaces, or invoke Nx recursively. If a task
needs workspace dependency freshness, add the dependency edge in `nx.json`
(or the package's `"nx"` field) and expose a root script. Package-local deploy scripts follow the same
dependency-authority rule: they perform the deploy action only, while root
Nx tasks provide build prerequisites such as mod builds and the Civ7 CLI.
Explicit diagnostics may perform domain-specific setup when that setup is part
of the named diagnostic path, but not by hiding dependency freshness inside
normal app entrypoints.

### Publishing via tags (CI)
Prerequisite: In GitHub → Settings → Secrets and variables → Actions, add secrets `NPM_TOKEN_SDK` and `NPM_TOKEN_CLI` (publish tokens for GitHub Packages).

From the repo root, create and push one of the following tags:

```bash
# Publish both SDK and CLI
git tag vX.Y.Z && git push origin vX.Y.Z

# Publish only SDK
git tag sdk-vX.Y.Z && git push origin sdk-vX.Y.Z

# Publish only CLI
git tag cli-vX.Y.Z && git push origin cli-vX.Y.Z
```

The publish workflow will build, lint, test, typecheck, then publish the targeted package(s).

### Local publish (optional)
From repo root:
```bash
nx run civ7-sdk:publish:npm   # publish SDK
nx run civ7-cli:publish:npm   # publish CLI
# publish both by running the SDK command first, then the CLI command
```

## Coding style
- 2-space indentation (see `.editorconfig`)
- Biome owns formatting and ordinary lint hygiene.
- Habitat owns structural checks; ESLint is quarantined to
  `eslint.boundaries.config.mjs` for Nx project-boundary enforcement.
- Prefer small, focused PRs

## Commit
```bash
git checkout -b feat/your-change
# make changes
bun run test
git commit
```

### Commit message conventions

Use Conventional Commits with an optional ticket prefix when a trackable ID exists (Linear or other):

```text
[LIN-123] feat(cli): add unzip progress output

Add a per-archive progress indicator and per-file counts so long extractions
are easier to monitor.

Notes:
- Default output stays stable for scripts; progress is opt-in via `--progress`.

References:
- Project: @civ7/cli
- Linear: LIN-123
- Docs: docs/system/sdk/overview.md
```

Rules:
- **Title:** `[TICKET] type(scope): summary` (ticket prefix optional if no ID).
- **Scope:** internal area of concern (package/app/subsystem), not the repo/project name.
- **Body:** explain intent + user-visible behavior and any operational/testing notes.
- **Footer references:** include the project/package being worked on and the ticket ID from the title (plus any other durable references).
