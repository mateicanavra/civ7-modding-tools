# Habitat / Studio UI Post-Merge Semantic Restack Runbook

Status: historical restack artifact; Studio lifecycle instructions superseded

No restack execution has been performed from this document. Current Studio
operation is `nx run mapgen-studio:dev`: one foreground Nx graph owns Vite, its
continuous daemon dependency, and interrupt teardown. Any source-watch or
restart-helper instruction below is historical evidence and must not be
executed.

## Purpose

This runbook is the execution authority for the next Habitat semantic restack
after the Studio UI extraction stack drains into `main`.

The problem is not "resolve conflicts." The problem is:

> Restack the already-folded Habitat stack onto the post-Studio-drain `main`
> while preserving both workstreams' intentional deltas: Habitat's projectized
> execution and structural checks, plus Studio's extracted UI and contract
> package ownership.

The core ownership split is:

- Habitat owns projectized taskgraph mechanics, boundary taxonomy, Habitat
  checks, daemon/source-watch safety, source export safety, generated/protected
  artifact discipline, and current `tools/habitat` enforcer locations.
- Studio owns `@swooper/mapgen-studio-ui`, `@civ7/studio-contract`, extracted
  UI components, Storybook, design-sync, theme source, contract package
  boundaries, and app dependency pruning caused by extraction.

This document supersedes the provisional external draft prepared before the
Studio handoff was available.

It also narrows the older Habitat semantic-restack runbook where Studio work
changed the target.

Specifically, the older runbook's app-local Storybook/design-sync preservation
lane is now stale after the Studio UI extraction: Storybook and design-sync must
be package-owned under `packages/mapgen-studio-ui`, not preserved in
`apps/mapgen-studio`.

## Authority And Evidence

Primary authority:

- `studio-ui-restack-handoff` at `3ee5b6c6b6cc`
- Handoff path on that branch:
  `docs/projects/graphite-stack-integration/HABITAT-RESTACK-HANDOFF.md`

Current pre-drain anchors observed during this planning pass:

- Habitat branch: `codex/habitat-closed-structure-method-frame`
- Habitat tip: `11dc92211b82`
- Local `main`: `c4ebaf1e1bc8`
- `origin/main`: `c4ebaf1e1bc8`
- Studio survivor top: `studio-ui-operating-structure` at `4011c443150a`
- Studio handoff top: `studio-ui-restack-handoff` at `3ee5b6c6b6cc`

Verified current Graphite shape:

- Habitat top is `codex/habitat-closed-structure-method-frame`.
- Studio handoff is a side-stack branch above `studio-ui-operating-structure`,
  not yet merged into `main` at authoring time.
- The direct overlap between current Habitat top and Studio handoff top,
  relative to `main`, is exactly eight files:
  - `apps/mapgen-studio/package.json`
  - `packages/studio-server/package.json`
  - `vitest.config.ts`
  - `bun.lock`
  - `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts`
  - `apps/mapgen-studio/test/ui/sonnerTheme.test.tsx`
  - `tools/habitat-harness/test/lib/boundary-taxonomy.test.ts`
  - `docs/projects/habitat-harness/taxonomy.md`

Claim labels used below:

- Verified: current Git/Graphite/file evidence supports the claim.
- Corroborated: multiple signals support the claim, but a post-drain rerun is
  still needed.
- Plausible: likely but not safe as execution authority alone.
- Unresolved: must be checked or decided before closure.

Proof labels used below:

- Record truth proof: file shape, manifest shape, source grep, branch/commit
  fact, or documented config state.
- Native tool behavior: Nx, Bun, Storybook, TypeScript, or package tool result.
- Habitat wrapper behavior: `bun habitat ...` behavior over Habitat's current
  wrappers and policies.
- Unit behavior: unit/integration test result.
- Baseline proof: regenerated artifact or lockfile follows source inputs.
- Runtime/product proof: real daemon/game/user path exercised. This runbook
  does not require runtime/product proof unless the user explicitly asks.

## Hard Stop Before Any Mutation

Do not run `gt sync`, `gt restack`, `gt fold`, branch renames, conflict
resolution, lockfile regeneration, commits, submits, pushes, or merges until
all preflight gates below pass.

