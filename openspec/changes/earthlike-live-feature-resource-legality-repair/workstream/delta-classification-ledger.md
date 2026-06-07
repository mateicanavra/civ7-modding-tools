# Feature/Resource Delta Classification Ledger

## Scope

- Source proof:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc.json`.
- Proof hash:
  `4973f47b8dd83e9710088d33485b2a985fcdf4dee71b140f2aa23b4bc55ac1dc`.
- Summary hash:
  `66b0548b9aba5c7a6502c9c92b5d4ca06ef4d5b65c6f98d4d08b81794f99c77e`.
- Request: `studio-run-in-game-mq20rbzr-1fhc`.
- Seed/dimensions: `138503614`, `106x66`, `6996` plots.
- Runtime readback: omitted plots `0`; identity stable across seed,
  dimensions, plot count, turn, and game hash.
- Current proof status: `parityStatus:"unresolved"`.

## Boundary

This ledger links concrete rows for source-authority classification. It does
not classify source authority, authorize repair, prove parity, or prove product
acceptance. Repairs remain blocked until a row or row class is assigned to a
specific owner with evidence: official data, adapter/map-policy, MapGen
planning/materialization, accepted engine materialization, or readback
limitation.

Terrain rows remain outside this feature/resource lane unless diagnostics prove
shared materialization ownership.

## Feature Rows

| Row | Coordinate | Local | Live | Source-authority status | Next evidence |
|---|---|---|---|---|---|
| F1 | `(48,6)` | `FEATURE_COLD_REEF` (`11`) | empty | pending | Source-recorded post-repair proof keeps the row local-only; local context records reef intent and live post-run `TerrainBuilder.canHaveFeature=false`, but the exact log packet does not yet carry feature-apply telemetry. Needs live feature-apply/materialization proof before repair authority. |
| F2 | `(48,13)` | empty | `FEATURE_KILIMANJARO` (`35`) | pending | Source-recorded post-repair proof still carries live natural-wonder telemetry `placedCount:5`, `rejectedCount:2`; the apparent `7/7/0` signal came from local verifier generation, not exact live proof. Treat with F3 as an unresolved natural-wonder materialization/deploy proof gap. |
| F3 | `(49,13)` | `FEATURE_KILIMANJARO` (`35`) | empty | pending | Pair with F2; local direction `0` is complete, but exact live telemetry still rejects the planned anchor. Do not classify as accepted residual or repaired until a fresh exact run proves the repaired materialization path is deployed and live-effective. |
| F4 | `(51,21)` | empty | `FEATURE_ZHANGJIAJIE` (`36`) | pending | Same class as F2/F3: exact live telemetry still rejects one of the planned natural-wonder anchors while final grid shows the feature under alternate footprint readback. |
| F5 | `(52,21)` | `FEATURE_ZHANGJIAJIE` (`36`) | empty | pending | Pair with F4; do not classify as accepted residual or further repair authority until exact live materialization/deploy evidence is reconciled. |

## Resource Example Rows

The proof contains `106/6996` resource mismatches. The verifier records the
first 16 examples; pair counts below summarize all mismatched pairs in the
artifact.

| Row | Coordinate | Local | Live | Source-authority status | Next evidence |
|---|---|---|---|---|---|
| R1 | `(34,2)` | `RESOURCE_CLAY` (`42`) | empty | pending | Compare local placement assignment/outcome and Civ live legality for the same tile/resource. |
| R2 | `(59,3)` | empty | `RESOURCE_CLAY` (`42`) | pending | Determine whether Civ relocated/substituted an authored assignment or local prediction missed an engine placement. |
| R3 | `(31,4)` | `RESOURCE_CLAY` (`42`) | empty | pending | Same class as R1 unless terrain/biome/feature context differs materially. |
| R4 | `(56,6)` | `RESOURCE_GYPSUM` (`6`) | empty | pending | Check static and live `canHaveResource` legality at the exact tile. |
| R5 | `(87,6)` | `RESOURCE_TURTLES` (`53`) | empty | pending | Check aquatic legality, coast/ocean context, and any engine resource spacing conflict. |
| R6 | `(17,7)` | empty | `RESOURCE_PEARLS` (`12`) | pending | Determine whether live Civ produced an unpredicted legal placement from the same source chain. |
| R7 | `(36,7)` | empty | `RESOURCE_DYES` (`2`) | pending | Compare local assignment order and live legality. |
| R8 | `(37,8)` | empty | `RESOURCE_TURTLES` (`53`) | pending | Check whether this pairs with a nearby local-only turtles row. |
| R9 | `(9,9)` | empty | `RESOURCE_FISH` (`3`) | pending | Check aquatic legality and placement order. |
| R10 | `(86,9)` | `RESOURCE_FISH` (`3`) | empty | pending | Check whether this pairs with a nearby live-only fish/turtles row. |
| R11 | `(104,9)` | `RESOURCE_DYES` (`2`) | `RESOURCE_PEARLS` (`12`) | pending | Substitution class; compare local preferred resource, fallback candidate set, and live `canHaveResource` result. |
| R12 | `(52,10)` | `RESOURCE_SILVER` (`14`) | `RESOURCE_GYPSUM` (`6`) | pending | Substitution class; compare local preferred resource, fallback candidate set, and live `canHaveResource` result. |
| R13 | `(69,10)` | `RESOURCE_DYES` (`2`) | `RESOURCE_COWRIE` (`52`) | pending | Substitution class; compare local preferred resource, fallback candidate set, and live `canHaveResource` result. |
| R14 | `(14,11)` | `RESOURCE_COWRIE` (`52`) | empty | pending | Check aquatic/coast context and spacing conflict. |
| R15 | `(30,11)` | empty | `RESOURCE_PEARLS` (`12`) | pending | Determine whether live Civ produced an unpredicted legal placement from the same source chain. |
| R16 | `(39,11)` | `RESOURCE_COWRIE` (`52`) | empty | pending | Same class as R14 unless terrain/biome/feature context differs materially. |

## Resource Pair Classes

| Pair class | Count | Source-authority status | Next evidence |
|---|---:|---|---|
| `RESOURCE_TURTLES` -> empty | 7 | pending | Aquatic legality, spacing, and engine rejection/relocation evidence. |
| `RESOURCE_COWRIE` -> empty | 7 | pending | Aquatic legality, spacing, and engine rejection/relocation evidence. |
| `RESOURCE_PEARLS` -> empty | 7 | pending | Aquatic legality, spacing, and engine rejection/relocation evidence. |
| empty -> `RESOURCE_DYES` | 6 | adapter/map-policy adjacent-land mismatch | Live exact run placed these rows through typed resource placement, but static local policy rejects them only for `resource.adjacent-land`. Repair belongs to the shared static policy/mock adapter unless live `canHaveResource` evidence later contradicts the final-surface/log proof. |
| empty -> `RESOURCE_FISH` | 6 | adapter/map-policy adjacent-land mismatch | Live exact run placed these rows through typed resource placement, but static local policy rejects them only for `resource.adjacent-land`. Repair belongs to the shared static policy/mock adapter unless live `canHaveResource` evidence later contradicts the final-surface/log proof. |
| empty -> `RESOURCE_TURTLES` | 5 | adapter/map-policy adjacent-land mismatch | Live exact run placed these rows through typed resource placement, but static local policy rejects them only for `resource.adjacent-land`. Repair belongs to the shared static policy/mock adapter unless live `canHaveResource` evidence later contradicts the final-surface/log proof. |
| empty -> `RESOURCE_COWRIE` | 5 | adapter/map-policy adjacent-land mismatch | Live exact run placed these rows through typed resource placement, but static local policy rejects them only for `resource.adjacent-land`. Repair belongs to the shared static policy/mock adapter unless live `canHaveResource` evidence later contradicts the final-surface/log proof. |
| empty -> `RESOURCE_PEARLS` | 4 | adapter/map-policy adjacent-land mismatch | Live exact run placed these rows through typed resource placement, but static local policy rejects them only for `resource.adjacent-land`. Repair belongs to the shared static policy/mock adapter unless live `canHaveResource` evidence later contradicts the final-surface/log proof. |
| `RESOURCE_FISH` -> empty | 4 | pending | Aquatic legality, spacing, and engine rejection/relocation evidence. |
| `RESOURCE_CLAY` -> empty | 3 | pending | Land legality and fallback assignment evidence. |
| empty -> `RESOURCE_CLAY` | 3 | pending | Determine whether live relocation/extra placement explains clay rows. |
| `RESOURCE_DYES` -> `RESOURCE_PEARLS` | 3 | pending | Substitution; compare local preferred/fallback candidates with live legality. |
| `RESOURCE_LIMESTONE` -> `RESOURCE_HORSES` | 2 | pending | Substitution; compare official data and live legality. |
| `RESOURCE_IVORY` -> `RESOURCE_HARDWOOD` | 2 | pending | Substitution; compare official data and live legality. |
| `RESOURCE_FISH` -> `RESOURCE_TURTLES` | 2 | pending | Aquatic substitution; compare official data and live legality. |
| `RESOURCE_HARDWOOD` -> `RESOURCE_JADE` | 2 | pending | Substitution; compare official data and live legality. |
| `RESOURCE_CLAY` -> `RESOURCE_RICE` | 2 | pending | Substitution; compare official data and live legality. |
| single-count pairs | 7 | pending | Preserve individually until row context proves they share a class. |

## Static Surface Diagnostic Findings

Diagnostic helper:
`mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts`.

Focused test:
`mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts`.

The diagnostic compares each feature/resource delta against the local and live
terrain/biome/feature surfaces using the static official-derived tables exposed
through `@civ7/map-policy`. It answers only static surface legality. It does
not prove placement intent, resource spacing outcome, Civ runtime
`canHaveResource`/`canHaveFeature`, natural-wonder footprint semantics, or
accepted engine materialization.

Pre-repair summary for request `studio-run-in-game-mq20rbzr-1fhc`:

| Surface | Delta rows | Local value invalid on local surface | Local value invalid on live surface | Live value invalid on local surface | Live value invalid on live surface |
|---|---:|---:|---:|---:|---:|
| feature | 5 | 0 | 0 | 0 | 0 |
| resource | 106 | 0 | 0 | 26 | 26 |

Current repaired summary for the same proof:

| Surface | Delta rows | Local value invalid on local surface | Local value invalid on live surface | Live value invalid on local surface | Live value invalid on live surface |
|---|---:|---:|---:|---:|---:|
| feature | 5 | 0 | 0 | 0 | 0 |
| resource | 106 | 0 | 0 | 0 | 0 |

Feature row readout:

| Rows | Static finding | Source-authority implication |
|---|---|---|
| F1 | `FEATURE_COLD_REEF` is static-legal on local and live `TERRAIN_COAST` / `BIOME_MARINE`. | Not a static feature terrain/biome illegality. Needs feature apply/rejection or Civ materialization evidence. |
| F2/F3 | `FEATURE_KILIMANJARO` is static-legal on both compared mountain/plain cells. | Treat as natural-wonder footprint/anchor evidence need, not static feature legality repair. |
| F4/F5 | `FEATURE_ZHANGJIAJIE` is static-legal on both compared mountain/tropical cells. | Treat as natural-wonder footprint/anchor evidence need, not static feature legality repair. |

Resource row readout:

| Class | Count | Static finding | Source-authority implication |
|---|---:|---|---|
| Local resource values on local surface | 80 | All static-legal. | Local predictions are not contradicted by static surface legality; still need placement intent/outcome and spacing evidence. |
| Live resource values on live surface | 52 | `26` static-legal; `26` fail only `resource.adjacent-land`. | The live-only aquatic rows expose an adapter/policy/readback question around adjacent-land semantics; do not classify as MapGen repair without live `canHaveResource` or engine-rule evidence. |
| Live invalid by resource | 26 | `RESOURCE_DYES` `6`, `RESOURCE_FISH` `6`, `RESOURCE_TURTLES` `5`, `RESOURCE_COWRIE` `5`, `RESOURCE_PEARLS` `4`. | Preserve as a policy/adapter investigation class before changing generation. |

The pre-repair `resource.adjacent-land` finding was diagnostic pressure until
the exact-authored placement log and matching live resource count proved Civ
accepted the rows through the typed resource placement path. After the narrow
policy repair, this class no longer appears as a static surface invalidity.

## Source-Authority Classification Progress

### Adapter/Map-Policy Adjacent-Land Class

Rows classified:
`empty -> RESOURCE_DYES` (`6`), `empty -> RESOURCE_FISH` (`6`),
`empty -> RESOURCE_TURTLES` (`5`), `empty -> RESOURCE_COWRIE` (`5`), and
`empty -> RESOURCE_PEARLS` (`4`).

Evidence:

- Official-derived `@civ7/map-policy` rows require
  `Resource_ValidBiomes` coast/marine/no-feature plus `AdjacentToLand=true`
  for these resource ids.
- The exact-authored live run
  `studio-run-in-game-mq20rbzr-1fhc` logged `RESOURCE_PLACEMENT_V1` with
  `plannedCount:252`, `placedCount:252`, `rejectedCount:0`, and
  `mismatchCount:0` at `2026-06-06T03:16:43-04:00`.
- The live full-grid proof for the same runtime snapshot contains exactly
  `252` resource cells, matching the typed placement count.
- The `26` classified live-only rows are coast/marine/no-feature cells with no
  adjacent non-water tile under the canonical odd-q wrapped topology and fail
  only the static `resource.adjacent-land` check.

Disposition:
source authority for this row class is the repo-owned static resource policy
surface used by local/mock parity, not MapGen product tuning. The immediate
repair was made in `@civ7/map-policy`, `@civ7/adapter`, and the diagnostic
helper: the local/mock static resource legality model now reflects observed Civ
`ResourceBuilder.canHaveResource` behavior for this classified adjacent-land
class, with tests preserving the official table evidence and preventing silent
broad relaxation. No resource density, resource diversity, terrain, coast
generation, or Earthlike tuning changed as part of this class.

Open caveat:
this classification covers only the `26` live-only rows above. The remaining
resource substitution/local-only rows still need placement-intent, spacing,
and fallback evidence before owner repair.

### Post-Repair Proof Status

The repaired diagnostic helper reports no static surface invalid rows for the
saved proof packet. The post-repair final-surface verifier rerun was completed
with the saved exact-authorship packet wrapped as verifier input and current
live full-grid readback from Studio/Civ:

- exact proof wrapper:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json`
  (`sha256:93a0c3e2ace18d1f3ab2eac0f9e57d2c9bb2642787afc31acc15815286d0d938`).
