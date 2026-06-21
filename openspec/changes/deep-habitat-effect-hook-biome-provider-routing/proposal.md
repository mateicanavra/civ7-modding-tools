# Change: Deep Habitat Effect Hook Biome Provider Routing

## Why

Habitat hooks are part of the developer toolkit surface: they should feel fast,
predictable, and composed from the same vendor providers as the rest of
Habitat. Pre-commit currently runs Biome through a direct hook command path even
though Biome already has a provider. That bypass keeps vendor execution split
between hook-local shell code and the Effect provider substrate.

## What Changes

- Route pre-commit Biome format/check execution through `BiomeProvider` in the
  hook service path.
- Keep pre-commit staged-file policy, partial-staging refusal, formatter
  restage, output sections, and trace phases unchanged.
- Add provider-backed service coverage so the hook service proves Biome requests
  are issued through the provider seam.

## Non-Goals

- Do not change Biome format/check semantics or staged path selection.
- Do not add topology or structure tests.
- Do not change pre-push Nx dependency policy in this slice.
- Do not migrate Grit routing in this slice.

## Validation

- Focused hook service tests must pass.
- Legacy hook behavior tests must remain green until their sync path is removed
  by a later cutover.
- Habitat package check, OpenSpec validation, Biome, and whitespace checks must
  pass.