### Gate 0.1 - Studio Drain Must Be Real

After the Studio stack is said to be merged, verify it from the Habitat
worktree:

```bash
git fetch --prune origin main
git status --short --branch --untracked-files=all
git rev-parse --short=12 HEAD
git rev-parse --short=12 main
git rev-parse --short=12 origin/main
git merge-base HEAD origin/main | cut -c1-12
gt ls --no-interactive
```

Then prove the Studio drain set is on `origin/main`:

```bash
git log --oneline --first-parent c4ebaf1e1bc8..origin/main
git branch --contains 4011c443150a
git merge-base --is-ancestor 4011c443150a origin/main
```

Expected post-drain source set:

- PRs `#1996` through `#2006`
- Branches:
  - `studio-ui-extraction`
  - `studio-contract-package`
  - `studio-ui-scaffold`
  - `studio-ui-primitives`
  - `studio-ui-composites`
  - `studio-ui-forms`
  - `studio-ui-panels`
  - `studio-ui-appheader`
  - `studio-ui-sync-repoint`
  - `studio-ui-cleanup`
  - `studio-ui-operating-structure`

The `studio-ui-restack-handoff` branch is documentation authority for this
plan. It may or may not itself drain with the code stack. Its content must be
available either from `origin/main` after drain or from the current
`studio-ui-restack-handoff` branch at `3ee5b6c6b6cc`.

Stop if:

- `4011c443150a` is not an ancestor of `origin/main`.
- Any expected code PR in `#1996`-`#2006` is absent from first-parent main.
- Additional post-`c4ebaf1e1bc8` first-parent PRs touch the Habitat/Studio
  overlap surface and are not accounted for in this runbook.
- `gt ls` still presents the Studio UI stack as an unmerged side stack that a
  Habitat restack command would rebase.

### Gate 0.2 - Habitat Worktree Must Be Clean And Scoped

Run:

```bash
git status --short --branch --untracked-files=all
git diff --quiet
git diff --cached --quiet
git worktree list --porcelain
gt ls --no-interactive
```

Stop if the active Habitat worktree has unrelated dirt.

Known loose artifact class from the Studio handoff:

- `apps/mapgen-studio/.design-sync/sb-reference/`
- `apps/mapgen-studio/storybook-static/`

These are superseded app-local generated outputs after B7. They are not restack
payload. If present as untracked files in the execution worktree, remove them
as local cleanup before restack or stop for user approval if ownership is
unclear.

Do not use the root checkout or runner worktree as the write surface.

### Gate 0.3 - Recompute The Overlap

Use the actual post-drain merge-base:

```bash
BASE="$(git merge-base origin/main HEAD)"
git diff --name-status "$BASE"..origin/main
git diff --name-status "$BASE"..HEAD
comm -12 \
  <(git diff --name-only "$BASE"..origin/main | sort) \
  <(git diff --name-only "$BASE"..HEAD | sort)
```

Expected direct overlap remains the eight-file table in the next section.

Stop if:

- there are direct overlaps outside the eight-file table and they are not
  clearly docs-only or generated/protected cleanup;
- any of the eight files no longer exists in either side in a way that changes
  the `UNION`, `COMPOSE`, `CARRY`, or `REGENERATE` resolution;
- Habitat branch count or top branch differs materially from the current
  32-branch folded stack.

## Canonical 8-File Conflict Ledger

Resolve the direct overlap through this table, not through broad watch-area
memory. Each row has one disposition and one falsifier.

