# Source Synthesis - Viz Contract Ownership

## Sources Read

| Source | Row fact | Boundary |
| --- | --- | --- |
| `tools/habitat-harness/src/rules/rules.json` | Registers `grit-viz-contract-ownership` as enforced `grit-check`, scoped to standard recipe stage visualization files, forbidding shared `steps/viz.ts` hubs or cross-step private viz imports. | Registry authority only; not proof of wrapper behavior. |
| `mods/mod-swooper-maps/AGENTS.md` and `mods/mod-swooper-maps/src/AGENTS.md` | Swooper source is the game-facing MapGen mod; generated `mod/` output is read-only, and source edits require package-local build/check validation. | Source-router authority for the remediation proof floor; not proof by itself. |
| `openspec/specs/mapgen-normalization-workstreams/spec.md` | Standard recipe visualization contracts live at nearest real owner: stage surface for shared helpers, owning step only for private helpers; guardrails reject private-step visualization hubs or cross-step imports. | Normative architecture authority for the row; not Grit proof by itself. |
| `docs/projects/habitat-harness/discrepancy-log.md` | DL-7 records visualization contract ownership guardrail documentation debt. | Discrepancy remains open; this row does not update evergreen Swooper docs. |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Candidate row requests positive shared viz hub/private cross-step import probes, negative stage-local viz contract controls, current stage scan, and non-apply disposition. | Aggregate row to align after proof is gathered. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Prior aggregate row recorded native import predicate gap and one live private-viz import blocker. | Aggregate row to align after closure proof is gathered. |

## Predicate Repair

The repaired Grit predicate reports:

- any `program` whose filename matches
  `.*mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/steps/viz\.ts$`;
- `import_statement(source=$source)` from standard stage `.ts` files whose
  source literal is `../steps/viz.js` or `../steps/viz.ts`;
- `import_statement(source=$source)` from immediate step `.ts` files whose
  source literal is `./<step>/viz.js` or `./<step>/viz.ts`;
- `import_statement(source=$source)` from nested step `.ts` files whose source
  literal is `../<step>/viz.js` or `../<step>/viz.ts`.

The row intentionally uses source-shape guards for these static import classes
because the prior snippet/`resolve(path=$source)` predicate did not produce
native import matches in this repository's Grit runtime.

## Source Remediation

Live pre-repair finding:

- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`
  imported `./plot-biomes/viz.js`, resolving to a private step-viz helper in a
  different step path.

Row-owned remediation:

- create `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/viz.ts`
  as the nearest stage-level owner surface for the shared biome-id visualization
  categories;
- delete the former private helper
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-biomes/viz.ts`;
- update `plotBiomes.ts` and `mods/mod-swooper-maps/test/ecology/plot-biomes-viz-meta.test.ts`
  to import the stage owner surface.

The remediation does not edit generated output and does not claim product/runtime
behavior; it only moves a shared visualization helper to the accepted owner
surface.

## Fixture Plan

Positive/current-predicate classes:

- shared `stages/<stage>/steps/viz.ts` hub file;
- named/default static import from `../steps/viz.js`;
- side-effect static import from `../steps/viz.js`;
- named/default static import from `./<step>/viz.js` in an immediate step file;
- side-effect static import from `./<step>/viz.js` in an immediate step file;
- named/default static import from `../<step>/viz.js` in a nested step file.

Controls and parser-edge classifications:

- stage-level `stages/<stage>/viz.ts` file and imports;
- same-step private `./viz.js` imports;
- other-stage stage-level `../../<stage>/viz.js` imports;
- browser-test recipe paths;
- `.tsx` paths;
- source strings;
- dynamic imports;
- package paths.

## Inventory Result

The post-remediation parser inventory over
`mods/mod-swooper-maps/src/recipes/standard/stages`, excluding `node_modules`,
`dist`, and `mod`, records:

- 216 scanned TS/TSX/JSON files, all `.ts`.
- 212 actual current-predicate `.ts` files and 0 `.tsx`.
- 23 immediate stage directories, 57 immediate stage-root entries, and 39
  immediate stage-root files.
- 25 nested step directories.
- 0 `stages/<stage>/steps/viz.ts` hub files.
- 4 stage-level `viz.ts` files, including the new `map-ecology/viz.ts`.
- 2 private step `viz.ts` files.
- 785 all-stage-root import declarations and 39 all-stage-root export-from
  declarations.
- 776 current-predicate import declarations and 39 current-predicate
  export-from declarations.
- 0 dynamic imports.
- 21 stage-level viz imports.
- 0 step-hub viz imports.
- 0 private step-viz cross-step imports.
- 2 same-step private viz imports.
- 0 same-stage different-step private viz imports.
- 0 different-stage private viz imports.
- 0 current VCO matches.
- 23 source lookalikes.
- 0 parse diagnostics.

Stdout or scratch files are not durable proof; these counts are recorded in the
packet and aggregate proof records.
