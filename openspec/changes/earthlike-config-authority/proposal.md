## Why

Swooper Earthlike has multiple first-party config sources that are not aligned:
the shipped map JSON, standard Earthlike preset JSON, Studio default posture,
and stale `realismEarthlikeConfig` test input. Some steps rely on implicit
defaults, and duplicate authored values can be overwritten by stage knobs. That
means tests and runtime can exercise different Earthlike behavior.

## Target Authority Refs

- `openspec/changes/earthlike-balance-diagnostic-gates`: config sources cannot
  drift silently.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: flat stage config
  migration owns first-party persisted consumers.
- `mods/mod-swooper-maps/AGENTS.md`: generated mod output is read-only and map
  configs are source truth for shipped Swooper Maps.

## What Changes

- Align shipped Swooper Earthlike config, standard Earthlike preset, and Studio
  default Earthlike posture.
- Make Earthlike step choices explicit where omitted defaults hide behavior.
- Resolve stale `realismEarthlikeConfig` usage so tests do not exercise a weak
  legacy Earthlike path unless explicitly labeled as such.
- Add parity tests that fail on unintended Earthlike config drift.

## Write Set

- `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
- `mods/mod-swooper-maps/src/presets/standard/earthlike.json`
- `mods/mod-swooper-maps/src/maps/presets/realism/earthlike.config.ts`
- `apps/mapgen-studio/**` config default tests only if Studio posture is
  affected
- Adjacent config tests under `mods/mod-swooper-maps/test/config/**`

## Forbidden Non-Goals

- No generated-output hand edits.
- No ecology, hydrology, or terrain tuning beyond explicit config-source
  authority alignment.
- No preserving a stale Earthlike path under an ambiguous name.

## Verification Gates

- `bun --cwd mods/mod-swooper-maps test test/config/*.test.ts`
- `bun run openspec -- validate earthlike-config-authority --strict`
- `bun run openspec:validate`
- `git diff --check`
