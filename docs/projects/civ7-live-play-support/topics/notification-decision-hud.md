# Notification Decision HUD

The live-play notification HUD is a read-only decision surface for agents that
need to clear turn blockers without guessing which operation family applies.
It is not a dismissal tool. It should tell the agent what the blocker is, which
inputs still need live evidence, and which shortcut or validated operation is
safe to try next.

## Frame

Runtime notification metadata is useful, but it is not enough to choose an
operation. The official notification train opens different UI handlers by
notification type, and each handler moves the player into a different decision
surface: tree choice, city production, acquire-tile mode, diplomacy response,
narrative story direction, advisor warning, or unit command. The HUD therefore
organizes notifications by decision family rather than by raw notification
fields.

The HUD has two layers:

- `hud.nextDecision`: the first actionable item, preferring the current
  end-turn blocker.
- `hud.decisionQueue`: an ordered queue of notification decisions with
  required inputs, common safe actions, operation family/type, target/location,
  and notes.

The full `notifications` array remains available for debugging raw facts such
as notification id, type name, target, location, dismissal state, and message.
`game play notification-queue` builds on the same HUD queue when the agent needs
an ordered bulk read and guarded action schedule rather than a raw notification
dump.

For future evented support, prefer an Effect-backed stream/latest-view layer
over a hand-rolled event bus. Civ7's UI scripts expose in-process notification
events such as `NotificationAdded`, `NotificationDismissed`, and
`NotificationActivated`, but the tuner boundary is still request/response until
direct-control proves a durable subscription surface. The near-term design is a
bulk snapshot plus conservative scheduling; a stream is an optimization only if
it can replay into the same materialized HUD and invalidate after mutations.

## What The HUD Should Materialize

The HUD should be a current decision surface, not a static data browser. Each
refresh should answer five questions for the play agent:

1. What is blocking progress right now?
2. Which live input is still missing before a safe operation can be chosen?
3. Which specialized shortcut or operation family matches the blocker?
4. Which validator or postcondition must be checked before/after sending?
5. Which labels or explanations came from local catalogs rather than live
   legality?

Local SQLite/resource data belongs in the HUD as enrichment: readable names,
costs, categories, localization, and source anchors. The blocker identity,
required live args, current selected entity, validator result, and post-send
state must come from direct-control. Cache any local enrichment by source mtime
or version, but refresh live blocker/validator data on every decision loop and
after any mutation or human input.

## Decision Families

| Family | Required live inputs | Common safe action |
| --- | --- | --- |
| Technology choice | runtime `ProgressionTreeNodeType` hash from the live tech chooser/tree; use `game play choose-tech --options --json` when the node is not already proven | `game play choose-tech`; `game play set-tech-target` when the full tree targets a node |
| Culture choice | runtime `ProgressionTreeNodeType` hash from the live culture chooser/tree; use `game play choose-culture --options --json` when the node is not already proven | `game play choose-culture`; `game play set-culture-target` when the full tree targets a node |
| Population placement | chosen plot `Location` for workable tiles, or city target plus `X`/`Y` for expansion tiles; read `game play ready-city --compact --json` when the exact branch is not already proven | `game play ready-city --compact --json`; then selected `game play assign-worker` or `game play expand-city` template |
| Town focus | city target, growth `Type`, paired `ProjectType` | `game play set-town-focus`; then `game play consider-town-project` if closeout is still needed |
| Production choice | city target, exactly one build item kind, and placement `X`/`Y` when constructible validation returns legal plots; read `game play ready-city --compact --json` when the item id/placement is not already proven | `game play ready-city --compact --json`; then selected `game play build-production` template |
| Resource assignment | resource allocation screen state, available resources, settlement slots | no proven assignment shortcut yet; inspect the official resource-allocation surface |
| Diplomacy response | diplomatic action `ID` and chosen response `Type` | `game play respond-diplomacy` |
| First-meet diplomacy | local player id, met player id from `notification.Player`/`details.player2`, first-meet response `Type` | `game play respond-first-meet` |
| Informational notification | notification ComponentID; handler evidence that no specialized decision surface is required | exact `game play dismiss-notification --target ... --send ...` after review |
| Narrative branch | story `Target`, option `TargetType`, activation `Action`; read `game play choose-narrative --options --json` when the story target or option key is not already proven | `game play choose-narrative --options --json`; then selected `game play choose-narrative` template |
| Government choice | live `GovernmentType` and activation `Action` from `game play choose-government --options --json` | `game play choose-government` |
| Celebration choice | live `GoldenAgeType` hash from `game play choose-celebration --options --json` | `game play choose-celebration` |
| Tradition review | active/unlocked tradition ids from `game play traditions --compact --json`; chosen `TraditionType` and activate/deactivate `Action` | `game play traditions --compact --json`; then selected `sendCloseoutCli` or `game play change-tradition`; then `game play consider-traditions` |
| Attribute review | attribute `ProgressionTreeNodeType` | `game play buy-attribute`; then `game play consider-attributes` |
| Advisor warning | notification ComponentID as `Target` | `game play advisor-warning` |
| Unit command | selected or first ready unit; sometimes target plot | `game play ready-unit`, then `game play unit-target` for plot actions or generic unit operation validation |

