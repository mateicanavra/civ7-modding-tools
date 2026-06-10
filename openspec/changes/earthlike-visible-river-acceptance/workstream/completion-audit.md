# Completion Audit

Date: 2026-06-09; updated 2026-06-10 for native river modeling

This audit maps the active river/lake objective to current evidence on
`codex/mapgen-physical-rivers`. It is intentionally stricter than the task list:
items are only marked proved when current source, generated artifacts, tests,
or live proof establish the requirement.

## Proved

| Requirement | Evidence |
| --- | --- |
| Isolated Graphite branch/worktree off main | Branch stack now includes `codex/map-rivers-native-modeling-restored` in a separate clean worktree. This proves isolation only, not closure readiness. |
| Diagnose why rivers were not stamped | `proposal.md`, `phase-record.md`, resource evidence, and 2026-06-10 runtime proof classify the issue: direct terrain stamping alone can leave Civ river metadata at zero; the official bulk `TerrainBuilder.modelRivers(...)` sequence creates river metadata/model objects, including minor and navigable river rows, when called after authored terrain stamping. Exact authored-topology parity and rendered product visibility remain open. |
| Ground diagnosis in repo code and history | `phase-record.md` and `workstream/history-evidence.md` record exact semantic-history commands and representative commits for the lineage from `TerrainBuilder.modelRivers`/cache refresh through MapGen-owned projection, lake truth normalization, and `@civ7/map-policy` constants. |
| Ground diagnosis in official resources, installed app, and Narsil | `resource-evidence.md` records resource sync, installed-app checksum spot checks, Narsil index cross-check caveats, exact official river callsite search, and the absence of a public `setRiverValidationValues` callsite. |
| Ground physical benchmark design in Earth hydrology | `workstream/physical-grounding.md` maps the benchmark suite to watershed routing, confluence accumulation, rain-shadow runoff asymmetry, and closed/terminal basin expectations with USGS/AMS/NOAA source anchors. |
| Use direct-control / map query tools | `@civ7/direct-control` hydrology facts expose `riverType`, `river`, and `navigableRiver`; `verify-final-surface-parity.ts` and `probe-river-writer.ts` use live readback. |
| Separate hydrology truth, projection, Studio display, and Civ metadata | `map-rivers` publishes planned minor, planned major, projected navigable, terrain readback, metadata/API readback, and mismatch artifacts; `live-parity.ts` emits `riverMetadataParity` as a distinct proof class. |
| Handle minor rivers honestly | Hydrology-owned `RIVER_CLASS_MINOR` remains planned minor-river intent and is not promoted to navigable terrain. Per-tile minor stamping remains unproven; bulk native modeling now creates minor-river metadata, but product claims require same-run parity classification against Hydrology truth. |
| Selected projected navigable trunks are materialized | Earlier same-run proof `studio-run-in-game-mq6c38rf-n2p` reports planned major `149`, selected projected navigable terrain `6`, live `TERRAIN_NAVIGABLE_RIVER=6`, and terrain mismatch count `0`. Current branch live readback after native modeling recorded `terrainNavigableRiver=82`, `river=202`, `navigableRiver=68`, and `minorRiver=134` on one run. This does not claim every planned major river tile becomes Civ-visible terrain or that native-added river objects all match Hydrology truth. |
| Physical benchmark tests cover lake/river coupling | `physical-grounding.md` maps the Earth-hydrology expectations to the benchmark suite. Physical benchmark tests cover watershed routing, confluences, rain shadows, endorheic basins, saddle/lake-chain admission, lakeiness/topology decoupling, and river routing invariants. |
| Accepted lake tiles survive final placement readback | Same-run proof `studio-run-in-game-mq6c38rf-n2p` records final accepted lake readback with `acceptedLakeTileCount=63`, `finalLakeWaterDriftCount=0`, and `finalLakeClassificationDriftCount=0`, proving accepted lake tiles stayed water/lake classified through the final placement surface boundary. `live-parity.ts` now emits `lakeReadbackParity`; current exact-authorship logs are explicitly marked `missing-exact-log`, and future exact/local lake counter drift blocks as `lake-readback.mismatch`. |
| Preserve shared Civ constants | `@civ7/map-policy` owns the reviewed river metadata source and exports `NO_RIVER=-1`, `RIVER_MINOR=0`, and `RIVER_NAVIGABLE=1`; the Civ7 table generator consumes that source for the Studio catalog, the map-policy catalog, and `@civ7/types/generated/river-types.gen.d.ts`; adapter internals, mock adapter, direct-control API fixtures, and direct-control probe fixtures consume the shared constants without adapter river-constant re-exports. |
| Expose knobs only where they decouple coupled config | `map-rivers.knobs.navigableRiverDensity` decouples Civ-visible trunk projection from Hydrology `riverDensity`; `map-rivers.knobs.riverDensity` remains a legacy alias for proof-bound configs, duplicate alias/current values are accepted, conflicting alias/current values fail recipe compilation, and shipped/catalog config tests keep legacy alias use allowlisted to the proof-bound configs. |
| Keep proof freshness for shipped Earthlike config | Generated `swooper-earthlike.ts` currently records config hash `1fc12b546705f96d39a4ae07dae201624a689477fe248efea245dac3cd0c0ee0`, matching the saved same-run river and floodplain proof inputs. |
| Adopt the mountain patch comparison config | The generated map catalog includes `mountain-patch` and `mountain-rivers-patch`; the comparison config keeps the mountain terrain/climate package and uses explicit `map-rivers.knobs.navigableRiverDensity` for visible-river projection. |
| Guard Studio display parity | `test/pipeline/viz-emissions.test.ts` requires separated Studio layers for projected navigable, planned minor, planned major, raw engine terrain readback, debug engine navigable metadata readback, terrain mismatch, and engine minor metadata readback surfaces. |
| Avoid generated-output hand edits | Map config generated artifacts, including `swooper-earthlike`, `mountain-patch`, and `mountain-rivers-patch`, are produced by `bun run --cwd mods/mod-swooper-maps gen:maps`; built Civ map scripts are produced by `bun run --cwd mods/mod-swooper-maps build`. On 2026-06-09, both `gen:maps` and `build` completed, and `git diff --exit-code -- mods/mod-swooper-maps/src/maps/generated mods/mod-swooper-maps/mod mods/mod-swooper-maps/dist` returned clean. |

