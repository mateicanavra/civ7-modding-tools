## Why

The Morphology public surface fix needs durable guardrails that prove the public
schema stays semantic while the compiler still produces internal executable
config. The guardrails must target boundaries, not mutable tuning values.

## Target Authority Refs

- Direct user decision: do not use brittle tests over mutable config values;
  use compiler/SDK tests for compiler behavior and product/world tests for
  product outcomes.
- `docs/system/TESTING.md`: proof boundaries must match what tests exercise.
- `openspec/changes/mapgen-public-config-boundary`
- `openspec/changes/morphology-public-config-surface`

## What Changes

- Add static/schema tests that prevent Morphology raw op envelopes from
  reappearing in public recipe schemas, shipped configs, and Studio defaults.
- Keep existing math-transform tests separate from public-boundary proof.
- Validate that compiled config still contains internal step/op envelopes after
  public config compilation.

## Requires

- `mapgen-public-config-boundary`
- `morphology-public-config-surface`
- `migrate-swooper-morphology-public-configs`
- `studio-public-config-contract`

## Enables Parallel Work

- Earthlike balancing work on a stable authoring surface.

## Forbidden Non-Goals

- No exact assertions over mutable product tuning values as public-boundary
  proof.
- No replacing product world-balance tests with tiny schema tests.
- No UI-only filter as boundary enforcement.

## Verification Gates

- Focused core compiler tests.
- Focused shipped-config and Studio config schema tests.
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate guard-morphology-public-config-boundary --strict`
- `bun run openspec:validate`
- `git diff --check`
