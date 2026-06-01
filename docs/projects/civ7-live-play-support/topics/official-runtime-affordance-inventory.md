# Official Runtime Affordance Inventory

Status: `reference-with-gap`.

## Frame

When live play exposes a new requirement, the first question should be: does
the official UI already have a runtime function for this? Manual scans and
heuristics are acceptable as temporary fallbacks, but the preferred design path
is to mine official UI/resource code for the player-facing affordance and wrap
that surface in direct-control.

This topic records low-hanging official surfaces discovered while watching live
play. It is a candidate list, not proof that every function is available from
the current tuner state.

## Tactical And Unit Affordances

| Candidate | Official anchor | Helps | Proposed surface | Confidence | Risk |
|---|---|---|---|---|---|
| Right-click combat/move resolver | `.civ7/outputs/resources/Base/modules/base-standard/ui/world-input/world-input.js:419` | distinguish attack, swap, overrun, and move targets | keep `unit-target` aligned with official order, including `Game.Combat.testAttackInto` and war preflight | high | war confirmation is UI-mediated |
| Attack target plots from validators | `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-focused-attack-base.chunk.js:12`; `interface-mode-ranged-attack.js:37`; `interface-mode-naval-attack.js:36` | enumerate valid focused/ranged/naval/air targets | `game play unit-action-plots --unit-id ...` | high | low; validate serialization and plot membership |
| Tactical movement overlay | `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:119` | reachable movement, ZOC, targets, path preview | `game play unit-move-preview` or `tactical-lens --unit-id` | high | payload size and state availability |
| Commander radius overlay | `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:154` | formation safety and commander support | add command-radius plots to formation/tactical lenses | high | radius semantics need live smoke |
| Army grouping modes | `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-add-to-army.js:36`; `interface-mode-remove-from-army.js:36`; `interface-mode-reinforce-army.js:36`; `interface-mode-commander-attack.js:36` | army add/remove/reinforce/commander actions | `game play army-action` wrappers over unit commands/operations | high | mutating commands need approval and postconditions |
| Promotion args and readiness | `.civ7/outputs/resources/Base/modules/base-standard/ui/unit-promotion/panel-unit-promotion.js:693`; `model-unit-promotion.chunk.js:146` | promotion spend decisions | keep `promotion-readiness`; add approved `promote-unit` with returned args | high for reads, medium for spend | promotion spend is irreversible |
| Auto-explore eligibility | `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-unit-selected.js:20`; `:141` | exploration automation triage | read-only `auto-explore-eligible` lens | medium | do not infer an automation command before finding one |

## Notification And Diplomacy Affordances

| Candidate | Official anchor | Helps | Proposed surface | Confidence | Risk |
|---|---|---|---|---|---|
| Notification inventory and blocker identity | `.civ7/outputs/resources/Base/modules/base-standard/ui/notification-train/model-notification-train.js:40`; `:45` | replace raw HUD guessing | extend `game play notifications`; add `notification-details` | high | ids expire after actions |
| Display queue manager | `.civ7/outputs/resources/Base/modules/base-standard/ui/display-queue/display-queue-manager.js:154`; `:174`; `:276`; `:293`; `:336` | UI queue/popup ordering | `game play ui-queue` lens over active, pending, suspended displays | high | module singleton may not be globally reachable |
| Notification handler map | `.civ7/outputs/resources/Base/modules/base-standard/ui/notification-train/notification-handlers.js:188`; `:222`; `:279`; `:369`; `:407`; `:438`; `:539`; `:565` | replace text matching with official handler categories | static `notification-handler-map` catalog feeding HUD hints | high | registration table still needs a mapping audit |
| Advisor warning closeout | `.civ7/outputs/resources/Base/modules/base-standard/ui/notification-train/notification-handlers.js:585`; `.civ7/outputs/resources/Base/modules/base-standard/data/advisory.xml:13` | avoid raw dismissal for advisor blockers | keep `advisor-warning`; add `advisor-warnings` read lens | high | WatchOut manager can auto-dismiss in some paths |
| Production recommendations | `.civ7/outputs/resources/Base/modules/base-standard/ui/production-chooser/production-chooser-helpers.chunk.js:1285` | replace manual build advice heuristics | `game play advisor-builds --city-id ...` | medium-high | only production recommendation is proven here |
| Diplomacy response data | `.civ7/outputs/resources/Base/modules/base-standard/ui/notification-train/notification-handlers.js:539`; `panel-diplomacy-project-reaction.js:374` | inspect available responses and costs | `game play diplomacy-response --action-id ...` | high | action id is not notification id |
| Relationship and agenda data | `.civ7/outputs/resources/Base/modules/base-standard/ui/diplomacy/relationship-breakdown.chunk.js:40`; `relationship-tooltip.js:149`; `panel-diplomacy-actions.js:769` | replace report scraping | `game play relations --player-id ...` | high | reports can be informational, not response-required |
| War and peace availability | `.civ7/outputs/resources/Base/modules/base-standard/ui/diplomacy/diplomacy-manager.js:3274`; `:3285`; `:3330`; `:3362` | inspect declare-war / make-peace availability | `game play diplomacy-actions --player-id ...`; later approved `declare-war` | high for war, medium for peace | peace may need a deal/session UI |
| Diplomacy sessions | `.civ7/outputs/resources/Base/modules/base-standard/ui/diplomacy/diplomacy-manager.js:2955`; `:2978`; `:3004`; `:3918` | detect hidden diplomacy dialogs | `game play diplomacy-queue` | medium-high | manager access from tuner must be proven |
| Popup sequencer and WatchOut queue | `.civ7/outputs/resources/Base/modules/base-standard/ui/popup-sequencer/popup-sequencer.js:11`; `:31`; `:61`; `watch-out-manager.js:15`; `:56`; `:127` | replace bespoke event queue tracking | `game play ui-popups` | medium | `userData` may be non-serializable |