## Latest Validation Sweep

Recorded 2026-06-09 on `codex/mapgen-physical-rivers`; post-restack validation
is still required before closure.

| Command | Result |
| --- | --- |
| `bun run --cwd mods/mod-swooper-maps gen:maps` | Passed; generated 6 map configs. |
| `bun run --cwd mods/mod-swooper-maps build` | Passed; rebuilt 6 Civ map scripts. |
| `git diff --exit-code -- mods/mod-swooper-maps/src/maps/generated mods/mod-swooper-maps/mod mods/mod-swooper-maps/dist` | Passed; generated/build outputs were idempotent. |
| `bun run --cwd mods/mod-swooper-maps test -- test/config/maps-schema-valid.test.ts test/config/standard-authoring-surface-guards.test.ts test/build/map-bundle-runtime-imports.test.ts` | Passed: 45 tests, 0 failed; includes the shipped/catalog config guard that limits legacy `map-rivers.knobs.riverDensity` use to proof-bound configs. |
| `bun run --cwd mods/mod-swooper-maps test -- test/diagnostics/live-parity.test.ts test/hydrology-physical-benchmarks.test.ts test/hydrology-knobs.test.ts test/map-rivers/navigable-river-materialization.test.ts test/map-rivers/plot-rivers-post-refresh.test.ts test/placement/placement-lake-readback.test.ts` | Passed: 42 tests, 0 failed. |
| `bun run --cwd mods/mod-swooper-maps test -- test/hydrology-knobs.test.ts test/standard-compile-errors.test.ts` | Passed: 34 tests, 0 failed; verifies duplicate alias/current map-rivers density values remain compatible while conflicting values fail compilation. |
| `bun run --cwd mods/mod-swooper-maps check` | Passed. |
| `bun run --cwd mods/mod-swooper-maps test -- test/ecology/op-contracts.test.ts test/ecology/floodplain-feature-product-row.test.ts test/map-rivers/navigable-river-materialization.test.ts test/map-rivers/plot-rivers-post-refresh.test.ts test/standard-run.test.ts` | Passed: 31 tests, 0 failed; includes minor-river adjacency versus projected navigable terrain separation for ecology substrate consumers. |
| `bun run --cwd mods/mod-swooper-maps check` after downstream river-class helper adoption | Passed. |
| `bun run --cwd packages/civ7-map-policy test` | Passed: 8 tests, 0 failed; includes generated map-policy/Studio/ambient-types river metadata parity. |
| `bun run --cwd packages/civ7-types check` | Passed. |
| `bun run --cwd packages/civ7-map-policy check` | Passed. |
| `bun run --cwd packages/civ7-map-policy build` | Passed. |
| `bun run --cwd apps/mapgen-studio test -- test/viz/dataTypeModel.test.ts` | Passed: 3 tests, 0 failed; verifies the Studio data-type model keeps default river proof layers inspectable while hiding metadata/mismatch diagnostics until debug layers are enabled, and feeds actual packaged `standard` recipe emissions through the Studio worker trace/viz bridge so stale recipe artifacts cannot silently drop the river metadata layer. |
| `bun run --cwd apps/mapgen-studio check` | Passed; package-local Studio `check` and `test` now run `ensure-studio-recipe-artifacts.mjs` before consuming generated recipe/package exports, matching the Turbo dependency and preventing stale ignored `dist/recipes/*` artifacts from weakening Studio display parity. A forced-stale concurrent package-local `test`/`check` rerun serialized the recipe-artifact rebuild through the preflight lock: one command rebuilt, the other re-checked after the lock and continued without a second rebuild. Dead-owner stale-lock recovery was also exercised with a fake old `owner.json` pid and reaped before rebuilding; live-owner stale locks are preserved by pid liveness checks. `generate-map-artifacts.ts` also keeps generated-entry cleanup idempotent with `rm(..., { force: true })`. |
| `bun test packages/civ7-adapter/test/civ7-river-projection.test.ts packages/civ7-adapter/test/mock-terrain-policy.test.ts mods/mod-swooper-maps/test/map-rivers/navigable-river-materialization.test.ts mods/mod-swooper-maps/test/map-rivers/plot-rivers-post-refresh.test.ts mods/mod-swooper-maps/test/hydrology-project-river-network.test.ts` | Passed: 15 tests, 0 failed; verifies terrain-vs-metadata readback separation and hydrology-owned river-class constants across projection. |
| `bun run --cwd packages/civ7-adapter check` | Passed. |
| `bun run --cwd packages/civ7-adapter build` | Passed. |
| `bun run --cwd packages/civ7-direct-control test` | Passed: 41 tests, 0 failed; direct-control hydrology fixtures consume shared `NO_RIVER_TYPE`. |
| `bun run --cwd packages/civ7-direct-control check` | Passed. |
| `bun test scripts/civ7-direct-control/probe-river-writer.test.ts scripts/civ7-direct-control/verify-final-surface-parity.test.ts scripts/civ7-direct-control/verify-terrain-edge-live-context.test.ts` and `bun run --cwd mods/mod-swooper-maps test -- test/diagnostics/live-parity.test.ts` | Passed; direct-control and live-parity diagnostic fixtures consume the shared map-policy river metadata constants and navigable-river terrain index. |
| `bun test scripts/civ7-direct-control/probe-river-writer.test.ts scripts/civ7-direct-control/verify-final-surface-parity.test.ts scripts/civ7-direct-control/verify-terrain-edge-live-context.test.ts` after downstream river-class helper adoption | Passed: 7 tests, 0 failed. |
| `bun test packages/civ7-adapter/test/civ7-river-projection.test.ts packages/civ7-adapter/test/mock-terrain-policy.test.ts` after downstream river-class helper adoption | Passed: 10 tests, 0 failed. |
| `bun run resources:status` | Passed; `.civ7/outputs/resources` clean at `fbc38ef8a041d469cad3800011074379ccd5a179`. |
| `bun run mapgen-studio:gen-civ7-tables && git diff --exit-code -- apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts packages/civ7-map-policy/src/civ7-tables.gen.ts packages/civ7-types/generated/river-types.gen.d.ts` | Passed; generator is idempotent after sourcing river metadata from `@civ7/map-policy` for Studio, map-policy, and ambient Civ7 runtime types. |
| `bun run openspec -- validate earthlike-visible-river-acceptance --strict` | Passed: change is valid. |
| `bun run openspec:validate` | Passed: 77 items, 0 failed. |
| `git diff --check` | Passed. |

