# PROJECT: pipeline-realism

**Status:** Active

## Scope & Objectives

This project owns the “pipeline realism” refactor program:

1. **Maximal physics cutover** for the mapgen pipeline spine (Foundation -> Morphology), eliminating legacy/shadow paths.
2. **Downstream domain alignment** milestones that keep later stages compatible with the target architecture and the new upstream truth surfaces.

The work started with a fresh refactor of the mapgen pipeline **Foundation** stage into an **evolutionary physics model**, starting from a basaltic lid over a mantle, with explicit control over:

- history / iteration steps
- plate partitions and motions
- tectonic simulation (to the extent scoped by the proposal docs)

## Milestones

- M1 (spine cutover): `docs/projects/pipeline-realism/milestones/M1-foundation-maximal-cutover.md`
- M2 (downstream alignment, behavior-preserving): `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`

## Deliverables

- [ ] Consolidated proposal packets under `docs/projects/pipeline-realism/resources/packets/`
- [ ] A synthesis doc that reconciles packet differences + identifies “target vs current” gaps
- [ ] A refactor plan (milestones + issues) for landing the new Foundation model and required downstream alignment work

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
