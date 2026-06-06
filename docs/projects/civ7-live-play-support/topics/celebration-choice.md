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

Read live celebration choices before choosing:

```bash
civ7 game play choose-celebration --options --json
```

The compact options output lists enabled `GoldenAgeType` hashes, names,
descriptions, durations, validation status, and ready validate/send templates.
Use `game play notifications --json` when raw option and validator evidence is
needed.

Validate a live celebration choice:

```bash
civ7 game play choose-celebration \
  --player-id 0 \
  --golden-age-type -340825966 \
  --json
```

Send only after re-reading the live choices and confirming the validated option:

```bash
civ7 game play choose-celebration \
  --player-id 0 \
  --golden-age-type -340825966 \
  --send \
  --json
```

The generic fallback is:

```bash
civ7 game play operation \
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

- Capture a live postcondition after send: blocker cleared, current celebration
  set, turns-left populated, and any policy-slot follow-up opened.
