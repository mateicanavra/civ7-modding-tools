# Change: Deep Habitat Effect Hook Service Cutover

## Why

Pre-commit hook behavior had two active implementations: the oRPC service path
and an exported synchronous helper used only by tests. That duplicate path kept
old command spawning alive after the service path had moved file-layer,
source-check, and Biome execution into Effect/provider services.

## What Changes

- Remove the synchronous `runPreCommit` export and its staged Habitat check
  command runner.
- Keep pre-commit behavior on the hook service/router implementation.
- Migrate hook behavior coverage to service execution with fake
  `StructuralCheck` and `BiomeProvider` layers.
- Collapse staged hook check results to the in-process parsed service shape.

## Non-Goals

- Do not change hook CLI behavior.
- Do not change resource policy, staged path selection, or formatter restage
  semantics.
- Do not add topology or structure tests.
- Do not change pre-push Nx policy in this slice.

## Validation

- Hook behavior tests must pass through the service path.
- Hook service tests must still pass.
- Habitat package check, OpenSpec validation, Biome, and whitespace checks must
  pass.
