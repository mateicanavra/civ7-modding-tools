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
- Runs emit replayable dumps (manifest + binary payloads) keyed by stable ids (run id, plan fingerprint, layer keys).
- MapGen Studio consumes the dump folder and renders it via deck.gl.

Hard rule:
- There must be **exactly one** canonical deck.gl visualization doc. Do not fork competing viz architecture pages.

## Canonical implementation doc

- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Ground truth anchors

- Canonical deck.gl viz doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Viz manifest contract types: `packages/mapgen-viz/src/index.ts`
- Viz dump sink (mod-owned): `mods/mod-swooper-maps/src/dev/viz/dump.ts`

