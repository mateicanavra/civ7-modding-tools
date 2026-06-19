# Change: Deep Habitat Effect Substrate Architecture

## Why

Current Habitat source has an incomplete substrate for resources, errors,
config, vendors, and domain capabilities. Effect is present, but mostly as a
Grit/process island. The refactor needs one accepted architecture packet before
implementation starts.

## What Changes

- Define the target Effect-first file tree under `runtime/`, `providers/`,
  `domains/`, and `public/`.
- Approve host adapter boundaries: oclif, Husky, Nx generators/migrations, and
  root scripts remain entrypoints.
- Define carry-forward/delete decisions for current Habitat code.
- Define the migration order that collapses process/resource/error/config state
  space without changing public behavior.

## What Does Not Change

- No source behavior changes in this packet.
- No command name, flag, JSON shape, hook behavior, or package export changes.
- No product-specific MapGen/Civ7 authoring parser semantics.

## Affected Owners

- `docs/projects/habitat-harness/deep-refactor/effect-first-refactor-domino-plan.md`
- Future source under `tools/habitat-harness/src/**`
- This OpenSpec packet.

## Stop Conditions

- The design cannot identify the owning domain and provider for a capability.
- The target tree leaves two active implementations for the same behavior.
- Public contract risks are not named before source movement.

## Verification

- `bun run openspec -- validate deep-habitat-effect-substrate-architecture --strict`
- `bun run openspec:validate`
- `git diff --check`
