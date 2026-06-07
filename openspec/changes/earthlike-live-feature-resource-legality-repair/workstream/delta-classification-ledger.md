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
  (`sha256:e07418f9ab3efbab81beb6d5c6a9b68e1e40460b6d7421b5b1248a1e0578494c`,
  `proofHash:d95d54d2f208436324d7600a0c8a8a35e899ff82c617be4b719dfc954c6897df`).
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
- Source proof: assignment-evidence artifact
  `d95d54d2f208436324d7600a0c8a8a35e899ff82c617be4b719dfc954c6897df`.
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
| `local-assigned-live-empty`, local infeasible | `9` | Local mock/static policy over-accepted a resource Civ rejects under the loose feasibility probe. This is the next focused adapter/map-policy repair class. |
| `local-assigned-live-substitution`, both feasible | `31` | Both local and live resource values are Civ-feasible at the tile; this is assignment/type-order divergence, not simple legality. |
| `local-assigned-live-substitution`, both infeasible | `1` | Preserve as an individual evidence row before repair; neither probed value is feasible under the loose check on the current live map. |

Disposition:
the feasibility readback narrows but does not close source authority. Most
remaining rows are now assignment ordering/rebalance evidence, not map-policy
surface legality. A smaller `9`-row local-overacceptance class is likely
adapter/map-policy-owned, but it still needs row-level symbol/context
extraction before a focused policy repair. No resource density, diversity,
terrain, coast, or Earthlike tuning is authorized.

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
| `local-overaccepted-live-empty` | Local placed a resource Civ rejects on that cell under loose feasibility; this is the focused `9`-row mock/static-policy overacceptance investigation class. |
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
(`sha256:2ec76e1329ab0b103e4f210c38d57ea3ea562616bad101ada0825d7cc10f8b6b`,
`proofHash:08f5092303026bb0dd3bbc161bd2adff2984c6bb996cba6ab4758fd581118c8e`).

Source proof:
`d95d54d2f208436324d7600a0c8a8a35e899ff82c617be4b719dfc954c6897df`.

Request identity:
`studio-run-in-game-mq20rbzr-1fhc`, matched across exact-authorship summary,
exact-authorship packet, source snapshot, and log request id.

Runtime identity:
saved and observed identities match at width `106`, height `66`, plot count
`6996`, seed `138503614`, turn `1`, and game hash `0`.

Readback:
Tuner state `1`, host `127.0.0.1`, port `4318`, `106` cells, `0` omitted
cells.

`ignoreWeight:true` row classes:

| Class | Count | Source-authority status |
|---|---:|---|
| `live-feasible-no-local-assignment` | `37` | Assignment ordering/rebalance pending. |
| `local-feasible-live-empty` | `28` | Assignment ordering/rebalance pending. |
| `local-overaccepted-live-empty` | `9` | Focused mock/static-policy overacceptance investigation. |
| `substitution-both-feasible` | `31` | Assignment/type-order divergence pending. |
| `substitution-both-infeasible` | `1` | Individual unresolved row; no repair authority yet. |

Focused `local-overaccepted-live-empty` rows:

| Coordinate | Plot | Local resource | Planned preferred | Surface | Static local legality | Civ loose feasibility |
|---|---:|---|---|---|---|---|
| `(34,2)` | `246` | `RESOURCE_CLAY` | empty | `TERRAIN_FLAT` / `BIOME_TUNDRA` / `FEATURE_TUNDRA_BOG` | true / none | false |
| `(31,4)` | `455` | `RESOURCE_CLAY` | empty | `TERRAIN_FLAT` / `BIOME_TUNDRA` / `FEATURE_TUNDRA_BOG` | true / none | false |
| `(56,6)` | `692` | `RESOURCE_GYPSUM` | empty | `TERRAIN_HILL` / `BIOME_TUNDRA` / empty | true / none | false |
| `(16,12)` | `1288` | `RESOURCE_WOOL` | `RESOURCE_WOOL` | `TERRAIN_HILL` / `BIOME_TROPICAL` / empty | true / none | false |
| `(12,19)` | `2026` | `RESOURCE_JADE` | `RESOURCE_SILK` | `TERRAIN_FLAT` / `BIOME_TROPICAL` / empty | true / none | false |
| `(9,21)` | `2235` | `RESOURCE_HORSES` | `RESOURCE_COWRIE` | `TERRAIN_FLAT` / `BIOME_GRASSLAND` / empty | true / none | false |
| `(72,35)` | `3782` | `RESOURCE_RICE` | empty | `TERRAIN_FLAT` / `BIOME_TROPICAL` / `FEATURE_MANGROVE` | true / none | false |
| `(86,38)` | `4114` | `RESOURCE_CLAY` | empty | `TERRAIN_FLAT` / `BIOME_TROPICAL` / `FEATURE_MANGROVE` | true / none | false |
| `(67,51)` | `5473` | `RESOURCE_KAOLIN` | `RESOURCE_SILVER` | `TERRAIN_FLAT` / `BIOME_GRASSLAND` / `FEATURE_MARSH` | true / none | false |

Individual `substitution-both-infeasible` row:

| Coordinate | Plot | Local resource | Live resource | Planned preferred | Local outcome | Civ loose feasibility |
|---|---:|---|---|---|---|---|
| `(69,32)` | `3461` | `RESOURCE_CLAY` | `RESOURCE_RICE` | empty | `RESOURCE_CLAY` | local false / live false |

Disposition:
the full artifact supersedes the prior summary-only feasibility evidence for
row-level inspection. It still does not authorize tuning or parity closure.
The next code repair, if any, must prove whether the `9` focused rows are a
repo-owned mock/static-policy gap or accepted engine/materialization behavior.
The single both-infeasible substitution row remains outside that repair class.

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
