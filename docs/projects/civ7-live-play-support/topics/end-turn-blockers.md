# End-Turn Blockers And Play Operations

Status: `active-draft`.

This topic records the currently confirmed turn-by-turn control facts from the
live play support workstream. It is a project artifact, not a permanent skill
yet.

## Normative Frame

The end-turn loop is an App UI-owned flow. A play agent should not call
`GameContext.sendTurnComplete()` merely because it has finished its local
reasoning. It must first read the live App UI turn-completion state and resolve
the blocker through the corresponding game operation when the blocker is a real
choice surface.

The useful control pattern is:

1. Read current turn status through `@civ7/direct-control`.
2. Read `game play notifications` to materialize the active notification,
   selected entity ids, and likely operation families.
3. Prefer the official operation path over raw notification dismissal.
4. Validate with `canStart` before any mutating request.
5. Require fresh evidence, source-owned postcondition proof, and no-repeat
   handling for any mutation.
6. Send turn complete only after the App UI gate is clean: either
   `canEndTurn` is true, or `hasSentTurnComplete` is false, blocker value is
   `0`, first ready unit is `null`, and the notification HUD has no unresolved
   real decision family.

`canEndTurn()` can be conservative around stale notification lifecycle state.
The stronger fallback gate is not just blocker enum plus ready-unit state. It is
blocker enum plus ready-unit state plus HUD classification: stale
`COMMAND_UNITS` can be treated as closeout when `firstReadyUnitId` is null, and
reviewed default-handler report notifications can be treated as closeout when
they are user-dismissible. Real decision families still block even if the
notification is expired.

`force-end-turn` is excluded from play-agent guidance. It bypasses the normal
UI guard and is not a safe default for automated play.

## Confirmed Operation Families

| Play surface | Confirmed operation | Family | Args | Evidence |
| --- | --- | --- | --- | --- |
| End turn | `GameContext.sendTurnComplete()` | App UI action | none | `packages/civ7-direct-control/src/index.ts`; official `panel-action.js` |
| Advisor warning | `VIEWED_ADVISOR_WARNING` | `player-operation` | `{ Target: notificationComponentId }` | official `notification-handlers.js`; live play thread turn 76 |
| Technology choice | `SET_TECH_TREE_NODE` | `player-operation` | `{ ProgressionTreeNodeType: node }` | official tech-tree UI; live play thread Masonry choice; use node hash |
| Technology target | `SET_TECH_TREE_TARGET_NODE` | `player-operation` | `{ ProgressionTreeNodeType: node }` | official full tech-tree UI; `game play set-tech-target` |
| Culture choice | `SET_CULTURE_TREE_NODE` | `player-operation` | `{ ProgressionTreeNodeType: node }` | live play thread turn 79 Mysticism choice; use node hash |
| Culture target | `SET_CULTURE_TREE_TARGET_NODE` | `player-operation` | `{ ProgressionTreeNodeType: node }` | official full culture-tree UI; live play thread turn 58 target closeout; `game play set-culture-target` |
| Diplomacy response | `RESPOND_DIPLOMATIC_ACTION` | `player-operation` | `{ ID: actionId, Type: responseType }` | live play thread turn 79 Farmers Market response |
| First-meet diplomacy | `RESPOND_DIPLOMATIC_FIRST_MEET` | `player-operation` | `{ Player1, Player2, Type }` | official first-meet panel; live play thread turn 62 Genghis Khan greeting |
| Narrative branch | `CHOOSE_NARRATIVE_STORY_DIRECTION` | `player-operation` | `{ TargetType, Target, Action }` | live play thread turn 79 story direction |
| Government choice | `CHANGE_GOVERNMENT` | `player-operation` | `{ GovernmentType, Action: Activate }` | official government picker; use `game play choose-government --options --json` |
| Celebration choice | `CHOOSE_GOLDEN_AGE` | `player-operation` | `{ GoldenAgeType }` | official celebration chooser; use `game play choose-celebration --options --json` |
| Attribute purchase | `BUY_ATTRIBUTE_TREE_NODE` | `player-operation` | `{ ProgressionTreeNodeType: node }` | live play thread turn 79 attribute choice |
| Attribute review closeout | `CONSIDER_ASSIGN_ATTRIBUTE` | `player-operation` | `{}` | live play thread turn 79 attribute closeout |
| Tradition swap | `CHANGE_TRADITION` | `player-operation` | `{ TraditionType, Action }` | live play thread turn 79 tradition swap |
| Tradition review closeout | `CONSIDER_ASSIGN_TRADITIONS` | `player-operation` | `{}` | live play thread turn 79 tradition closeout |
| Growth worker placement | `ASSIGN_WORKER` | `player-operation` | `{ Location: plotIndex, Amount: 1 }` | official acquire-tile UI; live play thread growth decision |
| Town focus project | `CHANGE_GROWTH_MODE` | `city-command` | `{ Type, ProjectType, City }` | official production chooser UI; live play thread turn 80 town project |
| Town project review closeout | `CONSIDER_TOWN_PROJECT` | `city-operation` | `{}` | official production chooser UI; live play thread turn 80 town closeout |
| City expansion placement | `EXPAND` | `city-command` | `{ X, Y }` | official acquire-tile UI; live play thread turn 79 expansion placement; `game play expand-city` |
| Unit production | `BUILD` | `city-operation` | `{ UnitType: unitType }` | official production chooser UI; live play thread Slinger choice; `game play build-production` or `game play build-unit` |
| Constructible production | `BUILD` | `city-operation` | `{ ConstructibleType: constructibleType, X?: x, Y?: y }` | official production chooser and placement UI; live Ancient Walls proof used `X:22,Y:31`; `game play build-production` |
| City project production | `BUILD` | `city-operation` | `{ ProjectType: projectType }` | official production chooser UI; `game play build-production`; validate live postconditions |
| Unit standby | `SKIP_TURN` | `unit-operation` | none or operation default | existing direct-control tests; live play thread unit cleanup |

