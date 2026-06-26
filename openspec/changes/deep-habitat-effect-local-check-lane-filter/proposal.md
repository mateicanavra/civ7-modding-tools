# Change: Deep Habitat Effect Local Check Lane Filter

## Why

Default `habitat check` is the local diagnostic loop. It should not execute
graph proof and hygiene proof rules unless the caller explicitly asks for those
rules or runs a graph/hygiene lane. Native Biome, Grit, and Nx are fast; the
slow path comes from asking the local check lane to behave like workspace proof.

## What Changes

- Filter unscoped current-tree `habitat check` to local Habitat rule tools:
  source-check, file-layer, command-check, and Habitat guard rules.
- Keep graph/hygiene proof tools runnable through explicit selectors such as
  `--rule`, `--tool`, and `--owner`.
- Keep staged/hook checks governed by their explicit check options.

## Non-Goals

- Do not remove graph/hygiene proof rules.
- Do not change `check:graph`, `lint`, or CI authority.
- Do not add structural topology tests.
