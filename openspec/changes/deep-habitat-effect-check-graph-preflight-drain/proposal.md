# Change: Deep Habitat Effect Check Graph Preflight Drain

## Why

Habitat check execution should not pay for a full workspace graph read before
running provider-owned checks. Graph-backed checks already execute through Nx
targets, and Nx is the authority for whether those targets exist and run. The
extra preflight made simple checks slow and duplicated responsibility.

## What Changes

- Remove check-time workspace graph preflight refusals from structural-check
  execution.
- Keep graph metadata for routing graph-backed rules to their provider-owned
  targets.
- Let provider execution report failures when a target or command cannot run.

## Non-Goals

- Do not remove workspace graph integration from classify, verify, or target
  planning.
- Do not change rule registry graph metadata.
- Do not weaken root check pass/fail behavior.

## Validation

- `import-boundaries` should run without the extra graph preflight.
- Root Habitat check must remain passing.
- Package typecheck, Biome, OpenSpec, and whitespace gates must pass.
