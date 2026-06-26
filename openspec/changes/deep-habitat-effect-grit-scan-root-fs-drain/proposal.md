# Change: Deep Habitat Effect Grit Scan Root Filesystem Drain

## Why

Grit scan-root policy tests depended on the live checkout filesystem to decide
which roots existed. That made a domain policy test sensitive to worktree shape
and kept filesystem access embedded in the adapter decision instead of treating
existence as an explicit resource input.

Habitat is the layer that turns repository structure into enforceable rules.
Its own Grit adapter should separate scan-root classification from host
existence checks so policy can be tested deterministically and live filesystem
access remains an adapter default.

## What Changes

- Add a `pathExists` option to Grit scan-root validation decisions.
- Reuse the option for discovered pattern scan roots.
- Keep live behavior defaulting to `existsSync`.
- Replace live-filesystem scan-root validation tests with a fake existence
  function.

## Non-Goals

- Do not change approved scan-root policy.
- Do not change Grit execution, batching, or output parsing.
- Do not add structural enforcement tests.
- Do not introduce shims, fallbacks, or duplicate scan-root models.

## Validation

- `bun run --cwd tools/habitat-harness test -- grit-adapter.test.ts` must pass.
- Package test/check/build and OpenSpec validation must stay green before
  closure.
