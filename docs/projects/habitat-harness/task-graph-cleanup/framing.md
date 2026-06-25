# Build And Task Graph Cleanup Frame

Status: framing document, no implementation authority by itself

This document resets the frame for the build-system cleanup. The scope is the
whole repository task graph, not the narrower Habitat package-script cleanup.
Implementation should not proceed until this frame is reviewed and accepted.

## Objective

Make the repository task system boring and legible:

- Nx is the execution task graph.
- Root `nx.json` owns shared task policy.
- Package `package.json` files expose only clear package-local commands.
- Project-level Nx configuration exists only when the task needs graph
  semantics that package scripts cannot express cleanly.
- Habitat participates as an authority runner, not as a second task graph.

The desired outcome is fewer states, not a more elaborate abstraction around
the current states.

### Reframe After Partial Implementation Failure

The first implementation pass failed the objective frame. It repaired the
highest-risk rows and made several Habitat/Studio paths honest, but it treated
the treatment map as a bounded checklist instead of as the starting ledger for a
complete repository-wide build/task graph normalization.

Prior frame that failed: "reduce the known high-risk rows." That frame predicted
that resolving root Habitat entrypoints, Studio build output, docs stale
targets, and package Habitat rule-list scripts would satisfy the cleanup. The
back-talk was immediate: a repository-wide duplicate script/target audit still
showed same-name package scripts and local Nx targets across many packages.

Named reframing move: **chunk decomposition plus double-loop change**. The work
chunk is no longer "the high-risk rows"; it is "every manifest task surface."
The governing variable is no longer "known failures pass"; it is "each task has
exactly one command owner and, when graph metadata is needed, exactly one graph
metadata owner." High-risk rows remain priority evidence, but they are not the
closure boundary.

# Root Command Surface Cleanup Frame And Plan

## Frame

The root `package.json` command surface is not the execution graph. It is a small human/CI entrypoint layer over the repository’s actual task system.

**Hard core**
- Nx is the execution graph for build/check/test/lint/deploy/verify-style work.
- Root `nx.json` owns shared graph policy.
- Root package scripts exist only for durable repo-level workflows, package-manager lifecycle hooks, true root operations, or non-Nx tools.
- Package-specific root aliases are not valid just because they are convenient or documented.
- Direct Habitat CLI usage is `bun habitat <subcommand>`.
- Habitat graph execution is `nx run-many -t habitat:check`.

**Exterior**
- Do not redesign Habitat runner behavior.
- Do not remove package-owned operational scripts inside packages.
- Do not rewrite historical proof logs or archived docs just to update old command evidence.
- Do not collapse graph metadata into root scripts.

**Would force a reframe**
- If a removed root alias is consumed by CI, hooks, generated tooling, or a public compatibility contract that cannot be migrated to direct Nx/`bun habitat` in the same change.

## Key Interfaces

- **Graph task interface:** `nx run <project>:<target>` and `nx run-many -t <target>`.
- **Direct Habitat CLI interface:** `bun habitat <subcommand>`, including `bun habitat check`, `bun habitat fix`, `bun habitat hook`, and `bun habitat verify`.
- **Root repo workflow interface:** `bun run build`, `bun run check`, `bun run lint`, `bun run test`, `bun run clean`, `bun run ci`, `bun run verify`, and `bun run deploy:mods`.
- **Root operational interface:** `resources:*`, `refresh:data`, `gt:*`, `openspec*`, `biome:*`, `docs:project`, `prepare`, and `ci:architecture-strict-core`.
- **Release interface:** GitHub publish workflow calls Nx publish targets directly, not root publish aliases.
- **Documentation interface:** active docs teach the owning interface directly; archived/history docs may preserve old command evidence.

## Summary
- Skills used: `habitat:systematic-workstream`, `cognition:team-design`, `cognition:framing-design`.
- Team reconciliation: remove aliases whose only job is “nice DX” for existing Nx targets or `bun habitat` subcommands; keep root scripts only for repo-wide workflows, true root operations, CI/lifecycle contracts, and non-Nx tools.
- Core command model:
  - Graph tasks: `nx run <project>:<target>` or `nx run-many -t <target>`.
  - Direct Habitat CLI: `bun habitat <subcommand>`, e.g. `bun habitat check --rule op-calls-op`.
  - Root scripts: only stable repo workflows, not package-specific spelling aliases.

## Key Changes
- Remove root package-specific Nx aliases:
  `build:cli`, `build:sdk`, `build:mapgen`, `check:cli`, `check:sdk`, `dev:cli`, `dev:sdk`, `dev:docs`, `dev:playground`, `dev:mapgen-studio`, `test:cli`, `test:cli:play`, `test:sdk`, `test:architecture-cutover`, `test:mapgen`, `mods:import`, `link:cli`, `unlink:cli`.
- Remove duplicate or direct-tool convenience aliases:
  `check-types`, `test:ci`, `test:vitest`, `test:ui`, `check:graph`, `habitat:check`, `habitat:fix`.
- Remove publish aliases and update publish CI to direct Nx:
  `publish:sdk`, `publish:cli`, `publish:all` become direct `nx run civ7-sdk:publish:npm` and `nx run civ7-cli:publish:npm` in `.github/workflows/publish.yml`.
- Keep root scripts that are real repo surfaces:
  `prepare`, `build`, `check`, `lint`, `test`, `clean`, `deploy:mods`, `ci`, `verify`, `resources:*`, `refresh:data`, `ci:architecture-strict-core`, `gt:*`, `openspec*`, `biome:*`, `docs:project`, and `habitat`.
- Normalize direct Habitat usage in hooks/CI/docs from `bun run habitat ...` or `bun run habitat:check ...` to `bun habitat ...` where it is CLI behavior. Use `nx run-many -t habitat:check` only when the intended behavior is Nx owner-target execution.