- post-repair artifact:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-adjacent-land-policy.json`
  (`sha256:c80b0c9e77abb67bec29f84413a94d12b4aa17e9e2cf6fe788e48dd5fa91630b`,
  `proofHash:cb74141e0c63009ecb086dc73cf6955b457910f751038776c0cbd399f7a77dd3`).
- runtime proof: exact-authorship summary `status:"complete"`, request
  `studio-run-in-game-mq20rbzr-1fhc`, config hash
  `c8bf167810f92f9a6096b298d1fcf3bb6b044a0fec22a9ad0ca9b35103982dca`,
  envelope hash
  `a9a7bb73e9dd062e1da658a639bc02602e75b7fda1ca6d88123a1a2e9ac5f790`,
  seed `138503614`, dimensions `106x66`, runtime turn `1`, game hash `0`,
  source snapshot id `status:1:c153eb72`, and snapshot hash `c153eb72`.
- live grid proof: `6996` compared plots, `0` omitted plots, `17` chunks,
  and stable identity across map width, map height, plot count, random seed,
  turn, and game hash.

The rerun did not close parity. It remains `status:"unresolved"` with
`surface.terrain.mismatch`, `surface.feature.mismatch`, and
`surface.resource.mismatch`. Surface diffs remained: terrain `2/6996`,
biome `0/6996`, feature `5/6996`, and resource `106/6996`.

Interpretation:
the adjacent-land repair removed the static-invalid diagnostic class, but it
did not reduce the final resource coordinate mismatch count. The remaining
resource rows therefore need placement assignment/order/fallback evidence
before any further repair. This artifact does not prove product acceptance,
Earthlike quality, start-placement correctness, river metadata parity, or
natural-wonder footprint semantics.

### Resource Assignment Evidence Rerun

Diagnostic repair:
`mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts` now carries local
`resourcePlan` and typed `resourcePlacementOutcomes` into the local proof
evidence. `surface-delta-context.ts` can join resource mismatch rows back to
local planned preferred resource and local typed outcome evidence.

Evidence artifacts:

- proof:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-assignment-evidence.json`
  (current sha256:
  `ff4aec0701cbeeb031737b68d93a0a48e9168313ef983cc30a3df91cff6f08ab`,
  current proofHash:
  `e448cad8023b1478aff5fe40d30f23a23f4a71eed47ce614464db88ac01586df`).
