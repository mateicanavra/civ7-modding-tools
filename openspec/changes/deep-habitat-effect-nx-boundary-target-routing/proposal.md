# Change: Deep Habitat Effect Nx Boundary Target Routing

## Why

Project-plane import legality is an Nx capability in this repository. Habitat
should expose that capability as part of its structural rule surface, but it
should not pretend boundary enforcement is a separate Habitat executable.

The live workspace already has an Nx `boundaries` target backed by
`@nx/enforce-module-boundaries`. The `import-boundaries` rule row still routed
through a direct `import-boundaries` command policy, leaving a duplicate path
around the same vendor concern.

## What Changes

- Keep the public Habitat rule id `import-boundaries`.
- Route that rule through the graph-backed `target-check` model.
- Point the rule at `@internal/habitat-harness:boundaries`.
- Remove the direct `import-boundaries` workspace tool policy.
- Tighten registry types so `import-boundaries` is no longer a standalone
  executable owner tool.

## Non-Goals

- Do not change the Nx boundary config or dependency constraints.
- Do not change taxonomy drift validation.
- Do not rename the public Habitat rule id in this slice.
