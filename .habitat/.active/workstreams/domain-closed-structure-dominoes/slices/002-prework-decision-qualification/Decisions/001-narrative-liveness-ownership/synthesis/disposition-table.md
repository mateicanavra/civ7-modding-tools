# Narrative Liveness And Ownership Disposition Table

Status: synthesis artifact

Decision answered:

```text
determine which mods/mod-swooper-maps/src/domain/narrative/** paths and
symbols are live, which owner controls the live material, and which unused
material can be deleted.
```

## High-Level Decision

Current `mods/mod-swooper-maps/src/domain/narrative/**` is not part of the live
standard recipe. It is a legacy story/playability source network with tests and
public barrels, not a production recipe owner.

Disposition:

- empty domain ops are deletion-ready in a later implementation slice after
  import/type proof;
- behavior-bearing story code has no Domino 001 landing slot and is assigned to
  a later Gameplay/story-artifact owner-law domino;
- current tests under `mods/mod-swooper-maps/test/story/**` are compatibility
  evidence for that later owner-law decision;
- placement, resource, adapter, and Civ7 runtime narrative UI surfaces remain
  outside this packet.

## File-Level Dispositions

| Path or symbol | Liveness | Owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` | Mixed barrel: empty domain shell plus story exports | split by symbol | Apply symbol-level split below; no file-level single owner | verified | recipe omits narrative; Narsil/rg tests only; Gameplay owner boundary |
| `mods/mod-swooper-maps/src/domain/narrative/ops.ts` | No recipe caller | none | Delete | verified | recipe `collectCompileOps` omits narrative; KNIP unused file |
| `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts` | Empty contracts | none | Delete | verified | empty shell; KNIP unused export |
| `mods/mod-swooper-maps/src/domain/narrative/ops/index.ts` | Empty implementations | none | Delete | verified | recipe omits narrative; KNIP unused file |
| `mods/mod-swooper-maps/src/domain/narrative/config.ts` | Barrel/test-live config only | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino; no Domino 001 destination | corroborated | root config barrel; no stage caller; KNIP unused exports |
| `mods/mod-swooper-maps/src/domain/narrative/models.ts` | Internal only | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | internal imports only; owner-boundaries |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/keys.ts` | Test-live | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | tests; target story-artifact law required |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/normalize.ts` | Internal overlay support | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | internal imports only |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/registry.ts` | Test-live; internal publishers | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | Narsil refs tests/internal only |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/index.ts` | Public sub-barrel/test-live | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | root facade; KNIP unused default |
| `mods/mod-swooper-maps/src/domain/narrative/utils/dims.ts` | Internal only | Gameplay/story-artifact owner-law domino | Assign with parent story network | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/utils/adjacency.ts` | Internal only | Gameplay/story-artifact owner-law domino | Assign with parent story network | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/utils/latitude.ts` | Internal rift helper; KNIP unused file | Gameplay/story-artifact owner-law domino | Assign with rift/tagging network | verified | KNIP unused file; no external caller |
| `mods/mod-swooper-maps/src/domain/narrative/utils/rng.ts` | Internal only | Gameplay/story-artifact owner-law domino | Assign with parent story network | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/utils/water.ts` | Internal adapter-backed context read | adapter/runtime integration | Assign to later Gameplay/story-artifact owner-law only as an adapter/runtime integration requirement; not a pure domain-model slot | corroborated | direct `ctx.adapter.isWater` call; internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/config.ts` | Public config re-export; no production caller | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | root config; KNIP unused exports |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/types.ts` | Internal only; KNIP unused file | Gameplay/story-artifact owner-law domino | Assign with tagging network | verified | KNIP unused file |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/index.ts` | No external caller; KNIP unused file | Gameplay/story-artifact owner-law domino | Assign with tagging network | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/hotspots.ts` | No external caller; KNIP unused file | Gameplay/story-artifact owner-law domino | Assign with tagging network | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/margins.ts` | No external caller; KNIP unused file | Gameplay/story-artifact owner-law domino | Assign with tagging network | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/rifts.ts` | No external caller; KNIP unused file | Gameplay/story-artifact owner-law domino | Assign with tagging network | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/config.ts` | Test-live via config import | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | story test import; no stage caller |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/types.ts` | Internal corridor support | Gameplay/story-artifact owner-law domino | Assign with corridors network | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/state.ts` | Internal corridor support | Gameplay/story-artifact owner-law domino | Assign with corridors network | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/runtime.ts` | Internal corridor support | Gameplay/story-artifact owner-law domino | Assign with corridors network | corroborated | internal-only imports; KNIP unused exports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/style-cache.ts` | Internal module-cache helper | Gameplay/story-artifact owner-law domino | Assign with corridors network; later owner law must name cache/scoping law | corroborated | module cache evidence; no external caller |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/backfill.ts` | Internal corridor support | Gameplay/story-artifact owner-law domino | Assign with corridors network | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/sea-lanes.ts` | Internal corridor implementation; test-live indirectly | Gameplay/story-artifact owner-law domino | Assign with corridors network | corroborated | story corridor test through entry |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/island-hop.ts` | Internal corridor implementation; test-live indirectly | Gameplay/story-artifact owner-law domino | Assign with corridors network | corroborated | story corridor test through entry |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/land-corridors.ts` | Internal corridor implementation; test-live indirectly | Gameplay/story-artifact owner-law domino | Assign with corridors network | corroborated | story corridor test through entry |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/index.ts` | Test-live; no production caller | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | Narsil refs test/root facade only |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/config.ts` | Config re-export; internal orogeny use | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | root config; no stage caller |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/cache.ts` | Internal context-keyed cache | Gameplay/story-artifact owner-law domino | Assign with orogeny network; later owner law must name cache/scoping law | corroborated | module cache evidence |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts` | No caller found; KNIP unused export | none | Delete | verified | KNIP unused export; rg no caller |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/belts.ts` | Test-live; no production caller | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | Narsil refs test/root facade only |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` | Mixed wildcard barrel: story exports plus unused wind export | split by symbol | Apply symbol-level split below; no file-level single owner | corroborated | root facade only |

## Symbol-Level Barrel Splits

| Path or symbol | Liveness | Owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` default `domain` / `defineDomain({ id: "narrative", ops })` | Empty domain shell; no recipe caller | none | Delete with empty ops shell after import/type proof | verified | recipe omits narrative ops; empty contracts |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` import from `./ops/contracts.js` | Empty domain shell dependency | none | Delete with empty ops shell after import/type proof | verified | empty contracts |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` `storyTagStrategicCorridors` export | Test-live story behavior | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | story test import; no production recipe caller |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` `storyTagOrogenyBelts` export | Test-live story behavior | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | story test import; no production recipe caller |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` overlay exports | Test-live story overlay helpers | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | story test import; overlay refs |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `belts.ts` | Test-live story behavior | Gameplay/story-artifact owner-law domino | Assign to Gameplay/story-artifact owner-law domino | corroborated | story test import |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `cache.ts` | Internal orogeny cache surface | Gameplay/story-artifact owner-law domino | Assign with orogeny network; later owner law must name cache/scoping law | corroborated | module cache evidence |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `wind.ts` | No caller found | none | Delete with `orogeny/wind.ts` after import/type proof | verified | KNIP unused export; rg no caller |

