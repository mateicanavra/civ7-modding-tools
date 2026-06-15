## 1. Init And Conversion

- [x] 1.1 Record current `main` baselines: `bun run build && bun run check &&
  bun run test` green; hash `mods/mod-swooper-maps/mod/**` build output for
  later byte-parity comparison.
- [x] 1.2 Run `bunx nx@latest init` (latest 22.x; abort if resolver selects
  21.5.0/21.6.0); decline Nx Cloud; record exact version in the phase record.
- [x] 1.3 Diff generated `nx.json` against `turbo.json` semantics; apply the
  manual conversion pass from design.md (env inputs, `cache: true`,
  `persistent` → `continuous`, `sharedGlobals`).
- [x] 1.4 Move all project-scoped turbo.json overrides (7 at time of writing:
  `mod-swooper-maps#build`, `mod-swooper-maps#check`, `@civ7/docs#dev`,
  `mapgen-studio#dev`/`#build`/`#check`/`#test`) plus the
  `build:studio-recipes` target into the respective package.json `"nx"`
  fields.
- [x] 1.5 Add `tools/*` to root workspaces; add root `mise.toml` pinning node
  and bun; gitignore `.nx/cache` and `.nx/workspace-data`.

## 2. Script And CI Re-Pointing

- [x] 2.1 Re-point root package scripts from `turbo run ...` to
  `bunx nx run-many ...` (and `nx affected` where scoped), preserving script
  names and semantics.
- [x] 2.2 Update `.github/workflows/ci.yml` to Nx commands; keep frozen-lockfile
  install and the pnpm guard; keep `architecture-strict-core` job steps
  otherwise unchanged.
- [x] 2.3 Update `scripts/lint/lint-workspace-entrypoints.mjs`: forbid nested
  `nx` orchestration in package-local scripts (replace nested-turbo rule);
  keep all other rules. Expected green at landing (no current violations);
  record in the phase record that this rule-semantics edit precedes the
  ratchet machinery (H2) deliberately.

## 3. Turbo Retirement

- [x] 3.1 Remove `turbo` devDependency and `turbo.json`; remove `.turbo` from
  gitignore/caches; `bun install` to update lockfile.
- [x] 3.2 Sweep docs: update root `AGENTS.md` Tooling Defaults and any doc
  that names turbo as orchestrator (`git grep -il turbo docs/ AGENTS.md`);
  leave historical project docs untouched.

## 4. Verification And Closure

- [x] 4.1 `bunx nx graph --file=graph.json`: all 21 projects present;
  spot-check edges (mapgen-core→adapter types, mod-swooper-maps→sdk/engine,
  studio-server edges).
- [x] 4.2 `bun run build && bun run check && bun run test` green;
  `mods/mod-swooper-maps/mod/**` output byte-identical to the 1.1 baseline.
- [x] 4.3 Affected probe: touch one source file in `packages/config`, run
  `bunx nx affected -t check --base=main`; expected affected set =
  `@civ7/config` plus its dependents as listed in graph.json (record the
  expected set in the phase record before running); confirm the actual
  affected set matches.
- [x] 4.4 Cache-behavior gate: run `bunx nx run-many -t build --all` twice on
  an unchanged tree — second run must report all tasks as cache hits; then
  touch one source file in `packages/config` — only `@civ7/config` and its
  dependents may miss cache.
- [x] 4.5 `git grep -l turbo` limited to historical references; record
  residuals in the phase record.
- [x] 4.6 `bun run openspec -- validate habitat-nx-adoption --strict`; update
  downstream realignment (AGENTS.md, process docs) and close per workstream
  record.
