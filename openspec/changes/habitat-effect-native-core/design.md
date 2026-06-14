# Design — Effect-Native Habitat Core

## Resolved Target Shape

```text
oclif command class
  -> Habitat runtime bridge
    -> Effect program
      -> Habitat services/layers
        -> platform command/filesystem/path/terminal
        -> Git, Nx, Grit, Biome, baseline, hook, generated-zone services

Nx generator or migration factory
  -> Habitat Nx adapter bridge
    -> Effect program or pure generator helper
      -> Habitat services/layers
        -> Nx Tree-backed generator workspace
        -> rule-pack, baseline, taxonomy, and migration helpers
```

The command shell stays oclif. Oclif classes parse flags/args, run exactly one
Habitat Effect program, render/write the returned result, and dispose the
runtime before `Command.run()` resolves. Core modules return `Effect` values and
structured results; they do not call `Effect.runPromise` or exit the process.

The H8 generator and migration shell stays Nx. Generator and migration factory
functions remain the metadata-declared Nx entrypoints. If they call reusable
Effect logic, the factory is the host adapter boundary and must close any
runtime, fibers, child processes, or scoped resources before returning or
rejecting to Nx.

The live layer is Node-oriented because the built oclif runner is
`#!/usr/bin/env node` and the repo declares Node engine support. Root Bun
scripts remain the normal invocation route for local development. A temp
dependency probe on 2026-06-14 installed the Node platform packages under Bun
without peer warnings and successfully ran a minimal `NodeContext.layer` program
under Bun. The first implementation child repeats that proof in-repo before
editing the harness manifest. Service interfaces stay platform-neutral.

## Package Decision

Add these dependencies to `@internal/habitat-harness` during implementation:

- `effect@3.21.3`
- `@effect/platform@0.96.1`
- `@effect/platform-node@0.107.0`

Registry peer evidence on 2026-06-14 shows the platform packages accept
`effect@^3.21.2`. Registry metadata for `@effect/platform-node` also declares
peers on `@effect/rpc`, `@effect/sql`, and `@effect/cluster`; Bun accepted the
install without peer warnings in a temp probe. The first implementation task
must repeat the install in-repo, inspect peer output, and prove both
`bun tools/habitat-harness/bin/dev.ts ...` and the built `bin/run.js` path still
execute. Required peer warnings or runtime failure stop the child change before
core code migration.

Do not add `effect-orpc`. Habitat is a local CLI harness in this change, not an
RPC service.

## Runtime Bridge

Introduce a small adapter-level API, for example:

```ts
runHabitatCommand(program, options): Promise<A>
```

Responsibilities:

- assemble `HabitatRuntimeLive`;
- run the provided Effect program;
- map expected Habitat errors into command-facing failure records;
- dispose the runtime in `finally`;
- ensure all scoped resources, fibers, child processes, and finalizers finish
  before returning to oclif.

`HabitatCommand` may expose a protected helper that calls this bridge. Command
classes still own oclif parsing and final stdout/stderr writes so machine JSON
stays deterministic.

Pure report stringification, schema validation, and human rendering stay plain.
Command adapters own stdout/stderr emission and `--output` writes, or delegate
only the file write to a narrowly scoped adapter output capability.

## Service Boundaries

| Service | Owns | Backing Layer |
|---|---|---|
| `HabitatWorkspace` | repo root, harness root, baselines dir, repo-relative paths, package discovery | platform path/filesystem |
| `HabitatProcess` | argument-array execution, cwd/env/PATH policy, stdout/stderr capture, exit code, subprocess lifecycle | platform Command |
| `HabitatGit` | merge-base, git show, staged paths, unstaged paths, Graphite parent, exact `git add` | `HabitatProcess` |
| `BaselineStore` | load/write baselines, shrink-only integrity, violation-key application | workspace + fs + Git |
| `RuleRegistry` | rule-pack loading, rule lookup, selection | workspace + fs |
| `RuleRunner` | dispatch to Grit/file-layer/native/process-backed rules | registry + tool services |
| `GritService` | one JSON scan per check process, apply-mode patterns, cache dir policy, JSON parsing handoff | process + workspace |
| `BiomeService` | format/check/fix command construction and execution | process |
| `NxService` | affected verification, graph generation | process + scoped temp |
| `HookRunner` | pre-commit/pre-push orchestration and staged-index mutation policy | Git + tool services |
| `GeneratedZoneVerifier` | snapshot, regenerate, diff, restore, delete untracked generated artifacts | fs + Git + process |
| `NxGeneratorTree` | generator-owned `exists`, `children`, `read`, `write`, JSON writes, and dry-run/in-memory tree semantics | Nx `Tree` |
| Effect `Clock` / `TestClock` | duration measurement, schedules, deterministic timing tests | Effect built-ins |