## Documentation And Contract Updates
- Update the task-graph cleanup frame to record the final root-script policy and the team reconciliation: documented convenience is not enough to preserve a root alias.
- Update active command docs and routers to direct Nx or `bun habitat`, including root `AGENTS.md`, `docs/process/CONTRIBUTING.md`, `docs/process/GRAPHITE.md`, `docs/system/TESTING.md`, CLI package docs, MapGen how-to/tutorial docs, and Habitat docs.
- Update Habitat test fixtures that emit or assert removed command strings, replacing `bun run habitat:check -- ...` with `bun habitat check ...` for CLI examples, or `nx run-many -t habitat:check` for graph examples.
- Do not rewrite historical proof logs, archived docs, scratch notes, or phase records solely because they preserve old command evidence.

## Test Plan
- Pre/post hygiene: `git status --short --branch`; remove untracked `.habitat/cache/` only if it is still generated cache and not tracked.
- Resolved graph proof:
  `nx show projects --withTarget habitat:check --json`,
  `nx show projects --withTarget build --json`,
  `nx show projects --withTarget check --json`.
- Command-surface proof:
  `bun habitat --help`,
  `bun habitat check --help`,
  representative `bun habitat check --json --rule op-calls-op`.
- Run representative graph tasks:
  `nx run civ7-cli:build --skip-nx-cache`,
  `nx run civ7-cli:test:play --skip-nx-cache`,
  `nx run mapgen-studio:dev --help` only if Nx supports a non-starting help/dry check; otherwise rely on resolved target inspection for continuous dev targets.
- Run docs/test checks touched by the change:
  `bun run --cwd tools/habitat test`,
  `bunx biome check <changed-json-and-md-files>`,
  `git diff --check`.
- Final audit:
  `rg` over active docs/configs for removed root aliases and `bun run habitat:check`; expected remaining hits only in archives, scratch, or historical proof records.

## Assumptions
- `bun habitat` is the canonical direct Habitat CLI surface; `habitat:check` and `habitat:fix` are unnecessary root affordances.
- Root `build/check/lint/test/clean/ci/verify` remain because they are repo-wide workflows, not package-specific aliases.
- Publish CI can safely call Nx targets directly instead of root publish aliases.
- Continuous/dev product targets do not need root aliases; docs should teach `nx run mapgen-studio:dev`, `nx run civ7-cli:dev`, etc.

# Nx Project Identity Normalization Frame And Plan

## Frame

The Nx project name is the graph identity. It does not need to equal the npm
package name, import specifier, generator package name, mod id, recipe id, or
runtime service id.

**Hard core**

- Nx project names should be short enough to type directly with `nx`, while
  still carrying their domain.
- `project.json#name` owns package-backed Nx identity whenever the Nx name
  intentionally diverges from `package.json#name`.
- Package names, workspace dependency keys, TypeScript imports, package
  exports, mod ids, recipe ids, Railway service names, and generator package
  ids stay unchanged.
- Root or package scripts must not be reintroduced as spelling aliases for
  renamed projects.
- Generated Habitat topology projects are graph-visible boundary nodes, so they
  participate in the rename and must stay aligned with taxonomy policy,
  classify output, and tests.

**Exterior**

- Do not rename npm packages or public import surfaces.
- Do not rewrite archived proof logs or historical docs solely to update old
  command evidence.
- Do not collapse valid graph metadata back into package scripts.
- Do not remove runtime ids or product names that only happen to resemble old
  Nx project names.

**Would force a reframe**

- If Nx release/publish behavior cannot resolve package metadata after the Nx
  project name diverges from `package.json#name`.
- If Habitat boundary taxonomy requires scoped package-looking names for
  generated non-package projects.

## Canonical Rename Map

| Old Nx project | New Nx project | Notes |
| --- | --- | --- |
| `@mateicanavra/civ7-cli` | `civ7-cli` | Package name remains `@mateicanavra/civ7-cli`. |
| `@mateicanavra/civ7-sdk` | `civ7-sdk` | Package name remains `@mateicanavra/civ7-sdk`. |
| `@civ7/docs` | `civ7-docs` | App graph identity; package name remains unchanged. |
| `@civ7/playground` | `civ7-playground` | App graph identity; package name remains unchanged. |
| `@civ7/adapter` | `civ7-adapter` | Package/import identity remains unchanged. |
| `@civ7/types` | `civ7-types` | Package/import identity remains unchanged. |
| `@civ7/config` | `civ7-config` | Package/import identity remains unchanged. |
| `@civ7/map-policy` | `civ7-map-policy` | Package/import identity remains unchanged. |
| `@civ7/direct-control` | `control-direct` | Control-domain graph identity. |
| `@civ7/control-orpc` | `control-orpc` | Control-domain graph identity. |
| `@civ7/studio-server` | `control-studio-server` | Control-domain graph identity. |
| `@swooper/mapgen-core` | `mapgen-core` | Package/import identity remains unchanged. |
| `@swooper/mapgen-viz` | `mapgen-viz` | Package/import identity remains unchanged. |
| `mapgen-studio` | `mapgen-studio` | Already short and domain-legible. |
| `@civ7/plugin-files` | `plugin-files` | Plugin graph identity. |
| `@civ7/plugin-git` | `plugin-git` | Plugin graph identity. |
| `@civ7/plugin-graph` | `plugin-graph` | Plugin graph identity. |
| `@civ7/plugin-mods` | `plugin-mods` | Plugin graph identity. |
| `mod-swooper-maps` | `mod-swooper-maps` | Runtime mod id and graph name already align. |
| `civ-mod-dacia` | `mod-dacia` | Runtime package/mod id remains unchanged. |
| `mod-civ7-intelligence-bridge` | `mod-intelligence-bridge` | Runtime package/mod id remains unchanged. |
| `@habitat/cli` | `habitat` | Package, import, bin, and generator identities remain `@habitat/cli` / `habitat`. |
| `@internal/habitat-artifacts` | `habitat-artifacts` | Generated artifact topology node. |
| `@habitat/cli-cli` | `habitat-cli` | Generated Habitat topology node. |
| `@habitat/cli-service-shell` | `habitat-service` | Generated Habitat topology node. |
| `@habitat/cli-service-model` | `habitat-service-model` | Generated Habitat topology node. |
| `@habitat/cli-providers` | `habitat-providers` | Generated Habitat topology node. |
| `@habitat/cli-resources` | `habitat-resources` | Generated Habitat topology node. |
| `@habitat/cli-runtime` | `habitat-runtime` | Generated Habitat topology node. |
| `@habitat/cli-service-module-check` | `habitat-service-check` | Generated from service module directory. |
| `@habitat/cli-service-module-classify` | `habitat-service-classify` | Generated from service module directory. |
| `@habitat/cli-service-module-fix` | `habitat-service-fix` | Generated from service module directory. |
| `@habitat/cli-service-module-graph` | `habitat-service-graph` | Generated from service module directory. |
| `@habitat/cli-service-module-hook` | `habitat-service-hook` | Generated from service module directory. |
| `@habitat/cli-service-module-verify` | `habitat-service-verify` | Generated from service module directory. |