## Important Distinctions

`Settlement Razed` can mean two different surfaces. If the player is choosing
what to do with a captured city, official UI evidence points at city-command
`DESTROY` with a directive. If the live blocker is an advisor warning about a
settlement already razed, the supportable unblock path is
`VIEWED_ADVISOR_WARNING`.

`Grow City` is also not a single generic command. The notification activates
the growth/acquire-tile surface. The actual operation may be `ASSIGN_WORKER`
for a workable plot, `EXPAND` for expansion, or a town growth-mode command.
Use live state to disambiguate.

`NEW_POPULATION` has an additional UI step. The official notification handler
looks for a city with `Growth.isReadyToPlacePopulation`, focuses it, and enters
`INTERFACEMODE_ACQUIRE_TILE` with that `CityID`. In that mode, a click sends
`ASSIGN_WORKER { Location, Amount: 1 }` for a workable plot, otherwise it sends
city-command `EXPAND` with the placement args. The live turn-79 expansion
placement proved the `EXPAND { X, Y }` branch on city
`{"owner":0,"id":196610,"type":1}` with coordinates `16,19`, so `game play
expand-city` is now available for that branch. Re-read before use because the
same notification family can still require `ASSIGN_WORKER`.

Town focus projects are not normal city production. The official production
chooser checks available town projects by probing
`CHANGE_GROWTH_MODE { Type: GrowthTypes.PROJECT }`; selecting a focus sends
`CHANGE_GROWTH_MODE` with the growth type, project type, and numeric city id.
The play agent should therefore read the live project enum value before sending
a town-focus shortcut.

Ordinary production is still `city-operation BUILD`, but the argument key
matters. Units use `UnitType`, constructibles use `ConstructibleType`, and
ordinary city projects use `ProjectType`. For placement-sensitive
constructibles, a successful initial validator can return legal plots without
queuing the build. The official placement path adds `X` and `Y`, revalidates,
and only then sends `BUILD`. The turn-78 Ancient Walls blocker was cleared by
`BUILD {"ConstructibleType":713967338,"X":22,"Y":31}`, so placement coordinates
are now part of the proven constructible production path.

For the turn-80 coastal town, Fishing Town used:
`CHANGE_GROWTH_MODE {"Type":-284569333,"ProjectType":-548685232,"City":131073}`
on city `{"owner":0,"id":131073,"type":1}`. The production panel also sends
`CONSIDER_TOWN_PROJECT {}` when closing town-project review. In that live turn,
the closeout was not sufficient by itself to clear `NEW_POPULATION`, so this is
evidence for the close path, not proof that town focus resolves every population
blocker.

`PROMOTE` visibility is not proof of a spendable promotion. The active play
thread saw a commander expose `PROMOTE` while `storedPoints` was `0`; that
should be treated as UI-open/no-spendable-promotion unless validator-backed
args prove otherwise.

`COMMAND_UNITS` has a stale-closeout path. If the HUD still lists an
end-turn-blocking `NOTIFICATION_COMMAND_UNITS` but `Game.Notifications` reports
blocker `0`, `GameContext.hasSentTurnComplete()` is false, and the unit-ready
pointers are null, that is not enough by itself for the guarded
`game play end-turn` fallback. The executable fallback requires the HUD
reconciliation detail to classify the blocker as `unit-command-stale-expired`,
with no enabled validator-backed unit closeout candidates. Do not apply that
fallback to culture, production, town focus, diplomacy, narrative, advisor, or
population blockers: the turn-58 culture bug showed that an expired
notification can still mean the wrong enum or missing target operation was sent.

