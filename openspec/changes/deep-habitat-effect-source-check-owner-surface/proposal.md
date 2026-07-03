# Change: Deep Habitat Effect Source Check Owner Surface

## Why

Habitat source rules are owned Habitat structure, not a direct Grit vendor
surface. The old `pattern-check` naming blurred product intent, runtime
ownership, and vendor implementation details. That ambiguity made command
selection, Nx target names, hook output, and generated artifacts read as though
Habitat was merely exposing Grit instead of owning a source-rule capability.

## What Changes

- Rename the active Habitat source-rule tool surface to `source-check`.
- Rename the Nx source-rule target from `grit:check` to `source:check`.
- Rename the generated source-check policy artifact to
  `.habitat/source-check/source-rules.mjs`.
- Rename internal source-rule facts and service methods so Habitat-owned logic
  is not described as pattern-check execution.
- Preserve Grit-native naming only inside the enclosed Grit adapter and fixture
  validation surfaces.

## Non-Goals

- Do not add compatibility aliases for `pattern-check` or `grit:check`.
- Do not rename native Grit concepts such as Grit pattern files, Grit apply
  files, or the Grit adapter command kind.
- Do not enforce topology with Vitest tests.
- Do not change rule semantics or baselines.

## Validation

- Source-check execution must pass through the Habitat CLI.
- Hook and service tests that assert source-check output must pass.
- OpenSpec validation must pass for this packet.
- Stale active-code names for the old Habitat-owned surface must be removed.
