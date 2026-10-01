# Civ7 Public Surface Disposition

**Status:** Normative frozen owner ledger
**Date:** 2026-08-06
**Baseline:** `fd60a16ad7605ad34c8afa9668aa847b52931022`

## Purpose

This ledger freezes semantic ownership of the baseline CLI and Studio public
surfaces before migration. Brace expressions expand to every existing leaf.
Migration may preserve paths, translate contracts, or retire a route only as
recorded here; it may not rediscover product ownership from source layout.

## Studio `/rpc`

| Exact public route or route family | Disposition | Semantic authority |
| --- | --- | --- |
| `civ7.status` | Preserve path | Controller readiness observation |
| `civ7.mapSummary` | Preserve path | API composition over controller map/game observations |
| `civ7.gameInfo` | Preserve as diagnostic | Qualified app diagnostic adapter; never controller catalog authority |
| `civ7.autoplay` | Preserve path | MapGen-runs autoplay admission and operation outcome |
| `civ7.setupConfig` | Preserve path | Controller shell/game setup observation |
| `civ7.savedConfigs` | Preserve path | Qualified app adapter over pure save-file capability |
| `civ7.setupCatalog` | Preserve path | Qualified official-data adapter and app-selected roots |
| `civ7.live.status` | Consolidate | Controller readiness/game observation |
| `civ7.live.snapshot` | Consolidate | Controller map observation |
| `civ7.live.entities` | Consolidate | Controller game observation |
| `civ7.live.gameInfo` | Preserve only with consumer proof; otherwise retire | Qualified diagnostic adapter |
| `civ7.attention.{current,priorities}` | Preserve compatibility path | Play attention |
| `civ7.city.population.place.{check,request}` | Preserve compatibility path | Play city |
| `civ7.city.production.choice.{check,request}` | Preserve compatibility path | Play city |
| `civ7.city.townFocus.{change,review}.{check,request}` | Preserve compatibility path | Play city |
| `civ7.diplomacy.firstMeet.response.{check,request}` | Preserve compatibility path | Play diplomacy |
| `civ7.diplomacy.response.{check,request}` | Preserve compatibility path | Play diplomacy |
| `civ7.display.queue.{current,close}` | Preserve compatibility path | Controller UI |
| `civ7.display.explore.request` | Preserve compatibility path | Controller map/UI operation |
| `civ7.government.choice.{check,request}` | Preserve compatibility path | Play progression/government |
| `civ7.government.celebration.choice.{check,request}` | Preserve compatibility path | Play progression/government |
| `civ7.lifecycle.singlePlayer.start` | Preserve compatibility path | Controller shell/game operation |
| `civ7.narrative.choice.{check,request}` | Preserve compatibility path | Play narrative/progression |
| `civ7.notifications.advisorWarning.viewed.{check,request}` | Preserve compatibility path | Play notifications |
| `civ7.notifications.dismiss.{check,request}` | Preserve compatibility path | Play notifications |
| `civ7.notifications.queue.current` | Preserve compatibility path | Play attention/notifications over controller evidence |
| `civ7.notifications.queue.dismiss.request` | Preserve compatibility path | Play notifications |
| `civ7.progression.{dashboard,traditions}.current` | Preserve compatibility path | Play progression |
| `civ7.progression.{technology,culture}.choice.{options,check,request}` | Preserve compatibility path | Play progression |
| `civ7.progression.{technology,culture}.target.{check,request}` | Preserve compatibility path | Play progression |
| `civ7.progression.attribute.{purchase,review}.{check,request}` | Preserve compatibility path | Play progression |
| `civ7.progression.tradition.{change,review}.{check,request}` | Preserve compatibility path | Play progression |
| `civ7.readiness.current` | Preserve compatibility path | Controller readiness |
| `civ7.strategy.{civilianRouteTriage,formationSnapshot,frontSummary,battlefieldScan,destinationAnalysis,targetCandidates}` | Preserve compatibility path | Play strategy/planning |
| `civ7.turn.complete.{check,request}` | Preserve compatibility path | Play turn |
| `civ7.unit.{resettle,upgrade}.{check,request}` | Preserve compatibility path | Play unit |
| `civ7.unit.target.action.{check,request}` | Preserve compatibility path | Play unit |
| `civ7.view.appshot.capture` | Preserve compatibility path | API projection over app-selected window-capture provider; no controller ownership |
| `civ7.view.camera.focus` | Preserve compatibility path | Controller UI/map operation |
| `civ7.world.{current,plot,grid}` | Preserve compatibility path | Controller map observation |
| `mapConfigs.status` | Preserve path | MapGen-runs save/deploy operation |
| `mapConfigs.saveDeploy` | Preserve path | MapGen-runs save/deploy operation |
| `runInGame.{status,cancel,diagnostics,start}` | Preserve paths | MapGen-runs run-in-game operation |
| `studio.serverInfo` | Preserve path | Studio app process identity projected through API context |
| `studio.operations.current` | Preserve path | MapGen-runs operation observation |
| `studio.events.watch` | Preserve behavior | API-owned event projection over run/controller observations |
| `recipeDag.get` | Preserve path | Swooper definition-authoring projection |

The complete brace expansion is the baseline 70-leaf route tree. Existing
input/output schemas, declared error identities, event ordering, latest-live
replay, and subscriber closure remain compatibility oracles until a separate
product-contract change explicitly replaces them.

## CLI

| Surface family | Disposition | Semantic authority |
| --- | --- | --- |
| Commandless oclif shell, topic discovery, help, version, unknown-command handling | Preserve | CLI app and topic registration |
| Data extraction/publication commands | Preserve | Data projection over extraction/publication capability |
| Mod list/resolve/install/deploy commands | Correct | Mod projection over pure planning plus qualified app effects |
| MapGen diagnostics and metrics | Preserve | MapGen topic over public Swooper/MapGen capabilities |
| Game health, raw exec, catalog and inspection | Preserve as qualified diagnostics | App-owned diagnostic adapters over selected providers |
| Game native readiness, setup, map and UI commands | Correct | Public controller client |
| Game attention, city, diplomacy, government, narrative, notifications, progression, strategy, turn and unit commands | Correct | Public Play client |
| Commands that construct sessions/providers or import direct-control | Retire implementation | CLI app binds ready clients and adapters |

Command names, flags, help text, structured output, exit behavior, and
development/production discovery remain exact caller proof. Their current
implementation imports do not.

## Native Behavior Families

| Baseline behavior | Frozen authority |
| --- | --- |
| Socket framing, state discovery, health, epoch, raw result and release | Tuner resource contract plus concrete local-socket provider facts |
| Arbitrary JavaScript | Qualified diagnostic adapter with refusal, not-dispatched, indeterminate and no-retry outcomes |
| Native readiness, observation, exact checks and at-most-once sends | In-engine controller |
| Situation, lawful choice, polling, reconciliation, no-repeat and next action | Play |
| Run admission, phases, adoption, cancellation, retention and terminal state | MapGen-runs |
| Window capture preparation, capture child lifecycle and release | Generic window-capture resource contract plus macOS provider facts |
| Stable product mod installation | Matching mod realization app |
| Request-correlated ephemeral run-mod installation | Studio app run adapter |

## Closure

Every public route and command family has an owner before source migration.
Implementation containers decide order and mechanics only. A route may retire
only with exact consumer proof and a product decision; absence from a new
router is not retirement authority.