- summary:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-assignment-summary.json`
  (`sha256:e8d1917d657654bc0d494457c62b8c84a4613f22e024cd5ca770f7fbbb645d8b`).

Resource placement evidence:

| Fact | Value |
|---|---:|
| local resource cells | `252` |
| live resource cells | `252` |
| local planned placements | `252` |
| local typed outcomes | `252` |
| local placed outcomes | `252` |
| local rejections | `0` |
| local readback mismatches | `0` |
| resource delta rows | `106` |

Resource delta evidence classes:

| Evidence class | Count | Implication |
|---|---:|---|
| `local-assigned-live-empty` | `37` | Local mock assigned and read back a resource, but live Civ final grid has no resource on that tile. |
| `live-only-no-local-assignment` | `37` | Live Civ final grid has a resource on a tile with no local assignment/outcome. |
| `local-assigned-live-substitution` | `32` | Local mock assigned and read back one resource type, but live Civ final grid has a different resource type on that tile. |

Disposition:
the remaining resource parity problem is not a static-surface legality failure,
not a local placement count failure, and not local adapter rejection. Local and
live both materialize `252` resources. The remaining source-authority question
is why the local mock placement feasibility/order produces a different
coordinate/type assignment than Civ materialization for the same exact-authored
request. Before repair, the lane needs bounded Civ `ResourceBuilder.canHaveResource`
or equivalent placement-feasibility readback for the delta rows, or an explicit
engine-materialization policy disposition. No resource density, diversity,
terrain, coast, or Earthlike tuning is authorized from this evidence.

### Civ Resource Feasibility Readback

Diagnostic repair:
`@civ7/direct-control` now owns a bounded
`getCiv7ResourcePlacementFeasibility` wrapper over
`ResourceBuilder.canHaveResource`; no caller-local tuner script is needed for
resource legality readback.

Evidence artifact:

- `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-feasibility-readback.json`
  (`sha256:139c8e52c2acd91b01415f8daee6b5dd27ee28e2db26857627118d993cc2e96c`).
- Source proof: current assignment-evidence artifact
  `e448cad8023b1478aff5fe40d30f23a23f4a71eed47ce614464db88ac01586df`.
- Readback: Tuner state `1`, host `127.0.0.1`, port `4318`, `106` cells,
  `0` omitted cells.

Strict readback (`ignoreWeight:false`) is not sufficient as a
post-materialization acceptance oracle: all `69` live non-empty delta probes
returned false, including resources that the live grid shows as present.

`ignoreWeight:true` readback:

| Class | Count | Source-authority implication |
|---|---:|---|
| `live-only-no-local-assignment`, live feasible | `37` | Civ says the live value is feasible, but the local assignment algorithm did not assign that cell. This points to assignment ordering/rebalance divergence, not static legality. |
| `local-assigned-live-empty`, local feasible | `28` | Local assigned a Civ-feasible resource where live has no resource. This also points to assignment ordering/rebalance divergence. |
| `local-assigned-live-empty`, local infeasible | `9` | Local placement accepted a resource Civ rejects under the loose feasibility probe. This is a focused local-overacceptance investigation class only; source authority remains unresolved. |
| `local-assigned-live-substitution`, both feasible | `31` | Both local and live resource values are Civ-feasible at the tile; this is assignment/type-order divergence, not simple legality. |
| `local-assigned-live-substitution`, both infeasible | `1` | Preserve as an individual evidence row before repair; neither probed value is feasible under the loose check on the current live map. |

Disposition:
the feasibility readback narrows but does not close source authority. The
`9`-row local-overacceptance class is a focused investigation class, not a
repair class. Current row-level evidence rules out official rows/flags,
adjacent-land, authored spacing, owner/water/tag/river, relaxed spacing, and
rebalance as explanations, while leaving source authority unresolved between
repo-owned mock/static policy, runtime materialization/state, and hidden Civ
`ResourceBuilder.canHaveResource` constraints. No repair authority, resource
density, diversity, terrain, coast, Earthlike tuning, parity closure, or
product acceptance is authorized.

### Row-Level Feasibility Classification Diagnostic

Diagnostic repair:
`mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts` now joins
local resource delta placement context to a provided Civ resource feasibility
readback. This is an evidence-classifier only; it does not change resource
planning, placement, static policy, generated maps, or tuning.

Classification labels:

| Diagnostic class | Source-authority implication |
|---|---|
| `live-feasible-no-local-assignment` | Civ says the live resource value is feasible, but local assignment did not place it on that cell; investigate assignment ordering/rebalance before repair. |
| `local-feasible-live-empty` | Local placed a Civ-feasible resource where live has no resource; investigate assignment ordering/rebalance before repair. |
| `local-overaccepted-live-empty` | Local placed a resource Civ rejects on that cell under loose feasibility; this is the focused `9`-row local-overacceptance investigation class. |
| `substitution-both-feasible` | Local and live resource values are both Civ-feasible; investigate resource type ordering/fallback selection before repair. |
| `substitution-both-infeasible` | Preserve as an individual unresolved evidence row; no repair authority exists until row-level context/source authority is classified. |

Disposition:
the diagnostic enforces the proof boundary from the feasibility artifact. It
keeps the `9` local-overacceptance rows separate from the single both-infeasible
substitution row and prevents the latter from being folded into mock/static
policy repair authority.

### Full Resource Delta Feasibility Artifact

Verifier:
`scripts/civ7-direct-control/verify-resource-delta-feasibility.ts`.

Runtime binding:
before probing resource feasibility, the verifier resolves request id from
exact-authorship summary, packet, source snapshot, and log fields, then reads
current live map identity through package-owned `getCiv7MapSummary` and compares
it to the saved final-surface proof. Missing/conflicting request id or
missing/mismatched width, height, plot count, seed, turn, or game hash blocks
the artifact before row-level feasibility evidence is accepted.

Artifact:
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-delta-feasibility-full.json`
(`sha256:4b6534e577c8d337df66ea42fd33a1d3674b8043a73fbc40c481e16c0cd5324e`,
`proofHash:cf91a10f32f8a53297058e5712039227869744d8f6354a59ce06b3dc7a8ac259`).

Source proof:
`e448cad8023b1478aff5fe40d30f23a23f4a71eed47ce614464db88ac01586df`.

Request identity:
`studio-run-in-game-mq20rbzr-1fhc`, matched across exact-authorship summary,
exact-authorship packet, source snapshot, and log request id.

Runtime identity:
saved and observed identities match at width `106`, height `66`, plot count
`6996`, seed `138503614`, turn `1`, and game hash `0`.

Readback:
Tuner state `1`, host `127.0.0.1`, port `4318`, `106` cells, `0` omitted
cells. The artifact also includes `getCiv7MapGrid` plot context for the same
`106` locations with fields `terrain`, `biome`, `feature`, `resource`,
`climate`, `hydrology`, `areaRegion`, `tags`, and `owner`; this readback also
returned `106` plots with `0` omitted and `hiddenInfoPolicy:"not-player-scoped"`.

`ignoreWeight:true` row classes:

| Class | Count | Source-authority status |
|---|---:|---|
| `live-feasible-no-local-assignment` | `37` | Assignment ordering/rebalance pending. |
| `local-feasible-live-empty` | `28` | Assignment ordering/rebalance pending. |
| `local-overaccepted-live-empty` | `9` | Focused local-overacceptance investigation; source authority remains unresolved. |
| `substitution-both-feasible` | `31` | Assignment/type-order divergence pending. |
| `substitution-both-infeasible` | `1` | Individual unresolved row; no repair authority yet. |

Focused `local-overaccepted-live-empty` rows:

All rows below have one exact official `Resource_ValidBiomes` row matching the
local surface, no adjacent-land requirement, `lakeEligible:true`, and no local
or live resource neighbor inside the authored `minSpacingTiles:2` bound.
Live plot context additionally confirms these cells are live-empty, unowned,
non-water, untagged, and have no river. Local assignment trace shows every row
came from the `scarce-floor` assignment phase and none were changed by
rebalance. Assignment-order context shows every row was selected before the
local resource type reached the scarce-floor target (`targetMinPerType:7`),
with local legal plot counts between `66` and `554`. ResourceBuilder
diagnostics are read through
`getCiv7ResourceBuilderDiagnostics` in the runtime-bound full artifact:
sha256
`4b6534e577c8d337df66ea42fd33a1d3674b8043a73fbc40c481e16c0cd5324e`,
proofHash
`cf91a10f32f8a53297058e5712039227869744d8f6354a59ce06b3dc7a8ac259`.
The source assignment-evidence artifact has sha256
`ff4aec0701cbeeb031737b68d93a0a48e9168313ef983cc30a3df91cff6f08ab`
and proofHash
`e448cad8023b1478aff5fe40d30f23a23f4a71eed47ce614464db88ac01586df`.
The artifact now includes a `resourceBuilderSubclassification` block with `6`
`scarce-floor-cut-excluded` rows and `3`
`scarce-floor-cut-included-rejected` rows. This split is diagnostic context,
not repair authority. The same block now carries official ResourceBuilder row
policy. All `9` focused rows have local `targetMinPerType:7` while official
`MinimumPerHemisphere` is `3`, so the local floor exceeds the official minimum
by `4` for each row. This is source-authority context only because the
ResourceBuilder probes are current post-materialization readback.

Assignment class summary:

| Local-authored resource delta class | Assignment phase | Target floor | Count | Assignment order span |
|---|---|---:|---:|---|
| `local-feasible-live-empty` | `scarce-floor` | `7` | `28` | `97..195` |
| `local-overaccepted-live-empty` | `scarce-floor` | `7` | `9` | `8..152` |
| `substitution-both-feasible` | `scarce-floor` | `7` | `26` | `15..231` |
| `substitution-both-feasible` | `strict-spacing` | `7` | `5` | `239..251` |
| `substitution-both-infeasible` | `scarce-floor` | `7` | `1` | `26..26` |

Of `69` local-authored resource delta rows, `64` (`92.75%`) came from the
local `scarce-floor` assignment phase. This broadens the owner question from
the `9` local-overaccepted rows to a general scarce-floor assignment policy
divergence across most local-authored resource deltas. It remains diagnostic
context, not repair authority.

Resource distribution context:

The full artifact now reads ResourceBuilder official row/count metadata for all
`26` local resource types represented by the `69` local-authored resource delta
rows, while keeping expensive per-cell cut/feasibility diagnostics scoped to the
`9` focused local-overaccepted rows.

| Finding | Count | Source-authority implication |
|---|---:|---|
| Local resource types represented by local-authored deltas | `26` | Distribution context covers the local resource types in the remaining resource-delta evidence, not the full candidate catalog. |
| Local assigned count equals current ResourceBuilder count | `26` | Broad per-resource count mismatch is not supported by this current post-materialization readback. |
| Local `targetMinPerType` exceeds official `MinimumPerHemisphere` | `25` | The local floor remains above official minimum for most represented types, but matching current counts prevent treating this alone as repair authority. |
| Local `targetMinPerType` below official `MinimumPerHemisphere` | `1` | `RESOURCE_SILVER` is an individual count-context exception and not part of the broad `+4` floor pattern. |

Highest delta-row resource types:

| Resource | Delta rows | Class mix | Local assigned / ResourceBuilder count | Target floor / official minimum |
|---|---:|---|---|---|
| `RESOURCE_COWRIE` | `7` | `7` local-feasible/live-empty | `7 / 7` | `7 / 3` |
| `RESOURCE_FISH` | `7` | `4` local-feasible/live-empty; `3` substitution-both-feasible | `7 / 7` | `7 / 3` |
| `RESOURCE_PEARLS` | `7` | `7` local-feasible/live-empty | `7 / 7` | `7 / 3` |
| `RESOURCE_TURTLES` | `7` | `7` local-feasible/live-empty | `7 / 7` | `7 / 3` |
| `RESOURCE_DYES` | `6` | `1` local-feasible/live-empty; `5` substitution-both-feasible | `7 / 7` | `7 / 3` |
| `RESOURCE_CLAY` | `5` | `3` local-overaccepted/live-empty; `1` substitution-both-feasible; `1` substitution-both-infeasible | `8 / 8` | `7 / 3` |

Disposition: this weakens a broad resource-count/quota mismatch as the source
owner for the remaining resource deltas. The remaining question is more
specifically positional cut/order/materialization behavior under the exact
authored run. The ResourceBuilder counts remain current post-materialization
readback; no scarce-floor repair, resource tuning, parity closure, Earthlike
acceptance, or product-proof claim is authorized from this context.

Same-resource position context:

The full artifact now greedily pairs each local-authored resource delta row to
the nearest unmatched live delta row carrying the same resource type. This is a
position classifier over observed local/live final surfaces; it does not prove
the internal Civ placement order.

