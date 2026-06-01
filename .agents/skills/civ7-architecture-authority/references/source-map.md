# Source Map

Use this file to decide what can support architecture claims in Civ7 Modding Tools.

## Authority Order

Use this order when sources conflict:

1. Direct current user decisions and explicit repo instructions.
2. Root `AGENTS.md`, closest subtree `AGENTS.md`, and repo process docs.
3. Accepted project baseline artifacts when they explicitly declare the active target for the work:
   - project specs, consolidated packets, decision packets, and review-disposition records under `docs/projects/<project>/`
   - accepted project-local deferrals and triage records
   - for MapGen / Swooper Maps normalization:
     `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
4. Canonical evergreen docs:
   - `docs/PRODUCT.md`
   - `docs/SYSTEM.md`
   - `docs/PROCESS.md`
   - `docs/system/ARCHITECTURE.md`
   - `docs/system/TESTING.md`
5. Canonical domain docs for the affected area:
   - `docs/system/libs/mapgen/MAPGEN.md`
   - `docs/system/libs/mapgen/reference/REFERENCE.md`
   - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
   - `docs/system/libs/mapgen/policies/POLICIES.md`
   - `docs/system/mods/swooper-maps/architecture.md`
   - package-specific docs under `docs/system/**`
6. Accepted decisions and durable deferrals:
   - `docs/system/ADR.md`
   - `docs/system/DEFERRALS.md`
7. Active project notes and review artifacts under `docs/projects/<project>/`, after classifying whether they are accepted baseline, review evidence, or scratch.
8. Current source code, tests, and generated outputs as implementation evidence.
9. Official game resources in `.civ7/outputs/resources` as game-data evidence.
10. OpenSpec artifacts under `openspec/` as downstream change-management
    records unless a completed promotion explicitly makes a spec canonical.
11. External examples, community notes, old branches, archived docs, and chat/session summaries as discovery material only.

## Re-Grounding Procedure

1. Check branch, Graphite stack, dirty state, and untracked files.
2. Read root and closest subtree `AGENTS.md`.
3. Identify which owner row from `ownership-boundaries.md` controls the concern.
4. Read the controlling project baseline and canonical docs for that owner.
5. Classify every input as authority, implementation evidence, game-data evidence, proof observation, stale input, or discovery material.
6. If source evidence conflicts with controlling architecture, update the owning authority record or record a decision/deferral before dependent implementation proceeds.

## Stale Or Excluded Inputs

These cannot support architecture claims until re-grounded:

- Archived docs under `docs/_archive/` or project `_archive/`.
- Old MapGen stage ids and topology notes that canonical docs mark superseded.
- Generated `dist/`, `mod/`, resource outputs, manifests, and package manager lockfiles.
- Local scratch files, generated summaries, or chat carry-forward.
- Current file containers that conflict with accepted docs or decisions.

## Durable Notes

- Current code can reveal behavior, debt, and migration scope. It does not automatically define target ownership.
- Official resources are external facts. The repo still owns how it models, adapts, exposes, and validates those facts.
- OpenSpec tracks implementation movement toward accepted authority. It does not soften architecture decisions or replace the controlling packet by being easier to validate.
- If the repo lacks a durable answer, record the decision or deferral in the appropriate docs rather than encoding the uncertainty as a fallback.
