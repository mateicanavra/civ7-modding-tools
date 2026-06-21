# Proposal: Deep Habitat Effect Hook Pre-Push Provider Drain

## Summary

Drain the remaining synchronous pre-push hook execution path so pre-push is an
Effect service operation backed by explicit Git and Nx providers.

## What Changes

- Remove the exported synchronous `runPrePush` pre-push path from the hook
  service module.
- Resolve pre-push base selection through the hook service Effect path.
- Execute Nx affected through `NxProvider`.
- Keep Graphite parent detection bounded as the remaining pre-push command edge.
- Move pre-push behavior tests to the service/provider path.

## What Does Not Change

- `habitat hook pre-push` output and exit behavior stay stable.
- CI remains authoritative.
- Pre-commit staged mutation and formatter restage drainage remain a follow-on
  slice.

## Verification

- `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/lib/hooks.test.ts`
- `bun run --cwd tools/habitat-harness check`
- `bun run openspec -- validate deep-habitat-effect-hook-prepush-provider-drain --strict`
- `git diff --check`
