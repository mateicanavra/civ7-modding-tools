# Change: Deep Habitat Effect Grit Fixture Target Drain

## Why

`workspace-tools.test.ts` executed live `grit --version` inside the package unit
suite. That is the same ownership error as the boundary taxonomy drain: native
vendor availability and fixture validation belong to explicit toolchain targets,
not ordinary Vitest tests.

Habitat should keep unit tests fixture-bounded and use Nx to model native
vendor proof surfaces with cacheable inputs.

## What Changes

- Declare `@internal/habitat-harness:validate:grit-patterns` as a cacheable Nx
  target over checked-in Habitat/Grit pattern artifacts.
- Switch the package `validate:grit-patterns` script to concise native
  `grit patterns test` output instead of large JSON stderr output.
- Include the target in root `bun run check` and Habitat verify/pre-push target
  planning.
- Replace the live `grit --version` unit test with a pure command
  materialization assertion.

## Non-Goals

- Do not change Habitat pattern semantics.
- Do not change current-tree `grit:check` enforcement.
- Do not route Grit fixture validation through Biome or ordinary unit tests.

## Validation

- `nx run @internal/habitat-harness:validate:grit-patterns` must pass.
- `bun run --cwd tools/habitat-harness test -- workspace-tools.test.ts` should
  no longer execute live Grit.
- Existing Habitat package checks and OpenSpec validation must stay green.
