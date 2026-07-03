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
  `ctx.adapter.isWater`, so its row needed to name adapter/runtime integration
  explicitly before deletion.

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
- changed `utils/water.ts` to adapter/runtime integration evidence and deleted
  the current implementation instead of creating a destination bucket;
- split Narsil raw evidence from interpretation in `evidence/narsil-graph.md`;
- corrected the narrative-domain source count to 36.

Residual risk: KNIP remains suspicion evidence because this repo has no KNIP
config. The implementation slices supplied import/type proof before deletion.

## Post-Execution Review Loop

Status: active review repair

Findings:

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| `synthesis/disposition-table.md` still classified `storyEnabled` as out of packet after Slice 4 removed it. | P1 | accepted | disposition table now records Slice 4 removal for `storyEnabled`, story overlay types, `ExtendedMapContext.overlays`, and `storyKey` helpers |
| `storyKey` / `parseStoryKey` survived as public `@swooper/mapgen-core` helpers after the story network deletion. | P2 | accepted | helpers and their tests removed; residue grep includes `storyKey` and `parseStoryKey` |
| Deleted story-overlay Habitat packets were still represented as live or blocked authority in the canonical matrix, domino receipt, and generated execution-surface map. | P1 | accepted | remediation ledger now has 106 current rows and 22 retired rows; the three story-overlay rule IDs live only in `retiredRules`/historical receipts; execution-surface map was regenerated from the current tree |
| Packet prose still described future Gameplay/story ownership as a current disposition bucket. | P2 | accepted | packet docs now state current source is deleted and future Gameplay story law is context for any new implementation |
| The plan claimed no `structure.toml` work while Slice 3 edited an existing structure rule. | P3 | accepted | wording now distinguishes new generic structure assertions from removing stale narrative scope in the existing `require_domain_ops_root_presence` rule |
| Slice packet updates landed inside implementation commits rather than always preceding them. | P2 | accepted as mechanics deviation | final review repair records the deviation; source proof and Habitat checks rerun at closure |