## Implementation Ledger

- Add sibling `project.json` files for tag-only package-inferred projects whose
  graph name now diverges from their package name.
- Update `nx.json`, explicit `project.json` dependencies, CI workflows, active
  command docs, Habitat rule metadata, remediation strings, and tests that
  assert Nx task ids.
- Update `tools/habitat/src/nx-plugin.ts`, Habitat artifact paths, boundary
  taxonomy policy, taxonomy docs, and taxonomy/classify tests for generated
  Habitat topology names.
- Audit old names only in graph/command contexts. Expected remaining old-name
  hits are package names, imports, workspace dependencies, package exports,
  generator package ids, mod/runtime ids, archives, and historical proof.

Proof gates:

- `nx show projects --json`
- `nx graph --print`
- `nx show projects --withTarget build --json`
- `nx show projects --withTarget check --json`
- `nx show projects --withTarget habitat:check --json`
- `nx show project civ7-cli --json`
- `nx show project habitat --json`
- `nx show project habitat-service-check --json`
- `bun habitat classify tools/habitat/src/service/modules/check/router.ts`
- Habitat boundary-taxonomy, classify, and workspace-graph tests
- Representative execution: `nx build civ7-cli --skip-nx-cache`,
  `nx run civ7-cli -t test:play --skip-nx-cache`, and
  `nx run mod-swooper-maps:habitat:check --skip-nx-cache`

## Hard Core

These are the non-negotiable design rules for the cleanup:

- **Nx coordinates execution.** Cross-project ordering, cache policy, target
  dependencies, inputs, outputs, continuous tasks, and no-op aggregation belong
  in Nx.
- **`nx.json` owns shared defaults.** If a rule applies to every target with a
  given name across the repository, define it once in `targetDefaults`. A
  single-project target name, product-specific output set, or dead generated
  target is not shared policy just because `targetDefaults` can match it.
- **Package scripts are leaf commands only when no explicit same-name Nx target
  exists.** A package script may define a package-local operation when it is the
  actual recurring command surface and Nx can infer it. Once a task needs local
  Nx graph metadata, the command moves into the Nx target and the same-name
  package script is removed.
- **Explicit local Nx targets need a reason.** Keep them for custom outputs,
  inputs, cache behavior, `dependsOn`, continuous tasks, executor choice,
  generated/plugin targets, and no-op aggregation. Do not keep them just because
  a target once existed.
- **One command truth per task.** Do not define a package script and an explicit
  local Nx target with the same name. Same-name rows create drift even when the
  target initially appears to contain only metadata.
- **Habitat authority is not package-script policy.** Habitat rule lists should
  be generated from authority data or owned by Nx/Habitat integration, not
  copied into package scripts as another policy surface.
- **Root scripts are convenience entrypoints.** They may call `nx run`,
  `nx run-many`, or a true repo operation, but they are not the graph authority.
- **The whole manifest corpus is the unit of completion.** Every `package.json`
  and `project.json` task surface must be classified. A green high-risk subset
  is not a successful cleanup.
- **Large graph metadata may live in `project.json`.** Nx 22.7.5 merges a
  sibling `project.json` with package metadata from `package.json` by project
  root. Use that split for large explicit target sets so package manifests stay
  about package metadata and package-local scripts, while `project.json` owns
  graph semantics.

## Current State

The current branch is already dirty with a partially applied package rename and
task-graph cleanup. Treat it as evidence, not as a completed design.

Observed corpus:

- 24 task-definition files were loaded: root `package.json`, `nx.json`, 22
  package `package.json` files, and one `project.json`.
- Raw package manifests currently expose roughly 224 scripts.
- Raw local Nx configuration currently exposes roughly 65 explicit targets.
- The resolved Nx graph includes generated Habitat plugin projects and targets,
  so raw files are not the complete truth. `nx show project <name> --json` is
  the authoritative view of what Nx will actually run.

Current resolved project families:

- **Simple script-inferred packages:** most libraries and small apps expose
  ordinary `build`, `check`, `lint`, `test`, `dev`, and `clean` scripts. Nx can
  infer these and apply `targetDefaults`.
