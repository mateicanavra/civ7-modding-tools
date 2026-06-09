# Informational Notification Closeout

Some notifications block turn advancement even though the official UI does not
attach a specialized decision handler to them. Treat these as reviewed
information, not as player/city/unit operations.

## Current Cases

On turn 97, the live HUD showed `NOTIFICATION_WONDER_COMPLETED` as the
end-turn blocker:

```json
{
  "summary": "An unmet player has finished constructing the World Wonder Great Stele.",
  "message": "Wonder Completed",
  "target": { "owner": -1, "id": -1, "type": 0 },
  "location": { "x": -9999, "y": -9999 },
  "canUserDismiss": true
}
```

Official handler evidence:

- `notification.xml` defines `NOTIFICATION_WONDER_COMPLETED` and
  `NOTIFICATION_WONDER_FAILED` as expiring, non-auto-notify notification types.
- `notification-handlers.js` does not register either type to a specialized
  handler.
- The default handler only looks at a valid notification location or target
  plot. The live wonder-completed notice had invalid target/location sentinels,
  so activation had no useful surface to open.

On turn 100 after restart rehydration, the live HUD showed
`NOTIFICATION_GRIEVANCES_AGAINST_YOU` as the current queue blocker:

```json
{
  "summary": "Napoleon, Revolutionary sparked a diplomatic incident.[n]Cause: Revealed Espionage.[n]As a result, you gained 30[icon:YIELD_DIPLOMACY] Influence",
  "message": "Grievance Against You",
  "target": { "owner": -1, "id": -1, "type": 0 },
  "location": { "x": 4, "y": 1 },
  "canUserDismiss": true
}
```

Official handler evidence:

- `notification.xml` defines `NOTIFICATION_GRIEVANCES_AGAINST_YOU` as an
  expiring high-severity notification.
- `notification-handlers.js` registers specialized handlers for ordinary
  diplomatic action, diplomatic response, relationship change, war, and
  espionage notifications, but not for `NOTIFICATION_GRIEVANCES_AGAINST_YOU`.
- A live dismissal probe reported `canDismiss:true`, `canUserDismiss:true`,
  `blocksTurnAdvancement:false`, and `endTurnBlockingType:0`.

This is diplomatic information, not a diplomatic response operation. Review the
summary because it explains relationship and Influence context, then use
App UI dismissal when the live notification is still user-dismissible.

On turn 133, the live HUD showed another diplomatic report-style blocker:

```json
{
  "typeName": "NOTIFICATION_DIPLOMATIC_ACTION",
  "summary": "The Agenda of Genghis Khan has changed your Relationship.",
  "message": "The Agenda of Genghis Khan has changed your Relationship.",
  "target": { "owner": -1, "id": -1, "type": 0 },
  "location": { "x": 19, "y": 26 },
  "canUserDismiss": true
}
```

Official handler evidence:

- `notification-handlers.js` registers `NOTIFICATION_DIPLOMATIC_ACTION` to
  `InvestigateDiplomaticAction`.
- `InvestigateDiplomaticAction.activate` only selects and raises a diplomatic
  action panel when the notification `Target` is a valid ComponentID.
- The live agenda/relationship notice had the invalid target sentinel, so it
  did not carry a usable diplomatic action id.

This is still strategically relevant information: it may change how urgently
to prepare for a leader or whether diplomacy is deteriorating. But it is not
`RESPOND_DIPLOMATIC_ACTION`; review the report, then close it through App UI
dismissal when it remains user-dismissible.

On turn 37, `NOTIFICATION_DIPLOMATIC_ACTION` appeared as a new-settlement
report with a valid diplomatic event target:

```json
{
  "typeName": "NOTIFICATION_DIPLOMATIC_ACTION",
  "summary": "Another Civilization settled a new Town nearby.",
  "target": { "owner": 2, "id": 34, "type": 34 },
  "canUserDismiss": true
}
```

`Game.Diplomacy.getDiplomaticEventData(34)` identified a real
`DIPLOMACY_ACTION_LAND_CLAIM` event, but
`Game.Diplomacy.getResponseDataForUI(34).responseList` was empty. That means
the target is not invalid, but it still is not an enabled
`RESPOND_DIPLOMATIC_ACTION` choice. Treat this as a reviewed diplomatic action
report closeout unless a future live read returns enabled response options.

On turn 57, the live HUD showed `NOTIFICATION_UNIT_ATTACKED` as an end-turn
blocking notice even though the App UI blocker enum had returned to `0` and
there were no ready units:

```json
{
  "summary": "Your Warrior was attacked by Kutai Martadipura.",
  "message": "Unit Attacked",
  "location": { "x": 17, "y": 18 },
  "canUserDismiss": true,
  "isEndTurnBlocking": true
}
```

On turn 82, the live HUD showed `NOTIFICATION_VOLCANO_ACTIVE` as an end-turn
blocking notice after the unit queue cleared:

