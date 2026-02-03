# PROJECT: pipeline-realism

**Status:** Planned

## Scope & Objectives

This project exists to plan (and later execute) a **fresh refactor of the mapgen pipeline “Foundation” stage** into an **evolutionary physics model**, starting from a basaltic lid over a mantle, with explicit control over:

- history / iteration steps
- plate partitions and motions
- tectonic simulation (to the extent scoped by the proposal docs)

Primary output (near-term): a reconciled, actionable design packet that is clearly positioned relative to the current codebase.

## Deliverables

- [ ] Consolidated proposal packets under `docs/projects/pipeline-realism/resources/packets/`
- [ ] A synthesis doc that reconciles packet differences + identifies “target vs current” gaps
- [ ] A refactor plan (milestones + issues) for landing the new Foundation model

## Packets (Imported Sources)

All proposal/spike source sets are kept in self-contained packet directories:

- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/`
  - Imported from commit `338e7af49faf2e8167d2fe04d4474a1a395e82b0` (historical PR; not mergeable).
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/`
  - Imported from commit `daba582314c0569ac1cc902b3c22facae48480e7` (proposal + supporting specs previously under `docs/system/libs/mapgen/_archive/`).
- `docs/projects/pipeline-realism/resources/packets/realism-packet/`
  - Working reconciliation notes that position the proposal sets vs the current codebase and the “foundation realism spike” docs.
- `docs/projects/pipeline-realism/resources/packets/m11-foundation-realism-spike/`
  - Pointer to the recent “Foundation realism” spike set (audit + observability + guardrails).
- `docs/projects/pipeline-realism/resources/packets/phase2-foundation-vertical-refactor/`
  - Pointer to Phase-2 contract/migration posture docs for landing big Foundation changes safely.

## Project Hygiene

- Follow-ups that are real but unscheduled go in `docs/projects/pipeline-realism/triage.md`.
- Intentional deferrals/tradeoffs go in `docs/projects/pipeline-realism/deferrals.md` (with triggers).
