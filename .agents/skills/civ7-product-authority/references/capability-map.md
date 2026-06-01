# Capability Map

This map names durable product/domain owners for Civ7 Modding Tools. It is a starting authority template; extend it when a capability becomes durable.

## Capabilities

| Capability | Owner | Owns | Does Not Own |
|---|---|---|---|
| Official resource ingestion | CLI/config/resource workflow owners | locating, extracting, indexing, and referencing official game resources | SDK public API policy, MapGen domain topology, hand-edited resource outputs |
| Generated Civ7 types/constants | `packages/civ7-types`, SDK constants where applicable | type-level representation of Civ7 runtime/game identifiers | runtime adapter implementation, generated artifact hand-edits |
| SDK mod authoring | `packages/sdk` | builders, nodes, XML file generation contracts, authoring ergonomics | CLI UX, MapGen algorithms, Civ7 runtime adapter calls |
| CLI workflows | `packages/cli` | command UX, flags, command orchestration, command errors | reusable plugin internals, SDK semantics |
| Plugin libraries | `packages/plugins/*` | reusable pure mechanics for graph/file/git/mod workflows | CLI-specific behavior, product-specific generated output claims |
| MapGen core | `packages/mapgen-core` | deterministic generation model, recipe/stage/step/config/artifact contracts, pure domains | Civ7 runtime globals, generated mod files, MapGen Studio UI |
| Civ7 adapter | `packages/civ7-adapter` | engine/runtime API boundary and stable adapter methods | MapGen algorithms, mod tuning, pure SDK XML generation |
| MapGen visualization | `packages/mapgen-viz`, `apps/mapgen-studio` | visualization contracts, viewers, workers, UI, trace/dump presentation | generation truth, engine projection |
| Swooper Maps mod | `mods/mod-swooper-maps` | game-facing map mod integration, source recipe content, deployment package generation | pure core algorithms, adapter internals, hand-edited `mod/` output |
| Docs and examples | `docs/**`, `apps/playground` | canonical promises, tutorials, examples, project state | executable behavior without matching source/tests |

## Explicit Non-Ownership Rules

- Generated artifacts do not own product policy.
- Official resources do not own repo package boundaries.
- MapGen core does not own Civ7 engine runtime integration.
- Adapter does not own MapGen algorithms.
- CLI does not own reusable plugin behavior beyond command orchestration.
- Project reviews do not become evergreen authority until promoted, linked from canonical docs, or accepted as the active project baseline for a bounded workstream.

## Current MapGen Domain Frame

MapGen product/domain claims should distinguish:

- recipe/stage/step authoring contracts;
- domain ops and pure semantics;
- artifacts and truth products;
- map projection/materialization into Civ7;
- diagnostics, parity capture, and generated-output proof.

If a domain claim cannot identify which row it belongs to, stop and record a decision before implementation.
