# Change: Deep Habitat Effect Root Check Verify Split

## Why

The root `bun run check` script hid a repo-wide build/test/verify graph behind
the ordinary health path. That made developer checks long and illegible, and it
duplicated command meaning because Habitat structural checking and repo-wide
verification already have distinct product roles.

Habitat should reduce ambiguity for humans and agents. Root scripts need clear
product meanings: `check` is the normal Habitat structural health loop,
`check:graph` is affected package build/test validation, `verify` is the
heavier verification loop, and CI can compose the full graph explicitly.

## What Changes

- Make root `check` run the diagnostic Habitat structural aggregate.
- Add `check:graph` for affected graph build/check/lint/test validation.
- Keep `verify` as the explicit root verification aggregate.
- Change `ci` to run the full repo-wide graph aggregate explicitly.
- Update Habitat docs to describe the split.

## Non-Goals

- Do not remove any build, test, lint, or verification target.
- Do not weaken CI.
- Do not change Habitat diagnostic `check` or `verify` command semantics.
- Do not add tests for command topology.

## Validation

- Root `bun run check` must remain runnable as the normal structural health
  path.
- Root `bun run check:graph` remains available for affected graph build/test
  validation.
- Root `bun run verify` remains the explicit heavier verification path.
- OpenSpec validation and whitespace checks must pass before closure.
