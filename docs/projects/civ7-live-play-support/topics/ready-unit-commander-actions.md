# Ready Unit And Commander Actions

`COMMAND_UNITS` is not one decision. It can mean a normal combat unit needs a
target, a unit should hold, or a commander needs a command-panel decision. The
live-play support surface should first materialize the ready unit, then choose
the operation family.

## CLI Surface

Use the read-only ready-unit view before mutating a unit blocker:

```bash
bun packages/cli/bin/run.js game play ready-unit --json
```

For an explicit unit:

```bash
bun packages/cli/bin/run.js game play ready-unit \
  --unit-id '{"owner":0,"id":458752,"type":26}' \
  --radius 2 \
  --json
```

The view returns:

- selected unit and first ready unit ids
- resolved unit type/name/location/health/movement/combat summary
- valid no-target `unit-operation` and `unit-command` candidates
- promotion readiness from the unit `Experience` component when present
- occupied plots near the unit
- reminders to use `game play unit-target` for plot-target moves and attacks

It does not send operations.

For promotion-only checks, use:

```bash
bun packages/cli/bin/run.js game play promotion-readiness --json
```

That shortcut extracts the unit summary, `promotionReadiness`, and whether a
visible `PROMOTE` operation is present. It is read-only because the useful
question during live play is usually whether `PROMOTE` means "spend now" or
only "open the commander promotion UI."

## Commander Frame

An Army Commander is a support and coordination unit, not a direct attacker.
Official combat guidance describes commanders as packing nearby units for
movement, unpacking them onto adjacent tiles for attack/siege/defense, gaining
XP from nearby troops, and retaining experience/promotions across ages. The
same official guidance defines Army Commander promotion trees around defensive
support, assault tempo, logistics, maneuver, and leadership.

For Harriet Tubman, official leader guidance adds a defensive context: her
ability grants War Support when wars are declared against her and ignores
movement penalties from vegetated tiles. In a live defense near Washington, that
means the support agent should not panic-push the commander forward just because
an enemy is visible.

Primary online references:

- 2K/Firaxis combat dev diary:
  <https://civilization.2k.com/civ-vii/archive/dev-diary/combat/>
- 2K Harriet Tubman guide:
  <https://civilization.2k.com/civ-vii/game-guide/leaders/harriet-tubman/>

Local official-resource anchors:

- `UNIT_ARMY_COMMANDER` is a land support commander with land-commander
  promotion class:
  `.civ7/outputs/resources/Base/modules/base-standard/data/units.xml`
- Commander commands include pack/unpack/promote and focused/commander attack
  command families:
  `.civ7/outputs/resources/Base/modules/base-standard/data/unit-commands.xml`
- Generic unit operations include movement, standby, fortify, and reinforce
  families:
  `.civ7/outputs/resources/Base/modules/base-standard/data/unit-operations.xml`
- Commander promotions and move-after-unpacking ability live under:
  `.civ7/outputs/resources/Base/modules/base-standard/data/unit-promotions.xml`

## Live Norms

When the first ready unit is an Army Commander:

1. Run `game play ready-unit --json`.
2. Confirm `unit.value.typeName` is `UNIT_ARMY_COMMANDER`; ComponentID
   `type:26` alone only says it is a unit component.
3. Inspect legal `unit-command` candidates before falling back to
   `unit-operation SKIP_TURN`.
4. Treat visible `PROMOTE` as UI-open proof only. Spendable promotion requires
   `promotionReadiness.canPurchase == true` and at least one
   `availablePromotions[]` entry with validator-backed args.
5. Hold the commander on or near the capital/fortified district when that keeps
   defenders in command radius.
6. Move the commander only when the move preserves the main fight inside command
   radius or prevents the commander from being sniped.
7. Use `game play unit-target` for concrete plot attacks/moves by combat units,
   then verify postconditions.

Under capital pressure, the default commander bias is defensive anchoring:
deployed melee blockers and ranged units inside radius, commander preserved,
and no forward move unless it improves radius coverage or survival.

## Remaining Gaps

The ready-unit view deliberately stops before promotion or target-command
planning. It now reads promotion readiness, but it still does not choose or
send a promotion. Future support surfaces should add:

- packed units and army capacity
- available reinforcement candidates
- a guarded `game play promote-unit` wrapper that sends one explicit
  `UNITCOMMAND_PROMOTE` only after the chosen entry appears in
  `promotionReadiness.availablePromotions`
- legal plots for target-taking commander commands such as focused attacks,
  overrun, second wind, pack, and unpack

## Promotion Readiness Proof

Official UI evidence:

- `unit-action-handlers.js` maps `UNITCOMMAND_PROMOTE` to
  `INTERFACEMODE_UNIT_PROMOTION`. This opens the promotion view.
- `army-panel.js` intentionally marks `UNITCOMMAND_PROMOTE` successful for
  commander units so the promotion window can open even when no promotion can
  be bought.
- `model-unit-promotion.chunk.js` computes purchase readiness from
  `unit.Experience.getStoredPromotionPoints` and
  `unit.Experience.getStoredCommendations`; the panel's `canPurchase` is true
  only when one of those is positive.
- `panel-unit-promotion.js` makes a promotion selectable only when
  `unit.Experience.canPromote` and `unit.Experience.canEarnPromotion(...)`
  are true, then validates `Game.UnitCommands.canStart(unitId,
  UnitCommandTypes.PROMOTE, { PromotionType, PromotionDisciplineType }, false)`
  before sending.

Live proof on turn 104 showed Turtanu at `(17,22)` with:

```json
{
  "experiencePoints": 19,
  "experienceToNextLevel": 45,
  "getLevel": 2,
  "getStoredPromotionPoints": 0,
  "getStoredCommendations": 0,
  "getTotalPromotionsEarned": 2
}
```

That means `PROMOTE` can be visible as a commander UI-open command while there
is no spendable promotion. The correct action is to keep the commander useful
through positioning, alert, fortify, or skip until a fresh read shows available
promotion args.