| File | Disposition | Resolution | Falsifier |
| --- | --- | --- | --- |
| `apps/mapgen-studio/package.json` | COMPOSE | Use Habitat's slim package/task externalization as base. Apply Studio dependency graph: add `@civ7/studio-contract` and `@swooper/mapgen-studio-ui`; prune app-local extracted UI, Storybook, RJSF runtime deps as Studio did; keep app runtime deps that remain app-owned. Do not restore inline `nx`. | App package regains `nx.targets`, app-local Storybook deps/scripts, or extracted UI deps that belong to `mapgen-studio-ui`. |
| `packages/studio-server/package.json` | UNION | Keep Habitat's external `project.json` ownership and Studio package delta: remove `./live-game`; add `@civ7/studio-contract`; keep `./contract` and root exports with `bun-source`. | `./live-game` returns, `@civ7/studio-contract` is absent, or package `nx` metadata conflicts with `packages/studio-server/project.json`. |
| `vitest.config.ts` | UNION | Keep Habitat's renamed `habitat` project rooted at `tools/habitat` and `@habitat/cli` alias; add Studio's `mapgen-studio-ui` project rooted at `packages/mapgen-studio-ui`. | Old `tools/habitat-harness` vitest root returns or `mapgen-studio-ui` test project is absent. |
| `bun.lock` | REGENERATE | After all package/workspace/project decisions are settled, run `bun install`. Never text-merge conflict hunks. Then verify with `bun install --frozen-lockfile`. | Any manual lockfile surgery, missing workspace entries, or frozen install failure after regeneration. |
| `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` | UNION then DROP dead allowlist | Keep Studio import repoints to `@civ7/studio-contract`. Drop Habitat's now-dead `apps/mapgen-studio/src/storybook/storeReset.ts` storage allowlist entry because Studio B7 deletes that file. | `storeReset.ts` is resurrected or the test imports contract types from `@civ7/studio-server` when `@civ7/studio-contract` owns them. |
| `apps/mapgen-studio/test/ui/sonnerTheme.test.tsx` | CARRY | Studio's delete wins at the app path. Carry Habitat's `.light` and dark-first SSR assertions into `packages/mapgen-studio-ui/test/sonnerTheme.test.tsx`. | App test path survives, or relocated package test lacks `.light` and dark-first assertions. |
| `tools/habitat-harness/test/lib/boundary-taxonomy.test.ts` | CARRY | Habitat's relocation wins. Do not revive this old path. Carry Studio's two-package count/registration intent into `tools/habitat/test/lib/validate_boundary_taxonomy_against_workspace_graph.test.ts` only if the dynamic test shape needs an explicit assertion. | Old `tools/habitat-harness` path returns or stale literal `25/24` counts are pasted over Habitat's dynamic-count model. |
| `docs/projects/habitat-harness/taxonomy.md` | COMPOSE | Use Habitat's rewrite as base. Add unprefixed rows for `studio-contract` and `mapgen-studio-ui`, both initially `kind:foundation`, then verify `mapgen-studio-ui` through actual graph edges before closure. | Rows are missing, use old npm-prefixed project names, tags disagree with project metadata, or `mapgen-studio-ui` edge legality fails. |

## Projectization Rule For New Studio Packages

Studio tip currently carries package-local `nx` metadata for the two new
packages. Habitat's current model externalizes project ownership into
`project.json` for known project names/tags and uses package scripts as the leaf
command surface where appropriate.

During restack, translate Studio's new package metadata into Habitat shape:

### `packages/studio-contract/project.json`

Create/keep:

```json
{
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "name": "studio-contract",
  "tags": ["kind:foundation"]
}
```

Keep package scripts in `packages/studio-contract/package.json`.

Remove package-local `nx.tags` from `package.json` if it would duplicate or
contradict `project.json`. If the resolver elects to leave both, the tags must
match exactly across package manifest, `project.json`, taxonomy, and resolved
Nx graph.

### `packages/mapgen-studio-ui/project.json`

Create/keep:

```json
{
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "name": "mapgen-studio-ui",
  "tags": ["kind:foundation"],
  "targets": {
    "test": {
      "dependsOn": ["build", "^build"]
    },
    "design-sync:check": {
      "dependsOn": ["build", "^build"],
      "cache": false
    }
  }
}
```

Keep package scripts for `build`, `check`, `test`, `verify`,
`design-sync:check`, `storybook`, and `build-storybook`.

If Nx inferred target behavior requires explicit `command` entries after the
post-drain graph is computed, add them in `project.json` using the package
scripts' current commands and `cwd: packages/mapgen-studio-ui`. Do not move
these targets to `apps/mapgen-studio/project.json`.

Stop if the package/project/taxonomy tag planes disagree.

## Semantic Work Areas

### 1. Package, Taskgraph, And Lockfile

Expected resolution:

