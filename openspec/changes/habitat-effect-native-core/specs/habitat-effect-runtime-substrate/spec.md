## ADDED Requirements

### Requirement: Oclif Adapters Bridge Into A Managed Effect Runtime

Each Habitat oclif command SHALL remain a command adapter. The adapter SHALL
parse flags and arguments, run one Habitat Effect program through a command
scoped runtime bridge, render or write the returned result, and dispose the
runtime before `Command.run()` resolves.

#### Scenario: Check command uses the runtime bridge
- **WHEN** an agent runs `bun run habitat:check -- --json`
- **THEN** the oclif adapter runs the Effect-backed check program through the
  Habitat runtime bridge
- **AND** the adapter remains responsible for deterministic JSON stdout
  emission
- **AND** the command exits non-zero when enforced Habitat rules fail or when
  the command cannot produce a valid report
- **AND** infrastructure failures are reported outside JSON stdout

#### Scenario: Scoped resources close before command completion
- **WHEN** a Habitat command creates temp directories, child processes, queues,
  file snapshots, cache locks, or background fibers through Effect services
- **THEN** all command-scoped finalizers finish before the oclif command
  resolves
- **AND** no command-owned child process, fiber, or runtime scope remains active
  after command completion

### Requirement: Habitat Core Programs Are Effect Values

Reusable Habitat core modules SHALL expose `Effect` programs and structured
results. Core modules SHALL NOT call `Effect.runPromise`, `process.exit`, or
oclif APIs from below the adapter boundary.

#### Scenario: Core logic is reused outside oclif commands
- **WHEN** check, classify, hook, generator, migration, or generated-zone logic
  needs reusable orchestration
- **THEN** the reusable logic is expressed as Effect programs or pure functions
  below the relevant host adapter
- **AND** the host adapter owns runtime execution and disposal

### Requirement: Runtime Dependencies Are Proved By Repo Gates

The Habitat Effect implementation SHALL prove selected Effect runtime and
platform packages through the repo's Bun, built oclif, Nx, Habitat, and
OpenSpec gates before migrating command behavior onto those dependencies.

#### Scenario: Platform dependency versions are accepted by the workspace
- **WHEN** the Effect implementation adds selected Effect runtime and platform
  packages to `@internal/habitat-harness`
- **THEN** `bun install` completes with peer-resolution evidence recorded in
  the phase record
- **AND** root Bun Habitat scripts and the built oclif runner both execute the
  Habitat command surface

#### Scenario: RPC libraries remain outside the CLI core
- **WHEN** the Habitat core becomes Effect-native
- **THEN** `effect-orpc` is not added to `@internal/habitat-harness`
- **AND** RPC exposure is handled only by a separate service/API change with
  its own proposal and spec delta
