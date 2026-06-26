# Proposal: Deep Habitat Effect Check Baseline Cutover

## Summary

Move Habitat check execution and baseline authority onto the Effect provider
substrate while preserving shrink-only baseline semantics and normalized
diagnostics.

## What Changes

- Move `check` and `baseline` source to `src/domains/structural-check/**` and
  `src/domains/baseline-authority/**`.
- Replace raw command/fs/git/time seams with provider services.
- Use tagged expected errors for selector refusal, baseline refusal, graph
  refusal, protected-zone refusal, and diagnostic unavailability.

## What Does Not Change

- No baseline growth rule change.
- No CheckReport JSON contract change without D0 row update.
- No change to `.habitat/baselines/**` content except test fixtures created by
  owning tests.

## Verification Gates

- `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts test/lib/check-summaries.test.ts`
- `bun run habitat check --json`
- `bun run openspec -- validate deep-habitat-effect-check-baseline-cutover --strict`
- `git diff --check`
