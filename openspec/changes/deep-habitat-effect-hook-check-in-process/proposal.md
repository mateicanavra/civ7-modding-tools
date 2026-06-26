# Change: Deep Habitat Effect Hook Check In Process

## Why

Habitat hooks are service-owned workflows, but pre-commit still shells back into
the Habitat CLI for staged `file-layer` and `pattern-check` checks. That makes
the hook service re-enter its own CLI path, rebuild the service runtime, and
recompute staged state it already knows. The result is slow feedback and a
misleading Effect-oRPC boundary: the hook appears in-process while the core
check work is actually a nested process.

## What Changes

- Route service pre-commit staged Habitat checks through `StructuralCheck`
  directly.
- Pass the hook's staged path snapshot into those checks instead of forcing the
  check engine to rediscover it.
- Preserve hook output and failure behavior while making service execution stay
  inside the Effect-oRPC runtime.
- Keep the synchronous legacy hook helper as a command-backed unit-test surface
  only until the broader hook runtime cutover retires it.

## Non-Goals

- Do not change Biome staged format/check command behavior in this slice.
- Do not change pre-push target composition in this slice.
- Do not replace SourceCheck with native Grit current-tree execution.
- Do not add topology or structure tests.

## Validation

- Hook service tests should assert that service pre-commit no longer spawns
  `habitat check`.
- Hook behavior tests should continue to cover legacy staged failure behavior.
- Package checks, OpenSpec validation, Biome, root Habitat check, and whitespace
  gates must pass.
