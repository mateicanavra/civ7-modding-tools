## Why

D1 is a public recipe config contract decision, not just boilerplate cleanup.
Current source, presets, tests, and Studio assumptions still use persisted
`advanced.<stepId>` wrappers in several places. The train needs one bounded
change that migrates the public authoring surface to the accepted flat default:
`{ knobs?, [stepId]?: stepConfig }`.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  D1, Problem Layer 2, Domino 1, Guardrail G9.
- `openspec/config.yaml`: default stage config is flat and persisted
  SDK-native `advanced` wrappers are not accepted.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: product surface
  and import policy are early slices.

## What Changes

- Delete boilerplate `public.advanced` unwrap compiles from standard stages
  that only mirror step config.
- Preserve `public + compile` only where the public surface genuinely differs
  from internal step config.
- Migrate standard map configs, presets, tests, examples, and Studio config
  assumptions from persisted `advanced.<stepId>` to top-level step IDs.
- Tighten derived flat stage schemas where feasible so step keys are validated
  by the recipe config surface rather than by late compile validation alone.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: clarifies D1 as the canonical recipe
  config migration slice with Studio, preset, docs, and schema fallout.

## Dependencies

- Requires: `normalize-authority-routing`.
- Enables parallel work: import-boundary remediation, Studio/core DX cleanup,
  ecology topology, projection/lake work, and later guardrail G9.

## Forbidden Non-Goals

- No persisted SDK-native `advanced` wrapper.
- No compatibility lane that supports both flat and `advanced` config shapes.
- No ecology stage topology migration except callsite fallout caused by config
  key migration.
- No projection, lake, placement, or import guardrail work beyond what is
  necessary to keep the config migration compiling.
- No generated artifact hand edits.

## Impact

- Affected owners: MapGen authoring SDK, Swooper standard recipe stages,
  Studio config UI/schema, presets/configs, config docs, config tests.
- Expected write set:
  - `packages/mapgen-core/src/authoring/**`
  - standard stage `index.ts` files with boilerplate `advanced` unwraps
  - `mods/mod-swooper-maps/src/maps/configs/**`
  - `mods/mod-swooper-maps/src/presets/**`
  - `mods/mod-swooper-maps/test/**`
  - `apps/mapgen-studio/src/**` config/schema/default handling
  - config examples and how-to docs
- Protected paths: ecology topology files except config fallout, placement
  implementation, adapter projection, generated `dist/` and `mod/`.
- Stop conditions:
  - a stage needs a genuine public transform not captured by the flat default;
  - Studio cannot represent flat step overrides without a separate SDK/source
    contract change;
  - external consumer compatibility must be preserved but no authority record
    accepts a dual-shape migration.
- Verification gates:
  - focused authoring/config tests;
  - Swooper config/preset tests;
  - Studio config/schema tests or typecheck;
  - search proving no active persisted `advanced.<stepId>` wrappers remain
    except historical/archive prose or genuine public transforms;
  - `bun run openspec -- validate normalize-config-surface --strict`;
  - `bun run openspec:validate`;
  - `git diff --check`.
