# Design: Nx Single Target Provider

## Frame

Habitat is a coordination layer over strong vendor tools. Its provider model
should expose vendor capabilities with the same granularity the domain needs.
Using a batch command for a single target is an unnecessary state: callers and
the provider both pretend there may be multiple projects/targets when the
domain has already resolved one.

## Ownership

- `providers/nx` owns Nx command-vector construction and live/fake provider
  execution.
- `domains/structural-check` owns deciding whether selected graph-backed rules
  execute as a single target or a batch.
- Nx remains the owner of project-plane import-boundary semantics.

## Implementation

Add `NxRunTargetRequest`, `runTargetArgv`, and `NxProvider.runTarget`. The live
provider materializes through the existing `target-check` workspace tool policy,
so it still runs the repo-pinned Nx binary through Bun.

In structural-check graph execution, deduplicate resolved graph targets. If
there is exactly one unique target, run it through `runTarget`; otherwise use
the existing `runMany` path with sorted unique projects and targets.

## Evidence

Local timing before this slice showed:

- `nx run @internal/habitat-harness:boundaries --outputStyle=static`: about
  2.3 seconds.
- `nx run-many --targets boundaries --projects @internal/habitat-harness`: about
  3.7 seconds.
- `habitat check --tool import-boundaries --json`: about 4.4 seconds.

The goal is not to chase a single timing number; it is to remove the avoidable
batch orchestration layer from the steady-state single-target path.

## Risks

- If multiple selected graph-backed rules resolve to the same target, the
  deduplicated single-target path now executes once and projects the same result
  to each selected rule. That matches the previous batch behavior but uses a
  narrower command.
- If selected rules resolve to different targets, the existing batch path
  remains unchanged.