```json
{
  "summary": "Hasandağı has become active. Beware -- it can now erupt at any time!",
  "message": "Volcano Now Active",
  "location": { "x": 6, "y": 27 },
  "canUserDismiss": true,
  "isEndTurnBlocking": true
}
```

On turn 102, autoplay stopped on `NOTIFICATION_STORM_ARRIVED` after a
significant blizzard damaged tiles and removed population. Turn 104 later
showed `NOTIFICATION_STORM_DISSIPATED` after the storm made its final move. The
notifications carried plot locations and were user-dismissible, but the App UI
handler table did not attach a specialized choice or operation surface to the
storm reports. Treat the storm-arrived, storm-moved, and storm-dissipated
families like flood and volcano reports: inspect the location and summary for
tactical implications, then close the reviewed report through App UI dismissal
when no other blocker remains.

Official handler evidence:

- `notification.xml` defines `NOTIFICATION_UNIT_ATTACKED`,
  `NOTIFICATION_UNIT_LOST`, `NOTIFICATION_DISTRICT_ATTACKED`,
  `NOTIFICATION_RIVER_FLOODS_SEV0/1/2`,
  `NOTIFICATION_STORM_ARRIVED`, `NOTIFICATION_STORM_MOVED`,
  `NOTIFICATION_STORM_DISSIPATED`, `NOTIFICATION_VOLCANO_ACTIVE`,
  `NOTIFICATION_VOLCANO_INACTIVE`, and `NOTIFICATION_VOLCANO_ERUPTS_SEV0/1/2`
  as expiring, non-auto-notify report notifications.
- Runtime can also emit `NOTIFICATION_LEGACY_COMPLETED` report notifications
  when another player completes a legacy/triumph reward. Review these for score
  context, compare with `game play progress-dashboard --compact --json` when
  useful, then close them as reviewed informational reports if `canUserDismiss`
  is true.
- `notification-handlers.js` does not register specialized handlers for these
  report families, so they use `DefaultHandler`.
- `DefaultHandler.activate` only looks at a valid plot when one exists. It does
  not send a player, city, or unit operation.
- `DefaultHandler.dismiss` calls `NotificationModel.manager.onDismiss`, and
  `NotificationModel.manager.dismiss` dispatches handler-specific dismissal
  before falling back to manager removal.
- The notification panel's close control calls `Game.Notifications.dismiss`
  when there is no different active end-turn-blocking notification.
- Official UI queue reconciliation is frame-driven. `DisplayQueueManager`
  registers its update loop on `engine.on("UpdateFrame", ...)`, and
  notification train updates are event/playback driven. A dismissal command
  should therefore send the official actor route once, then verify identity
  state across separate App UI reads so the UI frame/update loop can advance.
  Synchronous in-eval spin reads are not queue-settling proof.
- `NOTIFICATION_UNIT_LOST` can remain engine-queue front even when it is absent
  from the notification train. Notification-train absence alone is not
  dismissal proof; the closeout is only verified when the exact target
  disappears, is dismissed, or moves off the engine queue front.
- Expired front notifications can also be stale engine-queue blockers. When
  `Expired:true`, `CanUserDismiss:false`, and
  `Game.Notifications.getEndTurnBlockingType(localPlayer) == NONE`, the desktop
  panel close-control route may still call `Game.Notifications.dismiss`. The CLI
  may attempt that route once after a fresh reviewed read, but it is not
  successful unless the same identity-based postcondition clears.

## Norm

Use `game play dismiss-notification` only after confirming the notification is
informational or proven stale-expired, and any reported location has been
reviewed for tactical implications. For ordinary report closeouts,
`canUserDismiss` should be true; the narrow exception is an expired front
notification with blocker enum `NONE` where the official desktop panel
close-control path is the route under test:

```bash
civ7 game play dismiss-notification \
  --target '{"owner":0,"id":337,"type":20}' \
  --send \
  --json
```

Do not use this for advisor warnings, narrative choices, diplomacy responses,
city production, town focus, population placement, or unit commands. Those
families have specialized operation or UI surfaces, and dismissing them skips
the decision rather than making it.

Do not confuse grievance report closeout with `RESPOND_DIPLOMATIC_ACTION`.
Response blockers carry a diplomatic action id and response enum; grievance
reports carry only the notification id and summary text.

## Proof Boundary

This shortcut proves an App UI notification closeout, not a gameplay operation.
The useful proof is before/after notification identity and queue state, not the
immediate boolean returned by a closeout call. The CLI executes the official
notification-train manager closeout when available, records the visible panel
close-control route when that route is available for the item, then rereads the
notification state. Treat `verified:true` as proof that the notification
disappeared, was marked dismissed, left the engine queue or notification train,
or moved off a front position it occupied before send. `isEndTurnBlocking:
false` by itself is not dismissal proof.

For attack and disaster report families, dismissal is not a claim that the
tactical problem is solved. It only closes the report after the agent has used
the location/summary to decide whether any remaining unit, city, or repair
action is needed.
