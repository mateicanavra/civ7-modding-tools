<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract (what must stay stable)"/>
  <item id="canon" title="Canonical implementation doc"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Visualization (contract + routing)

## Purpose

Define the canonical visualization contract and route readers to the single canonical deck.gl visualization doc.

## Contract (what must stay stable)

- Visualization is **external** to the pipeline runtime (pipeline does not depend on deck.gl).
- Runs may emit streaming layer events and/or replayable dumps (manifest + binary payloads), keyed by stable ids (`runId` (currently == `planFingerprint`), and layer keys).
- MapGen Studio renders visualization via deck.gl:
  - live runs consume streamed layer upserts (`viz.layer.upsert`),
  - dump viewer workflows consume dump folders (when produced).

Hard rule:
- There must be **exactly one** canonical deck.gl visualization doc. Do not fork competing viz architecture pages.

## Canonical implementation doc

- [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

## Ground truth anchors

- Canonical deck.gl viz doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Viz manifest contract types: `packages/mapgen-viz/src/index.ts`
- Viz dump sink (mod-owned): `mods/mod-swooper-maps/src/dev/viz/dump.ts`
