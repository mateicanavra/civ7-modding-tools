# Review Findings

Status: review ledger

This file records fresh review findings and steward disposition for the
narrative liveness and ownership decision packet.

## Review Scope

Reviewers check:

- row-level coverage for every narrative-domain file;
- collars for barrels, recipe/stage wiring, tests, placement/runtime name
  collisions, and public config;
- Narsil and KNIP evidence capture;
- separation of raw evidence from interpretation;
- destination invention, generic buckets, and current-path authority;
- whether the packet answers the selected prework decision.

## Findings

### Adversarial Reviewer

P1 accepted and fixed:

- File-level barrel rows hid symbol-level disposition splits in
  `mods/mod-swooper-maps/src/domain/narrative/index.ts` and
  `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts`.

P2 accepted and fixed:

- Hydrology stage artifact descriptions referenced Narrative as a downstream
  consumer/bias target but were missing from collar rows.
- `mods/mod-swooper-maps/src/domain/narrative/utils/water.ts` used
  `ctx.adapter.isWater`, so its later owner row needed to name adapter/runtime
  integration explicitly.

P3 accepted and fixed:

- Source count was stale; current tree has 36 narrative-domain files.

### Process And Preservation Reviewer

P1: none.

P2 accepted and fixed:

- Runtime/control and placement name-collision collars needed exact rows rather
  than broad package or glob references.
- Narsil evidence needed raw returned evidence separated from interpretation.

P3 accepted and fixed:

- Source count was stale; current tree has 36 narrative-domain files.

## Steward Disposition

All reviewer findings were accepted. Packet edits applied:

- added symbol-level barrel splits to `synthesis/disposition-table.md`;
- added exact runtime/control, placement, and hydrology collar rows to
  `corpus/narrative-source-inventory.md` and
  `synthesis/disposition-table.md`;
- changed `utils/water.ts` to adapter/runtime integration ownership under the
  later Gameplay/story-artifact decision;
- split Narsil raw evidence from interpretation in `evidence/narsil-graph.md`;
- corrected the narrative-domain source count to 36.

Residual risk: KNIP remains suspicion evidence because this repo has no KNIP
config. Deletion-ready rows still require import/type proof in the later
implementation slice.
