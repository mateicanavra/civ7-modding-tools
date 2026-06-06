## Why

Swooper Earthlike regressed after parallel recovery work: maps could run while
resource spread, natural wonders, rivers/floodplains, and mountain morphology
no longer matched the previously tuned product intent. The visible failure was
not one isolated knob. It crossed ownership boundaries: placement-like code was
holding ecology outcomes, map-river readback risked becoming authority, and
mountain tests were measuring spines more than the broader physically grounded
mountain regions the product requires.

## Target Authority Refs

- Root `AGENTS.md`: update adjacent docs/tests, use Graphite, leave the repo
  clean, and regenerate generated artifacts rather than hand-editing them.
- `mods/mod-swooper-maps/AGENTS.md`: ecology owns feature authoring such as
  floodplains; placement may consume those surfaces but must not author them.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  MapGen pipeline operations own domain truth; projection/readback boundaries
  do not replace upstream authoring authority.
- Direct product direction: the pipeline remains the source of truth for map
  placement and ecology; Civ7 policy is used to prevent auto-fixes, and Civ7
  readback is diagnostic proof rather than an input authority.

## What Changes

- Recover prior resource, natural-wonder, river/floodplain, and mountain-region
  behavior semantically from current worktrees/branches instead of replaying
  whole stale branches.
- Move floodplain/river-dependent feature scoring behind the authored river
  projection, while keeping placement as a consumer only.
- Publish MapGen-authored navigable-river truth separately from Civ engine
  readback so downstream ecology uses pipeline truth and readback remains a
  mismatch detector.
- Extend mountain-region metrics/tests to measure long, wide, internally varied
  regions with ridges, foothills, rough land, and flat passages, not only spine
  length.
- Rebaseline generated map artifacts and legacy compiled fixtures through
  scripts after source config/schema changes.

## Forbidden Non-Goals

- No dual legacy paths, compatibility fallbacks, or hand-authored official Civ
  data.
- No using Civ engine readback as the source of truth for ecology, resources,
  terrain, or placement.
- No artificial mountain walls that only satisfy spine-length metrics.
- No generated-output hand edits.

## Verification Gates

- OpenSpec validation for this change and the full repo OpenSpec set.
- Focused ecology, river, topology, and recipe-order tests.
- Mountain-region morphology tests and world-balance terrain stats over stable
  seeds.
- Resource and natural-wonder policy/distribution tests.
- Regenerated shipped-map artifacts and rebaselined compiled fixtures.
- `git diff --check`.
