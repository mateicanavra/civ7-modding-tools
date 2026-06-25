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

## Hard Core

These are the non-negotiable design rules for the cleanup:

- **Nx coordinates execution.** Cross-project ordering, cache policy, target
  dependencies, inputs, outputs, continuous tasks, and no-op aggregation belong
  in Nx.
- **`nx.json` owns shared defaults.** If a rule applies to every target with a
  given name, define it once in `targetDefaults`.
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
not start a new scan from scratch.

| Surface | Current Shape | Cleanup Treatment |
| --- | --- | --- |
| Root `package.json` | Workflow aliases and operational repo scripts. Some aliases manually curate target selection. | Keep thin root Nx entrypoints; remove hidden project selection where Nx can discover targets. |
| Root `nx.json` | Global `targetDefaults` plus Habitat plugin registration. | Keep as shared policy authority; add shared defaults only when broadly true. |
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
- Preserve local Nx metadata where it adds graph semantics.
- Remove self-delegating scripts such as package scripts that invoke Nx back
  into the same package target.
- Normalize root scripts into thin Nx entrypoints.

Exit condition: each task has one command owner and, where needed, one graph
metadata owner.

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
