## Why

The habitat harness (docs/projects/habitat-harness/FRAME.md) requires an
authoritative repository graph: project identity, tags, dependency edges,
affected-scope calculation, cacheable targets, local generators, and
migrations. Turbo provides task orchestration only — no graph queries, no
tags, no boundary enforcement, no generators. Matei's settled decision D1:
adopt Nx fully and retire Turbo; no dual-orchestrator posture.

Nx documents a native Turborepo migration (`nx init` detects `turbo.json` and
converts tasks to `targetDefaults`) and officially supports Bun workspaces
with Nx running on Node via `bunx nx`. Verified 2026-06-12; sources in
FRAME.md §4.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (hard core #2, #5; decisions D1)
- `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md` §5.2 (Nx ownership), §2 (Bun posture)
- Official Nx docs checked 2026-06-12:
  - `https://nx.dev/docs/guides/adopting-nx/from-turborepo`
  - `https://nx.dev/docs/guides/nx-cloud/use-bun`
  - `https://nx.dev/docs/extending-nx/project-graph-plugins`
- Root `AGENTS.md` Tooling Defaults (turbo-orchestrated root scripts — updated by this change)

## What Changes

- Run the documented Nx adoption (`bunx nx@latest init`, latest 22.x; never
  21.5.0/21.6.0) and convert every `turbo.json` task to `nx.json`
  `targetDefaults`/`namedInputs`, including the special
  `mod-swooper-maps#build:studio-recipes` / `mapgen-studio#dev` dependency.
- Manual conversion pass for fields the converter does not map: env-var
  inputs, explicit `cache: true`, `persistent` → `continuous`.
- Pin runtimes in a new root `mise.toml` (node + bun); Nx runs on Node via
  `bunx nx`; Bun remains the only package manager.
- Add `tools/*` to root `package.json` workspaces (empty until
  `habitat-harness-scaffold`).
- Re-point root scripts (`build`, `check`, `test`, `lint`, `test:ci`,
  `ci:architecture-strict-core`, dev scripts) from `turbo run ...` to
  `bunx nx run-many ...` / `bunx nx affected ...` equivalents.
- Update `.github/workflows/ci.yml` to Nx commands with affected-scope
  (`NX_BASE`/`NX_HEAD`) and keep the full-repo fallback.
- Update `scripts/lint/lint-workspace-entrypoints.mjs` to forbid nested `nx`
  orchestration in package-local scripts (replacing the nested-turbo rule).
- Remove `turbo` devDependency, `turbo.json`, and `.turbo` cache references.
- Update root `AGENTS.md` Tooling Defaults and any docs that name turbo as the
  orchestrator.

## What Does Not Change

- No project tags, boundary rules, or new enforcement (those are
  `habitat-boundary-tags` and later slices).
- No package code, no build outputs, no test content.
- Bun lockfile, workspace layout (other than adding `tools/*`), and package
  scripts' semantics.

## Requires

- None (train root).

## Enables Parallel Work

- `habitat-harness-scaffold` (Nx plugin + target inference).
- All later slices that use `nx affected` or Nx targets.

## Affected Owners

- Root config: `package.json`, `nx.json` (new), `turbo.json` (removed),
  `mise.toml` (new), `.github/workflows/ci.yml`
- `scripts/lint/lint-workspace-entrypoints.mjs`
- Root `AGENTS.md`, `docs/PROCESS.md`-adjacent tooling docs that name turbo

## Forbidden Owners

- No `project.json` files in product packages (projects stay
  package.json-based; harness-owned target inference comes later).
- No Nx Cloud onboarding, no `nx-cloud` dependency, no distributed agents.
- No turbo+nx coexistence after this change lands (no surviving `turbo.json`).
- No running Nx under the Bun runtime (`bunx --bun nx` is forbidden); no `nx`
  invocation from bun `postinstall`.

## Stop Conditions

- The converted graph cannot reproduce an existing pipeline behavior
  (task ordering, caching correctness, or the studio-recipes special
  dependency) — stop and record before forcing it.
- `nx init` requires lockfile or workspace changes beyond adding nx
  devDependencies — stop and verify against the Bun support docs.
- Any check that is green on `main` becomes red under Nx orchestration for
  orchestration reasons (not rule reasons).

## Consumer Impact

Contributors and agents switch from `turbo run` to `bun run <script>` (root
scripts preserved) or `bunx nx ...`. CI runtime should improve via affected
scope. No package-level consumer impact.

## Verification Gates

- `bun run openspec -- validate habitat-nx-adoption --strict`
- `bunx nx graph --file=graph.json` succeeds; graph contains all 21 projects
  with correct dependency edges (spot-check adapter/mapgen-core/mod edges).
- `bun run build && bun run check && bun run test` green, byte-equivalent
  behavior to `main` for build outputs of `mod-swooper-maps` (mod/ output diff
  empty on same inputs).
- `bunx nx affected -t check --base=main` runs and scopes correctly on a probe
  change.
- CI workflow passes on the PR with Nx commands.
- `git grep -l "turbo"` returns only historical docs/changelog references.
