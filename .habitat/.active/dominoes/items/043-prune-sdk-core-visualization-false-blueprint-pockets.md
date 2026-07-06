# Domino 043: Prune SDK/Core/Visualization False Blueprint Pockets

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

Source inspection confirmed Civ7 SDK, MapGen core, and MapGen visualization are separate package owners rather than an SDK parent with core/viz children. Four `_blueprints` packets were demoted into honest niche `rules/`: two MapGen core library rules, one Civ7 SDK mapgen subpath rule, and one MapGen visualization build-currentness rule.

## Detail

#### 43. Run Targeted Garbage Or `_blueprints` Candidate Pruning

Purpose: delete, retire, demote, or fence misleading rows and candidate
destinations once the real dependency-tag and artifact destinations have been
tested or deliberately deferred.

Done Means:

- The targeted garbage or candidate-pruning input set is bounded by the
  preceding dependency-tag/artifact passes.
- Rows are removed only when behaviorless, duplicate, superseded by a positive
  rule, or explicitly retired.
- False `_blueprints` destinations touched by recent slices are demoted to
  honest niche `rules/`, `_remainder`, or active source owner lanes.
- No global `_blueprints` campaign runs without a bounded destination or
  garbage frame.

Moves It Forward:

- Apply the garbage pressure named in
  `.habitat/.active/frames/DESTINATION-SIMPLIFICATION-FRAME.md`.
- Prefer deleting bad negative guards after a stronger positive rule exists.
- Prefer demoting fake candidates over preserving them as visual ontology.
- Leave config, adapter, projection, import-law, package-graph, and build
  surfaces out of blueprint authority unless a later frame admits a specific
  constructible owner.

Dependencies:

- Domino 42 exposes garbage or candidate pruning as the next highest-leverage
  move.

Proof:

- Deleted or demoted rows are named with the reason.
- Focused checks prove no behavior regression for retained rows.
- Static scans show touched fake destinations no longer appear as live
  `_blueprints` ambiguity.

Disposition receipt:

- Source-backed structure:
  - `packages/sdk` owns the Civ7 SDK authoring API and the explicit runtime-bound
    `@mateicanavra/civ7-sdk/mapgen` subpath.
  - `packages/mapgen-core` owns pure MapGen engine/core authoring, execution,
    helpers, artifacts, domains, recipes, compiler, and tracing.
  - `packages/mapgen-viz` owns shared visualization contract types and helpers
    consumed by MapGen Studio, dump tooling, and core/mod visualization emitters.
- Rejected nesting: SDK is not the parent of MapGen core or visualization.
  `@mateicanavra/civ7-sdk/mapgen` depends on MapGen core and the Civ7 adapter;
  it does not contain the core library or visualization contract package.
- Moved packets:

| Rule | From | To | Reason |
| --- | --- | --- | --- |
| `preserve_mapgen_core_runtime_neutrality` | `civ7/mapgen/core/_blueprints/mapgen-core-library` | `civ7/mapgen/core/rules` | Whole predicate protects `packages/mapgen-core` runtime neutrality; `mapgen-core-library` is not an admitted blueprint kind. |
| `prohibit_runtime_helper_redeclarations` | `civ7/mapgen/core/_blueprints/mapgen-core-library` | `civ7/mapgen/core/rules` | Whole predicate protects shared helpers exported by `@swooper/mapgen-core`; it is honest core-library niche authority. |
| `require_explicit_mapgen_sdk_opt_in` | `civ7/mapgen/sdk/_blueprints/mapgen-entrypoint` | `civ7/sdk/rules` | Whole predicate protects the Civ7 SDK root-vs-mapgen-runtime subpath boundary; it belongs directly under the SDK niche, not under MapGen and not under an extra SDK child niche. |
| `verify_visualization_runtime_build_artifacts` | `civ7/mapgen/visualization/_blueprints/runtime-dependencies` | `civ7/mapgen/visualization/rules` | Whole predicate checks visualization/runtime build-currentness; `runtime-dependencies` is not a blueprint kind. |

Residual scope:

- Platform, resources, docs, workspace, and toolkit `_blueprints` pockets remain
  for later bounded pruning. This slice intentionally clears only the
  SDK/core/visualization ambiguity and its directly dependent false blueprint
  pockets.