Keep these plain:

- diagnostic/report TypeScript types;
- report rendering functions;
- Grit JSON parser and adapter-boundary parser;
- git name-status parser;
- generated-zone path matching;
- rule status calculation after diagnostics are available;
- Nx `createNodesV2` plugin JS.

## Error Model

Separate domain findings from infrastructure failures.

- Rule violations are data in `CheckReport`; they do not fail the Effect program
  unless command execution itself cannot produce a report.
- Non-zero tool exits that currently become diagnostics remain diagnostics.
- Process launch failures, unreadable malformed baseline files, invalid
  generated-zone definitions, and unparseable mandatory tool JSON become tagged
  Habitat errors.
- Command adapters map tagged errors to stderr and exit code 1 or 2 according to
  the existing command class semantics.

Use `Data.TaggedError` for expected internal errors where the caller needs
structured fields. Internal report-schema failures remain defects: the adapter
surfaces them as internal errors rather than treating an impossible report shape
as an expected user/tool failure.

## Resource And Concurrency Policy

Use `Scope` for:

- temp directories created by graph generation or probes;
- child-process lifetimes where streaming execution is introduced;
- generated-zone file snapshots and restore finalizers;
- lock files or cache guards;
- queue drains and background fibers.

Rule execution should be sequential until parity tests prove bounded fan-out.
After parity is pinned, `Effect.all` concurrency must be a declared number based
on tool/process safety. Grit keeps one scan per check process; rule projection
can consume the shared result.

Generator-owned files are not platform-filesystem writes. The generator child
uses an Nx `Tree`-backed service so dry-run behavior, in-memory generator
tests, and Nx transaction semantics remain intact. Platform filesystem access
from generator logic is allowed only for explicitly documented read-only
evidence outside the generator tree.

Grit parity includes the exact current audit roots, `--level error`,
`GRIT_CACHE_DIR`, `GRIT_TELEMETRY_DISABLED`, parser attempts against stdout and
stderr, and projection by `local_name` or `check_id`. The hook staged-file Grit
scan is a separate parity surface because it scans staged TS/JS paths rather
than the full audit roots.

Use `Queue` for staged-file or probe drains only when there is a real producer
and consumer boundary. Use `Semaphore` around Git index mutation, generated-zone
snapshot/restore, and shared cache access when those paths can be invoked in the
same runtime. Use `Schedule` for retry/debounce policies such as transient tool
execution, polling, and hook debounce; do not encode reusable timing policy with
ad hoc timers.

## Migration Phases

### Phase 1: Runtime And Service Skeleton

Add the dependencies, runtime bridge, service tags, live layers, and fake test
layers. Keep existing command behavior by adapting current synchronous helpers
behind the new services.

### Phase 2: Process, Workspace, Git, Baseline

Move PATH injection, command execution, repo path logic, merge-base/git-show,
staged path parsing, and baseline integrity into services. Add parity tests for
stdout/stderr/exit code, no-merge-base behavior, malformed baseline behavior,
Git index path parsing, and `--expand-baseline` authoring behavior. Baseline
authoring parity includes selected-rule writes, stable sort/newline formatting,
no check report emission during expansion, and the rule-introduction exception
used by shrink-only integrity.

### Phase 3: Check Orchestration

Move `createCheckReport`, baseline application, rule dispatch, Grit shared-scan
projection, file-layer checks, and report emission into Effect programs. Keep
the `CheckReport` schema and human rendering stable.

### Phase 4: Remaining Oclif Commands

Move `fix`, `verify`, `graph`, and `classify` onto Effect-backed command
programs. `graph` uses scoped temp directories. `verify` keeps output
forwarding and affected target semantics. H8 classify parity includes
repo-relative and absolute paths, workspace-level paths, literal diffs,
`.diff`/`.patch` files, and the four-path matrix recorded by H8.