Additional validation previously recorded for this branch includes adapter,
map-policy, direct-control, Studio display, live-parity, floodplain, and
world-balance focused suites. The current stack also has focused validation for
the restored native modeling source slice. Rerun the full product proof sweep
before closure.

## Review Disposition

| Finding | Disposition |
| --- | --- |
| Validation sweep was a command list, not a proof record. | Accepted; replaced with dated pass/fail results and kept post-restack validation as required before closure. |
| Generated-output idempotence was overclaimed. | Accepted; recorded `gen:maps`, `build`, and `git diff --exit-code` over generated/build outputs. |
| Major/navigable river wording was broader than proof. | Accepted; narrowed to selected projected navigable trunks and added a non-claim for all planned major tiles. |
| Runtime proof envelope was incomplete. | Accepted; phase record now includes a compact bounded proof envelope for the same-run river/lake subclaims. |
| Lake coherence wording was too broad. | Accepted; split physical benchmark coupling from final accepted-lake placement readback and added verifier lake-counter parity. |
| Branch isolation omitted restack context. | Accepted; branch row now states clean isolated worktree plus ahead/behind/restack status. |
| Product acceptance rows overclaimed full product/visual closure. | Accepted; rows now say `technical pass` for runtime/materialization proof classes and keep Studio visible-state/reviewer disposition open. |
| Adapter re-exported map-policy-owned river constants. | Accepted; river constants remain owned/imported from `@civ7/map-policy` and are no longer re-exported through `@civ7/adapter`. |
| Adapter metadata readback could fall back to terrain readback. | Accepted; navigable metadata/API readback no longer infers from `TERRAIN_NAVIGABLE_RIVER`, leaving raw terrain proof in `terrainNavigableRiverMask`. |
| `map-rivers` and downstream consumers duplicated hydrology river-class numeric semantics. | Accepted; hydrology now exports `RIVER_CLASS_*` constants and helpers consumed by river projection, climate refinement, ecology/placement any-river checks, diagnostics, and adjacency masks. |
| Ambient `@civ7/types` duplicated river enum literals. | Accepted; `packages/civ7-types/generated/river-types.gen.d.ts` is now generated from `CIV7_RIVER_TYPE_METADATA_SOURCE`, `index.d.ts` references that generated fragment, and map-policy tests assert the ambient declarations carry the same source evidence and literal values. |
| Read-only closure reviewer requested a non-restack gap audit. | Accepted; added a Studio data-model integration test that feeds actual packaged `standard` recipe emissions through the Studio worker trace/viz bridge, made package-local Studio `check`/`test` run serialized recipe-artifact preflight, and made generated map-entry cleanup idempotent under stale-artifact rebuilds. Graphite closure remains gated on the user-offered restack. |

