# Change: Deep Habitat Effect Biome Provider Materialization

## Why

Biome is a vendor provider in Habitat, so it must run through Habitat's
workspace-tool materialization policy instead of depending on ambient shell
`PATH`. The provider currently requests `biome` directly, which works from
`bun run habitat:check` because Bun injects workspace binaries, but can fail
from direct Habitat invocation or other service entrypoints.

## What Changes

- Register `biome` as a workspace-managed tool in Habitat config.
- Keep BiomeProvider command-vector ownership unchanged.
- Ensure command materialization resolves Biome through the same workspace
  binary policy as other vendor tools.

## Non-Goals

- Do not change Biome's check/format/ci semantics.
- Do not change hook staged-path behavior.
- Do not migrate pattern checks to Grit in this slice.
- Do not add topology/structure tests.

## Validation

- Direct Habitat check invocation should no longer depend on script PATH for
  Biome.
- Provider tests should cover Biome workspace-tool materialization.
- Package checks, root check, Biome, OpenSpec, and whitespace gates must pass.
