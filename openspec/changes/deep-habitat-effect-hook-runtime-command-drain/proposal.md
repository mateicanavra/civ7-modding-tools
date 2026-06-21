# Change: Deep Habitat Effect Hook Runtime Command Drain

## Why

Hook execution still carries a command-shaped `HookRuntime` seam after the
service cutover. That leaves Git, Graphite, staged-path inspection, restaging,
resource inspection, and trace snapshots flowing through an optional runtime
object instead of Habitat's explicit providers.

This keeps the hook module looking like a script harness even though the rest of
the refactor is making Habitat a typed service composition over named vendor
capabilities.

## What Changes

- Remove `HookRuntime.runCommand` and the hook-domain sync command runner.
- Route hook Git operations through `GitProvider`.
- Route Graphite parent discovery through the service provider substrate instead
  of the hook runtime object.
- Keep hook service behavior and output contracts stable.
- Keep hook service logic authored in the hook router/module surface, with
  domain files limited to pure policy and data helpers.

## Non-Goals

- Do not change hook CLI flags or user-facing streams.
- Do not replace every remaining runtime field in this slice.
- Do not add topology tests; structural enforcement remains Nx/Biome/Grit/Habitat
  guard territory.
- Do not submit the Graphite stack.

## Validation

- Hook behavior and service tests must pass with provider fakes.
- Habitat package check, OpenSpec validation, Biome, and whitespace checks must
  pass.