- `apps/mapgen-studio/package.json` stays slim and has no inline `nx`.
- `apps/mapgen-studio/project.json` keeps app runtime targets:
  - `dev`
  - `serve-daemon`
  - `build`
  - `check`
  - `test`
  - `build:vite`
- `apps/mapgen-studio/project.json` must not keep app-local `storybook` or
  `build-storybook` after Studio B7 because Studio moves those surfaces to
  `packages/mapgen-studio-ui`.
- `serve-daemon.command` remains exactly:
  `bun --conditions bun-source --watch src/server/daemon/daemon.ts`
- `apps/mapgen-studio/package.json` gains `@civ7/studio-contract` and
  `@swooper/mapgen-studio-ui`.
- App package prunes dependencies moved to the UI package:
  `@radix-ui/*`, `@rjsf/core`, `@rjsf/utils`,
  `@rjsf/validator-ajv8`, `@fontsource/*`, `lucide-react`,
  `class-variance-authority`, `clsx`, `tailwind-merge`,
  `@storybook/*`, and `storybook`, except where a post-drain file proves an app
  runtime still imports one directly.
- Root `package.json` keeps Habitat's `patchedDependencies` and
  `eslint-plugin-react-hooks: 7.1.1`.
- `bun.lock` is regenerated only after all manifest and workspace decisions.

Run after resolution:

```bash
bun install
bun install --frozen-lockfile
NX_DAEMON=false nx show project mapgen-studio --json
NX_DAEMON=false nx show project mapgen-studio-ui --json
NX_DAEMON=false nx show project studio-contract --json
NX_DAEMON=false nx show project control-studio-server --json
git diff --check
```

Proof:

- Record truth proof: package/project JSON shape.
- Native tool behavior: Nx project resolution and frozen lockfile.
- Baseline proof: regenerated `bun.lock`.

Stop if:

- `apps/mapgen-studio/package.json.nx` returns;
- app-local Storybook targets survive;
- `bun.lock` cannot be regenerated cleanly;
- `@swooper/mapgen-studio-ui` or `@civ7/studio-contract` is missing from the
  composed workspace graph.

### 2. Studio UI Package, Storybook, Design-Sync, And Theme

Expected resolution:

- `packages/mapgen-studio-ui` survives as the owner of extracted UI.
- Package `.storybook`, `.design-sync`, `.ds-sync`, `theme.css`,
  `useResolvedTheme`, `sonner`, component stories, and package tests survive.
- App `.storybook`, app `.design-sync`, app storybook-static output, app UI
  primitives, and `apps/mapgen-studio/src/storybook/storeReset.ts` do not
  survive.
- `packages/mapgen-studio-ui/test/sonnerTheme.test.tsx` contains the Habitat
  `.light` explicit-mode assertions and dark-first SSR assertion.
- The design-sync config remains package-local, `shape: "storybook"`, with:
  - `entry: "dist/index.js"`
  - `cssEntry: "dist/styles.css"`
  - `buildCmd: "bunx nx run mapgen-studio-ui:build"`
  - `StudioShellLayout` in the `templates` group
- The package verify floor is 101 after `studio-ui-operating-structure`.
- The app Vite/Vitest alias for `@swooper/mapgen-studio-ui` must not be a
  prefix alias that captures CSS subpaths. Use exact-match regex if a source
  alias is needed.

Run after resolution:

```bash
NX_DAEMON=false nx run mapgen-studio-ui:build
NX_DAEMON=false nx run mapgen-studio-ui:check
NX_DAEMON=false nx run mapgen-studio-ui:test
NX_DAEMON=false nx run mapgen-studio-ui:verify
NX_DAEMON=false nx run mapgen-studio-ui:build-storybook
NX_DAEMON=false nx run mapgen-studio-ui:design-sync:check
```

Proof:

- Unit behavior: package tests.
- Native tool behavior: build, Storybook build, design-sync check.
- Record truth proof: package-local design-sync config pins.

Stop if:

- app-local Storybook/design-sync surfaces are resurrected;
- package Storybook/design-sync cannot build from real dist artifacts;
- `sonnerTheme` loses the carried Habitat pins;
- package exports drop below the expected floor;
- package dist depends on `@civ7/studio-server` runtime.

### 3. Studio Contract Extraction

Expected resolution:

