## Why

Swooper Earthlike has multiple first-party config sources that are not aligned:
the shipped map JSON, standard Earthlike preset JSON, Studio default posture,
and stale `realismEarthlikeConfig` test input. Some authored sources also carry
internal projection or op config that should be produced by compilation from
public knobs/stage schemas instead of being treated as public map posture. That
means tests and runtime can exercise different Earthlike behavior or normalize
the wrong config layer.

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
- Remove internal projection/op config from Earthlike authored posture where
  compilation should own it.
- Resolve stale `realismEarthlikeConfig` usage so tests do not exercise a weak
  legacy Earthlike path unless explicitly labeled as such.
- Use existing schema/config gates for source validity; compiler/SDK behavior
  belongs in compiler-level tests, not one-off map parity assertions.

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
- No moving internal projection/op envelopes into public Earthlike config.
- No new brittle source-to-source parity tests for compiler-owned behavior.
- No preserving a stale Earthlike path under an ambiguous name.

## Verification Gates

- `bun --cwd mods/mod-swooper-maps test test/config/*.test.ts`
- `bun run openspec -- validate earthlike-config-authority --strict`
- `bun run openspec:validate`
- `git diff --check`
