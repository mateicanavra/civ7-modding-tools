## Why

The regression already polluted first-party shipped map configs with raw
Morphology op envelopes. The correct repair is a one-way migration of known
first-party configs to the new semantic public surface, followed by hard
validation failures for stale raw envelopes.

## Target Authority Refs

- Direct user decision: authored configs are public knobs/stage schema compiled
  internally; internal op envelopes are not public config.
- `openspec/changes/morphology-public-config-surface`: Morphology public schema
  owner.
- `openspec/changes/normalize-swooper-map-config-generation`: shipped JSON map
  configs are first-party source authority.

## What Changes

- Migrate shipped map configs from Morphology step/op envelopes to semantic
  public keys.
- Preserve existing authored tuning intent by mapping every known raw envelope
  path to one public field or rejecting it during migration.
- Keep normal validation strict after migration; no dual persisted shape.

## Requires

- `morphology-public-config-surface`

## Enables Parallel Work

- Studio repo-backed config editing on a clean public surface.
- Later world-balance tuning without internal envelope churn.

## Forbidden Non-Goals

- No silent runtime dual-read compatibility.
- No generated output hand edits.
- No public retention of raw `{ strategy, config }` Morphology envelopes.

## Verification Gates

- `bun test mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run openspec -- validate migrate-swooper-morphology-public-configs --strict`
- `git diff --check`
