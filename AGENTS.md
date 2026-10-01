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

- Use root `bun` workspace scripts only for durable repo-wide workflows:
  `build`, `check`, `lint`, `test`, `clean`, `ci`, `verify`, and operational
  root commands such as `resources:*`, `refresh:data`, and `openspec*`.
- Use Nx directly for project tasks and graph execution:
  `nx run <project>:<target>` or `nx run-many -t <target>`. Root package
  scripts are not aliases for package-specific targets. For ad hoc terminal Nx
  commands, use `nx <args>` so the repo-local pinned Nx package is used through
  standard Nx local override behavior. An Nx-owned Habitat target must not start
  another Nx scheduler; project graph-backed work belongs in `dependsOn`.
  Package scripts may still call non-Nx local tools such as `biome` through the
  script PATH.
- Put all output-materializing targets for one proof in one Nx invocation so
  Nx owns ordering, deduplication, caching, and parallelism. Do not manufacture
  parallel graphs or temporary worktrees for routine proof; compose the task
  graph instead.
- Use direct Habitat CLI commands as `bun habitat <subcommand>`. Graph-owned
  Habitat execution is `nx run-many -t check:policy`.
- Habitat is consumed only through the pinned `@habitat-ai/cli` development
  dependency. Its exact SDK dependency owns shared blueprint law; do not copy
  shared packets into this repository. Local `.habitat` authority is limited
  to qualified Civ7 Grit and structure rules described in
  `.habitat/AUTHORITY.md`.
- Husky pre-push runs the repository-owned `bun run check` graph. The Codex
  stop hook delegates only to `bun habitat hook agent-stop`; Habitat does not
  own a pre-commit or pre-push command surface. Resource publishing is an
  explicit command path documented in `docs/process/resources-submodule.md`,
  not a hidden hook side effect.
- Project-plane import boundaries are enforced by
  `nx run civ7-workspace:check:boundaries`. See
  `docs/projects/habitat-harness/taxonomy.md` before changing `kind:*` tags or
  boundary constraints.
- For unfamiliar structure, inspect `habitat.toml`, run `bun habitat resolve`,
  and inspect the owning Nx project's inferred `check:policy` target. The
  public release does not expose project or pattern scaffold generators;
  unsupported kinds remain refused rather than approximated locally. After
  authoring a qualified local rule, run its focused Habitat target plus the
  nearest package-local checks.
- Use package scripts (`bun run --cwd <path> <script>`) for leaf-local debugging
  when dependency freshness is already established. Use root Nx-orchestrated
  scripts for proof.
- Route Civ7 capabilities through the accepted realization model in
  `docs/projects/civ7-capability-realization/`: resource contracts own
  provider-neutral external capability, providers own concrete acquisition and
  release, services own semantic policy and operations, plugins own caller
  projection, and apps own selection, binding, mounting, and process lifetime.
  `services/civ7-controller` owns typed native operations executed inside Civ7
  and is realized through a dedicated controller mod; host apps bind its public
  client through selected Tuner access without regenerating operation bodies.
  `services/civ7-play` owns actor-facing gameplay over that public client. Raw
  JavaScript is an explicit app-owned diagnostic escape hatch only.
  `packages/civ7-direct-control`, `services/civ7-control`, aggregate facades,
  private contract picking, service routers exposed over the wire, and
  service-owned resource acquisition have no destination shape.
- Global `dev:orpc`, `dev:effect-orpc`, `dev:effect-ts`, `dev:inngest`, and
  `dev:effect-inngest` skills own generic vendor guidance. Repo-local skills may
  add Civ7 product and boundary law only; they must not freeze or copy vendor
  syntax. Claims about the installed prerelease tuple require exact installed
  declarations, source, or discriminating fixtures.

## Civ7 Resources

- Official game resources are maintained as a git submodule at `.civ7/outputs/resources` (published at `mateicanavra/civ7-official-resources`).
- One-time + recurring workflow: see `docs/process/resources-submodule.md`.

## Effect Source

- `.repos/effect` is a source-only reference submodule; the Effect skill is
  supplied globally by RAWR HQ and must not be copied into Civ7.
- Initialize it only for exact source-level vendor work, then verify with
  `bun run effect:init` and `bun run effect:status`; see
  `docs/process/effect-source-submodule.md`.

## Domain Routers

- MapGen / Swooper Physics definition: `plugins/mod/map/swooper-physics/AGENTS.md`;
  Civ7 realization: `apps/mods/map/swooper-physics/AGENTS.md`; canonical docs:
  `docs/system/mods/swooper-maps/` and `docs/system/libs/mapgen/`.
- Platform realization and migration authority:
  `docs/projects/civ7-capability-realization/`. MapGen-internal normalization
  evidence remains in
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`;
  `openspec/changes/README.md` owns the downstream change train.
- CLI and projections: `apps/cli/AGENTS.md`, `plugins/cli/topics/*/AGENTS.md`,
  the nearest `plugins/**/AGENTS.md`, and `docs/system/cli/`.
- SDK: `packages/sdk/AGENTS.md`, `docs/system/sdk/`.

## Repo Policy

- Open PRs against `origin`; details in `docs/process/CONTRIBUTING.md`.
- Active work lives under `docs/projects/`.
