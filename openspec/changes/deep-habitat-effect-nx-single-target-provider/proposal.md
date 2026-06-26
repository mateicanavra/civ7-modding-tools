# Change: Deep Habitat Effect Nx Single Target Provider

## Why

Habitat structural checks should use the cheapest clear vendor path for the
work being performed. The import-boundaries rule maps to one Nx target, but
Habitat executed graph-backed rules through `nx run-many` even for a single
project/target pair. That adds avoidable orchestration cost and makes the
provider API less precise than the vendor capability underneath it.

## What Changes

- Add `NxProvider.runTarget` for one project/target execution.
- Keep `NxProvider.runMany` for true multi-target batches.
- Route structural-check graph execution through `runTarget` when the selected
  graph-backed rules collapse to one unique target.
- Keep existing diagnostics and public check output shapes.

## Non-Goals

- Do not replace Nx boundary semantics with a custom Habitat import graph.
- Do not remove `runMany`; true batches still use it.
- Do not change root `check:graph`, CI, or hook target lists.
- Do not add topology tests.

## Validation

- Focused provider tests must prove the new command vector.
- Habitat structural `import-boundaries` check must pass.
- Root Habitat structural check must pass.
- Package check/build, OpenSpec validation, Biome CI, and whitespace checks must
  pass before closure.
