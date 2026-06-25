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

## Hard Core

These are the non-negotiable design rules for the cleanup:

- **Nx coordinates execution.** Cross-project ordering, cache policy, target
  dependencies, inputs, outputs, continuous tasks, and no-op aggregation belong
  in Nx.
- **`nx.json` owns shared defaults.** If a rule applies to every target with a
  given name across the repository, define it once in `targetDefaults`. A
  single-project target name, product-specific output set, or dead generated
  target is not shared policy just because `targetDefaults` can match it.
- **Package scripts are leaf commands.** A package script may define `build`,
  `check`, `lint`, `test`, `dev`, or another package-local operation when that
  script is the actual command. It should not hide dependency ordering,
  duplicate Nx graph policy, or call Nx back into the same target.
- **Explicit local Nx targets need a reason.** Keep them for custom outputs,
  inputs, cache behavior, `dependsOn`, continuous tasks, executor choice,
  generated/plugin targets, and no-op aggregation. Do not keep them just because
  a target once existed.
- **One command truth per task.** Do not define the same command in both
  `scripts` and `nx.targets.command`.
- **Habitat authority is not package-script policy.** Habitat rule lists should
  be generated from authority data or owned by Nx/Habitat integration, not
  copied into package scripts as another policy surface.
- **Root scripts are convenience entrypoints.** They may call `nx run`,
  `nx run-many`, or a true repo operation, but they are not the graph authority.
- **The whole manifest corpus is the unit of completion.** Every `package.json`
  and `project.json` task surface must be classified. A green high-risk subset
  is not a successful cleanup.

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
- **Graph-owned target:** remove the package script if it is not the package's
  genuine command surface; keep the Nx target command/metadata as the authority.
- **Split ownership:** keep the package script as the leaf command and keep the
  same-name Nx target only for graph metadata that cannot live in the script:
  `dependsOn`, `outputs`, `inputs`, `cache`, `continuous`, executor choice, or
  intentional no-op aggregation. The Nx target must not duplicate command text
  unless the executor requires a script name to preserve orchestration semantics.
- **Operational exception:** keep both only when the package script is a
  deliberate human/package command surface and the Nx target is an explicit
  graph wrapper for deploy/publish/order/outputs. The reason must be named in
  the ledger.

The implementation must produce this audit mechanically before and after
changes:

