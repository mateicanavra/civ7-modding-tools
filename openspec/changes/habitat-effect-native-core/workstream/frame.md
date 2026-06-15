# Frame — Effect-Native Habitat Core

## Objective

Design the post-H8 Habitat refactor that makes the toolkit core idiomatic
Effect while preserving the existing Habitat command surface. This change is
the parent/design workstream; implementation is split into child OpenSpec
changes that execute only after H8 closes. The command shell remains oclif;
reusable Habitat logic becomes Effect programs composed from services and
layers.

This frame is the grounding artifact for the change. Proposal, design, tasks,
and spec deltas must stay inside this frame unless a later review record amends
it with source-backed evidence.

## Authority Stack

1. Current user direction: create a stacked OpenSpec slice after the current
   Habitat workstream changesets, with deep Effect grounding and adversarial
   review.
2. Repo process: Graphite stacked work, clean worktrees, OpenSpec artifact
   rules, Bun/Nx tooling, and Habitat project documents.
3. Habitat project authority:
   `docs/projects/habitat-harness/FRAME.md`,
   `docs/projects/habitat-harness/workstream-record.md`,
   `docs/projects/habitat-harness/invariant-corpus.md`,
   `docs/projects/habitat-harness/taxonomy.md`, and
   `docs/projects/habitat-harness/review-disposition-ledger.md`.
4. Active Habitat OpenSpec train:
   H1 `habitat-nx-adoption`, H2 `habitat-harness-scaffold`,
   H3 `habitat-boundary-tags`, H4 `habitat-biome-hygiene`,
   H4.5 `habitat-oclif-cli`, H5 `habitat-grit-catalog`,
   H6 `habitat-enforcement-consolidation`, H7 `habitat-git-hooks`,
   H8 `habitat-generators-migrations`.
5. Official Effect documentation and the repo's existing Effect usage in
   `@civ7/studio-server` and `@civ7/control-orpc`.
6. Current `tools/habitat-harness` source and tests as implementation evidence.

## Timing

This design slice was grounded while H7/H8 were still in motion. The current
stack now records H7 and H8 complete, and the effect branch is stacked on the H8
tail branch. The Effect implementation children still start after this parent
design because H8 defines the final command, hook, generator, classify, README,
and agent procedure surface that the Effect core must preserve.

The branch `agent-F-habitat-effect-core` is Graphite-parented to
`agent-F-habitat-generators-migrations`. The branch now has the initial parent
design commit and is being revised to split the parent spec into one spec delta
per major child workstream after re-reading completed H8.

## Current Habitat Shape

The existing harness has a sound outer split but a synchronous core:

- oclif command classes under `tools/habitat-harness/src/commands/**` parse
  flags and delegate to `lib/command-engine.ts` or hook helpers.
- `command-engine.ts` runs rule selection, baseline application, Grit/Biome/Nx
  process calls, graph temp-dir management, report rendering, and classify
  package scans.
- `spawn.ts` centralizes argument-array `spawnSync` with repo-local PATH
  injection.
- `baseline.ts`, `generated-zones.ts`, `grit.ts`, and `hooks.ts` use direct
  Node filesystem, Git, hashing, temp, and process APIs.
- Existing command tests mostly mock `command-engine` at the adapter boundary;
  deeper service behavior needs fake-service coverage as the core becomes
  Effect-native.
- H8 added Nx plugin surfaces in addition to the CLI surface:
  `generators.json`, `migrations.json`, CJS project/pattern generator
  factories, a no-op migration factory, and local migration proof through a
  hand-authored run file whose package is `./tools/habitat-harness`.
- H8 completed `classify <path-or-diff>` as an agent-facing orientation
  command for paths, literal diffs, and `.diff`/`.patch` files.

This confirms the refactor target: keep command adapters thin, move the
resourceful and orchestrating core below them into Effect services, and treat
Nx generators/migrations as their own host-adapter surface rather than oclif
commands.

## Effect Doctrine For This Slice

Official Effect docs establish these design obligations:

