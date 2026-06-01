# Celebration Choice

Status: `official-ui-backed`.

## Frame

`NOTIFICATION_CHOOSE_GOLDEN_AGE` is a celebration choice blocker. It is not an
informational notification and should not be dismissed. The official handler
opens the celebration chooser panel, then the panel sends a player operation
after the user selects one of the live choices.

Use this topic when the HUD reports `Choose Celebration` or
`NOTIFICATION_CHOOSE_GOLDEN_AGE`.

## Official Operation

The notification handler registers `NOTIFICATION_CHOOSE_GOLDEN_AGE` with
`ChooseCelebration`, whose activation pushes `panel-celebration-chooser`.

The chooser reads:

```js
Players.get(GameContext.localPlayerID).Culture.getGoldenAgeChoices()
```

For each returned `GoldenAgeType`, it reads `GameInfo.GoldenAges.lookup(...)`
for name/description display. On confirm it sends:

```js
Game.PlayerOperations.sendRequest(
  GameContext.localPlayerID,
  PlayerOperationTypes.CHOOSE_GOLDEN_AGE,
  { GoldenAgeType: Database.makeHash(goldenAgeType) },
);
```

The operation family is therefore `player-operation`, the operation type is
`CHOOSE_GOLDEN_AGE`, and the args shape is `{ GoldenAgeType }`.

## CLI Surface

Validate a live celebration choice:

```bash
bun packages/cli/bin/run.js game play choose-celebration \
  --player-id 0 \
  --golden-age-type -340825966 \
  --json
```

Send only after re-reading the live choices and choosing a reason:

```bash
bun packages/cli/bin/run.js game play choose-celebration \
  --player-id 0 \
  --golden-age-type -340825966 \
  --send \
  --reason "choose live validated culture celebration" \
  --json
```

The generic fallback is:

```bash
bun packages/cli/bin/run.js game play operation \
  --family player \
  --type CHOOSE_GOLDEN_AGE \
  --player-id 0 \
  --args '{"GoldenAgeType":-340825966}' \
  --json
```

## Live Turn-98 Evidence

On turn 98 / 1660 BCE, the active game exposed two Classical Republic
celebration choices for 10 turns:

- `GOLDEN_AGE_CLASSICAL_REPUBLIC_1`, hash `-340825966`: `+20% Culture`.
- `GOLDEN_AGE_CLASSICAL_REPUBLIC_2`, hash `1923496232`: `+15% Production`
  toward constructing Wonders.

Both validated through `player-operation CHOOSE_GOLDEN_AGE`.

Given the active strategy posture at the time, the culture option was the
better default recommendation because the agent was building Settlers and
Ballistas while contesting land. Wonder production is narrower and should be
chosen only when a near-term wonder plan is already live.

## Norms

- Read the live choices before choosing; do not hard-code the turn-98 hashes for
  future governments or ages.
- Prefer broad culture/economy/military value over narrow wonder production
  unless the short-horizon plan already includes that wonder.
- Treat the choice as strategic context, not a tactical action. Rehydrate after
  sending, because the next blocker may be narrative, unit command, or another
  policy-related closeout.
- Do not use notification dismissal for this blocker. It opens a chooser and
  requires `CHOOSE_GOLDEN_AGE`.

## Remaining Gaps

- Add a read-only `game play celebration-options` surface that lists current
  choices with localized descriptions and hashes.
- Add HUD classification so `NOTIFICATION_CHOOSE_GOLDEN_AGE` points directly to
  `game play choose-celebration`.
- Capture a live postcondition after send: blocker cleared, current celebration
  set, turns-left populated, and any policy-slot follow-up opened.