- **Graph-metadata packages:** MapGen, Studio, CLI, SDK publishing, deploy
  flows, and Direct Control need explicit metadata for outputs, build phases,
  generated artifacts, cache policy, or no-op aggregation.
- **Habitat-generated targets:** the Habitat Nx plugin emits owner and
  rule-level targets such as `habitat:check` and `habitat:rule:<id>`.
- **Root workflow aliases:** the root package scripts are a human entrypoint
  layer over Nx, but some are currently too specific or manually curated.

### Corpus Treatment Map

This is the implementation corpus. Future work should update the row decision,
not start a new scan from scratch. The row decisions are not sufficient by
themselves; the complete manifest ledger below is the closure instrument.

| Surface | Current Shape | Cleanup Treatment |
| --- | --- | --- |
| Root `package.json` | Workflow aliases and operational repo scripts. Some aliases manually curate target selection. | Keep thin root Nx entrypoints; remove hidden project selection where Nx can discover targets. |
| Root `nx.json` | Global `targetDefaults` plus Habitat plugin registration. | Keep as shared policy authority; add shared defaults only when broadly true; move single-project/product-specific target semantics to the owning project and delete dead defaults. |
| `packages/config` | Simple scripts only. | Keep script-inferred tasks. |
| `packages/civ7-adapter` | Simple build/check scripts. | Keep script-inferred tasks. |
| `packages/civ7-map-policy` | Simple build/check/test plus package `verify`. | Keep script-inferred tasks; only add metadata if `verify` gains graph semantics. |
| `packages/civ7-types` | Typecheck script only. | Keep script-inferred task. |
| `packages/studio-server` | Simple build/dev/check/test/clean scripts. | Keep script-inferred tasks. |
| `packages/mapgen-viz` | Simple build/dev/check/clean scripts. | Keep script-inferred tasks. |
| `packages/plugins/*` | Uniform build/dev/check/lint/test/clean scripts. | Keep script-inferred tasks. |
| `apps/playground` | Simple dev/build/check/test/clean scripts. | Keep script-inferred tasks. |
| `packages/sdk` | Simple scripts plus publish metadata and Habitat owner target. | Keep publish metadata; let Habitat target come from authority/plugin rather than package rule-list scripts. |
| `packages/mapgen-core` | Simple scripts plus architecture test metadata and Habitat owner target. | Keep architecture-test metadata; let Habitat target come from authority/plugin. |
| `packages/civ7-control-orpc` | Build/check aggregation and Habitat rule-list script. | Preserve build/check graph metadata; remove package-script Habitat policy. |
| `packages/civ7-direct-control/project.json` | Split bundle/types build plus no-op aggregate. | Keep explicit `project.json` unless a later proof shows package scripts can preserve output semantics. |
| `packages/cli` | Oclif CLI with build phases, publish, link, data/mod commands. | Keep explicit build/publish/link/data metadata; remove only duplicate command ownership. |
| `tools/habitat` | Habitat CLI with Oclif phases, Habitat plugin targets, and self-check rule-list script. | Keep explicit CLI build metadata and plugin targets; remove package-script Habitat policy. |
| `apps/docs` | Docs scripts, docs operations, and Habitat docs check script. | Keep docs operations package-local; remove package-script Habitat policy. |
| `apps/mapgen-studio` | Dev/server/build/check/test plus no-op build aggregate and Habitat check script. | Preserve dev/server metadata; repair build aggregate; remove package-script Habitat policy. |
| `mods/mod-civ7-intelligence-bridge` | Build/test/generated mod scripts plus architecture test metadata. | Preserve operational scripts and architecture-test metadata. |
| `mods/mod-swooper-civ-dacia` | Build/deploy/check/lint plus deployment aggregate. | Preserve deploy metadata; remove duplicate/stale shells only. |
| `mods/mod-swooper-maps` | Many product operations, generated-output targets, tests, deploy, and Habitat rule-list scripts. | Preserve operational/generated-output metadata; remove package-script Habitat policy; keep strict profile as explicit exception until green. |

### Complete Manifest Ledger

Implementation must maintain a manifest-by-manifest ledger. A package is not
done until each same-name script/target pair is resolved into one of these
states:

- **Script-owned leaf:** keep the package script; remove local Nx command
  duplication; rely on Nx inference plus `targetDefaults`.
- **Graph-owned target:** remove the package script and keep the Nx target
  command/metadata as the authority when the task needs graph semantics:
  `dependsOn`, `outputs`, `inputs`, `cache`, `continuous`, executor choice,
  no-op aggregation, deploy/publish ordering, or generated-output metadata.
- **Renamed local operation:** keep package-local operational scripts only under
  names that do not collide with explicit Nx targets. If the recurring command
  is the graph task, run it as `nx run <project>:<target>`.

There is no accepted same-name split state. A same-name package script plus an
explicit target is duplicate command ownership, even when the target initially
appears to contain only metadata.

The implementation must produce this audit mechanically before and after
changes:

```sh
bun -e '
const fs=require("fs");
const path=require("path");
const paths=require("child_process").execSync("rg --files -g package.json",{encoding:"utf8"}).trim().split(/\n/).filter(Boolean).sort();
for (const p of paths) {
  const j=JSON.parse(fs.readFileSync(p,"utf8"));
  const scripts=j.scripts||{};
  const targets={...(j.nx?.targets||{})};
  const siblingProjectJson=path.join(path.dirname(p),"project.json");
  if (fs.existsSync(siblingProjectJson)) {
    Object.assign(targets, JSON.parse(fs.readFileSync(siblingProjectJson,"utf8")).targets||{});
  }
  const dup=Object.keys(scripts).filter((name)=>targets[name]);
  if (!dup.length) continue;
  console.log(p);
  for (const name of dup) {
    const target=targets[name];
    const keys=["command","dependsOn","outputs","inputs","cache","continuous","executor","metadata"].filter((key)=>Object.prototype.hasOwnProperty.call(target,key));
    console.log(`  ${name}: script=${JSON.stringify(scripts[name])} targetKeys=${keys.join(",")}`);
  }
}
'
```

