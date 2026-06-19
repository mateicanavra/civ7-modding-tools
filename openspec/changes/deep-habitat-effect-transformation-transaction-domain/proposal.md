# Change: Deep Habitat Effect Transformation Transaction Domain

## Why

Pattern apply and protected-zone behavior are transactional Habitat decisions,
but current code can mix dry-run proof, cache/temp lifecycle, direct filesystem
operations, and recovery records with vendor execution details.

## What Changes

- Move transformation transaction ownership to
  `src/domains/transformation-transaction/**`.
- Move protected-zone authority to `src/domains/protected-zone-authority/**`.
- Require scoped resources, write-set tracking, rollback data, and typed
  refusal records.

## What Does Not Change

- No live write escalation beyond current dry-run/refusal behavior.
- No protected-zone policy relaxation.

## Verification

- `bun run openspec -- validate deep-habitat-effect-transformation-transaction-domain --strict`
- `git diff --check`
