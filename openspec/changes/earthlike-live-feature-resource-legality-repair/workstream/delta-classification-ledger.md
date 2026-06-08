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
| F1 | `(48,6)` | `FEATURE_COLD_REEF` (`11`) | empty | pending | Check official/static feature legality for cold reef at this terrain/biome/coast context, then compare local `features-apply` attempted/applied/rejected telemetry against live materialization. |
| F2 | `(48,13)` | empty | `FEATURE_KILIMANJARO` (`35`) | pending | Treat with F3 as a possible natural-wonder footprint/anchor-direction mismatch; inspect placement plan, stamped anchor, footprint catalog, and live feature footprint. |
| F3 | `(49,13)` | `FEATURE_KILIMANJARO` (`35`) | empty | pending | Pair with F2 before repair; do not classify as accepted wonder semantics without placement telemetry. |
| F4 | `(51,21)` | empty | `FEATURE_ZHANGJIAJIE` (`36`) | pending | Treat with F5 as a possible natural-wonder footprint/anchor-direction mismatch; inspect placement plan, stamped anchor, footprint catalog, and live feature footprint. |
| F5 | `(52,21)` | `FEATURE_ZHANGJIAJIE` (`36`) | empty | pending | Pair with F4 before repair; do not classify as accepted wonder semantics without placement telemetry. |

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

## Required Next Diagnostics

- Extract local row context for every feature/resource mismatch: terrain,
  biome, feature, resource, placement intent, placement assignment, adapter
  rejection/mismatch reason, and spacing neighbor context.
- Compare each row against official/static policy and, where available, live
  `canHaveFeature`/`canHaveResource` behavior for the same tile and candidate
  type.
- For natural-wonder rows, compare planned anchor/direction/footprint against
  local materialized feature grid and live feature grid before accepting an
  engine-footprint disposition.
- For resource rows, preserve resource spacing, age legality, and diversity
  evidence before any repair.
