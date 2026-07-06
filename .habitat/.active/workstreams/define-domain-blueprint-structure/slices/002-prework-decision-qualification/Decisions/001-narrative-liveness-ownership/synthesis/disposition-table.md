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

- empty domain ops and the unused orogeny wind helper were deleted in Slice 1
  after import/type proof;
- behavior-bearing story code has no Slice 001 landing slot and is assigned to
  Slice 3 deletion with no replacement in this cleanup;
- current tests under `mods/mod-swooper-maps/test/story/**` are compatibility
  evidence for the removed implementation and are assigned to Slice 3 deletion;
- connected story compatibility state in `@swooper/mapgen-core` and standard
  runtime is assigned to Slice 4 removal;
- placement, resource, adapter, and Civ7 runtime narrative UI surfaces remain
  outside this packet.

## File-Level Dispositions

| Path or symbol | Liveness | Owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` | Story exports only after Slice 1 shell deletion | retired MapGen story network | Delete current implementation, no replacement in this cleanup | verified | recipe omits narrative; rg tests only; public collar/test liveness |
| `mods/mod-swooper-maps/src/domain/narrative/ops.ts` | No recipe caller | none | Deleted in Slice 1 | verified | recipe `collectCompileOps` omits narrative; KNIP unused file |
| `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts` | Empty contracts | none | Deleted in Slice 1 | verified | empty shell; KNIP unused export |
| `mods/mod-swooper-maps/src/domain/narrative/ops/index.ts` | Empty implementations | none | Deleted in Slice 1 | verified | recipe omits narrative; KNIP unused file |
| `mods/mod-swooper-maps/src/domain/narrative/config.ts` | Barrel/test-live config only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | root config barrel; no stage caller; KNIP unused exports |
| `mods/mod-swooper-maps/src/domain/narrative/models.ts` | Internal only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal imports only; owner-boundaries |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/keys.ts` | Test-live | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | tests; compatibility evidence only |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/normalize.ts` | Internal overlay support | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal imports only |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/registry.ts` | Test-live; internal publishers | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | Narsil refs tests/internal only |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/index.ts` | Public sub-barrel/test-live | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | root facade; KNIP unused default |
| `mods/mod-swooper-maps/src/domain/narrative/utils/dims.ts` | Internal only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/utils/adjacency.ts` | Internal only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/utils/latitude.ts` | Internal rift helper; KNIP unused file | retired MapGen story network | Delete current implementation, no replacement in this cleanup | verified | KNIP unused file; no external caller |
| `mods/mod-swooper-maps/src/domain/narrative/utils/rng.ts` | Internal only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/utils/water.ts` | Internal adapter-backed context read | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | direct `ctx.adapter.isWater` call is internal to the deleted story network |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/config.ts` | Public config re-export; no production caller | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | root config; KNIP unused exports |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/types.ts` | Internal only; KNIP unused file | retired MapGen story network | Delete current implementation, no replacement in this cleanup | verified | KNIP unused file |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/index.ts` | No external caller; KNIP unused file | retired MapGen story network | Delete current implementation, no replacement in this cleanup | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/hotspots.ts` | No external caller; KNIP unused file | retired MapGen story network | Delete current implementation, no replacement in this cleanup | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/margins.ts` | No external caller; KNIP unused file | retired MapGen story network | Delete current implementation, no replacement in this cleanup | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/rifts.ts` | No external caller; KNIP unused file | retired MapGen story network | Delete current implementation, no replacement in this cleanup | verified | KNIP unused file; rg no callers |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/config.ts` | Test-live via config import | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story test import; no stage caller |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/types.ts` | Internal corridor support | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/state.ts` | Internal corridor support | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/runtime.ts` | Internal corridor support | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal-only imports; KNIP unused exports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/style-cache.ts` | Internal module-cache helper | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | module cache evidence; no external caller |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/backfill.ts` | Internal corridor support | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | internal-only imports |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/sea-lanes.ts` | Internal corridor implementation; test-live indirectly | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story corridor test through entry |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/island-hop.ts` | Internal corridor implementation; test-live indirectly | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story corridor test through entry |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/land-corridors.ts` | Internal corridor implementation; test-live indirectly | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story corridor test through entry |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/index.ts` | Test-live; no production caller | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | Narsil refs test/root facade only |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/config.ts` | Config re-export; internal orogeny use | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | root config; no stage caller |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/cache.ts` | Internal context-keyed cache | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | module cache evidence |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts` | No caller found; KNIP unused export | none | Deleted in Slice 1 | verified | KNIP unused export; rg no caller |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/belts.ts` | Test-live; no production caller | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | Narsil refs test/root facade only |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` | Story exports only after Slice 1 wind deletion | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | root facade only |

## Symbol-Level Barrel Splits

| Path or symbol | Liveness | Owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` default `domain` / `defineDomain({ id: "narrative", ops })` | Empty domain shell; no recipe caller | none | Deleted in Slice 1 | verified | recipe omits narrative ops; empty contracts |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` import from `./ops/contracts.js` | Empty domain shell dependency | none | Deleted in Slice 1 | verified | empty contracts |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` `storyTagStrategicCorridors` export | Test-live story behavior | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story test import; no production recipe caller |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` `storyTagOrogenyBelts` export | Test-live story behavior | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story test import; no production recipe caller |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` overlay exports | Test-live story overlay helpers | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story test import; overlay refs |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `belts.ts` | Test-live story behavior | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | story test import |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `cache.ts` | Internal orogeny cache surface | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | module cache evidence |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `wind.ts` | No caller found | none | Deleted in Slice 1 | verified | KNIP unused export; rg no caller |

## Collar Dispositions