| Finding | Count / value | Source-authority implication |
|---|---:|---|
| Local-authored resource delta rows | `69` | Same population as the assignment/distribution summaries. |
| Same-resource live delta matches | `69` | Every local-authored delta resource reappears elsewhere in the live delta set. |
| Unmatched local-authored resource rows | `0` | Missing resource instances are not supported for these rows. |
| Match distance min / p50 / p90 / max | `2 / 27 / 46 / 59` | The displacement is global, not a small local neighbor swap. |
| Matches at distance `11+` | `53` | Most matching live instances are far from the local-authored coordinate. |
| Match targets: live-only / substitution | `37 / 32` | Same-resource matches land across both live-only and substituted live rows. |

Match class summary:

| Local feasibility class -> matched live feasibility class | Count |
|---|---:|
| `local-feasible-live-empty -> live-feasible-no-local-assignment` | `19` |
| `local-feasible-live-empty -> substitution-both-feasible` | `9` |
| `local-overaccepted-live-empty -> live-feasible-no-local-assignment` | `3` |
| `local-overaccepted-live-empty -> substitution-both-feasible` | `5` |
| `local-overaccepted-live-empty -> substitution-both-infeasible` | `1` |
| `substitution-both-feasible -> live-feasible-no-local-assignment` | `14` |
| `substitution-both-feasible -> substitution-both-feasible` | `17` |
| `substitution-both-infeasible -> live-feasible-no-local-assignment` | `1` |

Disposition: combined with matched per-resource counts, this points away from
resource density, missing instances, or broad count/quota mismatch and toward
positional cut/order/materialization behavior. It remains diagnostic context
only; no resource placement repair or product claim is authorized until source
ownership is classified.

Local materialization consistency context:

The full artifact now compares typed local placement outcomes against the local
final resource surface.

| Finding | Count | Source-authority implication |
|---|---:|---|
| Placed local resource outcomes | `252` | Same population as the typed local placement artifact. |
| Placed outcomes matching local final surface | `252` | Local final resource surface preserves typed placement outcomes. |
| Placed outcomes mismatching local final surface | `0` | Local post-placement resource drift is not supported. |
| Local-authored resource delta outcomes | `69` | Same population as the local-authored resource delta summaries. |
| Local-authored delta outcomes matching local final surface | `69` | Every local-authored delta row still matches the typed local placement outcome. |
| Local-authored delta outcomes mismatching local final surface | `0` | The local final resource value is not being rewritten after local placement. |

Disposition: this rules out local post-resource-placement drift inside the
local artifact for the current resource mismatch class. Combined with
same-resource live displacement and matching per-resource counts, the remaining
owner question is bounded to live/Civ materialization, live readback timing, or
missing immediate post-placement live coordinate evidence. It still does not
authorize product repair, because immediate post-placement live coordinate
evidence is not yet captured in the exact-authored proof packet.

| Coordinate | Plot | Local resource | Planned preferred | Assignment order context | Surface | Official/static policy | Nearest local/live resource distance | Live runtime context | Civ loose feasibility | ResourceBuilder policy/cut/count diagnostics | Subclassification |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| `(34,2)` | `246` | `RESOURCE_CLAY` | empty | `scarce-floor`; order `23`; count before `2/7`; legal plots `88`; no rebalance | `TERRAIN_FLAT` / `BIOME_TUNDRA` / `FEATURE_TUNDRA_BOG` | row match; no flags blocking | `4` / `6` | `elev416 rain185 fert2 area131073 region65536 landmass131073` | false | cut excludes local; class `BONUS`; min `3`; target `7`; count `8`; required false | `scarce-floor-cut-excluded` |
| `(31,4)` | `455` | `RESOURCE_CLAY` | empty | `scarce-floor`; order `21`; count before `0/7`; legal plots `88`; no rebalance | `TERRAIN_FLAT` / `BIOME_TUNDRA` / `FEATURE_TUNDRA_BOG` | row match; no flags blocking | `4` / `5` | `elev238 rain191 fert2 area589832 region524295 landmass589832` | false | cut excludes local; class `BONUS`; min `3`; target `7`; count `8`; required false | `scarce-floor-cut-excluded` |
| `(56,6)` | `692` | `RESOURCE_GYPSUM` | empty | `scarce-floor`; order `74`; count before `4/7`; legal plots `324`; no rebalance | `TERRAIN_HILL` / `BIOME_TUNDRA` / empty | row match; no flags blocking | `4` / `4` | `elev523 rain197 fert0 area1048591 region720906 landmass196610` | false | cut includes local but `canHaveResource` false; class `CITY`; min `3`; target `7`; count `8`; required false | `scarce-floor-cut-included-rejected` |
| `(16,12)` | `1288` | `RESOURCE_WOOL` | `RESOURCE_WOOL` | `scarce-floor`; order `90`; count before `6/7`; legal plots `328`; no rebalance | `TERRAIN_HILL` / `BIOME_TROPICAL` / empty | row match; no flags blocking | `2` / `5` | `elev208 rain193 fert0 area1835035 region1310739 landmass1179665` | false | cut excludes local; class `BONUS`; min `3`; target `7`; count `8`; required true | `scarce-floor-cut-excluded` |
| `(12,19)` | `2026` | `RESOURCE_JADE` | `RESOURCE_SILK` | `scarce-floor`; order `139`; count before `6/7`; legal plots `525`; no rebalance | `TERRAIN_FLAT` / `BIOME_TROPICAL` / empty | row match; no flags blocking | `4` / `2` | `elev214 rain194 fert1 area3538997 region2359331 landmass1638424` | false | cut excludes local; class `CITY`; min `3`; target `7`; count `7`; required true | `scarce-floor-cut-excluded` |
| `(9,21)` | `2235` | `RESOURCE_HORSES` | `RESOURCE_COWRIE` | `scarce-floor`; order `152`; count before `5/7`; legal plots `554`; no rebalance | `TERRAIN_FLAT` / `BIOME_GRASSLAND` / empty | row match; no flags blocking | `4` / `6` | `elev453 rain169 fert1 area3670071 region2555942 landmass1703961` | false | cut excludes local; class `EMPIRE`; min `3`; target `7`; count `7`; required true | `scarce-floor-cut-excluded` |
| `(72,35)` | `3782` | `RESOURCE_RICE` | empty | `scarce-floor`; order `14`; count before `0/7`; legal plots `66`; no rebalance | `TERRAIN_FLAT` / `BIOME_TROPICAL` / `FEATURE_MANGROVE` | row match; no flags blocking | `4` / `4` | `elev192 rain184 fert2 area4522052 region3670071 landmass2424868` | false | cut includes local but `canHaveResource` false; class `EMPIRE`; min `3`; target `7`; count `8`; required false | `scarce-floor-cut-included-rejected` |
| `(86,38)` | `4114` | `RESOURCE_CLAY` | empty | `scarce-floor`; order `24`; count before `3/7`; legal plots `88`; no rebalance | `TERRAIN_FLAT` / `BIOME_TROPICAL` / `FEATURE_MANGROVE` | row match; no flags blocking | `5` / `5` | `elev232 rain176 fert2 area4915274 region4128830 landmass2752553` | false | cut includes local but `canHaveResource` false; class `BONUS`; min `3`; target `7`; count `8`; required false | `scarce-floor-cut-included-rejected` |
| `(67,51)` | `5473` | `RESOURCE_KAOLIN` | `RESOURCE_SILVER` | `scarce-floor`; order `8`; count before `1/7`; legal plots `66`; no rebalance | `TERRAIN_FLAT` / `BIOME_GRASSLAND` / `FEATURE_MARSH` | row match; no flags blocking | `8` / `6` | `elev427 rain172 fert2 area5963866 region5898329 landmass3538997` | false | cut excludes local; class `CITY`; min `3`; target `7`; count `8`; required true | `scarce-floor-cut-excluded` |

Individual `substitution-both-infeasible` row:

| Coordinate | Plot | Local resource | Live resource | Planned preferred | Local outcome | Civ loose feasibility |
|---|---:|---|---|---|---|---|
| `(69,32)` | `3461` | `RESOURCE_CLAY` | `RESOURCE_RICE` | empty | `RESOURCE_CLAY` | local false / live false |

Disposition:
the full artifact supersedes the prior summary-only feasibility evidence for
row-level inspection. It still does not authorize tuning or parity closure.
The next code repair, if any, must first prove whether the `9` focused rows are
repo-owned mock/static-policy behavior, runtime materialization/state behavior,
hidden Civ `ResourceBuilder.canHaveResource` constraints, or evidence
insufficiency.
The single both-infeasible substitution row remains outside that repair class.
Because the focused rows are not explained by official surface rows,
adjacent-land flags, authored spacing, owner, water, plot tags, or river state,
and are not introduced by relaxed spacing or rebalance, the next authority
check should use the structured `6` cut-excluded / `3` cut-included-but-rejected
split plus official row policy to determine whether the owner is repo
scarce-floor quota policy, Civ cut ordering/count policy, runtime
materialization state, or evidence insufficiency before changing mock policy.
The assignment-order context proves these rows came from the local scarce-floor
quota pass, and the official policy context proves the local floor exceeds
official minimum-per-hemisphere by `4` for each row, but that is still
diagnostic context rather than repair authority because the ResourceBuilder
readback is post-materialization.
The assignment-class summary further shows scarce-floor accounts for `64/69`
local-authored resource delta rows, and the distribution context shows local
assigned counts match current ResourceBuilder counts for all `26` represented
local resource types. The same-resource position context then matches all `69`
local-authored delta resources to same-resource live delta rows, mostly at long
distance. The local materialization context proves all `252` typed local
placements and all `69` local-authored delta placements still match the local
final resource surface. The next owner decision should therefore evaluate live
post-placement materialization/readback behavior, or add immediate live
coordinate evidence, before making any resource-placement repair.

