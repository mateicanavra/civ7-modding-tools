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

Official handler evidence:

- `notification.xml` defines `NOTIFICATION_UNIT_ATTACKED`,
  `NOTIFICATION_DISTRICT_ATTACKED`, `NOTIFICATION_RIVER_FLOODS_SEV0/1/2`,
  `NOTIFICATION_VOLCANO_ACTIVE`, `NOTIFICATION_VOLCANO_INACTIVE`, and
  `NOTIFICATION_VOLCANO_ERUPTS_SEV0/1/2` as expiring, non-auto-notify report
  notifications.
- `notification-handlers.js` does not register specialized handlers for these
  report families, so they use `DefaultHandler`.
- `DefaultHandler.activate` only looks at a valid plot when one exists. It does
  not send a player, city, or unit operation.
- The notification panel's close control calls `Game.Notifications.dismiss`
  when there is no different active end-turn-blocking notification.

## Norm

Use `game play dismiss-notification` only after confirming the notification is
informational, `canUserDismiss` is true, and any reported location has been
reviewed for tactical implications:

```bash
bun packages/cli/bin/run.js game play dismiss-notification \
  --target '{"owner":0,"id":337,"type":20}' \
  --send \
  --reason "reviewed unit-attacked notice after resolving unit readiness" \
  --json
```

Do not use this for advisor warnings, narrative choices, diplomacy responses,
city production, town focus, population placement, or unit commands. Those
families have specialized operation or UI surfaces, and dismissing them skips
the decision rather than making it.

## Proof Boundary

This shortcut proves an App UI notification closeout, not a gameplay operation.
The useful proof is before/after notification state: the notification existed,
was user-dismissible, was dismissed, and no longer remained the end-turn
blocking notification.

For attack and disaster report families, dismissal is not a claim that the
tactical problem is solved. It only closes the report after the agent has used
the location/summary to decide whether any remaining unit, city, or repair
action is needed.