For queue management, use `game play notification-queue --json` before manually
walking several notifications. It can schedule reviewed informational closeout
candidates, known operation-family items, and ready-unit inspections, but it
does not bulk-dismiss or send operations. Use
`game play dismiss-notification-queue --send --reason <reason>` when the queue
contains eligible informational App UI closeout candidates that have been
reviewed at the needed tactical/strategic level.

## Official Evidence

The official notification train resolves handlers by live notification type and
uses runtime blocker state for turn advancement. The blocker answer should come
from `Game.Notifications.getEndTurnBlockingType` and
`Game.Notifications.findEndTurnBlocking`, not from static XML severity alone.

Notable handler evidence:

- Tech/culture tree screens distinguish current research from target nodes:
  `SET_*_TREE_NODE` starts research when it validates, while
  `SET_*_TREE_TARGET_NODE` records the full-tree target. Use the runtime node
  hash, not the row index.
- `NOTIFICATION_NEW_POPULATION` opens acquire-tile mode; the selected plot
  decides whether the operation is worker assignment or expansion purchase.
- `NOTIFICATION_CHOOSE_CITY_PRODUCTION` and
  `NOTIFICATION_CHOOSE_TOWN_PROJECT` require a valid city target before opening
  their production/town-focus surfaces.
- `NOTIFICATION_ASSIGN_NEW_RESOURCES` is registered to `AssignNewResources`,
  whose activation opens `screen-resource-allocation`. Treat it as a real
  resource-allocation decision surface. Do not close it as a default-handler
  report until assignment or closeout behavior is proven.
- Narrative, discovery, and auto-narrative blockers route to
  `ChooseNarrativeDirection`; the official UI derives `targetStoryId` from
  `Players.get(notification.owner).Stories` (`getFirstPendingMetId()`, with
  discovery also checking `getFirstPendingDiscoveryLastMetID()`), builds buttons
  from `GameInfo.NarrativeStory_Links`, and sends
  `CHOOSE_NARRATIVE_STORY_DIRECTION` with `{ TargetType: answerKey, Target:
  targetStoryId, Action: Activate }`. If the official small narrative panel is
  already visible, the target can also be read from
  `small-narrative-event._component.targetStoryId` and choices from
  `fxs-reward-button[small-narrative-choice-key]`; validate those exact
  visible-panel args before send. `game play choose-narrative --send` should be
  treated as the single caller-level action: it sends
  `CHOOSE_NARRATIVE_STORY_DIRECTION` and mirrors the official panel close route
  internally. If a real pending story has no linked choices, the official UI
  emits a `CLOSE` option. If neither story model nor visible panel exposes a
  target, do not synthesize a narrative send; inspect notification-dismissal
  postcondition evidence separately and require `verified:true` before treating
  dismissal as a closeout.
- Tradition blockers should not be reconstructed from logs or static rows.
  The live player `Culture` object exposes active, unlocked, and recent
  traditions (`getActiveTraditions`, `getUnlockedTraditions`,
  `getAllUnlockedTraditions`, `getRecentUnlockedTraditions`) and the official
  policy screen sends `CHANGE_TRADITION` with
  `{ TraditionType: policy.$index, Action: PlayerOperationParameters.Activate
  | Deactivate }`. Use `game play traditions --json` to read the current
  slot/candidate packet before any `change-tradition --send --closeout`.
  Compact priorities should route tradition blockers to
  `game play traditions --compact --json` so the caller sees active slots,
  available traditions, validation status, and ready closeout templates before
  selecting a tradition.
- Advisor warnings use `VIEWED_ADVISOR_WARNING` with the notification
  ComponentID as `Target`, not a generic notification dismissal.
- `NOTIFICATION_PLAYER_MET` is a first-meet diplomacy decision. The official
  first-meet panel sends `RESPOND_DIPLOMATIC_FIRST_MEET` with
  `{ Player1, Player2, Type }`, not a notification dismissal and not the
  ordinary `{ ID, Type }` diplomacy response shape. The HUD should expose a
  `details.kind == "first-meet-diplomacy"` payload when the live notification
  carries the met player id, including validated greeting args and a neutral
  `recommendedCli`.
- `NOTIFICATION_DIPLOMATIC_ACTION_LOW` reports a completed low-severity
  diplomatic action. The official notification handler file registers
  `NOTIFICATION_DIPLOMATIC_ACTION` and
  `NOTIFICATION_DIPLOMATIC_ACTION_WARNING` with
  `InvestigateDiplomaticAction`, but does not register
  `NOTIFICATION_DIPLOMATIC_ACTION_LOW`; it therefore falls through to the
  default handler. Treat it as reviewed informational closeout after reading
  the message, not as `RESPOND_DIPLOMATIC_ACTION`.