### Resource Placement Coordinate Proof Instrumentation

Diagnostic repair:
`artifact:placement.resourcePlacementOutcomes` now summarizes placed, rejected,
and mismatch resource placement outcomes with a deterministic
`coordinateProof` digest. The digest is computed from sorted typed placement
outcomes and includes count plus an 8-hex-character `hash32` per status. Runtime
`RESOURCE_PLACEMENT_V1` telemetry emits the compact placed coordinate
count/hash, and emits rejected or mismatch hashes when those statuses are
present.

Boundary:
this instrumentation is for the next exact-authored live run. It does not
retroactively classify request `studio-run-in-game-mq20rbzr-1fhc`, because the
saved proof artifact predates the coordinate digest. The current resource
source-authority state remains open until a fresh exact-authored run binds local
typed placement coordinate identity to runtime log evidence, or another bounded
proof assigns the remaining subclasses to a concrete owner.

### Resource Placement Coordinate Proof Intake

Diagnostic repair:
Studio exact-authorship parsing now accepts the `RESOURCE_PLACEMENT_V1`
coordinate proof only from the bounded log section between the matching
`[mapgen-proof]` and `[mapgen-complete]` payloads for the same
request/config/envelope/seed chain. Final-surface parity proof then compares
that exact log coordinate proof against local
`resourcePlacementOutcomes.summary.coordinateProof` when the local artifact
contains one.

Boundary:
missing or mismatched coordinate proof now keeps parity/source-authority proof
unresolved with named `resource-placement-coordinate-proof.*` links. This
prevents a fresh parity artifact from silently reusing local coordinate
placement evidence without exact live log binding. The saved `mq20rbzr`
artifact still predates this log proof and remains open.

### Feature Delta Context

Diagnostic context:
`buildFeatureDeltaPlacementContexts` now groups feature mismatches into
evidence classes without assigning repair ownership. The current feature
context artifact is
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-delta-context.json`
(`sha256:a4f78cb9987ecf773be2fef9f597c9a1a019292da95f8c70af274c5623c72363`),
derived from exact-authored request `studio-run-in-game-mq20rbzr-1fhc`.

Feature context rows:

| Coordinate | Plot | Local feature | Live feature | Evidence class | Pair |
|---|---:|---|---|---|---|
| `(48,6)` | `684` | `FEATURE_COLD_REEF` | empty | `local-only-ecology-feature` | none |
| `(48,13)` | `1426` | empty | `FEATURE_KILIMANJARO` | `natural-wonder-offset-live-anchor` | paired with `(49,13)`, distance `1` |
| `(49,13)` | `1427` | `FEATURE_KILIMANJARO` | empty | `natural-wonder-offset-local-anchor` | paired with `(48,13)`, distance `1` |
| `(51,21)` | `2277` | empty | `FEATURE_ZHANGJIAJIE` | `natural-wonder-offset-live-anchor` | paired with `(52,21)`, distance `1` |
| `(52,21)` | `2278` | `FEATURE_ZHANGJIAJIE` | empty | `natural-wonder-offset-local-anchor` | paired with `(51,21)`, distance `1` |

Disposition:
the feature mismatch class is now split into one local-only ecology-feature
absence and two same-feature natural-wonder one-tile offsets represented by
four anchor rows. This is still diagnostic context only. The cold-reef row
requires local feature-intent/application versus live `canHaveFeature` or
engine-materialization proof before repair. The Kilimanjaro and Zhangjiajie
rows require planned anchor/direction/footprint evidence and local-vs-live
footprint materialization proof before accepting an engine-footprint
disposition or changing natural-wonder placement. No feature repair, wonder
footprint proof, parity closure, product acceptance, or mountain-quality claim
is authorized from this context alone.

### Feature Local Evidence Context

Diagnostic repair:
`runLocalFinalSurfaceSnapshot` now exports the local feature-intent families,
feature-apply diagnostics, natural-wonder plan, and natural-wonder placement
stats from existing schema-backed artifacts. `buildFeatureDeltaPlacementContexts`
joins that local evidence to feature mismatch rows when it is present, while
remaining compatible with older proof files that lack it.

The current local-evidence artifact is
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-local-evidence-context.json`
(`sha256:729cc1d2c3b080177b524293991ceff8b7bc312796dac31a8e59053cda7f1c45`).
It is a local exact-source rerun joined to the saved live grid from request
`studio-run-in-game-mq20rbzr-1fhc`; it is not a fresh exact-authored live
parity proof.

Feature local evidence facts:

| Fact | Value | Boundary |
|---|---:|---|
| Feature apply attempted / applied / rejected | `1501 / 1501 / 0` | Local exact-source rerun only. |
| `FEATURE_COLD_REEF` applied locally | `55` | Includes the local-only row `(48,6)`. |
| Natural wonders planned / placed / rejected | `7 / 7 / 0` | Local exact-source rerun only. |
| Local `FEATURE_KILIMANJARO` row `(49,13)` | planned footprint, anchor plot `1320`, distance `2` | Live anchor `(48,13)` still needs live footprint/materialization proof. |
| Local `FEATURE_ZHANGJIAJIE` row `(52,21)` | planned footprint, anchor plot `2171`, distance `1` | Live anchor `(51,21)` still needs live footprint/materialization proof. |

Disposition:
the cold-reef mismatch is now proven to be a local planned-and-applied ecology
feature on the exact source snapshot, with no local feature-apply rejection.
The remaining source-owner question is whether live Civ materialization or live
readback removed/omitted that feature, or whether the local mock feature
eligibility diverges from Civ live `canHaveFeature` for that exact tile. The
two natural-wonder mismatch pairs are now proven to touch locally planned
natural-wonder footprints, but the live grid has the same feature one tile away
from the local footprint row. That keeps ownership unresolved between planned
anchor/direction/footprint semantics, local mock stamping, Civ live
materialization policy, or readback semantics. No feature repair, natural-wonder
repair, parity closure, product acceptance, or mountain-quality claim is
authorized from this local evidence alone.

### Feature Live Feasibility Readback

Diagnostic repair:
`@civ7/direct-control` now exposes a package-owned
`getCiv7FeaturePlacementFeasibility` wrapper over
`TerrainBuilder.canHaveFeature`, and the root verifier
`verify:feature-delta-feasibility` binds feature probes to the saved
exact-authored parity proof before reading the live runtime.

The current feature feasibility artifact is
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-delta-feasibility.json`
(`sha256:abaff5fe8bcb09fa2e66e95dc640645f4cf59e80d68bddcbba0921e394fbf0a1`,
`proofHash:ed60244c6ea6548dbf7ff43ea154c38e4276d1ebd5b909860577f6f81c59ea01`).
It is bound to request `studio-run-in-game-mq20rbzr-1fhc`, saved proof hash
`f7d91ad72a6c998926fa24fd82266388420de99dbe338bf7d627448a760fe1ba`,
local-context hash
`945a49133d0493cc37cf28ff805637aaf5fc7032a6b3461b805a65ff8a861657`, and
matched live runtime identity `106x66`, `6996` plots, seed `138503614`, turn
`1`, game hash `0`. It probed all `5` feature delta cells with `0` omitted
cells and joined the prior local feature/natural-wonder evidence by plot index.

Feature feasibility facts:

| Class | Count | Evidence |
|---|---:|---|
| `local-feature-civ-infeasible-live-empty` | `1` | Local `FEATURE_COLD_REEF` at `(48,6)` has local reef intent, but current live `TerrainBuilder.canHaveFeature(48,6,FEATURE_COLD_REEF)` returns `false`. |
| `natural-wonder-offset-local-civ-infeasible` | `2` | Local natural-wonder footprint cells `(49,13)` / `(52,21)` return `false` for the local wonder feature. |
| `natural-wonder-offset-live-civ-infeasible` | `2` | Live natural-wonder cells `(48,13)` / `(51,21)` also return `false` for the live wonder feature even though the live grid contains that feature. |

Disposition:
the feature rows now have runtime-bound `TerrainBuilder.canHaveFeature`
evidence, but this is post-materialization readback. Because the live
natural-wonder cells that already contain the feature also return false, the
probe is not a clean pre-placement acceptance oracle and cannot by itself prove
that the local cells were invalid at materialization time. The evidence narrows
the next owner question to materialization-time feature stamping, natural-wonder
footprint/anchor semantics, runtime state, or readback policy. It does not
authorize feature repair, natural-wonder repair, parity closure, product
acceptance, or mountain-quality claims.

### Natural-Wonder Footprint Direction Context

Diagnostic repair:
`buildFeatureDeltaPlacementContexts` now records all six local map-policy
footprint direction alternatives for natural-wonder feature delta rows. This
does not change natural-wonder placement; it makes the direction/footprint
semantics visible for source-authority classification.

The current footprint direction artifact is
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-footprint-direction-context.json`
(`sha256:bbb9b1ce680af7e6f456cb7fb594b88d892a1fa3a8e1287982fb9a560b918c42`).
It is derived from the saved exact parity proof and the prior local
feature-context artifact; it is not a fresh exact-authored parity proof.

Direction facts:

| Feature | Local row | Live row | Local helper direction evidence | Live offset evidence |
|---|---|---|---|---|
| `FEATURE_KILIMANJARO` | `(49,13)` | `(48,13)` | Direction `0` contains the local row. | Directions `4` and `5` contain the live row; direction `5` contains both local and live delta cells. |
| `FEATURE_ZHANGJIAJIE` | `(52,21)` | `(51,21)` | Direction `0` contains the local row. | Direction `5` contains the live row. |

Disposition:
the natural-wonder rows now point at a likely `Direction:-1` / footprint
orientation semantics gap between local map-policy projection and Civ runtime
materialization. This is still classification evidence, not repair authority:
a natural-wonder repair must first accept the source owner explicitly, then
test the supported wonder catalog so one-row offset evidence does not regress
other footprint classes. No natural-wonder repair, parity closure, product
acceptance, or mountain-quality claim is authorized from this context alone.

