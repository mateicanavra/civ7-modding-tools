## 1. Init And Conversion

- [ ] 1.1 Record current `main` baselines: `bun run build && bun run check &&
  bun run test` green; hash `mods/mod-swooper-maps/mod/**` build output for
  later byte-parity comparison.
- [ ] 1.2 Run `bunx nx@latest init` (latest 22.x; abort if resolver selects
  21.5.0/21.6.0); decline Nx Cloud; record exact version in the phase record.
- [ ] 1.3 Diff generated `nx.json` against `turbo.json` semantics; apply the
  manual conversion pass from design.md (env inputs, `cache: true`,
  `persistent` → `continuous`, `sharedGlobals`).
- [ ] 1.4 Move `mod-swooper-maps#build:studio-recipes` and `mapgen-studio#dev`
  overrides into the respective package.json `"nx"` fields.
- [ ] 1.5 Add `tools/*` to root workspaces; add root `mise.toml` pinning node
  and bun; gitignore `.nx/cache` and `.nx/workspace-data`.

## 2. Script And CI Re-Pointing

- [ ] 2.1 Re-point root package scripts from `turbo run ...` to
  `bunx nx run-many ...` (and `nx affected` where scoped), preserving script
  names and semantics.
- [ ] 2.2 Update `.github/workflows/ci.yml` to Nx commands; keep frozen-lockfile
  install and the pnpm guard; keep `architecture-strict-core` job steps
  otherwise unchanged.
- [ ] 2.3 Update `scripts/lint/lint-workspace-entrypoints.mjs`: forbid nested
  `nx` orchestration in package-local scripts (replace nested-turbo rule);
  keep all other rules.

## 3. Turbo Retirement

- [ ] 3.1 Remove `turbo` devDependency and `turbo.json`; remove `.turbo` from
  gitignore/caches; `bun install` to update lockfile.
- [ ] 3.2 Sweep docs: update root `AGENTS.md` Tooling Defaults and any doc
  that names turbo as orchestrator (`git grep -il turbo docs/ AGENTS.md`);
  leave historical project docs untouched.

## 4. Verification And Closure

- [ ] 4.1 `bunx nx graph --file=graph.json`: all 21 projects present;
  spot-check edges (mapgen-core→adapter types, mod-swooper-maps→sdk/engine,
  studio-server edges).
- [ ] 4.2 `bun run build && bun run check && bun run test` green;
  `mods/mod-swooper-maps/mod/**` output byte-identical to the 1.1 baseline.
- [ ] 4.3 Probe `bunx nx affected -t check --base=main` with a one-package
  change; confirm correct scoping.
- [ ] 4.4 `git grep -l turbo` limited to historical references; record
  residuals in the phase record.
- [ ] 4.5 `bun run openspec -- validate habitat-nx-adoption --strict`; update
  downstream realignment (AGENTS.md, process docs) and close per workstream
  record.