## Collar Dispositions

| Path or symbol | Liveness | Owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/index.ts` narrative export | Public collar only | Gameplay/story-artifact owner-law domino | Assign with narrative root facade; remove only in the slice that decommissions the story network | verified | rg no production caller; domain scope public law |
| `mods/mod-swooper-maps/src/domain/config.ts` narrative export | Public config collar only | Gameplay/story-artifact owner-law domino | Assign with narrative config facade; remove only in the slice that decommissions the story network | verified | rg no production stage caller |
| `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` | No narrative binding | recipe authority | No write needed for this decision; keep as proof that narrative is absent from standard recipe | verified | current recipe source |
| `mods/mod-swooper-maps/src/recipes/standard/runtime.ts` `storyEnabled` | Runtime flag only | standard recipe runtime | Out of this packet; no action | verified | runtime source; no import/call into `domain/narrative/**` |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-discoveries/materialize.ts` narrative-system comment | Placement discovery materialization | placement/adapter stage | Out of this packet; no action | verified | placement stage source; official generator owner |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/contract/discovery-placement-outcomes.contract.ts` narrative-system comment | Placement discovery artifact contract | placement artifact contract | Out of this packet; no action | verified | placement artifact source; discovery placement owner |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts` Narrative downstream-consumer description | Hydrology artifact description | hydrology stage/artifact contract | Out of this packet; no action | verified | hydrology artifact source; no import/call into `domain/narrative/**` |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts` Narrative downstream-consumer/bias descriptions | Hydrology advisory artifact descriptions | hydrology stage/artifact contract | Out of this packet; no action | verified | hydrology artifact source; no import/call into `domain/narrative/**` |
| `mods/mod-swooper-maps/test/story/overlays.test.ts` | Test-live only | Gameplay/story-artifact owner-law domino | Assign with overlay story surface | corroborated | test import evidence; owner-boundaries |
| `mods/mod-swooper-maps/test/story/orogeny.test.ts` | Test-live only | Gameplay/story-artifact owner-law domino | Assign with orogeny story surface | corroborated | test import evidence |
| `mods/mod-swooper-maps/test/story/corridors.test.ts` | Test-live only | Gameplay/story-artifact owner-law domino | Assign with corridor story surface | corroborated | test import evidence |
| `packages/civ7-direct-control/src/play/operations/narrative-request.ts` | Live runtime/control operation | direct-control runtime | Out of this packet; no action | verified | direct-control source references; unrelated owner |
| `packages/civ7-direct-control/src/proof/narrative-choice-proof-policy.ts` | Live runtime/control proof policy | direct-control runtime proof | Out of this packet; no action | verified | direct-control source references; unrelated owner |
| `packages/cli/src/commands/game/play/choose-narrative.ts` | Live CLI command | CLI/direct-control command surface | Out of this packet; no action | verified | CLI source references; unrelated owner |

## Implementation-Ready Rows

These rows can enter a later deletion slice after import/type proof:

- `mods/mod-swooper-maps/src/domain/narrative/ops.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/narrative/index.ts` default domain / ops-contract import
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts`
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `wind.ts`

These rows are assigned to the Gameplay/story-artifact owner-law decision before
any retention, movement, or deletion:

- behavior-bearing story/corridor/orogeny/overlay code;
- story config schemas;
- story tests that define compatibility expectations.

No current row has a qualified Domino 001 destination inside the domain
closed-structure geometry.
