# Civilization VII Test And Time Update Workstream

Status: `active-draft`.
Branch: `codex/fix-swooper-voronoi-utils-import`.
DRA: `Codex`.
Dates: `2026-05-29 -> active`.

This record captures the MapGen Studio and Swooper Maps impact audit for the
latest Civilization VII Test and Time update snapshot compared with the
checked-in official resources submodule.

## Frame

Objective:

Search the actual changed Civilization VII resources, XML, and JavaScript; identify
what matters for MapGen Studio and Swooper Maps; determine whether current map
generation assumptions remain aligned; and surface anything likely to break
our maps.

Done means:

- The old resource baseline and new update snapshot are identified.
- MapGen Studio data dependencies are checked against changed official data.
- Swooper Maps runtime dependencies are checked against changed official code.
- Breaking risks are either fixed or recorded with concrete evidence.
- Verification commands and residual proof gaps are recorded.

Authority inputs:

- Checked-in resources baseline:
  `.civ7/outputs/resources` at `44faeca` (`Update snapshot 2026-01-24T20:36:54Z`).
- Update snapshot extracted from the local installed game:
  `/tmp/civ7-update-resources-20260529`.
- Swooper router:
  `mods/mod-swooper-maps/AGENTS.md`.
- Repo workflow:
  root `AGENTS.md`, especially Graphite and generated-artifact guidance.

Non-goals:

- Do not hand-edit generated `mod/` output.
- Do not publish the official resources submodule from this workstream.
- Do not claim in-game runtime success without launching Civ VII and loading a map.

Stop/escalation conditions:

- In-game map-load errors after the import-path fix.
- Further upstream module moves in official scripts that affect static imports.
- Decision needed on whether to mirror official `MapSeaLevel` in MapGen Studio UI.

## Work

Plan:

1. Compare old checked-in official resources with the extracted update snapshot.
2. Split findings across map-runtime, XML/data-contract, and MapGen Studio dependency lanes.
3. Fix any concrete Swooper map-load break found during the audit.
4. Verify package checks, Swooper tests, catalog verification, and deployed bundle imports.
5. Record residual alignment items and proof gaps.

Outputs:

- Fixed the Swooper runtime import of `VoronoiUtils`:
  `packages/civ7-adapter/src/civ7-adapter.ts` now imports from
  `/base-standard/scripts/voronoi-utils.js`.
- Updated `@civ7/types` virtual module declarations so `kd-tree.js` only declares
  `kdTree`, and `voronoi-utils.js` declares `VoronoiUtils`.
- Fixed `scripts/placement/verify-manual-catalogs.ts` to compare expected
  discovery hashes in unsigned `u32` form, matching the adapter catalog contract.
- Deployed Swooper Maps to:
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps`.

Evidence:

- Diff size from old resources to update snapshot:
  `3514 files changed, 577892 insertions(+), 311649 deletions(-)`.
- Name-status counts:
  `A=1502`, `D=107`, `M=1779`, plus renames.
- Stable MapGen Studio browser-table inputs:
  `Terrains old=6 new=6 sameOrder=true`;
  `Biomes old=6 new=6 sameOrder=true`;
  `Features old=38 new=38 sameOrder=true`.
- Stable resource IDs:
  `resources.xml old=41 new=41 sameOrder=true`;
  `resources-v2.xml old=14 new=14 sameOrder=true`.
- Stable map dimensions and core map-size rows:
  `MAPSIZE_TINY 60x38`, `MAPSIZE_SMALL 74x46`,
  `MAPSIZE_STANDARD 84x54`, `MAPSIZE_LARGE 96x60`,
  `MAPSIZE_HUGE 106x66`; `PlayersLandmass1/2` and
  `NumNaturalWonders` unchanged.
- Breaking runtime move found:
  old `kd-tree.js` exported `VoronoiUtils`; new `kd-tree.js` does not; new
  `voronoi-utils.js` exports `VoronoiUtils`.
- Deployed bundle verification:
  all installed Swooper map files import
  `/base-standard/scripts/voronoi-utils.js`.

Review findings and disposition:

- Accepted/fixed: `VoronoiUtils` moved out of `kd-tree.js`; static named import
  from the old path would fail module loading before any map script ran.
- Accepted/fixed: manual placement catalog verifier compared signed discovery
  hashes to unsigned adapter constants, making the alignment gate falsely red.
- Accepted/deferred: official setup now includes `SeaLevels` and a `MapSeaLevel`
  parameter for Voronoi-style maps; MapGen Studio and Swooper do not currently
  mirror that official setup surface.
- Accepted/deferred: official `resource-generator.js` now exports
  `wouldCreateCluster` and avoids adjacent resource clustering during placement;
  Swooper calls the official generator in-game, so runtime should inherit this,
  but browser/mock parity may drift.
- Accepted/deferred: new official Voronoi architecture adds `fractal-voronoi.js`,
  `voronoi-utils.js`, map config modules, and rule registries. This is not an
  immediate Swooper break after the import fix, but it is important reference
  material for MapGen Studio parity work.
- Accepted/deferred: natural wonder `Appeal` values changed from `1` to `6`
  for base and supplemental wonders; current placement IDs are stable, but any
  future appeal-aware Studio display/scoring should ingest this.

Verification:

- `bun run --cwd packages/civ7-types check` passed.
- `bun run --cwd packages/civ7-adapter check` passed.
- `bun run --cwd packages/civ7-adapter build` passed.
- `bun run --cwd packages/mapgen-core build` passed.
- `bun run --cwd mods/mod-swooper-maps check` passed.
- `bun run --cwd mods/mod-swooper-maps test` passed:
  `253 pass`, `0 fail`.
- `bun run verify:placement-catalogs` passed.
- `bun run --cwd mods/mod-swooper-maps deploy` passed before this record was
  written; installed bundle import paths were verified afterward.

## Outcome

Objective outcome: `partially achieved`.

The XML/data-contract and static runtime audit is complete enough to identify
the high-confidence break and the main alignment items. The concrete Swooper
module-load break has been fixed and deployed locally. The remaining gap is
runtime proof inside Civilization VII itself.

Residual objective gaps:

- Launch Civ VII and load at least one Swooper map with the deployed mod to
  confirm the updated game runtime accepts the bundle and reaches map generation.
- Decide whether this repo should publish/update the official resources
  submodule from the Test and Time snapshot or continue treating the update
  snapshot as temporary evidence.
- Decide whether MapGen Studio should expose official `MapSeaLevel` parity now,
  or defer it until the Studio map setup surface is broader.
- Decide whether browser/mock resource placement should model the official
  `wouldCreateCluster` resource behavior.

Deferred items:

- MapGen Studio official setup parity: `MapSeaLevel`, `fractal-voronoi`, and
  `shattered-seas-voronoi` config semantics.
- Browser/mock resource parity with official no-adjacent-cluster resource
  placement.
- Supplemental natural-wonder ingestion for DLC/supplemental wonders if Studio
  needs complete wonder catalog visibility.

Next Packet:

1. Inspect `git status --short --branch` and `gt ls --show-untracked --all`.
2. Run or manually perform an in-game smoke of the deployed Swooper Maps mod.
3. If the in-game smoke passes, close this workstream and mark the goal complete.
4. If it fails, inspect Civ VII logs first for unresolved `/base-standard/...`
   module imports or runtime API drift.
