# Change: Deep Habitat Effect Source Check Lazy AST

## Why

Habitat structural checks should keep repository rules fast enough for humans
and agents to run as an ordinary feedback loop. The source-check substrate had
the right ownership shape, but it eagerly parsed every TypeScript-like file
before rule evaluation. That made text-only and path-only rules pay AST cost
even when they never inspect syntax.

## What Changes

- Make source-check file records parse TypeScript lazily on first
  `sourceFile` access.
- Preserve the policy module contract: rules still receive `path`, `text`, and
  optional `sourceFile`.
- Keep the optimization inside the source-check domain without adding topology
  tests or public API.

## Non-Goals

- Do not change rule semantics or baselines.
- Do not change the generated source-check policy artifact shape.
- Do not replace source-check rules with live Grit calls.
- Do not add structural/topology tests.

## Validation

- Habitat structural check must still pass.
- Habitat package check/build must still pass.
- OpenSpec validation and whitespace checks must pass before closure.