### Planned Natural-Wonder Footprint Readback

Diagnostic repair:
`buildNaturalWonderFootprintReadbackContexts` now scores each planned natural
wonder represented in the local context artifact against local and live feature
grids across local map-policy direction alternatives `0..5`.

The current planned-footprint readback artifact is
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-natural-wonder-footprint-readback.json`
(`sha256:50ecdd1bee31c8243dac792b2d8d9fe5faae4d422cf0cae44f95a696d86d16a3`,
`proofHash:3e0389b5977d997ce40d5888c97e703397b518e5ff034911be70a949afd1d6b4`).
It is derived from the saved exact parity proof and prior local feature-context
artifact; it is not a fresh exact-authored parity proof.

Readback facts:

| Feature | Declared direction | Best local direction(s) | Best live direction(s) | Classification |
|---|---:|---|---|---|
| `FEATURE_KILIMANJARO` | `-1` | `0` (`3/3` local cells) | `0,1,4,5` (`2/3` live cells) | `local-live-same-direction` with partial/ambiguous live coverage |
| `FEATURE_ZHANGJIAJIE` | `-1` | `0` (`2/2` local cells) | `5` (`2/2` live cells) | `live-direction-differs-from-local` |

Disposition:
the planned-footprint readback confirms the natural-wonder offset class is not
random surface noise: at least one supported multi-tile wonder in this exact
run has live complete footprint coverage under a different direction than the
local projection. The readback set is still only `2` planned multi-tile wonders
from this request, and Kilimanjaro is live-partial/ambiguous, so this evidence
does not yet authorize a global `Direction:-1` footprint repair. It does
authorize the next source-owner decision to focus on local map-policy/mock
natural-wonder projection versus Civ runtime materialization semantics, with a
broader supported-catalog test or fresh exact-run proof required before repair
closure.

### Supported Natural-Wonder Footprint Catalog Context

Diagnostic repair:
`buildNaturalWonderFootprintCatalogContexts` now exposes the supported
natural-wonder catalog direction classes and joins exact-run footprint readback
rows by feature type. This records where official `naturalWonderDirection:-1`
is currently projected locally as direction `0`, without changing placement or
stamping behavior.

The current catalog context artifact is
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-natural-wonder-footprint-catalog-context.json`
(`sha256:34211c105979d84b780278e76e838102cea47c7c45e3fb9c24499cf5e34046ab`,
`proofHash:6ace44be42fc7b2a87d4a393d1ecb2c52af7bcb58dd90acdcc6e553e6338c009`).
It is derived from the planned-footprint readback artifact; it is not a fresh
exact-authored parity proof.

Catalog facts:

| Direction class | Count | Meaning |
|---|---:|---|
| `single-tile-direction-irrelevant` | `3` | Supported one-tile wonders where direction cannot move the footprint. |
| `official-fixed-direction` | `2` | Supported multi-tile wonders with explicit official direction values. |
| `unspecified-engine-direction-local-fixed-projection` | `5` | Supported multi-tile wonders with official `naturalWonderDirection:-1`; local projection currently uses direction `0`. |

Unspecified multi-tile catalog entries:
`FEATURE_REDWOOD_FOREST`, `FEATURE_KILIMANJARO`, `FEATURE_ZHANGJIAJIE`,
`FEATURE_TORRES_DEL_PAINE`, and `FEATURE_MACHAPUCHARE`.

Exact-run observed rows:

| Feature | Direction class | Readback disposition | Evidence |
|---|---|---|---|
| `FEATURE_KILIMANJARO` | `unspecified-engine-direction-local-fixed-projection` | `observed-ambiguous-or-partial` | local best direction `0` with `3/3`; live best directions `0,1,4,5` with `2/3`. |
| `FEATURE_ZHANGJIAJIE` | `unspecified-engine-direction-local-fixed-projection` | `observed-live-direction-drift` | local best direction `0` with `2/2`; live best direction `5` with `2/2`. |

Disposition:
the catalog context strengthens the classification that the natural-wonder
offset class belongs at the map-policy/mock natural-wonder projection versus
Civ runtime materialization boundary, not ecology feature density or resource
legality. It still does not authorize a global `Direction:-1` repair: only
`2/5` unspecified multi-tile entries have exact-run readback evidence here, and
Kilimanjaro remains ambiguous/partial. A repair layer must either collect
broader exact-run footprint evidence or explicitly constrain its owner claim to
supported catalog behavior with tests that protect fixed-direction and
single-tile entries.

### Natural-Wonder Live Proof Boundary

Diagnostic repair:
`buildNaturalWonderLiveProofBoundaryContext` now records whether
natural-wonder placement stats are present in local diagnostic evidence, exact
log telemetry, the exact live proof payload, and the exact live completion
payload. This keeps local placement counts from being mistaken for exact live
natural-wonder authorship evidence.

