---
system: mapgen
component: swooper-maps
concern: physics-truth-projection-boundary
status: accepted
date: 2026-02-15
---

# ADR-003: Physics Truth Is Authoritative; Engine Is Projection

## Context

Ecology, hydrology, and placement regressions showed repeated drift between pipeline artifacts and runtime engine state:

- lakes over-placed or rendered dry at runtime,
- resources/wonders/discoveries absent or inconsistent,
- biome projection mismatches with topography truth.

The root issue was split authority: deterministic pipeline plans existed, but engine-side generator or repair behavior could still decide outcomes.

## Decision

Swooper Maps treats pipeline artifacts as the only source of generation truth for scoped surfaces:

- hydrology lake plans are deterministic and sink-driven,
- resource/natural wonder/discovery placement is deterministic and plan-stamped,
- engine random generators for those surfaces are removed from active API surface and execution paths.

Engine integration is projection-only. Drift at contract boundaries is fail-hard.

## Consequences

Positive:

- deterministic replay for the same seed/config,
- clearer debugging (truth artifact vs projection evidence),
- stronger regression detection via hard parity gates.

Costs:

- stricter runtime failures when projection drifts,
- adapter interface breakages for older call sites,
- additional static policy tests/docs maintenance.

## Follow-up

- Keep static scans that ban legacy generator call/module usage in scoped surfaces.
- Keep parity diagnostics layers for visualization even when runtime fails hard.
- Extend this posture to remaining non-ecology/placement randomness in subsequent epics.