- Effects are executable program descriptions run by a runtime with a context;
  the core should return `Effect<A, E, R>` rather than running itself.
- Services and layers model capabilities and dependency graphs. Service
  interfaces must expose Habitat concepts, while layer construction owns
  implementation dependencies.
- `Scope`, finalizers, and acquire/release patterns own resources such as temp
  directories, subprocess lifetimes, locks, generated-artifact snapshots, and
  queues.
- `ManagedRuntime` belongs at adapter or host boundaries. The oclif command
  adapter creates/runs/disposes the Habitat runtime for command execution.
- Concurrency is explicit. Bounded concurrency is the default for rule and
  process fan-out; tiny fixed fan-outs may state their bound directly.
- Queues, semaphores, and schedules are used where Habitat has real queued work,
  shared mutation surfaces, retry, polling, or debounce policy.
- Platform process/filesystem/path/terminal abstractions are the preferred
  direction for new resourceful core code. Registry and temp-install evidence
  on 2026-06-14 shows `effect@3.21.3`, `@effect/platform@0.96.1`, and
  `@effect/platform-node@0.107.0` install cleanly under Bun, and a minimal
  `NodeContext.layer` import/run succeeds under Bun. The live Habitat layer
  should be Node-oriented because the built oclif bin is Node-executed; the
  first implementation child must repeat the proof in-repo for both Bun dev and
  built Node invocation.
- Schema/config/logging may be Effect-native internally, but command JSON output
  remains deterministic and adapter-controlled.
- Generator-owned files stay under Nx `Tree` control. Effect-backed generator
  logic must use a Tree-backed service for tree writes so dry-runs, in-memory
  tests, and Nx transaction behavior remain authoritative.

Local Effect precedent strengthens the same shape:

- `packages/studio-server/src/runtime.ts` builds a `ManagedRuntime` from layers.
- `packages/studio-server/src/services/Civ7TunerSession.ts` uses
  `Layer.scoped` and `Effect.acquireRelease` to own a shared resource and close
  it through runtime disposal.
- `packages/studio-server/src/handler.ts` bridges Effect to a host API and
  exposes an explicit `dispose()` obligation.
- `packages/civ7-control-orpc/src/procedure.ts` uses Effect at the service/API
  surface, while `effect-orpc` is reserved for RPC contracts. Habitat CLI does
  not get `effect-orpc` in this slice.

## Core Service Map

The first implementation phase should introduce services at the Habitat
concept boundary:

- `HabitatWorkspace`: repo root, harness root, baseline paths, repo-relative
  normalization, package/project discovery.
- `HabitatProcess`: argument-array process execution, cwd/env/PATH policy,
  stdout/stderr capture, exit-code normalization, child lifecycle.
- `HabitatGit`: merge-base, git show, staged paths, unstaged detection,
  Graphite parent detection, exact `git add` for owned hook restaging.
- `BaselineStore`: baseline load/write, violation keys, shrink-only integrity
  check using `HabitatGit`.
- `RuleRegistry`: rule-pack data and selection.
- `RuleRunner`: dispatch to Grit, file-layer, native, and process-backed rule
  runners.
- `GritService`, `BiomeService`, `NxService`: external tool command builders
  and execution policy.
- `HookRunner`: pre-commit/pre-push orchestration over explicit services,
  keeping Git index mutation isolated.
- `GeneratedZoneVerifier`: snapshot/regenerate/diff/restore/delete semantics
  for generated-zone drift checks.
- `NxGeneratorTree`: Nx `Tree`-backed generator workspace operations used by
  project and pattern generators.
- Effect `Clock`/`TestClock`: duration measurement, schedules, deterministic
  timing tests. Do not wrap it in a Habitat-specific clock service unless a
  later child change proves Habitat-specific semantics.

Plain data and pure functions should stay plain: diagnostic/report types,
report formatting, parser functions, rule selection predicates, path matching,
status calculation, and the Nx `createNodesV2` plugin.