- `@civ7/studio-contract` owns shared Studio contract/types/schema.
- `@civ7/studio-server/contract` remains a thin named composition subpath for
  server mount needs.
- `packages/studio-contract/tsconfig.json` keeps `"types": []`.
- `packages/studio-contract` remains foundation-pure: plain `oc`, TypeBox,
  `@standard-schema/spec`, no Effect, no `@orpc/server`, no `effect-orpc`.
- `packages/studio-server/src/contract/index.ts` must not `export * from
  "@civ7/studio-contract"`.
- Studio server `./live-game` export remains deleted.

Run after resolution:

```bash
NX_DAEMON=false nx run studio-contract:check
NX_DAEMON=false nx run control-studio-server:check
NX_DAEMON=false nx run control-studio-server:test
rg -n 'export \* from "@civ7/studio-contract"|@orpc/server|effect-orpc' \
  packages/studio-contract packages/studio-server/src/contract
```

The `rg` command should produce no forbidden matches. If it finds intentional
comments documenting a forbidden pattern, inspect manually and record as Record
truth proof rather than treating it as failure.

Proof:

- Record truth proof: import/export ownership.
- Native tool behavior: package checks.
- Unit behavior: studio-server tests.

Stop if:

- `studioEffectContract` could become undefined due to star re-export;
- contract package gains server/runtime ownership;
- app/browser imports server runtime where contract package should be used.

### 4. StudioShell, Hooks, Events, And Operation Adoption

Expected resolution:

- Studio hook decomposition and contract import repoints survive.
- `operationAdoption.test.ts` imports shared event/operation types from
  `@civ7/studio-contract`.
- Habitat's dead `storeReset.ts` storage allowlist entry is dropped because the
  file is deleted by Studio B7.
- App orchestration stays in the app; extracted UI rendering stays in the UI
  package.

Run after resolution:

```bash
NX_DAEMON=false nx run mapgen-studio:test -- test/studioEvents/operationAdoption.test.ts
NX_DAEMON=false nx run mapgen-studio:test -- test/controllers
NX_DAEMON=false nx run mapgen-studio:check
rg -n 'storeReset|@civ7/studio-server/contract|@civ7/studio-contract' \
  apps/mapgen-studio/src apps/mapgen-studio/test
```

Proof:

- Unit behavior: event/hook/controller tests.
- Record truth proof: import boundaries and absent `storeReset` resurrection.

Stop if:

- operation adoption ordering, retry policy, stream persistence, latest-ref
  behavior, materialization mode, or busy-state threading cannot be proven;
- resolving conflicts pushes app orchestration into the UI package.

### 5. Daemon Source-Watch And `bun-source` Exports

Expected resolution:

- `serve-daemon` stays in `apps/mapgen-studio/project.json`.
- `serve-daemon.command` remains
  `bun --conditions bun-source src/server/daemon/daemon.ts`, without watch.
- `mapgen-studio:dev` is the sole process-composition entrypoint; no restart
  helper or second process manager is restored.
- `@civ7/studio-contract` has a `bun-source` export for source runtime
  resolution.
- `@civ7/studio-server` keeps root and `./contract` `bun-source` exports and
  does not keep `./live-game`.
- `bun-source` remains a dev/source condition, not a browser/prod contract.

Run after resolution:

```bash
bun habitat check --rule enforce_studio_dev_runner_topology --json
NX_DAEMON=false nx run mapgen-studio:check
NX_DAEMON=false nx run control-studio-server:check
NX_DAEMON=false nx run control-orpc:check
NX_DAEMON=false nx run control-direct:check
NX_DAEMON=false nx run plugin-mods:check
bun --conditions bun-source -e 'await import("@civ7/studio-server"); await import("@civ7/studio-contract"); await import("@civ7/direct-control"); await import("@civ7/control-orpc");'
```

Proof:

- Habitat wrapper behavior: topology rule.
- Native tool behavior: package checks and Bun source import smoke.
- Runtime/product proof: not claimed unless the daemon is actually started and
  source-watch behavior is observed.

Stop if:

- source-watch cannot coexist with projectization;
- any required `bun-source` export is missing;
- `./live-game` is restored;
- browser/prod code requires `bun-source`.

