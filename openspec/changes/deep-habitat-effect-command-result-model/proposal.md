# Proposal: Deep Habitat Effect Command Result Model

## Summary

Replace uneven command outcome shapes with a generic Habitat command
request/result/error model that all providers and feature migrations consume.

## What Changes

- Move generic command DTOs out of `habitat-process`.
- Define typed command states for not-run, completed, interrupted,
  unavailable, failed, parse-failed, and schema-drift observations.
- Preserve output bounds, argv/cwd/env redaction, cache status, and Git state as
  explicitly owned fields.

## What Does Not Change

- No public CLI output change without D0 row update.
- No D15 trigger change.
- No vendor-specific parser rewrite.

## Verification Gates

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run openspec -- validate deep-habitat-effect-command-result-model --strict`
- `git diff --check`