Runtime bridge and layer assembly are adapter concerns, not core services
available to reusable Habitat programs. Command output is also adapter-owned:
pure report rendering stays plain, while stdout/stderr and `--output` writes
remain at the host boundary or a narrow output-file capability.

## Non-Negotiables

- No command behavior change is accepted as part of the substrate refactor:
  command names, flags, exit codes, stdout/stderr shape, JSON schema, ratchet
  semantics, hook policy, and generator/classify behavior remain stable.
- The core must not call `process.exit`, mutate global process state beyond an
  explicit adapter boundary, or run Effect programs from deep library modules.
- Every acquired command resource must be scoped to command execution or to a
  named service lifetime that the adapter closes before `Command.run()`
  resolves. Every acquired generator/migration resource must close before the
  Nx factory promise/callback returns to Nx.
- Hook mutation remains exact: pre-commit may restage only formatter-touched
  files and must preserve partially staged protections.
- Baselines remain shrink-only. No rule/baseline expansion is hidden inside
  the Effect refactor.
- Grit remains one native JSON scan per check process until a later source-backed
  change proves another execution model.
- `effect-orpc` is out of scope for local CLI harness internals.
- Generated artifacts, lockfiles, and dist output are changed only through the
  repo's scripts and package-manager commands.

## Risk Surfaces

- Async process execution can reorder output, alter buffering, or return before
  child cleanup. `HabitatProcess` parity tests must pin stdout/stderr/exit
  behavior before command migration.
- Grit report caching is process-global today. The Effect service must preserve
  one scan per check invocation without leaking cached findings across tests or
  commands.
- Baseline integrity has a documented no-merge-base behavior. That behavior must
  stay explicit in service tests.
- Hook pre-commit combines resource publishing, file-layer check, formatting,
  restaging, Biome check, and Grit staged scan. It needs isolated fake Git/FS
  tests before live-hook migration.
- Nx generator/migration factories currently live as CJS metadata targets in
  an ESM package. The generator/migration child must choose an explicit CJS to
  ESM bridge or intentionally keep a small CJS-compatible core.
- Generated-zone verification snapshots tracked files, restores them, and
  removes untracked generated files. Convert this surface after core process,
  Git, and filesystem services are already proven.
- Adding `@effect/platform` packages changes dependency policy. Implementation
  must add the verified versions through Bun, inspect peer resolution, and prove
  both root Bun scripts and the built Node oclif runner still execute.

## Review Lanes

Before implementation begins, run adversarial review over:

- OpenSpec sequencing and artifact fit: after H8, no H1-H8 historical rewrite,
  specs keep behavior/process requirements rather than implementation detail.
- Effect idiom: service/layer boundaries, runtime placement, scope closure,
  error modeling, platform dependency decision, and concurrency policy.
- Harness behavior parity: commands, JSON, baselines, Grit, hooks, classify,
  generators, generated-zone drift checks.
- Testability: fake service layers, deterministic clocks, process parity probes,
  live Grit integration retention.
- Repo workflow: Graphite stack cleanliness, generated artifact hygiene,
  validation gates, documentation touchpoints.

## First Workstream Shape

Use `habitat-effect-native-core` as the parent/design change, then execute child
implementation changes after H8 closure:

1. `habitat-effect-runtime-substrate`: dependencies, runtime bridge, service
   tags, live/fake layers.
2. `habitat-effect-process-baselines`: workspace, process, Git, and baseline
   services.
3. `habitat-effect-check-orchestration`: rule registry, Grit/file-layer/native
   rule runner, check/report Effect program.
4. `habitat-effect-command-programs`: fix, verify, graph, and classify.
5. `habitat-effect-nx-generators-migrations`: Nx project/pattern generators,
   Tree-backed writes, factory bridge, and local migrations.
6. `habitat-effect-hooks`: hook orchestration, resource-publish carve-out, and
   staged-index safety.
7. `habitat-effect-generated-verifier`: generated-zone drift verifier.

Each child change gets its own proposal/design/tasks/spec delta and closure
gates. The parent change records architecture, sequencing, stop conditions,
review findings, and child boundaries; it does not implement the refactor.
