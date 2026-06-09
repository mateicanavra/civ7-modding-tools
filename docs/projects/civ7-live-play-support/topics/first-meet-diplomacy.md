# First-Meet Diplomacy

## Frame

`NOTIFICATION_PLAYER_MET` is not an informational notification closeout. It
opens a first-meet greeting decision, and the closeout is a player operation:
`RESPOND_DIPLOMATIC_FIRST_MEET`.

Treat this family separately from ordinary diplomatic action responses. Ordinary
responses use `RESPOND_DIPLOMATIC_ACTION` with `{ ID, Type }`, where `ID` is a
diplomatic action id. First-meet greetings use
`RESPOND_DIPLOMATIC_FIRST_MEET` with `{ Player1, Player2, Type }`, where
`Player2` is the newly met leader/player and `Type` is a first-meet response
enum.

## Norm

Use this sequence:

1. Read `game play notifications --json`.
2. If the blocker is `NOTIFICATION_PLAYER_MET`, use the notification HUD's
   `details.kind == "first-meet-diplomacy"` payload when present. It should
   expose `player1`, `player2`, the other leader/civilization labels, candidate
   greeting `args`, validator results, and a neutral response descriptor.
   `game play notification-queue` and compact `game play priorities` promote
   that response descriptor as their next semantic action when it is present.
3. Prefer the neutral greeting when Influence cost or payoff is not proven.
   Static official data gives neutral `Amount="0"` and `InfCost="0"`; friendly
   and unfriendly cost Influence and intentionally move relationship state.
4. Validate with:

```bash
game play respond-first-meet \
  --player-id <local-player-id> \
  --met-player-id <other-player-id> \
  --response neutral \
  --json
```

5. Send only after validation:

```bash
game play respond-first-meet \
  --player-id <local-player-id> \
  --met-player-id <other-player-id> \
  --response neutral \
  --send \
  --json
```

The sent result includes the operation evidence, a before/after notification
read, `verified`, and a `postcondition`. Treat `verified:true` as the
command-level closeout proof. If the same matching `NOTIFICATION_PLAYER_MET`
remains end-turn-blocking, the command reports
`postcondition.classification: "first-meet-sticky-blocker"` with
`verified:false`; do not repeat the same greeting blindly.

Do not clear this with `game play dismiss-notification`. A first-meet notice can
look notification-shaped in the HUD, but the official panel sends a gameplay
operation.

## HUD Details

The materialized notification HUD now reads `notification.Player` for
`NOTIFICATION_PLAYER_MET`. When the runtime exposes it, `details.player2` is the
exact `--met-player-id` for `game play respond-first-meet`.

Live turn 80 proof for Napoleon:

```json
{
  "player1": 0,
  "player2": 1,
  "recommendedResponse": "neutral"
}
```

The same read validated all three first-meet response args and confirmed the
neutral response type as `673478009` for the current runtime. Use the named
`--response neutral` form unless a fresh HUD read already produced a numeric
`Type`.

## Evidence

- Live play turn 62 with Genghis Khan closed via
  `RESPOND_DIPLOMATIC_FIRST_MEET` using
  `{ Player1: 0, Player2: 2, Type: 673478009 }`.
- Live play turn 80 with Napoleon exposed `notification.Player == 1`; the HUD
  built and validated neutral args
  `{ Player1: 0, Player2: 1, Type: 673478009 }` without sending.
- Official `panel-diplomacy-project-reaction.js` sends
  `Game.PlayerOperations.sendRequest(GameContext.localPlayerID,
  PlayerOperationTypes.RESPOND_DIPLOMATIC_FIRST_MEET, args)` from the greeting
  response button. The same panel builds `{ Player1, Player2, Type }` from
  `GameContext.localPlayerID`, `DiplomacyManager.currentDiplomacyDialogData`,
  and `DiplomacyPlayerFirstMeets`.
- Official `diplomacy-actions.xml` defines first-meet response types separately
  from normal diplomacy responses:
  `PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY`,
  `PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL`, and
  `PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY`. It also records neutral as
  zero-cost/zero-delta, while friendly/unfriendly cost Influence and shift the
  relationship by `20` or `-20`.
- Official `notification.xml` defines `NOTIFICATION_PLAYER_MET` as very-high
  severity, non-expiring, and non-auto-notify.
- The notification train evidence is a trap if read alone:
  `NOTIFICATION_PLAYER_MET` is not registered to a specialized notification
  handler, so default-handler analysis can make it look dismissible. The
  diplomacy manager and diplomacy hub then route the `"MEET"` sequence into the
  first-meet reaction panel, where the player operation is sent.
- Official tutorial text describes first meet as a choice among Friendly,
  Neutral, and Hostile greetings before starting diplomatic relations.
- The official Civ7 diplomacy diary frames Influence as the primary diplomacy
  currency and notes that relationships can be Helpful, Friendly, Neutral,
  Unfriendly, or Hostile:
  <https://civilization.2k.com/civ-vii/archive/dev-diary/diplomacy-influence-trade/>.

## Open Edges

The response enum and met player id should still come from live runtime
evidence. The CLI `--response` flag resolves `friendly`, `neutral`, or
`unfriendly` through the live App UI enum before validation. Use
`--response-type` only when a fresh runtime read already produced the numeric
enum. Do not hard-code `673478009` except as evidence for the observed turn-62
and turn-80 encounters.