Closure requires every printed row to be classified and either changed or
explicitly justified. The final implementation summary must include the
post-change audit result.

#### Current Ledger Dispositions

This ledger is the implementation checkpoint for the complete manifest corpus.
Rows not listed by the post-change audit are either simple script-inferred
packages, graph-owned targets with no same-name package script, generated
Habitat/plugin targets, or `project.json` metadata that is intentionally
outside package-script inference.

| Surface | Disposition | Reason |
| --- | --- | --- |
| Root `deploy:mods` | Thin Nx entrypoint | The root script now uses `nx run-many --targets=deploy`; Nx discovers the two deploy-capable mod projects instead of a hand-maintained project list. |
| Root `nx.json` single-project defaults | Moved/deleted root policy | `build:studio-recipes` and `test:studio-run-in-game` resolve only on `mod-swooper-maps`, so their graph semantics belong on the MapGen project. Retired `test:architecture-*` names are canaries for embedded hidden-authority migration, not live graph targets. `deploy:studio` resolves on no project and is removed instead of preserving a hidden generated-state expectation. |
| `apps/mapgen-studio` `dev` | Graph-owned target | The real Studio dev entrypoint is `nx run mapgen-studio:dev` because the graph starts the frontend through `dev:frontend`, depends on the server daemon, and marks the task continuous. The package script `dev` was removed to avoid bypassing orchestration. |
| `apps/mapgen-studio` `build` | Graph-owned target | `build` is the aggregate that depends on `build:vite` and declares `dist/**`; the package script `build` was removed so the command surface does not bypass graph dependencies. |
| `apps/mapgen-studio` `check`, `test`, `build:vite` | Graph-owned targets | The explicit targets own their commands plus Studio recipe dependencies and `dist/**` outputs. Same-name package scripts were removed so the graph is the only command surface for these tasks. |
| `packages/civ7-control-orpc` `check` | Graph-owned target | `check` aggregates `check:types` and generated `habitat:check`; the package script was removed. |
| `packages/civ7-control-orpc` `build`, `check:types` | Graph-owned targets | Explicit targets own the build/typecheck commands plus dependency freshness and outputs, including the `control-direct:build` dependency for type checks. Same-name package scripts were removed. |
| `packages/civ7-direct-control/project.json` | Preserved explicit graph metadata | Direct Control owns tuner framing, state discovery, reconnect/session behavior, and live runtime access. Its `project.json` keeps bundle/types phases, outputs, and build aggregation explicit; the duplicate `build` package script was removed. |
| `packages/cli` `build` | Graph-owned target | CLI build is an Oclif aggregate over `build:tsc`, `build:manifest`, and `build:bin-mode`; the package script `build` was removed because TypeScript alone is not the honest build. |
| `packages/cli` phase, link, data, mod, test, readme, publish rows | Graph-owned targets | The explicit targets own Oclif ordering, generated README/manifest outputs, cache policy, and publish/link/data/mod ordering. Package scripts with the same names were removed; direct users should run the Nx target. |
| `tools/habitat` `build` | Graph-owned target | Habitat build is an Oclif aggregate over `build:tsc`, `build:manifest`, and `build:bin-mode`; the package script `build` was removed because TypeScript alone is not the honest production runner build. |
| `tools/habitat` build phases | Graph-owned targets | Explicit targets own direct phase commands, phase ordering, and outputs. Same-name package scripts were removed to keep the Habitat CLI build graph coherent. |
| Habitat Nx plugin loader | Source-owned graph discovery | Files loaded by `tools/habitat/src/nx-plugin.ts` import registry schema types/source relatively where needed so `nx show ...` works from committed source without a prior ignored `tools/habitat/dist` build. The boundary allowlist contains only the exact loader edge required for this. |
| `mods/mod-swooper-civ-dacia` `build:deploy` | Graph-owned target | The no-op package script was removed; the Nx target preserves build/deploy ordering. |
| `mods/mod-swooper-civ-dacia` `deploy` | Graph-owned target | The Nx target owns the deploy command plus build and CLI build ordering with cache disabled; the package script was removed. |
| `mods/mod-swooper-maps` `build:studio-recipes` | Graph-owned target | The no-op package script was removed; the Nx target owns recipe bundle/map aggregation and generated outputs locally rather than relying on a root single-project default. |
| `mods/mod-swooper-maps` `test:studio-run-in-game` | Graph-owned target | The explicit target owns the focused test command and depends on `build:studio-recipes` because the suite imports generated recipe/map artifacts. The package script was removed. |
| `mods/mod-swooper-maps` Habitat architecture guardrails | Graph-owned targets | Package scripts no longer carry Habitat rule-list policy. The existing architecture target names remain as Nx targets with cache/build metadata and direct Habitat commands, while package-local `test` stays the leaf Bun test command. |
| `mods/mod-swooper-maps` build, generated, check, test, viz, diag, deploy rows | Graph-owned targets plus script-owned diagnostics | Explicit targets own generated-output metadata, cache policy, environment-sensitive inputs, dependency ordering, test composition, and deploy ordering. Remaining package scripts are local diagnostics or verification commands that do not collide with explicit targets. |
| `mods/mod-civ7-intelligence-bridge` build and architecture rows | Graph-owned targets | Explicit targets own bundle/test commands plus generated modinfo dependency, outputs, and cache policy. Same-name package scripts were removed. |
| `apps/docs` `dev` | Graph-owned target | The explicit target owns docs dev staging plus `sync`, upstream build dependency, continuous behavior, and disabled cache. The package script was removed. |
| `packages/mapgen-core` architecture row | Graph-owned target | The explicit target owns the focused architecture test command plus upstream build freshness and cache policy. |
| `packages/sdk` `publish:npm` | Graph-owned target | The Nx target owns publish ordering and disables cache. The package script was removed; release automation calls the target directly. |

