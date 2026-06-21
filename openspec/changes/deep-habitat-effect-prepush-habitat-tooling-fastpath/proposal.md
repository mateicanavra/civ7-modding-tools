# Change: Deep Habitat Effect Pre-Push Habitat Tooling Fast Path

## Why

Habitat tooling edits still fall back to generic Nx affected `check`, which
fans out through dependent projects before the hook has any product reason to
verify those consumers locally. That makes the workstation hook pay for broad
repo work when the changed paths are owned by Habitat itself.

## What Changes

- Plan pre-push targets as a domain hook policy instead of a flat target list.
- Run `@internal/habitat-harness:check` directly for Habitat tooling-only
  source edits.
- Keep structural validation on affected targets for Habitat tooling edits:
  `habitat:check`, `source:check`, `validate:boundary-taxonomy`, and
  `validate:grit-patterns`.
- Preserve generic affected `check` for ordinary repo/product changes.

## Non-Goals

- Do not change CI verification.
- Do not add structural topology tests.
- Do not rename root scripts or Nx targets in this slice.