### 6. Map-Mod-Disabled Pass-Through

Expected resolution:

- Server classifier keeps `map-mod-not-loaded`.
- Sibling-row false-positive guard remains.
- UI special rendering follows `GameConsole` into
  `packages/mapgen-studio-ui`.
- Diagnostic code is not renamed or generalized away.

Run after resolution:

```bash
rg -n "map-mod-not-loaded" packages/studio-server packages/mapgen-studio-ui apps/mapgen-studio
bun run --cwd packages/studio-server test -- mapModVisibility.test.ts
NX_DAEMON=false nx run control-studio-server:check
NX_DAEMON=false nx run mapgen-studio-ui:test
```

Proof:

- Record truth proof: diagnostic string and UI branch are traceable.
- Unit behavior: server and UI package tests.
- Runtime/product proof: not claimed without a real disabled-mod Civ7 run.

Stop if:

- diagnostic cannot be traced from server details to UI rendering;
- sibling-row/empty-read guards are lost;
- UI extraction removes the special rendering branch.

### 7. Recipe DAG, Standard Config, And Artifact Guards

Expected resolution:

- Studio may move recipe DAG presentation into `packages/mapgen-studio-ui`.
- Studio may move recipe DAG schemas/contracts into `packages/studio-contract`.
- Habitat keeps generated recipe artifact guards and `build:studio-recipes`
  dependency edges for app checks/tests/builds.
- No generated recipe output is hand-edited.

Run after resolution:

```bash
NX_DAEMON=false nx run mod-swooper-maps:build:studio-recipes
NX_DAEMON=false nx run mapgen-studio:test -- test/config/defaultConfigSchema.test.ts
NX_DAEMON=false nx run mapgen-studio:test -- test/recipeDag
NX_DAEMON=false nx run studio-contract:check
NX_DAEMON=false nx run mapgen-studio-ui:test
```

Proof:

- Native tool behavior: artifact generation.
- Unit behavior: schema/DAG tests.
- Baseline proof: generated artifacts follow source inputs if regeneration
  occurs.

Stop if:

- generated files need manual edits;
- stale artifact bypass makes tests pass without regeneration;
- UI package starts owning server/runtime recipe behavior.

### 8. Habitat Taxonomy And Boundary Audit

Expected resolution:

- Use Habitat taxonomy rewrite as base.
- Add rows:
  - `studio-contract` at `packages/studio-contract`, `kind:foundation`
  - `mapgen-studio-ui` at `packages/mapgen-studio-ui`, `kind:foundation`
- Prove `mapgen-studio-ui` `kind:foundation` from actual graph edges after
  composition. Current pre-drain evidence supports it because its workspace
  dependency is `@civ7/studio-contract`, and code imports contract symbols in
  type positions, but post-drain Nx graph is the closure proof.
- Do not revive `tools/habitat-harness`.
- Do not paste stale hardcoded `25/24` counts. Habitat's relocated test uses
  dynamic taxonomy project counts.

Run after resolution:

```bash
bun habitat classify packages/studio-contract packages/mapgen-studio-ui docs/projects/habitat-harness/taxonomy.md
bun habitat check --json --runner nx
NX_DAEMON=false nx show projects
NX_DAEMON=false nx run habitat:test -- test/lib/validate_boundary_taxonomy_against_workspace_graph.test.ts
```

The audit must show zero of:

- `missing-taxonomy-project-for-manifest`
- `missing-taxonomy-project-for-nx`
- `manifest-tag-mismatch`
- `nx-tag-mismatch`
- `config-constraint-mismatch`

Proof:

- Record truth proof: taxonomy rows and project metadata.
- Habitat wrapper behavior: taxonomy audit through Habitat.
- Unit behavior: relocated taxonomy test.

Stop if:

- new package tags disagree across package/project/taxonomy/Nx graph;
- `mapgen-studio-ui` has edges illegal for `kind:foundation`;
- old `tools/habitat-harness` paths return.

## Execution Sequence After User Approval

Do not execute this section until the user explicitly approves restack
implementation.

1. Re-run Gate 0.1 through Gate 0.3.
2. If post-drain main is safe, run Graphite sync without broad restack:

   ```bash
   gt sync --no-restack --no-interactive
   ```