## Why It Is A Mess

The current graph mixes several incompatible ideas:

- Package scripts are sometimes true package commands, sometimes root workflow
  aliases, sometimes Habitat policy lists, and sometimes no-op placeholders.
- Local `nx.targets` sometimes add real graph metadata, but sometimes restate
  command text already present in package scripts.
- Habitat plugin-generated targets are sometimes shadowed by hand-written
  package `habitat:check` scripts or local targets with narrower rule lists.
- Root scripts sometimes call a curated subset of projects even when Nx already
  knows which projects expose the target.
- Some build targets are no-op aggregators, which can be valid, but the current
  state has allowed them to obscure whether real outputs are produced.
- Hooks and CLI commands can rely on generated build state such as Oclif output
  if they bypass Nx coordination.

The repeated failure mode is using a local convenience surface as if it were the
system authority. That creates duplicates, omissions, race conditions, and
ambiguous proof.

## Correct Target Model

### Root `nx.json`

Root `nx.json` should define the repo-wide task contract:

- common `build`, `check`, `lint`, `test`, `verify`, `deploy`, `dev`, and
  `clean` policy;
- `habitat:*` dependency on `habitat:build`;
- generated/source check defaults where Habitat owns the runner;
- cache defaults and broad output defaults that are actually safe across
  packages.

`targetDefaults` should be the first place to look for shared behavior. If a
package has to repeat the same dependency or cache rule, the model is probably
wrong.

The reverse is also true: if `nx show projects --withTarget <name> --json`
returns one project, or zero projects, root `targetDefaults` is probably the
wrong owner. Keep that metadata on the project when it is real graph behavior;
delete it when it only preserves a stale or anticipated target name.

### Package `package.json`

Package scripts should be a readable command list for local package work:

- `build`: direct package build command when the package has a normal build.
- `check`: direct typecheck or package health check.
- `lint`: direct formatter/linter invocation when it is package-local tooling.
- `test`: direct package test command.
- `dev`: direct local dev server/watch command.
- package-owned operational commands such as generation, migration, deploy, or
  diagnostics when they are genuinely product/package operations.

Package scripts should not:

- call `nx run <same-project>:<same-target>`;
- encode dependency ordering that belongs in Nx;
- duplicate a local `nx.targets.command`;
- hold Habitat authority rule lists if the rule set is already represented in
  `.habitat` or the Habitat Nx plugin;
- become the only place a generated-output dependency is declared.

### Local Nx Targets

Local Nx target config belongs in `package.json#nx.targets` or `project.json`
only when it adds graph semantics:

- `dependsOn` for generated outputs, bundle phases, package graph ordering, or
  task composition;
- `outputs` for cacheable artifacts;
- `inputs` for non-standard cache invalidation;
- `cache: false` for deploys, local mutation, hooks, or non-repeatable tasks;
- `continuous: true` for servers/watchers;
- executor choice such as `nx:noop`, `nx:run-commands`, or `nx:run-script`;
- no-op aggregation where the target intentionally composes other targets.

If a local target has the same command text as a package script and adds no
meaningful graph metadata, it should be removed.

When a command-backed target moves from `package.json` into sibling
`project.json`, declare `options.cwd: "<projectRoot>"` unless the command is
intentionally rooted at the workspace. Package scripts naturally run from their
package directory; `project.json` command targets must make that cwd explicit.

### Package Script And Nx Target Ownership Examples

Default to Nx inference. A plain package should expose the command once as a
script and let Nx infer the target:

```json
{
  "scripts": {
    "build": "tsup"
  }
}
```

When the task needs graph metadata, move the command into Nx and remove the
same-name package script. For larger packages, prefer a sibling `project.json`
so `package.json` stays focused on package metadata and genuinely local
scripts:

```json
{
  "name": "example-package",
  "targets": {
    "build": {
      "command": "tsup",
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist/**"]
    }
  }
}
```

Use a graph-owned target when the task is intentionally an aggregate, phase
wrapper, deploy/publish operation, or generated-output contract. In this shape,
`build` is not a package script because the graph owns the aggregate command:

```json
{
  "nx": {
    "targets": {
      "build": {
        "command": "node -e \"\"",
        "dependsOn": ["build:tsc", "build:manifest"],
        "outputs": ["{projectRoot}/dist/**"]
      }
    }
  },
  "scripts": {
    "build:tsc": "tsc -p tsconfig.json",
    "build:manifest": "oclif manifest"
  }
}
```

Do not create same-name command duplication. This shape is invalid because both
the package script and the explicit Nx target claim command ownership:

```json
{
  "scripts": {
    "build": "tsup"
  },
  "nx": {
    "targets": {
      "build": {
        "command": "tsup"
      }
    }
  }
}
```

Also invalid: a package script that delegates back into its own Nx target, such
as `"build": "nx run same-project:build"`. Nx is already the graph runner.

### Habitat Targets

The clean Habitat model is:

- `.habitat` owns authority content.
- `tools/habitat` owns the CLI/runtime.
- Nx runs Habitat targets.
- `targetDefaults["habitat:check"]` builds the `habitat` project before
  owner-level Habitat check targets.
- Rule-level targets may remain generated as `habitat:rule:<id>` where useful.
- Owner-level `habitat:check` should come from Habitat authority data, not a
  hand-copied package script list.