- `NOTIFICATION_DIPLOMATIC_ACTION` can point at a real diplomatic event id
  without being a response-required choice. The HUD should attach
  `details.kind == "diplomatic-action-report"` with
  `Game.Diplomacy.getDiplomaticEventData(actionId)` and
  `Game.Diplomacy.getResponseDataForUI(actionId)` proof. If the response list
  is empty or no response option validates, compact priorities should route to
  reviewed `game play dismiss-notification --target ... --send ...` closeout,
  not `respond-diplomacy`.
- `NOTIFICATION_WONDER_COMPLETED`, `NOTIFICATION_WONDER_FAILED`,
  `NOTIFICATION_LEGACY_COMPLETED`,
  `NOTIFICATION_UNIT_ATTACKED`, `NOTIFICATION_UNIT_LOST`,
  `NOTIFICATION_DISTRICT_ATTACKED`, and
  natural-disaster reports such as `NOTIFICATION_RIVER_FLOODS_SEV0/1/2`,
  `NOTIFICATION_STORM_ARRIVED`, `NOTIFICATION_STORM_MOVED`,
  `NOTIFICATION_STORM_DISSIPATED`, `NOTIFICATION_VOLCANO_ACTIVE`,
  `NOTIFICATION_VOLCANO_INACTIVE`, and `NOTIFICATION_VOLCANO_ERUPTS_SEV0/1/2`
  are not registered to specialized handlers in `notification-handlers.js`;
  they fall through to `DefaultHandler`. Default activation only looks at a
  valid plot, so guarded `Game.Notifications.dismiss` is the practical closeout
  after the report is reviewed and no specialized blocker remains.
- `NOTIFICATION_UNIT_LOST` is reviewed through the same dismissal surface, but
  it is not cleared by notification-train absence alone. If the engine queue
  still fronts the exact notification id, the blocker is still live.
- `NOTIFICATION_LEGACY_COMPLETED` should be reviewed as score/reward context
  before closeout. Use `game play progress-dashboard --compact --json` when the
  report should be compared against local legacy path progress, then dismiss the
  reviewed report through the same App UI notification closeout route.

## Current Narrative Lesson

For `ATTRIBUTE_QUEST_1004A`, official resources showed no narrative link rows.
The official narrative UI falls back to one `"CLOSE"` option when a story has no
links, so the likely operation is acknowledgement:

```json
{
  "TargetType": "CLOSE",
  "Target": { "owner": 0, "id": 37, "type": 35 },
  "Action": -1326475004
}
```

Validate before sending because the live pending story target can change:

```bash
civ7 game play choose-narrative \
  --player-id 0 \
  --target-type CLOSE \
  --target '{"owner":0,"id":37,"type":35}' \
  --action -1326475004 \
  --json
```

Avoid broad live enumeration of `GameInfo.NarrativeStories`. Use the bounded UI
path instead: `Players.get(GameContext.localPlayerID).Stories.getFirstPendingMetId()`,
`getFirstPendingDiscoveryLastMetID()` for discovery blockers when present,
`Stories.find(target)`, `GameInfo.NarrativeStories.lookup(story.type)`, and a
narrow `NarrativeStory_Links.filter` for that one story type. If both pending-id
reads are empty, `game play choose-narrative --options --json` should expose a
visible-panel option surface when the official popup is open. If no visible panel
target exists either, it should expose a read-only dismissal diagnostic plus an
unproven send candidate. A visible-panel `chooseCli` is the forward operation;
the caller should not separately dismiss the narrative notification. Only treat a
dismissal send as successful if `game play dismiss-notification --send` reports
`verified:true`.

Production blockers should use the production shortcut before falling back to a
generic operation. Units use `UnitType`, constructibles use `ConstructibleType`,
and ordinary city projects use `ProjectType`. Placement-sensitive
constructibles need the same second-stage args the official UI sends: `X` and
`Y` paired with `ConstructibleType`. Keep `game play build-unit` available for
unit-only flows, but use `game play build-production` for new production
guidance because it makes the item kind and placement requirement explicit.
After any send, treat `productionPostcondition` as the closeout proof. If the
classification is `production-state-changed-blocker-still-live`, the build
request affected city production but did not close the HUD blocker; inspect the
notification/chooser closeout surface instead of re-sending the same build.

## Turn 115 Diplomatic Completion Lesson

On turn 115, the live HUD surfaced
`NOTIFICATION_DIPLOMATIC_ACTION_LOW` for a completed Cultural Exchange with
Lafayette as an end-turn blocker. The official handler evidence above makes the
correct closeout path narrow:

```bash
civ7 game play dismiss-notification \
  --target '{"owner":0,"id":522,"type":20}' \
  --send \
  --reason 'reviewed completed Cultural Exchange with Lafayette'
```

Use the current notification id from a fresh HUD read; the example id is
turn-specific. This remains an explicit reviewed dismissal because completed
diplomatic-action reports can matter strategically even when they do not expose
a response operation.
