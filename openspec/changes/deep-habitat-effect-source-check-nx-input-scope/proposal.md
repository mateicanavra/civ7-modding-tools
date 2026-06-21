# Change: Deep Habitat Effect Source Check Nx Input Scope

## Why

Habitat source-check rules now declare exact path coverage. Nx target inputs
should honor that contract so source-check cache keys represent the files a
rule can actually inspect, not broad scan roots that only exist as collection
hints.

## What Changes

- Use exact source-check path coverage as the primary Nx input scope.
- Add source-check scan roots to Nx inputs only when exact coverage is absent.
- Preserve rule modules, manifests, runtime code, package metadata, and rule
  metadata as implementation inputs.

## Non-Goals

- Do not change source-check runtime behavior.
- Do not change rule registry schema.
- Do not add topology tests for generated target structure.
- Do not change hook, Biome, Grit, or pre-push policy in this slice.

## Validation

- OpenSpec validation must pass.
- Habitat package type check must pass.
- `nx show project @internal/habitat-harness --json` must produce valid target
  metadata after the input-scope change.
- Biome and whitespace checks must pass.