Curated exception targets may exist temporarily, such as a strict profile, but
they need to be named as exception targets and kept out of default workflow
claims unless they are green and intended to be mandatory.

## Current High-Risk Rows

These are already known from the current corpus and should not be rediscovered
from scratch during implementation.

| Area | Current Problem | Target Direction |
| --- | --- | --- |
| Root `habitat:check` | Manually pinned to five projects while Nx exposes `habitat:check` on seven owner projects. | Replace with graph-derived `nx run-many -t habitat:check` unless a deliberate exclusion is documented and encoded elsewhere. |
| Package `habitat:check` scripts | Several packages copy rule lists into `scripts`, shadowing plugin-generated owner targets. | Remove package-script rule lists; use generated owner targets or explicit Nx-only exception targets. |
| MapGen strict guardrail | Strict domain refactor check is red by known existing violations. | Keep as non-default strict/CI profile until violations are burned down; do not let it silently redefine default `habitat:check`. |
| `mapgen-studio:build` | No-op aggregation has risked not producing `dist` while downstream checks inspect `dist`. | Make the target’s production of `dist` explicit, either by running Vite directly or depending on `build:vite` with outputs. |
| Hooks and Habitat CLI | Hooks can bypass Nx and depend on built/generated CLI state. | Route hooks through a source-safe Habitat entrypoint or an Nx target with a declared build dependency. |
| CLI/Oclif builds | Build is split across `build:tsc`, manifest, and bin-mode phases. | Keep explicit graph metadata; this is one of the valid reasons for local Nx targets. |
| Deploy flows | Deploys need built mods and CLI availability, and are non-cacheable. | Keep explicit metadata; remove only duplicated or stale target shells. |
| Generated MapGen outputs | Generation and currentness checks have real output/cache semantics. | Keep explicit metadata; do not collapse them into plain scripts if Nx needs outputs. |
| Direct Control | Uses `project.json` for split bundle/type build and no-op aggregation. | Keep unless a later pass proves package scripts plus targetDefaults can express it without losing output semantics. |

## Decision Model

For every script/target row, implementation should classify it using this
decision tree:

1. **Is it a normal leaf command with no special graph semantics?**
   Keep it as a package script and rely on Nx inference plus root
   `targetDefaults`.
2. **Does it need outputs, inputs, cache policy, dependency ordering,
   continuous mode, executor choice, or no-op aggregation?**
   Move the command and metadata into a local Nx target, preferably in sibling
   `project.json` when the target set is large, and remove the same-name
   package script.
3. **Does a package script and explicit Nx target share a name?**
   Remove one owner. In this cleanup, graph-semantic tasks become Nx-owned
   targets; plain leaf tasks remain script-inferred with no explicit same-name
   target.
4. **Does it call Nx back into the same package/target?**
   Remove the self-delegation. Nx is already the graph runner.
5. **Is it Habitat authority?**
   Prefer `.habitat` authority plus generated/explicit Nx Habitat target.
   Package scripts should not carry the rule list.
6. **Is it root workflow convenience?**
   Keep only if it is a thin entrypoint into Nx and does not manually curate a
   set Nx can discover.
7. **Is it product operation, migration, generator, deploy, or local
   diagnostic?**
   Keep package-local if the package owns the operation. Add Nx metadata only
   when graph semantics are needed.

## Domino Sequence

### Domino 1: Freeze And Normalize The Workstream State

Goal: stop mixing half-applied implementation with new theory.

Tasks:

- Decide whether the current dirty branch remains the implementation base or
  whether the build-graph cleanup starts from a fresh slice.
- If the current branch remains the base, classify the existing dirty changes
  into rename work, Habitat authority work, and task-graph work.
- Remove generated untracked build artifacts unless they are intentionally
  tracked.
- Establish the proof commands that define closure for the build graph.

Exit condition: the implementation base is explicit and no one is guessing
which dirty changes are evidence versus intended output.

### Domino 2: Contract The Sources Of Task Truth

Goal: eliminate duplicated task definitions before changing behavior.

Tasks:

- For every package, remove exact command duplication between `scripts` and
  local `nx.targets`.
- Use the Complete Manifest Ledger as the work queue; do not stop after
  Habitat/root/Studio rows.
- Preserve local Nx metadata where it adds graph semantics.
- Remove self-delegating scripts such as package scripts that invoke Nx back
  into the same package target.
- Normalize root scripts into thin Nx entrypoints.

Exit condition: the post-change duplicate script/target audit is empty across
both `package.json#nx.targets` and sibling `project.json.targets`.

### Domino 3: De-Shadow Habitat Targets

Goal: make Habitat authority targets graph-owned instead of package-script
policy lists.

Tasks:

- Remove package `habitat:check` scripts that copy rule lists.
- Let Habitat plugin-generated owner targets stand where they correctly express
  all owner rules.
- Where curated exceptions are still necessary, encode them as explicit Nx-only
  exception targets and name them as exceptions.
- Replace root pinned `habitat:check` project lists with graph-derived target
  selection unless exclusions are deliberate and documented.
- Verify that `targetDefaults["habitat:*"]` applies the `habitat:build`
  dependency to generated and explicit Habitat targets.

Exit condition: no package manifest carries Habitat rule-list policy as a
script, and root Habitat execution does not omit owner projects by accident.

### Domino 4: Repair Real Build Aggregates

Goal: make no-op and aggregate targets honest.

Tasks:

- Repair `mapgen-studio:build` so `dist` production is explicit.
- Preserve CLI/Oclif build stages with real outputs and ordering.
- Preserve generated-output targets and deploy targets with non-default cache
  and output metadata.
- Remove stale no-op aggregators that do not compose real targets.

Exit condition: every no-op target is intentionally aggregating real targets,
and every build target either builds or clearly depends on the target that does.

