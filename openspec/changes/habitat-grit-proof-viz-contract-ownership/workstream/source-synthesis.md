# Source Synthesis - Viz Contract Ownership

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-viz-contract-ownership` as enforced `grit-check`, scoped to standard recipe stage visualization files, forbidding shared `steps/viz.ts` hubs or cross-step private viz imports. | Registry authority only; not proof of wrapper behavior. |
| `mods/mod-swooper-maps/AGENTS.md` and `mods/mod-swooper-maps/src/AGENTS.md` | Swooper source is the game-facing MapGen mod; generated `mod/` output is read-only, and source edits require package-local build/check validation. | Router only; this row does not edit Swooper source. |
| `openspec/specs/mapgen-normalization-workstreams/spec.md` | Standard recipe visualization contracts live at nearest real owner: stage surface for shared helpers, owning step only for private helpers; guardrails reject private-step visualization hubs or cross-step imports. | Normative architecture authority for the row; not Grit proof by itself. |
| `docs/projects/habitat-harness/discrepancy-log.md` | DL-7 records visualization contract ownership guardrail documentation debt. | Discrepancy remains open; this row does not update evergreen Swooper docs. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive shared viz hub/private cross-step import probes, negative stage-local viz contract controls, current stage scan, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Design seed has 1 match and 1 ignore, with parser-edge and false-positive classification pending. | Aggregate row to align after proof is gathered. |

## Current Predicate

The current Grit predicate reports:

- any `program` whose filename matches
  `.*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/steps/viz\.ts$`;
- import declarations whose resolved source matches
  `stages/<stage>/steps/viz`;
- import declarations whose source starts `../` and whose resolved source
  matches `stages/<stage>/steps/<step>/viz`.

The native fixture currently proves only the `steps/viz.ts` file branch. Import
probes in the match fixture did not produce native matches and are recorded as
`VCO-IMPORT-PREDICATE-GAP-2026-06-15`.

## Fixture Plan

Positive/current-predicate classes:

- shared `stages/<stage>/steps/viz.ts` hub file.

Predicate-gap probes:

- import resolving to `stages/<stage>/steps/viz`;
- cross-step private import resolving to `stages/<stage>/steps/<step>/viz`;
- live-style same-stage cross-step import using `./<step>/viz.js`.

Controls and parser-edge classifications:

- stage-level `stages/<stage>/viz.ts` file and imports;
- same-step private `./viz.js` imports;
- browser-test recipe paths;
- `.tsx` paths;
- source strings;
- dynamic imports;
- package paths.

## Inventory Plan

Run a TypeScript parser inventory over:

- `mods/mod-swooper-maps/src/recipes/standard/stages`

Exclusions:

- `node_modules`
- `dist`
- `mod`

Durable records include scan root, exclusions, file counts, actual current
predicate counts, stage-root directory/file counts, stage-level viz controls,
private step-viz files, import/export counts, live intended findings, proof ids,
blockers, and explicit non-claims. Stdout or scratch files are not durable
proof.

Current checkpoint counts:

- 216 scanned TS/TSX/JSON files, all `.ts`.
- 212 actual current-predicate `.ts` files and 0 actual current-predicate `.tsx`
  files.
- 19 immediate stage directories, 23 immediate stage-root entries, and 4
  immediate stage-root files:
  `ecology-public-config.ts`, `hydrology-public-config.ts`,
  `map-projection-public-config.ts`, and `placement-public-config.ts`.
- 25 nested step directories.
- 0 `stages/<stage>/steps/viz.ts` hub files.
- 3 stage-level `viz.ts` files.
- 3 private step `viz.ts` files.
- 785 all-stage-root import declarations and 39 all-stage-root export-from
  declarations.
- 776 current-predicate import declarations and 39 current-predicate
  export-from declarations.
- 0 dynamic imports.
- 20 stage-level viz imports.
- 0 step-hub viz imports.
- 1 private step-viz cross-step import: a same-stage different-step import.
- 2 same-step private viz imports.
- 0 different-stage private viz imports.
- 0 source lookalikes.
- 0 parse diagnostics.

Live intended finding:

- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts:7`
  imports `./plot-biomes/viz.js`, resolving to
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-biomes/viz.js`.

This finding is live parser evidence for the row intent and remains blocked by
source-owner disposition, predicate repair, or separate remediation/apply proof.
It is not clean native current-predicate closure.
