# Project: Coasts By Erosion (No Civ ExpandCoasts)
**Status:** Active
**Timeline:** 2026-02-03 -> TBD
**Teams:** MapGen / Swooper Maps

## Scope & Objectives
- Remove Civ7 "coast expansion" (`expandCoasts`) from our pipeline.
- Stamp `TERRAIN_COAST` deterministically from Morphology truth (erosion/coastline shaping), not from Civ helpers.
- Document Civ7 coastal/ocean semantics and align our implementation to those semantics.

## Deliverables
- [ ] `plot-coasts` no longer calls `adapter.expandCoasts`.
- [ ] `plot-coasts` stamps `TERRAIN_COAST` in a sensible, truth-driven way (shallow water adjacent to land).
- [ ] Scratchpad notes capturing Civ7 semantics and the real-world analogue (why coasts form where they do).

## Links & References
- Scratchpad: `docs/projects/coasts-by-erosion/scratchpad.md`
- Engine terrain definitions: `.civ7/outputs/resources/Base/modules/base-standard/data/terrain.xml`
- Official coast expansion helper: `.civ7/outputs/resources/Base/modules/base-standard/maps/elevation-terrain-generator.js`