## Map Intelligence Affordances

| Candidate | Official anchor | Helps | Proposed surface | Confidence | Risk |
|---|---|---|---|---|---|
| Pathing and move preview | `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/support-unit-map-decoration.chunk.js:119`; `:217` | pathing, reachable targets, ZOC, turn-count paths | `game play unit-move-preview --unit-id ... --include-paths` | high | preview evidence only; revalidate before sends |
| Target legality and action order | `.civ7/outputs/resources/Base/modules/base-standard/ui/interface-modes/interface-mode-move-to.js:40`; `world-input/world-input.js:419` | attack, move, swap, overrun target checks | existing `unit-target` plus move-preview | high | keep reads to `canStart`; `sendRequest` mutates |
| Visibility and fog | `.civ7/outputs/resources/Base/modules/base-standard/ui/lenses/layer/yields-layer.js:30`; `packages/civ7-direct-control/src/index.ts:2023`; `:3454` | revealed/visible/fog overlays | `game visibility --player-id 0 --bounds x,y,w,h --json` | recorded live proof | avoid `Visibility.revealAllPlots` |
| Settlement and POI advice | `.civ7/outputs/resources/Base/modules/base-standard/ui/lenses/layer/settlement-recommendations-layer.js:41`; `packages/civ7-direct-control/src/index.ts:2683` | settlement scouting and resource/fresh-water tradeoffs | existing `settlement-recommendations` | high | recommendation quality is advisory, not move legality |
| Resource and yield overlays | `.civ7/outputs/resources/Base/modules/base-standard/ui/lenses/layer/resource-layer.js:39`; `packages/civ7-direct-control/src/index.ts:4660`; `:6567` | replace manual plot scans for resources/yields | `game map --bounds ... --fields resource,yields,visibility,owner` | high | hidden-info filtering must stay explicit |
| Trade route model and layer | `.civ7/outputs/resources/Base/modules/base-standard/ui/trade-route-chooser/trade-routes-model.js:75`; `:145`; `lenses/layer/trade-layer.js:26` | trade candidates, status, route path plots | `game play trade-routes --json` | high App UI | model may be async; route safety is still tactical |
| Continents, areas, and regions | `.civ7/outputs/resources/Base/modules/base-standard/ui/lenses/layer/continent-layer.js:83`; `ui/tuner-input/tuner-input.js:538`; `packages/civ7-direct-control/src/index.ts:3292` | strategic regions and area summaries | `game map-summary --include-area-region-counts`, then area/region detail lens | high | may expose hidden topology |
| Hazards and disasters | `.civ7/outputs/resources/Base/modules/base-standard/ui/lenses/layer/random-events-layer.js:16` | floodplain, volcano, and event risk | `game play random-events --bounds ... --json` | medium-high | may not cover every disaster system |
| Discovery POIs | `.civ7/outputs/resources/Base/modules/base-standard/ui/lenses/layer/discovery-layer.js:54` | discoverables and map POIs without broad scans | `game play discoveries --bounds ... --json` | high | revealed/wilderness/rural and `Constructible.Discovery` limited |
| Lens/minimap orchestration | `.civ7/outputs/resources/Base/modules/core/ui/lenses/lens-manager.chunk.js:67`; `.civ7/outputs/resources/Base/modules/base-standard/ui/mini-map/panel-mini-map.js:730` | compose official map overlays | App UI lens activate/toggle-layer experiments | high | visual side effects; no separate strategic-view API found |

## Known Gap: City And Economy

Two background city/economy passes exhausted their budgets before producing a
candidate table. Do not treat that lane as investigated. The next targeted
search should focus on official UI functions for production picker population,
constructible placement validation, population/worker assignment, town focus,
yield summaries, settlement scoring, and map overlay activation.

## Design Rule

For every new live-play shortcut, run this sequence:

1. Search official UI/resource code for the player-facing affordance.
2. Prefer the official function or handler table when it exists.
3. Wrap it in `@civ7/direct-control` as read-only first.
4. Add mutation only after validator and postcondition contracts exist.
5. Keep heuristic/manual scans as labeled fallbacks, not the primary surface.