The current live-proof boundary artifact is
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-natural-wonder-live-proof-boundary.json`
(`sha256:1cd7da84ac26417f46c851b51e9abe4e146c0b4150c3a5ca104d577f1647ea4a`,
`proofHash:156386737ebde2b38fee76a3a8d716291acefb285be19a2a226129139ec81557`).
It is derived from the saved exact parity proof and prior local feature-context
artifact; it is not a fresh exact-authored parity proof.

Placement proof facts:

| Evidence source | Placement stats | Boundary |
|---|---|---|
| Local feature evidence | `planned:7`, `target:7`, `placed:7`, `rejected:0`, `shortfall:0` | Local exact-source diagnostic evidence only. |
| Exact log telemetry | missing | The saved `mq20rbzr` proof predates `NATURAL_WONDER_PLACEMENT_V1`. |
| Exact proof payload | missing | No `naturalWonderPlacement` stats in the live proof payload. |
| Exact completion payload | missing | No `naturalWonderPlacement` stats in the live completion payload. |

Disposition:
the boundary class is `local-placement-stats-only` and the artifact carries
unresolved link `natural-wonder.live-placement-stats`. The local placement
stats support row classification, but they do not close source authority for a
natural-wonder repair because the exact live proof packet does not yet carry
corresponding natural-wonder placement stats for the same request/config/seed
chain. No natural-wonder repair, parity closure, product acceptance, or
mountain-quality claim is authorized from local placement counts alone.

### Natural-Wonder Materialization Outcome Repair

Repair:
the natural-wonder materializer now treats planner shortfall, out-of-bounds
placement, adapter rejection, and footprint readback mismatch as measured
placement outcomes rather than fatal generation errors. It projects generated
feature-valid terrain across supported natural-wonder footprints before
stamping and uses the mock adapter to stamp/read back the full supported
footprint. Corrupt plan metadata remains fatal.

Accounting:
this is a synthetic, natural-wonder-only adoption of source behavior from stale
commit `b9a3e9d50`; it does not replay the stale commit's unrelated Studio,
package, config, generated, or build-surface changes. The accepted source
authority is repo-owned materialization behavior. Exact live placement telemetry
and parity/product acceptance remain separate proof classes.

Validation:

| Proof class | Result |
|---|---|
| Focused materialization tests | Passed `bun test mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`. |
| Adapter regression tests | Passed `bun test packages/civ7-adapter/test/mock-terrain-policy.test.ts`. |
| Diagnostics/parity unit tests | Passed `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`. |
| Placement contract tests | Passed `bun test mods/mod-swooper-maps/test/placement/placement-contracts.test.ts`. |
| Owner checks | Passed `bun run --cwd packages/civ7-adapter check`, `bun run --cwd packages/civ7-adapter build`, and `bun run --cwd mods/mod-swooper-maps check`. |
| OpenSpec strict validation | Passed `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`. |
| Current exact parity proof rerun | Blocked before parity evaluation by stale config key `/config/ecology-features/floodplainPlanning`; no parity closure claimed. |

### Natural-Wonder Exact Log Telemetry Binding

Instrumentation repair:
natural-wonder materialization now emits compact
`NATURAL_WONDER_PLACEMENT_V1` stats, and Studio exact authorship parses the
bounded marker only when it appears between the matching `[mapgen-proof]` and
`[mapgen-complete]` markers for the same request/config/envelope/seed chain.
`buildNaturalWonderLiveProofBoundaryContext` accepts this parsed exact log
telemetry as live placement evidence for future proof packets.

Boundary:
this is a proof-contract repair, not a natural-wonder placement repair. The
saved `studio-run-in-game-mq20rbzr-1fhc` proof still lacks the marker and
remains `local-placement-stats-only` with unresolved link
`natural-wonder.live-placement-stats`. A fresh exact-authored Studio Run in
Game is required before natural-wonder placement stats can support source-owner
classification for the feature offset rows. No natural-wonder footprint repair,
parity closure, product acceptance, Earthlike tuning, or mountain-quality claim
is authorized from the telemetry instrumentation alone.

Current drain validation:

| Proof class | Result |
|---|---|
| Studio exact-authorship parser tests | Passed `bun test apps/mapgen-studio/test/runInGame/proofIdentity.test.ts`. |
| Diagnostics/parity/materialization tests | Passed `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`. |
| Owner checks | Passed `bun run --cwd mods/mod-swooper-maps check` and `bun run --cwd apps/mapgen-studio check`. |
| OpenSpec strict validation | Passed `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict` and `bun run openspec:validate`. |
| Current exact parity proof rerun | Blocked before parity evaluation by stale config key `/config/ecology-features/floodplainPlanning`; no parity closure claimed. |

### Source-Recorded Fresh Natural-Wonder Telemetry Proof

Fresh exact-authored run recorded by the source telemetry branch:
`studio-run-in-game-mq2spmz0-1z4g`, launched from the saved
`studio-run-in-game-mq20rbzr-1fhc` source snapshot. This current drain preserves
the source-recorded evidence; it has not converted it into a new current-run
parity claim.

Artifacts:

| Artifact | Path | Identity |
|---|---|---|
| Request body | `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-telemetry-run-request.json` | `sha256:a68947c89abca086ca380ee035600b9e7c38a8278a5d895de4fcb64eb398efc2` |
| Completed Studio status | `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-telemetry-run-status.json` | `sha256:286e037b8ac2bdb9511dc23fa2649309d874949a76c8004c9a6327df79b7d608` |
| Full-grid parity proof | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2spmz0-1z4g-after-natural-wonder-telemetry.json` | `sha256:abb84c44b7b30221f49333983e8a650f0e0d0981be9a5d0e2b9a4c3018c07006`, `proofHash:1a28ab8c22902d274bff83be1efccbe376b0fbe5f4596d039c7e756e9eb9e24e` |
| Natural-wonder telemetry boundary | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2spmz0-1z4g-natural-wonder-telemetry-boundary.json` | `sha256:5b08c941493df87d4ab99c83092aba829e347a5add2be078f8c6443cc88b67d8`, `proofHash:7fb4c1eff15f36d0e69f8d762b7d6a0019f1c465023ba7e66e2e7bf5dab8d67c` |

Exact-authorship facts:

| Fact | Value |
|---|---|
| Exact authorship status | `complete`, no unresolved links |
| Runtime identity | `106x66`, `6996` plots, seed `138503614`, turn `1`, game hash `0`, source snapshot id `status:1:c153eb72`, snapshot hash `c153eb72` |
| Config/envelope | `c8bf167810f92f9a6096b298d1fcf3bb6b044a0fec22a9ad0ca9b35103982dca` / `a9a7bb73e9dd062e1da658a639bc02602e75b7fda1ca6d88123a1a2e9ac5f790` |
| Natural-wonder telemetry | `planned:7`, `target:7`, `placed:5`, `rejected:2`, `shortfall:0`, `rejectionExampleCount:2` |
| Local natural-wonder diagnostic stats | `planned:7`, `target:7`, `placed:7`, `rejected:0`, `shortfall:0` |

Fresh parity facts:

| Surface | Mismatches | Boundary |
|---|---:|---|
| terrain | `1/6996` | Still routed to terrain-edge diagnostics. |
| biome | `0/6996` | Matches. |
| feature | `5/6996` | Same feature row class remains unresolved. |
| resource | `61/6996` | Improved from the older `106/6996` class, but unresolved. |

Disposition:
the old `natural-wonder.live-placement-stats` blocker is resolved for this
fresh run. The new source-authority blocker is row-level identity: exact live
telemetry proves two natural-wonder placements were rejected, but the compact
marker does not identify which planned placements failed or bind the rejection
to the feature offset rows. This evidence points the next diagnostic at
natural-wonder placement/rejection coordinate identity. It does not authorize a
natural-wonder footprint repair, a global `Direction:-1` policy change, parity
closure, product acceptance, Earthlike tuning, or mountain-quality claims.

### Natural-Wonder Coordinate Proof Contract

Proof-contract repair:
`NATURAL_WONDER_PLACEMENT_V1` now includes bounded `rejectionExamples` and a
compact coordinate proof with deterministic placed/rejected counts and hashes.
Studio exact-authorship parsing exposes the proof as
`log.naturalWonderPlacement.coordinateProof`, and the diagnostic boundary
preserves it alongside local/live placement stats.

Boundary:
this contract is designed to make the next exact-authored proof row-auditable:
it should distinguish whether the local and live placement paths rejected the
same planned natural wonders, or whether the two live rejections identify a
specific candidate/footprint/materialization owner. The
`studio-run-in-game-mq2spmz0-1z4g` artifact predates this coordinate proof, so
it remains count-level evidence only; the next section records the fresh
`studio-run-in-game-mq2t7nqs-1z4g` coordinate proof that satisfies this
artifact gate. That newer evidence still requires source-owner classification
before any repair authority can be claimed.

Current drain validation:

| Proof class | Result |
|---|---|
| Studio exact-authorship parser tests | Passed `bun test apps/mapgen-studio/test/runInGame/proofIdentity.test.ts`. |
| Diagnostics/parity/materialization tests | Passed `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`. |
| Owner checks | Passed `bun run --cwd mods/mod-swooper-maps check` and `bun run --cwd apps/mapgen-studio check`. |
| OpenSpec strict validation | Passed `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict` and `bun run openspec:validate`. |
| Current exact parity proof rerun | Blocked before parity evaluation by stale config key `/config/ecology-features/floodplainPlanning`; no parity closure claimed. |

### Source-Recorded Fresh Natural-Wonder Coordinate Proof

Fresh exact-authored run recorded by the source coordinate branch:
`studio-run-in-game-mq2t7nqs-1z4g`, launched from the same saved
`studio-run-in-game-mq20rbzr-1fhc` source snapshot used for the natural-wonder
telemetry proof. This current drain preserves the source-recorded evidence; it
has not converted it into a new current-run parity claim.

Artifacts:

| Artifact | Path | Identity |
|---|---|---|
| Request body | `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-coordinate-run-request.json` | `sha256:a68947c89abca086ca380ee035600b9e7c38a8278a5d895de4fcb64eb398efc2` |
| Completed Studio status | `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-coordinate-run-status.json` | `sha256:e68a938d32cc919f3886cfec7c057348ee41c8b8c309eee812220100a43ba297` |
| Full-grid parity proof | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2t7nqs-1z4g-after-natural-wonder-coordinate-proof.json` | `sha256:1f042bf887453e3c0ee49b417d7da4b4eb1381820b849f00c92a8ca40d24c3ed`, `proofHash:ac28cced60b84d1d6f3e8cde90055fd20e5d8ffcb1382ae26740d90e57f70d35` |
| Natural-wonder coordinate boundary | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2t7nqs-1z4g-natural-wonder-coordinate-boundary.json` | `sha256:28c0ea7a0e4534181350c5122decf4f4daae763940baa96ccd784009edbf53f0`, `proofHash:6cdde0f4f0143bd6e1adad12ea4de75e999a8dcc94bd751569f95edaeff490bb` |

Exact-authorship facts:

| Fact | Value |
|---|---|
| Exact authorship status | `complete`, no unresolved links |
| Runtime identity | `106x66`, `6996` plots, seed `138503614`, turn `1`, game hash `0`, source snapshot id `status:1:c153eb72`, snapshot hash `c153eb72` |
| Config/envelope | `c8bf167810f92f9a6096b298d1fcf3bb6b044a0fec22a9ad0ca9b35103982dca` / `a9a7bb73e9dd062e1da658a639bc02602e75b7fda1ca6d88123a1a2e9ac5f790` |
| Natural-wonder telemetry | `planned:7`, `target:7`, `placed:5`, `rejected:2`, `shortfall:0` |
| Rejection examples | `feature=35 plot=1320 reason=adapter-rejected`; `feature=36 plot=2171 reason=adapter-rejected` |
| Coordinate proof | placed `5` / `537c7a40`; rejected `2` / `a6747920` |
| Local natural-wonder diagnostic stats | placed `7` / `68bda9ed`; rejected `0` / `811c9dc5` |

Fresh parity facts:

| Surface | Boundary |
|---|---|
| terrain | Still unresolved and routed to terrain-edge diagnostics. |
| biome | Matched in the proof summary. |
| feature | Still unresolved; the natural-wonder class now has row-level rejection identity. |
| resource | Still unresolved; resource coordinate proof remains a separate blocker. |

Disposition:
the coordinate-proof artifact resolves the prior row-identity gate for this
fresh run: exact live materialization rejected the planned Kilimanjaro and
Zhangjiajie placements, while the local diagnostic path still predicted seven
placed natural wonders and zero rejections. This supports the next
source-authority classification step for the natural-wonder feature rows, but
it is not itself a repair decision. Do not claim a global `Direction:-1`
policy fix, natural-wonder footprint repair, feature parity closure, product
acceptance, Earthlike tuning, or mountain-quality closure until the rejected
row evidence is explicitly assigned to a source owner and checked against the
supported natural-wonder catalog behavior.

### Natural-Wonder Source-Owner Classification

Classified rows:

| Rows | Features | Source-owner class | Evidence |
|---|---|---|---|
| F2/F3 | `FEATURE_KILIMANJARO` | repo-owned natural-wonder footprint projection/materialization emulation | Exact live coordinate proof rejects anchor plot `1320`; local direction-`0` footprint predicts plot `1427`; live grid contains the same feature at plot `1426`; supported alternatives show directions `4`/`5` can contain the live row. |
| F4/F5 | `FEATURE_ZHANGJIAJIE` | repo-owned natural-wonder footprint projection/materialization emulation | Exact live coordinate proof rejects anchor plot `2171`; local direction-`0` footprint predicts plot `2278`; live grid contains the same feature at plot `2277`; supported alternatives show direction `5` contains the live row. |

Classification rationale:
the exact-authored coordinate proof rules out a pure local-diagnostic artifact:
the live adapter path attempted the same planned anchors and rejected the two
multi-tile placements as `adapter-rejected`. The final live grid still contains
those same features on nearby supported footprint cells, so the product planner
did not merely over-request natural wonders and Civ did not simply omit them.
The repo-owned local/mock projection treats official `naturalWonderDirection:-1`
as direction `0`; the live Civ materialization path accepts `FeatureData` with
direction `-1` but does not produce the repo-predicted direction-`0` readback
footprint. The mismatch therefore belongs to the natural-wonder
projection/materialization emulation boundary between local map-policy/mock
prediction and live Civ runtime materialization.

Repair authority:
the next repair may change only the owner surface needed to make
unspecified-direction natural-wonder footprint projection auditable and
consistent with live materialization. It must preserve the supported catalog
boundary, avoid a broad product-tuning or generated-output edit, and be followed
by focused tests plus a fresh exact-authored final-surface proof. This
classification does not close feature parity, natural-wonder product behavior,
Earthlike acceptance, mountain quality, or global `Direction:-1` semantics.

### Natural-Wonder Projection/Materialization Repair

Repair:
the map-policy package now exposes a separate materialization-direction helper.
The official catalog direction remains `-1` for evidence and policy records,
but the placement-input derivation resolves that value to the explicit local
projection direction before natural-wonder planning and materialization. This
prevents the repaired path from validating footprint offsets for direction `0`
and then passing `Direction:-1` to Civ, which was the source of the exact-run
Kilimanjaro/Zhangjiajie rejection/readback split.

Verification boundary:
focused local tests cover the shared map-policy helper and the Swooper
derive-placement-inputs handoff into `planNaturalWonders`. This does not prove
final-surface parity. A fresh Studio Run in Game and exact-authored
final-surface parity proof are still required before marking the feature rows
resolved or making any product acceptance claim.

Current drain validation:
`bun test packages/civ7-map-policy/test/map-policy.test.ts`;
`bun test mods/mod-swooper-maps/test/placement/derive-placement-inputs.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`;
`bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`;
`bun run --cwd packages/civ7-map-policy check`;
`bun run --cwd packages/civ7-map-policy build`;
`bun run --cwd mods/mod-swooper-maps check`;
`bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`;
`bun run openspec:validate`;
`git diff --check && git diff --cached --check`.

Current exact parity rerun:
blocked before parity evaluation. The rerun command
`bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-natural-wonder-direction-repair.json`
returned
`Recipe compile failed: /config/ecology-features/floodplainPlanning: Unknown key`.

Source-recorded post-repair proof:
request `studio-run-in-game-mq2u6wdg-1z4g` completed exact authorship and
generated parity artifact
`/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-after-natural-wonder-materialization-repair.json`
(`sha256:2ab1115b4ed48614180d1982801149164c9fc1841360b3babacd817a43ebf171`,
`proofHash:8870e330478cb442496c10a45e2935787b317aee06625b8aab5d3831ea11d366`).
The exact live `log.naturalWonderPlacement` still reports `plannedCount:7`,
`placedCount:5`, `rejectedCount:2`, rejected examples
`feature=35 plot=1320 reason=adapter-rejected` and
`feature=36 plot=2171 reason=adapter-rejected`, and coordinate proof
`placedHash32:84d971d2` / `rejectedHash32:e69d9860`. The apparent `7/7/0`
placement signal came from local verifier generation, not the exact live log,
so the rejected-anchor class is not live-proven repaired. The final-surface
proof remains `unresolved`: terrain has `1` mismatch, feature has `5`
mismatches, and resource has `61` mismatches, with unresolved links
`surface.terrain.mismatch`, `surface.feature.mismatch`,
`surface.resource.mismatch`, and `resource-placement-coordinate-proof.placed`.
This proof does not close feature parity, natural-wonder product behavior,
Earthlike acceptance, mountain quality, final-surface parity, or the current
drain's blocked exact proof rerun.

### Post-Repair Feature Row Classification

Artifacts:

| Artifact | Path | Identity |
|---|---|---|
| Feature row context | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-feature-delta-context.json` | `sha256:8e4de756eac7f159d5e30b03025672e2fb2551d85386ba87c4230a4f01ee7bfe`, `proofHash:4393fe8e068b855d10ea9838e89e1e2dd32c55921cbbfb6a69c8c527453dbe21` |
| Feature feasibility readback | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-feature-delta-feasibility.json` | `sha256:b3b71d0c07b60c98ef251273ab8eefa3dbfcd69f1ffad446d79d6b2f42943acb`, `proofHash:7a1ac36288ade82d60aaa66ea56cf1ad9aea694405c0605ab00df468aa594920` |
| Natural-wonder footprint readback | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-natural-wonder-footprint-readback.json` | `sha256:690c80e7172d5cc3cc2a2c77f279a6c24436a4cc8e0773c8924455a5cb6c82ac`, `proofHash:d102c79f6bda3f22681ebcdc818e83223fa82e67cc468918d93807ea87bf64cb` |

