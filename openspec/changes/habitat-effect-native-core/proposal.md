# Change: Effect-Native Habitat Core

## Summary

Create the parent design workstream for making Habitat's reusable core
Effect-native now that the H8 Habitat train tail is locally closed. Oclif
remains the command adapter for Habitat commands; Nx remains the host adapter
for Habitat generators and migrations. Reusable Habitat logic moves into
Effect programs composed from services/layers for workspace access, process
execution, Git, baselines, rule orchestration, Grit, Biome, Nx, hooks,
classify, generated-zone verification, and Nx generator tree operations.

This parent change records architecture, sequencing, stop conditions, review
findings, and child workstream boundaries. Implementation is split into child
OpenSpec changes after this parent. The intended refactor preserves command
names, flags, JSON contracts, exit semantics, ratchet behavior, hook policy,
resource-publish behavior, classify output, Nx generator/migration surface, and
enforcement ownership.

## Why

The current harness is deliberately migration-first and enforcement-first. That
served H1-H8: Nx, Biome, Grit, file-layer checks, baselines, hooks, generators,
and classify needed to land without inventing a product architecture. The result
is now a real orchestration toolkit whose core still relies on synchronous
Node/Bun filesystem and process calls.

Effect is the right substrate for the next stage because the harness now needs
typed services, scoped resources, bounded concurrency, queues, retry/debounce
policy, deterministic testing, and adapter-owned lifecycle closure. Official
Effect docs make those first-class concepts: services/context and layers,
resource management with Scope/finalizers, ManagedRuntime, platform Command and
FileSystem services, Queue/PubSub/Semaphore, Schedule, Schema, Config, logging,
and TestClock.

