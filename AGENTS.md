# AGENTS

This repo uses nested `AGENTS.md` files as lightweight domain routers: short, enduring rules plus links to canonical docs. Do not put implementation detail, task status, or temporal/refactor‑specific commentary in `AGENTS.md`.

## How To Use AGENTS

- Read this root router first, then the closest subtree `AGENTS.md` for any files you touch; deeper routers refine or override higher‑level guidance.
- Open linked docs on demand instead of restating volatile detail in routers.

## Hygiene & Maintenance

- Before editing, skim `git status` for existing work and avoid undoing unrelated changes.
- When using `apply_patch`, always use absolute file paths. Do not use relative
  paths in patch headers; agents often run from different working directories,
  and absolute paths prevent accidental edits in the wrong checkout or worktree.
- When changing behavior or public contracts, update adjacent docs and tests in the same change; use templates in `docs/_templates/` when adding new docs.
- Record significant architectural decisions in `docs/system/ADR.md` and intentional deferrals with triggers in `docs/system/DEFERRALS.md`.
- Treat generated artifacts (e.g., `dist/`, `mod/`) and lockfiles as read‑only; regenerate them via scripts instead of hand‑editing.
- Follow established directory conventions; consult the relevant `docs/system/**` overviews before introducing new domains or layouts.
- When you find important, surprising, interesting, or particularly novel or useful, please add it to the respective project or canonical doc (depending on the timescale of its quality).

## Docs Architecture (Where Things Go)

- Canonical, evergreen entrypoints live at `docs/` root (`PRODUCT.md`, `SYSTEM.md`, `PROCESS.md`, `ROADMAP.md`, `DOCS.md`).
- Use **ALL‑CAPS** filenames anywhere under `docs/` for canonical single‑source‑of‑truth docs at that directory’s scope.
- Use **lowercase** filenames for supporting, scoped, or implementation‑detail docs.
- Time‑bound specs, milestones, logs, and refactor notes belong under `docs/projects/<project‑slug>/...`.
- Evergreen domain docs belong under `docs/product/`, `docs/system/`, and `docs/process/`.
- Start new docs from `docs/_templates/` and copy into place; don’t edit templates in place.
- Move superseded docs to `docs/_archive/` and preserve names.

See `docs/DOCS.md` for the full docs layout and naming heuristics.

## Workflow (Graphite + Linear)

- Git work uses Graphite stacked PRs, not ad‑hoc branches/PRs. Stage changes as small, reviewable layers (one logical change per branch) and merge bottom → top of the stack using `gt`.
- Linear is the canonical task tracker. Keep issue descriptions durable (scope/objectives/acceptance), and keep status/progress in Linear fields or comments—not in docs or issue bodies.
- When a task needs durable context, add or update the appropriate doc under `docs/` and link it from Linear instead of duplicating.

See `docs/process/GRAPHITE.md` and `docs/process/LINEAR.md` for full conventions.

## Start Here (Evergreen Docs)

- [Product Overview](docs/PRODUCT.md)
- [System Architecture](docs/system/ARCHITECTURE.md)
- [How We Work](docs/PROCESS.md)
- [Contributing](docs/process/CONTRIBUTING.md)
- [Testing](docs/system/TESTING.md)

## Tooling Defaults

- Use root `bun` workspace scripts for build, type‑checks, lint, and tests unless a closer `AGENTS.md` says otherwise.
- Prefer root Nx-orchestrated scripts for cross-workspace workflows (apps,
  multi-package builds). Use root `package.json` scripts first; those scripts
  are thin entrypoints into owning Nx targets. For ad hoc terminal Nx commands,
  use `nx <args>` so the repo-local pinned Nx package is used through standard
  Nx local override behavior. Habitat-spawned Nx commands must use the same root entrypoint. Package
  scripts may still call non-Nx local tools such as `biome` and `grit` through
  the script PATH, but package scripts must not hide dependency ordering that
  belongs in Nx `dependsOn`.
- Git hooks are Husky delegators into `habitat hook <name>`; hooks reduce local friction, while CI remains authoritative. Pre-commit may restage formatter-touched files only. Resource publishing is an explicit command path documented in `docs/process/resources-submodule.md`, not a hidden default hook side effect.
- Project-plane import boundaries are enforced by the Habitat `boundaries`
  target and `nx-boundaries` rule. See
  `docs/projects/habitat-harness/taxonomy.md` before changing `kind:*` tags or
  boundary constraints.
- For unfamiliar structure, start with `bun run habitat classify <path-or-diff>`
  before editing. Treat emitted project targets as runnable only when classify
  reports them from resolved Nx metadata; unavailable targets are routing facts,
  not commands to run. For supported new uniform projects, scaffold with
  `nx g @internal/habitat-harness:project <name> --kind=<plugin|foundation|app>`;
  for new Grit-backed rules, use
  `nx g @internal/habitat-harness:pattern <rule-id>` only to create a
  non-enforcing candidate draft. Candidate output is not a registered Habitat
  rule, baseline, hook scope, or current-tree proof. Registered enforcement
  requires the accepted Pattern Authority Manifest, baseline contract,
  current-tree proof, fixture strategy, false-positive model, and hook-scope
  decision. Unsupported kinds are intentionally refused until their owning
  domain defines a uniform generator shape. After authoring, run the targets
  reported by `habitat classify` plus the nearest package-local checks.
- Use package scripts (`bun run --cwd <path> <script>`) for leaf-local debugging
  when dependency freshness is already established. Use root Nx-orchestrated
  scripts for proof.
- Runtime Civ7 control belongs in `@civ7/direct-control`; agents should not
  add alternate runtime transports or caller-local control scripts.

## Civ7 Resources

- Official game resources are maintained as a git submodule at `.civ7/outputs/resources` (published at `mateicanavra/civ7-official-resources`).
- One-time + recurring workflow: see `docs/process/resources-submodule.md`.

## Domain Routers

- MapGen / Swooper Maps mod: `mods/mod-swooper-maps/AGENTS.md`, `docs/system/mods/swooper-maps/`, `docs/system/libs/mapgen/`.
- MapGen / Swooper Maps architecture normalization: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` is the active project baseline; `openspec/changes/README.md` owns the downstream change train.
- CLI & plugins: `packages/cli/AGENTS.md`, `packages/plugins/*/AGENTS.md`, `docs/system/cli/`.
- SDK: `packages/sdk/AGENTS.md`, `docs/system/sdk/`.

## Repo Policy

- Open PRs against `origin`; details in `docs/process/CONTRIBUTING.md`.
- Active work lives under `docs/projects/`.