Before relying on that fallback, read `game play notifications --json`. For
`COMMAND_UNITS`, the HUD may include
`details.kind: "unit-command-reconciliation"` with
`enabledCloseoutCandidates`. Those candidates scan local-player units for a
validator-backed no-target `SKIP_TURN` closeout, which is safer and more
specific than ending the turn through a stale ready-unit pointer. Use those
templates only as unit-command reconciliation; movement, attack, promotion,
fortify, and automation still require their own ready-unit/unit-target or
movement-preview evidence.

If `COMMAND_UNITS` is expired, `selectedUnitId` and `firstReadyUnitId` are null,
the blocker enum is `0`, and every scanned `SKIP_TURN` validator is disabled,
the compact dashboard should classify `hud:unit-command-stale-expired` rather
than offering a generic unit operation. When `GameContext.hasSentTurnComplete`
is false, use the listed `game play end-turn --send ...` repair once. When it is
already true, use the listed `game watch ...` command and wait for either turn
advance or a new blocker; do not repeat unit operations blindly.

The reviewed informational fallback is intentionally narrow. It applies only to
user-dismissible, default-handler report notifications that already have a
separate topic review:

- `NOTIFICATION_UNIT_ATTACKED`
- `NOTIFICATION_DISTRICT_ATTACKED`
- `NOTIFICATION_RIVER_FLOODS_SEV0/1/2`
- `NOTIFICATION_STORM_ARRIVED`
- `NOTIFICATION_STORM_MOVED`
- `NOTIFICATION_STORM_DISSIPATED`
- `NOTIFICATION_VOLCANO_ACTIVE`
- `NOTIFICATION_VOLCANO_INACTIVE`
- `NOTIFICATION_VOLCANO_ERUPTS_SEV0/1/2`
- `NOTIFICATION_WONDER_COMPLETED`
- `NOTIFICATION_WONDER_FAILED`
- `NOTIFICATION_LEGACY_COMPLETED`

These can still matter tactically, so the agent should read the report location
and summary before ending; for legacy-completed reports, compare against
`game play progress-dashboard --compact --json` if score/reward context is
unclear. The fallback means the report is not itself a
remaining gameplay choice once blocker enum and readiness are clean.

`NOTIFICATION_UNIT_LOST` is also a reviewed default-handler report, but it is
not raw end-turn fallback eligible while the exact notification remains
engine-queue front. Dismiss it through `game play dismiss-notification` and
trust only identity-based proof that the target disappeared, was dismissed, or
moved off the engine queue front.

## CLI Shortcuts Added

The first CLI shortcut family lives under `civ7 game play`:

- `game play end-turn`
- `game play notifications`
- `game play operation`
- `game play advisor-warning`
- `game play choose-tech`
- `game play set-tech-target`
- `game play choose-culture`
- `game play set-culture-target`
- `game play respond-diplomacy`
- `game play respond-first-meet`
- `game play choose-narrative` (`--options --json` reads the official
  story-model option surface before selecting a branch or `CLOSE` closeout; if
  no pending story id exists, inspect the surfaced dismissal diagnostic instead
  of synthesizing a narrative payload, and require `verified:true` before
  treating dismissal as a closeout)
- `game play buy-attribute`
- `game play consider-attributes`
- `game play change-tradition`
- `game play consider-traditions`
- `game play assign-worker`
- `game play set-town-focus`
- `game play consider-town-project`
- `game play expand-city`
- `game play build-production`
- `game play build-unit`
- `game play ready-unit`
- `game play unit-target`

Every mutating shortcut requires `--send`. Without `--send`, the shortcut
validates or reads only. After any send, re-read before further action and do
not repeat uncertain results.

`game play notifications` is read-only. It is the materialized view for live
play: blocker state, selected unit/city, first ready unit, active notification
summaries, and decision hints such as operation family, operation type, args
shape, confidence, and matching shortcut when one is known.

`game play ready-unit` is read-only. Use it when `COMMAND_UNITS` is the blocker
to resolve the selected/first-ready unit, materialize legal no-target unit
operations/commands, and inspect nearby occupied plots before deciding whether
to hold, move, pack, unpack, promote, or target an attack.

`game play unit-target` is the tactical plot-target resolver. It follows the
official right-click unit action order and returns candidate operations plus
before/after probes when sent. Use it when the play question is "what does this
unit do to that plot?" rather than "send this known operation type."

`game play ready-city` is read-only. Use it when production, town focus, or
population placement is the blocker to resolve the selected/blocking city,
materialize live production candidate args, constructible placement plots, town
focus options, and population placement evidence before choosing a mutating
shortcut.

## Open Questions

- Confirm when tech/culture target setting is required beyond current-node
  selection. The operation shapes are proven; the remaining question is the
  postcondition rule for each blocker surface.
- Prove civic selection args in a live turn before adding a `choose-civic`
  shortcut if civic differs from the turn-79 culture-tree path.
- Prove ordinary city-project production postconditions. The `BUILD
  { ProjectType }` arg shape is exposed through `game play ready-city` and
  `game play build-production`; the remaining question is blocker closeout.