3. Confirm `gt ls --no-interactive` still scopes the intended Habitat stack and
   no side stack would be mutated.
4. Start targeted Habitat restack:

   ```bash
   gt restack --branch codex/habitat-closed-structure-method-frame --downstack --no-interactive
   ```

5. Resolve conflicts branch-by-branch using the 8-file conflict ledger first.
6. For each branch conflict, prefer semantic composition:
   - Habitat structure as base for taskgraph/taxonomy/mechanism.
   - Studio delta as owner for extracted content/dependencies/package surfaces.
   - Carry behavior into moved files, never resurrect dead paths for tests.
   - Regenerate generated artifacts only after source inputs settle.
7. After package manifests and project metadata settle, run `bun install`, then
   continue restack.
8. Use focused checks during conflict resolution when cheap:
   - `git diff --check`
   - `NX_DAEMON=false nx show project <project> --json`
   - targeted tests for the currently touched surface.
9. After the restack completes, run the validation bundle below.
10. Commit restack resolutions through Graphite if required by the workflow.
11. Stop before submit/push unless the user explicitly approves.

## Final Validation Bundle

Run from the active Habitat worktree after the restack reaches a coherent
state.

### Repository And Graphite

```bash
git status --short --branch --untracked-files=all
gt ls --no-interactive
git diff --check
```

### Install, Graph, And Habitat

```bash
bun install --frozen-lockfile
nx reset
NX_DAEMON=false nx show projects
bun run openspec:validate
bun habitat check --json --runner nx
bun habitat check --rule enforce_studio_dev_runner_topology --json
NX_DAEMON=false nx run habitat:test -- test/lib/validate_boundary_taxonomy_against_workspace_graph.test.ts
```

### App, UI Package, Contract, Server

```bash
NX_DAEMON=false nx run studio-contract:check
NX_DAEMON=false nx run control-studio-server:check
NX_DAEMON=false nx run control-studio-server:test
NX_DAEMON=false nx run mapgen-studio:check
NX_DAEMON=false nx run mapgen-studio:test
NX_DAEMON=false nx run mapgen-studio:build
NX_DAEMON=false nx run mapgen-studio-ui:build
NX_DAEMON=false nx run mapgen-studio-ui:check
NX_DAEMON=false nx run mapgen-studio-ui:test
NX_DAEMON=false nx run mapgen-studio-ui:verify
NX_DAEMON=false nx run mapgen-studio-ui:build-storybook
NX_DAEMON=false nx run mapgen-studio-ui:design-sync:check
```

If Nx target names differ after final projectization, derive exact commands
from:

```bash
NX_DAEMON=false nx show project mapgen-studio-ui --json
NX_DAEMON=false nx show project studio-contract --json
```

Use `nx run <project>:<target>` only after confirming target names.

### Focused Preservation Checks

```bash
rg -n "map-mod-not-loaded" packages/studio-server packages/mapgen-studio-ui apps/mapgen-studio
bun run --cwd packages/studio-server test -- mapModVisibility.test.ts
NX_DAEMON=false nx run mod-swooper-maps:build:studio-recipes
NX_DAEMON=false nx run mapgen-studio:test -- test/config/defaultConfigSchema.test.ts
NX_DAEMON=false nx run mapgen-studio:test -- test/recipeDag
bun --conditions bun-source -e 'await import("@civ7/studio-server"); await import("@civ7/studio-contract"); await import("@civ7/direct-control"); await import("@civ7/control-orpc");'
```

### Record-Truth Greps

```bash
rg -n 'storybook|build-storybook|\\.storybook|\\.design-sync|storeReset' apps/mapgen-studio apps/mapgen-studio/project.json apps/mapgen-studio/package.json
rg -n 'export \* from "@civ7/studio-contract"|@orpc/server|effect-orpc' packages/studio-contract packages/studio-server/src/contract
rg -n '"bun-source"|"\./live-game"|@civ7/studio-contract' packages/studio-contract/package.json packages/studio-server/package.json
```

Expected interpretation:

- First grep should not show app-local Storybook/design-sync ownership except
  historical docs/comments that are not active surfaces.
- Second grep should not show forbidden runtime/server imports in
  `studio-contract` or star re-export from the server contract subpath.