Local precedent already exists in `@civ7/studio-server`: a `ManagedRuntime`
is built at the host boundary, services are supplied through layers, a scoped
resource is acquired with `Effect.acquireRelease`, and runtime disposal closes
the owned resource.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` hard core, D7, and trade-off note
  that future Effect internals run from the CLI adapter and close scopes before
  command completion.
- `docs/projects/habitat-harness/workstream-record.md` H1-H8 train order.
- `docs/projects/habitat-harness/review-disposition-ledger.md` F40 H8-after-H7
  sequencing decision.
- `openspec/changes/habitat-oclif-cli/specs/habitat-harness/spec.md`
  lifecycle-boundary requirement.
- `openspec/changes/habitat-git-hooks/workstream/phase-record.md` current H7
  status.
- `openspec/changes/habitat-generators-migrations/proposal.md`,
  `openspec/changes/habitat-generators-migrations/specs/habitat-harness/spec.md`,
  `openspec/changes/habitat-generators-migrations/tasks.md`, and
  `openspec/changes/habitat-generators-migrations/workstream/phase-record.md`
  as the H8 parity target.
- Official Effect docs for services/context, layers, resource management,
  runtime, platform command/filesystem/path/terminal, concurrency primitives,
  scheduling, schema/config/logging, and testing.
- Local Effect precedent in `packages/studio-server/src/runtime.ts`,
  `packages/studio-server/src/services/Civ7TunerSession.ts`,
  `packages/studio-server/src/handler.ts`, and
  `packages/civ7-control-orpc/src/procedure.ts`.

## What Changes

- Add a parent OpenSpec workstream, `habitat-effect-native-core`, that defines
  the Effect-native Habitat core architecture and child implementation gates
  with one spec delta per major child change.
- Split implementation into child changes:
  `habitat-effect-runtime-substrate`,
  `habitat-effect-process-baselines`,
  `habitat-effect-check-orchestration`,
  `habitat-effect-command-programs`,
  `habitat-effect-nx-generators-migrations`,
  `habitat-effect-hooks`, and
  `habitat-effect-generated-verifier`.
- Make oclif commands adapter-only: parse flags/args, run one Habitat Effect
  program, render/write the returned result, and dispose the runtime before
  command completion.
- Make Nx generators and migrations adapter-owned: Nx factory functions remain
  native generator/migration entrypoints, use an Nx `Tree`-backed service for
  tree-owned reads/writes, and close generator/migration-scoped resources before
  returning to Nx.
- Introduce Effect services/layers for Habitat workspace, process execution,
  Git, baselines, rule registry, rule runner, Grit, Biome, Nx, hooks,
  generated-zone verification, reporting, Nx generator tree access, and clock
  access.
- Add dependency and runtime guidance for Effect and a Node-oriented live
  platform layer, with in-repo proof required before manifest changes.
- Add parity gates for command contracts, JSON output, baselines, Grit scan
  semantics, hooks, classify, generators, migrations, and generated-zone drift.
- Add review lanes and stop conditions before implementation begins.

## What Does Not Change

- No command name, flag, JSON schema, stdout/stderr placement, exit-code,
  ratchet, hook, classify, generator, migration, or generated-zone behavior
  changes as part of the substrate refactor.
- No Nx generator schema, `generators.json`, `migrations.json`, factory module
  loading, dry-run tree behavior, or local migration run-file contract changes.
- No product/runtime Civ7 control, MapGen/Swooper, SDK, Studio, or mod behavior
  is redesigned.
- No `effect-orpc` dependency is added to Habitat in this CLI-core slice.
- No historical H1-H8 proposal/task/spec record is rewritten.

## Requires For Implementation

- H7 `habitat-git-hooks` closed and committed.
- H8 `habitat-generators-migrations` closed and committed.
- The Habitat command, hook, classify, generator, and migration surfaces after
  H8 treated as the parity target.
- Verified package versions for `effect`, `@effect/platform`, and the live
  platform layer. Temp-install evidence on 2026-06-14 supports
  `effect@3.21.3`, `@effect/platform@0.96.1`, and
  `@effect/platform-node@0.107.0`; the first implementation child must repeat
  this proof in-repo.

## Enables Parallel Work

- Future Habitat command implementations can use typed services without
  touching oclif command parsing.
- Rule and tool orchestration can gain bounded parallelism and deterministic
  test layers.
- Hook, generator, migration, baseline, probe, queue, and schedule work can
  share one resource/lifecycle model while preserving their host-specific
  adapter boundaries.
- Later service/API exposure can be evaluated from a typed core. This change
  does not introduce `effect-orpc`.

## Affected Owners

- `tools/habitat-harness/**`
- `openspec/changes/habitat-effect-native-core/**`
- Adjacent Habitat docs under `docs/projects/habitat-harness/**` only when
  stable authority must be updated after implementation evidence exists.
- Root scripts, Nx inferred targets, and Husky hook delegators only where
  command invocation must remain wired to the same Habitat surface.

## Forbidden Owners

- Product/runtime Civ7 control surfaces.
- MapGen/Swooper product, domain, recipe, projection, adapter, SDK, and Studio
  behavior.
- Historical H1-H8 proposals/tasks/specs. Downstream realignment is recorded
  under this parent change or its child changes, not by rewriting H1-H8
  historical records.
- Generated `dist/**`, `mod/**`, `oclif.manifest.json`, and lockfiles outside
  package-manager or build commands.

## Write Set

Implementation work should add an Effect core under `tools/habitat-harness/src`
and migrate existing `lib/**`/command internals into that core in phases. The
OpenSpec artifacts for this change are the authority for the phased write set.

## Stop Conditions

- A child implementation change starts before H7 and H8 are closed.
- A parity probe changes JSON shape, stdout/stderr placement, exit code,
  ratchet semantics, hook mutation behavior, classify output, Nx generator
  behavior, or Nx migration behavior.
- An Effect runtime or scoped resource can outlive `Command.run()`.
- A generator/migration-scoped Effect runtime, fiber, process, or resource can
  outlive the Nx generator or migration factory promise/callback.
- Hook migration restages any path beyond formatter-touched files except the
  preserved resource-publish submodule gitlink behavior from H7.
- Grit check execution stops being one native JSON scan per check process.
- Generated-zone verification cannot prove snapshot/restore/delete parity.
- Dependency installation changes peer resolution in a way build/check cannot
  prove.

## Consumer Impact

Contributors and agents should observe the same Habitat commands and outputs.
The intended impact is internal: stronger lifecycle ownership, service-level
tests, bounded orchestration, and a core that future Habitat commands can reuse
without duplicating process, Git, filesystem, baseline, or scheduling code.

## Parent Closure Gates

OpenSpec validation proves artifact shape only for this parent design. It does
not prove implementation behavior, generated output behavior, hook behavior, or
runtime lifecycle behavior.

- `bun run openspec -- validate habitat-effect-native-core --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git status --short --branch`
- `gt status` and `gt info`

## Future Child Implementation Gates

- `bun install`
- `bun run build`
- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run habitat:check -- --json`
- `bun run habitat verify -- --base <Graphite parent or explicit test ref>`
- Hook parity probes from H7: staged/unstaged isolation, partially staged
  format-eligible file, foreign staged file, generated-zone block, Graphite base.
- H8 classify probes for path, workspace path, literal diff, `.diff`/`.patch`
  file, and the four-path matrix.
- H8 project-generator probes for supported kind output, `kind:*` spelling,
  non-empty root refusal, unsupported-kind refusal, and zero new baseline
  entries.
- H8 pattern-generator probe for native Grit pattern, empty baseline,
  rule-pack entry, duplicate artifact refusal, and native Grit fixture proof.
- H8 local migration probe via package `./tools/habitat-harness` and
  `nx migrate --run-migrations=<run-file>.json --skip-install`.
- Generated-zone drift check.