Source-recorded runtime binding:
the feature feasibility artifact is bound to request
`studio-run-in-game-mq2u6wdg-1z4g`, source proof hash
`8870e330478cb442496c10a45e2935787b317aee06625b8aab5d3831ea11d366`, and
matched live identity `106x66`, `6996` plots, seed `138503614`, turn `1`,
game hash `0`; the live plot context read all `5` feature rows with `0`
omitted cells.

Row facts:

| Class | Count | Evidence | Source-authority disposition |
|---|---:|---|---|
| `local-only-ecology-feature` / `local-feature-civ-infeasible-live-empty` | `1` | `(48,6)` has local `FEATURE_COLD_REEF`, local reef intent, live empty feature, and post-run `TerrainBuilder.canHaveFeature(48,6,FEATURE_COLD_REEF)=false`. | Evidence-bound candidate for ecology feature eligibility/materialization repair, but not yet repair authority because the exact log packet lacks live feature-apply telemetry/readback for this row. |
| `natural-wonder-offset-local-anchor` / `natural-wonder-offset-local-civ-infeasible` | `2` | Local Kilimanjaro/Zhangjiajie footprint cells remain one tile from the live feature cells; exact live telemetry still reports `5` placed and `2` rejected natural wonders. | Unresolved natural-wonder materialization/deploy proof gap. Do not classify as accepted residual or product repair without a fresh exact run proving the repaired path live-effective. |
| `natural-wonder-offset-live-anchor` / `natural-wonder-offset-live-civ-infeasible` | `2` | Live Kilimanjaro/Zhangjiajie cells already contain the feature while `TerrainBuilder.canHaveFeature` still returns `false`, proving the probe is not a clean natural-wonder pre-placement oracle. | Unresolved materialization/readback evidence only; keep visible for parity accounting, but no repair/closure authority. |

Natural-wonder readback:
Kilimanjaro remains live-partial/ambiguous after repair (`3/3` local direction
`0`; `2/3` live under directions `0,1,4,5`). Zhangjiajie is complete under
live direction `5` versus local direction `0`. These remain final-grid
footprint/readback evidence rows only: the exact live log still reports
rejected planned anchors, so they cannot be treated as accepted residuals until
the materialization/deploy chain is reconciled by a fresh exact run.

Boundary:
this classification does not close feature parity, natural-wonder product
behavior, Earthlike acceptance, mountain quality, final-surface parity, reef
feature repair, or natural-wonder repair. The next valid movement is
source-authority classification for named natural-wonder `readback-mismatch`
evidence, plus exact live feature-apply telemetry/readback before authorizing a
cold-reef repair.

### Fresh Natural-Wonder Named Rejection Proof

Artifacts:

| Artifact | Path | Identity |
|---|---|---|
| Request body | `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-named-rejection-run-request.json` | `sha256:a68947c89abca086ca380ee035600b9e7c38a8278a5d895de4fcb64eb398efc2` |
| Completed Studio status | `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-named-rejection-run-status.json` | `sha256:e1ef7a6449ac7489383d4696f0130a1cba8699e7f8b4b24ab71d53608b145869` |
| Full-grid parity proof | `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2vqhg6-1z4g-after-natural-wonder-named-rejection-proof.json` | `sha256:631a2120ffaf70e54fdcad8ab3a5b1d0b62ff44b3be1a2f65c8674deb6f46bb3`, `proofHash:75f01f4d92d3b053df9337febea5cc0e266d1f603a024217a7be29e2b0407193` |

Exact-authored request `studio-run-in-game-mq2vqhg6-1z4g` completed exact
authorship with no unresolved links. Runtime identity is `106x66`, `6996`
plots, seed `138503614`, turn `1`, game hash `0`, source snapshot id
`status:1:c153eb72`, and snapshot hash `c153eb72`; the full-grid proof read
`17` chunks with `0` omitted plots and stable pre/post identity.

Natural-wonder exact live telemetry:

| Field | Value |
|---|---|
| Placement stats | `planned:7`, `target:7`, `placed:5`, `rejected:2`, `shortfall:0` |
| Rejection examples | `feature=35 plot=1320 reason=readback-mismatch`; `feature=36 plot=2171 reason=readback-mismatch` |
| Coordinate proof | placed `5` / `84d971d2`; rejected `2` / `ebd22c48` |
| Local verifier generation | `planned:7`, `target:7`, `placed:7`, `rejected:0`, `shortfall:0` |

Parity result:

| Surface | Result |
|---|---|
| terrain | `1/6996` mismatch, still routed to terrain-edge diagnostics. |
| biome | `0/6996` mismatches. |
| feature | `5/6996` mismatches; natural-wonder rows remain in the same offset/readback class with named rejection reason now available. |
| resource | `61/6996` mismatches; resource coordinate proof remains a separate blocker. |

Disposition:
the fresh proof resolves the old aggregate `adapter-rejected` opacity: both
remaining exact live natural-wonder rejected anchors are now named
`readback-mismatch`, not `can-have-feature-param-false` or
`set-feature-false`. This sharpens the next source-authority question toward
why the adapter write path can call Civ but the exact post-write readback does
not match the expected footprint at the authored anchor. It does not prove the
natural-wonder repair complete, does not authorize cold-reef repair, and does
not close feature parity, final-surface parity, Earthlike acceptance, product
acceptance, generated-output ownership, or mountain-quality work.

## Required Next Diagnostics

- Classify the natural-wonder materialization/deploy proof gap from the fresh
  named-rejection proof: local verifier generation reports `7/7/0`, while
  exact live telemetry for `studio-run-in-game-mq2vqhg6-1z4g` reports `5/2`
  and names both rejected anchors as `readback-mismatch`.
- Add or bind exact live feature-apply telemetry/readback before repairing the
  cold-reef local-only row.
- Continue resource-row classification using source-recorded coordinate proof
  and runtime-bound row evidence where applicable before changing resource
  tuning, scarcity floors, assignment ordering, or static policy; obtain a
  current exact-authored run before final closure.
- For resource rows, preserve resource spacing, age legality, and diversity
  evidence before any repair.
