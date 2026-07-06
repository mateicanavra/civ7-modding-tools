# Narrative Source Inventory

Status: sealed historical source corpus artifact

This corpus records the source network that existed during the narrative
burn-down decision. It is retained as proof for the completed deletion, not as
current source inventory. After Slice 1 shell deletion, the corpus contained 32
files under `mods/mod-swooper-maps/src/domain/narrative/**`.

## Evidence Summary

- `mods/mod-swooper-maps/src/domain/index.ts` publicly re-exports narrative as
  a domain namespace.
- `mods/mod-swooper-maps/src/domain/config.ts` publicly re-exports narrative
  config.
- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` imports domain ops for
  ecology, foundation, hydrology, morphology, placement, and resources, but not
  narrative.
- No production TypeScript caller outside `domain/narrative/**` was found for
  narrative behavior exports.
- Slice 1 removed the empty `ops` shell and unused `orogeny/wind.ts` helper.
- Current story tests import and call narrative surfaces under
  `mods/mod-swooper-maps/test/story/**`.

## Collar Inventory

| Collar path | Current role | Narrative connection | Liveness evidence | Evidence tag |
| --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/index.ts` | Root domain barrel | `export * as narrative from "@mapgen/domain/narrative/index.js"` | Public export exists; no production import of this namespace found. | public-collar-only |
| `mods/mod-swooper-maps/src/domain/config.ts` | Root config barrel | `export * from "./narrative/config.js"` | Public export exists; no production stage caller found. | public-collar-only |
| `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` | Standard recipe domain binding list | Omits `@mapgen/domain/narrative/ops` | Strong negative liveness evidence for narrative domain ops. | recipe-non-caller |
| `mods/mod-swooper-maps/src/recipes/standard/runtime.ts` | Standard runtime state | `storyEnabled` runtime flag | Standard runtime state, not an import or caller of `domain/narrative/**`. | runtime-name-collar |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-discoveries/materialize.ts` | Placement discovery materialization | Uses Civ7 official discovery generator; comment names live narrative-system product. | Placement/adapter stage source, not a narrative-domain caller. | placement-name-collar |
| `mods/mod-swooper-maps/src/recipes/standard/stages/placement/artifacts/contract/discovery-placement-outcomes.contract.ts` | Placement discovery artifact contract | Artifact docs explain discovery type/site selection as live narrative-system product. | Placement artifact owner; not a narrative-domain caller. | placement-name-collar |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-baseline/artifacts.ts` | Hydrology climate field artifact contract | Description names Narrative as a downstream consumer of rainfall/humidity fields. | Stage-owned artifact description; not a narrative-domain caller. | hydrology-name-collar |
| `mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-climate-refine/artifacts.ts` | Hydrology climate indices/diagnostics artifact contracts | Descriptions name Narrative as a downstream consumer/bias target for climate indices. | Stage-owned advisory artifact description; not a narrative-domain caller. | hydrology-name-collar |
| `packages/civ7-direct-control/src/play/operations/narrative-request.ts` | Direct-control runtime operation | Sends and verifies Civ7 native `CHOOSE_NARRATIVE_STORY_DIRECTION`. | Separate runtime/control owner; not MapGen narrative-domain liveness. | runtime-name-collar |
| `packages/civ7-direct-control/src/proof/narrative-choice-proof-policy.ts` | Direct-control proof policy | Classifies postconditions for live narrative choices. | Separate runtime/control owner; not MapGen narrative-domain liveness. | runtime-name-collar |
| `packages/cli/src/commands/game/play/choose-narrative.ts` | CLI command | User-facing control command for live narrative choice validation/send. | Separate CLI/direct-control owner; not MapGen narrative-domain liveness. | runtime-name-collar |
| `mods/mod-swooper-maps/test/story/overlays.test.ts` | Test caller | Root narrative overlay helpers | Calls overlay registry helpers and keys. | test-live |
| `mods/mod-swooper-maps/test/story/orogeny.test.ts` | Test caller | Root narrative orogeny export | Calls `storyTagOrogenyBelts`. | test-live |
| `mods/mod-swooper-maps/test/story/corridors.test.ts` | Test caller | Root narrative corridor export and config schema | Calls `storyTagStrategicCorridors`; imports `CorridorsConfigSchema`. | test-live |

## Source Inventory

| Path | Current role | Exported symbols | External importers/callers found | Evidence tag |
| --- | --- | --- | --- | --- |
| `mods/mod-swooper-maps/src/domain/narrative/index.ts` | Root narrative facade after Slice 1 shell deletion | corridor/orogeny/overlay exports | `domain/index.ts`; story tests through package alias | public-collar-only; test-live |
| `mods/mod-swooper-maps/src/domain/narrative/ops.ts` | Deleted in Slice 1 | none | No standard recipe import found | empty-domain-shell-deleted |
| `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts` | Deleted in Slice 1 | none | Internal only before deletion | empty-domain-shell-deleted |
| `mods/mod-swooper-maps/src/domain/narrative/ops/index.ts` | Deleted in Slice 1 | none | Internal only before deletion | empty-domain-shell-deleted |
| `mods/mod-swooper-maps/src/domain/narrative/config.ts` | Root story config aggregate | `NarrativeConfigSchema`; `StoryConfig`; subconfig exports | `domain/config.ts`; test imports direct corridor schema through this path | public-collar-only; test-live |
| `mods/mod-swooper-maps/src/domain/narrative/models.ts` | Story motif/corridor model types | motif and corridor interfaces | Internal only | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/keys.ts` | Overlay key constants | `STORY_OVERLAY_KEYS`; `StoryOverlayKey` | Root story tests through facade | test-live |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/normalize.ts` | Overlay normalizer | `normalizeOverlay` | Internal registry use | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/registry.ts` | Overlay registry helpers | `resetStoryOverlays`; `publishStoryOverlay`; `finalizeStoryOverlay`; `getStoryOverlay` | Root story tests; internal publishers | test-live |
| `mods/mod-swooper-maps/src/domain/narrative/overlays/index.ts` | Overlay barrel/default object | overlay helper/key exports; default object | Root facade; internal callers | public sub-barrel |
| `mods/mod-swooper-maps/src/domain/narrative/utils/dims.ts` | Context dimensions helper | `getDims` | Internal only | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/utils/adjacency.ts` | Water/land adjacency helpers | `isAdjacentToLand`; `isCoastalLand`; `isAdjacentToShallowWater` | Internal only | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/utils/latitude.ts` | Latitude helper | `latitudeAbsDeg` | Internal only; KNIP unused-file hit | possible-unused-helper |
| `mods/mod-swooper-maps/src/domain/narrative/utils/rng.ts` | Context RNG wrapper | `rand` | Internal only | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/utils/water.ts` | Adapter-backed water read helper | `isWaterAt` | Internal only | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/config.ts` | Hotspot/rift/margin schemas | `HotspotTunablesSchema`; `RiftTunablesSchema`; `ContinentalMarginsConfigSchema`; types | Root config facade; internal tagging | behavior-bearing-no-prod-caller |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/types.ts` | Tagging option/result types | tagging interfaces | Internal only; KNIP unused-file hit | behavior-bearing-no-prod-caller |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/index.ts` | Tagging barrel/default object | three story tagging functions; result types; default object | No external caller found; KNIP unused-file hit | behavior-bearing-no-prod-caller |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/hotspots.ts` | Hotspot motif generator and overlay publisher | `HotspotTrailsResult`; `storyTagHotspotTrails` | No external caller found; KNIP unused-file hit | behavior-bearing-no-prod-caller |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/margins.ts` | Margin motif generator and overlay publisher | `ContinentalMarginsResult`; `storyTagContinentalMargins` | No external caller found; KNIP unused-file hit | behavior-bearing-no-prod-caller |
| `mods/mod-swooper-maps/src/domain/narrative/tagging/rifts.ts` | Rift motif generator and overlay publisher | `RiftValleysResult`; `storyTagRiftValleys` | No external caller found; KNIP unused-file hit | behavior-bearing-no-prod-caller |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/config.ts` | Corridor schemas/config types | corridor schemas and config types | Root config facade; direct test import via config path | test-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/types.ts` | Corridor primitive types | `CorridorStage`; `CorridorKind`; `CorridorStyle`; `Orient` | Internal only | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/state.ts` | Corridor state constructor | `CorridorState`; `createCorridorState` | Internal only | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/runtime.ts` | Corridor helper barrel/RNG adapter | helper re-exports; `rand` | Internal only; KNIP unused exports | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/style-cache.ts` | Corridor metadata cache/assignment | `fetchCorridorStylePrimitive`; `assignCorridorMetadata` | Internal only; KNIP unused export for fetch helper | module-cache-evidence |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/backfill.ts` | Corridor metadata backfill | `backfillCorridorKinds` | Internal corridor entry | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/sea-lanes.ts` | Sea lane scan/tag implementation | water-run helpers; `tagSeaLanes` | Internal through corridor entry; KNIP unused helper exports | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/island-hop.ts` | Island-hop tagger | `tagIslandHopFromHotspots` | Internal through corridor entry | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/land-corridors.ts` | Land corridor tagger | `tagLandCorridorsFromRifts` | Internal through corridor entry | internal-composition-live |
| `mods/mod-swooper-maps/src/domain/narrative/corridors/index.ts` | Strategic corridor entry and overlay publisher | `storyTagStrategicCorridors`; result/input types | Root facade; story corridor test | test-live |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/config.ts` | Orogeny tunables schema | `OrogenyTunablesSchema`; `OrogenyTunables` | Root config facade; internal orogeny | behavior-bearing-no-prod-caller |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/cache.ts` | Orogeny cache keyed by context | `OrogenyCacheInstance`; `getOrogenyCache` | Internal through belts; broad public sub-barrel | module-cache-evidence |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/wind.ts` | Deleted in Slice 1 | none | Broad public sub-barrel before deletion; no caller found; KNIP unused export | possible-unused-helper-deleted |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/belts.ts` | Orogeny belt motif generator and overlay publisher | `OrogenySummary`; `storyTagOrogenyBelts` | Root facade; story orogeny test | test-live |
| `mods/mod-swooper-maps/src/domain/narrative/orogeny/index.ts` | Orogeny wildcard barrel after Slice 1 wind deletion | `belts`, `cache` wildcard exports | Root facade | broad sub-barrel |

## Evidence Tags

| Tag | Meaning |
| --- | --- |
| test-live | Current tests import or call the surface. |
| public-collar-only | Publicly exported by a barrel, with no production caller found. |
| behavior-bearing-no-prod-caller | Implements story behavior, usually overlay publication, with no production recipe/stage caller found. |
| internal-composition-live | Supports test-live or public behavior through internal imports. |
| empty-domain-shell-deleted | Domain contract/implementation binding had no ops, was absent from the standard recipe, and was deleted in Slice 1. |
| module-cache-evidence | Uses module-level or context-keyed cache material inside the retired story network. |
| possible-unused-helper-deleted | Exported helper with no caller found and deleted in Slice 1. |
| placement-name-collar | Current placement source mentions Civ7 narrative-system concepts while remaining owned by placement/adapter law. |
| hydrology-name-collar | Current hydrology source mentions Narrative as a consumer/bias target while remaining owned by hydrology stage/artifact law. |
| runtime-name-collar | Runtime/control code uses Civ7 narrative UI terminology while remaining outside the MapGen narrative-domain source network. |