## Not Claimed

| Requirement | Status |
| --- | --- |
| Per-tile Civ minor-river metadata is stamped from Hydrology truth | Not claimed. Disposable runtime proof rejected `TerrainBuilder.setRiverValidationValues()` because river metadata counts were unchanged. Bulk native modeling can create minor metadata, but that is not a per-tile Hydrology-authored writer. |
| Civ `GameplayMap.isRiver` / `isNavigableRiver` exactly matches terrain projection | Not claimed. Current source produces nonzero metadata through native bulk modeling, but exact selected-vs-native river object parity still needs same-run classification. |
| Every planned major river tile becomes Civ-visible terrain | Not claimed. The projection selects a Civ-visible navigable trunk subset from planned major river tiles. |
| Deterministic full-surface Studio/Civ parity | Not claimed. Current accepted proof rows leave non-river terrain, feature, resource, and resource-placement residuals unresolved. |
| Migrating shipped Earthlike config to `navigableRiverDensity` | Not claimed. The shipped config keeps the legacy alias to preserve current proof hash until a fresh live proof is captured for the renamed key. |
| Graphite stack closure | Not complete for the full hydrology/river/lake goal. Current work continues on `codex/map-rivers-native-modeling-restored`. |

## Required Before Goal Completion

- Keep the worktree clean after restack/submit operations.
- Do not mark per-tile minor-river metadata stamping complete unless a new Civ
  writer surface is discovered and proven by disposable-session readback.
- Do not mark bulk native minor-river materialization complete until native
  river objects are same-run classified against Hydrology truth and rendered
  proof includes sampled minor/navigable evidence or an explicit disposition.
- Keep non-river final-surface residuals in the product-acceptance workstream
  unless a residual is newly classified as river/lake-owned.