### Domino 5: Normalize Root Workflows

Goal: root workflows should ask Nx to run the graph, not recreate the graph.

Tasks:

- Make root `build`, `check`, `lint`, `test`, `ci`, and `verify` scripts thin
  Nx entrypoints.
- Remove manually curated root target lists where `nx run-many` can discover
  the target.
- Keep explicit root aliases only for product workflows that are not generic
  graph runs.

Exit condition: root scripts are ergonomic handles over Nx, not hidden policy
or duplicated target selection.

### Domino 6: Make Hook And CLI Entrypoints Safe

Goal: hooks and local CLI entrypoints must not rely on stale generated state.

Tasks:

- Ensure Husky hooks run through a source-safe Habitat entrypoint or through an
  Nx target with a build dependency.
- Keep Habitat-spawned Nx commands on the same repo-local Nx entrypoint.
- Remove reliance on untracked `oclif.manifest.json` or built `dist` state for
  hook proof.

Exit condition: hook execution works from committed source plus declared graph
dependencies.

### Domino 7: Prove The Resolved Graph

Goal: prove the system as Nx sees it, not as raw files appear.

Proof gates:

- `nx show projects --json`
- `nx show projects --withTarget build`
- `nx show projects --withTarget check`
- `nx show projects --withTarget lint`
- `nx show projects --withTarget habitat:check`
- representative `nx show project <name> --json` for:
  - `@habitat/cli`
  - `mod-swooper-maps`
  - `mapgen-studio`
  - `@civ7/docs`
  - `@civ7/control-orpc`
  - `@swooper/mapgen-core`
  - `@mateicanavra/civ7-sdk`
- graph execution proof for the normalized target groups.
- `git diff --check`.

Exit condition: the resolved graph matches the target model and the worktree is
ready for Graphite closure.

## Implementation Plan Rows

The first implementation slice reduced high-risk rows but did not complete the
repository objective. The next implementation pass must use these rows plus the
Complete Manifest Ledger; no row is complete merely because its high-risk
symptom was fixed.

| Row | Owner After Cleanup | Change |
| --- | --- | --- |
| Root package health workflows | Root scripts as thin Nx entrypoints | `build`, `check`, `lint`, `test`, `ci`, and `verify` ask Nx to discover target owners instead of running curated rule lists or broad direct CLI checks. Direct Habitat CLI use is `bun habitat <subcommand>`; graph Habitat execution is `nx run-many -t habitat:check`. |
| Habitat owner checks | Generated Habitat Nx targets plus explicit graph targets when needed | Package scripts no longer carry Habitat rule-list policy. Owner checks run through generated `habitat:check` targets or explicit Nx-only exception targets. |
| Habitat CLI build dependency | Root `targetDefaults["habitat:check"]` for owner checks; Habitat Nx plugin for generated rule targets | Owner checks declare the package build plus `habitat:build`; generated `habitat:rule:*` targets emit their own CLI build dependency so alias targets keep their real graph dependency. |
| Docs no-op validation | Docs package scripts for real docs operations; Nx build target for docs aggregation | Remove stale package no-op scripts and the stale `validate` target; docs build remains a no-op aggregate only for the real `sync` operation. |
| Studio build output | `mapgen-studio:build` graph metadata | `mapgen-studio:build` depends on `build:vite`, so the build target honestly produces `dist`. Generated `habitat:check` then depends on `build` before bundle-output checks. |
| ORPC check aggregation | `control-orpc:check` graph metadata | Keep the no-op check aggregator, but depend on `check:types` and generated `habitat:check` instead of a package `lint` rule list. |
| Preserved operational surfaces | Owning packages and existing explicit Nx metadata | CLI/Oclif phases, Direct Control `project.json`, deploys, generated-output targets, MapGen strict guardrail exception, and package-owned diagnostics stay explicit. |
| Root target defaults | Shared root policy only | Keep broad defaults such as `build`, `check`, `test`, `lint`, `dev`, `deploy`, `verify`, `clean`, and `habitat:check`; remove or localize single-project and dead defaults such as `build:studio-recipes`, `test:studio-run-in-game`, and `deploy:studio`. Retired `test:architecture-*` target names are recorded as package-local canaries for the embedded hidden-authority migration. |

Important resolved-graph note: in this checkout, `targetDefaults["habitat:*"]`
with `dependsOn` overwrote generated alias target dependencies instead of
merging them. Do not use that wildcard default for `habitat:rule:*` until the
merge behavior is proven. Generated rule targets must emit the CLI build
dependency directly so alias rules such as `format-ci` and `import-boundaries`
retain their real target dependencies.

## Implementation Guardrails

- Do not start by fixing whichever manifest looks wrong first.
- Do not add new package scripts to solve graph metadata.
- Do not move package operations into Habitat just because they are scripts.
- Do not remove explicit targets that carry output/cache/ordering semantics.
- Do not use broad `habitat check` CLI behavior as the proof of this cleanup;
  use Nx-resolved `habitat:*` targets.
- Do not preserve a package script merely for legacy ergonomics if it creates a
  second authority surface.
- Do not delete operational commands just because they are noisy.

## Review Questions Before Implementation

Before implementation begins, review this document against the current resolved
graph and answer:

- Are package scripts and local Nx targets clearly separated by command versus
  graph metadata?
- Are Habitat targets treated as authority targets, not package-local scripts?
- Are root scripts thin enough to stop hiding project selection?
- Are generated outputs, deploys, Oclif build stages, and dev servers protected
  from over-simplification?
- Is the strict MapGen guardrail defaulted correctly, or is it still a red
  exception target?
- Is the implementation base clean enough to produce a reviewable Graphite
  slice?

If any answer is no, do not implement yet. Tighten this frame first.