```sh
bun -e '
const fs=require("fs");
const paths=require("child_process").execSync("rg --files -g package.json",{encoding:"utf8"}).trim().split(/\n/).filter(Boolean).sort();
for (const p of paths) {
  const j=JSON.parse(fs.readFileSync(p,"utf8"));
  const scripts=j.scripts||{};
  const targets=j.nx?.targets||{};
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
| Root `nx.json` single-project defaults | Moved/deleted root policy | `build:studio-recipes`, `test:studio-run-in-game`, and `test:architecture-cutover` resolve only on `mod-swooper-maps`, so their graph semantics belong on the MapGen project. `deploy:studio` resolves on no project and is removed instead of preserving a hidden generated-state expectation. |
| `apps/mapgen-studio` `dev` | Graph-owned target | The real Studio dev entrypoint is `nx run mapgen-studio:dev` because the graph starts the frontend through `dev:frontend`, depends on the server daemon, and marks the task continuous. The package script `dev` was removed to avoid bypassing orchestration. |
| `apps/mapgen-studio` `build` | Graph-owned target | `build` is the aggregate that depends on `build:vite` and declares `dist/**`; the package script `build` was removed so the command surface does not bypass graph dependencies. |
| `apps/mapgen-studio` `check`, `test`, `build:vite` | Split ownership | Package scripts own the leaf commands; Nx targets add Studio recipe dependencies and `dist/**` outputs for the Vite phase. |
| `packages/civ7-control-orpc` `check` | Graph-owned target | `check` aggregates `check:types` and generated `habitat:check`; the package script was removed. `check:types` remains the leaf TypeScript command. |
| `packages/civ7-control-orpc` `build`, `check:types` | Split ownership | Package scripts own the build/typecheck commands; Nx adds dependency freshness and outputs, including the `@civ7/direct-control:build` dependency for type checks. |
| `packages/civ7-direct-control/project.json` | Preserved explicit graph metadata | Direct Control owns tuner framing, state discovery, reconnect/session behavior, and live runtime access. Its `project.json` keeps bundle/types phases, outputs, and build aggregation explicit instead of moving runtime authority into generic package scripts. |
| `packages/cli` `build` | Graph-owned target | CLI build is an Oclif aggregate over `build:tsc`, `build:manifest`, and `build:bin-mode`; the package script `build` was removed because TypeScript alone is not the honest build. |
| `packages/cli` phase, link, data, mod, test, readme, publish rows | Split ownership / operational exception | Package scripts are the human/CLI operation commands; Nx adds Oclif ordering, generated README/manifest outputs, cache policy, and publish/link/data/mod ordering. The no-op `pack:prepare` package script was removed. |
| `tools/habitat` `build` | Graph-owned target | Habitat build is an Oclif aggregate over `build:tsc`, `build:manifest`, and `build:bin-mode`; the package script `build` was removed because TypeScript alone is not the honest production runner build. |
| `tools/habitat` build phases | Split ownership | Package scripts own direct phase commands; Nx owns phase ordering and outputs. |
| Habitat Nx plugin loader | Source-owned graph discovery | Files loaded by `tools/habitat/src/nx-plugin.ts` import registry schema types/source relatively where needed so `nx show ...` works from committed source without a prior ignored `tools/habitat/dist` build. The boundary allowlist contains only the exact loader edge required for this. |
| `mods/mod-swooper-civ-dacia` `build:deploy` | Graph-owned target | The no-op package script was removed; the Nx target preserves build/deploy ordering. |
| `mods/mod-swooper-civ-dacia` `deploy` | Operational exception | The package script is the deploy command surface; Nx adds build and CLI build ordering with cache disabled. |
| `mods/mod-swooper-maps` `build:studio-recipes` | Graph-owned target | The no-op package script was removed; the Nx target owns recipe bundle/map aggregation and generated outputs locally rather than relying on a root single-project default. |
| `mods/mod-swooper-maps` `test:studio-run-in-game` | Split ownership | The package script owns the focused test command; the local Nx target depends on `build:studio-recipes` because the suite imports generated recipe/map artifacts. |
| `mods/mod-swooper-maps` `test:architecture-cutover` | Split ownership / embedded authority exception | The package script remains the existing Habitat rule-list exception; local Nx metadata keeps cache behavior without imposing an irrelevant root upstream-build dependency. |
| `mods/mod-swooper-maps` build, generated, check, test, viz, diag, deploy rows | Split ownership / operational exception | Package scripts are product-local operations; Nx adds generated-output metadata, cache policy, environment-sensitive inputs, dependency ordering, and deploy ordering. Embedded architecture test authority remains an explicit exception until that separate authority migration is in scope. |
| `mods/mod-civ7-intelligence-bridge` build and architecture rows | Split ownership | Package scripts own the bundle/test commands; Nx adds generated modinfo dependency, outputs, and cache policy. |
| `apps/docs` `dev` | Split ownership | Package script owns docs dev staging; Nx adds `sync`, upstream build dependency, continuous behavior, and disabled cache. |
| `packages/mapgen-core` architecture row | Split ownership | Package script owns the focused architecture test; Nx adds upstream build freshness and cache policy. |
| `packages/sdk` `publish:npm` | Operational exception | Package script is the publish command; Nx owns build/lint/test/check ordering and disables cache. |

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
- `habitat:*` dependency on `@habitat/cli:build`;
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

Use same-name split ownership only when the script owns the command and the Nx
target adds graph metadata. In this shape, `scripts.build` is the command owner;
`nx.targets.build` is the graph metadata owner:

```json
{
  "scripts": {
    "build": "tsup"
  },
  "nx": {
    "targets": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["{projectRoot}/dist/**"]
      }
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
- `targetDefaults["habitat:*"]` builds `@habitat/cli` before Habitat targets.
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
   Keep or create local Nx target metadata.
3. **Does it duplicate command text already in a package script?**
   Remove the duplicate command from local Nx config, unless the Nx target is
   the chosen owner and the package script should be removed.
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

Exit condition: the post-change duplicate script/target audit is empty or every
remaining row is explicitly classified as split ownership or an operational
exception with a named graph-semantic reason.

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
- Verify that `targetDefaults["habitat:*"]` applies the `@habitat/cli:build`
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
| Root package health workflows | Root scripts as thin Nx entrypoints | `build`, `check`, `lint`, `test`, `ci`, `verify`, and `habitat:check` ask Nx to discover target owners instead of running curated rule lists or broad direct CLI checks. |
| Habitat owner checks | Generated Habitat Nx targets plus root `habitat:check` target policy | Package scripts no longer carry Habitat rule-list policy. Owner checks run through generated `habitat:check` targets. |
| Habitat CLI build dependency | Root `targetDefaults["habitat:check"]` for owner checks; Habitat Nx plugin for generated rule targets | Owner checks declare the package build plus `@habitat/cli:build`; generated `habitat:rule:*` targets emit their own CLI build dependency so alias targets keep their real graph dependency. |
| Docs no-op validation | Docs package scripts for real docs operations; Nx build target for docs aggregation | Remove stale package no-op scripts and the stale `validate` target; docs build remains a no-op aggregate only for the real `sync` operation. |
| Studio build output | `mapgen-studio:build` graph metadata | `mapgen-studio:build` depends on `build:vite`, so the build target honestly produces `dist`. Generated `habitat:check` then depends on `build` before bundle-output checks. |
| ORPC check aggregation | `@civ7/control-orpc:check` graph metadata | Keep the no-op check aggregator, but depend on `check:types` and generated `habitat:check` instead of a package `lint` rule list. |
| Preserved operational surfaces | Owning packages and existing explicit Nx metadata | CLI/Oclif phases, Direct Control `project.json`, deploys, generated-output targets, MapGen strict guardrail exception, and package-owned diagnostics stay explicit. |
| Root target defaults | Shared root policy only | Keep broad defaults such as `build`, `check`, `test`, `lint`, `dev`, `deploy`, `verify`, `clean`, and `habitat:check`; remove or localize single-project and dead defaults such as `build:studio-recipes`, `test:studio-run-in-game`, `test:architecture-cutover`, and `deploy:studio`. |

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
