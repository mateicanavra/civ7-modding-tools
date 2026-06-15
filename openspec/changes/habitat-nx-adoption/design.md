# Design — Nx Adoption (Turbo Retirement)

## Current Guidance Supersession

This design describes the original H1 migration from Turbo to Nx. Current repo
guidance is controlled by
`openspec/changes/habitat-nx-worktree-state-contract/`: use root
`bun run <script>` entrypoints for normal workflows, direct `nx <args>` for ad
hoc Nx, package-owned `verify` targets for focused verifiers, and no
package-manager/link/cache/socket/daemon workaround. `bunx nx` below is
historical migration proof language, not the current command contract.

## Conversion map (turbo.json → nx.json)

Current `turbo.json` tasks and their Nx equivalents:

| turbo.json | nx.json |
|---|---|
| `build` (`dependsOn: ["^build"]`, outputs `dist/**`, `types/**`, `example-generated-mod/**`, `mod/**`) | targetDefault `build`: same `dependsOn`, same `outputs` with `{projectRoot}` interpolation, `cache: true` |
| `check` (`dependsOn: ["^build", "^check"]`) | targetDefault `check`: same dependsOn, `cache: true`, no outputs |
| `lint` (no cache) | targetDefault `lint`, `cache: true` only if inputs are declared correctly; otherwise leave uncached initially |
| `test` (`dependsOn: ["^build"]`) | targetDefault `test`, `cache: true` with test inputs |
| `test:architecture-cutover` | same pattern as `test` |
| `mod-swooper-maps#build:studio-recipes` (outputs `src/maps/generated/**`) | project-level target override in `mods/mod-swooper-maps/package.json` `"nx"` field |
| `mapgen-studio#dev` (depends on studio-recipes, `persistent: true`) | project-level override; `persistent` → `continuous: true` |

**This table is ILLUSTRATIVE — it covers ~7 of the 18 task entries in
`turbo.json`. The implementer MUST enumerate every task entry in `turbo.json`
at execution time and convert each one.** Explicitly including:

- `mod-swooper-maps#build` — carries `env: ["SWOOPER_STUDIO_RUN_ID"]`, which
  becomes an Nx input (env entry) on that project's override.
- The three `mapgen-studio#*` targets (`build`, `check`, `test`) that depend on
  `mod-swooper-maps#build:studio-recipes` (plus `mapgen-studio#dev` above).
- `deploy`, `deploy:studio`, `clean`, `dev`, and `@civ7/docs#dev`.
- The root `deploy:mods` script's `--filter='./mods/*'` path-glob, which has no
  direct Nx equivalent — map it to an explicit
  `nx run-many --projects=<mod project names>` list or a tag-based selector,
  and record the choice in the phase record.

Fields requiring manual decisions (converter does not map): any `env`/
`globalEnv` usage → Nx `inputs` env entries; `globalDependencies` →
`sharedGlobals` namedInput (include `civ.config.jsonc`, `tsconfig.base.json`,
`bun.lock` if turbo listed them).

## Posture rules

- Nx runs on Node (`bunx nx`); never `bunx --bun nx`. Bun stays package
  manager and script runner. Pin Node in `.nvmrc`/`engines.node` and Bun in
  `.bun-version`/`packageManager`.
- Projects remain package.json-based (Nx infers from workspaces). No
  `project.json` files; per-project Nx config goes in the package.json `"nx"`
  field when needed.
- `.nx/cache` gitignored; no Nx Cloud (`useInferencePlugins`/cloud prompts
  declined; `nx.json` carries no `nxCloudId`).
- Version: latest 22.x at execution time (`bunx nx@latest init`); record exact
  version in the phase record. `nx migrate` to 23 later is out of scope.

## CI shape

`ci` job: `bun install --frozen-lockfile` → `bunx nx run-many -t build check
lint test --all` initially; switch to `nx affected` with
`--base=$NX_BASE --head=$NX_HEAD` once `nrwl/nx-set-shas` (or manual
merge-base) is wired. `architecture-strict-core` job keeps its current
script-level steps (they are re-pointed to harness targets in later slices,
not here).

## Risk containment

First task is the init + diff (the de-risked path): run `bunx nx@latest init`
on the branch, diff generated `nx.json` against `turbo.json` semantics, and
only then remove turbo. If conversion is lossy in a way that cannot be
expressed (stop condition), record evidence in the phase record and surface
to Matei — this is the FRAME falsifier for D1.
