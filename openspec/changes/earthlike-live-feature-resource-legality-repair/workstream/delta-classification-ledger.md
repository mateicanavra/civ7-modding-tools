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
saved proof packet. A full final-surface verifier rerun against
`studio-run-in-game-mq20rbzr-1fhc` could not be completed after Studio was
restarted because the new Studio server instance no longer had that request id
in memory. This lane therefore has no post-repair exact-authored live parity
closure artifact yet.

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
