## Why

Current generated maps show only a minority of resources. The planning slice
identified the root-cause lead: `placement/plan-resources` chooses exact numeric
resource intents from a generic environmental signature, then
`adapter.placeResourceIntent()` asks Civ7 whether that exact resource can exist
on that exact tile. Rejected intents are counted only in aggregate, so local
tests and runtime logs cannot yet prove whether the collapse is caused by
`cannot-have-resource` feasibility rejections, numeric-id drift, or another
placement boundary.

## Target Authority Refs

- `openspec/changes/resource-distribution-planning`: downstream slice map and
  resource telemetry requirements.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`: D4
  typed placement reconciliation; adapter owns engine feasibility and readback.
- `mods/mod-swooper-maps/AGENTS.md`: placement domain follows op-per-concern;
  placement steps materialize product effects.
- `.civ7/outputs/resources/Base/modules/base-standard/data/resources.xml` and
  `resources-v2.xml`: static official resource facts, not runtime numeric-id
  proof.

## What Changes

- Extend the existing resource placement outcome artifact with grouped
  diagnostics by adapter numeric resource id and rejection/mismatch reason.
- Expose those diagnostics through the world-balance stats helper so later
  stats gates and runtime proof can consume a stable surface.
- Add focused tests proving grouped resource outcome summaries and world-balance
  diagnostic consistency.
- Record that numeric resource ids are still adapter/runtime ids until a
  downstream corpus/runtime verification slice proves `GameInfo.Resources`
  ordering.

## Explicit Non-Goals

- No resource strategy tuning.
- No resource-stage topology changes.
- No resource corpus contract or symbolic id verification.
- No generated output, `.civ7` resource edits, lockfile edits, or official-data
  changes.
- No claim that local mock-adapter acceptance proves live Civ7 feasibility.
- No lotus-as-resource proof; lotus remains a feature proof lane.

## Verification Gates

- `bun run --cwd mods/mod-swooper-maps test -- test/placement/resource-placement-diagnostics.test.ts`
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/world-balance-stats.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate resource-distribution-root-cause --strict`
- `bun run openspec:validate`
- `git diff --check`