### Phase 5: Nx Generators And Migrations

Move reusable H8 generator/migration logic behind Nx-native adapters. The
project generator keeps schema acceptance for all taxonomy spellings while
runtime-refusing non-uniform kinds; it keeps default roots/package names,
non-empty root refusal, package scripts, ESM exports, Node engine, tsconfig,
source/test stubs, and README output. The pattern generator keeps native Grit
pattern creation, empty baseline creation, duplicate artifact refusal, and
rule-pack append semantics. Migrations remain Nx migration factories and local
run-file driven because the package is unpublished.

Before implementation chooses module boundaries, it must pin one bridge for the
current ESM package plus source CJS factory metadata while preserving the H8
metadata paths: CJS factories dynamically import implementation code, or a
deliberately small CJS-compatible pure core remains for generator/migration
factories.

### Phase 6: Hooks

Move pre-commit and pre-push orchestration after fake Git/FS/process tests pin:
resource publish invocation, staged file-layer check, partially staged refusal,
formatter-touched restage, Biome check, Grit staged scan, Graphite parent base,
and pre-push affected target set.

The migrated pre-commit path calls internal Habitat check/rule programs for the
staged file-layer check instead of spawning `bun tools/habitat-harness/bin/dev.ts
check` recursively. The preserved H7 resource-publish behavior remains the one
non-formatter mutation carve-out and is limited to the resources submodule
gitlink behavior already accepted by H7.

### Phase 7: Generated-Zone Verifier

Move `verify-generated-zones.mjs` after snapshot/restore/delete parity is
covered by tests. The scoped snapshot finalizer restores tracked map artifact
files even when regeneration or diff checks fail, then removes untracked map
artifacts created by the verification run. The policy-table path remains a
check-only gate unless a later source-backed child change changes that behavior;
the verifier still proves the final worktree is clean across all generated
target inputs.

## Test Strategy

- Adapter tests keep mocking at the command boundary to prove oclif flag/arg
  parsing and stdout/stderr writes.
- Service tests use fake layers for process, Git, filesystem, workspace, and
  clock.
- Generator tests use an Nx `Tree`-backed fake/live service so dry-run,
  in-memory tree behavior, and duplicate write protection remain under Nx
  control.
- Parity tests compare pre-refactor and Effect-backed command outputs for
  representative `check`, `fix --dry-run`, `verify --base`, `graph --json`,
  `classify`, `hook pre-commit`, `hook pre-push`, and generated-zone checks.
- Command parity includes `check --output`, filtered checks, staged file-layer
  checks, unknown hook exit 2, and verify check-fail ordering before Nx runs.
- Native Grit pattern tests remain native Grit tests.
- Runtime lifecycle tests assert scoped finalizers run before command helpers
  resolve.
- TestClock covers schedule/backoff/debounce policies introduced by the slice.

## Review Lanes Before Implementation

- OpenSpec lane: sequencing after H8, artifact shape, stop conditions, and no
  historical rewrite of H1-H8.
- Effect lane: service/layer design, runtime placement, scope closure, tagged
  errors, platform dependency choice, concurrency policy.
- Harness parity lane: command contracts, JSON, baselines, Grit, hooks,
  classify, generators, generated-zone verification.
- Testing lane: fake layers, deterministic clock, lifecycle tests, native tool
  probes.
- Workflow lane: Graphite cleanliness, generated artifact discipline, validation
  gates, and documentation touchpoints.

## Parent Spec Split

This parent change uses one spec directory per major child workstream:

| Child change | Parent spec delta |
|---|---|
| `habitat-effect-runtime-substrate` | `specs/habitat-effect-runtime-substrate/spec.md` |
| `habitat-effect-process-baselines` | `specs/habitat-effect-process-baselines/spec.md` |
| `habitat-effect-check-orchestration` | `specs/habitat-effect-check-orchestration/spec.md` |
| `habitat-effect-command-programs` | `specs/habitat-effect-command-programs/spec.md` |
| `habitat-effect-nx-generators-migrations` | `specs/habitat-effect-nx-generators-migrations/spec.md` |
| `habitat-effect-hooks` | `specs/habitat-effect-hooks/spec.md` |
| `habitat-effect-generated-verifier` | `specs/habitat-effect-generated-verifier/spec.md` |
