## Why

The planning slice established that resources may become their own stage when
they have real authoring, input/handoff, placement, enablement, trace, helper,
or projection surfaces. The root-cause slice made the current resource collapse
observable, but current topology still leaves resource planning and
materialization embedded in the broad `placement` stage. That shape is not
strong enough for the requested end state: every official resource needs
explicit earthlike strategy coverage, per-resource expected ranges, and runtime
proof.

This slice records the target architecture and migration plan for a dedicated
`resources` stage. It does not move code yet.

## Target Authority Refs

- Direct user correction: resources can be a stage; resource groups can become
  steps when related input/output artifacts exist.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  stage promotion rule and D3/D4 placement reconciliation rules.
- `openspec/changes/resource-distribution-planning`: resource-stage requirement
  and group-step acceptance rule.
- `openspec/changes/resource-distribution-root-cause`: diagnostic-only
  telemetry by adapter numeric resource id and reason.
- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/index.ts`:
  current implementation evidence.

## What Changes

- Accept `resources` as the target stage for resource corpus, resource scoring,
  resource group planning, resource materialization, and resource distribution
  summaries.
- Define the required artifacts and handoffs that make the stage real rather
  than a folder rename.
- Define which current `placement` responsibilities must move or split in later
  implementation slices.
- Define the criteria for resource group steps and the migration sequence that
  preserves current behavior while opening per-resource strategy batches.

## Explicit Non-Goals

- No stage topology or recipe code changes in this slice.
- No resource strategy tuning.
- No corpus implementation or runtime id verification.
- No generated output, `.civ7` edits, lockfile edits, or official-data changes.
- No resource group step becomes accepted without consumed inputs, published
  output, invariant, downstream consumer, and verification boundary.

## Verification Gates

- `bun run openspec -- validate resource-stage-architecture --strict`
- `bun run openspec:validate`
- `git diff --check`
