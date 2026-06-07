## Design

This slice consumes exact authorship proof and turns it into final-surface
parity evidence. It does not start from visual intuition.

## Delta Classes

Each final-surface delta must be classified as one of:

- repo-owned policy gap;
- repo-owned pipeline/materialization gap;
- accepted Civ engine materialization policy;
- Studio projection or visualization mismatch;
- direct-control readback limitation;
- product blocker requiring targeted repair.

Unclassified P1/P2 deltas block closure.

## Corpus

Use the existing parity corpus under
`openspec/changes/studio-live-civ7-map-sync/workstream/`. Do not create a new
corpus unless the existing ledger lacks a materialization target required by
this proof.

## Command Path

The proof command is `bun run verify:final-surface-parity`. It accepts either a
Studio Run in Game request id or a status/proof JSON file, validates the
predecessor exact-authorship packet, runs local final terrain/biome/feature and
resource surfaces from the visible Studio source snapshot body, reads the live
full grid through `@civ7/direct-control`, and emits a hashed parity proof with
named unresolved links.

## Review Lanes

- Policy owner review for adapter/map-policy changes.
- MapGen owner review for pipeline/materialization changes.
- Direct-control readback review if full-grid read surfaces are touched.
- Product proof review for delta classification and closure language.