| Path or symbol | Liveness | Owner | Disposition | Evidence strength | Governing authority |
| --- | --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/index.ts` narrative export | Public collar only | retired MapGen story network | Remove root narrative collar in Slice 3 | verified | rg no production caller; domain scope public law |
| `mods/mod-swooper-maps/src/domain/config.ts` narrative export | Public config collar only | retired MapGen story network | Remove root narrative config collar in Slice 3 | verified | rg no production stage caller |
| `.habitat/blueprints/domain-operation/require_domain_ops_root_presence` narrative scope | Habitat migrated ops-root authority | domain-operation authority | Remove narrative from explicit migrated ops-root list in Slice 3 | verified | Slice 1 removed narrative ops shell; isolated Habitat rule fails until this authority is updated |
| `.habitat/blueprints/domain-operation/prohibit_rng_callback_state_in_ops` narrative path coverage | Habitat domain-operation rule coverage | domain-operation authority | Remove deleted narrative ops path from explicit coverage in Slice 3 | verified | Narrative ops root was deleted in Slice 1 |
| `.habitat/blueprints/domain/prohibit_domain_entrypoint_self_reexports` narrative path coverage | Habitat domain entrypoint rule coverage | domain authority | Remove deleted narrative entrypoint from explicit coverage in Slice 3 | verified | Narrative entrypoint is deleted in Slice 3 |
| `.habitat/civ7/mapgen/domains/narrative/rules/require_narrative_hotspot_overlay_owner` | Habitat positive HOTSPOTS publisher owner rule | retired MapGen story network | Delete rule with story network in Slice 3 | verified | Rule positively requires `domain/narrative/tagging/hotspots.ts`, which Slice 3 deletes as retired implementation |
| `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_hotspot_overlay_publishers` | Habitat negative HOTSPOTS publisher rule | retired story-overlay compatibility authority | Delete stale story-overlay rule in Slice 3 | verified | HOTSPOTS overlay publishing concept is removed with the story overlay implementation |
| `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_story_overlay_contract_artifact` | Habitat stale `artifact:storyOverlays` rule | retired story-overlay compatibility authority | Delete stale story-overlay rule in Slice 3 | verified | Existing remediation matrix already classifies `artifact:storyOverlays` as stale retired-token garbage collection |
| `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` | No narrative binding | recipe authority | No write needed for this decision; keep as proof that narrative is absent from standard recipe | verified | current recipe source |
| `mods/mod-swooper-maps/src/recipes/standard/runtime.ts` `storyEnabled` | Compatibility flag for retired story overlay network | standard recipe runtime | Remove in Slice 4 | verified | no remaining story implementation consumes the flag; Slice 4 removes all callers |
| `packages/mapgen-core/src/core/types.ts` `StoryOverlaySnapshot` / `StoryOverlayRegistry` | Compatibility types for retired story overlay network | mapgen-core compatibility surface | Remove in Slice 4 | verified | `domain/narrative/overlays/**` deleted; no non-story consumers |
| `packages/mapgen-core/src/core/types.ts` `ExtendedMapContext.overlays` | Compatibility registry for retired story overlay network | mapgen-core compatibility surface | Remove in Slice 4 | verified | story overlay registry deleted; no non-story consumers |
| `packages/mapgen-core/src/core/index.ts` `storyKey` / `parseStoryKey` | Story-named public helper with no non-story consumers | mapgen-core compatibility surface | Remove in Slice 4 review repair | verified | `rg` finds only core utility tests after story network deletion |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-discoveries/materialize.ts` narrative-system comment | Placement discovery materialization | placement/adapter stage | Out of this packet; no action | verified | placement stage source; official generator owner |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/contract/discovery-placement-outcomes.contract.ts` narrative-system comment | Placement discovery artifact contract | placement artifact contract | Out of this packet; no action | verified | placement artifact source; discovery placement owner |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts` Narrative downstream-consumer description | Hydrology artifact description | hydrology stage/artifact contract | Out of this packet; no action | verified | hydrology artifact source; no import/call into `domain/narrative/**` |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts` Narrative downstream-consumer/bias descriptions | Hydrology advisory artifact descriptions | hydrology stage/artifact contract | Out of this packet; no action | verified | hydrology artifact source; no import/call into `domain/narrative/**` |
| `mods/mod-swooper-maps/test/story/overlays.test.ts` | Test-live only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | test import evidence; owner-boundaries |
| `mods/mod-swooper-maps/test/story/orogeny.test.ts` | Test-live only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | test import evidence |
| `mods/mod-swooper-maps/test/story/corridors.test.ts` | Test-live only | retired MapGen story network | Delete current implementation, no replacement in this cleanup | corroborated | test import evidence |
| `packages/civ7-direct-control/src/play/operations/narrative-request.ts` | Live runtime/control operation | direct-control runtime | Out of this packet; no action | verified | direct-control source references; unrelated owner |
| `packages/civ7-direct-control/src/proof/narrative-choice-proof-policy.ts` | Live runtime/control proof policy | direct-control runtime proof | Out of this packet; no action | verified | direct-control source references; unrelated owner |
| `packages/cli/src/commands/game/play/choose-narrative.ts` | Live CLI command | CLI/direct-control command surface | Out of this packet; no action | verified | CLI source references; unrelated owner |

## Implementation-Ready Rows

These empty-shell rows were removed in Slice 1 after import/type proof:

- `mods/mod-swooper-maps/src/domain/narrative/ops.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts`
- `mods/mod-swooper-maps/src/domain/narrative/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/narrative/index.ts` default domain / ops-contract import
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts`
- `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` wildcard export from `wind.ts`

These rows are assigned to Slice 3 deletion with no replacement in this cleanup:

- behavior-bearing story/corridor/orogeny/overlay code;
- story config schemas;
- story tests that define compatibility expectations.

No current row has a qualified Slice 001 destination inside the domain
closed-structure geometry.