- Third grep should show `bun-source` where expected and no `./live-game`.

## Review Disposition

Fresh agent lanes used for this final prep:

- Authority mapper: read Studio handoff, extracted semantic requirements.
- Topology mapper: refreshed Graphite/overlap evidence.
- Proof designer: converted watch areas into deterministic proof gates.
- Adversarial reviewer: attacked stale assumptions and stop conditions.

Findings disposition:

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Old draft/runbook could preserve app-local Storybook/design-sync after Studio extraction. | P1 | Accepted and repaired. | This runbook forbids app-local Storybook/design-sync surfaces after B7 and makes `mapgen-studio-ui` the proof surface. |
| Plan needed an 8-file conflict ledger, not only watch-area prose. | P1 | Accepted and repaired. | Canonical ledger added with `UNION`, `COMPOSE`, `CARRY`, and `REGENERATE` dispositions. |
| New package `project.json` ownership was unresolved. | P1 | Accepted and repaired. | Projectization rule added for `studio-contract` and `mapgen-studio-ui`. |
| Old source-watch plan preserved stale `studio-server ./live-game`. | P1 | Accepted and repaired. | Runbook requires Studio's `./live-game` deletion and updates source-watch checks. |
| Side-stack and post-drain gates were not deterministic. | P1 | Accepted and repaired. | Gate 0.1 through 0.3 require PR/ancestor/overlap proof before mutation. |
| Generated loose artifacts needed explicit cleanup treatment. | P2 | Accepted and repaired. | Gate 0.2 distinguishes superseded loose app-local outputs from restack payload. |
| Verification lacked proof-class separation. | P2 | Accepted and repaired. | Proof labels added per semantic area and validation bundle. |
| Stop conditions needed exact expected PR and overlap invariants. | P2 | Accepted and repaired. | Gate 0.1 and 0.3 define expected drain set and overlap stop conditions. |
| Command names needed exact `nx run <project>:<target>` derivation. | P2 | Accepted and repaired. | Validation section derives target names from `nx show project` if needed. |

## Final Stop Conditions

Stop before mutation if:

- Studio PRs `#1996`-`#2006` are not on `origin/main`.
- Post-drain `origin/main` has additional unplanned overlapping changes.
- The active Habitat worktree is dirty.
- Side stacks would be restacked by the intended Graphite command.
- The direct overlap differs from the eight-file ledger in a material way.
- The Studio handoff document cannot be read from either post-drain `main` or
  `studio-ui-restack-handoff@3ee5b6c6b6cc`.

Stop during conflict resolution if:

- a file in the 8-file ledger cannot be resolved according to its disposition;
- a generated/protected file would need hand edits;
- `bun.lock` cannot be regenerated from source manifests;
- package/project/taxonomy tags disagree;
- `mapgen-studio-ui` cannot legally be `kind:foundation`;
- `sonnerTheme` behavior cannot be carried to the package test;
- `map-mod-not-loaded` cannot be traced through server and package UI;
- source-watch cannot coexist with projectization;
- old app-local Storybook/design-sync surfaces are required to make tests pass.

Stop before closure if:

- any P1/P2 review finding remains undispositioned;
- validation failures look semantic rather than stale-target/command-name
  issues;
- Graphite shows unexpected restack markers in the Habitat stack;
- the final report cannot separate Record truth proof, Native tool behavior,
  Habitat wrapper behavior, Unit behavior, Baseline proof, and any
  Runtime/product proof.

## Final Report Shape For The Execution Turn

When implementation later completes, report:

- refreshed preflight facts: branch, commit, main, merge-base, Graphite shape;
- whether Studio drain set matched `#1996`-`#2006`;
- conflict ledger outcome for each of the eight files;
- package/project/taxonomy decisions for the two new packages;
- generated/regenerated artifacts and commands used;
- preservation proof by semantic area;
- validation commands and results, with proof labels;
- remaining risks and non-claims;
- final `git status` and `gt ls` state;
- whether the stack is ready for review/submit or blocked.

Skills used: `habitat:systematic-workstream`, `cognition:investigation-design`,
`cognition:team-design`, `dev:graphite`, `civ7-habitat-dra-workstream`.
